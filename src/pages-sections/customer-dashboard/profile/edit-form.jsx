"use client";

import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/navigation";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
// import './style.css'

// FORMIK

import { Formik } from "formik";
// YUP

import * as yup from "yup";
import { getAPI, postAPI, postAPIAuth } from "utils/__api__/ApiServies";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Margin, Padding } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { Autocomplete } from "@mui/material";
// CUSTOM DATA MODEL

// ==============================================================
export default function ProfileEditForm({ user, handleFormSubmit }) {
  console.log({user},"dfghrhrhrhrthr")
  const { token } = useAuth();
  const { addToast } = useToasts();
  const router = useRouter();

  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [countryValue, setCountryValue] = useState("");
  const [stateValue, setStateValue] = useState("");

  const INITIAL_VALUES = {
    first_name: user?.name || "",
    birth_date: new Date(user?.dob) || new Date(),
    number: `${user?.phone_code}${user?.mobile}` || "",
    profession: user?.profession || "",
    email: user?.email || "",
    gender: user?.gender || "",
    country: user?.country || "",
    state: user?.state || "",
    city: user?.city || "",
  };
  const VALIDATION_SCHEMA = yup.object().shape({
    first_name: yup
      .string()
      .matches(
        /^[aA-zZ\s]+$/,
        "Invalid name: Only alphabets and spaces are allowed"
      ),
    email: yup.string().email("invalid email").required("Email is required"),
    birth_date: yup.date().required("Birth date is required"),
    number: yup.string().required("Number is required"),
    profession: yup.string().required("Profession is required"),
  });

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={(values, { resetForm }) => handleFormSubmit(values, resetForm)}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
      }) => {
        console.log({values},"hthth")
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

        useEffect(() => {
          if (allCountries.length > 0 && user?.country) {
            const find = allCountries.find((country) => {
              return country.name === user.country;
            });

            handleChange({
              target: {
                name: "country",
                value: find,
              },
            });

            setCountryValue(find ? find._id : "");
          }
        }, [allCountries, user]);

        useEffect(() => {
          if (allStates.length > 0 && user?.state) {
            const find = allStates.find((state) => {
              return state.name === user.state;
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
          if (allCities.length > 0 && user?.city) {
            const find = allCities.find((city) => {
              return city.name === user.city;
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
            <Grid container spacing={3} alignItems={"center"}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="first_name"
                  label="Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.first_name}
                  error={!!touched.first_name && !!errors.first_name}
                  helperText={touched.first_name && errors.first_name}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <FormControl>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="gender"
                    sx={{ alignItems: "center" }}
                    value={values.gender}
                    onChange={handleChange}
                  >
                    <FormLabel
                      id="demo-row-radio-buttons-group-label"
                      sx={{ marginRight: "20px" }}
                    >
                      Gender
                    </FormLabel>
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Female"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="other"
                      control={<Radio />}
                      label="Other"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label="Email"
                onBlur={handleBlur}
                value={values.email}
                onChange={handleChange}
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                disabled
              />
            </Grid>
              {/* <Grid item md={6} xs={12}>
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
            </Grid> */}
              <Grid item md={6} xs={12}>
                <DatePicker
                  label="Birth Date"
                  value={values.birth_date}
                  onChange={(newValue) => setFieldValue("birth_date", newValue)}
                  slots={{
                    textField: TextField,
                  }}
                  slotProps={{
                    textField: {
                      sx: {
                        mb: 1,
                      },
                      size: "small",
                      fullWidth: true,
                      error: Boolean(
                        !!touched.birth_date && !!errors.birth_date
                      ),
                      helperText: touched.birth_date && errors.birth_date,
                    },
                  }}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="profession"
                  label="Profession"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.profession}
                  error={!!touched.profession && !!errors.profession}
                  helperText={touched.profession && errors.profession}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <FormControl
                  fullWidth
                  // error={!!touched.state && !!errors.country}
                >
                  <Autocomplete
                    value={values.country}
                    id="state-autocomplete"
                    options={allCountries || []}
                    getOptionLabel={(option) => option?.name || ""}
                    onChange={(event, value) => {
                      setFieldValue("country", value);
                      setFieldValue("state", null);
                      setFieldValue("city", null);
                      setCountryValue(value ? value._id : "");
                      setAllStates([]);
                      setAllCities([]);
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
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    id="state-autocomplete"
                    value={values.state}
                    options={allStates || []}
                    getOptionLabel={(option) => option?.name || ""}
                    onChange={(event, value) => {
                      setFieldValue("state", value);
                      setFieldValue("city", null);
                      setStateValue(value ? value._id : "");
                      setAllCities([]);
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
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    value={values.city}
                    id="city-autocomplete"
                    options={allCities || []}
                    getOptionLabel={(option) => option?.name || ""}
                    onChange={(event, value) => {
                      setFieldValue("city", value);
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
                </FormControl>
              </Grid>

              <Grid item md={6} xs={12} className="editprofiledatamainpara">
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
                    value={values.number}
                    onChange={(value) =>
                      handleChange({ target: { name: "number", value } })
                    }
                    onBlur={handleBlur}
                    className="phone-input"
                    error={!!touched.number && !!errors.number}
                    helperText={touched.number && errors.number}
                    style={{ padding: 0 }}
                  />
                  {touched.number && errors.number && (
                    <div className="error-text">{errors.number}</div>
                  )}
                </div>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
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
