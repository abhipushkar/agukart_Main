"use client";

import { Fragment, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Favorite from "@mui/icons-material/Favorite";
// LOCAL CUSTOM HOOK

// GLOBAL CUSTOM COMPONENT

import ProductCard1 from "components/product-cards/product-card-1";
// CUSTOM DATA MODEL

// Local CUSTOM COMPONENT
import DashboardHeader from "pages-sections/customer-dashboard/dashboard-header";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { Box, CircularProgress, Typography } from "@mui/material";
import { usePathname } from "next/navigation";
// ==================================================================

// ==================================================================
export default function FollowShop(props) {
  // const { totalProducts, products } = props;

  // console.log(totalProducts, products,"thisnsshsh")

  const [folowVendor, setFollowVendor] = useState([]);

  const [totalProducts, setTotalProducts] = useState(0);
  const [showLoading, setShowloading] = useState(false);

  const pathname = usePathname();
  // const { usercredentials, setAddressCount } = useMyProvider();
  // const { currentPage, handleChangePage } = useWishList();

  const getFollowVendor = async () => {
    try {
      setShowloading(true);
      const res = await getAPIAuth("user/get-follow-vendor");
      console.log(res, "this sis res of wishlist");
      if (res.status === 200) {
        const myArr = res.data.data.map((obj) => {
          return { ...obj, base_url: res.data.base_url };
        });
        setFollowVendor(myArr);
        setTotalProducts(res.data.data.length);
        setShowloading(false);
      }
    } catch (error) {
      setShowloading(false);
      console.log(error);
    } finally {
      setShowloading(false);
    }
  };

  useEffect(() => {
    getFollowVendor();
  }, []);

  return showLoading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        gap: "10px",
      }}
    >
      <Typography variant="h6">We are working on your request</Typography>
      <CircularProgress size={20} />
    </Box>
  ) : (
    <Fragment>
      {/* TOP HEADER AREA */}
      <DashboardHeader title="Follow Shop" Icon={Favorite} />

      {/* PRODUCT LIST AREA */}
      <Grid container spacing={3}>
        {folowVendor.length === 0 ? (
          // <Box
          //   sx={{
          //     width: "100%",
          //     display: "flex",
          //     alignItems: "center",
          //     // justifyContent:"center",
          //     // flexDirection: "column",
          //     padding: "48px",
          //     height: "100vh",
          //   }}
          // >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              gap: "10px",
            }}
          >
            <Typography variant="h6">No {pathname === "/profile/follow-shop" ? "shop":"product"} found in {pathname === "/profile/follow-shop" ?"Follow shop":"Wishlist"}</Typography>
          </Box>
        ) : (
          // </Box>
          folowVendor?.map((item) => (
            <Grid item lg={3} md={4} sm={6} xs={12} key={item.id}>
              <ProductCard1
                product={item}
                getWishlistProduct={getFollowVendor}
                id={item.vendor_id}
                title={item.vendor_name}
                imgUrl={item?.shop_icon}
                product_id={item._id}
                vendorSlug={item.slug}
              />
            </Grid>
          ))
        )}
      </Grid>

      {/* PAGINATION AREA */}

      {/* {products.length === 0 ? (
        ""
      ) : (
        <Pagination
          page={currentPage}
          count={Math.ceil(totalProducts / 6)}
          onChange={(_, page) => handleChangePage(page)}
        />
      )} */}
    </Fragment>
  );
}
