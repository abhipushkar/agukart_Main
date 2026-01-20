import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Formik } from "formik";
import * as yup from "yup";
import useAuth from "hooks/useAuth";
import {
  getAPI,
  getAPIAuth,
  postAPI,
  postAPIAuth,
} from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/navigation";
import useMyProvider from "hooks/useMyProvider";
import PhoneInput from "react-phone-input-2";
import parsePhoneNumberFromString from "libphonenumber-js";
import { Autocomplete, Checkbox, FormControlLabel } from "@mui/material";

// CUSTOM DATA MODEL

// =============================================================
export default function AddressForm({ address, id }) {
  const { token } = useAuth();
  const [allAddress, setAllAddress] = useState(null);
  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [countryValue, setCountryValue] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [buttonDisable, setButtonDisable] = useState(false);
  console.log("allAddressallAddress", allAddress);
  const { addToast } = useToasts();
  const router = useRouter();
  const { usercredentials } = useMyProvider();

  // console.log("usercredentialsallAddress", usercredentials);

  const getProfileData = async () => {
    try {
      const res = await getAPIAuth(`user/get-address-by-id/${id}`, token);
      // console.log("getprofileres", res);
      if (res.status == 200) {
        setAllAddress(res?.data?.address);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };
  useEffect(() => {
    getProfileData();
  }, []);
  const INITIAL_VALUES = {
    first_name: allAddress?.first_name || "",
    last_name: allAddress?.last_name || "",
    adress_title: allAddress?.address_line1 || "",
    address: allAddress?.address_line2 || "",
    country: "",
    city: "",
    state: "",
    pin_code: allAddress?.pincode || "",
    contact: `${allAddress?.phone_code}${allAddress?.mobile}` || "",
    default: allAddress?.default === "1" ? true : false || false,
  };
  const VALIDATION_SCHEMA = yup.object().shape({
    adress_title: yup.string().required("required"),
    city: yup.object().required("required"),
    state: yup.object().required("required"),
    pin_code: yup.string().required("required"),
    contact: yup.string().required("required"),
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

  const getPostCode = async (pincode, city) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&format=json`,
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

  const handleSubmit = async (values) => {
    // alert("hii");
    console.log(values, "valuesvaluesvaluesvalues");
    const { countryCode, phoneNumber } = splitCountryCode(values.contact);
    console.log({ countryCode, phoneNumber }, "dfshsjdhdsjh");
    try {
      setButtonDisable(true);
      const param = {
        _id: `${id}`,
        first_name: `${values.first_name}`,
        last_name: `${values.last_name}`,
        mobile: `${phoneNumber}`,
        email: `${usercredentials.email}`,
        phone_code: `+${countryCode}`,
        address_line1: `${values.adress_title}`,
        address_line2: `${values.address}`,
        country: `${values.country.name}`,
        state: `${values.state.name}`,
        city: `${values.city.name}`,
        pincode: `${values.pin_code}`,
        default: values.default ? "1" : "0",
      };

      console.log("paramparam", param);

      // const check = await getPostCode(values.pin_code, values?.city?.name);

      // if (check) {
      const res = await postAPIAuth("user/add-address", param, token);
      console.log("ressqwertyu", res);
      if ((res.status = 200)) {
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
        router.push("/profile/address");
        setButtonDisable(false);
      }
      // } else {
      //   addToast("Please Enter Valid Pin Code", {
      //     appearance: "error",
      //     autoDismiss: true,
      //   });

      //   setButtonDisable(false);
      // }
    } catch (error) {
      console.log("errorr", error);
      setButtonDisable(false);
    } finally {
      setButtonDisable(false);
    }
  };

  const getCountryData = async () => {
    try {
      const res = await getAPI("get-country");
      console.log("resresresres", res);
      if (res.status == 200) {
        setAllCountries(res?.data?.contryList);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  const getStateData = async () => {
    try {
      const param = {
        country_id: `${countryValue}`,
      };
      const res = await postAPI("get-states", param);
      console.log("resresresresresresresresresres", res);
      if (res.status == 200) {
        setAllCities([]);
        setAllStates(res?.data?.stateList);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  const getCitiesData = async () => {
    console.log("1");
    try {
      const param = {
        state_id: `${stateValue}`,
      };
      const res = await postAPI("/get-city-by-id", param);
      if (res.status == 200) {
        setAllCities(res?.data?.result);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };

  useEffect(() => {
    getCountryData();
  }, []);
  useEffect(() => {
    getStateData();
  }, [countryValue]);

  useEffect(() => {
    getCitiesData();
  }, [stateValue]);

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
        useEffect(() => {
          console.log(allAddress?.country, "kjdkkdjkjkdjdhh");

          if (allCountries.length > 0 && allAddress?.country) {
            const find = allCountries.find((country) => {
              return country.name === allAddress?.country;
            });

            handleChange({
              target: {
                name: "country",
                value: find,
              },
            });

            setCountryValue(find ? find._id : "");
          }
        }, [allCountries, allAddress]);

        useEffect(() => {
          if (allStates.length > 0 && allAddress?.state) {
            const find = allStates.find((state) => {
              return state.name === allAddress.state;
            });

            handleChange({
              target: {
                name: "state",
                value: find,
              },
            });

            setStateValue(find ? find._id : "");
          }
        }, [allStates]);

        useEffect(() => {
          if (allCities.length > 0 && allAddress?.city) {
            const find = allCities.find((city) => {
              return city.name === allAddress.city;
            });

            handleChange({
              target: {
                name: "city",
                value: find,
              },
            });
          }
        }, [allCities, stateValue]);

        return (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="first_name"
                  label="First Name"
                  onBlur={handleBlur}
                  value={values.first_name}
                  onChange={handleChange}
                  error={!!touched.first_name && !!errors.first_name}
                  helperText={touched.first_name && errors.first_name}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="last_name"
                  label="Last Name"
                  onBlur={handleBlur}
                  value={values.last_name}
                  onChange={handleChange}
                  error={!!touched.last_name && !!errors.last_name}
                  helperText={touched.last_name && errors.last_name}
                />
              </Grid>
              {/*  */}
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="adress_title"
                  label="Address Title"
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
                  label="Address Line (Optional)"
                  value={values.address}
                  onChange={handleChange}
                  error={!!touched.address && !!errors.address}
                  helperText={touched.address && errors.address}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                {/* <TextField
                  fullWidth
                  name="country"
                  onBlur={handleBlur}
                  label="Country"
                  value={values.country}
                  onChange={handleChange}
                  error={!!touched.country && !!errors.country}
                  helperText={touched.country && errors.country}
                /> */}

                <Autocomplete
                  value={values.country}
                  id="state-autocomplete"
                  options={allCountries || []}
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
                          Country <span style={{ color: "red" }}></span>
                        </span>
                      }
                      variant="outlined"
                      error={!!touched.country && !!errors.country}
                      helperText={touched.country && errors.country}
                    />
                  )}
                />
              </Grid>
              {/*  */}

              {/*  */}
              <Grid item md={6} xs={12}>
                {/* <TextField
                  fullWidth
                  name="state"
                  onBlur={handleBlur}
                  label="State"
                  value={values.state}
                  onChange={handleChange}
                  error={!!touched.state && !!errors.state}
                  helperText={touched.state && errors.state}
                /> */}

                <Autocomplete
                  id="state-autocomplete"
                  value={values.state}
                  options={allStates || []}
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
                          State <span style={{ color: "red" }}></span>
                        </span>
                      }
                      variant="outlined"
                      disabled={!countryValue}
                    />
                  )}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                {/* <TextField
                  fullWidth
                  name="city"
                  onBlur={handleBlur}
                  label="City"
                  value={values.city}
                  onChange={handleChange}
                  error={!!touched.city && !!errors.city}
                  helperText={touched.city && errors.city}
                /> */}

                <Autocomplete
                  value={values.city}
                  id="city-autocomplete"
                  options={allCities || []}
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
                          City <span style={{ color: "red" }}></span>
                        </span>
                      }
                      variant="outlined"
                      disabled={!stateValue}
                    />
                  )}
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  label="Pin Code"
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
                  <PhoneInput
                    id="phone-input"
                    enableSearch={true}
                    autoFormat={true}
                    country={"in"}
                    placeholder="Enter phone number"
                    value={values.contact}
                    onChange={(value) =>
                      handleChange({ target: { name: "contact", value } })
                    }
                    onBlur={handleBlur}
                    className="phone-input"
                    error={!!touched.contact && !!errors.contact}
                    helperText={touched.contact && errors.contact}
                    style={{ padding: 0 }}
                  />
                  {touched.contact && errors.contact && (
                    <div className="error-text">{errors.contact}</div>
                  )}
                </div>
              </Grid>

              <Grid
                sx={{
                  paddingLeft: "24px",
                }}
                item
                md={6}
                xs={12}
              >
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
                <Button
                  disabled={buttonDisable ? true : false}
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </form>
        );
      }}
    </Formik>
  );
}
