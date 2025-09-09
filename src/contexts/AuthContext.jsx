"use client";
import React, { useEffect, useState, createContext } from "react";
import { PLACE_ORDER_VALIDATION, TOKEN_NAME } from "constant";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const router = useRouter();

  const pathName = usePathname();
  const [placeOrderValidate, setPlaceOrderValidate] = useState(false);

  useEffect(() => {
    const validate = localStorage.getItem(PLACE_ORDER_VALIDATION);
    setPlaceOrderValidate(validate);
  }, []);

  useEffect(() => {
    if (placeOrderValidate) {
      localStorage.setItem(PLACE_ORDER_VALIDATION, placeOrderValidate);
    }
  }, [placeOrderValidate]);

  useEffect(() => {
    const storeToken = localStorage.getItem(TOKEN_NAME);
    setToken(storeToken);
  }, []);

  useEffect(() => {
    if (token) {
      document.cookie = `TOKEN_NAME=${token}; path=/;`;
      localStorage.setItem(TOKEN_NAME, token);
    }
  }, [token]);

  useEffect(() => {
    if (pathName === "/delivery-address") {
      return;
    }
    setPlaceOrderValidate(false);
    localStorage.removeItem(PLACE_ORDER_VALIDATION);
  }, [pathName]);

  console.log({ placeOrderValidate });
  return (
    <AuthContext.Provider
      value={{ token, setToken, placeOrderValidate, setPlaceOrderValidate }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
