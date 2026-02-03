"use client";

import Button from "@mui/material/Button";
import { useFormik } from "formik";
import * as yup from "yup";
import useAuth from "hooks/useAuth";
import useMyProvider from "hooks/useMyProvider";
import { useToasts } from "react-toast-notifications";
import useHeader from "components/header/hooks/use-header";
// LOCAL CUSTOM COMPONENTS

import EyeToggleButton from "../components/eye-toggle-button";
// LOCAL CUSTOM HOOK

import usePasswordVisible from "../use-password-visible";
// import { parsePhoneNumberFromString } from 'libphonenumber-js';
import parsePhoneNumberFromString from "libphonenumber-js";
// GLOBAL CUSTOM COMPONENTS

import BazaarTextField from "components/BazaarTextField";
import { postAPI } from "utils/__api__/ApiServies";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// ==============================================================

// ==============================================================
const LoginPageView = ({ closeDialog = () => {} }) => {
  const { visiblePassword, togglePasswordVisible } = usePasswordVisible();
  const { addToast } = useToasts();
  const { toggleDialog, setDialogOpen } = useHeader();
  // console.log("toggleedsasdsas", setDialogOpen);
  // LOGIN FORM FIELDS INITIAL VALUES

  const initialValues = {
    contact: "",
    password: "",
  };
  const { token, setToken } = useAuth();
  const { usercredentials, setUserCredentials } = useMyProvider();

  // LOGIN FORM FIELD VALIDATION SCHEMA

  const isValidPhoneNumber = (number) => {
    const phoneNumberPattern = /^[0-9]{10}$/;
    return phoneNumberPattern.test(number);
  };

  const validationSchema = yup.object().shape({
    password: yup.string().required("Password is required"),
    contact: yup
      .string()
      .required("Email is required")
      .test(
        "is-valid-contact",
        "Invalid email or phone number format",
        (value) =>
          yup.string().email().isValidSync(value) || isValidPhoneNumber(value)
      ),
  });
  const router = useRouter();
  const HandleFormLogin = async (values, reset) => {
    try {
      const isPhoneNumber = isValidPhoneNumber(values.contact);
      const param = isPhoneNumber
        ? { email: values.contact, password: values.password }
        : { email: values.contact, password: values.password };
      console.log("paramparamparamparam", param);
      const res = await postAPI("login", param);
      console.log("loginnnres", res);
      if (res.status == 200) {
        console.log("ressss", res);
        // setDialogOpen(false);
        setToken(res?.data?.user?.auth_key);
        setUserCredentials(res?.data?.user);
        addToast("User Login Sucessfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        resetForm();
        closeDialog(false);
        router.push("/");
      }
    } catch (error) {
      console.log("error", error);
      addToast(error?.response?.data?.message, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

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
    onSubmit: (values) => {
      console.log(values);
      // closeDialog?.();
      HandleFormLogin(values, resetForm);
    },
  });

  useEffect(() => {
    if (token) {
      router.push("/");
    }
  }, []);
  return (
    <form onSubmit={handleSubmit}>
      <BazaarTextField
        mb={1.5}
        fullWidth
        name="contact"
        size="small"
        type="text"
        variant="outlined"
        onBlur={handleBlur}
        value={values.contact}
        onChange={handleChange}
        label={
          <span>
            Email  <span style={{ color: "red" }}>*</span>
          </span>
        }
        placeholder="example@mail.com"
        helperText={touched.contact && errors.contact}
        error={Boolean(touched.contact && errors.contact)}
      />

      <BazaarTextField
        mb={2}
        fullWidth
        size="small"
        name="password"
        label={
          <span>
            Password <span style={{ color: "red" }}>*</span>
          </span>
        }
        autoComplete="on"
        variant="outlined"
        onBlur={handleBlur}
        onChange={handleChange}
        value={values.password}
        placeholder="*********"
        type={visiblePassword ? "text" : "password"}
        helperText={touched.password && errors.password}
        error={Boolean(touched.password && errors.password)}
        InputProps={{
          endAdornment: (
            <EyeToggleButton
              show={visiblePassword}
              click={togglePasswordVisible}
            />
          ),
        }}
      />

      <Button
        fullWidth
        type="submit"
        color="primary"
        variant="contained"
        size="large"
      >
        Login
      </Button>
    </form>
  );
};

export default LoginPageView;
