"use client";

import { Fragment, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as yup from "yup";
import useAuth from "hooks/useAuth";

// LOCAL CUSTOM COMPONENT

import BoxLink from "pages-sections/sessions/components/box-link";
// GLOBAL CUSTOM COMPONENTS

import { H3 } from "components/Typography";
import { FlexRowCenter } from "components/flex-box";
import BazaarTextField from "components/BazaarTextField";
import usePasswordVisible from "pages-sections/sessions/use-password-visible";
import EyeToggleButton from "pages-sections/sessions/components/eye-toggle-button";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
const ChangePasswords = () => {

  const { visiblePassword, togglePasswordVisible } = usePasswordVisible();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPassword] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const { addToast } = useToasts();
  const router = useRouter();
  const inputProps = {
    endAdornment: (
      <EyeToggleButton show={visiblePassword} click={togglePasswordVisible} />
    ),
  };
  const showInputProps = {
    endAdornment: (
      <EyeToggleButton
        show={showPassword}
        click={() => setShowPassword((prv) => !prv)}
      />
    ),
  };
  const ConfirminputProps = {
    endAdornment: (
      <EyeToggleButton
        show={showConfirmPass}
        click={() => setShowConfirmPassword((prv) => !prv)}
      />
    ),
  };

  // FORM FIELD INITIAL VALUE
  const initialValues = {
    oldPasswords: "",
    password: "",
    re_password: "",
  };

  const { token } = useAuth();
  // FORM FIELD VALIDATION SCHEMA

  const validationSchema = yup.object().shape({
    oldPasswords: yup.string().required("Old Password is required"),
    password: yup
      .string()
      .required("Password is required")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long"
      ),
    re_password: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Please re-type password"),
  });
  const handllesubmit = async (values, resetForm) => {
    // handle form submission logic here
    // console.log(values);

    try {
      setDisableButton(true);
      const param = {
        oldPassword: `${values.oldPasswords}`,
        newPassword: `${values.password}`,
        confirmPassword: `${values.re_password}`,
      };
      const res = await postAPIAuth("user/change-password", param, token);
      console.log("sadasfdfsdffsdress", res);
      if ((res.status = 200)) {
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
        resetForm();
        router.push("/profile");
      }
    } catch (error) {
      console.log("errorr", error);
      setDisableButton(false);
    } finally {
      setDisableButton(false);
    }
  };
  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: (values, { resetForm }) => {
        handllesubmit(values, resetForm);
      },
    });
  return (
    <Fragment>
      <H3 mb={3} textAlign="center">
        Change Your Password
      </H3>

      {/* FORM AREA */}
      <Box
        onSubmit={handleSubmit}
        component="form"
        display="flex"
        flexDirection="column"
        gap={2}
      >
        {/* <TextField fullWidth name="email" type="email" label="Email" onBlur={handleBlur} value={values.email} onChange={handleChange} helperText={touched.email && errors.email} error={Boolean(touched.email && errors.email)} /> */}

        <BazaarTextField
          mb={1.5}
          fullWidth
          size="small"
          name="oldPasswords"
          label={
            <span>
              Old Password <span style={{ color: "red" }}>*</span>
            </span>
          }
          variant="outlined"
          autoComplete="on"
          placeholder="*********"
          onBlur={handleBlur}
          onChange={handleChange}
          value={values.oldPasswords}
          type={visiblePassword ? "text" : "password"}
          error={!!touched.oldPasswords && !!errors.oldPasswords}
          helperText={touched.oldPasswords && errors.oldPasswords}
          InputProps={inputProps}
        />

        <BazaarTextField
          mb={1.5}
          fullWidth
          size="small"
          name="password"
          label={
            <span>
              Password <span style={{ color: "red" }}>*</span>
            </span>
          }
          variant="outlined"
          autoComplete="on"
          placeholder="*********"
          onBlur={handleBlur}
          onChange={handleChange}
          value={values.password}
          type={showPassword ? "text" : "password"}
          error={!!touched.password && !!errors.password}
          helperText={touched.password && errors.password}
          InputProps={showInputProps}
        />

        <BazaarTextField
          fullWidth
          size="small"
          autoComplete="on"
          name="re_password"
          variant="outlined"
          label={
            <span>
              Retype Password <span style={{ color: "red" }}>*</span>
            </span>
          }
          placeholder="*********"
          onBlur={handleBlur}
          onChange={handleChange}
          value={values.re_password}
          type={showConfirmPass ? "text" : "password"}
          error={!!touched.re_password && !!errors.re_password}
          helperText={touched.re_password && errors.re_password}
          InputProps={ConfirminputProps}
        />

        <Button
          disabled={disableButton}
          fullWidth
          type="submit"
          color="primary"
          variant="contained"
        >
          {!disableButton ? "Upadate Password" : <CircularProgress size={"20px"}  />}
        </Button>
      </Box>

      {/* BOTTOM LINK AREA */}
    </Fragment>
  );
};

export default ChangePasswords;
