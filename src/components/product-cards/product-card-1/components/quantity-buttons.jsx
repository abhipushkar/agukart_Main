import { Fragment, useEffect } from "react";
import Button from "@mui/material/Button";
// MUI ICON COMPONENTS

import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
// GLOBAL CUSTOM COMPONENTS

import { FlexBox } from "components/flex-box";
import { Paragraph } from "components/Typography";
import useCart from "hooks/useCart";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
// ==============================================================

// ==============================================================
export default function QuantityButtons(props) {
  const { dispatch, state } = useCart();
  const { product, quantity, handleDecrement, handleIncrement } = props || {};

  const show = state?.cart.find((item) => {
    return item._id === product?.product_id._id;
  });

  const handleCartAmountChange = async (amount) => {
    if (amount === 0) {
      try {
        const res = await getAPIAuth("user/cart-list");

        if (res.status === 200) {
          const find = res.data.result.find((obj) => {
            return obj.product_id === product?.product_id._id;
          });
          try {
            const res = await postAPIAuth("user/delete-cart", {
              cart_id: find.id,
            });
            console.log(res, "im batman");
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }

    // dispatch({
    //   type: "CHANGE_CART_AMOUNT",
    //   payload: {
    //     _id: product?.product_id._id,
    //     name: product?.product_id.product_title,
    //     price: product?.product_id.sale_price
    //       ? product?.product_id.sale_price
    //       : product?.product_id.price,
    //     image: `${product?.base_url}${product.product_id?.image[0]}`,
    //     qty: amount,
    //   },
    // });
    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: {
        vendor_id: product?.vendor_id?._id,
        vendor_name: product?.vendor_id?.name,
        shop_icon: `${product?.vendor_details?.vendor_shop_icon_url}${product?.vendor_details?.shop_icon}`,
        shop_name: product?.vendor_details?.shop_name,
        slug: product?.vendor_details?.slug,
        products: [
          {
            product_id: product?.product_id._id,
            qty: amount,
            stock:+product?.product_id?.qty,
            product_name: product?.product_id.product_title,
            sale_price: product?.product_id.sale_price
            ? product?.product_id.sale_price
            : product?.product_id.price,
            firstImage: `${product?.base_url}${product.product_id?.image[0]}`,
          }
        ]
      },
    });
  };

  console.log("jddjdddh", { product, state });

  useEffect(() => {
    if (state.cart.length > 0) {
      const find = state.cart.find((item) => {
        return item._id === product?.product_id._id;
      });
      const addToCarthandler = async () => {
        try {
          const res = await postAPIAuth("user/add-to-cart", {
            product_id: product?.product_id._id,
            qty: find.qty,
          });
        } catch (error) {
          console.log(error);
        }
      };
      if (find) {
        addToCarthandler();
      }
    }
  }, [state.cart]);

  return (
    <FlexBox
      width="30px"
      alignItems="center"
      className="add-cart"
      flexDirection="column-reverse"
      justifyContent={show?.qty ? "space-between" : "flex-start"}
    >
      <Button
        color="primary"
        variant="outlined"
        onClick={() => {
          handleCartAmountChange(show?.qty ? show?.qty + 1 : 1);
        }}
        sx={{
          padding: "3px",
        }}
      >
        <Add fontSize="small" />
      </Button>
      {show?.qty ? (
        <Fragment>
          <Paragraph color="text.primary" fontWeight="600">
            {show?.qty}
          </Paragraph>

          <Button
            color="primary"
            variant="outlined"
            onClick={() => handleCartAmountChange(show?.qty - 1)}
            sx={{
              padding: "3px",
            }}
          >
            <Remove fontSize="small" />
          </Button>
        </Fragment>
      ) : null}
    </FlexBox>
  );
}
