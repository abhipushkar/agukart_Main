"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "@mui/material/Link";
// Local CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';


// LOCAL CUSTOM COMPONENT

// CUSTOM DATA MODEL
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  tooltipClasses,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Carousel } from "components/carousel";
import { fontSize } from "theme/typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { getAPI, postAPI } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import { Visibility, VisibilityOff } from '@mui/icons-material';


const AffiliateRegister = () => {
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    first_name: "", last_name: "", email: "", phone_number: "", address: "", address2: "", country: "", state: "", city: "", postal_code: "", password: "", confirm_password: ""
  })
  const [errors, setErrors] = useState({ first_name: "", last_name: "", email: "", phone_number: "", address: "", address2: "", country: "", state: "", city: "", postal_code: "", password: "", confirm_password: "" });
  const [allCountries, setAllCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };
  const handleSubmit = async () => {
    const newErrors = {};
    if (!formValues.first_name) newErrors.first_name = "First name is required";
    if (!formValues.last_name) newErrors.last_name = "Last name is required";
    if (!formValues.email) newErrors.email = "Email is required";
    if (formValues.email?.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formValues.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    if (!formValues.phone_number) newErrors.phone_number = "Phone number is required";
    if (!formValues.address) newErrors.address = "Address is required";
    if (!formValues.country) newErrors.country = "Country is required";
    if (!formValues.state) newErrors.state = "State is required";
    if (!formValues.city) newErrors.city = "City is required";
    if (!formValues.postal_code) newErrors.postal_code = "Postal code is required";
    if (!formValues.postal_code) newErrors.postal_code = "Postal code is required";
    if (!formValues.password) newErrors.password = "Password is required";
    if (!formValues.confirm_password) newErrors.confirm_password = "Confirm password is required";
    if (formValues.password !== formValues.confirm_password) newErrors.confirm_password = "Password and confirm password should be same";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      try {
        const payload = {
          first_name: formValues?.first_name,
          last_name: formValues?.last_name,
          email: formValues?.email,
          mobile: formValues?.phone_number,
          address: formValues?.address,
          address_2: formValues?.address2,
          country_id: formValues?.country,
          state_id: formValues?.state,
          city_id: formValues?.city,
          pin_code: formValues?.postal_code,
          password: formValues?.password,
          confirm_password: formValues?.confirm_password
        };
        setLoading(true);
        const res = await postAPI("register-affiliate-user", payload);
        if (res.status === 200) {
          setLoading(false);
          addToast(res?.data?.message, {
            appearance: "success",
            autoDismiss: true,
          });
          setFormValues(
            { first_name: "", last_name: "", email: "", phone_number: "", address: "", address2: "", country: "", state: "", city: "", postal_code: "", password: "", confirm_password: "" }
          );
        }
      } catch (error) {
        setLoading(false);
        addToast(error?.response?.data.message || error, {
          appearance: "error",
          autoDismiss: true,
        });
        console.log("error", error?.response?.data || error);
      }
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
        country_id: `${formValues.country}`,
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
    try {
      const param = {
        state_id: `${formValues.state}`,
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
  }, [formValues.country]);

  useEffect(() => {
    getCitiesData();
  }, [formValues.state]);

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, state: "", city: "" }));
  }, [formValues.country]);

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, city: "" }));
  }, [formValues.state]);

  return (
    <SectionCreator py={4} mb={0}>
      <Grid container spacing={2} justifyContent={"center"}>
        <Grid item lg={7} md={8} xs={12}>
          <Box sx={{ boxShadow: '0 0 4px #a09f9f', borderRadius: '4px', background: '#ffff' }}>
            <Typography component="div" sx={{ padding: { lg: 4, md: 4, xs: 2 } }} borderBottom={"1px solid #cbcbcb"}>
              <Typography variant="h5" color={"#000"} fontWeight={600}>Affiliate Signup Form</Typography>
            </Typography>
            <Box sx={{ padding: { lg: 4, md: 4, xs: 2 } }}>
              <Typography component="div" pb={3}>
                <Typography variant="h6" fontWeight={600}>Contact Details</Typography>
              </Typography>
              <Grid container spacing={3} pt={2} pb={4} m={0} width={"100%"} borderTop={"1px solid #cbcbcb"} sx={{ '.MuiGrid-root': { paddingLeft: { lg: '16px', md: '16px', xs: '0px' } } }}>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="firstName">
                      First Name
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="firstName"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Enter First Name"
                      value={formValues?.first_name}
                      name="first_name"
                      onChange={handleChange}
                      error={Boolean(errors.first_name)}
                      helperText={errors.first_name}
                      onBlur={() => {
                        if (!formValues.first_name) {
                          setErrors((prv) => ({ ...prv, first_name: "First name is required" }));
                        }
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="lastName">
                      Last Name
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="lastName"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Enter Last Name"
                      value={formValues?.last_name}
                      name="last_name"
                      onChange={handleChange}
                      error={Boolean(errors.last_name)}
                      helperText={errors.last_name}
                      onBlur={() => {
                        if (!formValues.last_name) {
                          setErrors((prv) => ({ ...prv, last_name: "Last name is required" }));
                        }
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="email">
                      Email
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="email"
                      type="email"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Enter Email"
                      value={formValues?.email}
                      name="email"
                      onChange={handleChange}
                      error={Boolean(errors.email)}
                      helperText={errors.email}
                      onBlur={() => {
                        if (!formValues.email) {
                          setErrors((prv) => ({ ...prv, email: "Email is required" }));
                        }
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="phone_number">
                      Phone Number
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="phone_number"
                      type="text"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Enter Phone Number"
                      value={formValues?.phone_number}
                      name="phone_number"
                      onChange={handleChange}
                      error={Boolean(errors.phone_number)}
                      helperText={errors.phone_number}
                      onBlur={() => {
                        if (!formValues.phone_number) {
                          setErrors((prv) => ({ ...prv, phone_number: "Phone number is required" }));
                        }
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="address">
                      Address
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="address"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Enter Address"
                      value={formValues?.address}
                      name="address"
                      onChange={handleChange}
                      error={Boolean(errors.address)}
                      helperText={errors.address}
                      onBlur={() => {
                        if (!formValues.address) {
                          setErrors((prv) => ({ ...prv, address: "Address is required" }));
                        }
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="address2">
                      Address 2
                    </InputLabel>
                    <TextField id="address2" sx={{ width: '100%' }} variant="outlined" placeholder="Enter Address 2 (Optional)" />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="SelectCountry">
                      Country
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <Select
                      id="SelectCountry"
                      value={formValues?.country}
                      name="country"
                      onChange={handleChange}
                      error={Boolean(errors.country)}
                      helperText={errors.country}
                      onBlur={() => {
                        if (!formValues.country) {
                          setErrors((prv) => ({ ...prv, country: "country is required" }));
                        }
                      }}
                      displayEmpty
                      renderValue={(selected) =>
                        selected ? allCountries.find((country) => country._id === selected)?.name : "Select Country"
                      }
                      sx={{
                        '.MuiSelect-select': {
                          padding: '8.5px 14px',
                        }, width: '100%'
                      }}
                    >
                      {
                        allCountries?.map((country, index) => (
                          <MenuItem key={index} value={country._id}>{country.name}</MenuItem>
                        ))
                      }
                    </Select>
                    {errors.country && (
                      <p style={{ color: '#e94560', fontSize: '12px' }}>
                        {errors.country}
                      </p>
                    )}
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="SelectState">
                      State
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <Select
                      id="SelectState"
                      placeholder="Select State"
                      value={formValues?.state}
                      name="state"
                      onChange={handleChange}
                      error={Boolean(errors.state)}
                      onBlur={() => {
                        if (!formValues.state) {
                          setErrors((prv) => ({ ...prv, state: "State is required" }));
                        }
                      }}
                      sx={{
                        '.MuiSelect-select': {
                          padding: '8.5px 14px',
                        }, width: '100%'
                      }}
                      displayEmpty
                      renderValue={(selected) =>
                        selected ? allStates.find((state) => state._id === selected)?.name : "Select State"
                      }
                    >
                      {
                        allStates?.map((state, index) => (
                          <MenuItem key={index} value={state._id}>{state.name}</MenuItem>
                        ))
                      }
                    </Select>
                    {errors.state && (
                      <p style={{ color: '#e94560', fontSize: '12px' }}>
                        {errors.state}
                      </p>
                    )}
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="SelectCity">
                      City
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <Select
                      id="SelectCity"
                      placeholder="Select City"
                      value={formValues?.city}
                      name="city"
                      onChange={handleChange}
                      error={Boolean(errors.city)}
                      onBlur={() => {
                        if (!formValues.city) {
                          setErrors((prv) => ({ ...prv, city: "City is required" }));
                        }
                      }}
                      sx={{
                        '.MuiSelect-select': {
                          padding: '8.5px 14px',
                        }, width: '100%'
                      }}
                      displayEmpty
                      renderValue={(selected) =>
                        selected ? allCities.find((city) => city._id === selected)?.name : "Select City"
                      }
                    >
                      {
                        allCities?.map((city, index) => (
                          <MenuItem key={index} value={city._id}>{city.name}</MenuItem>
                        ))
                      }
                    </Select>
                    {errors.city && (
                      <p style={{ color: '#e94560', fontSize: '12px' }}>
                        {errors.city}
                      </p>
                    )}
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }} shrink htmlFor="postalCode">
                      Postal Code
                      <span style={{ color: "red", fontSize: "15px", marginRight: "3px", marginLeft: "3px" }}>
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      type="text"
                      id="postalCode"
                      placeholder="Postal Code"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      value={formValues?.postal_code}
                      name="postal_code"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          handleChange(e);
                        }
                      }}
                      error={Boolean(errors.postal_code)}
                      helperText={errors.postal_code}
                      onBlur={() => {
                        if (!formValues.postal_code) {
                          setErrors((prv) => ({ ...prv, postal_code: "Postal Code is required" }));
                        }
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel
                      sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }}
                      shrink
                      htmlFor="password"
                    >
                      Password
                      <span
                        style={{ color: 'red', fontSize: '15px', marginRight: '3px', marginLeft: '3px' }}
                      >
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="password"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Password"
                      value={formValues?.password}
                      name="password"
                      onChange={handleChange}
                      error={Boolean(errors.password)}
                      helperText={errors.password}
                      type={showPassword ? 'text' : 'password'}
                      onBlur={() => {
                        if (!formValues.password) {
                          setErrors((prev) => ({ ...prev, password: 'Password is required' }));
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={togglePasswordVisibility} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Typography>
                </Grid>
                <Grid item lg={6} md={6} xs={12}>
                  <Typography component="div">
                    <InputLabel
                      sx={{ fontWeight: 600, color: '#000', fontSize: '19px' }}
                      shrink
                      htmlFor="confirm_password"
                    >
                      Confirm Password
                      <span
                        style={{ color: 'red', fontSize: '15px', marginRight: '3px', marginLeft: '3px' }}
                      >
                        {" "}
                        *
                      </span>
                    </InputLabel>
                    <TextField
                      id="confirm_password"
                      sx={{ width: '100%' }}
                      variant="outlined"
                      placeholder="Confirm Password"
                      value={formValues?.confirm_password}
                      name="confirm_password"
                      onChange={handleChange}
                      error={Boolean(errors.confirm_password)}
                      helperText={errors.confirm_password}
                      type={showConfirmPassword ? 'text' : 'password'}
                      onBlur={() => {
                        if (!formValues.confirm_password) {
                          setErrors((prev) => ({
                            ...prev,
                            confirm_password: 'Confirm password is required',
                          }));
                        } else if (formValues.confirm_password !== formValues.password) {
                          setErrors((prev) => ({
                            ...prev,
                            confirm_password: 'Password and confirm password should be same',
                          }));
                        } else {
                          setErrors((prev) => ({ ...prev, confirm_password: '' }));
                        }
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Typography>
                </Grid>
              </Grid>
              <Typography component="div" py={2} borderTop={"1px solid #cbcbcb"}>
                <Typography fontWeight={600} textAlign={"center"}>Please allow 2-3 business days.  You will be notified by email when it is ready.</Typography>
              </Typography>
            </Box>
            <Typography component="div" py={3} textAlign={"center"} borderTop={"1px solid #cbcbcb"}>
              <Button endIcon={loading ? <CircularProgress size={15} /> : ""}
                disabled={loading ? true : false}
                sx={{ background: '#09a409', color: '#fff', borderRadius: '4px', padding: '8px 20px', '&:hover': { background: '#088208' } }} onClick={handleSubmit}>Submit Form</Button>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </SectionCreator>
  )
}

export default AffiliateRegister