"use client";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ErrorMessage, useFormik } from "formik";
import * as yup from "yup";
import { postAPI } from "utils/__api__/ApiServies";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./style.css";
// LOCAL CUSTOM COMPONENTS

import EyeToggleButton from "../components/eye-toggle-button";
// LOCAL CUSTOM HOOK

import BoxLink from "../components/box-link";
import usePasswordVisible from "../use-password-visible";
// GLOBAL CUSTOM COMPONENTS

import { Span } from "components/Typography";
import { FlexBox } from "components/flex-box";
import BazaarTextField from "components/BazaarTextField";
import { Padding } from "@mui/icons-material";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useEffect, useState } from "react";
import useAuth from "hooks/useAuth";
import { CircularProgress } from "@mui/material";

const RegisterPageView = () => {
  const { visiblePassword, togglePasswordVisible } = usePasswordVisible();
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [disableButton, setDisableButton] = useState(false);
  const { addToast } = useToasts();
  // COMMON INPUT PROPS FOR TEXT FIELD
  const splitCountryCode = (number) => {
    console.log("phoneNumberphoneNumberphoneNumberphoneNumber", number);
    if (!number.startsWith("+")) {
      number = "+" + number;
    }
    const phoneNumber = parsePhoneNumberFromString(number);
    console.log("phoneNumberphoneNumber", phoneNumber);
    if (phoneNumber) {
      return {
        countryCode: phoneNumber.countryCallingCode,
        phoneNumber: phoneNumber.nationalNumber,
      };
    }
    return {
      countryCode: "",
      phoneNumber: number,
    };
  };

  const inputProps = {
    endAdornment: (
      <EyeToggleButton show={visiblePassword} click={togglePasswordVisible} />
    ),
  };
  const inputProps2 = {
    endAdornment: (
      <EyeToggleButton
        show={visibleConfirm}
        click={() => setVisibleConfirm((prv) => !prv)}
      />
    ),
  };
  // REGISTER FORM FIELDS INITIAL VALUES

  const initialValues = {
    name: "",
    email: "",
    password: "",
    re_password: "",
    agreement: false,
    pincode: "",
  };
  // REGISTER FORM FIELD VALIDATION SCHEMA

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .matches(
        /^[aA-zZ\s]+$/,
        "Invalid name: Only alphabets and spaces are allowed"
      )
      .required("Full name is required"),
    email: yup.string().email("invalid email").required("Email is required"),
    number: yup.string().required("Number is required"),
    // .matches(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
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
    agreement: yup
      .boolean()
      .oneOf([true], "You must accept the terms and conditions to proceed"),
  });
  const router = useRouter();
  const handleFormSubmit = async (values, resetForm) => {
    try {
      setDisableButton(true);
      if (values.agreement) {
        const { countryCode, phoneNumber } = splitCountryCode(values.number);
        console.log("hddshfjdfjscountryCode", { countryCode, phoneNumber });
        const Param = {
          name: `${values.name}`,
          email: `${values.email}`,
          mobile: `${phoneNumber}`,
          password: `${values.password}`,
          confirm_password: `${values.re_password}`,
          phone_code: `+${countryCode}`,
        };
        const res = await postAPI("registraion", Param);
        console.log("--------------------a", res);
        if (res?.status == 200) {
          // toast(res?.data?.message);
          resetForm();
          router.push("/login");
          setDisableButton(false);
          addToast("User Register Sucessfully!", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      }
    } catch (error) {
      setDisableButton(false);
      console.log("erorrrrr", error);
      addToast(error?.response?.data?.message, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setDisableButton(false);
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
      handleFormSubmit(values, resetForm);
    },
  });

  const { token } = useAuth();
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
        name="name"
        size="small"
        label={
          <span>
            Full Name <span style={{ color: "red" }}>*</span>
          </span>
        }
        variant="outlined"
        onBlur={handleBlur}
        value={values.name}
        onChange={handleChange}
        placeholder="Full Name"
        error={!!touched.name && !!errors.name}
        helperText={touched.name && errors.name}
      />

      <BazaarTextField
        mb={1.5}
        fullWidth
        name="email"
        size="small"
        type="email"
        variant="outlined"
        onBlur={handleBlur}
        value={values.email}
        onChange={handleChange}
        label={
          <span>
            Email <span style={{ color: "red" }}>*</span>
          </span>
        }
        placeholder="exmple@mail.com"
        error={!!touched.email && !!errors.email}
        helperText={touched.email && errors.email}
      />

      <div className="phone-input-container">
        <label htmlFor="phone-input">
          Phone Number <span style={{ color: "red" }}>*</span>
        </label>
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
        />
        {touched.number && errors.number && (
          <div className="error-text">{errors.number}</div>
        )}
      </div>

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
        type={visiblePassword ? "text" : "password"}
        error={!!touched.password && !!errors.password}
        helperText={touched.password && errors.password}
        InputProps={inputProps}
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
        type={visibleConfirm ? "text" : "password"}
        error={!!touched.re_password && !!errors.re_password}
        helperText={touched.re_password && errors.re_password}
        InputProps={inputProps2}
      />

      <FormControlLabel
        name="agreement"
        className="agreement"
        onChange={handleChange}
        control={
          <Checkbox
            size="small"
            onBlur={handleBlur}
            color="secondary"
            checked={values.agreement || false}
          />
        }
        label={
          <FlexBox
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-start"
            gap={1}
          >
            <Span
              display={{
                sm: "inline-block",
                xs: "none",
              }}
            >
              By signing up, you agree to
            </Span>
            <Span
              display={{
                sm: "none",
                xs: "inline-block",
              }}
            >
              Accept Our
            </Span>
            <BoxLink title="Terms & Condition" href="/terms-condition" />
          </FlexBox>
        }
      />
      {touched.agreement && errors.agreement && (
        <div
          style={{
            fontSize: "12px",
            color: "#e94560",
            marginLeft: "17px",
            marginTop: "-28px",
            marginBottom: "24px",
          }}
          className="error"
        >
          {errors.agreement}
        </div>
      )}

      <Button
        // onClick={handleterms}
        fullWidth
        type="submit"
        color="primary"
        variant="contained"
        size="large"
        disabled={disableButton && true}
      >
        {disableButton ? <CircularProgress size={"20px"} /> : "Create Account"}
      </Button>
    </form>
  );
};

export default RegisterPageView;
