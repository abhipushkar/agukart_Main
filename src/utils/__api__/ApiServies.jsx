"use client";
import axios from "axios";
import { TOKEN_NAME } from "constant";
import { useToasts } from "react-toast-notifications";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export const getAPI = async (url) => {
  // try {
  const response = await axios.get(`${baseURL}/${url}`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
  });
  return response;
  // } catch (error) {
  // console.log("error=>", error)
  // return error
  // }
};

export const getAPIAuth = async (url, tokenInit) => {
  const bURL = baseURL;
  const token = localStorage.getItem(TOKEN_NAME);
  // console.log("token from getapiAuth", {token,bURL,url})
  try {
    const response = await axios.get(`${bURL}/${url}`, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${tokenInit ? tokenInit : token}`,
      },
    });

    return response;
  } catch (error) {
    // console.log("error from  getApiAuth",error?.response?.data ,error?.response ,error );
console.log(error,"here is my eroooooooyty")
    if (error?.response?.data?.message === "Invalid token") {
      localStorage.removeItem(TOKEN_NAME);
      document.cookie =
      "TOKEN_NAME=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
      // localStorage.removeItem(ADMIN_FRONTEND_LOGGED_IN_ID);
      // localStorage.removeItem(STOCK_USER_ID);
      window.location.reload(true);
    }
    if(error?.response?.status === 401){

      localStorage.removeItem(TOKEN_NAME);
      document.cookie =
      "TOKEN_NAME=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
      window.location.reload(true);
    }


    
    throw error;
  }
};

export const postAPI = async (url, params) => {
  const bURL = baseURL;
  try {
    const response = await axios.post(`${bURL}/${url}`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
    });
    return response;
  } catch (error) {
    console.log("error=>", error);
    throw error;
  }
};

export const postAPIAuth = async (url, params, tokenInit, addToast) => {
  // const token = localStorage.getItem(TOKEN_NAME)
  const bURL = baseURL;
  const token = localStorage.getItem(TOKEN_NAME);
  try {
    const response = await axios.post(`${bURL}/${url}`, params, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
        Authorization: `Bearer ${tokenInit ? tokenInit : token}`,
      },
    });
    return response;
  } catch (error) {
    if (error?.response?.data?.msg === "Invalid token") {
      // alert('postAPIAuth')
      localStorage.removeItem(TOKEN_NAME);
      localStorage.removeItem(ADMIN_FRONTEND_LOGGED_IN_ID);
      localStorage.removeItem(STOCK_USER_ID);
      // signOut(auth)
      //     .then(() => {
      //         // succesToaster("Logged Out")
      //     })
      //     .catch((error) => {
      //         // An error happened.
      //     });
      // window.location.reload(true);
    }
    if (addToast) {
      addToast(error.response.data.message, {
        appearance: "error",
        autoDismiss: true,
      });
      
    }

    console.log("error=>", error);

    throw error;
  }
};

export const postAPIFormData = async (url, params, tokenInit) => {
  const bURL = baseURL;
  try {
    const response = await axios.post(`${bURL}/${url}`, params, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${tokenInit ? tokenInit : token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
