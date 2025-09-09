"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
// GLOBAL CUSTOM COMPONENTS

import LazyImage from "components/LazyImage";
import { Span } from "components/Typography";
import ProductViewDialog from "components/products-view/product-view-dialog";
// LOCAL CUSTOM HOOK

import useProduct from "../use-product";
// LOCAL CUSTOM COMPONENTS

import HoverActions from "./components/hover-actions";
import ProductPrice from "../product-price";
import ProductTitle from "../product-title";
import DiscountChip from "../discount-chip";
import QuantityButtons from "./components/quantity-buttons";
import Button from "@mui/material/Button";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Typography from "@mui/material/Typography";
// STYLED COMPONENTS

import { ImageWrapper, ContentWrapper, StyledBazaarCard } from "./styles";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import useCart from "hooks/useCart";
import React, { useState } from "react";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";

// ========================================================

// ========================================================
export default function ProductCard1({
  id,
  type,
  product,
  product_id,
  price,
  original_price,
  isCombination,
  variant_id,
  variant_attribute_id,
  slug,
  title,
  imgUrl,
  rating = 5,
  hideRating,
  hoverEffect,
  showProductSize,
  getWishlistProduct,
  vendorSlug,
}) {
  const {
    isFavorite,
    openModal,
    cartItem,
    toggleDialog,
    toggleFavorite,
    handleCartAmountChange,
  } = useProduct(slug);
  console.log(product, "productsssssssssssss")
  const { dispatch, getCartItems } = useCart();
  const { addToast } = useToasts();
  const router = useRouter();
  const { token } = useAuth();
  const [openRemoveWishList, setRemoveWishList] = useState(false);
  const [openAddToCart, setOpenAddToCart] = useState(false);
  const pathname = usePathname();

  const wishListToggle = async () => {
    if (!token) {
      router.push("/login");
    }

    if (pathname === "/profile/follow-shop") {
      try {
      } catch (error) {
        console.log(error);
      }
      return;
    }
    const payload = {
      product_id: product_id,
      price: price,
      original_price:original_price,
      isCombination:isCombination,
      variant_id: variant_id,
      variant_attribute_id: variant_attribute_id
    }
    try {
      const res = await postAPIAuth("user/add-delete-wishlist", payload);
      if (res.status === 200) {
        getWishlistProduct();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const addToCart = async () => {
    try {
      const payload = {
        product_id: product_id,
        vendor_id: product?.product_id?.vendor_id,
        qty: 1,
        price: price,
        original_price: original_price,
        isCombination: isCombination,
        variant_id: variant_id,
        variant_attribute_id: variant_attribute_id,
        customize: product?.product_id?.customize,
        customizationData: []
      }
      const res = await postAPIAuth("user/add-to-cart", payload);
      if (res.status === 200) {
        getCartItems();
        addToast("Product Added To Cart", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
    wishListToggle();
  };

  const toggleFollowVendor = async (id) => {
    try {
      const res = await postAPIAuth(`user/follow-vendor`, {
        vendorId: id,
      });
      if (res.status === 200) {
        getWishlistProduct();
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <React.Fragment>
        <Dialog
          open={openRemoveWishList}
          onClose={() => {
            setRemoveWishList(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure? you want to remove this{" "}
            {pathname === "/profile/follow-shop" ? "shop" : "product"}.
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={() => {
                setRemoveWishList(false);
              }}
            >
              No
            </Button>
            <Button
              autoFocus
              onClick={() => {
                if (pathname === "/profile/follow-shop") {
                  toggleFollowVendor(id);
                  return;
                }
                wishListToggle();
                setRemoveWishList(false);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
      <React.Fragment>
        <Dialog
          open={openAddToCart}
          onClose={() => {
            setOpenAddToCart(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you want to add this item to cart
          </DialogTitle>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenAddToCart(false);
              }}
            >
              No
            </Button>
            <Button
              autoFocus
              onClick={() => {
                addToCart();
                setOpenAddToCart(false);
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
      <StyledBazaarCard
        sx={{
          border: "1px solid #cbcbcb",
          background: "#fff",
          margin: "4px 0",
          "&:hover": {
            boxShadow: "0 0 6px #c2c1c1",
          },
          "&:hover .heartIcon": {
            opacity: 1,
            transform: "translateY(10px)",
          },
        }}
      >
        <ImageWrapper>
          {/* DISCOUNT PERCENT CHIP IF AVAILABLE */}
          {/* <DiscountChip discount={discount} /> */}

          {/* HOVER ACTION ICONS */}
          {/* <HoverActions
          getWishlistProduct={getWishlistProduct}
          product_id={product_id}
          isFavorite={isFavorite}
          toggleView={toggleDialog}
          toggleFavorite={toggleFavorite}
        /> */}
          <Typography
            component="span"
            className="heartIcon"
            sx={{
              background: "#fff",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              top: "0px",
              right: "18px",
              opacity: 0,
              transform: "translateY(-20px)",
              zIndex: "999",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Button onClick={() => setRemoveWishList(true)}>
              <FavoriteIcon sx={{ color: "red" }} />
            </Button>
          </Typography>
          {/* onClick={() => router.push(`/store/${vendorSlug}`)} */}

          {/* PRODUCT IMAGE / THUMBNAIL */}
          <Link
            href={
              pathname == "/profile/follow-shop"
                ? `/store/${vendorSlug}`
                : `/products?id=${product_id}`
            }
          >
            <LazyImage
              priority
              src={imgUrl}
              width={500}
              height={500}
              alt={title}
              style={{
                aspectRatio: "1/1",
                objectFit: "cover",
                height: "260px",
                position:"relative",
              }}
            />
             {product?.product_id?.product_bedge && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: product?.product_id?.product_bedge === "Popular Now"
                      ? "#fed9c9"
                      : product?.product_id?.product_bedge === "Best Seller"
                      ? "#e9d8a6"
                      : "#c1f1c1",
                    color: "#000",
                    borderRadius: "20px",
                    textDecoration: "underline dashed",
                    padding: "5px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontSize: "8px",
                    fontWeight: 600,
                    boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                    zIndex: 1,
                  }}
                >
                  {
                    product?.product_id?.product_bedge == "Popular Now" && <svg
                      height="20px"
                      width="20px"
                      viewBox="-33 0 255 255"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="xMidYMid"
                      fill="#000000"
                    >
                      <defs>
                        <linearGradient
                          id="linear-gradient-1"
                          gradientUnits="userSpaceOnUse"
                          x1="94.141"
                          y1="255"
                          x2="94.141"
                          y2="0.188"
                        >
                          <stop offset="0" stopColor="#ff4c0d" />
                          <stop offset="1" stopColor="#fc9502" />
                        </linearGradient>
                      </defs>
                      <g id="fire">
                        <path
                          d="M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z"
                          fill="url(#linear-gradient-1)"
                          fillRule="evenodd"
                        />
                        <path
                          d="M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z"
                          fill="#fc9502"
                          fillRule="evenodd"
                        />
                        <path
                          d="M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z"
                          fill="#fce202"
                          fillRule="evenodd"
                        />
                      </g>
                    </svg>
                  }
                  {
                    product?.product_id?.product_bedge == "Best Seller" && <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      height="20px"
                      width="20px"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M12 18a8 8 0 0 0 7.021-4.163q.008-.012.013-.024A8 8 0 1 0 12 18m4.5-8.8c.2-.1.2-.4.2-.6s-.3-.3-.5-.3h-2.8l-.9-2.7c-.1-.4-.8-.4-1 0l-.9 2.7H7.8c-.2 0-.4.1-.5.3s0 .4.2.6l2.3 1.7-.9 2.7c-.1.2 0 .4.2.6q.3.15.6 0l2.3-1.7 2.3 1.7c.1.1.2.1.3.1s.2 0 .3-.1c.2-.1.2-.4.2-.6l-.9-2.7z"
                      ></path>
                      <path d="M4.405 14.831a9 9 0 0 0 6.833 4.137L8.9 23l-2.7-3.3L2 19zm15.19 0a9 9 0 0 1-6.833 4.137L15.1 23l2.7-3.3L22 19z"></path>
                    </svg>
                  }
                  {product?.product_id?.product_bedge}
                </Box>
              )}
          </Link>
        </ImageWrapper>

        {/* PRODUCT VIEW DIALOG BOX */}
        <ProductViewDialog
          openDialog={openModal}
          handleCloseDialog={toggleDialog}
          product={{
            title,
            price,
            id,
            product_id,
            slug,
            imgGroup: [imgUrl, imgUrl],
          }}
        />

        <ContentWrapper sx={{ alignItems: "flex-end" }}>
          <Box flex="1 1 0" minWidth="0px" mr={1}>
            {/* PRODUCT NAME / TITLE */}
            <ProductTitle pathname={pathname} title={title} product_id={product_id} vendorSlug={vendorSlug} />
            {/* PRODUCT RATINGS IF AVAILABLE */}
            {pathname === "/profile/follow-shop" ? null : (
              <Rating size="small" value={rating} color="warn" readOnly />
            )}

            {/* PRODUCT SIZE IF AVAILABLE */}
            {showProductSize ? (
              <Span color="grey.600" mb={1} display="block">
                Liter
              </Span>
            ) : null}

            {/* PRODUCT PRICE WITH DISCOUNT */}
            {pathname === "/profile/follow-shop" ? (
              ""
            ) : (
              <ProductPrice
                salePrice={price}
                originalPrice={original_price}
              />
            )}
          </Box>

          {/* PRODUCT QUANTITY HANDLER BUTTONS */}
          {/* <QuantityButtons
          product={product}
          quantity={cartItem?.qty || 0}
          handleIncrement={handleIncrementQuantity}
          handleDecrement={handleDecrementQuantity}
        /> */}
          {pathname === "/profile/follow-shop" ? (
            ""
          ) : (
            <Button
              onClick={() => setOpenAddToCart(true)}
              variant="text"
              sx={{
                background: "#fff",
                height: "38px",
                fontSize: "12px",
                padding: "6px 16px",
                border: "2px solid #000",
                borderRadius: "30px",
                transition: "all 500ms",
                "&:hover": { boxShadow: "0 0 4px #000" },
              }}
            >
              Add to basket
            </Button>
          )}
        </ContentWrapper>
      </StyledBazaarCard>
    </>
  );
}
