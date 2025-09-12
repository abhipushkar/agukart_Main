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
import LocationSelector from "./components/location_selector";
// ==============================================================

// ==============================================================
export default function Header({ isFixed, className, midSlot }) {
  const { usercredentials } = useMyProvider();
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down(1150));
  const { dialogOpen, sidenavOpen, toggleDialog, toggleSidenav } = useHeader();
  const CONTENT_FOR_LARGE_DEVICE = (
    <Fragment>
      <FlexBox minWidth={100} alignItems="center">
        <Link href="/">
          <LazyImage
            src={require("/public/assets/images/logo.png")}
            alt="logo"
          />
        </Link>

        {isFixed ? <CategoriesMenu /> : null}
      </FlexBox>
      {midSlot}
        <LocationSelector />
      {
        usercredentials?.designation_id != "4" &&  <Typography component="div"> <Link href="/affiliate-register" style={{fontWeight:'600',color:'rgba(0, 0, 0, 0.54)'}}>Affiliate registration</Link></Typography>
      }
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
          {downMd ? <MobileHeader midSlot={midSlot}/> : CONTENT_FOR_LARGE_DEVICE}
        </StyledContainer>
      </HeaderWrapper>
    </>
  );
}
