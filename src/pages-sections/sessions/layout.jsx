"use client";

import { Fragment, useCallback, useState } from "react";
import { usePathname } from "next/navigation";
// LOCAL CUSTOM COMPONENTS

import BoxLink from "./components/box-link";
import LogoWithTitle from "./components/logo-title";
import LoginBottom from "./components/login-bottom";
import SocialButtons from "./components/social-buttons";
import Header from "components/header/header";
import Topbar from "components/topbar/top-bar";
import Sticky from "components/sticky/Sticky";
import { Footer1 } from "components/footer";
import { MobileNavigationBar } from "components/mobile-navigation";
import { SearchInputWithCategory } from "components/search-box";
import { Navbar } from "components/navbar";
// GLOBAL CUSTOM COMPONENTS

import { FlexRowCenter } from "components/flex-box";
// COMMON STYLED COMPONENT

import { Wrapper } from "./styles";
import { GoogleOAuthProvider } from "@react-oauth/google";
export default function AuthLayout({ children }) {
  const pathname = usePathname();

  const firstPath = pathname.split("/id=");
  console.log(firstPath, "this is pathname");
  let BOTTOM_CONTENT = null;
  // APPLIED FOR ONLY LOGIN PAGE

  if (pathname === "/login") {
    BOTTOM_CONTENT = <LoginBottom />;
  }
  // APPLIED FOR ONLY REGISTER PAGE

  if (pathname === "/register") {
    BOTTOM_CONTENT = (
      <FlexRowCenter gap={1} mt={3}>
        Already have an account?
        <BoxLink title="Login" href="/login" />
      </FlexRowCenter>
    );
  }

  const [isFixed, setIsFixed] = useState(false);
  // console.log("isFixed", isFixed);
  const toggleIsFixed = useCallback((fixed) => setIsFixed(fixed), []);

  // APPLIED FOR ONLY RESET PASSWORD PAGE

  if (pathname === "/reset-password") {
    return (
      <>
        {/* <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
   
        </Sticky> */}
        <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
        <Navbar elevation={0} border={1} />
        <MobileNavigationBar />
        <FlexRowCenter flexDirection="column" p={5}>
          <Wrapper elevation={3}>{children}</Wrapper>
        </FlexRowCenter>
        <Footer1 />
      </>
    );
  }

  if (firstPath[0] === "/change-password") {
    return (
      <>
        {/* <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
         
        </Sticky> */}
        <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
        <Navbar elevation={0} border={1} />
        <MobileNavigationBar />
        <FlexRowCenter flexDirection="column" p={5}>
          <Wrapper elevation={3}>{children}</Wrapper>
        </FlexRowCenter>
        <Footer1 />
      </>
    );
  }
  if (firstPath[0] === "/login") {
    return (
      <>
        {/* <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
         
        </Sticky> */}
        <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
        <Navbar elevation={0} border={1} />
        <MobileNavigationBar />
        <FlexRowCenter flexDirection="column" p={5}>
          <Wrapper elevation={3}>
            <LogoWithTitle />

            {children}

            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}>
              <SocialButtons />
            </GoogleOAuthProvider>

            {/* RENDER BOTTOM CONTENT BASED ON CONDITION */}
            {BOTTOM_CONTENT}
          </Wrapper>
        </FlexRowCenter>
        <Footer1 />
      </>
    );
  }
  if (firstPath[0] === "/register") {
    return (
      <>
        {/* <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
         
        </Sticky> */}
        <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
        <Navbar elevation={0} border={1} />
        <MobileNavigationBar />
        <FlexRowCenter flexDirection="column" p={5}>
          <Wrapper elevation={3}>
            <LogoWithTitle />

            {children}

            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}>
              <SocialButtons />
            </GoogleOAuthProvider>

            {/* RENDER BOTTOM CONTENT BASED ON CONDITION */}
            {BOTTOM_CONTENT}
          </Wrapper>
        </FlexRowCenter>
        <Footer1 />
      </>
    );
  }

  return (
    <FlexRowCenter flexDirection="column" minHeight="100vh" px={2}>
      <Wrapper elevation={3}>
        {/* LOGO WITH TITLE AREA */}
        <LogoWithTitle />

        {/* FORM AREA */}
        {children}

        {/* SOCIAL BUTTON AREA */}
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_CLIENT_ID}>
          <SocialButtons />
        </GoogleOAuthProvider>

        {/* RENDER BOTTOM CONTENT BASED ON CONDITION */}
        {BOTTOM_CONTENT}
      </Wrapper>
    </FlexRowCenter>
  );
}
