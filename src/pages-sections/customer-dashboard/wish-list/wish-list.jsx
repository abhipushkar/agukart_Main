"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Favorite from "@mui/icons-material/Favorite";
import ProductCard1 from "components/product-cards/product-card-1";
// CUSTOM DATA MODEL

// Local CUSTOM COMPONENT
import Pagination from "../pagination";
import DashboardHeader from "../dashboard-header";
import useAuth from "hooks/useAuth";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
import useMyProvider from "hooks/useMyProvider";
// ==================================================================

// ==================================================================
export default function WishListPageView(props) {
  const router = useRouter();
  const [showLoading, setShowloading] = useState(true);
  const params = useSearchParams();
  let queryPage = params.get("page");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);
  const { token } = useAuth();
  const { wishlistProducts, getWishlistProducts } = useMyProvider();
  const limit = 16;

  const products = useMemo(() => {
    const currentPage = Number(page) || 1;
    const start = (currentPage - 1) * limit;
    return (wishlistProducts || []).slice(start, start + limit);
  }, [wishlistProducts, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(`${window.location.pathname}?${currentParams.toString()}`);
  };

  const loadWishlistProducts = async () => {
    if (!token) {
      setShowloading(false);
      return;
    }
    try {
      setShowloading(true);
      const wishlistData = await getWishlistProducts();
      setTotalPages(Math.max(1, Math.ceil((wishlistData?.length || 0) / limit)));
    } catch (error) {
      setShowloading(false);
      console.log(error);
    } finally {
      setShowloading(false);
    }
  };

  useEffect(() => {
    loadWishlistProducts();
  }, [token]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(((wishlistProducts || []).length) / limit)));
  }, [wishlistProducts]);

  useEffect(() => {
    if (Number(page) > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <Fragment>
      <DashboardHeader title="My Wish List" Icon={Favorite} />
      <Grid container spacing={3}>
        {
          showLoading ? (
            <>
              {[...Array(16)].map((_, index) => (
                <Grid key={index} item xs={6} md={4} lg={3}>
                  <ProductCardShimmer />
                </Grid>
              ))}
            </>
          ) : (
            products.length > 0 ? (
              products?.map((item) => (
                <Grid item lg={3} md={4} sm={6} xs={12} key={item.id}>
                  <ProductCard1
                    product={item}
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
                    rating={item?.product_id?.rating}
                    ratingCount={item?.product_id?.reviewCount}
                    imgUrl={`${item?.base_url || "https://api.agukart.com/uploads/product/"}${item?.product_id?.image[0]}`}
                  />
                </Grid>
              ))
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: {md:"50vh" , xs: "30vh"},
                  width: "100%",
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
