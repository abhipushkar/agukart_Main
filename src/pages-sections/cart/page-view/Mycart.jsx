"use client";
import {notFound} from "next/navigation";
import Link from "next/link";
import {useMemo} from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {H4, Small} from "components/Typography";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import {useRouter} from "next/navigation";
import Alert from "@mui/material/Alert";

import Snackbar, {SnackbarCloseReason} from "@mui/material/Snackbar";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    AccordionSummary,
    AccordionDetails,
    FormControlLabel,
    CircularProgress, Skeleton,
} from "@mui/material";
import NextLink from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import useCart from "hooks/useCart";

import parse from "html-react-parser";
import {getAPIAuth, postAPIAuth} from "utils/__api__/ApiServies";
import React, {useEffect} from "react";

import useAuth from "hooks/useAuth";
import Accordion from "@mui/material/Accordion";
import {useToasts} from "react-toast-notifications";
import {PLACE_ORDER_VALIDATION} from "constant";
import {useState} from "react";
import {fontSize} from "theme/typography";
import useMyProvider from "hooks/useMyProvider";
import SingleVendorCart from "./SingleVendorCart";
// import CartShimmerLoader from "./CartShimmerLoader";
import {useCurrency} from "contexts/CurrencyContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {calculatePriceAfterDiscount} from 'utils/calculatePriceAfterDiscount';
import {useLocation} from "../../../contexts/location_context";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {CountryModal} from "./country_modal";

const Mycart = () => {
    const {currency} = useCurrency();
    const {setUserCredentials, usercredentials, getUserDetail} = useMyProvider();
    const {addToast} = useToasts();
    const [snackOpen, setSnackOpen] = React.useState(false);
    const [wallet, setWallet] = useState(false);
    const {token, setPlaceOrderValidate} = useAuth();
    const {state, getCartDetails, getCartItems} = useCart();
    const [checkCustomizationSelect, setCheckCustomizationSelect] = useState(false);
    const [isShippingAvailable, setIsShippingAvailable] = useState(false);
    const [isStockAvailable, setIsStockAvailable] = useState(false);
    const [isDeleteProduct, setIsDeleteProduct] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);
    const [applyinCoupon, setCouponApplying] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        voucher_code: "",
    });
    const [storeCouponForm, setStoreCouponForm] = useState({
        store_coupon_code: "",
    });
    const [storeCouponError, setStoreCouponError] = useState("");
    const [storeCouponLoading, setStoreCouponLoading] = useState(false);
    const [countryModalOpen, setCountryModalOpen] = useState(false);
    const { location, setLocation, countries, isLoading, isLoadingCountries } = useLocation();
    const [voucherDetails, setVoucherDetails] = useState({discount: 0, voucherCode: ""});
    const [errors, setErrors] = useState({voucher_code: ""});
    const router = useRouter();
    
    // Check if cart has only one vendor
    const isSingleVendor = state?.cart?.length === 1;
    const currentVendor = isSingleVendor ? state?.cart?.[0] : null;

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormValues((prev) => ({...prev, [name]: value}));
        setErrors((prv) => ({...prv, [name]: ""}));
    };

    const handleStoreCouponChange = (e) => {
        const {name, value} = e.target;
        setStoreCouponForm((prev) => ({...prev, [name]: value}));
        setStoreCouponError("");
    };

    const handleCountrySelect = (country) => {
        setLocation({
            countryName: country.name,
            countryCode: country.sortname || ""
        });
    };

    useEffect(() => {
        const isCustomizationSelect = state.cart.some((vendor) =>
            vendor.products.some((product) => product.isCombination && product.variantData.length == 0)
        );
        if (isCustomizationSelect) {
            setCheckCustomizationSelect(true);
        } else {
            setCheckCustomizationSelect(false);
        }
        const isStockAvailable = state?.cart?.some((vendor) =>
            vendor.products.some(
                (product) => +product?.stock <= 0 && product?.isCombination === false
            )
        );
        if (isStockAvailable) {
            setIsStockAvailable(true);
        } else {
            setIsStockAvailable(false);
        }
        const isDeleteProduct = state?.cart?.some((vendor) =>
            vendor.products.some((product) => product?.isDeleted == true)
        );
        if (isDeleteProduct) {
            setIsDeleteProduct(true);
        } else {
            setIsDeleteProduct(false);
        }
        const isAvailable = state?.cart?.some((vendor) =>
            vendor.products.some((product) => product?.status == false)
        );
        if (isAvailable) {
            setIsAvailable(true);
        } else {
            setIsAvailable(false);
        }
    }, [state.cart]);

    useEffect(() => {
        if (token) {
            const shippingAvailable = state.cart.some((vendor) => !vendor.shippingAvailable);
            if (shippingAvailable) {
                setIsShippingAvailable(true);
            } else {
                setIsShippingAvailable(false);
            }
        }
    }, [state.cart, token])

    // Calculate global totals using the same logic as SingleVendorCart to support Stacked/Exclusive coupons
    const derivedCartTotals = useMemo(() => {
        let globalItemTotal = 0;
        let globalShopDiscount = 0;
        let globalCouponDiscount = 0;

        if (!state?.cart) return { itemTotal: 0, shopDiscount: 0, couponDiscount: 0, subTotal: 0 };

        state.cart.forEach(cart => {
            const totalShopProductQty = cart?.products?.reduce((acc, item) => acc + item?.qty, 0);
            
            // Calculate Total Shop Value (Gross) for validation
            const totalShopValue = cart?.products?.reduce((acc, item) => {
                 const price = +item.original_price || +item.real_price || 0;
                 return acc + (price * (item?.qty || 0));
            }, 0);

            const isCouponApplied = cart?.coupon_status;
            const couponValues = cart?.vendor_coupon || {}; 
            const isSynced = couponValues?.isSynced || couponValues?.coupon_data?.isSynced || false;

            let vendorCalculatedShopValue = 0;
            let vendorOriginalShopValue = 0;

            cart.products.forEach(product => {
                const variantPrice = +product.original_price || +product.real_price || 0;
                
                // 1. Find Best Promotion
                let bestPromotion = null;
                const validPromotions = product?.promotionalOfferData?.filter(promo => {
                    if (promo.promotion_type === 'qty_per_product') return promo.qty <= product.qty;
                    if (promo.promotion_type === 'amount') return promo.offer_amount <= totalShopValue; 
                    if (promo.promotion_type === 'qty_total_shop') return promo.qty <= totalShopProductQty;
                    return false;
                }) || [];

                if (validPromotions.length > 0) {
                     bestPromotion = validPromotions.reduce((prev, current) => {
                        const prevFinalPrice = calculatePriceAfterDiscount(prev.offer_type, prev.discount_amount, variantPrice); 
                        const currentFinalPrice = calculatePriceAfterDiscount(current.offer_type, current.discount_amount, variantPrice);
                        return (variantPrice - currentFinalPrice) > (variantPrice - prevFinalPrice) ? current : prev;
                    });
                }

                // 2. Logic for isSynced (Exclusive vs Stacked)
                let finalPrice = variantPrice;
                
                if (isCouponApplied && isSynced) {
                    // Exclusive: Remove promo
                    finalPrice = variantPrice; 
                } else {
                    // Stacked or No Coupon: Apply promo
                    if (bestPromotion) {
                        finalPrice = calculatePriceAfterDiscount(bestPromotion.offer_type, bestPromotion.discount_amount, variantPrice);
                    }
                }

                vendorCalculatedShopValue += (finalPrice * product.qty);
                vendorOriginalShopValue += (variantPrice * product.qty);
            });

            const vendorPromotionDiscount = vendorOriginalShopValue - vendorCalculatedShopValue;
            // Coupon discount comes from backend cart usually, but we should use it if available
            const vendorCouponDiscount = cart?.discountAmount || 0;

            globalItemTotal += vendorOriginalShopValue;
            globalShopDiscount += vendorPromotionDiscount;
            globalCouponDiscount += vendorCouponDiscount;
            
        });

        // If no items, fallback to 0 or state default
        return {
            itemTotal: globalItemTotal,
            shopDiscount: globalShopDiscount,
            couponDiscount: globalCouponDiscount,
            subTotal: globalItemTotal - globalShopDiscount - globalCouponDiscount
        };
    }, [state.cart]);

    const [confirmation, setconfirmation] = React.useState(false);

    const handleWalletChange = async (e) => {
        setWallet(e.target.checked);
        const data = !wallet ? "1" : "0";
        // No address_id needed in cart page
        getCartDetails(data, null, voucherDetails?.discount);
    }

    const handleClickconfirmation = () => {
        // No address validation needed in cart page
        setconfirmation(true);
    };

    const handleClose = () => {
        setconfirmation(false);
    };

    const handleSnackClick = () => {
        setSnackOpen(true);
    };

    const sanckClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setSnackOpen(false);
    };

    const action = (
        <React.Fragment>
            <Button color="secondary" size="small" onClick={sanckClose}>
                UNDO
            </Button>
        </React.Fragment>
    );

    useEffect(() => {
        if (token) {
            getUserDetail();
        }
    }, [])

    useEffect(() => {
        if (token) {
            const walletdata = wallet ? "1" : "0";
            // No address_id needed in cart page
            getCartDetails(walletdata, null, voucherDetails?.discount);
        }
    }, [token, wallet, voucherDetails?.discount]);

    const handleApply = async () => {
        if (!token) {
            return router.push("/login");
        }
        const newErrors = {};
        if (!formValues.voucher_code)
            newErrors.voucher_code = "Voucher code is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload = {
                    voucher_code: formValues?.voucher_code,
                };
                setCouponApplying(true);
                const res = await postAPIAuth("user/check-voucher-for-product", payload);
                if (res.status === 200) {
                    setCouponApplying(false);
                    const data = {
                        _id: res?.data?.voucherDetails?._id,
                        voucherCode: res?.data?.voucherDetails?.claim_code,
                        discount: res?.data?.discount
                    }
                    setVoucherDetails(data);
                    localStorage.setItem("voucherDetails", JSON.stringify(data))
                    const walletdata = wallet ? "1" : "0";
                    // No address_id needed in cart page
                    getCartDetails(walletdata, null, res?.data?.discount);
                    addToast(res?.data?.message, {
                        appearance: "success",
                        autoDismiss: true,
                    });
                }
            } catch (error) {
                setCouponApplying(false);
                addToast(error?.response?.data.message || error, {
                    appearance: "error",
                    autoDismiss: true,
                });
                console.log("error", error?.response?.data.message || error);
            }
        }
    };
    
    const handleRemove = async () => {
        setVoucherDetails({discount: 0, voucherCode: ""});
        setFormValues({voucher_code: ""});
        localStorage.removeItem("voucherDetails");
        const walletdata = wallet ? "1" : "0";
        // No address_id needed in cart page
        getCartDetails(walletdata, null, 0);
        addToast("Voucher removed successfully", {
            appearance: "success",
            autoDismiss: true,
        });
    };

    // Store Coupon Functions - Only for single vendor
    const handleStoreCouponApply = async () => {
        if (!token) {
            return router.push("/login");
        }
        if (!isSingleVendor || !currentVendor) {
            addToast("Store coupon can only be applied for single shop orders", {
                appearance: "error",
                autoDismiss: true,
            });
            return;
        }
        
        if (!storeCouponForm.store_coupon_code) {
            setStoreCouponError("Store coupon code is required");
            return;
        }
        
        try {
            setStoreCouponLoading(true);
            const payload = {
                coupon_code: storeCouponForm?.store_coupon_code,
                vendor_id: currentVendor?.vendor_id,
            };
            
            const res = await postAPIAuth("user/check-coupon-for-product", payload);
            if (res.status === 200) {
                setStoreCouponLoading(false);
                // No address_id needed for cart items
                getCartItems();
                const data = wallet ? "1" : "0";
                // No address_id needed in cart page
                getCartDetails(data, null, voucherDetails?.discount);
                setStoreCouponError("");
                addToast(res?.data?.message, {
                    appearance: "success",
                    autoDismiss: true,
                });
            }
        } catch (error) {
            setStoreCouponLoading(false);
            setStoreCouponError(error?.response?.data.message || "Failed to apply store coupon");
            addToast(error?.response?.data.message || error, {
                appearance: "error",
                autoDismiss: true,
            });
            console.log("error", error?.response?.data.message || error);
        }
    };

    const handleStoreCouponRemove = async () => {
        if (!token || !isSingleVendor || !currentVendor) {
            return;
        }
        
        try {
            setStoreCouponLoading(true);
            const payload = {
                coupon_code: storeCouponForm?.store_coupon_code || currentVendor?.vendor_coupon?.coupon_data?.coupon_code,
                vendor_id: currentVendor?.vendor_id,
            };
            
            const res = await postAPIAuth("user/remove-coupon-for-product", payload);
            if (res.status === 200) {
                setStoreCouponLoading(false);
                // No address_id needed for cart items
                getCartItems();
                const data = wallet ? "1" : "0";
                // No address_id needed in cart page
                getCartDetails(data, null, voucherDetails?.discount);
                setStoreCouponForm({store_coupon_code: ""});
                setStoreCouponError("");
                addToast(res?.data?.message, {
                    appearance: "success",
                    autoDismiss: true,
                });
            }
        } catch (error) {
            setStoreCouponLoading(false);
            addToast(error?.response?.data.message || error, {
                appearance: "error",
                autoDismiss: true,
            });
            console.log("error", error?.response?.data.message || error);
        }
    };

    // Initialize store coupon form when vendor has coupon applied
    useEffect(() => {
        if (isSingleVendor && currentVendor?.vendor_coupon?.coupon_data?.coupon_code) {
            setStoreCouponForm({
                store_coupon_code: currentVendor.vendor_coupon.coupon_data.coupon_code
            });
        }
    }, [isSingleVendor, currentVendor]);

    useEffect(() => {
        const data = localStorage.getItem("voucherDetails");
        if (data) {
            const voucherDetails = JSON.parse(data);
            const updatedVoucherDetails = {
                ...voucherDetails,
                discount: parseInt(voucherDetails.discount, 10)
            };
            setVoucherDetails(updatedVoucherDetails);
            setFormValues({voucher_code: voucherDetails?.voucherCode});
        }
    }, [])

    const [cartLoading, setCartLoading] = useState(true); // Default to loading

    // ... (existing code)

    // Initialize cart when component mounts
    useEffect(() => {
        if (token) {
            setCartLoading(true);
            // No address_id needed for initial cart load
            getCartItems().finally(() => setTimeout(() => setCartLoading(false), 500)); // Add small delay for smoothness
        } else {
             setCartLoading(false);
        }
    }, [token]);

    return (
        <>
            <div>
                <Snackbar
                    open={snackOpen}
                    autoHideDuration={3000}
                    onClose={sanckClose}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                    action={action}
                >
                    <Alert
                        onClose={sanckClose}
                        severity="success"
                        variant="filled"
                        sx={{width: "100%", color: "white", fontWeight: "600"}}
                    >
                        Product Add To WishList!
                    </Alert>
                </Snackbar>
            </div>

            {cartLoading ? (
                <CartShimmerLoader />
            ) : (
                <>
            <Container py={5} sx={{padding: "30px 0"}}>
                <Grid container spacing={4}>
                    <Grid item lg={12} xs={12}>
                        <Typography component="div" pb={1} fontSize={20} fontWeight={600}>
                            {state?.cart?.length || 0} items in your cart
                        </Typography>
                        <Box
                            sx={{
                                background: "#ccebff",
                                display: "flex",
                                alignItems: "center",
                                borderRadius: "5px",
                            }}
                            p={1}
                        >
                            <Typography component="span">
                                <svg
                                    stroke="currentColor"
                                    fill="#2b3445"
                                    stroke-width="0"
                                    viewBox="0 0 24 24"
                                    height="30px"
                                    width="30px"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path
                                        d="M12.22 19.85c-.18.18-.5.21-.71 0a.504.504 0 0 1 0-.71l3.39-3.39-1.41-1.41-3.39 3.39c-.19.2-.51.19-.71 0a.504.504 0 0 1 0-.71l3.39-3.39-1.41-1.41-3.39 3.39c-.18.18-.5.21-.71 0a.513.513 0 0 1 0-.71l3.39-3.39-1.42-1.41-3.39 3.39c-.18.18-.5.21-.71 0a.513.513 0 0 1 0-.71L9.52 8.4l1.87 1.86c.95.95 2.59.94 3.54 0 .98-.98.98-2.56 0-3.54l-1.86-1.86.28-.28c.78-.78 2.05-.78 2.83 0l4.24 4.24c.78.78.78 2.05 0 2.83l-8.2 8.2zm9.61-6.78a4.008 4.008 0 0 0 0-5.66l-4.24-4.24a4.008 4.008 0 0 0-5.66 0l-.28.28-.28-.28a4.008 4.008 0 0 0-5.66 0L2.17 6.71a3.992 3.992 0 0 0-.4 5.19l1.45-1.45a2 2 0 0 1 .37-2.33l3.54-3.54c.78-.78 2.05-.78 2.83 0l3.56 3.56c.18.18.21.5 0 .71-.21.21-.53.18-.71 0L9.52 5.57-3.72 15.36c-.98.97-.98 2.56 0 3.54.39.39.89.63 1.42.7a2.458 2.458 0 0 0 2.12 2.12 2.458 2.458 0 0 0 2.12 2.12c.07.54.31 1.03.7 1.42.47.47 1.1.73 1.77.73.67 0 1.3-.26 1.77-.73l8.21-8.19z"></path>
                                </svg>
                            </Typography>
                            <Typography component="span" pl={1}>
                                <Typography component="big" fontWeight={600}>
                                    Buy confidently
                                </Typography>{" "}
                                with Agukart's Purchase Protection programme for buyers, get a full
                                refund in the rare case your item doesn't arrive, arrives
                                damaged, or isn't as described.{" "}
                                <Link
                                    component={NextLink}
                                    href="/"
                                    style={{textDecoration: "underline"}}
                                >
                                    See eligibility
                                </Link>{" "}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            <Container py={5} sx={{padding: "30px 0"}}>
                <Grid container spacing={4}>
                    <Grid item lg={8} md={7} xs={12}>
                        <Box sx={{padding: "18px"}}>
                            {state?.cart?.length === 0 ? (
                                <Box
                                    sx={{
                                        width: "100%",
                                        height: "200px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            textAlign: "center",
                                            fontSize: "24px",
                                            fontWeight: "600",
                                        }}
                                    >
                                        No item Available In Cart
                                    </Typography>
                                </Box>
                            ) : (
                                state?.cart?.map((cart, index) => {
                                    return (
                                        <SingleVendorCart key={index} wallet={wallet} cart={cart}
                                                          defaultAddress={null} // No address needed in cart page
                                                          voucherDetails={voucherDetails}
                                                          isSingleVendor={isSingleVendor}/>
                                    );
                                })
                            )}
                        </Box>
                    </Grid>
                    <Grid item lg={4} md={5} xs={12}>
                        <Box>
                            <Typography component="div">
                                <Box pt={1}>
                                    <TableContainer
                                        component={Paper}
                                        sx={{background: "none", boxShadow: "none"}}
                                    >
                                        <Table
                                            size="small"
                                            aria-label="a dense table"
                                            sx={{
                                                minWidth: 300,
                                            }}
                                        >
                                            <TableBody>
                                                <TableRow>
                                                    {
                                                        token &&
                                                        <>
                                                            <TableCell>
                                                                <Typography
                                                                    fontSize={17}
                                                                    fontWeight={600}
                                                                    component="div"
                                                                >
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Checkbox
                                                                                checked={wallet}
                                                                                onChange={handleWalletChange}
                                                                                inputProps={{"aria-label": "Wallet Balance Checkbox"}}
                                                                            />
                                                                        }
                                                                        label={
                                                                            <Typography sx={{ml: 2, fontWeight: "600"}}>
                                                                                Gift Card Wallet Balance
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography fontSize={17} component="div">
                                                                    {currency?.symbol}{(+usercredentials?.wallet_balance * currency?.rate).toFixed(2)}
                                                                </Typography>
                                                            </TableCell>
                                                        </>
                                                    }
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>
                                                        <Typography
                                                            fontSize={17}
                                                            fontWeight={600}
                                                            component="div"
                                                        >
                                                            Item(s) total
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontSize={17} component="div">
                                                            {currency?.symbol}{(derivedCartTotals.itemTotal * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow
                                                    sx={{
                                                        ".css-1lgfklb-MuiTableCell-root": {
                                                            borderBottom: "1px solid #b9b9b9 !important",
                                                        },
                                                        ".css-grvakg-MuiTableCell-root": {
                                                            borderBottom: "1px solid #b9b9b9 !important",
                                                        },
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography
                                                            fontSize={17}
                                                            fontWeight={600}
                                                            component="div"
                                                        >
                                                            Shop Discount
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontSize={17} component="div">
                                                            - {currency?.symbol}{(derivedCartTotals.shopDiscount * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                {derivedCartTotals.couponDiscount > 0 && (
                                                    <TableRow>
                                                    <TableCell>
                                                        <Typography fontSize={17} fontWeight={600} component="div">
                                                            Coupon Discount
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontSize={17} component="div">
                                                            - {currency?.symbol}{(derivedCartTotals.couponDiscount * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    </TableRow>
                                                )}
                                                {
                                                    state?.voucherDiscount > 0 &&
                                                    <TableRow>
                                                        <TableCell>
                                                            <Typography
                                                                fontSize={17}
                                                                fontWeight={600}
                                                                component="div"
                                                            >
                                                                Voucher Discount
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontSize={17} component="div">
                                                                - {currency?.symbol}{(state?.voucherDiscount * currency?.rate).toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                }

                                                {/* VOUCHER INPUT FIELD */}
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection: {xs: "column", sm: "row"},
                                                                alignItems: "center",
                                                                gap: {xs: 1, sm: 2},
                                                                backgroundColor: "#fff",
                                                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                                                padding: "8px 16px",
                                                                height: {xs: "auto", sm: "56px"},
                                                            }}
                                                        >
                                                            <TextField
                                                                fullWidth
                                                                placeholder="Enter voucher code"
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    mr: {xs: 0, sm: 2},
                                                                    mb: {xs: 1, sm: 0},
                                                                    ".MuiOutlinedInput-root": {
                                                                        background: "#f5f5f5",
                                                                    },
                                                                    ".MuiOutlinedInput-notchedOutline": {
                                                                        border: "none",
                                                                    },
                                                                }}
                                                                value={formValues?.voucher_code}
                                                                name="voucher_code"
                                                                onChange={handleChange}
                                                                error={Boolean(errors.voucher_code)}
                                                                disabled={voucherDetails?.voucherCode !== ""}
                                                            />
                                                            <Button
                                                                endIcon={applyinCoupon ?
                                                                    <CircularProgress size={15}/> : null}
                                                                variant="contained"
                                                                color="primary"
                                                                size="small"
                                                                disabled={applyinCoupon}
                                                                sx={{
                                                                    borderRadius: "20px",
                                                                    textTransform: "none",
                                                                    px: 3,
                                                                    minWidth: "auto",
                                                                    width: {xs: "100%", sm: "auto"},
                                                                }}
                                                                onClick={voucherDetails?.voucherCode == 0 ? handleApply : handleRemove}
                                                            >
                                                                {voucherDetails?.voucherCode == 0 ? "Apply" : "Remove"}
                                                            </Button>
                                                        </Box>
                                                        {errors?.voucher_code && (
                                                            <Typography color="error" fontSize={13} mt={0.5} ml={1}>
                                                                {errors.voucher_code}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                <TableRow>
                                                    <TableCell>
                                                        <Typography
                                                            fontSize={17}
                                                            fontWeight={600}
                                                            component="div"
                                                        >
                                                            Sub total
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontSize={17} component="div">
                                                            {currency?.symbol}{(derivedCartTotals.subTotal * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>
                                                        <Typography
                                                            fontSize={17}
                                                            fontWeight={600}
                                                            component="div"
                                                        >
                                                            Delivery
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography fontSize={17} component="div">
                                                            {currency?.symbol}{(state?.delivery * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow
                                                    sx={{
                                                        ".css-1s4dqu5-MuiTableCell-root": {
                                                            borderBottom: "1px solid #b9b9b9 !important",
                                                        },
                                                        ".css-7w4gq6-MuiTableCell-root": {
                                                            borderBottom: "1px solid #b9b9b9 !important",
                                                        },
                                                    }}
                                                >
                                                    <TableCell
                                                        colSpan={2}
                                                        sx={{padding: "0 16px 6px 16px"}}
                                                    >
                                                            <Box onClick={() => setCountryModalOpen(true)} sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer" }}>
                                                                <LocationOnIcon sx={{ fontSize: 16, color: "gray" }} />
                                                                <Typography
                                                                    fontSize={14}
                                                                    color={"gray"}
                                                                    fontStyle={"italic"}
                                                                    component="div"
                                                                    style={{
                                                                        textDecoration: "underline",
                                                                        textUnderlineOffset: 2
                                                                    }}
                                                                >
                                                                    Deliver to {location.countryName}
                                                                </Typography>
                                                            </Box>

                                                    </TableCell>
                                                </TableRow>
                                                {
                                                    token && <TableRow
                                                        sx={{
                                                            ".css-1lgfklb-MuiTableCell-root": {
                                                                borderBottom: "1px solid #b9b9b9 !important",
                                                            },
                                                            ".css-grvakg-MuiTableCell-root": {
                                                                borderBottom: "1px solid #b9b9b9 !important",
                                                            },
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Typography
                                                                fontSize={17}
                                                                fontWeight={600}
                                                                component="div"
                                                            >
                                                                Wallet
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography fontSize={17} component="div">
                                                                -{currency?.symbol}{(state?.walletAmount * currency?.rate).toFixed(2)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                }
                                                <TableRow>
                                                    <TableCell>
                                                        <Typography
                                                            fontSize={17}
                                                            fontWeight={600}
                                                            component="div"
                                                        >
                                                            Total({state?.cart?.length} items)
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography
                                                            fontSize={17}
                                                            fontWeight={600}
                                                            component="div"
                                                        >
                                                            {currency?.symbol}{((derivedCartTotals.subTotal + (state?.delivery || 0) + (state?.walletAmount || 0) - (state?.voucherDiscount || 0)) * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                                {state.cart.length > 0 ? (
                                    <Typography component="div" textAlign={"center"} pt={1}>
                                        <Button
                                            onClick={handleClickconfirmation}
                                            disabled={checkCustomizationSelect || isShippingAvailable || isStockAvailable || isDeleteProduct || isAvailable}
                                            variant="contained"
                                            sx={{
                                                margin: "0 auto",
                                                background: "#000",
                                                color: "#fff",
                                                padding: "8px 50px",
                                                fontSize: "16px",
                                                borderRadius: "25px",
                                                "&:hover": {
                                                    background: "#323232",
                                                },
                                            }}
                                        >
                                            Proceed to checkout
                                        </Button>
                                        
                                        {/* Disable Reasons */}
                                        <Box mt={2}>
                                            {checkCustomizationSelect && (
                                                <Typography color="error" variant="body2" sx={{ mb: 0.5 }}>
                                                    • Please complete customization for all items.
                                                </Typography>
                                            )}
                                            {isShippingAvailable && (
                                                <Typography color="error" variant="body2" sx={{ mb: 0.5 }}>
                                                    • Shipping is not available for one or more items in your cart.
                                                </Typography>
                                            )}
                                            {isStockAvailable && (
                                                <Typography color="error" variant="body2" sx={{ mb: 0.5 }}>
                                                    • Some items are out of stock. Please remove them to proceed.
                                                </Typography>
                                            )}
                                            {isDeleteProduct && (
                                                <Typography color="error" variant="body2" sx={{ mb: 0.5 }}>
                                                    • Some items are no longer available (deleted). Please remove them.
                                                </Typography>
                                            )}
                                            {isAvailable && (
                                                <Typography color="error" variant="body2" sx={{ mb: 0.5 }}>
                                                    • Some items are currently unavailable/inactive.
                                                </Typography>
                                            )}
                                        </Box>
                                    </Typography>
                                ) : (
                                    ""
                                )}

                                <React.Fragment>
                                    <Dialog
                                        open={confirmation}
                                        onClose={handleClose}
                                        aria-labelledby="alert-dialog-title"
                                        aria-describedby="alert-dialog-description"
                                    >
                                        <DialogTitle id="alert-dialog-title">
                                            Are Want To Proceed To Checkout Page
                                        </DialogTitle>
                                        <DialogActions>
                                            <Button onClick={handleClose}>Disagree</Button>
                                            <Button
                                                onClick={() => {
                                                    if (!token) {
                                                        router.push("/login");
                                                        return;
                                                    }
                                                    setPlaceOrderValidate(true);
                                                    const vendorIds = state?.cart?.map((item) => item?.vendor_id);
                                                    const queryString = new URLSearchParams(
                                                        vendorIds.map((id) => ["id", id])
                                                    ).toString();
                                                    router.push(`/delivery-address?${queryString}`);
                                                }}
                                                autoFocus
                                            >
                                                Agree
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </React.Fragment>

                                {state.cart.length > 0 ? (
                                    <Typography component="div" mt={3}>
                                        <Typography color={"gray"}>
                                            Local taxes included (where applicable)
                                        </Typography>
                                        <Typography pt={1} color={"gray"}>
                                            *Additional duties and taxes{" "}
                                            <Typography
                                                variant="span"
                                                sx={{textDecoration: "underline"}}
                                            >
                                                <Link component={NextLink} href="/">
                                                    may apply
                                                </Link>
                                            </Typography>{" "}
                                        </Typography>
                                    </Typography>
                                ) : (
                                    ""
                                )}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
                </>
            )}
            <CountryModal
                open={countryModalOpen}
                onClose={() => setCountryModalOpen(false)}
                countries={countries}
                currentCountry={location.countryName}
                onCountrySelect={handleCountrySelect}
            />
        </>
    );
}

const CartShimmerLoader = () => {
    return (
        <Container py={5} sx={{padding: "30px 0"}}>
            <Grid container spacing={4}>
                <Grid item lg={12} xs={12}>
                    <Skeleton variant="text" width="30%" height={40} sx={{mb: 2}}/>
                    <Skeleton variant="rectangular" height={80} sx={{borderRadius: 1}}/>
                </Grid>
            </Grid>

            <Container py={5} sx={{padding: "30px 0"}}>
                <Grid container spacing={4}>
                    <Grid item lg={8} md={7} xs={12}>
                        <Box sx={{padding: "18px"}}>
                            {[...Array(2)].map((_, index) => (
                                <Box key={index} sx={{mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 2}}>
                                    <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                                        <Skeleton variant="circular" width={40} height={40}/>
                                        <Skeleton variant="text" width="40%" height={30} sx={{ml: 2}}/>
                                    </Box>
                                    {[...Array(2)].map((_, productIndex) => (
                                        <Box key={productIndex} sx={{display: "flex", mb: 2, p: 1}}>
                                            <Skeleton variant="rectangular" width={80} height={80} sx={{mr: 2}}/>
                                            <Box sx={{flex: 1}}>
                                                <Skeleton variant="text" width="80%" height={20}/>
                                                <Skeleton variant="text" width="60%" height={20} sx={{mt: 1}}/>
                                                <Skeleton variant="text" width="40%" height={20} sx={{mt: 1}}/>
                                            </Box>
                                            <Skeleton variant="circular" width={30} height={30}/>
                                        </Box>
                                    ))}
                                    <Box sx={{mt: 2, pt: 2, borderTop: "1px solid #e0e0e0"}}>
                                        <Skeleton variant="text" width="50%" height={20}/>
                                        <Skeleton variant="text" width="30%" height={20} sx={{mt: 1}}/>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    <Grid item lg={4} md={5} xs={12}>
                        <Box>
                            <Skeleton variant="text" width="40%" height={30} sx={{mb: 2}}/>
                            {[...Array(6)].map((_, index) => (
                                <Box key={index} sx={{display: "flex", justifyContent: "space-between", mb: 2}}>
                                    <Skeleton variant="text" width="40%" height={25}/>
                                    <Skeleton variant="text" width="20%" height={25}/>
                                </Box>
                            ))}
                            <Box sx={{mb: 2}}>
                                <Skeleton variant="rectangular" height={56} sx={{borderRadius: 1}}/>
                            </Box>
                            <Skeleton variant="rectangular" height={50} sx={{borderRadius: 25, mt: 2}}/>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

        </Container>
    );
};

export default Mycart;
