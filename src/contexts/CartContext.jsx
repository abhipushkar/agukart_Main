"use client";

import { createContext, useEffect, useMemo, useReducer } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { CART_ITEM } from "constant";
import { token } from "stylis";
import { useToasts } from "react-toast-notifications";

// =================================================================================

// =================================================================================

const INITIAL_STATE = {
  cart: [],
  shopDiscount: 0,
  subTotal: 0,
  delivery: 0,
  superTotal: 0,
  total: 0,
};
// ==============================================================

// ==============================================================
export const CartContext = createContext({});

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT_CART":
      return { ...state, cart: action.payload };
    case "CHANGE_CART_AMOUNT":
      let cartList = state.cart;
      let cartItem = action.payload;
      if (cartItem?.products[0]?.isCombination) {
        if (cartItem?.products[0]?.qty < 1) {
          const updatedCartList = cartList
            ?.map((vendor) => {
              const filteredProducts = vendor.products.filter((product) => {
                if (product?.product_id !== cartItem?.products[0]?.product_id) {
                  return true;
                }
                const isVariantDifferent =
                  JSON.stringify(product.variantData) !== JSON.stringify(cartItem.products[0].variantData) ||
                  JSON.stringify(product.variantAttributeData) !== JSON.stringify(cartItem.products[0].variantAttributeData);
                return isVariantDifferent;
              });
              return { ...vendor, products: filteredProducts };
            })
            .filter((vendor) => vendor?.products?.length > 0);
      
          return { ...state, cart: updatedCartList };
        }
      
        let exist = false;
        const updatedCartList = cartList?.map((vendor) => {
          const updatedProducts = vendor?.products?.map((product) => {
            if (
              product?.product_id === cartItem?.products[0]?.product_id &&
              JSON.stringify(product.variantData) === JSON.stringify(cartItem.products[0].variantData) &&
              JSON.stringify(product.variantAttributeData) === JSON.stringify(cartItem.products[0].variantAttributeData)
            ) {
              exist = true;
              return { ...product,sale_price: cartItem?.products[0]?.sale_price, qty: cartItem?.products[0]?.qty }; 
            }
            return product;
          });
      
          return { ...vendor, products: updatedProducts };
        });
      
        if (!exist) {
          const vendorIndex = cartList.findIndex((vendor) => vendor.vendor_id === cartItem.vendor_id);
          if (vendorIndex >= 0) {
            updatedCartList[vendorIndex]?.products?.push({
              ...cartItem.products[0],
            });
          } else {
            updatedCartList.push({
              vendor_id: cartItem.vendor_id,
              vendor_name: cartItem.vendor_name,
              shop_icon: cartItem.shop_icon,
              shop_name: cartItem.shop_name,
              slug: cartItem.slug,
              products: [
                {
                  ...cartItem.products[0],
                },
              ],
            });
          }
        }
      
        return { ...state, cart: updatedCartList };
      }else{
        if (cartItem?.products[0]?.qty < 1) {
          const updatedCartList = cartList?.map((vendor) => {
            const filteredProducts = vendor.products.filter(
              (product) => product?.product_id !== cartItem?.products[0]?.product_id
            );
            return { ...vendor, products: filteredProducts };
          }).filter((vendor) => vendor?.products?.length > 0);``
          return { ...state, cart: updatedCartList };
        }
        let exist = false;
        const updatedCartList = cartList?.map((vendor) => {
          const updatedProducts = vendor?.products?.map((product) => {
            if (product?.product_id === cartItem?.products[0]?.product_id) {
              exist = true;
              return { ...product,sale_price: cartItem?.products[0]?.sale_price, qty: cartItem?.products[0]?.qty };
            }
            return product;
          });
  
          return { ...vendor, products: updatedProducts };
        });
        if (!exist) {
          const vendorIndex = cartList.findIndex((vendor) => vendor.vendor_id === cartItem.vendor_id);
          if (vendorIndex >= 0) {
            updatedCartList[vendorIndex]?.products?.push({
              ...cartItem.products[0], 
            });
          } else {
            updatedCartList.push({
              vendor_id: cartItem.vendor_id,
              vendor_name: cartItem.vendor_name,
              shop_icon: cartItem.shop_icon,
              shop_name: cartItem.shop_name,
              slug: cartItem.slug,
              products: [
                {
                  ...cartItem.products[0], 
                },
              ],
            });
          }
        }
        return { ...state, cart: updatedCartList };
      }
    case "CALCULATION":
      return {
        ...state,
        total: action?.payload?.subTotal,
        shopDiscount: action?.payload?.couponDiscount,
        walletAmount:action?.payload?.walletAmount,
        voucherDiscount: action?.payload?.voucherDiscount,
        subTotal: action?.payload?.subTotal - action?.payload?.couponDiscount - action?.payload?.voucherDiscount,
        delivery: action?.payload?.delivery,
        superTotal:
          action?.payload?.subTotal -
          action?.payload?.couponDiscount - 
          action?.payload?.walletAmount + 
          action?.payload?.delivery - 
          action?.payload?.voucherDiscount,
      };
    default: {
      return state;
    }
  }
};

export default function CartProvider({ children }) {
  const { addToast } = useToasts();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { token } = useAuth();

  const getCartItems = async (address_id) => {
    const cartData = JSON.parse(localStorage.getItem(CART_ITEM));
    if (token && cartData?.length) {
      const res = await getAPIAuth(`user/cart-list?address_id=${address_id || ""}`, token);
      if (res.status === 200) {
        dispatch({ type: "INIT_CART", payload: [...res?.data?.result, ...cartData] });
      }
      // dispatch({ type: "INIT_CART", payload: cartData });
      localStorage.removeItem(CART_ITEM);
      return;
    }

    try {
      const res = await getAPIAuth(`user/cart-list?address_id=${address_id || ""}`, token);
      if (res.status === 200) {
        dispatch({ type: "INIT_CART", payload: res?.data?.result });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      getCartItems();
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      let cart = JSON.parse(localStorage.getItem(CART_ITEM));
      if(cart?.length > 0){
        cart = cart
      }else{
        cart = [];
      }
      dispatch({ type: "INIT_CART", payload: cart });
    }
  }, []);

  const getCartDetails = async (wallet,address_id,discount) => {
    try {
      const res = await getAPIAuth(`user/getCartDetails?wallet=${wallet}&address_id=${address_id || ""}&voucher_discount=${discount}`, token);

      if (res?.data?.status) {
        dispatch({ type: "CALCULATION", payload: res.data.data });
      }else{
        dispatch({ type: "CALCULATION", payload: res.data.data });
        addToast(res?.data?.message, {
          appearance: "error",
          autoDismiss: true,
        })
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(()=>{
    if (!token) {
      localStorage.setItem(CART_ITEM, JSON.stringify(state.cart));
      const totalPrice = state?.cart?.reduce((vendorTotal, vendor) => {
        const productTotal = vendor?.products?.reduce((productTotal, product) => {
          return productTotal + (product?.sale_price || 0) * (product?.qty || 1); 
        }, 0);
        return vendorTotal + productTotal;
      }, 0);
      const payload = {
        delivery: 0,
        discount: 0,
        walletAmount:0,
        netAmount: 0,
        couponDiscount:0,
        voucherDiscount:0,
        subTotal:totalPrice
      }
      dispatch({ type: "CALCULATION", payload:payload});
    }
  },[state.cart]);

  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      getCartItems,
      getCartDetails
    }),
    [state, dispatch]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}
