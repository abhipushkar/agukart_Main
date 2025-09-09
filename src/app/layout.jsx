"use client";
import { Open_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastContainer } from "react-toastify";
// header
import Sticky from "components/sticky";
import Topbar from "components/topbar";
import { Navbar } from "components/navbar";
import { Footer1 } from "components/footer";
import Header from "components/header/header";
import { SearchInputWithCategory } from "components/search-box";
import { MobileNavigationBar } from "components/mobile-navigation";
import useAuth from "hooks/useAuth";
import "/global.css";
// end header
export const openSans = Open_Sans({
  subsets: ["latin"],
});
// THEME PROVIDER

import ThemeProvider from "theme/theme-provider";
// PRODUCT CART PROVIDER

import CartProvider from "contexts/CartContext";
// SITE SETTINGS PROVIDER

import SettingsProvider from "contexts/SettingContext";
// GLOBAL CUSTOM COMPONENTS

import CurrencyProvider from "contexts/CurrencyContext";
import RTL from "components/rtl";
import ProgressBar from "components/progress";
import { ToastProvider } from "react-toast-notifications";
// IMPORT i18n SUPPORT FILE

import "i18n";
import { useCallback, useEffect, useState } from "react";
import AuthContextProvider from "contexts/AuthContext";

import { MainProvider } from "contexts/Main.Context";
import ChatContextProvider from "contexts/ChatContext";
export default function RootLayout({ children }) {
  const [isFixed, setIsFixed] = useState(false);
  const toggleIsFixed = useCallback((fixed) => setIsFixed(fixed), []);
  // const { token, setToken } = useAuth()
  // console.log({ pageProps })

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`top0hi ${openSans.className}`}
        style={{ background: "#fff" }}
      >
        <AuthContextProvider>
          <ToastProvider placement="top-right">
            <CurrencyProvider>
              <CartProvider>
                <SettingsProvider>
                  <ThemeProvider>
                    <MainProvider>
                      <ChatContextProvider>
                        <ProgressBar />
                        <RTL>{children}</RTL>
                      </ChatContextProvider>
                    </MainProvider>
                  </ThemeProvider>
                </SettingsProvider>
              </CartProvider>
            </CurrencyProvider>
          </ToastProvider>
        </AuthContextProvider>

        <GoogleAnalytics gaId="G-XKPD36JXY0" />
      </body>
    </html>
  );
}
