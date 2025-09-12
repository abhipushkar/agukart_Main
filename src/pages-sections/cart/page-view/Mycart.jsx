"use client";
import {notFound} from "next/navigation";
import Link from "next/link";

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
// import Accordion from "components/page-sidenav/side-navbar/components/nav-accordion";
import Accordion from "@mui/material/Accordion";
import {useToasts} from "react-toast-notifications";
import {PLACE_ORDER_VALIDATION} from "constant";
import {useState} from "react";
import {fontSize} from "theme/typography";
import useMyProvider from "hooks/useMyProvider";
import SingleVendorCart from "./SingleVendorCart";
import {useCurrency} from "contexts/CurrencyContext";
import {set} from "lodash";
import AddressChangePopup from "./AddressChangePopup";

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
    const [defaultAddress, setDefaultAddress] = useState({});
    const [allAddress, setAllAddress] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [applyinCoupon, setCouponApplying] = useState(false);
    const [fetchingAddress, setFetchingAddress] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        voucher_code: "",
    });
    const [voucherDetails, setVoucherDetails] = useState({discount: 0, voucherCode: ""});
    const [errors, setErrors] = useState({voucher_code: ""});
    const router = useRouter();
    console.log(state, "helloooooooooooooo");
    console.log(checkCustomizationSelect, isShippingAvailable, isStockAvailable, isDeleteProduct, isAvailable, "grghr4ghrr")

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormValues((prev) => ({...prev, [name]: value}));
        setErrors((prv) => ({...prv, [name]: ""}));
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

    const [confirmation, setconfirmation] = React.useState(false);

    const handleWalletChange = async (e) => {
        setWallet(e.target.checked);
        const data = !wallet ? "1" : "0";
        getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
    }

    const handleClickconfirmation = () => {
        if (allAddress.length == 0) {
            handleAddressChnage();
        } else {
            setconfirmation(true);
        }
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

    function calculateOffset(currentPage) {
        // console.log({currentPage, limit});
        return currentPage - 1;
    }

    const getAddressData = async () => {
        try {
            setFetchingAddress(true)
            const offset = calculateOffset(currentPage);
            const res = await getAPIAuth(
                `user/get-address?limit=${5}&offset=${offset}`,
                token
            );

            console.log("getAddressData response", res);

            if (res.status == 200) {
                setAllAddress(res?.data?.addresses);

                // Find default address or use the first one as fallback
                const defaultAddr = res?.data?.addresses?.find((item) => item.default == "1") ||
                    res?.data?.addresses?.[0] ||
                    {};

                setDefaultAddress(defaultAddr);

                // If no default address exists but we have addresses, set the first one as default
                if (res?.data?.addresses?.length > 0 && !defaultAddr._id) {
                    // You might want to automatically set the first address as default via API
                    console.log("No default address found, using first address");
                }
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setFetchingAddress(false);
        }
    };

    useEffect(() => {
        if (token) {
            getAddressData();
        }
    }, [])
    useEffect(() => {
        if (token) {
            getCartItems(defaultAddress?._id);
            const data = wallet ? "1" : "0";
            getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
        }
    }, [token, defaultAddress]);

    useEffect(() => {
        localStorage.setItem("wallet", wallet);
    }, [wallet]);

    useEffect(() => {
        if (token) {
            getUserDetail();
        }
    }, [])

    useEffect(() => {
        if (token && defaultAddress?._id) {
            const walletdata = wallet ? "1" : "0";
            getCartDetails(walletdata, defaultAddress._id, voucherDetails?.discount);
        }
    }, [defaultAddress, token]);

    const handleAddressChnage = () => {
        if (!token) {
            return router.push("/login");
        }
        setModalOpen(true);
    }

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
                if (!token) {
                    return router.push("/login");
                }
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
                    // getCartItems(defaultAddress?._id);
                    const walletdata = wallet ? "1" : "0";
                    getCartDetails(walletdata, defaultAddress?._id, res?.data?.discount);
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
        getCartDetails(walletdata, defaultAddress?._id, 0);
        addToast("Voucher removed successfully", {
            appearance: "success",
            autoDismiss: true,
        });
    };

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

    if (fetchingAddress) return <CartShimmerLoader/>

    return (
        <>
            <div>
                {/* <Button onClick={handleSnackClick}>Open Snackbar</Button> */}
                <Snackbar
                    open={snackOpen}
                    autoHideDuration={3000}
                    onClose={sanckClose}
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}} // Position at bottom right
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

            <Container py={5} sx={{padding: "30px 0"}}>
                <Grid container spacing={4}>
                    <Grid item lg={12} xs={12}>
                        <Typography component="div" pb={1} fontSize={20} fontWeight={600}>
                            {state?.cart?.length} items in your cart
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
                                        d="M12.22 19.85c-.18.18-.5.21-.71 0a.504.504 0 0 1 0-.71l3.39-3.39-1.41-1.41-3.39 3.39c-.19.2-.51.19-.71 0a.504.504 0 0 1 0-.71l3.39-3.39-1.41-1.41-3.39 3.39c-.18.18-.5.21-.71 0a.513.513 0 0 1 0-.71l3.39-3.39-1.42-1.41-3.39 3.39c-.18.18-.5.21-.71 0a.513.513 0 0 1 0-.71L9.52 8.4l1.87 1.86c.95.95 2.59.94 3.54 0 .98-.98.98-2.56 0-3.54l-1.86-1.86.28-.28c.78-.78 2.05-.78 2.83 0l4.24 4.24c.78.78.78 2.05 0 2.83l-8.2 8.2zm9.61-6.78a4.008 4.008 0 0 0 0-5.66l-4.24-4.24a4.008 4.008 0 0 0-5.66 0l-.28.28-.28-.28a4.008 4.008 0 0 0-5.66 0L2.17 6.71a3.992 3.992 0 0 0-.4 5.19l1.45-1.45a2 2 0 0 1 .37-2.33l3.54-3.54c.78-.78 2.05-.78 2.83 0l3.56 3.56c.18.18.21.5 0 .71-.21.21-.53.18-.71 0L9.52 5.57l-5.8 5.79c-.98.97-.98 2.56 0 3.54.39.39.89.63 1.42.7a2.458 2.458 0 0 0 2.12 2.12 2.458 2.458 0 0 0 2.12 2.12c.07.54.31 1.03.7 1.42.47.47 1.1.73 1.77.73.67 0 1.3-.26 1.77-.73l8.21-8.19z"></path>
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
                                                          defaultAddress={defaultAddress}
                                                          voucherDetails={voucherDetails}/>
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
                                                            {currency?.symbol}{(+state?.total * currency?.rate).toFixed(2)}
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
                                                            - {currency?.symbol}{(+state?.shopDiscount * currency?.rate).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
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
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        {token && defaultAddress?._id && (
                                                            <Box sx={{
                                                                mb: 3,
                                                                p: 2,
                                                                width: "100%",
                                                                border: "1px solid #e0e0e0",
                                                                borderRadius: 1
                                                            }}>
                                                                <Typography variant="subtitle1" fontWeight={600}
                                                                            gutterBottom>
                                                                    Delivery Address
                                                                </Typography>
                                                                <Box sx={{
                                                                    p: 1.5,
                                                                    backgroundColor: "#f9f9f9",
                                                                    borderRadius: 1
                                                                }}>
                                                                    <Typography fontWeight={600}>
                                                                        {defaultAddress?.first_name} {defaultAddress?.last_name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {defaultAddress?.address_line1}
                                                                        {defaultAddress?.address_line2 && `, ${defaultAddress?.address_line2}`}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {defaultAddress?.city}, {defaultAddress?.state}, {defaultAddress?.country} - {defaultAddress?.pincode}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Phone: {defaultAddress?.mobile}
                                                                    </Typography>
                                                                </Box>
                                                                <Button
                                                                    variant="text"
                                                                    size="small"
                                                                    onClick={handleAddressChnage}
                                                                    sx={{mt: 1, color: "primary.main", fontWeight: 600}}
                                                                >
                                                                    Change Address
                                                                </Button>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

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
                                                                // disabled={voucherDetails?.voucherCode !== 0}
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
                                                            {currency?.symbol}{(state?.subTotal * currency?.rate).toFixed(2)}
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
                                                        <Typography
                                                            fontSize={14}
                                                            color={"gray"}
                                                            component="div"
                                                            sx={{cursor: "pointer"}}
                                                            onClick={handleAddressChnage}
                                                        >
                                                            {/* (To India) */}
                                                            (Change Delivery Address)
                                                        </Typography>
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
                                                            {currency?.symbol}{((state?.superTotal) * currency?.rate).toFixed(2)}
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
            {isModalOpen && (
                <AddressChangePopup
                    open={isModalOpen}
                    onClose={() => {
                        setModalOpen(false);
                    }}
                    getAddressData={getAddressData}
                    allAddress={allAddress}
                    defaultAddress={defaultAddress}
                    setDefaultAddress={setDefaultAddress} // This should trigger the useEffect above
                />
            )}
        </>
    );
}

// Add this before the main Mycart component
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
                                    {/* Vendor header */}
                                    <Box sx={{display: "flex", alignItems: "center", mb: 2}}>
                                        <Skeleton variant="circular" width={40} height={40}/>
                                        <Skeleton variant="text" width="40%" height={30} sx={{ml: 2}}/>
                                    </Box>

                                    {/* Product items */}
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

                                    {/* Shipping and total */}
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
                            {/* Summary section */}
                            <Skeleton variant="text" width="40%" height={30} sx={{mb: 2}}/>

                            {[...Array(6)].map((_, index) => (
                                <Box key={index} sx={{display: "flex", justifyContent: "space-between", mb: 2}}>
                                    <Skeleton variant="text" width="40%" height={25}/>
                                    <Skeleton variant="text" width="20%" height={25}/>
                                </Box>
                            ))}

                            {/* Voucher section */}
                            <Box sx={{mb: 2}}>
                                <Skeleton variant="rectangular" height={56} sx={{borderRadius: 1}}/>
                            </Box>

                            {/* Checkout button */}
                            <Skeleton variant="rectangular" height={50} sx={{borderRadius: 25, mt: 2}}/>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Container>
    );
};

export default Mycart;
