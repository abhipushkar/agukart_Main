"use client";

import { Fragment, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import * as yup from "yup";
// LOCAL CUSTOM COMPONENT

import BoxLink from "../components/box-link";
// GLOBAL CUSTOM COMPONENTS

import { H3 } from "components/Typography";
import { FlexRowCenter } from "components/flex-box";
import { postAPI, postAPIAuth } from "utils/__api__/ApiServies";
import EyeToggleButton from "../components/eye-toggle-button";
import { usePathname } from "next/navigation";
import { Router } from "next/router";
import useAuth from "hooks/useAuth";
import useMyProvider from "hooks/useMyProvider";
import { useToasts } from "react-toast-notifications";
import { TOKEN_NAME, USER_DETAILS } from "constant";
import { CircularProgress } from "@mui/material";

const ChangePassword = () => {
  // FORM FIELD INITIAL VALUE

  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [confirmPass, setShowConfirm] = useState(false);
  const { setToken } = useAuth();
  const { setUserCredentials } = useMyProvider();
  const initialValues = {
    newPass: "",
    confirmPass: "",
  };
  // FORM FIELD VALIDATION SCHEMA

  const validationSchema = yup.object().shape({
    newPass: yup
      .string()
      .required("Password is required")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])(?=.*[a-zA-Z]).{8,}$/,
        "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character, and be at least 8 characters long"
      ),
    confirmPass: yup
      .string()
      .oneOf([yup.ref("newPass"), null], "Passwords must match")
      .required("Please re-type password"),
  });

  const pathName = usePathname();
  const id = pathName.split("id=");
  const router = useRouter();

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues,
      validationSchema,
      onSubmit: async (values) => {
        try {
          setLoading(true);
          const res = await postAPIAuth(
            "reset-password",
            {
              token: id[1],
              newPassword: values.newPass,
            },
            "",
            addToast
          );
          if (res.status === 200) {
            // router.push("/login")

            localStorage.removeItem(TOKEN_NAME);
            localStorage.removeItem(USER_DETAILS);
            document.cookie =
              "TOKEN_NAME=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
            router.push("/login");
            setToken("");
            setUserCredentials("");
            addToast("Change Password Sucessfully!", {
              appearance: "success",
              autoDismiss: true,
            });

            setLoading(false);
          }
        } catch (error) {
          if (error.response.status === 400) {
            router.push("/notfound");
          }
          setLoading(false);
          console.log(error);
        } finally {
          setLoading(false);
        }
      },
    });

  const togglePasswordVisible = () => {
    setVisiblePassword((prv) => !prv);
  };

  const validateToken = async () => {
    try {
      const res = await postAPIAuth(
        "reset-password",
        {
          token: id[1],
          check: true,
        },
        "",
        addToast
      );

      console.log(res, "validate check---");
    } catch (error) {
      if (error.response.status === 400) {
        router.push("/notfound");
      }
    }
  };

  useEffect(() => {
    validateToken();
  }, []);
  return (
    <Fragment>
      <H3 mb={3} textAlign="center">
        Reset your password
      </H3>

      <Box
        onSubmit={handleSubmit}
        component="form"
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TextField
          fullWidth
          name="newPass"
          type={visiblePassword ? "text" : "password"}
          label="New Password"
          onBlur={handleBlur}
          value={values.newPass}
          onChange={handleChange}
          helperText={touched.newPass && errors.newPass}
          error={Boolean(touched.newPass && errors.newPass)}
          InputProps={{
            endAdornment: (
              <EyeToggleButton
                show={visiblePassword}
                click={togglePasswordVisible}
              />
            ),
          }}
        />
        <TextField
          fullWidth
          name="confirmPass"
          type={confirmPass ? "text" : "password"}
          label="Confirm PassWord"
          onBlur={handleBlur}
          value={values.confirmPass}
          onChange={handleChange}
          helperText={touched.confirmPass && errors.confirmPass}
          error={Boolean(touched.confirmPass && errors.confirmPass)}
          InputProps={{
            endAdornment: (
              <EyeToggleButton
                show={confirmPass}
                click={() => setShowConfirm((prv) => !prv)}
              />
            ),
          }}
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
          {!loading ? "Reset Password" : ""}
        </Button>
      </Box>

      {/* BOTTOM LINK AREA */}
    </Fragment>
  );
};

export default ChangePassword;
