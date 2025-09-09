"use client"

import { Box, Button, TextField, Typography } from "@mui/material";
import { H3 } from "components/Typography";
import { useFormik } from "formik";
import React, { Fragment, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { CircularProgress } from "@mui/material";

import * as yup from "yup";
const ResetPass = () => {
  const [loading, setLoading] = useState(false);
  // FORM FIELD INITIAL VALUE
  const initialValues = {
    email: "",
  };

  const { addToast } = useToasts();

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
        Reset your Email
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
    </Fragment>
  );
};

export default ResetPass;
