"use client";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";

import ProductCategories1 from "components/product-cards/product-categories-1/product-card";
import { H1, H4, H5 } from "components/Typography";
import ProductCategoryShimmer from "components/shimmer/ProductCategoryShimmer";

export default function ProductsCategoriesPage({
  products,
  title,
  childCategories,
  SetProductIncreaseValue,
  isproductIncreaseValue,
  SetIsProductIncreaseValue,
  subcategoryMenus,
  isLoading,
  productlength,
}) {
  const router = useRouter();

  const ShimmerCategory = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <ProductCategoryShimmer key={index} />
      ))}
    </Grid>
  );


  const handleClick = () => {
    SetIsProductIncreaseValue(!isproductIncreaseValue);
    if (isproductIncreaseValue) {
      SetProductIncreaseValue(Number(productlength));
    } else {
      SetProductIncreaseValue(6);
    }
  };

  return (
    <Fragment>
      <Grid container justifyContent="center" spacing={3} sx={{ px: { xs: 2, md: 0 } }}>
        <Grid item xs={12} md={10}>
          <Box textAlign="center" mb={3}>
            {childCategories.length > 1 && (
              <H5 lineHeight={1} mb={1}>
                {childCategories.map((cat, i) => (
                  <Fragment key={cat._id}>
                    <span
                      onClick={() =>
                        router.push(
                          `/products-categories/search/${cat.slug}?title=${cat.title}&_id=${cat._id}`
                        )
                      }
                      style={{ cursor: "pointer", color: "#007aff" }}
                    >
                      {cat.title}
                    </span>
                    {i < childCategories.length - 1 && (
                      <span style={{ margin: "0 6px" }}>/</span>
                    )}
                  </Fragment>
                ))}
              </H5>
            )}
            <H4 fontSize={30} color="#000">
              {title}
            </H4>
          </Box>
          {isLoading ? (
            <ShimmerCategory />
          ) : (
            <Grid container spacing={3}>
              {products?.map((item) => (
                <Grid item key={item.id} xs={6} sm={4} md={2}>
                  <ProductCategories1
                    product={item}
                    subcategoryMenus={subcategoryMenus}
                  />
                </Grid>
              ))}
            </Grid>
          )}
          {products.length >= 6 && (
            <Box display="flex" justifyContent="center" mt={4} mb={2}>
              <Button
                onClick={handleClick}
                sx={{
                  backgroundColor: "#f0f0f0",
                  borderRadius: 30,
                  padding: "10px 24px",
                  fontWeight: 500,
                  fontSize: 16,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                {isproductIncreaseValue ? "Show More" : "Show Less"}
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
    </Fragment>
  );
}
