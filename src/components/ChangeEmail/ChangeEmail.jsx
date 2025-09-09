"use client";

import React, { useEffect, useState } from "react";
import { H3, H4, H6, Small } from "components/Typography";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import {
  CardContent,
  CardMedia,
  Typography,
  Button,
  Breadcrumbs,
  MenuItem,
  CircularProgress,
  Rating,
  Divider,
} from "@mui/material";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { useFormik } from "formik";

import * as Yup from "yup";
import { token } from "stylis";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";

const validationSchema = Yup.object({
  New_email: Yup.string()
    .email("Enter a valid email")
    .required("New email is required"),
  Confirm_new_email: Yup.string()
    .oneOf([Yup.ref("New_email"), null], "Emails must match")
    .required("Confirm new email is required"),
  Your_ecomm_password: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long"
    ),
});

const ChangeEmail = () => {
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [emailInfo, setEmailInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [varified, setVarified] = useState(false);
  const [cancelConfirmationLoading, setCancelConfirmationLoading] =
    useState(false);
  const [resendConfirmationLoading, setResendConfirmationLoading] =
    useState(false);

  const searchParams = useSearchParams();
  const varifyToken = searchParams.get("token");

  const router = useRouter();
  const getEmailInfo = async () => {
    try {
      setLoading(true);
      const res = await getAPIAuth("user/get-email");

      if (res.status === 200) {
        setEmailInfo(res.data.data);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmailInfo();
  }, []);

  const submitNewEmail = async (values, resetForm) => {
    try {
      const res = await postAPIAuth(
        "user/change-email",
        {
          email: values.New_email,
          confirm_email: values.Confirm_new_email,
          password: values.Your_ecomm_password,
        },
        token,
        addToast
      );

      if (res.status === 200) {
        addToast("Varification link send to Your Email", {
          appearance: "success",
          autoDismiss: true,
        });
        getEmailInfo();
        resetForm();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      setResendConfirmationLoading(true);
      const res = await postAPIAuth(
        "user/send-email-verification",
        {
          email: emailInfo?.email,
        },
        token,
        addToast
      );

      if (res.status === 200) {
        addToast("Varification link send to Your Email", {
          appearance: "success",
          autoDismiss: true,
        });
        getEmailInfo();
      }
    } catch (error) {
      setResendConfirmationLoading(false);
      console.log(error);
    } finally {
      setResendConfirmationLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      New_email: "",
      Confirm_new_email: "",
      Your_ecomm_password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
      submitNewEmail(values, resetForm);
    },
  });

  const varifyEmail = async () => {
    try {
      const res = await postAPIAuth(
        "verify-email",
        {
          token: varifyToken,
        },
        token,
        addToast
      );
      if (res.status === 200) {
        addToast("Email Varified Success", {
          appearance: "success",
          autoDismiss: true,
        });
        router.push("/profile/change-email");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancelVarification = async () => {
    try {
      setCancelConfirmationLoading(true);
      const res = await postAPIAuth(
        "user/cancel-email",
        {
          email: emailInfo.email,
        },
        token,
        addToast
      );
      if (res.status === 200) {
        setCancelConfirmationLoading(false);
        getEmailInfo();
        addToast("Email Verification Cancel", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      setCancelConfirmationLoading(false);
      console.log(error);
    } finally {
      setCancelConfirmationLoading(false);
    }
  };

  useEffect(() => {
    getEmailInfo();
  }, [varifyToken]);

  useEffect(() => {
    if (varifyToken) {
      varifyEmail();
    }
  }, []);

  return (
    <>
      <Container py={5}>
        <Grid container spacing={2}>
          <Grid item lg={8} md={7} xs={12}>
            <Box
              sx={{ border: "1px solid #c7c7c7", borderRadius: "6px" }}
              p={5}
            >
              <Box pb={2}>
                <H3 mb={3}>Email</H3>
                <Typography component="div">
                  <H4>Current email</H4>
                  <Typography sx={{ color: "#000", fontSize: "16px" }}>
                    {emailInfo && emailInfo.email}
                  </Typography>
                </Typography>
                <Typography component="div" pt={2}>
                  <H4>Status</H4>
                  <Typography sx={{ color: "#000", fontSize: "16px" }}>
                    {emailInfo && emailInfo.status}
                  </Typography>
                </Typography>

                {emailInfo && emailInfo.status === "Pending" && (
                  <Typography component="div" mt={1}>
                    <Button
                      disabled={resendConfirmationLoading ? true : false}
                      onClick={() => sendConfirmationEmail()}
                      sx={{
                        borderRadius: "30px",
                        textTransform: "math-auto",
                        background: "#000",
                        color: "#fff",
                        padding: "5px 15px",
                        "&:hover": {
                          background: "#000",
                          boxShadow: "0 0 3px #000",
                        },
                      }}
                    >
                      Resend confirmation email
                    </Button>

                    {emailInfo.showCancelButton && (
                      <Button
                        disabled={cancelConfirmationLoading ? true : false}
                        onClick={() => cancelVarification()}
                        sx={{
                          borderRadius: "30px",
                          textTransform: "math-auto",
                          marginLeft: "15px",
                          background: "#fff",
                          boxShadow: "0 0 3px #000",
                          color: "#000",
                          padding: "5px 15px",
                          "&:hover": {
                            boxShadow: "0 0 3px #000",
                          },
                        }}
                      >
                        Cancel email change
                      </Button>
                    )}
                  </Typography>
                )}
              </Box>
              {emailInfo?.status === "Confirmed" && <Divider />}
              {emailInfo?.status === "Confirmed" && (
                <Box pt={2}>
                  <H3 mb={3}>Change your email</H3>
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item lg={6} md={6} xs={12}>
                        <form onSubmit={formik.handleSubmit}>
                          <FormControl fullWidth sx={{ marginBottom: "15px" }}>
                            <TextField
                              fullWidth
                              name="New_email"
                              label="New email"
                              value={formik.values.New_email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                formik.touched.New_email &&
                                Boolean(formik.errors.New_email)
                              }
                              helperText={
                                formik.touched.New_email &&
                                formik.errors.New_email
                              }
                            />
                          </FormControl>

                          <FormControl fullWidth sx={{ marginBottom: "15px" }}>
                            <TextField
                              fullWidth
                              name="Confirm_new_email"
                              label="Confirm new email"
                              value={formik.values.Confirm_new_email}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                formik.touched.Confirm_new_email &&
                                Boolean(formik.errors.Confirm_new_email)
                              }
                              helperText={
                                formik.touched.Confirm_new_email &&
                                formik.errors.Confirm_new_email
                              }
                            />
                          </FormControl>

                          <FormControl fullWidth sx={{ marginBottom: "15px" }}>
                            <TextField
                              fullWidth
                              name="Your_ecomm_password"
                              label="Your ecomm password"
                              type="password"
                              value={formik.values.Your_ecomm_password}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={
                                formik.touched.Your_ecomm_password &&
                                Boolean(formik.errors.Your_ecomm_password)
                              }
                              helperText={
                                formik.touched.Your_ecomm_password &&
                                formik.errors.Your_ecomm_password
                              }
                            />
                          </FormControl>

                          <Box  sx ={{display:'flex' ,gap:"5px"}} >
                          <Typography    component="div" pb={1}>
                              <Button
                                disabled={loading ? true : false}
                                type="submit"
                                sx={{
                                  borderRadius: "30px",
                                  textTransform: "math-auto",
                                  background: "#000",
                                  color: "#fff",
                                  textWrap : "nowrap",
                                  padding: "5px 15px",
                                  "&:hover": {
                                    background: "#000",
                                    boxShadow: "0 0 3px #000",
                                  },
                                }}
                              >
                                {loading ? (
                                  <CircularProgress />
                                ) : (
                                  "Change Email"
                                )}
                              </Button>
                            </Typography>

                            <Typography    component="div" pb={1}>
                              <Button
                                disabled={loading ? true : false}
                                onClick={() => router.push("/reset-password")}
                                type="button"
                                sx={{
                                  borderRadius: "30px",
                                  textTransform: "math-auto",
                                  background: "#000",
                                  textWrap : "nowrap",
                                  color: "#fff",
                                  padding: "5px 15px",
                                  "&:hover": {
                                    background: "#000",
                                    boxShadow: "0 0 3px #000",
                                  },
                                }}
                              >
                              Reset Password
                              </Button>
                            </Typography>
                          </Box>
                        </form>

                        <Typography>
                          Your emila address will not change until you Confirm
                          it via email.
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ChangeEmail;
