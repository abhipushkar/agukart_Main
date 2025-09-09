"use client";
import Container from "@mui/material/Container";
import { useEffect, useState } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { StyledRoot } from "components/carousel-cards/carousel-card-1/styles";
import { Grid, Skeleton, Box } from "@mui/material";
import BazaarImage from "components/BazaarImage";
import { Carousel } from "components/carousel";
import CarouselCard1 from "components/carousel-cards/carousel-card-1";

export default function Section1() {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth;

  const carouselDatafuction = async () => {
    try {
      const res = await getAPIAuth("get-slider", token);
      if (res.status === 200) {
        setdata(res?.data?.result);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carouselDatafuction();
  }, []);

  return (
    <div className="bg-white">
      <Container style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <StyledRoot>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12}>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  sx={{
                    borderRadius: 2,
                    height: { xs: 200, sm: 300, md: 400 },
                  }}
                />
              </Grid>
            </Grid>
          </StyledRoot>
        ) : data?.length < 2 ? (
          <StyledRoot>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12}>
                <BazaarImage
                  src={data[0]?.image}
                  alt="slider"
                  sx={{
                    width: "100%",
                    height: { xs: 200, sm: 300, md: 400 },
                    objectFit: "cover",
                    borderRadius: 2,
                    display: "block",
                  }}
                />
              </Grid>
            </Grid>
          </StyledRoot>
        ) : (
          <Carousel slidesToShow={1} arrows={false} dots autoplay>
            {data?.map((item, ind) => (
              <Box
                key={ind}
                sx={{
                  width: "100%",
                  height: { xs: 200, sm: 300, md: 400 }, 
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                <CarouselCard1 {...item} />
              </Box>
            ))}
          </Carousel>
        )}
      </Container>
    </div>
  );
}
