import Box from "@mui/material/Box";
import { Typography, Button, Avatar } from '@mui/material';
import { H4 } from "components/Typography";
import Link from "next/link";
import NextLink from "next/link";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import parse from "html-react-parser";
import { useState, useEffect, useMemo } from 'react';
import useAuth from "hooks/useAuth";
import { useCurrency } from 'contexts/CurrencyContext';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useRouter } from 'next/navigation';
import { Small } from "components/Typography";
import useCart from 'hooks/useCart';
import { postAPIAuth } from 'utils/__api__/ApiServies';
import { calculatePriceAfterDiscount } from 'utils/calculatePriceAfterDiscount';
import { useToasts } from 'react-toast-notifications';
import { resolveMatchingCombination } from "../utils/resolveMatchingCombination";
import { resolveCartItemState } from "../utils/resolveCartItemState";
import { validateCartItem } from "../utils/validateCartItem";
import { buildCartItemIdentity } from "../utils/buildCartItemIdentity";
import { resolveCartPricing } from "../utils/resolveCartPricing";
import CartEditDrawer from "components/cart/CartEditDrawer";

const Product = ({ cart, product, wallet, defaultAddress, voucherDetails, showButtons = true, parentCombinationData = [] }) => {
    const { addToast } = useToasts();
    const router = useRouter();
    const { currency } = useCurrency();
    const [stock, setStock] = useState(0);
    const { token } = useAuth();
    const { dispatch, getCartDetails, getCartItems, state, updateCartRecoveryState, clearCartRecoveryState, setCartPendingUpdate } = useCart();
    const combinationVariant = new Set();
    const [nextPromotion, setNextPromotion] = useState({});
    const [price, setPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState(0);
    const [reconciliationSnapshot, setReconciliationSnapshot] = useState(null);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);

    const cartIdentity = useMemo(() => {
        return buildCartItemIdentity(product);
    }, [product]);

    const isPendingUpdate =
        state?.cartPendingUpdates?.[
        cartIdentity
        ] === true;

    const recoveryQuantity =
        state?.cartRecoveryState?.[
            cartIdentity
        ]?.quantity;

    const localQuantity =
        recoveryQuantity !== undefined &&
            recoveryQuantity !== null
            ? recoveryQuantity
            : (product?.qty || "");

    // Extract all variant names from combinationData
    product.combinationData?.forEach(e => {
        const variantName = e?.variant_name || "";
        // Handle variant names that might be separated by "and" or other delimiters
        const variantNames = variantName.split(/and|,/).map(name => name.trim());
        variantNames.forEach(part => {
            if (part) combinationVariant.add(part);
        });
    });
    const uniqueCombinationVariant = Array.from(combinationVariant);

    // Check if this is a child product (has parent variants already selected)
    const isChildProduct = useMemo(() => {
        // A child product has variantData/variantAttributeData (parent variants already selected)
        return product?.variantData?.length > 0 && product?.variantAttributeData?.length > 0;
    }, [product]);

    // Check if this product has internal variants selected
    const hasInternalVariants = useMemo(() => {
        return product?.variants?.length > 0;
    }, [product]);

    // Check if this product has combination data (for variant-based products)
    const hasCombinationData = useMemo(() => {
        return product?.combinationData?.length > 0;
    }, [product]);

    // Check if variant selection is required
    const isVariantSelectionRequired = useMemo(() => {
        // If no combination data, no variants are required
        if (!hasCombinationData) return false;

        // If it's a child product (already has parent variant selected), internal variants are NOT required
        if (isChildProduct) return false;

        // If it's NOT a child product and has combination data, then at least one variant is required
        return true;
    }, [hasCombinationData, isChildProduct]);

    // Check if variant selection is incomplete
    const isVariantSelectionIncomplete = useMemo(() => {
        // Only show error if:
        // 1. Variant selection is required (not a child product + has combination data)
        // 2. AND no variants are selected (neither internal nor parent)
        return isVariantSelectionRequired &&
            !hasInternalVariants &&
            !isChildProduct;
    }, [isVariantSelectionRequired, hasInternalVariants, isChildProduct]);

    // Check if product has any variants selected
    // const hasAnyVariantsSelected = useMemo(() => {
    //     return hasInternalVariants || isChildProduct;
    // }, [hasInternalVariants, isChildProduct]);

    // Find matching combination for internal variants
    // const findInternalCombination = useMemo(() => {
    //     if (!product?.combinationData?.length) return null;
    //     if (!hasInternalVariants) return null;

    //     const selectedValues = product.variants.map(v =>
    //         v.attributeName.trim().toLowerCase()
    //     );

    //     let pairMatch = null;
    //     let singleMatch = null;

    //     for (const group of product.combinationData) {
    //         for (const combo of group.combinations || []) {

    //             if (!combo.combValues) continue;

    //             const comboValues = combo.combValues.map(v =>
    //                 v.trim().toLowerCase()
    //             );

    //             // ✅ CASE 1: TWO-VARIANT COMBO (PRIORITY)
    //             if (comboValues.length === 2) {
    //                 const match = comboValues.every(val =>
    //                     selectedValues.includes(val)
    //                 );

    //                 if (match) {
    //                     pairMatch = combo;
    //                 }
    //             }

    //             // ✅ CASE 2: SINGLE VARIANT COMBO (FALLBACK)
    //             if (comboValues.length === 1) {
    //                 if (selectedValues.includes(comboValues[0])) {
    //                     singleMatch = combo;
    //                 }
    //             }
    //         }
    //     }

    //     // 🔥 PRIORITY RETURN
    //     return pairMatch || singleMatch || null;

    // }, [product?.variants, product?.combinationData, hasInternalVariants]);

    // Get combinations based on selected variants
    const getCombinations = (arr) => {
        if (!arr || arr.length === 0) return [];

        let combinations = arr.map(item => [item]);

        if (arr.length > 1) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    combinations.push([arr[i], arr[j]]);
                }
            }
        }

        return combinations;
    };

    const matchedCombination = useMemo(() => {
        return resolveMatchingCombination(product);
    }, [product]);

    const resolvedCartState = useMemo(() => {
        return resolveCartItemState(product);
    }, [product]);

    const cartValidation = useMemo(() => {

        if (isPendingUpdate) {

            return {
                valid: true,
                disableCheckout: false,
                shouldResetQuantity: false,
                allowQuantitySelection: true,
                message: ""
            };
        }

        return validateCartItem(product, {
            pendingQuantity: localQuantity
        });

    }, [
        product,
        localQuantity,
        isPendingUpdate
    ]);


    const hasRecoveredInvalidState = useMemo(() => {

        if (
            !cartValidation?.shouldResetQuantity
        ) {
            return false;
        }

        return (
            recoveryQuantity !== undefined &&
            recoveryQuantity !== null &&
            recoveryQuantity !== ""
        );

    }, [
        cartValidation,
        recoveryQuantity
    ]);

    const shouldShowUnavailableState =
        stock <= 0 &&
        cartValidation.valid;

    const displayValidation =
        isPendingUpdate &&
            reconciliationSnapshot
            ? reconciliationSnapshot.validation
            : cartValidation;

    const displayQuantity =
        isPendingUpdate &&
            reconciliationSnapshot
            ? reconciliationSnapshot.quantity
            : localQuantity;

    const selectQuantityValue =
        (
            displayValidation?.shouldResetQuantity &&
            !hasRecoveredInvalidState
        )
            ? ""
            : displayQuantity;

    const displayPrice =
        isPendingUpdate &&
            reconciliationSnapshot
            ? reconciliationSnapshot.price
            : price;

    const displayOriginalPrice =
        isPendingUpdate &&
            reconciliationSnapshot
            ? reconciliationSnapshot.originalPrice
            : originalPrice;

    const displayStock =
        isPendingUpdate &&
            reconciliationSnapshot
            ? reconciliationSnapshot.stock
            : stock;

    // Calculate stock based on all variant types
    const calculateStock = () => {
        return resolvedCartState.latestStock;
    };


    const handleQuantityChange = (e) => {
        const newQuantity = e.target.value;
        updateCartRecoveryState(
            cartIdentity,
            {
                quantity: newQuantity
            }
        );
        updateCart(newQuantity);
    };

    // Calculate price based on variant combinations
    const calculateVariantPrice = () => {
        return resolveCartPricing(product);
    };

    const updateCart = async (targetQty = quantity) => {
        // Don't update if variant selection is incomplete
        if (isVariantSelectionIncomplete) {
            addToast("Please select a variant before updating quantity", {
                appearance: "warning",
                autoDismiss: true,
            });
            return;
        }

        const variantPrice = calculateVariantPrice();

        // --- NEW LOGIC: Calculate price based on local quantity and centralized rules ---
        const couponValues = cart?.vendor_coupon || {};
        const isSynced = couponValues?.isSynced || couponValues?.coupon_data?.isSynced || false;

        // Calculate total qty for shop-level offers based on LOCAL quantity
        const otherProductsQty = cart?.products?.reduce((acc, item) => {
            return item.product_id === product.product_id ? acc : acc + (item?.qty || 0);
        }, 0) || 0;
        const newTotalShopQty = otherProductsQty + Number(targetQty);

        // Find Best Promotion
        let bestPromotion = null;
        const validPromotions = product?.promotionalOfferData?.filter(promo => {
            if (promo.promotion_type === 'qty_per_product') return promo.qty <= targetQty;
            if (promo.promotion_type === 'amount') return promo.offer_amount <= variantPrice;
            if (promo.promotion_type === 'qty_total_shop') return promo.qty <= newTotalShopQty;
            return false;
        }) || [];

        if (validPromotions.length > 0) {
            bestPromotion = validPromotions.reduce((prev, current) => {
                const prevFinalPrice = calculatePriceAfterDiscount(prev.offer_type, prev.discount_amount, variantPrice);
                const currentFinalPrice = calculatePriceAfterDiscount(current.offer_type, current.discount_amount, variantPrice);
                return (variantPrice - currentFinalPrice) > (variantPrice - prevFinalPrice) ? current : prev;
            });
        }

        let finalPrice = variantPrice;
        if (cart?.coupon_status && isSynced) {
            finalPrice = variantPrice;
        } else if (bestPromotion) {
            finalPrice = calculatePriceAfterDiscount(bestPromotion.offer_type, bestPromotion.discount_amount, variantPrice);
        }

        if (!token) {
            dispatch({
                type: "CHANGE_CART_AMOUNT",
                payload: {
                    vendor_id: cart?.vendor_id,
                    vendor_name: cart?.vendor_name,
                    shop_icon: cart?.shop_icon,
                    shop_name: cart?.shop_name,
                    slug: cart?.slug,
                    products: [
                        {
                            ...product,
                            sale_price: finalPrice,
                            qty: targetQty,
                            variants: product?.variants || [],
                            variantData: product?.variantData || [],
                            variantAttributeData: product?.variantAttributeData || []
                        }
                    ]
                },
            });
        } else {
            try {
                const currentServerQty = product?.qty || 0;
                const deltaQty = Number(targetQty) - Number(currentServerQty);

                if (deltaQty === 0) return;

                const latestResolvedPrice = resolveCartPricing(product);

                const payload = {
                    product_id: product.product_id,
                    vendor_id: cart?.vendor_id,
                    qty: deltaQty,
                    price: finalPrice,
                    original_price: latestResolvedPrice,
                    isCombination: product?.isCombination,
                    variant_id: [],
                    variant_attribute_id: [],
                    customize: product?.customize,
                    customizationData: product?.customizationData || []
                };

                // Handle parent variants
                if (product?.variant_id && product.variant_id.length > 0) {
                    payload.variant_id = product.variant_id;
                    payload.variant_attribute_id = product.variant_attribute_id;
                }

                // Handle internal variants
                if (product?.variants && product.variants.length > 0) {
                    payload.variants = product.variants;
                }

                setReconciliationSnapshot({
                    validation: cartValidation,
                    quantity: localQuantity,
                    price,
                    originalPrice,
                    stock
                });

                setCartPendingUpdate(
                    cartIdentity,
                    true
                );

                const res = await postAPIAuth("user/add-to-cart", payload);
                if (res.status === 200) {
                    getCartItems(defaultAddress?._id);
                    const data = wallet ? "1" : "0";
                    getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
                    clearCartRecoveryState(cartIdentity);
                    setCartPendingUpdate(cartIdentity, false);
                }
            } catch (error) {
                console.error("Error updating cart:", error);
                addToast("Failed to update cart. Please try again.", {
                    appearance: "error",
                    autoDismiss: true,
                });
                setCartPendingUpdate(
                    cartIdentity,
                    false
                );
            }
        }
    };



    const removeItemHandler = async () => {
        if (!token) {
            dispatch({
                type: "CHANGE_CART_AMOUNT",
                payload: {
                    vendor_id: cart?.vendor_id,
                    vendor_name: cart?.vendor_name,
                    shop_icon: cart?.shop_icon,
                    shop_name: cart?.shop_name,
                    slug: cart?.slug,
                    products: [
                        {
                            ...product,
                            qty: 0
                        }
                    ]
                }
            });
        } else {
            try {
                const res = await postAPIAuth("user/delete-cart", {
                    cart_id: product.cart_id,
                });
                if (res.status === 200) {
                    getCartItems(defaultAddress?._id);
                    const data = wallet ? "1" : "0";
                    getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
                    return true;
                }
            } catch (error) {
                console.log("Error removing item:", error);
                addToast("Failed to remove item. Please try again.", {
                    appearance: "error",
                    autoDismiss: true,
                });
            }
        }
    };

    const addToWishlistHandler = async () => {
        if (!token) {
            router.push("/login");
        } else {
            try {
                let price = calculateVariantPrice();
                let original_price = calculateVariantPrice();

                const payload = {
                    product_id: product?.product_id,
                    price: price,
                    original_price: original_price,
                    isCombination: product?.isCombination,
                    variant_id: product?.variant_id || [],
                    variant_attribute_id: product?.variant_attribute_id || [],
                    variants: product?.variants || []
                };

                const res = await postAPIAuth("user/add-delete-wishlist", payload);
                if (res.status === 200) {
                    const cartRes = await removeItemHandler();
                    if (cartRes) {
                        addToast("Product added to wishlist", {
                            appearance: "success",
                            autoDismiss: true,
                        });
                    }
                }
            } catch (error) {
                console.log("Error adding to wishlist:", error);
                addToast("Failed to add to wishlist. Please try again.", {
                    appearance: "error",
                    autoDismiss: true,
                });
            }
        }
    };

    // Handle edit product to select variants
    const handleEditProduct = () => {
        router.push(`/product/${product?.slug}/${product?.product_code}`);
    };

    useEffect(() => {
        const calculatedStock = calculateStock();
        setStock(calculatedStock);
    }, [product, parentCombinationData, matchedCombination]);

    useEffect(() => {

        const resolvedPrice =
            resolveCartPricing(product);

        setOriginalPrice(
            resolvedPrice
        );

        /*
        DISPLAY PRICE
        */

        if (
            +product?.sale_price > 0 &&
            +product?.sale_price !== +product?.original_price
        ) {

            setPrice(
                +product?.sale_price
            );

        } else {

            setPrice(
                resolvedPrice
            );
        }

    }, [product]);

    useEffect(() => {
        // Calculate next promotion hint only
        const nextPromotion = product?.promotionalOfferData?.reduce((next, promotion) => {
            if (promotion.promotion_type === 'qty_per_product' && promotion.qty > product?.qty) {
                if (!next || promotion.qty < next.qty) return promotion;
            }
            return next;
        }, null);

        setNextPromotion(nextPromotion);
        // We rely on Props (SingleVendorCart -> processedCart) for current applied promotion
        // setPromotion(product.appliedPromotion); 
        // setBestPromotion(product.appliedPromotion);
    }, [product]);


    // Render variant information
    const renderVariantInfo = () => {
        const variantInfo = [];

        // Show parent variant info (for child products)
        if (isChildProduct && product?.variantData?.length > 0) {
            product.variantData.forEach((variant, index) => {
                const attribute = product.variantAttributeData?.[index];
                if (variant && attribute) {
                    variantInfo.push(
                        <Typography fontSize={14} color="gray" key={`parent-variant-${index}`}>
                            {variant.variant_name} :{" "}
                            <Typography fontSize={14} component="span" color="#000">
                                {attribute.attribute_value}
                            </Typography>
                        </Typography>
                    );
                }
            });
        }

        // Show internal variant info
        if (hasInternalVariants && product?.variants?.length > 0) {
            product.variants.forEach((variant, index) => {
                variantInfo.push(
                    <Typography fontSize={14} color="gray" key={`internal-variant-${index}`}>
                        {variant.variantName} :{" "}
                        <Typography fontSize={14} component="span" color="#000">
                            {variant.attributeName}
                        </Typography>
                    </Typography>
                );
            });
        }

        return variantInfo;
    };

    return (
        <>
            <Box
                borderBottom={"1px solid #0e0e0e2e"}
                pb={2}
                pt={1}
                mb={2}
            >
                <Box
                    sx={{
                        display: {
                            lg: "flex",
                            md: "flex",
                            sx: "block",
                        },
                    }}
                >
                    <Typography component="div" sx={{ flex: "1", position: "relative" }}>
                        <Avatar
                            alt="image"
                            src={product?.firstImage}
                            sx={{ width: 150, height: 150, borderRadius: 2 }}
                            variant="square"
                        />
                        {product?.product_bedge && (
                            <Box
                                sx={{
                                    zIndex: "9",
                                    position: "absolute",
                                    top: "12px",
                                    left: "12px",
                                    background:
                                        product?.product_bedge === "Popular Now"
                                            ? "#fed9c9"
                                            : product?.product_bedge === "Best Seller"
                                                ? "#e9d8a6"
                                                : "#c1f1c1",
                                    boxShadow: "0 0 3px #696969",
                                    borderRadius: "30px",
                                    padding: "5px 10px",
                                    color: "#000",
                                    textDecoration: "underline dashed",
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "13px",
                                    textUnderlineOffset: "2px",
                                }}
                            >
                                {product?.product_bedge == "Popular Now" && (
                                    <svg
                                        height="20px"
                                        width="20px"
                                        viewBox="-33 0 255 255"
                                        xmlns="http://www.w3.org/2000/svg"
                                        preserveAspectRatio="xMidYMid"
                                        fill="#000000"
                                    >
                                        {/* Fire icon SVG */}
                                    </svg>
                                )}
                                {product?.product_bedge == "Best Seller" && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        height="20px"
                                        width="20px"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        {/* Star icon SVG */}
                                    </svg>
                                )}
                                {product?.product_bedge}
                            </Box>
                        )}
                    </Typography>

                    <Typography
                        component="div"
                        sx={{
                            paddingLeft: {
                                lg: "18px",
                                md: "18px",
                                xs: "0",
                            },
                            flex: {
                                lg: "3",
                                md: "3",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: {
                                    lg: "flex",
                                    md: "flex",
                                    xs: "block",
                                },
                            }}
                        >
                            <Typography
                                component="div"
                                sx={{
                                    flexGrow: "1",
                                    maxWidth: {
                                        lg: "58.3333%",
                                        md: "58.3333%",
                                        xs: "100%",
                                    },
                                }}
                            >
                                {(product?.cartAddedUserCount || product?.viewCount) && (<H4
                                    color={"#d23f57"}
                                    fontSize={16}
                                    sx={{ textTransform: "capitalize" }}
                                >
                                    {product?.cartAddedUserCount > 0 && `In ${product?.cartAddedUserCount} carts`} {product?.viewCount > 0 && `${product?.cartAddedUserCount > 0 && "with"} ${product?.viewCount} views`}
                                </H4>)}
                                <Typography
                                    sx={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        whiteSpace: "normal",
                                        WebkitLineClamp: 1,
                                        "&:hover": {
                                            textDecoration: "underline !important",
                                        },
                                    }}
                                    fontSize={16}
                                    lineHeight={1.7}
                                >
                                    <Link
                                        href={`/product/${product?.slug}/${product?.product_code}`}
                                        component={NextLink}
                                    >
                                        {parse(product?.product_name)}
                                    </Link>
                                </Typography>
                                {renderVariantInfo()}

                                {product?.customize == "Yes" && (
                                    <>
                                        {product?.customizationData?.map((item, index) => (
                                            <div key={index}>
                                                {Object.entries(item).map(([key, value]) => (
                                                    <div key={key}>
                                                        {typeof value === 'object' ? (
                                                            <div>
                                                                {key} : {`${value?.value}`}
                                                            </div>
                                                        ) : (
                                                            <div>{key} : {value}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                )}

                                <Typography component="div">

                                    {nextPromotion &&
                                        Object.keys(nextPromotion).length > 0 &&
                                        +nextPromotion?.qty > product.qty && (
                                            <>
                                                <p>
                                                    Save {
                                                        nextPromotion?.offer_type == "flat"
                                                            ? `$ ${nextPromotion?.discount_amount}`
                                                            : `${nextPromotion?.discount_amount} %`
                                                    } when you buy {
                                                        nextPromotion?.qty != 0
                                                            ? nextPromotion?.qty
                                                            : ''
                                                    } items at this shop
                                                </p>

                                                <p>Shop the sale</p>
                                            </>
                                        )
                                    }

                                    {/* VARIANT SELECTION */}
                                    {isVariantSelectionIncomplete && (
                                        <Box
                                            sx={{
                                                backgroundColor: "#ffe5e5",
                                                border: "1px solid #ffcccc",
                                                color: "#d32f2f",
                                                padding: "16px",
                                                borderRadius: "8px",
                                                textAlign: "center",
                                                display: "flex",
                                                gap: "8px",
                                                maxWidth: "600px",
                                                margin: "16px auto",
                                                cursor: "pointer"
                                            }}
                                            onClick={handleEditProduct}
                                        >
                                            <ErrorOutlineIcon sx={{ fontSize: 24 }} />

                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                Choose a variant
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* VALIDATION */}
                                    {!displayValidation.valid &&
                                        !hasRecoveredInvalidState && (
                                            <Box
                                                sx={{
                                                    background: "#fff3cd",
                                                    border: "1px solid #ffeeba",
                                                    color: "#856404",
                                                    padding: "10px",
                                                    borderRadius: "8px",
                                                    marginBottom: "12px",
                                                    marginTop: "8px",
                                                }}
                                            >
                                                <Typography fontSize={13}>
                                                    {displayValidation.message}
                                                </Typography>
                                            </Box>
                                        )
                                    }

                                    {/* SOLD OUT */}
                                    {shouldShowUnavailableState && (
                                        <Typography
                                            component="div"
                                            sx={{
                                                color: "#bc1111",
                                            }}
                                            pt={2}
                                        >
                                            {
                                                (!product?.status || product?.isDeleted)
                                                    ? "Currently Unavailable"
                                                    : "Sold Out"
                                            }
                                        </Typography>
                                    )}

                                    {/* QTY SELECTOR */}
                                    {displayValidation.allowQuantitySelection && (
                                        <Typography
                                            component="div"
                                            pt={1}
                                            display={"flex"}
                                            alignItems={"center"}
                                        >
                                            <FormControl sx={{ width: "100px" }}>
                                                <Select
                                                    onChange={handleQuantityChange}
                                                    value={selectQuantityValue}
                                                    sx={{
                                                        border: "none",
                                                        background: "#fff",
                                                        height: "50px",
                                                    }}
                                                    disabled={
                                                        shouldShowUnavailableState ||
                                                        isVariantSelectionIncomplete
                                                    }
                                                >
                                                    {Array.from(
                                                        {
                                                            length: Math.min(stock, 10)
                                                        },
                                                        (_, i) => i + 1
                                                    ).map((q) => (
                                                        <MenuItem
                                                            key={q}
                                                            value={q}
                                                        >
                                                            {q}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Typography>
                                    )}

                                </Typography>

                                {showButtons && (
                                    <Typography component="div" mt={2} display={"flex"} gap={1}>
                                        <Button
                                            variant="contained"
                                            onClick={() => setEditDrawerOpen(true)}
                                            sx={{
                                                background: "transparent",
                                                fontSize: "14px",
                                                boxShadow: "none",
                                                borderRadius: "25px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={addToWishlistHandler}
                                            variant="contained"
                                            sx={{
                                                background: "transparent",
                                                fontSize: "14px",
                                                boxShadow: "none",
                                                borderRadius: "25px",
                                                cursor: isVariantSelectionIncomplete ? "not-allowed" : "pointer",
                                                opacity: isVariantSelectionIncomplete ? 0.5 : 1,
                                            }}
                                            disabled={isVariantSelectionIncomplete}
                                        >
                                            Save for later
                                        </Button>
                                        <Button
                                            variant="contained"
                                            sx={{
                                                background: "transparent",
                                                fontSize: "14px",
                                                boxShadow: "none",
                                                borderRadius: "25px",
                                            }}
                                            onClick={removeItemHandler}
                                        >
                                            Remove
                                        </Button>
                                    </Typography>
                                )}
                            </Typography>

                            <Typography
                                component="div"
                                sx={{
                                    flexGrow: "1",
                                    maxWidth: {
                                        lg: "41.6667%",
                                        md: "41.6667%",
                                        xs: "100%",
                                    },
                                    paddingLeft: {
                                        lg: "18px",
                                        md: "18px",
                                        xs: "0,",
                                    },
                                }}
                            >
                                <Typography
                                    component="div"
                                    display={"flex"}
                                >
                                    <Typography
                                        component="div"
                                        flexGrow={1}
                                        flexBasis={"100%"}
                                        maxWidth={"100%"}
                                        textAlign={"right"}
                                        sx={{
                                            flexDirection: "column",
                                            display: "flex",
                                            alignItems: {
                                                xs: "start",
                                                md: "end",
                                            },
                                            justifyContent: {
                                                xs: "flex-start",
                                                md: "flex-end",
                                            },
                                        }}
                                    >
                                        {/* Show Applied Promotion Badge */}
                                        {product?.appliedPromotion && (
                                            <Box
                                                sx={{
                                                    display: "inline-block",
                                                    backgroundColor: "#00C853",
                                                    color: "#fff",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    marginBottom: "4px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    width: "fit-content",
                                                    alignItems: "flex-end"
                                                }}
                                            >
                                                <Typography component="span" fontSize="12px" fontWeight="bold">
                                                    {(product.appliedPromotion.promotion_type === 'qty_total_shop' || product.appliedPromotion.promotion_type === 'amount') ? 'SHOP OFFER: ' : ''}
                                                    {product.appliedPromotion.offer_type === "flat"
                                                        ? `${currency?.symbol}${product.appliedPromotion.discount_amount} OFF`
                                                        : `${product.appliedPromotion.discount_amount}% OFF`}
                                                </Typography>
                                            </Box>
                                        )}
                                        {/* Show Coupon Badge if synced and applied */}
                                        {cart?.coupon_status && (cart?.vendor_coupon?.isSynced || cart?.vendor_coupon?.coupon_data?.isSynced) && (
                                            <Box
                                                sx={{
                                                    display: "inline-block",
                                                    backgroundColor: "#2196f3",
                                                    color: "#fff",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    marginBottom: "4px",
                                                    width: "fit-content",
                                                }}
                                            >
                                                COUPON APPLIED
                                            </Box>
                                        )}
                                        {cart?.coupon_status && (cart?.vendor_coupon?.isSynced || cart?.vendor_coupon?.coupon_data?.isSynced) ? (<Typography
                                            fontSize={19}
                                            fontWeight={600}
                                            textAlign={"right"}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: {
                                                    lg: "end",
                                                    md: "end",
                                                    xs: "start",
                                                },
                                            }}
                                        >
                                            {displayOriginalPrice != displayPrice && currency?.symbol}
                                            {displayOriginalPrice != displayPrice && (displayOriginalPrice * currency.rate * Number(displayQuantity || 0)).toFixed(2)}
                                        </Typography>) : (<Typography
                                            fontSize={19}
                                            fontWeight={600}
                                            textAlign={"right"}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: {
                                                    lg: "end",
                                                    md: "end",
                                                    xs: "start",
                                                },
                                            }}
                                        >
                                            {currency?.symbol}{(displayPrice * Number(displayQuantity || 0) * currency?.rate).toFixed(2)}
                                        </Typography>)}
                                        {!(cart?.coupon_status && (cart?.vendor_coupon?.isSynced || cart?.vendor_coupon?.coupon_data?.isSynced)) && (<Typography
                                            fontSize={19}
                                            fontWeight={600}
                                            textAlign={"right"}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: {
                                                    lg: "end",
                                                    md: "end",
                                                    xs: "start",
                                                },
                                            }}
                                        >
                                            <Small
                                                pl={1}
                                                sx={{
                                                    fontSize: "18px",
                                                    fontWeight: "600",
                                                    color: "gray",
                                                }}
                                                component="del"
                                            >
                                                {displayOriginalPrice != displayPrice && currency?.symbol}
                                                {displayOriginalPrice != displayPrice && (displayOriginalPrice * currency.rate * Number(displayQuantity || 0)).toFixed(2)}
                                            </Small>
                                        </Typography>)}
                                        {Number(localQuantity || 0) > 1 && (
                                            <Typography
                                                fontSize={12}
                                                color={"gray"}
                                                textAlign={"right"}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: {
                                                        lg: "end",
                                                        md: "end",
                                                        xs: "start",
                                                    },
                                                }}
                                            >
                                                ({currency?.symbol}{(displayPrice * currency?.rate).toFixed(2)} each)
                                            </Typography>
                                        )}

                                        {/* Upsell Message UI */}
                                        {product?.upsellData && (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    p: "4px 8px",
                                                    backgroundColor: "#e3f2fd",
                                                    borderRadius: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "flex-end",
                                                    width: "fit-content",
                                                    ml: "auto"
                                                }}
                                            >
                                                <Typography fontSize={11} color="#1565c0" fontWeight={700} textAlign="right" lineHeight={1.2}>
                                                    {product.upsellData.message}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Typography>
                                </Typography>
                            </Typography>
                        </Box>
                    </Typography>
                </Box>
            </Box>
            <CartEditDrawer
                open={editDrawerOpen}
                onClose={() => setEditDrawerOpen(false)}
                cartProduct={product}
            />
        </>
    );
};

export default Product;
