import Link from "next/link";
import { Fragment } from "react";
import useTheme from "@mui/material/styles/useTheme";
import useMediaQuery from "@mui/material/useMediaQuery";
import clsx from "clsx";
// LOCAL CUSTOM HOOKS

import useHeader from "./hooks/use-header";
// GLOBAL CUSTOM COMPONENTS

import LazyImage from "components/LazyImage";
import FlexBox from "components/flex-box/flex-box";
// LOCAL CUSTOM COMPONENTS

import MobileHeader from "./components/mobile-header";
import DialogDrawer from "./components/dialog-drawer";
import CategoriesMenu from "./components/categories-menu";
import LoginCartButtons from "./components/login-cart-buttons";
// STYLED COMPONENTS
import Topbar from "components/topbar/top-bar";
import { HeaderWrapper, StyledContainer } from "./styles";
import Typography from '@mui/material/Typography';
import useMyProvider from "hooks/useMyProvider";
import useAuth from "hooks/useAuth";
import LocationSelector from "./components/location_selector";
import IconButton from '@mui/material/IconButton'
import { Favorite, Message } from "@mui/icons-material";
import { Badge, Box } from "@mui/material";
import useChat from "hooks/useChat";
import { ImgBox } from "components/product-cards/product-card-6/styles";
// ==============================================================

// ==============================================================
export default function Header({ isFixed, className, midSlot }) {
  const { usercredentials } = useMyProvider();
  const { token } = useAuth();
  const { showCount, etsyCount } = useChat();
  const messageCount = (showCount || 0) + (etsyCount || 0)
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down(1150));
  const { dialogOpen, sidenavOpen, toggleDialog, toggleSidenav } = useHeader();
  const CONTENT_FOR_LARGE_DEVICE = (
    <Fragment>
      <FlexBox minWidth={100} alignItems="center">
        <Link href="/">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" width="160" height="60">
            <rect width="160" height="60" fill="transparent" />

            <text
              x="80"
              y="34"
              fontFamily="'Constania', 'Playfair Display', Georgia, serif"
              fontSize="30"
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
        </Link>

        {isFixed ? <CategoriesMenu /> : null}
      </FlexBox>
      {midSlot}
      <LocationSelector />
      {/* {
        usercredentials?.designation_id != "4" &&  <Typography component="div"> <Link href="/affiliate-register" style={{fontWeight:'600',color:'rgba(0, 0, 0, 0.54)'}}>Affiliate registration</Link></Typography>
      } */}
      {token ? (<FlexBox>
        <IconButton component={Link} href='/profile/wish-list' aria-label="" sx={{ color: "grey.600" }}>
          <Favorite />
        </IconButton>
        <Badge badgeContent={messageCount} color="primary" invisible={messageCount === 0}
          sx={{
            "& .MuiBadge-badge.MuiBadge-invisible": {
              transform: undefined,
            },
            "& .MuiBadge-badge:not(.MuiBadge-invisible)": {
              transform: "translate(4px, -4px)",
            },
          }}
        >
          <IconButton component={Link} href='/messages' aria-label="" sx={{ color: "grey.600" }}>
            <Message />
          </IconButton>
        </Badge>
      </FlexBox>) : (
        <IconButton onClick={toggleDialog} sx={{ color: "grey.600" }}>
          <Favorite />
        </IconButton>
      )}
      {/* LOGIN AND CART BUTTON */}
      <LoginCartButtons
        toggleDialog={toggleDialog}
        toggleSidenav={toggleSidenav}
      />
      {/* LOGIN FORM DIALOG AND CART SIDE BAR  */}
      <DialogDrawer
        dialogOpen={dialogOpen}
        sidenavOpen={sidenavOpen}
        toggleDialog={toggleDialog}
        toggleSidenav={toggleSidenav}
      />
    </Fragment>
  );
  return (
    <>
      <div className="notranslate">
        <Topbar />
      </div>
      <HeaderWrapper className={clsx(className)}>
        <StyledContainer>
          {downMd ? <MobileHeader midSlot={midSlot} /> : CONTENT_FOR_LARGE_DEVICE}
        </StyledContainer>
      </HeaderWrapper>
    </>
  );
}
