import Box from "@mui/material/Box";
// CUSTOM ICON COMPONENT

import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import Light from "icons/Light";
// GLOBAL CUSTOM COMPONENTS

import { Carousel } from "components/carousel";
import { SectionCreator } from "components/section-header";
import ProductCard1 from "components/product-cards/product-card-1";
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
export default function Section2() {
  // const flashDeals = await api.getFlashDeals();
  const [data , setdata] = useState([])

  const carouselDatafuction = async() => {

    const flashDeals = await api.getFlashDeals();
    setdata(flashDeals)
  }
  
  useEffect(() => {
    carouselDatafuction()
  }, []);
  const responsive = [
    {
      breakpoint: 1279,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 959,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 650,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 500,
      settings: {
        slidesToShow: 1,
      },
    },
  ];

  // console.log("datadata" , data);
  return (
    <div>
      <Container className="small-shop-main-para">
        <Grid item lg={12} md={12} sm={12} xs={12} sx={{ margin: "25px 0" }}>
          <Typography sx={{ textAlign: "center", fontSize: "30px" }}>
            Small Shop Make Every Moment More Special
          </Typography>
          <Grid container spacing={1} sx={{ marginTop: "15px" }}>
            <Grid
              item
              lg={10}
              md={10}
              sm={12}
              xs={12}
              sx={{ margin: "0 auto" }}
            >
              <Grid container spacing={1} sx={{ justifyContent: "center" }}>
                <Grid item lg={2} md={2} sm={4} xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      alt="Remy Sharp"
                      src="https://i.etsystatic.com/ij/2c2290/6058155340/ij_300x300.6058155340_7k4scq0k.jpg?version=0"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        margin: "0 auto",
                      }}
                    />
                    <Typography sx={{ paddingTop: "6px", color: "#000" }}>
                      Birthday Gifts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item lg={2} md={2} sm={4} xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      alt="Remy Sharp"
                      src="https://i.etsystatic.com/25432059/c/1594/1594/613/81/il/9eb45c/4186854296/il_300x300.4186854296_bprq.jpg"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        margin: "0 auto",
                      }}
                    />
                    <Typography sx={{ paddingTop: "6px", color: "#000" }}>
                      Home Gifts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item lg={2} md={2} sm={4} xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      alt="Remy Sharp"
                      src="https://i.etsystatic.com/35526626/r/il/f06d57/4617241612/il_300x300.4617241612_skgq.jpg"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        margin: "0 auto",
                      }}
                    />
                    <Typography sx={{ paddingTop: "6px", color: "#000" }}>
                      Anniverdsry Gifts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item lg={2} md={2} sm={4} xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      alt="Remy Sharp"
                      src="https://i.etsystatic.com/25432059/c/1594/1594/613/81/il/9eb45c/4186854296/il_300x300.4186854296_bprq.jpg"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        margin: "0 auto",
                      }}
                    />
                    <Typography sx={{ paddingTop: "6px", color: "#000" }}>
                      Gift for Dad
                    </Typography>
                  </Box>
                </Grid>
                <Grid item lg={2} md={2} sm={4} xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <img
                      alt="Remy Sharp"
                      src="https://i.etsystatic.com/14533306/r/il/f32a84/3975871104/il_300x300.3975871104_pk5c.jpg"
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        margin: "0 auto",
                      }}
                    />
                    <Typography sx={{ paddingTop: "6px", color: "#000" }}>
                      Gift for Dad
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <SectionCreator
        icon={<Light color="primary" />}
        title="Flash Deals"
      >
        <Carousel responsive={responsive}>
          {data?.map((item) => (
            <Box pb={0.6} key={item.id}>
              <ProductCard1
                id={item.id}
                slug={item.slug}
                title={item.title}
                price={item.price}
                rating={item.rating}
                imgUrl={item.thumbnail}
                discount={item.discount}
              />
            </Box>
          ))}
        </Carousel>
      </SectionCreator>
      ;
    </div>
  );
}
