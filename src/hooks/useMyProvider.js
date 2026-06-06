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
    wishlistProducts,
    setWishlistProducts,
    wishlistLoaded,
    wishlistProductIds,
    getUserDetail,
    getSavedProducts,
    saveProductForLater,
    deleteSavedProduct,
    moveSavedProductToCart,
    getWishlistProducts,
    addDeleteWishlistProduct,
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
    wishlistProducts,
    setWishlistProducts,
    wishlistLoaded,
    wishlistProductIds,
    getUserDetail,
    getSavedProducts,
    saveProductForLater,
    deleteSavedProduct,
    moveSavedProductToCart,
    getWishlistProducts,
    addDeleteWishlistProduct,
  };
};

export default useMyProvider;
