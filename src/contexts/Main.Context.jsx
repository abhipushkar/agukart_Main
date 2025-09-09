"use client";

import { TOKEN_NAME, USER_DETAILS } from 'constant';
import React, { useEffect, useState } from 'react';
import { useContext } from "react";
import { getAPIAuth } from 'utils/__api__/ApiServies';
import useAuth from "hooks/useAuth";

const MyContext = React.createContext(null);


const MainProvider = ({ children }) => {
  const [usercredentials, setUserCredentials] = useState(null);
  const [addresscount, setAddressCount] = useState();
  const { token } = useAuth();
  const [products, setProducts] = useState([]);

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
  useEffect(() => {
    if(token){
      getUserDetail();
    }
  }, [])

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
    <MyContext.Provider value={{ usercredentials, setUserCredentials, addresscount, setAddressCount, products, setProducts, getUserDetail }}>
      {children}
    </MyContext.Provider>
  );
};

export { MainProvider, MyContext };