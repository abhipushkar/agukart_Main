"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Public as PublicIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Pinterest as PinterestIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  DiamondTwoTone as DiamondTwoToneIcon,
  TrendingUpRounded as TrendingUpRoundedIcon,
  VerifiedUserOutlined as VerifiedUserOutlinedIcon,
  LockPersonOutlined,
  LooksOne, LooksTwo, Looks3,
  Groups as GroupsIcon, Search
} from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import { useToasts } from "react-toast-notifications";
import { getAPI, postAPI } from "utils/__api__/ApiServies";
import PhoneInput from "react-phone-input-2";
import Ecommerce from "icons/duotone/Ecommerce";

// Social media options with icons
const socialOptions = [
  { value: "website", label: "Website", icon: <LanguageIcon /> },
  { value: "instagram", label: "Instagram", icon: <InstagramIcon /> },
  { value: "facebook", label: "Facebook", icon: <FacebookIcon /> },
  { value: "pinterest", label: "Pinterest", icon: <PinterestIcon /> },
];

// Validation Schema
const validationSchema = Yup.object({
  fullName: Yup.string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .required("Email address is required")
    .email("Please enter a valid email address"),
  brand: Yup.string().required("Please enter your brand name"),
  country: Yup.string().required("Please select your country"),
  state: Yup.string().required("Please select your state"),
  city: Yup.string().required("Please enter your city"),
  productCategory: Yup.string().required("Please select a category"),
  productDescription: Yup.string()
    .required("Product description is required")
    .min(20, "Description must be at least 20 characters"),
  addressLine1: Yup.string().required("Address Line 1 is required"),
  addressLine2: Yup.string(),
  zipCode: Yup.string()
    .required("Zip/Postal code is required")
    .matches(/^[0-9]{5,10}$/, "Please enter a valid zip code"),
  socialLinks: Yup.array()
    .of(
      Yup.object({
        platform: Yup.string().required("Platform is required"),
        url: Yup.string()
          .trim()
          .url("Please enter a valid URL")
          .nullable(),
      })
    )
    .test(
      "at-least-one-link",
      "At least one social media or website link is required",
      (links) => {
        return links?.some((link) => link?.url?.trim()) ?? false;
      }
    ),
  number: Yup.string()
    .required("Phone number is required")
    .min(10, "Please enter a valid phone number"),
  number2: Yup.string(),
});

const MobileCollapseSection = ({
  title,
  children,
  open,
  onToggle,
  sx = {},
}) => {
  return (
    <Card sx={{ mb: 1.5, borderRadius: 2, ...sx }}>
      <Box
        onClick={onToggle}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Typography fontWeight={700}>
          {title}
        </Typography>

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {children}
        </CardContent>
      </Collapse>
    </Card>
  );
};

const ApplyAsSeller = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { addToast } = useToasts();

  // State for dropdown data
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({
    whySell: false,
    whoWeAre: false,
    limitedAccess: false,
    qualityFirst: false
  });

  // Initial values
  const initialValues = {
    fullName: "",
    email: "",
    brand: "",
    country: "",
    state: "",
    city: "",
    productCategory: "",
    productDescription: "",
    addressLine1: "",
    addressLine2: "",
    zipCode: "",
    socialLinks: [{ platform: "website", url: "" }, { platform: "instagram", url: "" }, { platform: "facebook", url: "" }, { platform: "pinterest", url: "" }],
    number: "",
    number2: "",
    countryCode: "in",
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Fetch countries on mount
  useEffect(() => {
    getCountryData();
  }, []);

  const getCountryData = async () => {
    try {
      const res = await getAPI("get-country");
      if (res.status === 200) {
        setCountries(res?.data?.contryList || []);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const getStateData = async (countryId) => {
    try {
      const param = { country_id: countryId };
      const res = await postAPI("get-states", param);
      if (res.status === 200) {
        setStates(res?.data?.stateList || []);
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const getCitiesData = async (stateId) => {
    try {
      const param = { state_id: stateId };
      const res = await postAPI("/get-city-by-id", param);
      if (res.status === 200) {
        setCities(res?.data?.result || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    setIsSubmitting(true);
    try {
      console.log("Form submitted:", values);
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API call
      addToast("Application submitted successfully!", {
        appearance: "success",
        autoDismiss: true,
      });
      resetForm();
      setCities([]);
      setStates([]);
    } catch (error) {
      addToast("Something went wrong. Please try again.", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const whySellContent = (
    <CardContent>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 3 },
        }}
      >
        {[
          {
            icon: <PublicIcon sx={{ color: "#f7dda5", fontSize: 35 }} />,
            title: "Global Exposure",
            desc: "Reach customers in USA, UK, Europe and many more countries.",
          },
          {
            icon: <DiamondTwoToneIcon sx={{ color: "#f7dda5", fontSize: 35 }} />,
            title: "Premium Platform",
            desc: "A high-quality marketplace focused on unique and handcrafted products.",
          },
          {
            icon: <Ecommerce sx={{ color: "#f7dda5", fontSize: 35 }} />,
            title: "Curated Marketplace",
            desc: "We maintain a curated environment. No mass production, no clutter.",
          },
          {
            icon: <TrendingUpRoundedIcon sx={{ color: "#f7dda5", fontSize: 35 }} />,
            title: "Grow Your Brand",
            desc: "Build your brand with dedicated visibility and long-term growth.",
          },
        ].map((item, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              gap: 2,
              flex: 1,
              minWidth: 0,
              flexDirection: isMobile ? "row" : "column",
              justifyContent: { xs: "start", md: "center" }
            }}
          >
            <Box sx={{ mt: 0.5, flexShrink: 0 }}>
              {item.icon}
            </Box>

            <Box>
              <Typography fontWeight={600}>
                {item.title}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {item.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </CardContent>
  );

  const whoWeAreSection = (
    <CardContent sx={{ pb: '0 !important', }}>
      <Box component="ul" sx={{ m: 0, listStyleType: "disc", }}>
        {[
          "Handmade / Handcrafted product creators",
          "Unique, original & non-mass-produced items",
          "Jewelry, Home Decor, Fashion, Vintage, Art & more",
          "High quality and attention to detail",
          "Consistent and reliable sellers",
        ].map((item, index) => (
          <Typography component="li" key={index} sx={{ mb: 0.5 }}>
            {item}
          </Typography>
        ))}
      </Box>
    </CardContent>);

  const limitedAccess = (
    <CardContent
      sx={{
        borderRadius: 2,
        border: isMobile ? undefined : "2px solid #e5d5a7e3",
        bgcolor: "#fff8e1d7",
        color: "#573912",
      }}
    >
      {/* Heading + Icon */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography
          fontWeight={700}
          variant="h6"
          sx={{ my: 0.8 }}
        >
          Limited Creator Access
        </Typography>

        <IconButton
          disableRipple
          component={Paper}
          sx={{
            width: 45,
            height: 45,
            bgcolor: "white",
            boxShadow: "none",
            boxShadow: "2px #00000060"
          }}
        >
          <LockPersonOutlined sx={{ color: "#d1b45b", fontSize: "30px" }} />
        </IconButton>
      </Box>

      {/* Description */}
      <Typography
        variant="body2"
        fontSize={16}
        py={1}
        textAlign="center"
      >
        We onboard a limited number of creators each month to maintain
        quality, trust and a premium experience for our customers.
      </Typography>

      {/* Bottom message */}
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ mt: 0.5 }}
        fontSize={16}
        textAlign="center"
      >
        Not all applications are approved.
      </Typography>
    </CardContent>
  );

  const qualityFirst = (
    <Alert severity="success"
      icon={<IconButton disableRipple component={Paper} sx={{ height: 40, bgcolor: "white" }}><VerifiedUserOutlinedIcon color="success" /></IconButton>}
      sx={{ borderRadius: 2, border: isMobile ? undefined : "2px solid #bbe5a7d3", alignItems: "center" }}
    >
      {!isMobile && <Typography fontWeight={600} fontSize={18}>Quality & Trust First</Typography>}
      <Typography variant="body2" fontSize={16} py={1}>
        We are commited to providing the best experience to our customers by working with the right creators.
      </Typography>
    </Alert>
  );

  return (
    <>
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, md: 5 },
          mb: 4,
          mt: { xs: 0.5, sm: 1, md: 0 },
          color: "#573912",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          bgcolor: "#f2e9e4",

          // Give the banner a little more predictable height on mobile
          minHeight: { xs: 190, sm: 220, md: 260 },

          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Right decoration */}
        <Box
          component="img"
          src="/assets/images/banners/right.png"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,

            // Desktop
            height: "100%",
            width: "auto",

            // Mobile
            "@media (max-width: 600px)": {
              width: "42%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right bottom",
            },
          }}
        />

        {/* Left decoration */}
        <Box
          component="img"
          src="/assets/images/banners/left.png"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,

            // Desktop
            height: "100%",
            width: "auto",

            // Mobile
            "@media (max-width: 600px)": {
              width: "42%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "left bottom",
            },
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",

            textAlign: "center",
            maxWidth: {
              xs: "100%",
              md: 850,
            },

            mx: {
              xs: 0,
              md: "auto",
            },
          }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              fontSize: {
                xs: "1.7rem",
                md: "3rem",
              },
            }}
          >
            Apply as a Creator
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 1,
              opacity: 0.9,
              fontSize: {
                xs: "0.7rem",
                sm: "0.9rem",
                md: "1.25rem",
              },
              px: 2,
              textShadow: "1px 2px 4px #fff"
            }}
          >
            Join Agukart, a curated marketplace for unique, handcrafted & timeless
            products.
          </Typography>

          <Chip
            label="Limited onboarding. Quality over quantity."
            size={isMobile ? "small" : "medium"}
            sx={{
              mt: 2,
              bgcolor: "rgba(255, 255, 255, 0.4)",
              color: "#573912",
              backdropFilter: "blur(1px)",
              fontWeight: 600,
              boxShadow: `
              inset 0 3px 8px rgba(255, 255, 255, 0.2),
              inset 0 -3px 8px rgba(255, 255, 255, 0.2)
              `,
              opacity: 1,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.31)",
                color: "#573912",
              },
            }}
          />
        </Box>
      </Paper>
      <Box sx={{ pb: { xs: 4, md: 6 }, bgcolor: "#fafafa", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          {/* Header Banner */}


          <Grid container spacing={4}>
            {/* Left Column - Benefits */}

            {isMobile ? (
              <Grid item xs={12} md={12}>
                {/* Mobile */}
                <MobileCollapseSection
                  title="Why sell on Agukart?"
                  open={openSections.whySell}
                  onToggle={() => toggleSection("whySell")}
                >
                  {whySellContent}
                </MobileCollapseSection>

                <MobileCollapseSection
                  title="Who we're looking for"
                  open={openSections.whoWeAre}
                  onToggle={() => toggleSection("whoWeAre")}
                  sx={{ bgcolor: "#fff" }}
                >
                  {whoWeAreSection}
                </MobileCollapseSection>

                <MobileCollapseSection
                  title="Quality & Trust First"
                  open={openSections.qualityFirst}
                  onToggle={() => toggleSection("qualityFirst")}
                >
                  {qualityFirst}
                </MobileCollapseSection>

                <MobileCollapseSection
                  title="Limited Creator Access"
                  open={openSections.limitedAccess}
                  onToggle={() => toggleSection("limitedAccess")}
                >
                  {limitedAccess}
                </MobileCollapseSection>
              </Grid>
            ) : (
              /* Desktop */
              <>
                <Grid item md={12} sm={12}>


                  <Card sx={{ mb: 3, borderRadius: 2, p: 3 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      Why sell on Agukart?
                    </Typography>
                    {whySellContent}
                  </Card>
                </Grid>
                <Grid item md={6} sm={6}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#f5f5f5",
                    }}
                  >
                    <CardContent>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <IconButton disableRipple component={Paper}>
                          <GroupsIcon />
                        </IconButton>

                        <Typography variant="h6" fontWeight={700}>
                          Who we're looking for
                        </Typography>
                      </Box>

                      {whoWeAreSection}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item md={6} sm={6}>
                  {/* How it works */}
                  {limitedAccess}
                </Grid>

              </>
            )}

            {/* Left Column - Alerts */}
            <Grid item md={4}
              display={{ xs: "none", md: "block" }}
            >
              <Box sx={{ position: "sticky", top: 24, }}              >
                {qualityFirst}
                <Box py={1} />
                <Box sx={{ mt: 4, p: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                  <Typography fontWeight={700} variant="h6" gutterBottom>
                    How it works?
                  </Typography>
                  <Box >
                    {[
                      { step: <LooksOne />, title: "Submit Application", desc: "Fill out the form with your details and product information." },
                      { step: <LooksTwo />, title: "We Review", desc: "Our team will review your application carefully." },
                      { step: <Looks3 />, title: "Get Notified", desc: "If selected, we will contact you via email with next steps." },
                    ].map((item, index) => (
                      <Box key={index} sx={{ flex: 1, mb: 2 }}>
                        <Typography >{item.step}</Typography>
                        <Typography fontWeight={600}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.desc}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>

            <Grid item sm={12} display={{ xs: "none", sm: "block", md: "none" }}>
              {qualityFirst}
            </Grid>

            {/* Right Column - Form */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Apply Now
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Please fill all required fields. At least one social media or website link is
                  compulsory.
                </Typography>

                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    setFieldValue,
                    isSubmitting,
                    setFieldTouched
                  }) => (
                    <Form>
                      {/* Personal Information */}
                      <Typography fontWeight={600} sx={{ mb: 2 }}>
                        Personal Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="fullName"
                            label="Full Name *"
                            placeholder="Enter your full name"
                            error={touched.fullName && Boolean(errors.fullName)}
                            helperText={touched.fullName && errors.fullName}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="email"
                            label="Email Address *"
                            placeholder="Enter your email address"
                            type="email"
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        </Grid>
                        {/* Phone Number */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                            Phone Number *
                          </Typography>
                          <PhoneInput
                            id="phone-input"
                            enableSearch={true}
                            autoFormat={true}
                            country={"in"}
                            placeholder="Enter phone number"
                            value={values.number}
                            onChange={(value, country) => {
                              setFieldValue("number", value);
                              setFieldValue("countryCode", country.countryCode);
                            }}
                            onBlur={() => setFieldTouched("number", true)}
                            inputStyle={{
                              width: "100%",
                              height: "37px",
                              fontSize: "16px",
                              fontFamily: "inherit",
                              borderRadius: "4px",
                              borderColor: errors.number && touched.number ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              padding: "0 12px 0 50px",
                              backgroundColor: "#fff",
                              transition: "border-color 0.2s ease",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                            containerStyle={{
                              width: "100%",
                            }}
                            buttonStyle={{
                              border: "none",
                              borderRadius: "4px 0 0 4px",
                              backgroundColor: "transparent",
                              height: "37px",
                              padding: "0 8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            dropdownStyle={{
                              width: "300px",
                            }}
                          />
                          {errors.number && touched.number && (
                            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
                              {errors.number}
                            </Typography>
                          )}
                        </Grid>

                        {/* Phone Number 2 (Optional) */}
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                            Phone Number 2 (Optional)
                          </Typography>
                          <PhoneInput
                            id="phone-input-2"
                            enableSearch={true}
                            autoFormat={true}
                            country={"in"}
                            placeholder="Enter alternative phone number"
                            value={values.number2}
                            onChange={(value, country) => {
                              setFieldValue("number2", value);
                            }}
                            onBlur={() => setFieldTouched("number2", true)}
                            inputStyle={{
                              width: "100%",
                              height: "37px",
                              fontSize: "14px",
                              fontFamily: "inherit",
                              borderRadius: "4px",
                              borderColor: errors.number2 && touched.number2 ? "#d32f2f" : "rgba(0, 0, 0, 0.23)",
                              borderWidth: "1px",
                              borderStyle: "solid",
                              padding: "0 12px 0 50px",
                              backgroundColor: "#fff",
                              transition: "border-color 0.2s ease",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                            containerStyle={{
                              width: "100%",
                            }}
                            buttonStyle={{
                              border: "none",
                              borderRadius: "4px 0 0 4px",
                              backgroundColor: "transparent",
                              height: "37px",
                              padding: "0 8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            dropdownStyle={{
                              width: "300px",
                            }}
                          />
                          {errors.number2 && touched.number2 && (
                            <Typography color="error" variant="caption" sx={{ mt: 0.5, display: "block" }}>
                              {errors.number2}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            fullWidth
                            name="brand"
                            label="Brand Name *"
                            placeholder="What do you call yourself"
                            error={touched.brand && Boolean(errors.brand)}
                            helperText={touched.brand && errors.brand}
                          />
                        </Grid>
                      </Grid>



                      <Box sx={{ mt: 3 }}>
                        <Typography fontWeight={600} sx={{ mb: 2 }}>
                          Product Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Field
                              as={TextField}
                              fullWidth
                              select
                              name="productCategory"
                              label="Product Category *"
                              placeholder="Select category"
                              error={touched.productCategory && Boolean(errors.productCategory)}
                              helperText={touched.productCategory && errors.productCategory}
                            >
                              <MenuItem value="">Select category</MenuItem>
                              {[
                                "Jewelry",
                                "Home Decor",
                                "Fashion",
                                "Vintage",
                                "Art",
                                "Ceramics",
                                "Woodworking",
                                "Textiles",
                                "Accessories",
                                "Other",
                              ].map((category) => (
                                <MenuItem key={category} value={category}>
                                  {category}
                                </MenuItem>
                              ))}
                            </Field>
                          </Grid>
                          <Grid item xs={12}>
                            <Field
                              as={TextField}
                              fullWidth
                              multiline
                              rows={4}
                              name="productDescription"
                              label="Describe your products *"
                              placeholder="Tell us about your products, materials, and what makes them unique..."
                              error={touched.productDescription && Boolean(errors.productDescription)}
                              helperText={touched.productDescription && errors.productDescription}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Typography fontWeight={600} sx={{ mb: 2 }}>
                          Location
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Field
                              as={TextField}
                              fullWidth
                              select
                              name="country"
                              label="Country *"
                              placeholder="Select your country"
                              error={touched.country && Boolean(errors.country)}
                              helperText={touched.country && errors.country}
                              onChange={(e) => {
                                setFieldValue("country", e.target.value);
                                setFieldValue("state", "");
                                setFieldValue("city", "");
                                getStateData(e.target.value);
                              }}
                              SelectProps={{
                                MenuProps: {
                                  PaperProps: {
                                    style: {
                                      maxHeight: 300,
                                    },
                                  },
                                },
                              }}
                            >
                              <MenuItem value="">Select your country</MenuItem>
                              {countries.map((country) => (
                                <MenuItem key={country._id || country.id} value={country._id || country.id}>
                                  {country.name}
                                </MenuItem>
                              ))}
                            </Field>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Field
                              as={TextField}
                              fullWidth
                              select
                              name="state"
                              label="State / Province *"
                              placeholder="Select your state"
                              error={touched.state && Boolean(errors.state)}
                              helperText={touched.state && errors.state}
                              disabled={!values.country}
                              onChange={(e) => {
                                setFieldValue("state", e.target.value);
                                setFieldValue("city", "");
                                getCitiesData(e.target.value);
                              }}
                              SelectProps={{
                                MenuProps: {
                                  PaperProps: {
                                    style: {
                                      maxHeight: 300,
                                    },
                                  },
                                },
                              }}
                            >
                              <MenuItem value="">Select your state</MenuItem>
                              {states.map((state) => (
                                <MenuItem key={state._id || state.id} value={state._id || state.id}>
                                  {state.name}
                                </MenuItem>
                              ))}
                            </Field>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Field
                              as={TextField}
                              fullWidth
                              select
                              name="city"
                              label="City *"
                              placeholder="Select your city"
                              error={touched.city && Boolean(errors.city)}
                              helperText={touched.city && errors.city}
                              disabled={!values.state}
                              SelectProps={{
                                MenuProps: {
                                  PaperProps: {
                                    style: {
                                      maxHeight: 300,
                                    },
                                  },
                                },
                              }}
                            >
                              <MenuItem value="">Select your city</MenuItem>
                              {cities.map((city) => (
                                <MenuItem key={city._id || city.id} value={city._id || city.id}>
                                  {city.name}
                                </MenuItem>
                              ))}
                            </Field>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Field
                              as={TextField}
                              fullWidth
                              name="zipCode"
                              label="Zip / Postal Code *"
                              placeholder="Enter your zip code"
                              error={touched.zipCode && Boolean(errors.zipCode)}
                              helperText={touched.zipCode && errors.zipCode}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Typography fontWeight={600} sx={{ mb: 2 }}>
                          Address
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Field
                              as={TextField}
                              fullWidth
                              name="addressLine1"
                              label="Address Line 1 *"
                              placeholder="House no., Building, Street name"
                              error={touched.addressLine1 && Boolean(errors.addressLine1)}
                              helperText={touched.addressLine1 && errors.addressLine1}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Field
                              as={TextField}
                              fullWidth
                              name="addressLine2"
                              label="Address Line 2 (Optional)"
                              placeholder="Apartment, Suite, Unit, Floor, etc."
                              error={touched.addressLine2 && Boolean(errors.addressLine2)}
                              helperText={touched.addressLine2 && errors.addressLine2}
                            />
                          </Grid>

                        </Grid>
                      </Box>

                      {/* Social Links */}
                      <Box sx={{ mt: 3 }}>
                        <Typography fontWeight={600} sx={{ mb: 1 }}>
                          Add at least one social media or website link *
                        </Typography>
                        {typeof errors.socialLinks === "string" && touched.socialLinks && (
                          <Typography
                            color="error"
                            variant="caption"
                            sx={{ display: "block", mb: 1 }}
                          >
                            {errors.socialLinks}
                          </Typography>
                        )}
                        <FieldArray name="socialLinks">
                          <Grid
                            container
                            spacing={3}
                            sx={{ alignItems: "center", mb: 2 }}
                          >
                            {values.socialLinks.map((link, index) => (

                              <Grid item key={index} xs={12} sm={6}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                  {socialOptions.find(o => o.value === link.platform).icon}

                                  <Typography variant="body1">
                                    {socialOptions.find(o => o.value === link.platform).label || "No platform selected"}
                                  </Typography>
                                </Box>
                                <Field
                                  as={TextField}
                                  fullWidth
                                  name={`socialLinks.${index}.url`}
                                  // label="URL"
                                  placeholder="https://..."
                                  error={
                                    touched.socialLinks?.[index]?.url &&
                                    Boolean(errors.socialLinks?.[index]?.url)
                                  }
                                  helperText={
                                    touched.socialLinks?.[index]?.url &&
                                    errors.socialLinks?.[index]?.url
                                  }
                                />
                              </Grid>

                            ))}
                          </Grid>

                        </FieldArray>
                      </Box>

                      <Box sx={{ mt: 4, p: 3, bgcolor: "#f8f9fa", borderRadius: 2, display: { xs: 'block', md: 'none' } }}>
                        <Typography fontWeight={700} gutterBottom>
                          How it works?
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
                          {[
                            { step: <LooksOne />, title: "Submit Application", desc: "Fill out the form with your details and product information." },
                            { step: <LooksTwo />, title: "We Review", desc: "Our team will review your application carefully." },
                            { step: <Looks3 />, title: "Get Notified", desc: "If selected, we will contact you via email with next steps." },
                          ].map((item, index) => (
                            <Box key={index} sx={{ flex: 1 }}>
                              <Typography >{item.step}</Typography>
                              <Typography fontWeight={600}>{item.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.desc}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        sx={{
                          mt: 4,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "white",
                          bgcolor: "#222",
                          "&:hover": { bgcolor: "#222222ed" }
                        }}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </Form>
                  )}
                </Formik>
                <Typography component="div" variant="caption" color="GrayText" mt={1} textAlign={'center'} width={"100%"}>Your information is safe with us and will not be shared.</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ApplyAsSeller;