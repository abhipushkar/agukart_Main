import { Box, Rating } from "@mui/material";
import React, { useEffect, useState } from "react";
import BazaarCard from "components/BazaarCard";
import Link from "next/link";
import LazyImage from "components/LazyImage";
import { H6, Small } from "components/Typography";
import { FlexRowCenter } from "components/flex-box";
import FlexBox from "components/flex-box/flex-box";
import { useCurrency } from "contexts/CurrencyContext";
import { calculateDiscount } from "lib";

const Product = ({ product }) => {
  const [nextPromotion, setNextPromotion] = useState({});
  const { currency } = useCurrency();

  useEffect(() => {
    if (
      Array.isArray(product?.promotionData) &&
      product?.promotionData.length > 0
    ) {
      const nextPromotion = product.promotionData.reduce(
        (next, promotion) => {
          if (
            promotion.qty !== null &&
            promotion.qty !== undefined &&
            promotion.qty > 1
          ) {
            if (!next || promotion.qty < next.qty) {
              return promotion;
            }
          }
          return next;
        },
        null
      );
      setNextPromotion(nextPromotion);
    }
  }, [product]);
  return (
    <>
      <Box pb={1}>
        <BazaarCard
          className="p-1"
          sx={{
            overflow: "hidden",
            transition: "all 500ms",
            "&:hover": {
              boxShadow: "0 0 6px #c2c1c1",
            },
          }}
        >
          <Link href={`/products/${product._id}`}>
            <Box borderRadius={2} mb={1}>
              <LazyImage
                width={100}
                height={260}
                alt={"image"}
                src={product.base_url + product.image[0]}
                sx={{
                  height: "260px",
                  objectFit: "contain",
                  borderRadius: "4px",
                  aspectRatio: "1/1",
                }}
              />
            </Box>

            <H6
              mb={0.5}
              style={{
                textTransform: "capitalize",
              }}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: "1",
                WebkitBoxOrient: "vertical",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {product?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
            </H6>
            <FlexRowCenter mb={0.5} gap={0.5} sx={{ justifyContent: "start" }}>
              <Rating
                value={product.ratingAvg}
                size="small"
                color="warn"
                readOnly
                sx={{
                  fontSize: 13,
                }}
              />
              <Small fontWeight={600}>({product.userReviewCount})</Small>
            </FlexRowCenter>
            <FlexBox gap={1}>
              <H6 color="primary.main">
                {currency?.symbol}
                {(
                  calculateDiscount(product.sale_price, product.discount) *
                  currency?.rate
                ).toFixed(2)}
              </H6>
              <Box component="del" fontWeight={600} color="grey.600">
                {currency?.symbol}
                {(product.sale_price * currency?.rate).toFixed(2)}
              </Box>
            </FlexBox>
          </Link>
          {nextPromotion?.offer_type && (
            <p>
              Eligible orders get{" "}
              {nextPromotion?.offer_type == "flat"
                ? `$ ${nextPromotion?.discount_amount}`
                : `${nextPromotion?.discount_amount} %`}{" "}
              off when you buy{" "}
              {nextPromotion?.qty != 0
                ? nextPromotion?.qty
                : ""}{" "}
              items at this shop
            </p>
          )}
        </BazaarCard>
      </Box>
    </>
  );
};

export default Product;
