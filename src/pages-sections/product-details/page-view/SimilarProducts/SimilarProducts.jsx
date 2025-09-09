import { Box, Container, Grid, Typography } from "@mui/material";
import Product from "components/product/Product";
import { SectionCreator } from "components/section-header";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { getAPI } from "utils/__api__/ApiServies";

const SimilarProducts = ({ product_id }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const slides = chunkArray(similarProducts || [], 12);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const getSimilarProducts = async () => {
    try {
      setLoading(true);
      const res = await getAPI(`get-similar-product?productId=${product_id}`);
      if (res.status === 200) {
        setLoading(false);
        setSimilarProducts(res?.data?.data);
        setImageBaseUrl(res?.data?.image_url);
        setVideoBaseUrl(res?.data?.video_url);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product_id) {
      getSimilarProducts();
    }
  }, [product_id]);

  return (
    <SectionCreator title="Similar Products From Agukart">
      <Container sx={{ padding: "30px 16px" }}>
        {
          loading ? (
            <Box px={2}>
              <Grid container spacing={4}>
                {[...Array(6)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                    <ProductCardShimmer />
                  </Grid>
                ))}
              </Grid>
              <Grid container spacing={4} mt={1}>
                {[...Array(6)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2} key={index + 6}>
                    <ProductCardShimmer />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ):(
            similarProducts?.length > 0 ? (
              similarProducts.length >= 12 ? (
                <Typography
                  component="div"
                  mt={3}
                  sx={{
                    maxWidth: "100%",
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
                      fontSize: { xs: "16px", sm: "16px", md: "19px", lg: "21px" },
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
                  <Slider {...sliderSettings}>
                    {slides.map((slide, index) => {
                      const row1 = slide.slice(0, 6); // first 6 products
                      const row2 = slide.slice(6, 12); // next 6 products

                      return (
                        <Box key={index} px={2}>
                          <Grid container spacing={4}>
                            {row1.map((product) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={2}
                                key={product._id}
                              >
                                <Product
                                  product={product}
                                  imageBaseUrl={imageBaseUrl}
                                  videoBaseUrl={videoBaseUrl}
                                />
                              </Grid>
                            ))}
                          </Grid>
                          <Grid container spacing={4} mt={1}>
                            {row2.map((product) => (
                              <Grid
                                item
                                xs={12}
                                sm={6}
                                md={4}
                                lg={2}
                                key={product._id}
                              >
                                <Product
                                  product={product}
                                  imageBaseUrl={imageBaseUrl}
                                  videoBaseUrl={videoBaseUrl}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    })}
                  </Slider>
                </Typography>
              ) : (
                <Grid container spacing={4}>
                  {similarProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={product._id}>
                      <Product
                        product={product}
                        imageBaseUrl={imageBaseUrl}
                        videoBaseUrl={videoBaseUrl}
                      />
                    </Grid>
                  ))}
                </Grid>
              )
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  fontSize: "20px",
                  textTransform: "uppercase",
                  fontWeight: 900,
                }}
              >
                Products Not Found
              </Box>
            )
          )
        }
      </Container>
    </SectionCreator>
  );
};

export default SimilarProducts;
