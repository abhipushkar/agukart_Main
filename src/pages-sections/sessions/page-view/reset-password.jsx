"use client";

import { Fragment, use, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as yup from "yup";
// LOCAL CUSTOM COMPONENT

import BoxLink from "../components/box-link";
// GLOBAL CUSTOM COMPONENTS

import { H3 } from "components/Typography";
import { Typography } from "@mui/material";
import { FlexRowCenter } from "components/flex-box";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";
const ResetPassword = () => {
  const { token } = useAuth();
  const router = useRouter();

  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  // FORM FIELD INITIAL VALUE
  const initialValues = {
    email: "",
  };

  const { addToast } = useToasts();
  // FORM FIELD VALIDATION SCHEMA

  const validationSchema = yup.object().shape({
    email: yup.string().email("invalid email").required("Email is required"),
  });
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const res = await postAPIAuth(
          "send-passaword-reset-link",
          {
            email: values.email,
          },
          "",
          addToast
        );

        if (res.status === 200) {
          setShowMessage(true);
          addToast("Reset Link Sent To Your Email", {
            appearance: "success",
            autoDismiss: true,
          });
          setLoading(false);
        }

        resetForm();
      } catch (error) {
        setLoading(false);
        console.log(error);
      } finally {
        setLoading(false);
      }
    },
  });


  return (
    <Fragment style={{ width: "600px" }}>
      <H3 mb={1} textAlign="center">
        Reset your password
      </H3>
      <Typography color={"#000"} textAlign={"center"}>
        Enter your email address and we'll send you a link to reset your
        password.
      </Typography>
      <Box
        onSubmit={handleSubmit}
        component="form"
        mt={3}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          fullWidth
          name="email"
          type="email"
          label="Email"
          onBlur={handleBlur}
          value={values.email}
          onChange={handleChange}
          helperText={touched.email && errors.email}
          error={Boolean(touched.email && errors.email)}
        />
        <Button
          disabled={loading ? true : false}
          fullWidth
          type="submit"
          color="primary"
          variant="contained"
          endIcon={
            loading && (
              <CircularProgress
                sx={{
                  color: "white",
                }}
                size={18}
              />
            )
          }
        >
          {!loading ? "Reset" : ""}
        </Button>
      </Box>

      {/* BOTTOM LINK AREA */}
      <FlexRowCenter mt={3} justifyContent="center" gap={1}>
        Don&apos;t have an account?
        <BoxLink title="Register" href="/register" />
      </FlexRowCenter>
      <FlexRowCenter mt={3} justifyContent="center" gap={1}>
        <Button
          onClick={() => router.push("/login")}
          color="primary"
          variant="contained"
          sx={{ background: "#000", borderRadius: "30px" }}
        >
          Email me a sign-in link
        </Button>
      </FlexRowCenter>
    </Fragment>
  );
};

export default ResetPassword;
