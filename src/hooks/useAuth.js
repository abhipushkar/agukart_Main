import { useContext } from "react";
import { AuthContext } from "contexts/AuthContext";

const useAuth = () => {
  const { token, setToken, placeOrderValidate, setPlaceOrderValidate } =
    useContext(AuthContext);

  return {
    token,
    setToken,
    placeOrderValidate,
    setPlaceOrderValidate,
  };
};

export default useAuth;
