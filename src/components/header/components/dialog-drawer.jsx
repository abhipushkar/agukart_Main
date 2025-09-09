import { Fragment } from "react";
import Dialog from "@mui/material/Dialog";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IconButton } from "@mui/material";
import { LoginPageView } from "pages-sections/sessions/page-view";
// GLOBAL CUSTOM COMPONENTS

import { MiniCart } from "components/mini-cart";
// LOGIN PAGE SECTIONS

import { Wrapper } from "pages-sections/sessions/styles";
import LogoWithTitle from "pages-sections/sessions/components/logo-title";
import LoginBottom from "pages-sections/sessions/components/login-bottom";
import SocialButtons from "pages-sections/sessions/components/social-buttons";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CloseIcon from "@mui/icons-material/Close";
import { Box } from "@mui/material";
export default function DialogDrawer(props) {
  const { dialogOpen, sidenavOpen, toggleDialog, toggleSidenav } = props;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  console.log(process.env.NEXT_PUBLIC_CLIENT_ID,"drfghg4rhrhrthrthrthrthrt")
  return (
    <Fragment>
      <Dialog
        scroll="body"
        open={dialogOpen}
        fullWidth={isMobile}
        onClose={toggleDialog}
        sx={{
          zIndex: 9999,
        }}
      >
        <Wrapper sx={{ position: "relative" }}>
          <Box>
            <IconButton
              sx={{
                position: "absolute",
                right: "30px",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
              onClick={ () => toggleDialog()}
            >
              <CloseIcon
                sx={{
                  width: "30px",
                  height: "30px",
                }}
              />
            </IconButton>
          </Box>
          <LogoWithTitle />
          <LoginPageView closeDialog={toggleDialog} />
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}>
            <SocialButtons closeDialog={toggleDialog} />
          </GoogleOAuthProvider>
          <LoginBottom />
        </Wrapper>
      </Dialog>

      <Drawer
        open={sidenavOpen}
        anchor="right"
        onClose={toggleSidenav}
        sx={{
          zIndex: 9999,
        }}
      >
        <MiniCart toggleSidenav={toggleSidenav} />
      </Drawer>
    </Fragment>
  );
}
