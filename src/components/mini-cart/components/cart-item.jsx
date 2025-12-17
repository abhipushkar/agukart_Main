import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
// MUI ICON COMPONENTS

import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import Remove from "@mui/icons-material/Remove";
// GLOBAL CUSTOM COMPONENTS

import { FlexBox } from "components/flex-box";
import { H6, Tiny } from "components/Typography";
// CUSTOM UTILS LIBRARY FUNCTION
import useCart from "hooks/useCart";
import { useEffect, useState } from "react";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useCurrency } from "contexts/CurrencyContext";
// CUSTOM DATA MODEL

// ==============================================================
export default function MiniCartItem({ item, data, handleCartAmountChange }) {
  console.log(item, "mmmmmmmmm")
  const { currency } = useCurrency();
  const { state } = useCart();
  const [stock, setStock] = useState(0);
  const getCombinations = (arr) => {
    let combinations = arr.map(item =>
      [item]
    );
    if (arr.length > 1) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          combinations.push([arr[i], arr[j]]);
        }
      }
    }
    return combinations;
  };
  useEffect(() => {
    if (item.isCombination) {
      const variantAttributeIds = item?.variant_attribute_id;
      const variantCombinations = getCombinations(variantAttributeIds);
      const mergedCombinations = item?.combinationData?.map((item) => item.combinations).flat();
      const data = mergedCombinations?.filter((item) =>
        variantCombinations?.some((combination) =>
          Array.isArray(item?.combIds) && Array.isArray(combination) &&
          JSON.stringify(item?.combIds.sort()) === JSON.stringify(combination.sort())
        )
      );
      if (data.length <= 1) {
        if (data[0]?.isVisible && +data[0]?.qty > 0) {
          setStock(+data[0]?.qty);
        } else {
          setStock(+item.stock);
        }
      } else {
        data.forEach((item) => {
          if (item.isVisible) {
            if (+item.qty > 0) {
              setStock(+item.qty);
            }
          }
        });
        if (!data.some((item) => +item.qty > 0 && item.isVisible)) {
          setStock(+item.stock);
        }
      }
    } else {
      setStock(+item.stock);
    }
  }, [item])

  const { token } = useAuth();

  const { product_id } = item;

  useEffect(() => {
    if (state.cart.length > 0) {
      const find = state.cart.find((item) => {
        return item.product_id === product_id;
      });
      const addToCarthandler = async () => {
        try {
          const res = await postAPIAuth("user/add-to-cart", {
            productproduct_id: product_id,
            qty: find.qty,
          });
        } catch (error) {
          console.log(error);
        }
      };
      if (find && token) {
        addToCarthandler();
      }
    }
  }, [state.cart]);

  console.log(item, "me rang shrbot ka ");
  return (
    <FlexBox
      py={2}
      px={2.5}
      key={item.product_id}
      alignItems="center"
      borderBottom="1px solid"
      borderColor="divider"
    >
      <FlexBox alignItems="center" flexDirection="column">
        <Button
          size="small"
          color="primary"
          variant="outlined"
          disabled={Math.min(stock, 10) <= item.qty}
          onClick={() => handleCartAmountChange(data, item.qty + 1, item)}
          sx={{
            height: 28,
            width: 28,
            borderRadius: 50,
          }}
        >
          <Add fontSize="small" />
        </Button>

        <H6 my="3px">{item.qty}</H6>

        <Button
          size="small"
          color="primary"
          variant="outlined"
          disabled={item.qty === 1}
          onClick={() => handleCartAmountChange(data, item.qty - 1, item)}
          sx={{
            height: 28,
            width: 28,
            borderRadius: 50,
          }}
        >
          <Remove fontSize="small" />
        </Button>
      </FlexBox>

      <Link href={`/products/${item.product_id}`}>
        <Avatar
          alt={item.product_name}
          src={item.firstImage}
          sx={{
            mx: 1,
            width: 75,
            height: 75,
          }}
        />
      </Link>

      <Box
        flex="1"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        overflow="hidden"
      >
        <Link href={`/products/${item.product_id}`}>
          <H6 ellipsis className="title">
            {item?.name?.replace(/<[^>]*>/g, "")}
          </H6>
        </Link>

        <Tiny color="grey.600">
          {currency?.symbol}{(item.sale_price * currency?.rate).toFixed(2)} x {item.qty}
        </Tiny>

        <H6 color="primary.main" mt={0.5}>
          {currency?.symbol}{(item.qty * item.sale_price * currency?.rate).toFixed(2)}
        </H6>
      </Box>

      <IconButton
        size="small"
        onClick={() => handleCartAmountChange(data, 0, item)}
        sx={{
          marginLeft: 2.5,
        }}
      >
        <Close fontSize="small" />
      </IconButton>
    </FlexBox>
  );
}
