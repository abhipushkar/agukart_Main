import Link from "next/link";
import Rating from "@mui/material/Rating";
// GLOBAL CUSTOM COMPONENTS

import { H6 } from "components/Typography";
import LazyImage from "components/LazyImage";
import { FlexBetween, FlexBox } from "components/flex-box";
// CUSTOM UTILS LIBRARY FUNCTIONS

import { calculateDiscount, currency } from "lib";
// STYLED COMPONENTS

import { PriceText } from "./styles";
// CUSTOM DATA MODEL

import DiscountChip from "../discount-chip";
import QuantityButtons from "./components/quantity-buttons";
// LOCAL CUSTOM HOOKS

import useProduct from "../use-product";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { useEffect } from "react";
import useCart from "hooks/useCart";
import { Typography } from "@mui/material";
import useAuth from "hooks/useAuth";
// ==============================================================

// ==============================================================
export default function ProductCard16({ product }) {
  console.log("productproduct", product);
  const { state } = useCart();
  const { token } = useAuth();
  const {
    slug,
    title,
    thumbnail,
    product_type,
    price,
    image,
    discount,
    product_title,
    your_maximum_price,
    your_minimum_price,
    rating,
    tax_ratio,
    id,
    ratingAvg,
    _id,
    base_url,
  } = product || {};

  const { cartItem, handleCartAmountChange } = useProduct(_id);

  const src = `${base_url}${image[0]}`;

  const handleIncrementQuantity = () => {
    const product = {
      _id,
      price,
      image: src,
      name: product_title,
      qty: (cartItem?.qty || 0) + 1,
    };
    handleCartAmountChange(product);
  };

  const handleDecrementQuantity = () => {
    const product = {
      _id,
      price,
      image: src,
      name: product_title,
      qty: (cartItem?.qty || 0) - 1,
    };
    handleCartAmountChange(product, "remove");
  };

  useEffect(() => {
    // if (state.cart.length > 0) {
    const find = state.cart.find((item) => {
      return item._id === product._id;
    });
    const addToCarthandler = async () => {
      try {
        const res = await postAPIAuth("user/add-to-cart", {
          product_id: _id,
          qty: find.qty,
        });
      } catch (error) {
        console.log(error);
      }
    };
    if (find) {
      addToCarthandler();
    } else {
      console.log(find, "ist it comminf");
      const fetchCart = async () => {
        try {
          const res = await getAPIAuth("user/cart-list");
          if (res.status === 200) {
            const find = res.data.result.find((obj) => {
              return obj.product_id === _id;
            });
            try {
              const res = await postAPIAuth("user/delete-cart", {
                cart_id: find.id,
              });
              console.log(res, "item romovess");
            } catch (error) {
              console.log(error);
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      if (token) {
        fetchCart()
      }
    }
    // }
  }, [state.cart]);

  console.log({ discount });
  return (
    <div>
      <Link href={`/products/${_id}`}>
        <FlexBox position="relative" bgcolor="grey.50" borderRadius={3} mb={2}>
          <LazyImage
            alt={title}
            width={380}
            height={379}
            src={src}
            sx={{ aspectRatio: 1 }}
          />
          {/* {tax_ratio ? (
            <DiscountChip
              discount={tax_ratio}
              sx={{
                left: 5,
                top: 5,
              }}
            />
          ) : null} */}
        </FlexBox>
      </Link>

      <FlexBetween alignItems="flex-end">
        <div>
          <Link href={`/products/${_id}`}>
            <H6
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: "1",
                WebkitBoxOrient: "vertical",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
              fontWeight={700}
              mb={1}
            >
              {product_title.replace(/<[^>]*>/g, "").toUpperCase()}
            </H6>
          </Link>

          <Rating readOnly value={ratingAvg} size="small" precision={0.5} />

          <PriceText>
            {price ? <span className="base-price">{`$${price}`}</span> : null}
            {`$${price}`}

            {discount && (
              <Typography
                component="span"
                fontSize={12}
                sx={{ color: "green", marginLeft: "5px" }}
              >
                ({Math.round(+discount)}% off)
              </Typography>
            )}
          </PriceText>
        </div>

        {/* PRODUCT QUANTITY HANDLER BUTTONS */}
        {/* <QuantityButtons
          quantity={cartItem?.qty || 0}
          handleIncrement={   handleIncrementQuantity}
          handleDecrement={handleDecrementQuantity}
        /> */}
      </FlexBetween>
    </div>
  );
}
