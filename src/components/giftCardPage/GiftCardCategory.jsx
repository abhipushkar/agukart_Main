"use client";

import { Fragment, useEffect, useState } from "react";
// Local CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import { H2, H3, H4, H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Tooltip,
  tooltipClasses,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { getAPI } from "utils/__api__/ApiServies";
import Link from "next/link";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const GiftCardCategory = () => {
  const [bannerLoading, setBannerLoading] = useState(true);
  const [giftCardCategoryLoading, setGiftCardCategoryLoading] = useState(true);
  const [allGiftCardCategoryData, setAllGiftCardCategoryData] = useState([]);
  const [allBanners, setAllbanners] = useState([]);
  const [description, setDescription] = useState("");
  console.log({ allBanners, description });
  console.log({ allGiftCardCategoryData });
  const router = useRouter();

  const bannerCarousel = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 959,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 650,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 370,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const getAllGiftCardCategories = async () => {
    try {
      setBannerLoading(true);
      const res = await getAPI("get-all-category-with-gift-card");
      if (res.status === 200) {
        setAllGiftCardCategoryData(res.data.data);
      }
    } catch (error) {
      setBannerLoading(false);
      console.log(error);
    } finally {
      setBannerLoading(false);
    }
  };

  const getAllBannerForGiftCard = async () => {
    try {
      setGiftCardCategoryLoading(true);
      const res = await getAPI("getBanners");
      if (res.status === 200) {
        setGiftCardCategoryLoading(false);
        setAllbanners(res.data.result);
      }
    } catch (error) {
      setGiftCardCategoryLoading(false);
      console.log(error);
    } finally {
      setGiftCardCategoryLoading(false);
    }
  };

  const getDescription = async () => {
    try {
      const res = await getAPI("getGiftCardDescription");
      if (res.status === 200) {
        setDescription(res.data.result.description);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllGiftCardCategories();
    getAllBannerForGiftCard();
    getDescription();
  }, []);

  const BannerShimmer = () => (
    <Box
      mt={3}
      sx={{
        maxWidth: "100%",
        overflow: "hidden",
        background: "#f6f6f6",
        boxShadow: "0 0 3px #d2d2d2",
        borderRadius: "7px",
        padding: "12px 12px 33px 12px",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: {
            xs: "180px",
            sm: "250px",
            md: "350px",
            lg: "450px",
          },
        }}
      >
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: "3px",
          }}
        />
      </Box>
    </Box>
  );

  const GiftCardCategoryShimmer = () => (
    <Grid container spacing={3} justifyContent="center">
      {[...Array(6)].map((_, index) => (
        <Grid item key={index} lg={3} md={4} xs={12}>
          <Box textAlign="center">
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{
                width: "100%",
                height: {
                  xs: "180px",
                  sm: "200px",
                  md: "220px",
                },
                borderRadius: "10px",
              }}
            />
            <Skeleton
              variant="text"
              animation="wave"
              sx={{
                mt: 2,
                mx: "auto",
                height: "24px",
                width: "60%",
                display: "block",
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <SectionCreator py={4} mb={0}>
        <Box>
          {bannerLoading ? (
            <BannerShimmer />
          ) : (
            allBanners.length > 0 && (
              <Box
                mt={3}
                sx={{
                  maxWidth: "100%",
                  overflow: "hidden",
                  background: "#f6f6f6",
                  boxShadow: "0 0 3px #d2d2d2",
                  borderRadius: "7px",
                  padding: "12px 12px 33px 12px",
                  "& .slick-prev, & .slick-next": {
                    zIndex: 2,
                    width: { xs: "30px", sm: "35px", md: "40px", lg: "40px" },
                    height: { xs: "40px", sm: "40px", md: "60px", lg: "78px" },
                    background: "rgb(255 255 255 / 17%)",
                    borderRadius: "2px",
                    boxShadow: "0px 0px 3px #434242",
                    display: "flex !important",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  "& .slick-prev": {
                    left: "0px",
                  },
                  "& .slick-prev::before, & .slick-next::before": {
                    fontSize: {
                      xs: "16px",
                      sm: "16px",
                      md: "19px",
                      lg: "21px",
                    },
                    fontWeight: "bold",
                    color: "#333",
                    opacity: 1,
                  },
                  "& .slick-prev::before": {
                    content: '"❮"',
                  },
                  "& .slick-next": {
                    right: "0px",
                  },
                  "& .slick-next::before": {
                    content: '"❯"',
                  },
                }}
              >
                <Slider {...bannerCarousel}>
                  {allBanners?.map((data, index) => (
                    <Typography
                      component="div"
                      key={index}
                      sx={{
                        height: {
                          xs: "180px",
                          sm: "250px",
                          md: "350px",
                          lg: "450px",
                        },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={data?.image}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "3px",
                        }}
                      />
                    </Typography>
                  ))}
                </Slider>
              </Box>
            )
          )}
          <div style={{ textAlign: "center", fontSize: "22px" }}>
            <HtmlRenderer html={description || ""} />
          </div>
          <Box mt={5}>
            <Grid container spacing={3} justifyContent="center">
              {giftCardCategoryLoading ? (
                <GiftCardCategoryShimmer />
              ) : (
                allGiftCardCategoryData?.map((data, index) => (
                  <Grid
                    key={index}
                    item
                    lg={3}
                    md={4}
                    xs={12}
                    sx={{ cursor: "pointer" }}
                  >
                    <Link
                      href={`/gift-card-category/${data?._id}`}
                      style={{ textDecoration: "none" }}
                      passHref
                    >
                      <Box textAlign="center">
                        <Box
                          component="img"
                          src={data?.image}
                          alt={data?.title || "Gift Card"}
                          sx={{
                            borderRadius: "10px",
                            width: "100%",
                            height: {
                              xs: "180px",
                              sm: "200px",
                              md: "220px",
                            },
                            objectFit: "cover",
                            transition: "0.3s",
                            boxShadow: 1,
                            "&:hover": {
                              transform: "scale(1.03)",
                              boxShadow: 4,
                            },
                          }}
                        />

                        <Typography
                          mt={2}
                          fontSize="16px"
                          fontWeight={600}
                          sx={{
                            color: "#000",
                            textDecoration: "underline",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          {data?.title}
                        </Typography>
                      </Box>
                    </Link>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Box>
      </SectionCreator>
    </>
  );
};

export default GiftCardCategory;
