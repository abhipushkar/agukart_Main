import { useContext } from "react";
import { MyContext } from "contexts/Main.Context";

const useMyProvider = () => {
  const {
    usercredentials,
    setUserCredentials,
    addresscount,
    setAddressCount,
    products,
    setProducts,
    getUserDetail
  } = useContext(MyContext);

  return {
    usercredentials,
    setUserCredentials,
    addresscount,
    setAddressCount,
    products,
    setProducts,
    getUserDetail
  };
};

export default useMyProvider;
