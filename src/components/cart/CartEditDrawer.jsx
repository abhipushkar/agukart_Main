// components/Cart/CartEditDrawer.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Divider,
    Button,
    Card,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
import parse from "html-react-parser";

// Drawer‑specific hooks (simplified)
import { useDrawerProductVariants } from "./hooks/useDrawerProductVariants";
import { useDrawerProductCustomization } from "./hooks/useDrawerProductCustomization";
import useCart from "hooks/useCart";
import useAuth from "hooks/useAuth";
import { useCurrency } from "contexts/CurrencyContext";
import { useToasts } from "react-toast-notifications";

// Drawer components (already provided)
import DrawerImageGallery from "./DrawerImageGallery";
import DrawerProductPricing from "./DrawerProductPricing";
import DrawerVariantSelector from "./DrawerVariantSelector";
import DrawerCustomization from "./DrawerCustomization";
import DrawerQuantitySelector from "./DrawerQuantitySelector";

// Services
import { postAPIAuth, getAPIAuth } from "utils/__api__/ApiServies";
import { calculatePriceAfterDiscount } from "utils/calculatePriceAfterDiscount";

const CartEditDrawer = ({ open, onClose, cartProduct, wallet, address, voucher }) => {
    const { addToast } = useToasts();
    const { token } = useAuth();
    const { state, dispatch, getCartDetails, getCartItems } = useCart();
    const { currency } = useCurrency();

    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState(null);
    const [media, setMedia] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [hoveredImage, setHoveredImage] = useState(null);

    // Callback to handle product changes from parent variant selection
    const handleProductChange = useCallback((newProduct) => {
        // console.log("Product changed to:", newProduct._id);

        // Only update if the product ID is different
        if (productData?._id === newProduct._id) {
            // console.log("Same product, skipping update");
            return;
        }

        // Update product data
        setProductData(newProduct);

        // Rebuild media array
        const productMedia = [];
        if (newProduct.image && Array.isArray(newProduct.image)) {
            newProduct.image.forEach((img) => {
                const imageUrl = newProduct.image_url
                    ? `${newProduct.image_url}${img}`
                    : `/uploads/product/${img}`;
                productMedia.push({ type: "image", url: imageUrl });
            });
        }
        if (newProduct.videos && Array.isArray(newProduct.videos)) {
            newProduct.videos.forEach((video) => {
                const videoUrl = newProduct.video_url
                    ? `${newProduct.video_url}${video}`
                    : `/uploads/product/${video}`;
                productMedia.push({ type: "video", url: videoUrl });
            });
        }
        setMedia(productMedia);
        setSelectedImage(0);
    }, [productData?._id]);


    useEffect(() => {
        if (!open || !cartProduct?.product_id) return;
        fetchProduct();
    }, [open, cartProduct]);


    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BASE_URL}/get-productById?productId=${cartProduct.product_id}`
            );
            if (res?.data?.data) {
                const product = res.data.data;
                if (product.customizationData && !product.availableCustomization) {
                    product.availableCustomization = product.customizationData;
                }
                const productMedia = [];
                if (product.image && Array.isArray(product.image)) {
                    product.image.forEach((img) => {
                        const imageUrl = product.image_url
                            ? `${product.image_url}${img}`
                            : `/uploads/product/${img}`;
                        productMedia.push({ type: "image", url: imageUrl });
                    });
                }
                if (product.videos && Array.isArray(product.videos)) {
                    product.videos.forEach((video) => {
                        const videoUrl = product.video_url
                            ? `${product.video_url}${video}`
                            : `/uploads/product/${video}`;
                        productMedia.push({ type: "video", url: videoUrl });
                    });
                }
                setMedia(productMedia);
                setProductData(product);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to load product details", { appearance: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleHoverImage = useCallback((img) => setHoveredImage(img), []);
    const handleHoverOut = useCallback(() => setHoveredImage(null), []);

    if (!open) return null;

    return (
        <>
            <IconButton
                onClick={onClose}
                sx={{
                    position: "fixed",
                    top: 16,
                    right: { xs: 16, sm: 516 },
                    zIndex: 1300,
                    bgcolor: "white",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "#f0f0f0" },
                }}
            >
                <CloseIcon />
            </IconButton>

            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                PaperProps={{
                    sx: {
                        width: { xs: "90vw", sm: 500 },
                        border: "none",
                    },
                }}
            >
                <Box sx={{ height: "100%", bgcolor: "#fff" }}>
                    <Box sx={{ px: 2 }}>
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                                <CircularProgress />
                            </Box>
                        ) : productData ? (
                            <CartEditContent
                                key={productData?._id}
                                product={productData}
                                media={media}
                                selectedImage={selectedImage}
                                setSelectedImage={setSelectedImage}
                                cartItem={cartProduct}
                                onClose={onClose}
                                token={token}
                                dispatch={dispatch}
                                getCartDetails={getCartDetails}
                                getCartItems={getCartItems}
                                addToast={addToast}
                                currency={currency}
                                onHoverImage={handleHoverImage}
                                onHoverOut={handleHoverOut}
                                hoveredImage={hoveredImage}
                                onProductChange={handleProductChange}
                                wallet={wallet}
                                voucher={voucher}
                                address={address}
                            />
                        ) : (
                            <Typography>Product not found</Typography>
                        )}
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

// ----------------------------------------------------------------------
// Main content using drawer‑specific hooks
// ----------------------------------------------------------------------
const CartEditContent = ({
    product,
    media,
    selectedImage,
    setSelectedImage,
    cartItem,
    onClose,
    token,
    dispatch,
    addToast,
    currency,
    onHoverImage,
    onHoverOut,
    hoveredImage,
    onProductChange,
    wallet,
    voucher,
    address,
    getCartDetails,
    getCartItems
}) => {
    // Drawer‑simplified variant hook
    const {
        selectedVariants,
        filterVariantAttributes,
        errors,
        hoveredVariantImage,
        isAttributeCombinationSoldOut,
        currentCombinationData,
        selectedVariantImages,
        calculateAttributeData,
        handleVariantChange,
        handleParentVariantNavigation,
        handleVariantHover,
        handleVariantHoverOut,
        validateVariants,
        normalizeVariantData,
        areAllInternalVariantsSelected,
        prefillFromCart
    } = useDrawerProductVariants(product);

    // Customization hook (unchanged)
    const {
        selectedDropdowns,
        customizationText,
        validationErrors,
        customizeDropdownPrice,
        customizeTextPrice,
        handleDropdownChange,
        handleTextChange,
        validateCustomization,
        checkInputMinValue,
        isExpanded,
        setIsExpanded,
    } = useDrawerProductCustomization(product);

    const [quantity, setQuantity] = useState(cartItem?.qty || 1);
    const [price, setPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [bestPromotion, setBestPromotion] = useState({});
    const [plusToggle, setPlusToggle] = useState(false);
    const [saving, setSaving] = useState(false);
    const prefillDoneRef = useRef(false);

    // Calculate stock based on combination data
    const calculateStock = useCallback(() => {
        if (!product.isCombination && !product.form_values?.isCheckedQuantity) return Number(product.qty || 0);

        // Check if quantity is controlled by combinations
        const isQuantityControlled = product.form_values?.isCheckedQuantity === true;

        // If quantity is NOT controlled by combinations, use product.qty
        if (!isQuantityControlled) {
            return Number(product.qty || 0);
        }
        // Quantity IS controlled by combinations
        if (currentCombinationData?.quantity !== undefined && currentCombinationData?.quantity !== null) {
            return currentCombinationData.quantity;
        }
        return Number(product.qty || 0);
    }, [product?.isCombination, product?.qty, product?.form_values?.isCheckedQuantity, currentCombinationData?.quantity]);

    // Price calculation – FIX: ensure base price is set correctly
    // Price calculation
    useEffect(() => {
        if (!product) return;

        // Check if price is controlled by combinations
        const isPriceControlled = product.form_values?.isCheckedPrice === true;

        let basePrice = 0;

        if (isPriceControlled && product.isCombination) {
            // Price IS controlled by combinations
            if (currentCombinationData?.price !== null && currentCombinationData?.price !== undefined) {
                basePrice = currentCombinationData.price;
            } else {
                basePrice = product.sale_price || product.price || 0;
            }
        } else {
            // Price is NOT controlled by combinations - use product's own price
            basePrice = product.sale_price || product.price || 0;
        }

        let finalPrice = basePrice + customizeDropdownPrice + customizeTextPrice;

        // Apply promotion if applicable
        if (bestPromotion && bestPromotion.qty <= quantity) {
            finalPrice = calculatePriceAfterDiscount(
                bestPromotion.offer_type,
                +bestPromotion.discount_amount,
                finalPrice
            );
        }

        setPrice(finalPrice);
        setOriginalPrice(basePrice + customizeDropdownPrice + customizeTextPrice);
        setPlusToggle(product.isCombination && !areAllInternalVariantsSelected());
    }, [
        product?.sale_price,
        product?.price,
        product?.isCombination,
        product?.form_values?.isCheckedPrice,
        currentCombinationData?.price,
        customizeDropdownPrice,
        customizeTextPrice,
        quantity,
        bestPromotion,
        areAllInternalVariantsSelected,
    ]);

    useEffect(() => {
        setStock(calculateStock());
    }, [calculateStock]);

    // reset quantity to 1 if selectedVariants changes
    useEffect(() => {
        setQuantity(1);
    }, [selectedVariants]);


    // Combine all variants (parent + internal) for rendering
    const allVariants = normalizeVariantData();

    // Promotion calculation
    useEffect(() => {
        if (product?.promotionData && originalPrice) {
            const applicable = product.promotionData.filter(p => p.qty && p.qty <= quantity);
            if (applicable.length) {
                const best = applicable.reduce((prev, curr) => {
                    const prevDisc = calculatePriceAfterDiscount(prev.offer_type, +prev.discount_amount, originalPrice);
                    const currDisc = calculatePriceAfterDiscount(curr.offer_type, +curr.discount_amount, originalPrice);
                    return prevDisc < currDisc ? prev : curr;
                });
                setBestPromotion(best);
            } else {
                setBestPromotion({});
            }
        }
    }, [product, quantity, originalPrice]);

    // Prefill variants and customizations from cart item (only once)
    useEffect(() => {
        if (!product || !cartItem || prefillDoneRef.current) return;

        // Internal variants
        if (cartItem.variants && Array.isArray(cartItem.variants)) {
            cartItem.variants.forEach(({ variantName, attributeName }) => {
                const variant = product.product_variants?.find(v => v.variant_name === variantName);
                const attr = variant?.variant_attributes?.find(a => a.attribute === attributeName);
                if (attr?._id) handleVariantChange(variantName, attr._id);
            });
        }

        // Customizations
        if (cartItem.customizationData && cartItem.customizationData.length >= 2) {
            const [dropdowns, texts] = cartItem.customizationData;
            if (dropdowns && typeof dropdowns === "object") {
                Object.entries(dropdowns).forEach(([key, val]) => {
                    const optValue = val?.value || val;
                    handleDropdownChange(key, optValue);
                });
            }
            if (texts && typeof texts === "object") {
                Object.entries(texts).forEach(([key, val]) => {
                    const text = val?.value || val;
                    if (text) handleTextChange(key, 0, 0, 100, text);
                });
            }
        }

        prefillDoneRef.current = true;
    }, [product, cartItem, handleVariantChange, handleDropdownChange, handleTextChange]);

    const combinedMedia = useMemo(() => {
        const variantImgs = selectedVariantImages.map(img => ({ type: "variant", url: img.imageUrl }));
        const productImgs = media.filter(m => m.type === "image");
        const videos = media.filter(m => m.type === "video");
        return [...variantImgs, ...productImgs, ...videos];
    }, [selectedVariantImages, media]);

    // Reset prefill flag when drawer opens with new product/cartItem
    useEffect(() => {
        if (product && cartItem) {
            // Only reset if the product ID matches (meaning we're back to the original product)
            // Don't reset when product changes due to parent variant selection
            if (product._id === cartItem.product_id) {
                // console.log("Resetting prefillDoneRef for matching product/cartItem");
                prefillDoneRef.current = false;
            } else {
                // console.log("Product ID mismatch, not resetting prefillDoneRef");
            }
        }
    }, [product, cartItem]);

    // Prefill variants and customizations from cart item (only once)

    // SINGLE PREFILL USEFFECT - REPLACE both existing ones with this
    // Prefill variants and customizations from cart item (only once)
    useEffect(() => {
        if (!product || !cartItem) {
            // console.log("No product or cartItem, skipping prefill");
            return;
        }

        if (prefillDoneRef.current) {
            // console.log("Prefill already done, skipping");
            return;
        }

        // CRITICAL: Only prefill if the product ID matches the cart item's product ID
        // When parent variant changes, the new product will have a different ID
        // We should NOT prefill for the new product because it has different variants
        if (product._id !== cartItem.product_id) {
            // console.log("Product ID mismatch - skipping prefill for this product");
            // console.log(`  product._id: ${product._id}`);
            // console.log(`  cartItem.product_id: ${cartItem.product_id}`);
            return;
        }

        // console.log("Starting prefill...");

        // Small delay to ensure all data is ready
        const timer = setTimeout(() => {
            // Prefill variants using the hook's method
            // console.log("Calling prefillFromCart with cartItem");
            prefillFromCart(cartItem);

            // Prefill customizations
            // console.log("\nPrefilling customizations...");
            // console.log("cartItem.customizationData:", cartItem.customizationData);

            if (cartItem.selectedCustomization && cartItem.selectedCustomization.length >= 1) {
                const dropdowns = cartItem.selectedCustomization[0];
                const texts = cartItem.selectedCustomization?.[1] || {};

                // console.log("Dropdowns from cart:", dropdowns);
                // console.log("Texts from cart:", texts);

                // Prefill dropdown customizations
                if (dropdowns && typeof dropdowns === "object") {
                    // console.log("Processing dropdown customizations...");
                    Object.entries(dropdowns).forEach(([key, value]) => {
                        // console.log(`  Dropdown ${key}:`, value);
                        const optionValue = typeof value === 'object' ? value.value : value;
                        // console.log(`    Extracted value: ${optionValue}`);

                        if (optionValue) {
                            const customField = product.customizationData?.customizations?.find(c => c.label === key);
                            // console.log(`    Found custom field:`, customField ? "YES" : "NO");

                            const option = customField?.optionList?.find(opt => opt.optionName === optionValue);
                            // console.log(`    Found option:`, option ? "YES" : "NO");

                            if (option) {
                                // console.log(`    Calling handleDropdownChange with option:`, option);
                                handleDropdownChange(key, option);
                            } else {
                                // console.log(`    Calling handleDropdownChange with value: ${optionValue}`);
                                handleDropdownChange(key, optionValue);
                            }
                        }
                    });
                }

                // Prefill text customizations
                if (texts && typeof texts === "object") {
                    // console.log("Processing text customizations...");
                    Object.entries(texts).forEach(([key, value]) => {
                        // console.log(`  Text ${key}:`, value);
                        const textValue = typeof value === 'object' ? value.value : value;
                        const price = typeof value === 'object' ? value.price : 0;
                        const min = typeof value === 'object' ? value.min : 1;
                        const max = typeof value === 'object' ? value.max : 100;
                        // console.log(`    Calling handleTextChange with: ${textValue}, price: ${price}, min: ${min}, max: ${max}`);

                        if (textValue) {
                            handleTextChange(key, price, min, max, textValue);
                        }
                    });
                }
            } else {
                // console.log("No customization data found in cartItem");
            }

            prefillDoneRef.current = true;
            // console.log("Prefill completed, prefillDoneRef set to true");
            // console.log("==========================================\n");
        }, 100);

        return () => clearTimeout(timer);
    }, [product, cartItem]); // Note: prefillFromCart not in dependencies to prevent re-runs // Note: prefillFromCart, handleDropdownChange, handleTextChange NOT in dependencies


    // Wrapper for variant change to handle parent variant navigation
    const handleVariantChangeWithNavigation = useCallback(async (variantId, value) => {
        // First, check if this is a parent variant change
        const allVariants = normalizeVariantData();
        const variant = allVariants.find(v => v.id === variantId);
        // console.log(`in parent variant change: ${variantId}, value: ${value}`, { found: variant });
        if (variant?.type === "parent" && value) {
            // Call the original change to update local state temporarily
            handleVariantChange(variantId, value);

            // Check if we need to navigate to a different product
            const navigationTarget = handleParentVariantNavigation(variantId, value);

            if (navigationTarget) {
                // Fetch the new product
                try {
                    setSaving(false); // Reset any saving state
                    const res = await axios.get(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/get-productById?productId=${navigationTarget.product_code}`
                    );
                    if (res?.data?.data) {
                        const newProduct = res.data.data;

                        // Update product data
                        // You'll need to pass a setProductData function from parent
                        // For now, we'll call a prop callback
                        if (onProductChange) {
                            onProductChange(newProduct);
                        }

                        // Reset prefill flag for the new product
                        prefillDoneRef.current = false;

                        addToast("Product variant updated", { appearance: "success", autoDismiss: true });
                    }
                } catch (error) {
                    console.error("Failed to fetch variant product:", error);
                    addToast("Failed to load variant", { appearance: "error" });
                }
            }
        } else {
            // Just handle regular variant change
            handleVariantChange(variantId, value);
        }
    }, [handleVariantChange, handleParentVariantNavigation, normalizeVariantData, addToast]);

    const handleSave = async () => {
        if (!validateVariants()) {
            addToast("Please select all required options", { appearance: "error" });
            return;
        }
        const hasCustomizations = product?.availableCustomization?.customizations?.length > 0;
        if (hasCustomizations) {
            const validationResult = validateCustomization();
            if (!validationResult) {
                setIsExpanded(true);
                return;
            }
            if (checkInputMinValue()) return;
        }
        if (stock <= 0) {
            addToast("This product is out of stock", { appearance: "error" });
            return;
        }

        setSaving(true);

        const payload = {
            product_id: product._id,
            vendor_id: product.vendor_id?._id,
            qty: quantity,
            price: price,
            original_price: originalPrice,
            isCombination: product.isCombination,
            variant_id: [],
            variant_attribute_id: [],
            variants: [],
            customize: product.customize,
            customizationData: [],
            shipping_id: cartItem.shipping_id,
        };

        // Handle parent variants (from normalizeVariantData)
        const allVariants = normalizeVariantData();
        const parentVariants = allVariants.filter(v => v.type === "parent");

        if (parentVariants.length > 0 && Object.keys(selectedVariants).length) {
            Object.entries(selectedVariants).forEach(([variantId, attrId]) => {
                const variant = parentVariants.find(v => v.id === variantId);
                if (variant) {
                    // Find the parent variant ID from product.parent_id
                    let parentVariantId = null;
                    if (product.parent_id?.product_variants) {
                        const pv = product.parent_id.product_variants.find(v => v.variant_name === variantId);
                        parentVariantId = pv?._id;
                    } else if (product.parent_id?.variant_id) {
                        const pv = product.parent_id.variant_id.find(v => v.variant_name === variantId || v._id === variantId);
                        parentVariantId = pv?._id;
                    }

                    if (parentVariantId) {
                        payload.variant_id.push(parentVariantId);
                        payload.variant_attribute_id.push(attrId);
                    }
                }
            });
        }

        // Handle internal variants (from product_variants)
        if (product.isCombination && product.product_variants) {
            const internalVariants = [];
            Object.entries(selectedVariants).forEach(([variantName, attrId]) => {
                const isInternal = product.product_variants.some(pv => pv.variant_name === variantName);
                if (isInternal) {
                    let attribute = product.variant_attribute_id?.find(attr => attr._id === attrId);
                    if (!attribute) {
                        attribute = { attribute_value: attrId, variant: variantName, isCustom: true };
                    }
                    let variantObj = null;
                    if (!attribute.isCustom) {
                        variantObj = product.variant_id?.find(v => v._id === attribute.variant);
                    }
                    if (!variantObj) variantObj = { variant_name: variantName };
                    internalVariants.push({
                        variantName: variantObj.variant_name,
                        attributeName: attribute.attribute_value,
                    });
                }
            });
            payload.variants = internalVariants;
        }

        // Handle customizations - EXACT structure as shown in your example
        if (product.customize === "Yes") {
            const dropdownsArray = {};
            const textsArray = {};

            // Build dropdown customizations
            Object.entries(selectedDropdowns).forEach(([label, selection]) => {
                if (selection && selection.value) {
                    dropdownsArray[label] = {
                        value: selection.value,
                        price: selection.price || "0",
                        thumbnail: selection.thumbnail || "",
                        preview_image: selection.preview_image || "",
                        main_images: selection.main_images || [],
                        option: selection.option || {
                            optionName: selection.value,
                            priceDifference: selection.price || "0",
                            isVisible: "true",
                            preview_image: "",
                            thumbnail: "",
                            edit_main_image: "",
                            edit_preview_image: "",
                            main_images: []
                        }
                    };
                }
            });

            // Build text customizations
            Object.entries(customizationText).forEach(([label, textData]) => {
                if (textData && textData.value) {
                    textsArray[label] = {
                        value: textData.value,
                        price: textData.price || 0,
                        min: textData.min || 1,
                        max: textData.max || 20
                    };
                }
            });

            payload.customizationData = [dropdownsArray, textsArray];
        }

        // Guest cart
        if (!token) {
            const updatedCart = { ...state.cart };
            const idx = updatedCart.products?.findIndex(item => item.product_id === cartItem.product_id);
            if (idx !== -1) updatedCart.products.splice(idx, 1);

            const guestPayload = {
                vendor_id: product.vendor_id?._id,
                vendor_name: product.vendor_id?.name,
                shop_icon: product.vendor_details?.vendor_shop_icon_url + product.vendor_details?.shop_icon,
                shop_name: product.vendor_details?.shop_name,
                slug: product.vendor_details?.slug,
                products: [{
                    product_id: product._id,
                    qty: quantity,
                    stock: product.qty,
                    product_name: product.product_title,
                    sale_price: price,
                    original_price: originalPrice,
                    promotionalOfferData: product.promotionData,
                    firstImage: product.image_url + (product.image?.[0] || ""),
                    status: product.status,
                    isDeleted: product.isDeleted,
                    isCombination: product.isCombination,
                    combinationData: product.combinationData,
                    variantData: payload.variant_id.length ? product.parent_id?.variant_id?.filter(v => payload.variant_id.includes(v._id)) || [] : [],
                    variantAttributeData: payload.variant_attribute_id.length ? product.parent_id?.variant_attribute_id?.filter(attr => payload.variant_attribute_id.includes(attr._id)) || [] : [],
                    variant_attribute_id: payload.variant_attribute_id,
                    variants: payload.variants,
                    customize: product.customize,
                    customizationData: payload.customizationData,
                }],
            };
            dispatch({ type: "CHANGE_CART_AMOUNT", payload: guestPayload });
            addToast("Cart updated", { appearance: "success" });
            setSaving(false);
            onClose();
            return;
        }

        // Authenticated user
        try {
            await postAPIAuth("user/delete-cart", { cart_id: cartItem.cart_id });
            const res = await postAPIAuth("user/add-to-cart", payload);
            if (res.status === 200) {
                await getCartItems(address?._id);
                const data = wallet ? "1" : "0";
                await getCartDetails(data, address?._id, voucher?.discount);
                onClose()
            }
        } catch (error) {
            console.error(error);
            addToast("Failed to update cart", { appearance: "error" });
        } finally {
            setSaving(false);
        }
    };


    // Debug: Monitor selectedVariants changes
    useEffect(() => {
        // console.log("selectedVariants CHANGED:", selectedVariants);
    }, [selectedVariants]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", maxHeight: "100%", justifyContent: "space-between" }}>
            <Box>
                <DrawerImageGallery
                    media={combinedMedia}
                    selectedImage={selectedImage}
                    onImageSelect={setSelectedImage}
                    hoveredImage={hoveredImage}
                />
            </Box>
            <Box sx={{ overflowY: "auto", maxHeight: "calc(100vh - 400px)", px: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "16px", mb: 1 }}>
                    {product.product_title.replace(/<[^>]*>/g, "")}
                </Typography>

                <DrawerProductPricing
                    price={price}
                    originalPrice={originalPrice}
                    currency={currency}
                    isCombination={product.isCombination}
                    plusToggle={plusToggle}
                    bestPromotion={bestPromotion}
                    quantity={quantity}
                />

                {stock > 0 && stock <= 10 && (
                    <Typography variant="caption" sx={{ color: "#d32f2f", display: "block", mb: 1 }}>
                        Only {stock} left!
                    </Typography>
                )}

                {/* Render all variants (parent + internal) using normalizeVariantData */}
                {allVariants.filter(v => v.id && typeof v.id === 'string' && v.id !== 'undefined').map(variant => (
                    <DrawerVariantSelector
                        key={`${variant.id}-${product._id}`}
                        variant={variant}
                        selectedValue={selectedVariants[variant.id]}
                        selectedVariants={selectedVariants}
                        onChange={handleVariantChangeWithNavigation}
                        onHover={(attrId) => {
                            handleVariantHover(attrId);
                            // Update gallery hover image
                            const attr = variant.attributes.find(a => a.id === attrId);
                            if (attr?.images?.[0]) onHoverImage({ url: attr.images[0], source: "variant" });
                        }}
                        onHoverOut={() => {
                            handleVariantHoverOut();
                            onHoverOut();
                        }}
                        error={errors[variant.id]}
                        currency={currency}
                        filterVariantAttributes={filterVariantAttributes}
                        isAttributeCombinationSoldOut={isAttributeCombinationSoldOut}
                        calculateAttributeData={calculateAttributeData}
                        productMainImage={product.image}
                        form_values={product.form_values}
                    />
                ))}

                {product.customize === "Yes" && (
                    <DrawerCustomization
                        customizationData={product.customizationData}
                        selectedDropdowns={selectedDropdowns}
                        customizationText={customizationText}
                        onDropdownChange={handleDropdownChange}
                        onTextChange={handleTextChange}
                        validationErrors={validationErrors}
                        currency={currency}
                        onOptionHover={(opt) => {
                            if (opt.main_images?.length) onHoverImage({ url: opt.main_images[0], source: "customization" });
                        }}
                        onOptionHoverOut={onHoverOut}
                        isExpanded={isExpanded}
                        setIsExpanded={setIsExpanded}
                        productMainImage={product.image}
                    />
                )}

                <DrawerQuantitySelector
                    quantity={quantity}
                    stock={stock}
                    onQuantityChange={setQuantity}
                    disabled={product.isCombination && !areAllInternalVariantsSelected()}
                    showVariantWarning={product.isCombination && !areAllInternalVariantsSelected()}
                    isCombination={product.isCombination}
                    variantSelected={areAllInternalVariantsSelected()}
                />

                <Box sx={{ display: "flex", gap: 2 , mb: 2}}>
                    <Button
                        fullWidth
                        onClick={handleSave}
                        disabled={saving || stock === 0}
                        sx={{
                            bgcolor: "#000",
                            color: "#fff",
                            borderRadius: "24px",
                            textTransform: "none",
                            "&:hover": {
                                bgcolor: "#111",
                            },
                        }}
                    >
                        {saving ? "Updating..." : "Save Changes"}
                    </Button>
                    <Button variant="outlined" fullWidth onClick={onClose} sx={{ textTransform: "none", borderRadius: "24px", }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CartEditDrawer;