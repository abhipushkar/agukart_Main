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
import { resolveCartItemState } from "../utils/resolveCartItemState";
import { validateCartItem } from "../utils/validateCartItem";
import { buildCartItemIdentity } from "../utils/buildCartItemIdentity";
import { resolveCartPricing } from "../utils/resolveCartPricing";
import CartEditDrawer from "components/cart/CartEditDrawer";
import useMyProvider from "hooks/useMyProvider";

const Product = ({ cart, product, wallet, defaultAddress, voucherDetails, showButtons = true, addParentCart, quantityMap }) => {
    const { addToast } = useToasts();
    const router = useRouter();
    const { currency } = useCurrency();
    const [stock, setStock] = useState(0);
    const { token } = useAuth();
    const { dispatch, getCartDetails, getCartItems, state, updateCartRecoveryState, clearCartRecoveryState, setCartPendingUpdate } = useCart();
    const { saveProductForLater } = useMyProvider();
    const [nextPromotion, setNextPromotion] = useState({});
    const [reconciliationSnapshot, setReconciliationSnapshot] = useState(null);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);

    const cartIdentity = useMemo(() => buildCartItemIdentity(product), [product]);

    const isPendingUpdate = state?.cartPendingUpdates?.[cartIdentity] === true;
    const recoveryQuantity = state?.cartRecoveryState?.[cartIdentity]?.quantity;
    const localQuantity = recoveryQuantity !== undefined && recoveryQuantity !== null ? recoveryQuantity : (product?.qty || "");

    // Check product types
    const isChildProduct = useMemo(() => product?.variantData?.length > 0 && product?.variantAttributeData?.length > 0, [product]);
    const hasInternalVariants = useMemo(() => product?.variants?.length > 0, [product]);
    const hasCombinationData = useMemo(() => product?.combinationData?.length > 0, [product]);

    const isVariantSelectionRequired = useMemo(() => hasCombinationData && !isChildProduct, [hasCombinationData, isChildProduct]);
    const isVariantSelectionIncomplete = useMemo(() => isVariantSelectionRequired && !hasInternalVariants && !isChildProduct, [isVariantSelectionRequired, hasInternalVariants, isChildProduct]);

    const resolvedCartState = useMemo(() => resolveCartItemState(product, product), [product]);

    // Get the correct discounted price and original price from cart item
    const effectivePrice = useMemo(() => {
        // Use the cart item's price (already includes promotion discount)
        if (product?.price) return product.price;
        // Fallback to calculated price
        return resolvedCartState?.latestPrice || product?.sale_price || 0;
    }, [product, resolvedCartState]);

    const effectiveOriginalPrice = useMemo(() => {
        // Use the cart item's original_price (before any discount)
        if (product?.original_price) return product.original_price;
        // If product has real_price, use that
        if (product?.real_price) return product.real_price;
        // Fallback to sale_price or price
        return product?.sale_price || product?.price || 0;
    }, [product]);

    const cartValidation = useMemo(() => {
        if (isPendingUpdate) {
            return {
                valid: true,
                disableCheckout: false,
                shouldResetQuantity: false,
                allowQuantitySelection: true,
                message: "",
                openEditDrawer: false,
                caseType: null
            };
        }
        return validateCartItem(product, { pendingQuantity: localQuantity, cartItem: product, quantityMap });
    }, [product, localQuantity, isPendingUpdate]);

    const hasRecoveredInvalidState = useMemo(() => {
        return cartValidation?.shouldResetQuantity && recoveryQuantity !== undefined && recoveryQuantity !== null && recoveryQuantity !== "";
    }, [cartValidation, recoveryQuantity]);

    const displayValidation = isPendingUpdate && reconciliationSnapshot ? reconciliationSnapshot.validation : cartValidation;
    const displayQuantity = isPendingUpdate && reconciliationSnapshot ? reconciliationSnapshot.quantity : localQuantity;
    const selectQuantityValue = (displayValidation?.shouldResetQuantity && !hasRecoveredInvalidState) ? "" : displayQuantity;

    // Display prices - use effective values from cart
    const displayPrice = isPendingUpdate && reconciliationSnapshot ? reconciliationSnapshot.price : effectivePrice;
    const displayOriginalPrice = isPendingUpdate && reconciliationSnapshot ? reconciliationSnapshot.originalPrice : effectiveOriginalPrice;
    const displayStock = isPendingUpdate && reconciliationSnapshot ? reconciliationSnapshot.stock : stock;

    // Update stock when resolved state changes
    useEffect(() => {
        setStock(resolvedCartState.latestStock);
    }, [resolvedCartState.latestStock]);

    // Price calculation for payload
    const calculateVariantPrice = () => resolveCartPricing(product, product);

    const updateCart = async (targetQty) => {
        if (isVariantSelectionIncomplete) {
            addToast("Please select a variant before updating quantity", { appearance: "warning", autoDismiss: true });
            return;
        }

        const variantPrice = calculateVariantPrice();
        const couponValues = cart?.vendor_coupon || {};
        const isSynced = couponValues?.isSynced || couponValues?.coupon_data?.isSynced || false;

        let bestPromotion = product?.appliedPromotion;
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
                    products: [{
                        ...product,
                        sale_price: finalPrice,
                        qty: targetQty,
                        variants: product?.variants || [],
                        variantData: product?.variantData || [],
                        variantAttributeData: product?.variantAttributeData || []
                    }]
                },
            });
            return;
        }

        try {
            const currentServerQty = product?.qty || 0;
            const deltaQty = Number(targetQty) - Number(currentServerQty);
            if (deltaQty === 0) return;

            const latestResolvedPrice = resolveCartPricing(product, product);
            const payload = {
                product_id: product.product_id,
                vendor_id: cart?.vendor_id,
                qty: deltaQty,
                price: finalPrice,
                original_price: latestResolvedPrice,
                isCombination: product?.isCombination,
                variant_id: product?.variant_id || [],
                variant_attribute_id: product?.variant_attribute_id || [],
                variants: product?.variants || [],
                customize: product?.selectedCustomization?.length > 0 ? "Yes" : product?.customize,
                customizationData: product?.selectedCustomization || []
            };

            setReconciliationSnapshot({
                validation: cartValidation,
                quantity: localQuantity,
                price: displayPrice,
                originalPrice: displayOriginalPrice,
                stock
            });

            setCartPendingUpdate(cartIdentity, true);
            const res = await postAPIAuth("user/add-to-cart", payload);
        } catch (error) {
            console.error("Error updating cart:", error);
            addToast(error.response?.data?.message, { appearance: "error", autoDismiss: true });
        } finally {
            getCartItems(defaultAddress?._id);
            const data = wallet ? "1" : "0";
            getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
            clearCartRecoveryState(cartIdentity);
            setCartPendingUpdate(cartIdentity, false);
        }
    };

    const handleQuantityChange = (e) => {
        const newQuantity = e.target.value;
        updateCartRecoveryState(cartIdentity, { quantity: newQuantity });
        updateCart(newQuantity);
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
                    products: [{ ...product, qty: 0 }]
                }
            });
        } else {
            try {
                const res = await postAPIAuth("user/delete-cart", { cart_id: product.cart_id });
                if (res.status === 200) {
                    getCartItems(defaultAddress?._id);
                    const data = wallet ? "1" : "0";
                    getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
                    return true;
                }
            } catch (error) {
                console.log("Error removing item:", error);
                addToast("Failed to remove item. Please try again.", { appearance: "error", autoDismiss: true });
            }
        }
    };

    const saveForLaterHandler = async () => {
        if (!token) {
            router.push("/login");
        } else {
            try {
                const res = await saveProductForLater(product?.cart_id);
                if (res.status === 200) {
                    getCartItems(defaultAddress?._id);
                    const data = wallet ? "1" : "0";
                    getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
                    addToast("Product saved for later", { appearance: "success", autoDismiss: true });
                }
            } catch (error) {
                console.log("Error saving product for later:", error);
                addToast("Failed to save product for later. Please try again.", { appearance: "error", autoDismiss: true });
            }
        }
    };

    // const handleEditProduct = () => router.push(`/product/${product?.slug}/${product?.product_code}`);
    const handleOpenEditDrawer = () => setEditDrawerOpen(true);

    useEffect(() => {
        const nextPromotion = product?.promotionalOfferData?.reduce((next, promotion) => {
            if (promotion.promotion_type === 'qty_per_product' && promotion.qty > product?.qty) {
                if (!next || promotion.qty < next.qty) return promotion;
            }
            return next;
        }, null);
        setNextPromotion(nextPromotion);
    }, [product]);

    const renderVariantInfo = () => {
        const variantInfo = [];
        if (isChildProduct && product?.variantData?.length) {
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
        if (hasInternalVariants && product?.variants?.length) {
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

    const validationMessage = displayValidation?.message || "";
    const shouldOpenEditDrawer = displayValidation?.openEditDrawer === true;
    const caseType = displayValidation?.caseType;

    return (
        <>
            <Box borderBottom={"1px solid #0e0e0e2e"} pb={2} pt={1} mb={2}>
                <Box sx={{ display: { lg: "flex", md: "flex", sx: "block" } }}>
                    {/* Left column – product image and badge */}
                    <Typography component="div" sx={{ flex: "1", position: "relative" }}>
                        <Avatar alt="image" src={product?.firstImage} sx={{ width: 150, height: 150, borderRadius: 2 }} variant="square" />
                        {product?.product_bedge && (
                            <Box sx={{
                                zIndex: "9", position: "absolute", top: "12px", left: "12px",
                                background: product?.product_bedge === "Popular Now" ? "#fed9c9" : product?.product_bedge === "Best Seller" ? "#e9d8a6" : "#c1f1c1",
                                boxShadow: "0 0 3px #696969", borderRadius: "30px", padding: "5px 10px", color: "#000",
                                textDecoration: "underline dashed", display: "flex", alignItems: "center", fontSize: "13px", textUnderlineOffset: "2px",
                            }}>
                                {product?.product_bedge}
                            </Box>
                        )}
                    </Typography>

                    {/* Middle column – product details, variants, quantity */}
                    <Typography component="div" sx={{ paddingLeft: { lg: "18px", md: "18px", xs: "0" }, flex: { lg: "3", md: "3" } }}>
                        <Box sx={{ display: { lg: "flex", md: "flex", xs: "block" } }}>
                            <Typography component="div" sx={{ flexGrow: "1", maxWidth: { lg: "58.3333%", md: "58.3333%", xs: "100%" } }}>
                                {(product?.cartAddedUserCount || product?.viewCount) && (
                                    <H4 color={"#d23f57"} fontSize={16} sx={{ textTransform: "capitalize" }}>
                                        {product?.cartAddedUserCount > 0 && `In ${product?.cartAddedUserCount} carts`} {product?.viewCount > 0 && `${product?.cartAddedUserCount > 0 && "with"} ${product?.viewCount} views`}
                                    </H4>
                                )}
                                <Typography sx={{
                                    textOverflow: "ellipsis", overflow: "hidden", display: "-webkit-box",
                                    WebkitBoxOrient: "vertical", whiteSpace: "normal", WebkitLineClamp: 1,
                                    "&:hover": { textDecoration: "underline !important" }
                                }} fontSize={16} lineHeight={1.7}>
                                    <Link href={`/product/${product?.slug}/${product?.product_code}`} component={NextLink}>
                                        {parse(product?.product_name)}
                                    </Link>
                                </Typography>
                                {renderVariantInfo()}
                                {product?.customize === "Yes" && product?.selectedCustomization?.map((item, index) => (
                                    <div key={index}>
                                        {Object.entries(item).map(([key, value]) => (
                                            <div key={key}>{key} : {typeof value === 'object' ? value?.value : value}</div>
                                        ))}
                                    </div>
                                ))}
                                <Typography component="div">
                                    {nextPromotion && Object.keys(nextPromotion).length > 0 && +nextPromotion?.qty > product.qty && (
                                        <>
                                            <p>Save {nextPromotion?.offer_type === "flat" ? `$ ${nextPromotion?.discount_amount}` : `${nextPromotion?.discount_amount} %`} when you buy {nextPromotion?.qty != 0 ? nextPromotion?.qty : ''} items at this shop</p>
                                            <p>Shop the sale</p>
                                        </>
                                    )}
                                    {/* {isVariantSelectionIncomplete && (
                                        <Box sx={{
                                            backgroundColor: "#ffe5e5", border: "1px solid #ffcccc", color: "#d32f2f",
                                            padding: "16px", borderRadius: "8px", textAlign: "center", display: "flex",
                                            gap: "8px", maxWidth: "600px", margin: "16px auto", cursor: "pointer"
                                        }} onClick={handleEditProduct}>
                                            <ErrorOutlineIcon sx={{ fontSize: 24 }} />
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>Choose a variant</Typography>
                                        </Box>
                                    )} */}
                                    {!displayValidation.valid && !hasRecoveredInvalidState && (
                                        <Box
                                            sx={{
                                                background: caseType === "PRICE_CHANGED" || caseType === "CUSTOMIZATION_PRICE_CHANGED" ? "#fff3cd" : "#ffe5e5",
                                                border: caseType === "PRICE_CHANGED" || caseType === "CUSTOMIZATION_PRICE_CHANGED" ? "1px solid #ffeeba" : "1px solid #ffcccc",
                                                color: caseType === "PRICE_CHANGED" || caseType === "CUSTOMIZATION_PRICE_CHANGED" ? "#856404" : "#d32f2f",
                                                padding: "10px", borderRadius: "8px", marginBottom: "12px", marginTop: "8px", cursor: "pointer"
                                            }}
                                            onClick={handleOpenEditDrawer}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <ErrorOutlineIcon sx={{ fontSize: 20, cursor: "pointer" }} onClick={handleOpenEditDrawer} />
                                                <Typography fontSize={13}>{validationMessage}</Typography>
                                            </Box>
                                            {shouldOpenEditDrawer && (
                                                <Typography fontSize={12} sx={{ mt: 0.5, textDecoration: "underline" }}>
                                                    Click to edit
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                    {displayValidation.type === "OUT_OF_STOCK" && (
                                        <Typography component="div" sx={{ color: "#bc1111" }} pt={2}>
                                            {(!product?.status || product?.isDeleted) ? "Currently Unavailable" : "Sold Out"}
                                        </Typography>
                                    )}
                                    {displayValidation.allowQuantitySelection && (
                                        <Typography component="div" pt={1} display={"flex"} alignItems={"center"}>
                                            <FormControl sx={{ width: "100px" }}>
                                                <Select
                                                    onChange={handleQuantityChange}
                                                    value={selectQuantityValue}
                                                    sx={{ border: "none", background: "#fff", height: "50px" }}
                                                >
                                                    {Array.from({ length: Math.min(displayStock, 10) }, (_, i) => i + 1).map((q) => (
                                                        <MenuItem key={q} value={q}>{q}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Typography>
                                    )}
                                </Typography>
                                {showButtons && (
                                    <Typography component="div" mt={2} display={"flex"} gap={1}>
                                        <Button variant="contained" onClick={() => setEditDrawerOpen(true)} sx={{ background: "transparent", fontSize: "14px", boxShadow: "none", borderRadius: "25px", cursor: "pointer" }}>Edit</Button>
                                        <Button onClick={saveForLaterHandler} variant="contained" sx={{ background: "transparent", fontSize: "14px", boxShadow: "none", borderRadius: "25px", cursor: isVariantSelectionIncomplete ? "not-allowed" : "pointer", opacity: isVariantSelectionIncomplete ? 0.5 : 1 }} disabled={isVariantSelectionIncomplete}>Save for later</Button>
                                        <Button variant="contained" onClick={removeItemHandler} sx={{ background: "transparent", fontSize: "14px", boxShadow: "none", borderRadius: "25px" }}>Remove</Button>
                                    </Typography>
                                )}
                            </Typography>

                            {/* Right column – price and promotions */}
                            <Typography component="div" sx={{
                                flexGrow: "1", maxWidth: { lg: "41.6667%", md: "41.6667%", xs: "100%" },
                                paddingLeft: { lg: "18px", md: "18px", xs: "0" }
                            }}>
                                <Typography component="div" display={"flex"}>
                                    <Typography component="div" flexGrow={1} flexBasis={"100%"} maxWidth={"100%"} textAlign={"right"}
                                        sx={{ flexDirection: "column", display: "flex", alignItems: { xs: "start", md: "end" }, justifyContent: { xs: "flex-start", md: "flex-end" } }}>

                                        {product?.appliedPromotion && (
                                            <Box sx={{
                                                display: "inline-block", backgroundColor: "#00C853", color: "#fff", borderRadius: "4px",
                                                padding: "4px 8px", fontSize: "12px", fontWeight: "bold", marginBottom: "4px",
                                                width: "fit-content", alignItems: "flex-end"
                                            }}>
                                                <Typography component="span" fontSize="12px" fontWeight="bold">
                                                    {(product.appliedPromotion.promotion_type === 'qty_total_shop' || product.appliedPromotion.promotion_type === 'amount') ? 'SHOP OFFER: ' : ''}
                                                    {product.appliedPromotion.offer_type === "flat" ? `${currency?.symbol}${product.appliedPromotion.discount_amount} OFF` : `${product.appliedPromotion.discount_amount}% OFF`}
                                                </Typography>
                                            </Box>
                                        )}

                                        {cart?.coupon_status && (cart?.vendor_coupon?.isSynced || cart?.vendor_coupon?.coupon_data?.isSynced) && (
                                            <Box sx={{ display: "inline-block", backgroundColor: "#2196f3", color: "#fff", borderRadius: "4px", padding: "4px 8px", fontSize: "12px", fontWeight: "bold", marginBottom: "4px", width: "fit-content" }}>
                                                COUPON APPLIED
                                            </Box>
                                        )}

                                        {/* Current Price - Discounted */}
                                        <Typography fontSize={19} fontWeight={600} textAlign={"right"} sx={{ display: "flex", alignItems: "center", justifyContent: { lg: "end", md: "end", xs: "start" } }}>
                                            {currency?.symbol}{(displayPrice * Number(displayQuantity || 0) * currency?.rate).toFixed(2)}
                                        </Typography>

                                        {/* Original Price with Strikethrough */}
                                        {Number(effectiveOriginalPrice) > Number(displayPrice) && (
                                            <Typography fontSize={19} fontWeight={600} textAlign={"right"} sx={{ display: "flex", alignItems: "center", justifyContent: { lg: "end", md: "end", xs: "start" } }}>
                                                <Small pl={1} sx={{ fontSize: "18px", fontWeight: "600", color: "gray" }} component="del">
                                                    {currency?.symbol}{(effectiveOriginalPrice * currency.rate * Number(displayQuantity || 0)).toFixed(2)}
                                                </Small>
                                            </Typography>
                                        )}

                                        {/* Per-unit price hint */}
                                        {Number(displayQuantity || 0) > 1 && (
                                            <Typography fontSize={12} color={"gray"} textAlign={"right"} sx={{ display: "flex", alignItems: "center", justifyContent: { lg: "end", md: "end", xs: "start" } }}>
                                                ({currency?.symbol}{(displayPrice * currency?.rate).toFixed(2)} each)
                                            </Typography>
                                        )}

                                        {product?.upsellData && (
                                            <Box sx={{ mt: 1, p: "4px 8px", backgroundColor: "#e3f2fd", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", width: "fit-content", ml: "auto" }}>
                                                <Typography fontSize={11} color="#1565c0" fontWeight={700} textAlign="right" lineHeight={1.2}>{product.upsellData.message}</Typography>
                                            </Box>
                                        )}
                                    </Typography>
                                </Typography>
                            </Typography>
                        </Box>
                    </Typography>
                </Box>
            </Box>
            <CartEditDrawer open={editDrawerOpen} onClose={() => setEditDrawerOpen(false)} cartProduct={product} wallet={wallet} address={defaultAddress} voucher={voucherDetails} addParentCart={addParentCart} />
        </>
    );
};

export default Product;
