import { Fragment, useRef } from "react";
import Image from "next/image";
// MUI

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
// CUSTOM COMPONENTS

import { Span } from "components/Typography";
// IMPORT IMAGES

import googleLogo from "../../../../public/assets/images/icons/google-1.svg";
import facebookLogo from "../../../../public/assets/images/icons/facebook-filled-white.svg";
// =======================================
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import useMyProvider from "hooks/useMyProvider";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";

// =======================================
export default function SocialButtons({ closeDialog }) {
  const { token, setToken } = useAuth();
  const { setUserCredentials } = useMyProvider();
  const { addToast } = useToasts();
  const router = useRouter();
  const handleLoginSuccess = async (credentialResponse) => {
    console.log(credentialResponse, "it enter in");
    // console.log(jwtDecode(credentialResponse.access_token),"decoded totken");
    const Token = credentialResponse.access_token;

    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );
      const userData = {
        email: response.data.email,
        name: response.data.name,
        picture: response.data.picture,
      };

      try {
        const res = await postAPIAuth("social-login", userData, token);
        console.log("decodedTokendecodedToken", res);

        if (res.status === 200) {
          setToken(res?.data?.user?.auth_key);
          setUserCredentials(res?.data?.user);
          router.push("/");
          if (closeDialog) {
            closeDialog();
          }
          addToast(res?.data?.message, {
            appearance: "success",
            autoDismiss: true,
          });
        }
      } catch (error) {
        console.log(error, "whatlejljljdjfj");
        addToast(error?.response?.data?.message, {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast("Somthing Went Wrong", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleLoginError = () => {
    console.log("Login Failed");
  };

  const CustomGoogleOAuthButton = ({ onSuccess, onError }) => {
    return (
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        style={{ width: "100%" }}
        className="google-login-button"
      />
    );
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => handleLoginSuccess(tokenResponse),
    onError: () => {
      addToast("Somthing Went Wrong", {
        appearance: "error",
        autoDismiss: true,
      });
    },
  });
  return (
    <Fragment>
      {/* DIVIDER */}
      <Box my={3}>
        <Divider>
          <Span lineHeight={1} px={1}>
            or
          </Span>
        </Divider>
      </Box>

      {/* FACEBOOK BUTTON */}

      {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}> */}
      <Button
        onClick={() => login()}
        fullWidth
        size="large"
        className="googleButton"
        sx={{
          fontSize: 12,
          color: "white",
        }}
        startIcon={<Image alt="facebook" src={googleLogo} />}
      >
        Continue with Google
      </Button>
      {/* </GoogleOAuthProvider> */}

      <Box
        // ref={googleRef}
        sx={
          {
            // display: "none",
          }
        }
      >
        {/* <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}>
          <CustomGoogleOAuthButton
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        </GoogleOAuthProvider> */}
      </Box>
    </Fragment>
  );
}
