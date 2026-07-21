import Link from "next/link";
import { Fragment } from "react";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { InputBase } from "@mui/material";
import LazyImage from "components/LazyImage";
// MUI ICON COMPONENT
import { Message } from "@mui/icons-material";
import Clear from "@mui/icons-material/Clear";
// CUSTOM ICON COMPONENTS

import Icon from "icons";
// LOCAL CUSTOM COMPONENTS

import DialogDrawer from "./dialog-drawer";
// GLOBAL CUSTOM COMPONENTS

import Image from "components/BazaarImage";
import { Paragraph } from "components/Typography";
import { SearchInput } from "components/search-box";
import { MobileMenu } from "components/navbar/mobile-menu";
import { FlexBetween, FlexBox } from "components/flex-box";
// GLOBAL CUSTOM HOOK
import useAuth from "hooks/useAuth";
import useChat from "hooks/useChat";
import useCart from "hooks/useCart";
// LOCAL CUSTOM HOOK

import useHeader from "../hooks/use-header";
import LoginCartButtons from "./login-cart-buttons";
export default function MobileHeader({ midSlot }) {
  const { state } = useCart();
  const { token } = useAuth();
  const { showCount, etsyCount } = useChat();
  console.log(showCount, etsyCount, showCount + etsyCount);
  const {
    dialogOpen,
    sidenavOpen,
    searchBarOpen,
    toggleDialog,
    toggleSearchBar,
    toggleSidenav,
  } = useHeader();
  const ICON_STYLE = {
    color: "grey.600",
    fontSize: 20,
  };
  return (
    <Fragment>
      <FlexBetween width="100%" sx={{ flexDirection: "column", gap: { sm: 0.5 } }}>
        {/* LEFT CONTENT - NAVIGATION ICON BUTTON */}

        {/* MIDDLE CONTENT - LOGO */}
        {/* <Link href="/">
          <Image
            height={44}
            src="/assets/images/bazaar-black-sm.svg"
            alt="logo"
          />
        </Link> */}

        {/* RIGHT CONTENT - LOGIN, CART, SEARCH BUTTON */}
        <FlexBox justifyContent="end" flex={1} sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              pt: 1,
              justifyContent: "space-between",
              width: "100%",
              position: { xs: "relative", sm: "relative" },
              top: { xs: 5, sm: 10 }
            }}
          >
            <Box component={Link} href='/' width={'130px'}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50" width="150" height="50">
                <rect width="150" height="50" fill="transparent" />

                <text
                  x="75"
                  y="30"
                  fontFamily="'Constania', 'Playfair Display', Georgia, serif"
                  fontSize="26"
                  fontWeight="700"
                  fill="#3a3949"
                  letterSpacing="1.5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  shapeRendering="geometricPrecision"
                  style={{
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                    fontVariantNumeric: 'proportional-nums',
                  }}
                >
                  Agukart
                </text>
              </svg>
            </Box>
            <FlexBox>
              {token && (
                <Badge badgeContent={showCount + etsyCount} color="primary"
                  sx={{
                    "& .MuiBadge-badge.MuiBadge-invisible": {
                      transform: undefined,
                    },
                    "& .MuiBadge-badge:not(.MuiBadge-invisible)": {
                      transform: "translate(4px, -3px)",
                    },
                  }}
                >
                  <IconButton component={Link} href='/messages' aria-label="" sx={{ color: "grey.600" }}>
                    <Message />
                  </IconButton>
                </Badge>
              )}
              <LoginCartButtons
                toggleDialog={toggleDialog}
                toggleSidenav={toggleSidenav}
              />
            </FlexBox>
          </Box>
        </FlexBox>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "20px"
          }}
        >
          <Box flex={1}>
            <MobileMenu />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            {midSlot}
          </Box>
        </Box>
      </FlexBetween>

      {/* SEARCH FORM DRAWER */}
      <Drawer
        open={searchBarOpen}
        anchor="top"
        onClose={toggleSearchBar}
        sx={{
          zIndex: 9999,
        }}
      >
        <Box width="auto" padding={2} height="100vh">
          <FlexBetween mb={1}>
            <Paragraph>Search to Bazaar</Paragraph>

            <IconButton onClick={toggleSearchBar}>
              <Clear />
            </IconButton>
          </FlexBetween>

          {/* CATEGORY BASED SEARCH FORM */}
          <SearchInput />
        </Box>
      </Drawer>

      {/* LOGIN FORM DIALOG AND CART SIDE BAR  */}
      <DialogDrawer
        dialogOpen={dialogOpen}
        sidenavOpen={sidenavOpen}
        toggleDialog={toggleDialog}
        toggleSidenav={toggleSidenav}
      />
    </Fragment>
  );
}
