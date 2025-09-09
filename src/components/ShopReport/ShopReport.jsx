"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  FormHelperText,
  Radio,
  Paper,
  IconButton,
} from "@mui/material";
import { Formik, Form, Field, ErrorMessage, FieldArray } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import useAuth from "hooks/useAuth";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";

const steps = ["Begin Report", "Your Information", "Intellectual Property"];

const initialValues = {
  ownershipDeclaration: "",
  firstName: "",
  lastName: "",
  companyName: "",
  jobTitle: "",
  country: "",
  state: "",
  city: "",
  zipCode: "",
  address: "",
  email: "",
  phone: "",
  ipType: "",
  ipOwner: "",
  educationalAvailable: "",
  educationalUrl: "",
  copyrightProperties: [
    {
      title: "",
      type: "",
      example: "",
      registered: "",
      registeredAt: "",
      registrationNumber: "",
    },
  ],
  trademarkProperties: [
    {
      trademark: "",
      registered: "",
    },
  ],
  patentProperties: [{ title: "", registered: "" }],
  otherProperties: [{ infringement: "", legalBasis: "" }],
};

const validationSchemas = [
  Yup.object({
    ownershipDeclaration: Yup.string().required(
      "Ownership Declaration is Required"
    ),
  }),
  Yup.object().shape({
    firstName: Yup.string().required("First Name is Required"),
    lastName: Yup.string().required("Last Name is Required"),
    companyName: Yup.string().required("Company Name is Required"),
    jobTitle: Yup.string().required("Job Title is Required"),
    country: Yup.string().required("Country is Required"),
    state: Yup.string().required("State is Required"),
    city: Yup.string().required("City is Required"),
    zipCode: Yup.string().required("Zip Code is Required"),
    address: Yup.string().required("Address is Required"),
    email: Yup.string().email("Invalid email").required("Email is Required"),
    phone: Yup.string().required("Phone is Required"),
  }),

  // Step 2: Intellectual Property
  Yup.object().shape({
    ipType: Yup.string().required("IP Type is required"),
    ipOwner: Yup.string().required("IP Owner is required"),
    educationalAvailable: Yup.string().required(
      "Educational Availability is required"
    ),
    educationalUrl: Yup.string().when("educationalAvailable", {
      is: (val) => val === "Yes",
      then: () =>
        Yup.string().url("Invalid URL").required("Educational URL is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    copyrightProperties: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required("Title is required"),
        type: Yup.string().required("Type is required"),
        example: Yup.string().required("Example is required"),
        registered: Yup.string().required("Registration status is required"),
        registeredAt: Yup.string().when("registered", {
          is: (val) => val === "Yes",
          then: () =>
            Yup.string().required("Location of registration is required"),
          otherwise: () => Yup.string().notRequired(),
        }),
        registrationNumber: Yup.string().when("registered", {
          is: (val) => val === "Yes",
          then: () => Yup.string().required("Registration number is required"),
          otherwise: () => Yup.string().notRequired(),
        }),
      })
    ),
    trademarkProperties: Yup.array().of(
      Yup.object().shape({
        trademark: Yup.string().required("Trademark name is required"),
        registered: Yup.string().required("Please select registration status"),
      })
    ),
    patentProperties: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required("Patent title is required"),
        registered: Yup.string().required("Please select registration status"),
      })
    ),
    otherProperties: Yup.array().of(
      Yup.object().shape({
        infringement: Yup.string().required(
          "Please describe the intellectual property being infringed"
        ),
        legalBasis: Yup.string().required(
          "Please provide the legal basis for your claim"
        ),
      })
    ),
  }),
];

const renderError = (msg) => (
  <Typography variant="caption" color="error">
    {msg}
  </Typography>
);

const ShopReport = ({ id }) => {
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = (values) => {
    const allowedOptions = [
      "you own the rights to.",
      "a company or organization that you represent owns the rights to.",
    ];
    if (activeStep == 0) {
      if (!allowedOptions.includes(values.ownershipDeclaration)) {
        setTouched({ ownershipDeclaration: true });
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (values, resetForm) => {
    console.log("Form Submitted", values);
    try {
      let payload = {
        type: "ip",
        reporttype: "shop",
        store_id: id,
        ownershipDeclaration: values?.ownershipDeclaration,
        firstName: values?.firstName,
        lastName: values?.lastName,
        companyName: values?.companyName,
        jobTitle: values?.jobTitle,
        country: values?.country,
        state: values?.state,
        city: values?.city,
        zipCode: values?.zipCode,
        address: values?.address,
        email: values?.email,
        phone: values?.phone,
        ipType: values?.ipType,
        ipOwner: values?.ipOwner,
        educationalAvailable: values?.educationalAvailable,
        educationalUrl: values?.educationalUrl,
      };
      if (values?.ipType == "Copyright") {
        payload.ipData = values?.copyrightProperties;
      } else if (
        values?.ipType == "Trademark" ||
        values?.ipType == "Counterfeit  "
      ) {
        payload.ipData = values?.trademarkProperties;
      } else if (values?.ipType == "Patent") {
        payload.ipData = values?.patentProperties;
      } else {
        payload.ipData = values?.otherProperties;
      }
      const res = await postAPIAuth("user/create-report", payload, token);
      console.log({ res });
      if (res?.data?.success) {
        console.log("dfgedgd");
        addToast("Reported Successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        resetForm();
        setActiveStep(0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Intellectual property infringement report
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchemas[activeStep]}
        onSubmit={(values, { resetForm }) => {
          console.log(values);
          activeStep === steps.length - 1
            ? handleSubmit(values, resetForm)
            : handleNext(values);
        }}
      >
        {({ values, setFieldValue, errors, touched }) => {
          React.useEffect(() => {
            if (values.ipType === "Copyright") {
              setFieldValue("trademarkProperties", []);
              setFieldValue("patentProperties", []);
              setFieldValue("otherProperties", []);
              setFieldValue("copyrightProperties", [
                {
                  title: "",
                  type: "",
                  example: "",
                  registered: "",
                  registeredAt: "",
                  registrationNumber: "",
                },
              ]);
            } else if (
              values.ipType === "Trademark" ||
              values.ipType === "Counterfeit goods"
            ) {
              setFieldValue("copyrightProperties", []);
              setFieldValue("patentProperties", []);
              setFieldValue("otherProperties", []);
              setFieldValue("trademarkProperties", [
                { trademark: "", registered: "" },
              ]);
            } else if (values.ipType === "Patent") {
              setFieldValue("copyrightProperties", []);
              setFieldValue("trademarkProperties", []);
              setFieldValue("otherProperties", []);
              setFieldValue("patentProperties", [
                { title: "", registered: "" },
              ]);
            } else if (values.ipType === "Other") {
              setFieldValue("copyrightProperties", []);
              setFieldValue("trademarkProperties", []);
              setFieldValue("patentProperties", []);
              setFieldValue("otherProperties", [
                { infringement: "", legalBasis: "" },
              ]);
            } else {
              setFieldValue("copyrightProperties", []);
              setFieldValue("trademarkProperties", []);
              setFieldValue("patentProperties", []);
              setFieldValue("otherProperties", []);
            }
          }, [values.ipType, setFieldValue]);
          console.log({ values, errors });
          return (
            <Form>
              <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              {activeStep === 0 && (
                <Box display="grid" gap={2}>
                  <Field name="ownershipDeclaration">
                    {({ field, form: { touched, errors } }) => (
                      <FormControl
                        component="fieldset"
                        error={
                          touched.ownershipDeclaration &&
                          Boolean(errors.ownershipDeclaration)
                        }
                        fullWidth
                      >
                        <FormLabel component="legend">
                          You allege that content on Etsy violates intellectual
                          property that:
                        </FormLabel>
                        <RadioGroup {...field}>
                          {[
                            "you own the rights to.",
                            "a third party, company or organization owns the rights to.",
                            "a company or organization that you represent owns the rights to.",
                            "none of the above",
                          ].map((option) => (
                            <FormControlLabel
                              key={option}
                              value={option}
                              control={<Radio />}
                              label={option}
                            />
                          ))}
                        </RadioGroup>
                        <FormHelperText>
                          <ErrorMessage name="ownershipDeclaration" />
                        </FormHelperText>
                      </FormControl>
                    )}
                  </Field>
                  {values?.ownershipDeclaration ===
                    "you own the rights to." && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 3,
                        backgroundColor: "#f9f9f9",
                        borderLeft: "4px solid #ccc",
                      }}
                    >
                      <Typography variant="body2">
                        Submitting a notice of infringement is serious, you are
                        initiating a legal process. Fraudulent or abusive
                        notices, or other misuse of Etsy's{" "}
                        <Link
                          href="https://www.etsy.com/legal/ip"
                          target="_blank"
                          rel="noopener"
                        >
                          Intellectual Property Policy
                        </Link>{" "}
                        may result in account termination or other legal
                        consequences.
                      </Typography>
                    </Paper>
                  )}
                  {values?.ownershipDeclaration ===
                    "a third party, company or organization owns the rights to." && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 3,
                        backgroundColor: "#f9f9f9",
                        borderLeft: "4px solid #ccc",
                      }}
                    >
                      <Typography variant="body2">
                        To report infringement on Etsy, you must be authorized
                        to act on behalf of the intellectual property owner.
                        Please refer to our{" "}
                        <Link
                          href="https://www.etsy.com/legal/ip"
                          target="_blank"
                          rel="noopener"
                        >
                          Intellectual Property Policy
                        </Link>{" "}
                        for more information.
                      </Typography>
                    </Paper>
                  )}
                  {values?.ownershipDeclaration ===
                    "a company or organization that you represent owns the rights to." && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 3,
                        backgroundColor: "#f9f9f9",
                        borderLeft: "4px solid #ccc",
                      }}
                    >
                      <Typography variant="body2">
                        Submitting a notice of infringement is serious, you are
                        initiating a legal process. Fraudulent or abusive
                        notices, or other misuse of Etsy's{" "}
                        <Link
                          href="https://www.etsy.com/legal/ip"
                          target="_blank"
                          rel="noopener"
                        >
                          Intellectual Property Policy
                        </Link>{" "}
                        may result in account termination or other legal
                        consequences.
                      </Typography>
                    </Paper>
                  )}
                  {values?.ownershipDeclaration === "none of the above" && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        mt: 3,
                        backgroundColor: "#f9f9f9",
                        borderLeft: "4px solid #ccc",
                      }}
                    >
                      <Typography variant="body2">
                        If these scenarios do not describe your allegation,
                        please refer to{" "}
                        <Link
                          href="https://www.etsy.com/legal/ip"
                          target="_blank"
                          rel="noopener"
                        >
                          Our House Rules
                        </Link>{" "}
                        to
                        <Link
                          href="https://www.etsy.com/legal/ip"
                          target="_blank"
                          rel="noopener"
                        >
                          Help Center
                        </Link>{" "}
                        for assistance resolving your issue.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}

              {activeStep === 1 && (
                <Box display="grid" gap={2}>
                  <Field
                    name="firstName"
                    as={TextField}
                    label="First Name"
                    fullWidth
                    error={touched.firstName && !!errors.firstName}
                    helperText={
                      <ErrorMessage name="firstName" render={renderError} />
                    }
                  />
                  <Field
                    name="lastName"
                    as={TextField}
                    label="Last Name"
                    fullWidth
                    error={touched.lastName && !!errors.lastName}
                    helperText={
                      <ErrorMessage name="lastName" render={renderError} />
                    }
                  />
                  <Field
                    name="companyName"
                    as={TextField}
                    label="Company"
                    fullWidth
                    error={touched.companyName && !!errors.companyName}
                    helperText={
                      <ErrorMessage name="companyName" render={renderError} />
                    }
                  />
                  <Field
                    name="jobTitle"
                    as={TextField}
                    label="Job Title"
                    fullWidth
                    error={touched.jobTitle && !!errors.jobTitle}
                    helperText={
                      <ErrorMessage name="jobTitle" render={renderError} />
                    }
                  />
                  <Field
                    name="country"
                    as={TextField}
                    label="Country"
                    fullWidth
                    error={touched.country && !!errors.country}
                    helperText={
                      <ErrorMessage name="country" render={renderError} />
                    }
                  />
                  <Field
                    name="state"
                    as={TextField}
                    label="State"
                    fullWidth
                    error={touched.state && !!errors.state}
                    helperText={
                      <ErrorMessage name="state" render={renderError} />
                    }
                  />
                  <Field
                    name="city"
                    as={TextField}
                    label="City"
                    fullWidth
                    error={touched.city && !!errors.city}
                    helperText={
                      <ErrorMessage name="city" render={renderError} />
                    }
                  />
                  <Field
                    name="zipCode"
                    as={TextField}
                    label="Zip Code"
                    fullWidth
                    error={touched.zipCode && !!errors.zipCode}
                    helperText={
                      <ErrorMessage name="zipCode" render={renderError} />
                    }
                  />
                  <Field
                    name="address"
                    as={TextField}
                    label="Address"
                    fullWidth
                    error={touched.address && !!errors.address}
                    helperText={
                      <ErrorMessage name="address" render={renderError} />
                    }
                  />
                  <Field
                    name="email"
                    as={TextField}
                    label="Email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={
                      <ErrorMessage name="email" render={renderError} />
                    }
                  />
                  <Field
                    name="phone"
                    as={TextField}
                    label="Phone"
                    fullWidth
                    error={touched.phone && !!errors.phone}
                    helperText={
                      <ErrorMessage name="phone" render={renderError} />
                    }
                  />
                </Box>
              )}

              {activeStep === 2 && (
                <Box display="grid" gap={2}>
                  <Field
                    name="ipType"
                    as={TextField}
                    label="Intellectual Property Type"
                    select
                    fullWidth
                    error={touched.ipType && !!errors.ipType}
                    helperText={
                      <ErrorMessage name="ipType" render={renderError} />
                    }
                  >
                    {[
                      "Copyright",
                      "Trademark",
                      "Counterfeit goods",
                      "Patent",
                      "Other",
                    ].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Field>

                  <Field
                    name="ipOwner"
                    as={TextField}
                    label="IP Owner Name"
                    fullWidth
                    error={touched.ipOwner && !!errors.ipOwner}
                    helperText={
                      <ErrorMessage name="ipOwner" render={renderError} />
                    }
                  />

                  <Field
                    name="educationalAvailable"
                    as={TextField}
                    label="Are resources available?"
                    select
                    fullWidth
                    error={
                      touched.educationalAvailable &&
                      !!errors.educationalAvailable
                    }
                    helperText={
                      <ErrorMessage
                        name="educationalAvailable"
                        render={renderError}
                      />
                    }
                  >
                    {["Yes", "No"].map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Field>

                  {values.educationalAvailable === "Yes" && (
                    <Field
                      name="educationalUrl"
                      as={TextField}
                      label="Educational URL"
                      fullWidth
                      error={touched.educationalUrl && !!errors.educationalUrl}
                      helperText={
                        <ErrorMessage
                          name="educationalUrl"
                          render={renderError}
                        />
                      }
                    />
                  )}
                  {values?.ipType == "Copyright" && (
                    <FieldArray name="copyrightProperties">
                      {({ push, remove }) => (
                        <>
                          {values.copyrightProperties.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                padding: 2,
                                mb: 2,
                                position: "relative",
                              }}
                            >
                              {/* Remove button - hidden for first item */}
                              {index !== 0 && (
                                <IconButton
                                  onClick={() => remove(index)}
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}

                              <Field
                                name={`copyrightProperties[${index}].title`}
                                as={TextField}
                                label="Title of the copyrighted work"
                                fullWidth
                                margin="normal"
                                error={
                                  touched?.copyrightProperties?.[index]
                                    ?.title &&
                                  !!errors?.copyrightProperties?.[index]?.title
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`copyrightProperties[${index}].title`}
                                    render={renderError}
                                  />
                                }
                              />

                              <Field
                                name={`copyrightProperties[${index}].type`}
                                as={TextField}
                                label="Description of copyrighted work"
                                select
                                fullWidth
                                margin="normal"
                                error={
                                  touched?.copyrightProperties?.[index]?.type &&
                                  !!errors?.copyrightProperties?.[index]?.type
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`copyrightProperties[${index}].type`}
                                    render={renderError}
                                  />
                                }
                              >
                                {[
                                  "An item and/or a design",
                                  "Video, image, audio and/or other media",
                                  "Writing and/or other text",
                                  "A name, title, slogan, and/or other short phrase",
                                ].map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Field>

                              <Field
                                name={`copyrightProperties[${index}].example`}
                                as={TextField}
                                label="Example of this work (URL or description)"
                                fullWidth
                                multiline
                                minRows={3}
                                margin="normal"
                                error={
                                  touched?.copyrightProperties?.[index]
                                    ?.example &&
                                  !!errors?.copyrightProperties?.[index]
                                    ?.example
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`copyrightProperties[${index}].example`}
                                    render={renderError}
                                  />
                                }
                              />

                              <Field
                                name={`copyrightProperties[${index}].registered`}
                                as={TextField}
                                label="Is the copyright registered?"
                                select
                                fullWidth
                                margin="normal"
                                error={
                                  touched?.copyrightProperties?.[index]
                                    ?.registered &&
                                  !!errors?.copyrightProperties?.[index]
                                    ?.registered
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`copyrightProperties[${index}].registered`}
                                    render={renderError}
                                  />
                                }
                              >
                                {["Yes", "No"].map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Field>
                              {values.copyrightProperties[index].registered ===
                                "Yes" && (
                                <>
                                  <Field
                                    name={`copyrightProperties[${index}].registeredAt`}
                                    as={TextField}
                                    label="Where is the copyright registered?"
                                    fullWidth
                                    margin="normal"
                                    error={
                                      touched?.copyrightProperties?.[index]
                                        ?.registeredAt &&
                                      !!errors?.copyrightProperties?.[index]
                                        ?.registeredAt
                                    }
                                    helperText={
                                      <ErrorMessage
                                        name={`copyrightProperties[${index}].registeredAt`}
                                        render={renderError}
                                      />
                                    }
                                  />

                                  <Field
                                    name={`copyrightProperties[${index}].registrationNumber`}
                                    as={TextField}
                                    label="What is the registration number?"
                                    fullWidth
                                    margin="normal"
                                    error={
                                      touched?.copyrightProperties?.[index]
                                        ?.registrationNumber &&
                                      !!errors?.copyrightProperties?.[index]
                                        ?.registrationNumber
                                    }
                                    helperText={
                                      <ErrorMessage
                                        name={`copyrightProperties[${index}].registrationNumber`}
                                        render={renderError}
                                      />
                                    }
                                  />
                                </>
                              )}
                            </Box>
                          ))}

                          {/* Add Another Property Button */}
                          <Button
                            variant="outlined"
                            onClick={() =>
                              push({
                                title: "",
                                type: "",
                                example: "",
                                registered: "",
                                registeredAt: "",
                                registrationNumber: "",
                              })
                            }
                          >
                            Add Another Property
                          </Button>
                        </>
                      )}
                    </FieldArray>
                  )}
                  {(values?.ipType === "Trademark" ||
                    values?.ipType === "Counterfeit goods") && (
                    <FieldArray name="trademarkProperties">
                      {({ push, remove }) => (
                        <>
                          {values.trademarkProperties.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                padding: 2,
                                mb: 2,
                                position: "relative",
                              }}
                            >
                              {index !== 0 && (
                                <IconButton
                                  onClick={() => {
                                    console.log("Removing index", index);
                                    remove(index);
                                  }}
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}

                              <Field
                                name={`trademarkProperties[${index}].trademark`}
                                as={TextField}
                                label="What is the trademark?"
                                fullWidth
                                error={
                                  touched?.trademarkProperties?.[index]
                                    ?.trademark &&
                                  !!errors?.trademarkProperties?.[index]
                                    ?.trademark
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`trademarkProperties[${index}].trademark`}
                                    render={renderError}
                                  />
                                }
                              />

                              <Field
                                name={`trademarkProperties[${index}].registered`}
                                as={TextField}
                                label="Is the trademark registered?"
                                select
                                fullWidth
                                error={
                                  touched?.trademarkProperties?.[index]
                                    ?.registered &&
                                  !!errors?.trademarkProperties?.[index]
                                    ?.registered
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`trademarkProperties[${index}].registered`}
                                    render={renderError}
                                  />
                                }
                              >
                                {[
                                  "Yes",
                                  "No, it's pending application",
                                  "No, I have other basis for trademark rights",
                                ].map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Field>
                            </Box>
                          ))}

                          <Button
                            variant="outlined"
                            onClick={() =>
                              push({
                                trademark: "",
                                registered: "",
                              })
                            }
                          >
                            Add Another Property
                          </Button>
                        </>
                      )}
                    </FieldArray>
                  )}
                  {values?.ipType === "Patent" && (
                    <FieldArray name="patentProperties">
                      {({ push, remove }) => (
                        <>
                          {values.patentProperties.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                padding: 2,
                                mb: 2,
                                position: "relative",
                              }}
                            >
                              {index !== 0 && (
                                <IconButton
                                  onClick={() => remove(index)}
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}

                              <Field
                                name={`patentProperties[${index}].title`}
                                as={TextField}
                                label="What is the name or title of the patent?"
                                fullWidth
                                error={
                                  touched?.patentProperties?.[index]?.title &&
                                  !!errors?.patentProperties?.[index]?.title
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`patentProperties[${index}].title`}
                                    render={renderError}
                                  />
                                }
                              />

                              <Field
                                name={`patentProperties[${index}].registered`}
                                as={TextField}
                                label="Is the patent registered?"
                                select
                                fullWidth
                                error={
                                  touched?.patentProperties?.[index]
                                    ?.registered &&
                                  !!errors?.patentProperties?.[index]
                                    ?.registered
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`patentProperties[${index}].registered`}
                                    render={renderError}
                                  />
                                }
                              >
                                {[
                                  "Yes",
                                  "No, it's pending application",
                                  "No",
                                ].map((opt) => (
                                  <MenuItem key={opt} value={opt}>
                                    {opt}
                                  </MenuItem>
                                ))}
                              </Field>
                            </Box>
                          ))}

                          <Button
                            variant="outlined"
                            onClick={() =>
                              push({
                                title: "",
                                registered: "",
                              })
                            }
                          >
                            Add Another Property
                          </Button>
                        </>
                      )}
                    </FieldArray>
                  )}
                  {values?.ipType === "Other" && (
                    <FieldArray name="otherProperties">
                      {({ push, remove }) => (
                        <>
                          {values.otherProperties.map((_, index) => (
                            <Box
                              key={index}
                              sx={{
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                padding: 2,
                                mb: 2,
                                position: "relative",
                              }}
                            >
                              {index !== 0 && (
                                <IconButton
                                  onClick={() => remove(index)}
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              )}

                              <Field
                                name={`otherProperties[${index}].infringement`}
                                as={TextField}
                                label="What is the intellectual property allegedly being infringed upon?"
                                fullWidth
                                error={
                                  touched?.otherProperties?.[index]
                                    ?.infringement &&
                                  !!errors?.otherProperties?.[index]
                                    ?.infringement
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`otherProperties[${index}].infringement`}
                                    render={renderError}
                                  />
                                }
                              />

                              <Field
                                name={`otherProperties[${index}].legalBasis`}
                                as={TextField}
                                label="What is the legal basis for the claim?"
                                multiline
                                rows={3}
                                fullWidth
                                error={
                                  touched?.otherProperties?.[index]
                                    ?.legalBasis &&
                                  !!errors?.otherProperties?.[index]?.legalBasis
                                }
                                helperText={
                                  <ErrorMessage
                                    name={`otherProperties[${index}].legalBasis`}
                                    render={renderError}
                                  />
                                }
                              />
                            </Box>
                          ))}

                          <Button
                            variant="outlined"
                            onClick={() =>
                              push({
                                infringement: "",
                                legalBasis: "",
                              })
                            }
                          >
                            Add Another Property
                          </Button>
                        </>
                      )}
                    </FieldArray>
                  )}
                </Box>
              )}

              <Box mt={3} display="flex" justifyContent="space-between">
                <Button
                  variant="outlined"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    activeStep === 0 &&
                    ![
                      "you own the rights to.",
                      "a company or organization that you represent owns the rights to.",
                    ].includes(values.ownershipDeclaration)
                  }
                >
                  {activeStep === steps.length - 1
                    ? "Submit"
                    : activeStep === 0
                      ? "Begin Report"
                      : "Next"}
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default ShopReport;
