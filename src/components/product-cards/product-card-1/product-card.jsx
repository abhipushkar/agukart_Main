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
import { postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import useCart from "hooks/useCart";
import React, { useState } from "react";
import { Dialog, DialogActions, DialogTitle } from "@mui/material";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
import useMyProvider from "hooks/useMyProvider";

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
  ratingCount,
  hideRating,
  hoverEffect,
  showProductSize,
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
  const { addDeleteWishlistProduct } = useMyProvider();
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
      original_price: original_price,
      isCombination: isCombination,
      variant_id: variant_id,
      variant_attribute_id: variant_attribute_id
    }
    try {
      await addDeleteWishlistProduct(payload);
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
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* Dialogs */}
      <React.Fragment>
        <Dialog
          open={openRemoveWishList}
          onClose={() => setRemoveWishList(false)}
          aria-labelledby="alert-dialog-title"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure? you want to remove this{" "}
            {pathname === "/profile/follow-shop" ? "shop" : "product"}.
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setRemoveWishList(false)}>No</Button>
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
          onClose={() => setOpenAddToCart(false)}
          aria-labelledby="alert-dialog-title"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to add this item to cart?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpenAddToCart(false)}>No</Button>
            <Button autoFocus onClick={() => { addToCart(); setOpenAddToCart(false); }}>Yes</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>

      {/* ===== FOLLOW SHOP PAGE ===== */}
      {pathname === "/profile/follow-shop" ? (
        <StyledBazaarCard
  sx={{
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
    background: "#fff",
    margin: "4px 0",
    width: "100%",
    "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
  }}
>
          {/* Shop Banner */}
          <Link href={`/store/${vendorSlug}`}>
            <Box sx={{ width: "100%", overflow: "hidden" }}>
  <img
    src={imgUrl}
    alt={title}
    style={{ width: "100%", height: "auto", display: "block" }}
  />
</Box>
          </Link>

          {/* Bottom - Shop Icon + Name + Rating + Heart */}
          <Box sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* Shop Icon Circle */}
              <Box sx={{ width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", border: "2px solid #e0e0e0", flexShrink: 0 }}>
                <img
                  src={product?.shop_icon}
                  alt={title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              {/* Shop Name + Rating */}
              <Box>
                <Typography fontWeight={600} fontSize="14px">{title}</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Rating size="small" value={product?.average_rating || 0} readOnly />
                  <Typography fontSize="12px" color="text.secondary">
                    ({product?.total_reviews || 0})
                  </Typography>
                </Box>
              </Box>
            </Box>
            {/* Heart Button */}
            <Button onClick={() => setRemoveWishList(true)} sx={{ minWidth: "auto", p: 0.5 }}>
              <FavoriteIcon sx={{ color: "red" }} />
            </Button>
          </Box>
        </StyledBazaarCard>

      ) : (
        /* ===== NORMAL PRODUCT CARD - SAME AS BEFORE ===== */
        <StyledBazaarCard
          sx={{
            border: "1px solid #cbcbcb",
            background: "#fff",
            margin: "4px 0",
            "&:hover": { boxShadow: "0 0 6px #c2c1c1" },
            "&:hover .heartIcon": {
              opacity: 1,
              transform: "translateY(10px)",
            },
          }}
        >
          <ImageWrapper>
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

            <Link href={`/product/${product.product_id.slug}/${product.product_id.product_code}`}>
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
                  position: "relative",
                }}
              />
              {product?.product_id?.product_bedge && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background:
                      product?.product_id?.product_bedge === "Popular Now"
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
                  {product?.product_id?.product_bedge}
                </Box>
              )}
            </Link>
          </ImageWrapper>

          <ProductViewDialog
            openDialog={openModal}
            handleCloseDialog={toggleDialog}
            product={{ title, price, id, product_id, slug, imgGroup: [imgUrl, imgUrl] }}
          />
          <Box px={1}>
            <ProductTitle pathname={pathname} title={title} product_id={product.product_id} vendorSlug={vendorSlug} />
          </Box>
          <ContentWrapper sx={{ alignItems: "flex-end" }}>
            <Box flex="1 1 0" minWidth="0px" mr={1}>
              <Box display={'flex'}>
              <Rating size="small" value={rating} color="warn" readOnly />
              {ratingCount > 0 && (
                <Span color="lightgray" mb={1} display="block">({ratingCount})</Span>
              )}
              {showProductSize && (
                <Span color="grey.600" mb={1} display="block">Liter</Span>
              )}
              </Box>
              <ProductPrice salePrice={price} originalPrice={original_price} />
            </Box>
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
          </ContentWrapper>
        </StyledBazaarCard>
      )}
    </>
  );
}
