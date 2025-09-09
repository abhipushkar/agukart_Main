"use client";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Formik } from "formik";
import * as yup from "yup";
import useAuth from "hooks/useAuth";
import {
  getAPIAuth,
  getAPI,
  postAPIAuth,
  postAPI,
} from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/navigation";
import useMyProvider from "hooks/useMyProvider";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Autocomplete,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import parsePhoneNumberFromString from "libphonenumber-js";

// CUSTOM DATA MODEL

// =============================================================
export default function NewAddressComp() {
  const { token } = useAuth();
  const [allAddress, setAllAddress] = useState([]);
  const [getState, setGetState] = useState([]);
  const [getCountry, setGetCountry] = useState([]);

  const [code, setCountryCode] = useState("in");
  const [getCities, setGetCities] = useState([]);
  const [statevalue, setStateValue] = useState("");
  const [countryvalue, setCountryValue] = useState("");

  const { addToast } = useToasts();
  const router = useRouter();
  const { usercredentials } = useMyProvider();

  const getProfileData = async () => {
    try {
      const res = await getAPIAuth("user/get-address", token);
      // console.log("getprofileres", res);
      if (res.status == 200) {
        const response = res?.data?.addresses;
        const fiterdata = response.filter((item) => item._id == id);
        // console.log("fiterdata" , fiterdata);
        setAllAddress(fiterdata?.[0]);
      }
    } catch (error) {
      console.log("errro", error);
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
    getStateData();
  }, [countryvalue]);
  useEffect(() => {
    // if(statevalue){
    console.log("dfghjk", { statevalue });
    getCitiesData();
    // }
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

  useEffect(() => {
    getProfileData();
    getCountryData();
  }, []);

  const INITIAL_VALUES = {
    adress_title: allAddress?.address_line1 || "",
    address: allAddress?.address_line2 || "",
    country: allAddress?.country || "",
    city: allAddress?.city || "",
    state: allAddress?.state || "",
    pin_code: allAddress?.pincode || "",
    number: allAddress?.mobile || "",
    firstName: allAddress?.firstname || "",
    lastName: allAddress?.lastname || "",
    default: false,
  };
  const VALIDATION_SCHEMA = yup.object().shape({
    adress_title: yup.string().required("required"),
    firstName: yup
      .string()
      .matches(
        /^[aA-zZ\s]+$/,
        "Invalid first name: Only alphabets and spaces are allowed"
      )
      .required("First name is required"),
    city: yup.object().required("required"),
    state: yup.object().required("required"),
    country: yup.object().required("required"),
    lastName: yup
      .string()
      .matches(
        /^[aA-zZ\s]+$/,
        "Invalid last name: Only alphabets and spaces are allowed"
      ),

    pin_code: yup.string().required("Pin code is required"),
    // .matches(/^\d{6}$/, "Invalid pin code format. It should be 6 digits."),
    number: yup
      .string()
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
  // HANDLE FORM SUBMIT
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
  const handleSubmit = async (values) => {
    const { countryCode, phoneNumber } = splitCountryCode(values.number);
    try {
      const param = {
        _id: `new`,
        first_name: `${values.firstName}`,
        last_name: `${values.lastName}`,
        mobile: `${phoneNumber}`,
        email: `${usercredentials.email}`,
        phone_code: `+${countryCode}`,
        address_line1: `${values.adress_title}`,
        address_line2: `${values.address}`,
        state: `${values.state.name}`,
        city: `${values.city.name}`,
        country: `${values?.country.name}`,
        pincode: `${values.pin_code}`,
        default: values.default ? "1" : "0",
      };

      // const check = await getPostCode(values.pin_code, values.city.name);

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
          router.push("/profile/address");
        }
      // } else {
      //   addToast("Please Enter Valid Pin Code", {
      //     appearance: "error",
      //     autoDismiss: true,
      //   });
      // }
    } catch (error) {
      console.log("errorr", error);
    }
  };

  return (
    <Formik
      onSubmit={handleSubmit}
      initialValues={INITIAL_VALUES}
      validationSchema={VALIDATION_SCHEMA}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => {
        console.log({ errors });

        console.log(touched.number);
        return (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="firstName"
                  label={
                    <span>
                      First Name <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  value={values.firstName}
                  onChange={handleChange}
                  error={!!touched.firstName && !!errors.firstName}
                  helperText={touched.firstName && errors.firstName}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="lastName"
                  label="Last Name"
                  onBlur={handleBlur}
                  value={values.lastName}
                  onChange={handleChange}
                  error={!!touched.lastName && !!errors.lastName}
                  helperText={touched.lastName && errors.lastName}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="adress_title"
                  // label="Address 1 *"
                  label={
                    <span>
                      Address 1 <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  onBlur={handleBlur}
                  value={values.adress_title}
                  onChange={handleChange}
                  error={!!touched.adress_title && !!errors.adress_title}
                  helperText={touched.adress_title && errors.adress_title}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  onBlur={handleBlur}
                  label={
                    <span>
                      Address 2 <span style={{ color: "red" }}></span>
                    </span>
                  }
                  value={values.address}
                  onChange={handleChange}
                  error={!!touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                />
              </Grid>
              {/* country dropdown */}
              <Grid item md={6} xs={12}>
                <FormControl
                  fullWidth
                  error={!!touched.state && !!errors.country}
                >
                  <Autocomplete
                    value={values.country}
                    id="state-autocomplete"
                    options={getCountry || []}
                    getOptionLabel={(option) => option?.name || ""}
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
                        {...params}
                        label={
                          <span>
                            Country <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        error={!!touched.country && !!errors.country}
                        helperText={touched.country && errors.country}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item md={6} xs={12}>
                <FormControl
                  fullWidth
                  error={!!touched.state && !!errors.state}
                >
                  <Autocomplete
                    id="state-autocomplete"
                    value={values.state}
                    options={getState || []}
                    getOptionLabel={(option) => option?.name || ""}
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
                    onBlur={handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        // label="State"
                        label={
                          <span>
                            State <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        error={!!touched.state && !!errors.state}
                        helperText={touched.state && errors.state}
                        disabled={!countryvalue}
                      />
                    )}
                  />
                </FormControl>
              </Grid>

              {/* City Dropdown */}
              <Grid item md={6} xs={12}>
                <FormControl fullWidth error={!!touched.city && !!errors.city}>
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
                        // label="City"
                        label={
                          <span>
                            City <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        variant="outlined"
                        error={!!touched.city && !!errors.city}
                        helperText={touched.city && errors.city}
                        disabled={!statevalue}
                      />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label={
                    <span>
                      Pin Code <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="pin_code"
                  onBlur={handleBlur}
                  value={values.pin_code}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,6}$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  error={!!touched.pin_code && !!errors.pin_code}
                  helperText={touched.pin_code && errors.pin_code}
                />
              </Grid>

              <Grid item lg={12} md={6} xs={12}>
                <div
                  className="phone-input-container editprofiledata"
                  style={{ margin: 0 }}
                >
                  <Typography>
                    Phone Number <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <PhoneInput
                    id="phone-input"
                    enableSearch={true}
                    autoFormat={true}
                    country={"in"}
                    placeholder="Enter phone number"
                    value={values.number}
                    onChange={(value, country) => {
                      handleChange({ target: { name: "number", value } });
                      setCountryCode(country.countryCode);
                    }}
                    onBlur={handleBlur}
                    className="phone-input"
                    style={{ padding: 0 }}
                  />
                  {touched.number && errors.number && (
                    <div className="error-text">{errors.number}</div>
                  )}
                </div>
              </Grid>

              <Grid item md={6} xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="default"
                      checked={values.default}
                      onChange={handleChange}
                    />
                  }
                  label="Set as default Address "
                />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Save
                </Button>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
}
