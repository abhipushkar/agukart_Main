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
    savedProducts,
    setSavedProducts,
    getUserDetail,
    getSavedProducts,
    saveProductForLater,
    deleteSavedProduct,
    moveSavedProductToCart
  } = useContext(MyContext);

  return {
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
  };
};

export default useMyProvider;
