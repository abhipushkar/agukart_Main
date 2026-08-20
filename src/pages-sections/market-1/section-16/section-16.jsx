import Link from "next/link";
// CUSTOM ICON COMPONENT

import CategoryIcon from "icons/Category";
// GLOBAL CUSTOM COMPONENTS

import BazaarCard from "components/BazaarCard";
import { SectionCreator } from "components/section-header";
import LazyImage from "components/LazyImage";
import { H2, H4, Small } from "components/Typography";
// LOCAL CUSTOM COMPONENT

// CUSTOM DATA MODEL
import { Box, Grid } from "@mui/material";
import { Carousel } from "components/carousel";
import { fontSize } from "theme/typography";
import { useEffect, useState } from "react";
import useAuth from "hooks/useAuth";
import ProductWithoutVideo from "components/productWithoutVideo/ProductWithoutVideo";

const section16 = ({ becauseViewed, getBecauseOfView }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const responsive = [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 959,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 650,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 450,
      settings: {
        slidesToShow: 2,
      },
    },
  ];

  useEffect(() => {
    if (token) {
      setLoading(true);
      getBecauseOfView();
      setLoading(false);
    }
  }, [token]);

  return (
    <>
      <SectionCreator seeMoreLink="">
        <H2 fontSize={17} mb={1}>
          Because you viewed
        </H2>
        {loading ? (
          <Carousel slidesToShow={5} responsive={responsive}>
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardShimmerWithoutVideo key={i} />
            ))}
          </Carousel>
        ) : becauseViewed.length <= 5 ? (
          <Grid container spacing={"20px"}>
            {becauseViewed.map((product) => {
              return (
                <Grid key={product._id} item xs={12} md={4} lg={2.4}>
                  <Box key={product._id}>
                    <Box mb={2}>
                      <Link href={`/product/${product.slug}/${product.product_code}`}>
                        <BazaarCard
                          sx={{
                            background: "none",
                            borderRadius: "4px",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 500ms",
                            "&:hover": {
                              boxShadow: "0 0 6px #c2c1c1",
                            },
                          }}
                        >
                          <LazyImage
                            width={260}
                            height={260}
                            alt="Anniversary Gifts"
                            src={product.base_url + product.image[0]}
                            sx={{
                              height: "260px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              aspectRatio: "1/1",
                            }}
                          />
                          <H4
                            fontSize={13}
                            sx={{
                              position: "absolute",
                              bottom: "12px",
                              left: "12px",
                              background: "#fff",
                              boxShadow: "0 0 3px #000",
                              borderRadius: "30px",
                              padding: "6px 18px",
                            }}
                          >
                            ${product.price}
                            <Small
                              component="del"
                              sx={{ marginLeft: "3px", fontSize: "13px" }}
                            >
                              ${product.sale_price}
                            </Small>
                          </H4>
                        </BazaarCard>
                      </Link>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Carousel slidesToShow={5} responsive={responsive}>
            {becauseViewed.map((product) => {
              return (
                <ProductWithoutVideo product={product}/>
              );
            })}
          </Carousel>
        )}
      </SectionCreator>
    </>
  );
};

export default section16;
