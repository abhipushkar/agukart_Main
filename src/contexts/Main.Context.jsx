"use client";

import { USER_DETAILS } from 'constant';
import React, { useEffect, useState } from 'react';
import { getAPIAuth, postAPIAuth } from 'utils/__api__/ApiServies';
import useAuth from "hooks/useAuth";
import axios from "axios";

const MyContext = React.createContext(null);


const MainProvider = ({ children }) => {
  const [usercredentials, setUserCredentials] = useState(null);
  const [addresscount, setAddressCount] = useState();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const getUserDetail = async () => {
    try {
      const res = await getAPIAuth("user/get-profile", token);
      console.log("getprofileresssssssssssssssssssss", res);
      if (res.status == 200) {
        setUserCredentials(res?.data?.data);
      }
    } catch (error) {
      console.log("errro", error);
    }
  }

  const getSavedProducts = async () => {
    if (!token) {
      setSavedProducts([]);
      return [];
    }

    try {
      const res = await getAPIAuth("user/get-save-for-later", token);
      const savedData =
        res?.data?.data ||
        res?.data?.result ||
        res?.data?.products ||
        [];

      setSavedProducts(Array.isArray(savedData) ? savedData : []);
      return Array.isArray(savedData) ? savedData : [];
    } catch (error) {
      console.log("error getting saved products", error);
      setSavedProducts([]);
      return [];
    }
  };

  const saveProductForLater = async (cart_id) => {
    if (!token) return null;

    try {
      const res = await postAPIAuth("user/save-for-later", { cart_id }, token);
      if (res?.status === 200) {
        await getSavedProducts();
      }
      return res;
    } catch (error) {
      console.log("error saving product for later", error);
      throw error;
    }
  };

  const deleteSavedProduct = async (id) => {
    if (!token) return null;

    try {
      const res = await axios.delete(`${baseURL}/user/delete-save-for-later/${id}`, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res?.status === 200) {
        await getSavedProducts();
      }
      return res;
    } catch (error) {
      console.log("error deleting saved product", error);
      throw error;
    }
  };

  const moveSavedProductToCart = async (save_id) => {
    if (!token) return null;

    try {
      const res = await postAPIAuth("user/move-to-cart", { save_id }, token);
      if (res?.status === 200) {
        await getSavedProducts();
      }
      return res;
    } catch (error) {
      console.log("error moving saved product to cart", error);
      throw error;
    }
  };

  useEffect(() => {
    if(token){
      getUserDetail();
      getSavedProducts();
    } else {
      setSavedProducts([]);
    }
  }, [token])

  useEffect(() => {
    const storeToken = JSON.parse(localStorage.getItem(USER_DETAILS));
    setUserCredentials(storeToken);
  }, []);

  useEffect(() => {
    if (usercredentials) {
      // console.log("usercredentialsusercredentialsusers" , usercredentials);
      localStorage.setItem(USER_DETAILS, JSON.stringify(usercredentials));
    }
  }, [usercredentials]);

  return (
    <MyContext.Provider value={{
      usercredentials,
      setUserCredentials,
      addresscount,
      setAddressCount,
      products,
      setProducts,
      savedProducts,
      setSavedProducts,
      getUserDetail,
      getSavedProducts,
      saveProductForLater,
      deleteSavedProduct,
      moveSavedProductToCart
    }}>
      {children}
    </MyContext.Provider>
  );
};

export { MainProvider, MyContext };
