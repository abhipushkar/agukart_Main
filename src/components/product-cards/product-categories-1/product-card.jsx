import Link from "next/link";
import Rating from "@mui/material/Rating";
// GLOBAL CUSTOM COMPONENTS

import { H6 } from "components/Typography";
import LazyImage from "components/LazyImage";
import { FlexBetween, FlexBox } from "components/flex-box";
import {
  useParams,
  usePathname,
  useSearchParams,
  useRouter,
} from "next/navigation";

import useMyProvider from "hooks/useMyProvider";

// CUSTOM UTILS LIBRARY FUNCTIONS

import { calculateDiscount, currency } from "lib";
// STYLED COMPONENTS

import { PriceText } from "./styles";
// CUSTOM DATA MODEL

import DiscountChip from "../discount-chip";
import QuantityButtons from "./components/quantity-buttons";
// LOCAL CUSTOM HOOKS

import useProduct from "../use-product";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
// ==============================================================

// ==============================================================
export default function ProductCategories1({ product, subcategoryMenus }) {
  // const {setproductsLastSlugId} = useMyProvider();
  const { setProducts } = useMyProvider();

  console.log({ product, subcategoryMenus }, "prudcttttttttttttttttt");

  const { title, image, slug, exist, _id, originalSlug } = product || {};

  console.log("subcategoryMenussubcategoryMenus", { title, _id });

  const queryParams = {
    title: title,
    _id: _id,
  };

  const queryString = new URLSearchParams(queryParams).toString();

  const data = useParams();
  const router = useRouter();
  const newPathname = data.slug.join("/");
  console.log("newPathname", product);
  
  return (
    <div>
      <Link href={exist?`${originalSlug}?${queryString}`:`/products/search/${newPathname}/${originalSlug}/id=${_id}?slug=${originalSlug}`} passHref>
      <Box sx={{ cursor: "pointer" }} component="a">
        <FlexBox position="relative" borderRadius={3} mb={2}>
          <LazyImage
            alt={title}
            width={380}
            height={379}
            src={image}
            sx={{
              aspectRatio: "2/3",
              height: "100%",
              width: "100%",
              objectFit: "cover",
              borderRadius: "6px",
              transition: "0.3s",
              "&:hover": {
                boxShadow: 6,
                transform: "scale(1.05)",
              },
            }}
          />
        </FlexBox>
      </Box>
      </Link>

      <FlexBetween justifyContent="center" alignItems="flex-end">
        <Link href={exist?`${originalSlug}?${queryString}`:`/products/search/${newPathname}/${originalSlug}/id=${_id}?slug=${originalSlug}`}  passHref>
          <H6
            component="a"
            fontWeight={700}
            mb={1}
            sx={{
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",      
              "&:hover": {
                textDecoration: "underline", 
              },
            }}
          >
            {title}
          </H6>
        </Link>
      </FlexBetween>
    </div>
  );
}
