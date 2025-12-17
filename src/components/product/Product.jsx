import { Box, Grid, Rating, Typography, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import LazyImage from "components/LazyImage";
import { H6, Small } from "components/Typography";
import { FlexBox, FlexRowCenter } from "components/flex-box";
import useAuth from "hooks/useAuth";
import useMyProvider from "hooks/useMyProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { useCurrency } from "contexts/CurrencyContext";
import styled from "@emotion/styled";
import { calculatePriceAfterDiscount } from "utils/calculatePriceAfterDiscount";
import { getTimeLeftText } from "components/getTimeLeftText/getTimeLeftText";

const Product = ({ product, imageBaseUrl, videoBaseUrl }) => {
  const videoRef = useRef(null);
  const { currency } = useCurrency();
  const [promotion, setPromotion] = useState({});
  const [nextPromotion, setNextPromotion] = useState({});
  const router = useRouter();
  const { usercredentials } = useMyProvider();
  const { token } = useAuth();
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [wishlistIdArr, setWishlistIdArr] = useState([]);
  const [toggleWishlist, setToggleWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const VideoShow = styled("video")(({ theme }) => ({
    width: "100%",
    objectFit: "cover",
    height: "100%",
  }));

  useEffect(() => {
    if (token && wishlistIdArr.length > 0) {
      const isMatch = wishlistIdArr.some((id) => id === product?._id);
      setToggleWishlist(isMatch);
    } else {
      setToggleWishlist(false);
    }
  }, [token, wishlistIdArr]);

  const getWishList = async () => {
    try {
      const res = await getAPIAuth("user/get-wishlist");
      if (res.status === 200) {
        const data = res.data.wishlist.map((item) => {
          return item.product_id._id;
        });
        setWishlistIdArr(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleWishlist = async () => {
    if (!token) {
      router.push("/login");
    }
    const payload = {
      product_id: product?._id,
      price: product?.isCombination ? originalPrice : price,
      original_price: originalPrice,
      isCombination: product?.isCombination,
      variant_id: [],
      variant_attribute_id: [],
    };
    try {
      const res = await postAPIAuth("user/add-delete-wishlist", payload);
      if (res.status === 200) {
        getWishList();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      getWishList();
    }
  }, [token]);

  useEffect(() => {
    if (product?.isCombination) {
      const mergedCombinations = product?.combinationData
        ?.map((item) => item.combinations)
        .flat();
      const minimumPrice = mergedCombinations
        ?.filter((obj) => +obj.price > 0)
        ?.reduce((min, obj) => Math.min(min, +obj.price), Infinity);
      setPrice(minimumPrice === Infinity ? +product.sale_price : minimumPrice)
      setOriginalPrice(minimumPrice === Infinity ? +product.sale_price : minimumPrice);
      if (promotion && Object.keys(promotion).length > 0 && promotion.qty <= 1) {
        setPrice(calculatePriceAfterDiscount(promotion?.offer_type, +promotion?.discount_amount, minimumPrice === Infinity ? +product.sale_price : minimumPrice))
      }
    } else {
      setPrice(+product?.sale_price);
      setOriginalPrice(+product?.sale_price);
      if (promotion && Object.keys(promotion).length > 0 && promotion.qty <= 1) {
        setPrice(calculatePriceAfterDiscount(promotion?.offer_type, +promotion?.discount_amount, +product?.sale_price))
      }
    }
  }, [product, promotion]);

  useEffect(() => {
    if (Array.isArray(product?.promotionData) && product?.promotionData.length > 0) {
      const promotion = product.promotionData.reduce((best, promotion) => {
        if (!promotion.qty || promotion.qty === null) return best;

        if (
          !best ||
          best.qty === null ||
          promotion.qty < best.qty ||
          (promotion.qty === best.qty && promotion.discount_amount > best.discount_amount)
        ) {
          return promotion;
        }

        return best;
      }, null);

      const nextPromotion = product.promotionData.reduce(
        (next, promotion) => {
          if (
            promotion.qty !== null &&
            promotion.qty !== undefined &&
            promotion.qty > 1
          ) {
            if (!next || promotion.qty < next.qty || (promotion.qty === next.qty && promotion.discount_amount > next.discount_amount)) {
              return promotion;
            }
          }
          return next;
        },
        null
      );
      setPromotion(promotion);
      setNextPromotion(nextPromotion);
    }
  }, [product]);

  const VIEW_W = 224;
  const VIEW_H = 224;
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const clampPan = ({ scale = 1, x = 0, y = 0 }) => {
    const maxX = ((VIEW_W * scale) - VIEW_W) / 2;
    const maxY = ((VIEW_H * scale) - VIEW_H) / 2;
    return {
      scale,
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    };
  };
  return (
    <>
      <Box
        pb={1}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Typography
          component="div"
          sx={{
            textDecoration: "none",
            color: "#000",
            cursor: "pointer",
            ".MuiBox-root": {
              borderRadius: "2px",
            },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            // justifyContent: "space-between",
          }}
        >
          <Box
            borderRadius={1}
            mb={1}
            overflow={"hidden"}
            position="relative"
            sx={{
              overflow: "hidden",
              zIndex: 2,
              "&:hover": {
                boxShadow: "0 0 6px #c2c1c1",
              },
              "&:hover .heartIcon": {
                opacity: 1,
                transform: "translateY(10px)",
              },
            }}
          >
            {product?.videos?.length > 0 && isHovered ? (
              <div style={{ overflow: "hidden", width: "240px", height: "228px" }}>
                <VideoShow
                  ref={videoRef}
                  src={`${videoBaseUrl}${product?.videos[0]}`}
                  loop
                  muted
                  autoPlay
                />
              </div>
            ) : (
              <div style={{ height: "224px", width: "100%", overflow: "hidden" }}>
                <img
                  alt="image"
                  src={imageBaseUrl + product?.image[0]}
                  style={{
                    objectFit: "contain",
                    position: "relative",
                    borderRadius: "4px",
                    aspectRatio: "1/1",
                    width: "100%",
                    height: "100%",
                    transformOrigin: "center center",
                    ...(() => {
                      const { x, y, scale } = clampPan(product?.zoom || {});
                      return {
                        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                      };
                    })(),
                  }}
                />
              </div>
            )}
            {
              product?.product_bedge && <Typography
                sx={{
                  zIndex: "9",
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background:
                    product?.product_bedge === "Popular Now"
                      ? "#fed9c9"
                      : product?.product_bedge === "Best Seller"
                        ? "#e9d8a6"
                        : "#c1f1c1",
                  boxShadow: "0 0 3px #696969",
                  borderRadius: "30px",
                  padding: "5px 10px",
                  color: "#000",
                  textDecoration: "underline dashed",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "13px",
                  textUnderlineOffset: "2px",
                }}
              >
                {
                  product?.product_bedge == "Popular Now" && <svg
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
                  product?.product_bedge == "Best Seller" && <svg
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
                {product?.product_bedge}
              </Typography>
            }
            {usercredentials?.designation_id != "4" && (
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
                {toggleWishlist ? (
                  <Button onClick={handleWishlist}>
                    <FavoriteIcon sx={{ color: "red" }} />
                  </Button>
                ) : (
                  <Button onClick={handleWishlist}>
                    <FavoriteBorderIcon />
                  </Button>
                )}
              </Typography>
            )}
          </Box>
          <Box>
            <Link
              href={`/products/${product._id}`}
              style={{ textDecoration: "none" }}
            >
              <H6
                sx={{
                  textTransform: "capitalize",
                  mb: 0.5,
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  color: "#000",
                  position: "relative",

                  "&::before": {
                    position: "absolute",
                    inset: "0",
                    width: "100%",
                    height: "100%",
                    content: '""',
                  },
                }}
              >
                {product?.product_title.replace(/<\/?[^>]+(>|$)/g, "")}
              </H6>
            </Link>
            <FlexRowCenter
              mb={0.5}
              gap={0.5}
              sx={{ justifyContent: "start" }}
            >
              <Rating
                value={product.ratingAvg}
                size="small"
                color="warn"
                readOnly
                sx={{ fontSize: 13 }}
              />
              <Small fontWeight={600}>({product.userReviewCount})</Small>
            </FlexRowCenter>
            <FlexBox gap={1} sx={{ alignItems: "center" }}>
              <H6 color="primary.main">
                {currency?.symbol}
                {(price * currency?.rate).toFixed(2)}
              </H6>
              <Box component="del" fontWeight={600} color="grey.600">
                {originalPrice != price && currency?.symbol}
                {originalPrice != price && (originalPrice * currency?.rate).toFixed(2)}
              </Box>
              {
                promotion && Object.keys(promotion).length > 0 && promotion?.qty <= 1 && (
                  <Typography
                    component="span"
                    fontSize={12}
                    sx={{ color: "#000" }}
                  >
                    {promotion?.offer_type == "flat"
                      ? `(Flat ${promotion?.discount_amount} OFF)`
                      : `(${promotion?.discount_amount}% OFF)`}
                  </Typography>
                )
              }
            </FlexBox>
            {
              promotion && Object.keys(promotion).length > 0 && promotion?.qty <= 1 && (() => {
                const timeLeftText = getTimeLeftText(promotion.start_date, promotion.expiry_date);
                return timeLeftText ? (
                  <Typography sx={{ color: 'green', fontWeight: 'bold' }}>
                    {timeLeftText}
                  </Typography>
                ) : null;
              })()
            }
            {/* <Typography sx={{ color: "green" }}>Sale end in 3 hours</Typography> */}
            <Typography
              sx={{ color: "#000" }}
              onClick={() => {
                const baseUrl = `/store/${product?.vendorDetails?.slug}`;
                window.open(baseUrl, "_blank");
              }}
            >
              {product?.vendorDetails?.shop_name}
            </Typography>
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
            {/* <Typography sx={{ color: "red" }}>Only 2 left -order soon</Typography> */}
            {/* {
                      usercredentials?.designation_id != "4" && <Typography component="div" mt={1} sx={{ display: { lg: "flex", md: "flex", xs: "block" }, alignItems: "center", justifyContent: "space-between" }}>
                        <Button
                          variant="text"
                          sx={{
                            background: "#fff",
                            fontSize: "12px",
                            padding: "3px 16px",
                            border: "2px solid #000",
                            borderRadius: "30px",
                            transition: "all 500ms",
                            "&:hover": { boxShadow: "0 0 4px #000" },
                            display: "flex",
                            alignItems: "center",
                            whiteSpace: "nowrap"
                          }}
                        >

                          <AddIcon sx={{ fontSize: "16px", marginRight: "4px" }} />
                          Add to basket
                        </Button>
                        <Typography sx={{ color: "red" }}>Only 20+ baskets</Typography>
                      </Typography>
                    } */}
          </Box>
        </Typography>
      </Box>
    </>
  );
};

export default Product;
