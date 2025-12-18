import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
// GLOBAL CUSTOM HOOK

import useCart from "hooks/useCart";
// LOCAL CUSTOM COMPONENTS

import TopHeader from "./components/top-header";
import MiniCartItem from "./components/cart-item";
import EmptyCartView from "./components/empty-view";
import BottomActions from "./components/bottom-actions";
// GLOBAL CUSTOM COMPONENT

import Scrollbar from "components/scrollbar";
// CUSTOM UTILS LIBRARY FUNCTION
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";
import useMyProvider from "hooks/useMyProvider";
import { useCurrency } from "contexts/CurrencyContext";
// CUSTOM DATA MODEL

// =========================================================
export default function MiniCart({ toggleSidenav }) {
  const { currency } = useCurrency();
  const { usercredentials } = useMyProvider();
  const { push } = useRouter();
  const { state, dispatch, getCartItems, getCartDetails } = useCart();
  const { token } = useAuth();
  const { addToast } = useToasts();
  const cartList = state.cart;

  console.log(cartList, "kkkkkkkkkkkkkkk")

  const handleCartAmountChange = async (data, amount, product) => {
    console.log("called", data, amount, product);
    if (token) {
      if (data?.coupon_status) {
        toggleSidenav();
        return addToast("Please remove the coupon first", {
          appearance: "error",
          autoDismiss: true,
        });
      }
      if (amount === 0) {
        const fetchCart = async () => {
          try {
            const res = await postAPIAuth("user/delete-cart", {
              cart_id: product.cart_id,
            });
            if (res.status === 200) {
              getCartItems();
              getCartDetails();
            }
            console.log(res, "item romovess");
          } catch (error) {
            console.log(error);
          }
        };
        if (token) {
          fetchCart();
        }
      } else if (amount > 0) {
        try {
          // Calculate delta quantity (User passes target amount, backend requires increment/decrement value)
          const currentQty = product?.qty || 0;
          const deltaQty = amount - currentQty;

          if (deltaQty === 0) return;

          const payload = {
            product_id: product?.product_id,
            vendor_id: data?.vendor_id,
            qty: deltaQty,
            price: product?.sale_price,
            isCombination: product?.isCombination,
            variant_id: [],
            variant_attribute_id: [],
            customize: product?.customize,
            customizationData: product?.customizationData || []
          }
          if (product?.isCombination) {
            payload.variant_id = product?.variant_id,
              payload.variant_attribute_id = product?.variant_attribute_id
          }
          const res = await postAPIAuth("user/add-to-cart", payload);
          if (res.status === 200) {
            getCartItems();
            getCartDetails();
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          vendor_id: data?.vendor_id,
          vendor_name: data?.vendor_name,
          shop_icon: data?.shop_icon,
          shop_name: data?.shop_name,
          slug: data?.slug,
          products: [
            { ...product, qty: amount }
          ]
        },
      });
    }
  };

  const getTotalPrice = () => {
    return cartList?.reduce((total, cartItem) => {
      return total + cartItem?.products?.reduce((acc, product) => acc + product?.sale_price * product?.qty, 0);
    }, 0);
  };

  const handleNavigate = () => {
    toggleSidenav();
  };

  return (
    <Box width="100%" minWidth={380}>
      {/* HEADING SECTION */}
      {
        usercredentials?.designation_id != "4" && <TopHeader toggle={toggleSidenav} total={cartList?.reduce((total, cartItem) => total + cartItem?.products?.length, 0)} />
      }
      <Divider />

      <Box height={`calc(100vh - ${cartList.length ? "207px" : "75px"})`}>
        {cartList.length > 0 ? (
          <Scrollbar>
            {cartList?.map((item, index) => (
              <>
                {
                  item?.products?.map((product) => (
                    <MiniCartItem
                      item={product}
                      data={item}
                      key={index}
                      handleCartAmountChange={handleCartAmountChange}
                    />
                  ))
                }
              </>
            ))}
          </Scrollbar>
        ) : (
          <EmptyCartView />
        )}
      </Box>

      {/* CART BOTTOM ACTION BUTTONS */}
      {cartList.length > 0 ? (
        <BottomActions
          total={`${currency?.symbol}${(currency?.rate * getTotalPrice()).toFixed(2)}`}
          handleNavigate={handleNavigate}
        />
      ) : null}
    </Box>
  );
}
