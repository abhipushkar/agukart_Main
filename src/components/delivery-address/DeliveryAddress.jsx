"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  DialogActions,
  DialogTitle,
  CircularProgress,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Stack,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import Paper from "@mui/material/Paper";
import NextLink from "next/link";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-phone-input-2/lib/style.css";
import parsePhoneNumberFromString from "libphonenumber-js";
import {
  getAPI,
  getAPIAuth,
  postAPI,
  postAPIAuth,
} from "utils/__api__/ApiServies";
import useMyProvider from "hooks/useMyProvider";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";
import useSales from "pages-sections/sales/use-sales";
import { useRouter, useSearchParams } from "next/navigation";
import { PLACE_ORDER_VALIDATION } from "constant";
import useCart from "hooks/useCart";
import { useCurrency } from "contexts/CurrencyContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import Checkout from "./Checkout";

const DeliveryAddress = () => {
  const initialOptions = {
    "client-id": "AYKXmGSaIYk_P8R1brliTpBwrpi2hA8y5yulQMmi4XLByhWw1rvfdtoefzWkm0nUvSQ86123jZYOuaWq",
    currency: "USD",
    intent: "capture",
  };
  // modal popup message
  const { currency } = useCurrency();
  const [wallet, setWallet] = useState(false);
  const [openPopup, SetOpenPopup] = useState(false);
  const [code, setCountryCode] = useState("in");
  const [getState, setGetState] = useState([]);
  const [getCountry, setGetCountry] = useState([]);
  const [getCities, setGetCities] = useState([]);
  const [statevalue, setStateValue] = useState("");
  const [countryvalue, setCountryValue] = useState("");
  const [allAddress, setAllAddress] = useState([]);
  const [currentlimitPage, setCurrentLimitPage] = useState(1);
  const { usercredentials, setUserCredentials, setAddressCount } = useMyProvider();
  const [loading, setLoading] = useState(false);
  const { getCartItems, state, getCartDetails } = useCart();
  const [tottalPage, setTottalPage] = useState();
  const [addressIndex, setAddressIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editAddress, setEditAddress] = useState(null);
  const [deleteAddressPopup, setDeleteAddressPopup] = useState(false);
  const [deleteAddressId, setDeleteAddressId] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);
  const { token, placeOrderValidate, setPlaceOrderValidate } = useAuth();
  const [paymentType,setPaymentType] = useState("1");
  const [voucherDetails,setVoucherDetails] = useState({amount:0,voucherCode:""});
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.getAll("id"); 
  console.log(ids,"rth5rthrthrt")

  console.log(ids); 

  const { addToast } = useToasts();

  const handleWalletChange = async (e) => {
    setWallet(e.target.checked);
    const data = !wallet ? "1" : "0";
    getCartDetails(data,allAddress[addressIndex]?._id,voucherDetails?.discount);
  };

  useEffect(() => {
    localStorage.setItem("wallet", wallet);
  }, [wallet]);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string(), // Optional field
    address1: Yup.string().required("Address 1 is required"),
    address2: Yup.string(), // Optional field
    country: Yup.object().required("Country is required"),
    state: Yup.object().required("State is required"),
    city: Yup.object().required("City is required"),
    pincode: Yup.string().required("Pincode is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .test("is-valid-phone", "Invalid phone number", function (value) {
        if (value && code) {
          const phoneNumber = parsePhoneNumberFromString(
            value,
            code.toUpperCase()
          );
          return phoneNumber && phoneNumber.isValid();
        }
        return false;
      }),
  });

  const handleClickPopup = () => {
    SetOpenPopup(true);
  };

  const handleClosePopup = () => {
    SetOpenPopup(false);
  };

  const splitCountryCode = (number) => {
    // Ensure the number includes a '+'
    if (!number.startsWith("+")) {
      number = `+${number}`;
    }
    console.log("Input number:", number); // Log the input number

    try {
      const phoneNumber = parsePhoneNumberFromString(number);
      console.log("Parsed phone number:", phoneNumber); // Log the parsed phone number
      if (phoneNumber) {
        return {
          countryCode: phoneNumber.countryCallingCode,
          phoneNumber: phoneNumber.nationalNumber,
        };
      }
    } catch (error) {
      console.error("Error parsing phone number:", error.message);
    }

    return {
      countryCode: "",
      phoneNumber: number,
    };
  };

  const getPostCode = async (pincode, city) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&format=json`
      );
      const data = await res.json();

      const find = data.find((obj) => {
        return (
          obj.display_name.includes(city) && obj.display_name.includes(pincode)
        );
      });

      if (find) {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (values, resetForm) => {
    const { countryCode, phoneNumber } = splitCountryCode(values?.phone);
    try {
      setButtonDisable(true);

      const param = {
        _id: editAddress?._id ? editAddress?._id : `new`,
        first_name: `${values.firstName}`,
        last_name: `${values.lastName}`,
        mobile: `${phoneNumber}`,
        email: `${usercredentials.email}`,
        phone_code: `+${countryCode}`,
        address_line1: `${values.address1}`,
        address_line2: `${values.address2}`,
        state: `${values?.state?.name}`,
        city: `${values?.city?.name}`,
        country: `${values?.country?.name}`,
        pincode: `${values?.pincode}`,
        default: values.setAsDefault ? "1" : "0",
      };

      // const check = await getPostCode(values.pincode, values?.city?.name);

      // if (check) {
        const res = await postAPIAuth(
          "user/add-address",
          param,
          token,
          addToast
        );
        console.log("ressqwertyu", res);
        if ((res.status = 200)) {
          addToast(res?.data?.message, {
            appearance: "success",
            autoDismiss: true,
          });
          getAddressData();
          handleClosePopup();
          setEditAddress(null);
          setButtonDisable(false);
          resetForm();
        }
      // } else {
      //   addToast("Please Enter Valid Pin Code", {
      //     appearance: "error",
      //     autoDismiss: true,
      //   });
      // }
    } catch (error) {
      setButtonDisable(false);
      console.log("errorr", error);
    } finally {
      setButtonDisable(false);
    }
  };

  const getCountryData = async () => {
    try {
      const res = await getAPI("get-country");
      console.log("resresresres", res);
      if (res.status == 200) {
        setGetCountry(res?.data?.contryList);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  const getStateData = async () => {
    try {
      const param = {
        country_id: `${countryvalue}`,
      };
      const res = await postAPI("get-states", param);
      console.log("resresresresresresresresresres", res);
      if (res.status == 200) {
        setGetCities([]);
        setGetState(res?.data?.stateList);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  const getCitiesData = async () => {
    console.log("1");
    try {
      const param = {
        state_id: `${statevalue}`,
      };
      const res = await postAPI("/get-city-by-id", param);
      if (res.status == 200) {
        setGetCities(res?.data?.result);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  useEffect(() => {
    if (!placeOrderValidate) {
      router.push("/");
    }
    getStateData();
  }, [countryvalue]);
  useEffect(() => {
    getCitiesData();
  }, [statevalue]);

  function calculateOffset(currentPage) {
    // console.log({currentPage, limit});
    return currentPage - 1;
  }

  const getAddressData = async () => {
    const offset = calculateOffset(currentPage);

    try {
      const res = await getAPIAuth(
        `user/get-address?limit=${`${5}`}&offset=${offset}`,
        token
      );
      console.log("getprofileres", res);
      if (res.status == 200) {
        setAllAddress(res?.data?.addresses);
        // res?.data?.addresses
        setTottalPage(res?.data?.totalPages);
        setCurrentLimitPage(res?.data?.addressLength);
        setAddressCount(res?.data?.addressLength);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  useEffect(() => {
    getCountryData();
    if (token) {
      getAddressData();
    }
  }, [token]);

  const editHandler = (address) => {
    setEditAddress(address);
    SetOpenPopup(true);
  };

  const deleteAddressHandler = async (id) => {
    try {
      const param = {
        address_id: `${id}`,
      };
      const res = await postAPIAuth(
        "user/delete-address",
        param,
        token,
        addToast
      );
      if ((res.status = 200)) {
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
        setDeleteAddressId("");
        setDeleteAddressPopup(false);
        getAddressData();
      }
    } catch (error) {
      console.log("errorr", error);
    }
  };

  const orderConfirmation = async () => {
    try {
      setLoading(true);
      
      const payload = {
        address_id: allAddress[addressIndex]?._id,
        shop_count: ids?.length > 0 ? ids?.length : state?.cart?.length || 1,
        voucher_id:voucherDetails?._id || null,
        voucher_discount:voucherDetails?.discount,
        wallet: localStorage.getItem("wallet") == "true" ? "1" : "0",
      };

      if (ids.length === 1) {
        payload.vendor_id = ids[0];
      }

      const res = await postAPIAuth(
        "user/checkout",
        payload,
        token,
        addToast
      );

      if (res.status === 200) {
        setUserCredentials(res?.data?.updateUser);
        setVoucherDetails({discount:0,voucherCode:""});
        localStorage.removeItem("voucherDetails");
        getCartItems();
        addToast(res.data.message, {
          appearance: "success",
          autoDismiss: true,
        });
        setLoading(false);
        router.push(`/order-confirmation?order-id=${res.data.orderId}`);
        setPlaceOrderValidate(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      const wallet = localStorage.getItem("wallet");
      if (wallet == "true") {
        setWallet(true);
      } else {
        setWallet(false);
      }
      const data = (wallet == "true") ? "1" : "0";
      getCartDetails(data,allAddress[addressIndex]?._id,voucherDetails?.discount);
    }
  }, [token,allAddress,addressIndex]);

   useEffect(()=>{
      const data = localStorage.getItem("voucherDetails");
      if(data){
        const voucherDetails = JSON.parse(data);
        const updatedVoucherDetails = {
          ...voucherDetails,
          discount: parseInt(voucherDetails.discount, 10)
        };
        setVoucherDetails(updatedVoucherDetails);
      }
    },[]);

  return (
    <>
      <Box p={5}>
         <Grid container justifyContent="center" spacing={3} sx={{ px: 2, py: 4 }}>
      <Grid item xs={12} md={10}>
        <Grid container spacing={4}>
          {/* LEFT SIDE - Address List */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Choose Delivery Address
            </Typography>

            <Button
              variant="outlined"
              onClick={handleClickPopup}
              sx={{ mb: 3, borderRadius: 20, textTransform: "none" }}
            >
              + Add New Address
            </Button>
            <FormControl fullWidth>
              <RadioGroup
                defaultValue={0}
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
              >
                {allAddress.map((address, i) => {
                  return (
                    <Grid
                      key={address._id}
                      container
                      spacing={2}
                      mb={2}
                      alignItems="flex-start"
                    >
                      <Grid item lg={4} md={4} xs={12}>
                        <Box sx={{ display: "flex" }}>
                          <FormControlLabel
                            onChange={(e) => {
                              setAddressIndex(+e.target.value);
                            }}
                            value={i}
                            sx={{
                              alignItems: "flex-start",
                              marginRight: "4px",
                            }}
                            control={<Radio sx={{ padding: "0 9px" }} />}
                          />

                          <Box>
                            {address.default === "1" && (
                              <Typography sx={{ mb: 1 }}>
                                <span
                                  style={{
                                    borderRadius: "30px",
                                    background: "#efefef",
                                    fontSize: "14px",
                                    padding: "5px 16px",
                                  }}
                                >
                                  Default
                                </span>
                              </Typography>
                            )}

                            <Typography
                              sx={{ textTransform: "capitalize" }}
                              fontWeight={500}
                              fontSize="16px"
                            >
                              {address.first_name} {address.last_name}
                            </Typography>
                            <Typography fontWeight={500} fontSize="16px">
                              {address.city} {address.pincode}
                            </Typography>
                            <Typography fontWeight={500} fontSize="16px">
                              {address.state}
                            </Typography>
                            <Typography fontWeight={500} fontSize="16px">
                              {address.country}
                            </Typography>
                            <Typography fontWeight={500} fontSize="16px">
                              {address.mobile}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item lg={4} md={4} xs={12}>
                        <Box
                          width={"300px"}
                          display={"flex"}
                          flexDirection={"column"}
                          mt={{ xs: 2, md: 0 }}
                        >
                          <Box
                            mt={1}
                            display="flex"
                            justifyContent="space-between"
                          >
                            <Button
                              onClick={() => {
                                editHandler(address);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => {
                                setDeleteAddressPopup(true);

                                setDeleteAddressId(address._id);
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      </Grid>

                      <React.Fragment>
                        <Dialog
                          open={deleteAddressPopup}
                          aria-labelledby="alert-dialog-title"
                          aria-describedby="alert-dialog-description"
                        >
                          <DialogTitle id="alert-dialog-title">
                            Are you sure? you want to delete this address
                          </DialogTitle>
                          <DialogActions>
                            <Button
                              onClick={() => setDeleteAddressPopup(false)}
                            >
                              No
                            </Button>
                            <Button
                              autoFocus
                              onClick={() =>
                                deleteAddressHandler(deleteAddressId)
                              }
                            >
                              Yes
                            </Button>
                          </DialogActions>
                        </Dialog>
                      </React.Fragment>
                    </Grid>
                  );
                })}
              </RadioGroup>
            </FormControl>
            <Dialog open={deleteAddressPopup}>
              <DialogTitle>Are you sure you want to delete this address?</DialogTitle>
              <DialogActions>
                <Button onClick={() => setDeleteAddressPopup(false)}>No</Button>
                <Button autoFocus onClick={() => deleteAddressHandler(deleteAddressId)}>
                  Yes
                </Button>
              </DialogActions>
            </Dialog>

            <Typography mt={2} variant="body2" color="text.secondary">
              By choosing “Dispatch here,” you agree to our Privacy Policy and may receive order confirmation on SMS or WhatsApp.
            </Typography>
          </Grid>

          {/* RIGHT SIDE - Order Summary + Payment */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} mb={2}>
              Order Summary
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {token && (
                      <TableRow>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={wallet}
                                onChange={handleWalletChange}
                              />
                            }
                            label="Use Wallet Balance"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {currency?.symbol}
                          {(usercredentials?.wallet_balance * currency?.rate).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow>
                      <TableCell>Item(s) total</TableCell>
                      <TableCell align="right">
                        {currency?.symbol}
                        {(state?.total * currency?.rate).toFixed(2)}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Shop Discount</TableCell>
                      <TableCell align="right">
                        -{currency?.symbol}
                        {(state?.shopDiscount * currency?.rate).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    { 
                      state?.voucherDiscount > 0 && <TableRow>
                        <TableCell>Voucher Discount</TableCell>
                        <TableCell align="right">
                          - {currency?.symbol}
                          {(state?.voucherDiscount * currency?.rate).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    }
                    <TableRow>
                      <TableCell>Sub total</TableCell>
                      <TableCell align="right">
                        {currency?.symbol}
                        {(state?.subTotal * currency?.rate).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Delivery</TableCell>
                      <TableCell align="right">
                        {currency?.symbol}
                        {(state?.delivery * currency?.rate).toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {token && (
                      <TableRow>
                        <TableCell>Wallet</TableCell>
                        <TableCell align="right">
                          -{currency?.symbol}
                          {(state?.walletAmount * currency?.rate).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight={600}>
                          Total ({state?.cart?.length} items)
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          {currency?.symbol}
                          {(state?.superTotal * currency?.rate).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {state.cart.length > 0 && (
              <Box mb={3}>
                <Typography color="text.secondary" fontSize={13}>
                  Local taxes included. Additional duties and{" "}
                  <Link component={NextLink} href="/" underline="hover">
                    taxes may apply
                  </Link>
                </Typography>
              </Box>
            )}

            <FormLabel component="legend" sx={{ mb: 1 }}>
              Select Payment Method
            </FormLabel>
            <RadioGroup
              row
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <FormControlLabel value="1" control={<Radio />} label="Cash on Delivery" />
              <FormControlLabel value="2" control={<Radio />} label="Online Payment" />
            </RadioGroup>

            {paymentType === "1" && (
              <Button
                fullWidth
                onClick={orderConfirmation}
                endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading}
                sx={{
                  mt: 2,
                  fontSize: "18px",
                  background: "#000",
                  color: "#fff",
                  borderRadius: "30px",
                  padding: "10px",
                  "&:hover": { background: "#222" },
                }}
              >
                Place Order
              </Button>
            )}

            {paymentType === "2" && (
              <Box mt={2}>
                <PayPalScriptProvider options={initialOptions}>
                  <Checkout />
                </PayPalScriptProvider>
              </Box>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
      </Box>

      {/* popupForm */}
      <Box>
        <Dialog
          open={openPopup}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            ".MuiPaper-root": {
              width: { lg: "600px", md: "600px", xs: "100%" },
            },
          }}
        >
          <Formik
            initialValues={{
              firstName: editAddress?.first_name || "",
              lastName: editAddress?.last_name || "",
              address1: editAddress?.address_line1 || "",
              address2: editAddress?.address_line2 || "",
              country: "",
              state: "",
              city: "",
              pincode: editAddress?.pincode || "",
              phone: editAddress?.phone_code + editAddress?.mobile || "",
              setAsDefault:
                editAddress?.default === "1" ? true : false || false,
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              handleSubmit(values, resetForm);
            }}
          >
            {({ handleBlur, values, handleChange, touched, errors }) => {
              useEffect(() => {
                console.log(editAddress?.country, "countryyyyyyyyyyydhhhdhdd");
                if (getCountry.length > 0 && editAddress?.country) {
                  const find = getCountry.find((country) => {
                    return country.name === editAddress?.country;
                  });

                  handleChange({
                    target: {
                      name: "country",
                      value: find,
                    },
                  });

                  setCountryValue(find ? find._id : "");
                }
              }, [getCountry, editAddress]);

              useEffect(() => {
                if (getState.length > 0 && editAddress?.state) {
                  const find = getState.find((state) => {
                    return state.name === editAddress?.state;
                  });

                  handleChange({
                    target: {
                      name: "state",
                      value: find,
                    },
                  });

                  setStateValue(find ? find._id : "");
                }
              }, [getState]);

              useEffect(() => {
                if (getCities.length > 0 && editAddress?.city) {
                  const find = getCities.find((city) => {
                    return city.name === editAddress?.city;
                  });

                  handleChange({
                    target: {
                      name: "city",
                      value: find,
                    },
                  });
                }
              }, [getCities, statevalue]);

              return (
                <Form>
                  <Box
                    p={4}
                    sx={{
                      background: "#fff",
                      borderRadius: "6px",
                      boxShadow: "0 0 3px #000",
                    }}
                  >
                    <Typography variant="h5">Enter an address</Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Typography sx={{ fontWeight: "700", mt: 2 }}>
                          First Name*
                        </Typography>
                        <TextField
                          fullWidth
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          error={touched.firstName && Boolean(errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                          sx={{ ".MuiInputBase-root": { height: "50px" } }}
                        />
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Typography sx={{ fontWeight: "700", mt: 2 }}>
                          Last Name (optional)
                        </Typography>
                        <TextField
                          fullWidth
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          error={touched.lastName && Boolean(errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                          sx={{ ".MuiInputBase-root": { height: "50px" } }}
                        />
                      </Box>
                    </Box>

                    <Typography sx={{ fontWeight: "700", mt: 2 }}>
                      Address 1*
                    </Typography>
                    <TextField
                      fullWidth
                      name="address1"
                      value={values.address1}
                      onChange={handleChange}
                      error={touched.address1 && Boolean(errors.address1)}
                      helperText={touched.address1 && errors.address1}
                      sx={{ ".MuiInputBase-root": { height: "50px" } }}
                    />

                    <Typography sx={{ fontWeight: "700", mt: 2 }}>
                      Address 2 (optional)
                    </Typography>
                    <TextField
                      fullWidth
                      name="address2"
                      value={values.address2}
                      onChange={handleChange}
                      error={touched.address2 && Boolean(errors.address2)}
                      helperText={touched.address2 && errors.address2}
                      sx={{ ".MuiInputBase-root": { height: "50px" } }}
                    />

                    <Typography sx={{ fontWeight: "700", mt: 2 }}>
                      Country*
                    </Typography>
                    <Autocomplete
                      value={values.country}
                      options={getCountry || []}
                      getOptionLabel={(option) => option.name || ""}
                      onChange={(event, value) => {
                        handleChange({
                          target: {
                            name: "country",
                            value: value ? value : "",
                          },
                        });
                        handleChange({
                          target: {
                            name: "state",
                            value: "",
                          },
                        });
                        handleChange({
                          target: {
                            name: "city",
                            value: "",
                          },
                        });
                        setCountryValue(value ? value._id : "");
                      }}
                      onBlur={handleBlur}
                      renderInput={(params) => (
                        <TextField
                          sx={{ ".MuiInputBase-root": { height: "50px" } }}
                          {...params}
                          variant="outlined"
                          error={!!touched.country && !!errors.country}
                          helperText={touched.country && errors.country}
                        />
                      )}
                    />

                    <Typography sx={{ fontWeight: "700", mt: 2 }}>
                      State*
                    </Typography>
                    <Autocomplete
                      value={values.state}
                      options={getState}
                      name="state"
                      getOptionLabel={(option) => option.name || ""}
                      onChange={(event, value) => {
                        handleChange({
                          target: {
                            name: "state",
                            value: value ? value : "",
                          },
                        });
                        handleChange({
                          target: {
                            name: "city",
                            value: "",
                          },
                        });
                        setStateValue(value ? value._id : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={touched.state && Boolean(errors.state)}
                          helperText={touched.state && errors.state}
                          sx={{ ".MuiInputBase-root": { height: "50px" } }}
                        />
                      )}
                    />

                    <Typography sx={{ fontWeight: "700", mt: 2 }}>
                      City*
                    </Typography>
                    <Autocomplete
                      value={values.city}
                      id="city-autocomplete"
                      options={getCities || []}
                      getOptionLabel={(option) => option?.name || ""}
                      onChange={(event, value) => {
                        handleChange({
                          target: {
                            name: "city",
                            value: value ? value : "",
                          },
                        });
                      }}
                      onBlur={handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={{ ".MuiInputBase-root": { height: "50px" } }}
                          variant="outlined"
                          error={!!touched.city && !!errors.city}
                          helperText={touched.city && errors.city}
                          disabled={!statevalue}
                        />
                      )}
                    />

                    <Grid container spacing={2} mt={2}>
                      <Grid item lg={6} xs={12}>
                        <Typography sx={{ fontWeight: "700" }}>
                          Pincode*
                        </Typography>
                        <TextField
                          fullWidth
                          name="pincode"
                          value={values.pincode}
                          onChange={handleChange}
                          error={touched.pincode && Boolean(errors.pincode)}
                          helperText={touched.pincode && errors.pincode}
                          sx={{ ".MuiInputBase-root": { height: "50px" } }}
                        />
                      </Grid>

                      <Grid item lg={6} xs={12}>
                        <Typography sx={{ fontWeight: "700" }}>
                          Phone Number*
                        </Typography>
                        <Box>
                          <PhoneInput
                            enableSearch={true}
                            autoFormat={true}
                            country={"in"}
                            inputStyle={{ width: "100%", height: "50px" }}
                            value={values.phone}
                            onChange={(phone, country) => {
                              handleChange({
                                target: { name: "phone", value: phone },
                              });
                              setCountryCode(country.countryCode);
                            }}
                          />
                          {touched.phone && errors.phone && (
                            <Typography color="error" fontSize="0.75rem">
                              {errors.phone}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    <Typography mt={2}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="setAsDefault"
                            checked={values.setAsDefault}
                            onChange={handleChange}
                          />
                        }
                        label="Set as default Address "
                      />
                    </Typography>

                    <Box mt={3} textAlign="end">
                      <Button
                        sx={{ borderRadius: "30px", padding: "5px 18px" }}
                        type="reset"
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={buttonDisable ? true : false}
                        type="submit"
                        sx={{
                          marginLeft: "8px",
                          background: "#000",
                          color: "#fff",
                          borderRadius: "30px",
                          padding: "5px 18px",
                          "&:hover": { background: "#383737" },
                        }}
                      >
                        Save
                      </Button>
                    </Box>

                    <Typography mt={1} sx={{ color: "#000" }}>
                      By choosing “Save,” you agree to Agukart’s{" "}
                      <Link
                        href="#"
                        style={{ textDecoration: "underline", color: "#000" }}
                      >
                        Privacy Policy
                      </Link>{" "}
                      and consent to receiving order confirmations from Agukart
                      and its service partners via SMS or WhatsApp using your
                      phone number. Message and data rates may apply.
                    </Typography>
                  </Box>
                </Form>
              );
            }}
          </Formik>

          <Button
            onClick={() => {
              handleClosePopup();
              setEditAddress(null);
            }}
            sx={{
              position: "absolute",
              top: { lg: "30px", md: "30px", xs: "10px" },
              right: { lg: "30px", md: "30px", xs: "10px" },
            }}
          >
            <CloseIcon />
          </Button>
        </Dialog>
      </Box>
    </>
  );
};

export default DeliveryAddress;
