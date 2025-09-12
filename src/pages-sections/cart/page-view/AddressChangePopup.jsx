import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  Typography,
  Divider,
  IconButton,
  Dialog,
  TextField,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Grid,
  Avatar,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import { Form, Formik } from "formik";
import CheckIcon from "@mui/icons-material/Check";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import parsePhoneNumberFromString from "libphonenumber-js";
import Link from "next/link";
import * as Yup from "yup";
import {
  getAPI,
  getAPIAuth,
  postAPI,
  postAPIAuth,
} from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";
import useMyProvider from "hooks/useMyProvider";

export default function AddressChangePopup({ open, onClose,getAddressData,allAddress,defaultAddress,setDefaultAddress}) {
  console.log({ defaultAddress, allAddress });
  const { token } = useAuth();
  const { usercredentials } = useMyProvider();
  const [code, setCountryCode] = useState("in");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [getState, setGetState] = useState([]);
  const [getCountry, setGetCountry] = useState([]);
  const { addToast } = useToasts();

  console.log({ getCountry });
  const [getCities, setGetCities] = useState([]);
  const [statevalue, setStateValue] = useState("");
  const [countryvalue, setCountryValue] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);
  const [editAddress, setEditAddress] = useState({});

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

  useEffect(() => {
    getCountryData();
  }, []);

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
    getStateData();
  }, [countryvalue]);
  useEffect(() => {
    getCitiesData();
  }, [statevalue]);

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
          setShowAddressForm(false);
          setShowAddressList(true);
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

  function calculateOffset(currentPage) {
    // console.log({currentPage, limit});
    return currentPage - 1;
  }

// Update the address selection handler
    const handleAddressSelect = (address) => {
        setDefaultAddress(address);
        setShowAddressList(false);

        // Close the modal and pass the selected address back to parent
        if (onClose) {
            onClose();
        }

        // Note: The cart refresh should be handled in the parent component (Mycart.jsx)
        // when the modal closes and defaultAddress changes
    };

// Update the modal close handler to reset the internal states
    const handleCloseModal = () => {
        setShowAddressForm(false);
        setShowAddressList(false);
        if (onClose) {
            onClose();
        }
    };

  return (
    <>
      <Box>
        <Dialog
          open={open}
          onClose={onClose}
          sx={{
            ".MuiPaper-root": {
              width: { lg: "600px", md: "600px", xs: "100%" },
              borderRadius: 2,
              px: 3,
              py: 2,
            },
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Conditional Address Form Placeholder */}
          {!showAddressForm ? (
            <>
              {!showAddressList ? (
                <Box>
                  {/* Header */}
                  <Typography variant="h6" fontWeight={600} mt={3} mb={2}>
                    Change Delivery Address
                  </Typography>

                  {/* Delivery Section */}
                  {Object?.values(defaultAddress || {}).length > 0 ? (
                    <Box mb={3} onClick={() => setShowAddressList(true)}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Delivery to
                      </Typography>

                      <Box
                        sx={{
                          border: "1px solid #ccc",
                          borderRadius: 1,
                          p: 2,
                          mt: 1,
                          backgroundColor: "#fff",
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        {/* Arrow on top right */}
                        <ChevronRightIcon
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            color: "#888",
                          }}
                        />

                        {/* Address Section */}
                        <Box>
                          <Typography fontWeight={600}>
                            {defaultAddress?.first_name}{" "}
                            {defaultAddress?.last_name}
                          </Typography>
                          <Typography variant="body2">
                            {defaultAddress?.address_line1}{" "}
                            {defaultAddress?.address_line2},{" "}
                            {defaultAddress?.city}, {defaultAddress?.state},{" "}
                            {defaultAddress?.country} {defaultAddress?.pincode}
                          </Typography>
                          <Typography variant="body2">
                            {defaultAddress?.mobile}
                          </Typography>
                        </Box>

                        {/* Divider */}
                        <Divider sx={{ my: 2 }} />

                        {/* Instant download section */}
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar variant="rounded">
                            <ImageIcon />
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            Instant download
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box mb={3}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        Delivery to
                      </Typography>
                      <Box
                        onClick={() => setShowAddressForm(true)}
                        sx={{
                          border: "1px solid #ccc",
                          borderRadius: 1,
                          p: 2,
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                        }}
                      >
                        <WarningAmberIcon color="warning" />
                        <Typography>Add delivery address</Typography>
                      </Box>
                      <Typography variant="body2" mt={1}>
                        Delivery:{" "}
                        <strong>FREE (20–28 May, Standard Delivery)</strong>
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                </Box>
              ) : (
                <Typography variant="h6" mt={3}>
                  <Box
                    sx={{ display: "flex", alignItems: "center", mt: 3, mb: 4 }}
                  >
                    <ArrowBackIosNewIcon
                      sx={{ fontSize: 20, mr: 1, cursor: "pointer" }}
                      onClick={() => {
                          if (showAddressForm) {
                              setShowAddressForm(false);
                          } else if (showAddressList) {
                              setShowAddressList(false);
                          }
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        Choose an address
                      </Typography>
                    </Box>
                  </Box>
                  {allAddress?.map((address) => (
                    <Paper
                      key={address._id}
                      elevation={address.default == "1" ? 4 : 1}
                      onClickCapture={() => handleAddressSelect(address)}
                      sx={{
                        borderRadius: 2,
                        p: 3,
                        mb: 2,
                        maxWidth: 500,
                        mx: "auto",
                        border:
                          defaultAddress?._id === address._id
                            ? "2px solid black"
                            : "1px solid #ccc",
                        position: "relative",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        "&:hover": {
                          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        },
                        backgroundColor:
                          defaultAddress?._id === address._id
                            ? "#f9f9f9"
                            : "white",
                      }}
                      onClick={() => {
                        setDefaultAddress(address);
                        setShowAddressList(false);
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent:
                            address.default == "1"
                              ? "space-between"
                              : "flex-end",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {address.default == "1" && (
                          <Chip
                            label="Default"
                            size="small"
                            sx={{
                              fontSize: "12px",
                              backgroundColor: "#d0f0c0",
                              color: "#2e7d32",
                              fontWeight: 500,
                              height: 24,
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        {defaultAddress?._id === address._id && (
                          <CheckIcon
                            sx={{
                              color: "green",
                              fontSize: 20,
                            }}
                          />
                        )}
                      </Box>

                      <Typography fontWeight={600} gutterBottom>
                        {address.first_name} {address.last_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {address?.address_line1}, {address?.address_line2},{" "}
                        {address?.city}, {address?.state}, {address?.country} -{" "}
                        {address?.pincode}
                      </Typography>
                      <Typography variant="body2">{address.phone}</Typography>
                    </Paper>
                  ))}

                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      p: 3,
                      mb: 2,
                      maxWidth: 500,
                      mx: "auto",
                      border: "1px dashed #ccc",
                      position: "relative",
                      cursor: "pointer",
                      textAlign: "center",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    onClick={() => {
                      setShowAddressForm(true);
                      setShowAddressList(false);
                    }}
                  >
                    <Typography fontWeight={600} color="primary">
                      + Add a new address
                    </Typography>
                  </Paper>
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="h6" mt={3}>
              <Box sx={{ display: "flex", alignItems: "center", mt: 3, mb: 4 }}>
                <ArrowBackIosNewIcon
                  sx={{ fontSize: 20, mr: 1, cursor: "pointer" }}
                  onClick={() => setShowAddressForm(false)}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Enter an address
                  </Typography>
                </Box>
              </Box>
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
                  console.log({ values, errors });
                  useEffect(() => {
                    console.log(
                      editAddress?.country,
                      "countryyyyyyyyyyydhhhdhdd"
                    );
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
                              error={
                                touched.firstName && Boolean(errors.firstName)
                              }
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
                              error={
                                touched.lastName && Boolean(errors.lastName)
                              }
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
                            style={{
                              textDecoration: "underline",
                              color: "#000",
                            }}
                          >
                            Privacy Policy
                          </Link>{" "}
                          and consent to receiving order confirmations from
                          Agukart and its service partners via SMS or WhatsApp
                          using your phone number. Message and data rates may
                          apply.
                        </Typography>
                      </Box>
                    </Form>
                  );
                }}
              </Formik>
            </Typography>
          )}
        </Dialog>
      </Box>
    </>
  );
}
