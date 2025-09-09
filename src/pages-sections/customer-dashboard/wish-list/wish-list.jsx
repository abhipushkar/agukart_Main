"use client";

import { Fragment, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Favorite from "@mui/icons-material/Favorite";
import ProductCard1 from "components/product-cards/product-card-1";
// CUSTOM DATA MODEL

// Local CUSTOM COMPONENT
import Pagination from "../pagination";
import DashboardHeader from "../dashboard-header";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
// ==================================================================

// ==================================================================
export default function WishListPageView(props) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [showLoading, setShowloading] = useState(true);
  const params = useSearchParams();
  let queryPage = params.get("page");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(`${window.location.pathname}?${currentParams.toString()}`);
  };

  const getWishlistProduct = async () => {
    try {
      setShowloading(true);
      const res = await getAPIAuth(`user/get-wishlist?page=${page}&limit=16`);
      console.log(res, "this sis res of wishlist");
      if (res.status === 200) {
        const myArr = res.data.wishlist.map((obj) => {
          return { ...obj, base_url: res.data.base_url };
        });
        setProducts(myArr);
        setTotalPages(res?.data?.pagination?.totalPages || 1);
        setShowloading(false);
      }
    } catch (error) {
      setShowloading(false);
      console.log(error);
    } finally {
      setShowloading(false);
    }
  };

  console.log(products, "thhthhth");

  useEffect(() => {
    getWishlistProduct();
  }, [page]);

  return (
    <Fragment>
      <DashboardHeader title="My Wish List" Icon={Favorite} />
      <Grid container spacing={3}>
        {
          showLoading ? (
            <>
              {[...Array(16)].map((_, index) => (
                <Grid key={index} item xs={6} md={4} lg={3}>
                  <ProductCardShimmer  />
                </Grid>
              ))}
            </>
          ):(
            products.length > 0 ? (
              products?.map((item) => (
                <Grid item lg={3} md={4} sm={6} xs={12} key={item.id}>
                  <ProductCard1
                    product={item}
                    getWishlistProduct={getWishlistProduct}
                    product_id={item?.product_id?._id}
                    id={item?._id}
                    slug={item?.product_id?.product_title.replace(
                      /<\/?[^>]+(>|$)/g,
                      ""
                    )}
                    title={item?.product_id?.product_title?.replace(
                      /<\/?[^>]+(>|$)/g,
                      ""
                    )}
                    price={item?.price}
                    original_price={item?.original_price}
                    isCombination={item?.isCombination}
                    variant_id={item?.variant_id}
                    variant_attribute_id={item?.variant_attribute_id}
                    rating={item?.rating}
                    imgUrl={`${item?.base_url}${item?.product_id?.image[0]}`}
                  />
                </Grid>
              ))
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  gap: "10px",
                }}
              >
                <Typography variant="h6">No product found in Wishlist</Typography>
              </Box>
            )
          )
        }
      </Grid>
      {products.length === 0 ? (
        ""
      ) : (
        <Box mt={4} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
          />
        </Box>
      )}
    </Fragment>
  )
}
