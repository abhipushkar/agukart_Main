"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// MUI ICON COMPONENTS

import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
// GLOBAL CUSTOM HOOK

import useCart from "hooks/useCart";
// GLOBAL CUSTOM COMPONENTS

import LazyImage from "components/LazyImage";
import { H1, H2, H3, H6 } from "components/Typography";
import { FlexBox, FlexRowCenter } from "components/flex-box";
// CUSTOM UTILS LIBRARY FUNCTION

import { currency } from "lib";
// DUMMY DATA

import productVariants from "data/product-variants";
import axios from "axios";
import {
  getAPIAuth,
  postAPIAuth,
  postAPIFormData,
} from "utils/__api__/ApiServies";
import styled from "@emotion/styled";
import { Stack } from "@mui/material";
import useAuth from "hooks/useAuth";
// CUSTOM DATA MODEL

// ================================================================
export default function ProductIntro({ product }) {
  const { token } = useAuth();
  const {
    _id,
    price,
    product_title,
    image,
    slug,
    base_url,
    thumbnail,
    videos,
  } = product || {};

  const { state, dispatch } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectVariants, setSelectVariants] = useState({
    option: "option 1",
    type: "type 1",
  });
  // HANDLE CHANGE TYPE AND OPTIONS

  const handleChangeVariant = (variantName, value) => () => {
    setSelectVariants((state) => ({
      ...state,
      [variantName.toLowerCase()]: value,
    }));
  };
  // CHECK PRODUCT EXIST OR NOT IN THE CART

  console.log("hello", { state });

  const cartItem = state.cart.find((item) => item._id === _id);
  // HANDLE SELECT IMAGE

  //   const handleImageClick = (ind) => () =>
  // {console.log("=====indddddd",ind);
  // setSelectedImage(ind);}
  // HANDLE CHANGE CART

  const handleCartAmountChange = (amount) => () => {
    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: {
        price,
        qty: amount,
        name: product_title,
        image: `${base_url}${image[0]}`,
        _id,
      },
    });
  };

  console.log(cartItem, "productkokokookokokokokok");

  // const addToCartHandler = async () => {
  //   try {
  //     const res = await postAPIAuth("user/add-to-cart", {
  //       product_id: "66b609ae83790dec950ac533",
  //       qty: 10,
  //     });
  //     console.log("hellooooooooooooooooo", res);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (state.cart.length > 0) {
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

        if(token){
          fetchCart()
        }
      }
    }
  }, [state.cart]);

  const VideoAvatarContainer = styled("div")(({ theme }) => ({
    position: "relative",
    width: "64px",
    height: "64px",
    borderRadius: "10px",
    border: "1px solid",
    borderColor: "#dae1e7",
    overflow: "hidden",
  }));
  const VideoAvatar = styled("video")(({ theme }) => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }));
  const VideoShow = styled("video")(({ theme }) => ({
    width: "100%",
    height: "300px",
    objectFit: "cover",
  }));
  const saveimagedata = (ind) => {
    console.log("==================ind", ind);
    setSelectedImage(ind);
  };

  return (
    <Box width="100%">
      <Grid container spacing={3} justifyContent="space-around">
        {/* IMAGE GALLERY AREA */}
        <Grid item md={6} xs={12} alignItems="center">
          {selectedVideo ? (
            <VideoShow
              controls
              src={`http://159.89.164.11:7171/uploads/video/${selectedVideo}`}
            />
          ) : (
            <Zoom>
              <FlexBox
                borderRadius={3}
                overflow="hidden"
                justifyContent="center"
                mb={6}
              >
                {product && (
                  <img
                    alt={product_title.replace(/<[^>]*>/g, "")}
                    height={300}
                    loading="eager"
                    src={`${product?.base_url}${product?.image[selectedImage]}`}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                )}
              </FlexBox>
            </Zoom>
          )}

          <FlexBox overflow="auto">
            {image?.map((url, ind) => (
              <FlexRowCenter
                key={ind}
                width={64}
                height={64}
                minWidth={64}
                bgcolor="white"
                border="1px solid"
                borderRadius="10px"
                ml={ind === 0 ? "auto" : 0}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  saveimagedata(ind);
                  // handleImageClick(ind);
                  // console.log(ind,"it is ind")
                  setSelectedVideo("");
                }}
                mr={ind === image.length - 1 ? "auto" : "10px"}
                borderColor={
                  selectedImage === ind ? "primary.main" : "grey.400"
                }
              >
                <Avatar
                  alt="product"
                  src={`${base_url}${url}`}
                  variant="square"
                />
              </FlexRowCenter>
            ))}
          </FlexBox>
          <Stack
            direction={"row"}
            sx={{
              marginTop: "20px",
              gap: "10px",
              width: "100%",
              justifyContent: "center",
            }}
            overflow="auto"
          >
            {videos.map((url) => (
              <VideoAvatarContainer onClick={() => setSelectedVideo(url)}>
                <VideoAvatar
                  src={`http://159.89.164.11:7171/uploads/video/${url}`}
                  loop
                  muted
                />
              </VideoAvatarContainer>
            ))}
          </Stack>
        </Grid>

        {/* PRODUCT INFO AREA */}
        <Grid item md={6} xs={12} alignItems="center">
          {/* PRODUCT NAME */}
          <H1 mb={1}>{product_title.replace(/<[^>]*>/g, "")}</H1>

          {/* PRODUCT BRAND */}
          <FlexBox alignItems="center" mb={1}>
            <div>Brand: </div>
            <H6>Xiaomi</H6>
          </FlexBox>

          {/* PRODUCT RATING */}
          <FlexBox alignItems="center" gap={1} mb={2}>
            <Box lineHeight="1">Rated:</Box>
            <Rating color="warn" value={4} readOnly />
            <H6 lineHeight="1">(50)</H6>
          </FlexBox>

          {/* PRODUCT VARIANTS */}
          {productVariants.map((variant) => (
            <Box key={variant.id} mb={2}>
              <H6 mb={1}>{variant.title}</H6>

              {variant.values.map(({ id, value }) => (
                <Chip
                  key={id}
                  label={value}
                  onClick={handleChangeVariant(variant.title, value)}
                  sx={{
                    borderRadius: "4px",
                    mr: 1,
                    cursor: "pointer",
                  }}
                  color={
                    selectVariants[variant.title.toLowerCase()] === value
                      ? "primary"
                      : "default"
                  }
                />
              ))}
            </Box>
          ))}

          {/* PRICE & STOCK */}
          <Box pt={1} mb={3}>
            <H2 color="primary.main" mb={0.5} lineHeight="1">
              {currency(price)}
            </H2>
            <Box color="inherit">Stock Available</Box>
          </Box>

          {/* ADD TO CART BUTTON */}
          {!cartItem?.qty ? (
            <Button
              color="primary"
              variant="contained"
              onClick={handleCartAmountChange(1)}
              sx={{
                mb: 4.5,
                px: "1.75rem",
                height: 40,
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <FlexBox alignItems="center" mb={4.5}>
              <Button
                size="small"
                sx={{
                  p: 1,
                }}
                color="primary"
                variant="outlined"
                onClick={handleCartAmountChange(cartItem?.qty - 1)}
              >
                <Remove fontSize="small" />
              </Button>

              <H3 fontWeight="600" mx={2.5}>
                {cartItem?.qty.toString().padStart(2, "0")}
              </H3>

              <Button
                size="small"
                sx={{
                  p: 1,
                }}
                color="primary"
                variant="outlined"
                onClick={handleCartAmountChange(cartItem?.qty + 1)}
              >
                <Add fontSize="small" />
              </Button>
            </FlexBox>
          )}

          {/* SHOP NAME */}
          <FlexBox alignItems="center" gap={1} mb={2}>
            <div>Sold By:</div>
            <Link href="/shops/scarlett-beauty">
              <H6>Mobile Store</H6>
            </Link>
          </FlexBox>
        </Grid>
      </Grid>
    </Box>
  );
}
