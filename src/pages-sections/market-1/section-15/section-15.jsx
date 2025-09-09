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
import { useEffect } from "react";
import useAuth from "hooks/useAuth";

const section15 = ({ recentlyViewd, getRecentlyViewd }) => {
  const { token } = useAuth();
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
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 370,
      settings: {
        slidesToShow: 1,
      },
    },
  ];

  useEffect(() => {
    if (token) {
      getRecentlyViewd();
    }
  }, [token]);

  console.log({ recentlyViewd });

  return (
    <>
      <SectionCreator seeMoreLink="#">
        <H2 fontSize={17} mb={1}>
          Recently viewed & more
        </H2>
        {recentlyViewd.length <= 5 ? (
          <Grid container spacing={"20px"}>
            {recentlyViewd.map((product) => {
              return (
                <Grid item xs={12} md={4} lg={2.4}>
                  <Box>
                    <Link href={`/products?id=${product._id}`}>
                      <BazaarCard
                        sx={{
                          background: "none",
                          borderRadius: "4px",
                          position: "relative",
                          overflow: 'hidden',
                          transition: 'all 500ms',
                          '&:hover': {
                            boxShadow: '0 0 6px #c2c1c1'
                          }
                        }}

                      >
                        <LazyImage
                          width={260}
                          height={260}
                          alt="Anniversary Gifts"
                          src={product.base_url + product.image[0]}
                          sx={{ height: '260px', objectFit: 'cover', borderRadius: '4px', aspectRatio: '1/1' }}
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
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Carousel slidesToShow={5} responsive={responsive}>
            {recentlyViewd.map((product) => {
              return (
                <Box>
                  <Link href={`/products?id=${product._id}`}>
                    <BazaarCard
                      sx={{
                        background: "none",
                          borderRadius: "4px",
                          position: "relative",
                          overflow: 'hidden',
                          transition: 'all 500ms',
                          '&:hover': {
                            boxShadow: '0 0 6px #c2c1c1'
                          }
                      }}
                    >
                      <LazyImage
                        width={260}
                        height={260}
                        alt="Anniversary Gifts"
                        src={product.base_url + product.image[0]}
                        sx={{ height: '260px', objectFit: 'cover', borderRadius: '4px', aspectRatio: '1/1' }}
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
                        ${product.sale_price}
                        <Small
                          component="del"
                          sx={{ marginLeft: "3px", fontSize: "13px" }}
                        >
                          ${product.price}
                        </Small>
                      </H4>
                    </BazaarCard>
                  </Link>
                </Box>
              );
            })}
          </Carousel>
        )}
      </SectionCreator>
    </>
  );
};

export default section15;
