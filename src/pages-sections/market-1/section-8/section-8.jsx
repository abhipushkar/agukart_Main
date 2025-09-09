import Link from "next/link";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import LazyImage from "components/LazyImage";
import Skeleton from "@mui/material/Skeleton";
import { useEffect, useState } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";

export default function Section8() {
  const [dealData, setDealsData] = useState({});
  const [loading, setLoading] = useState(true);

  const getDeals = async () => {
    try {
      const res = await getAPIAuth("get-deals");
      if (res.status === 200) {
        setDealsData({
          base_url: res.data.base_url,
          box_url: res.data.box_url,
          ...res.data.data,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDeals();
  }, []);

  const shimmerBox = (width = "100%", height = 342) => (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      sx={{ borderRadius: "4px" }}
    />
  );

  return (
    <Container className="mb-5">
      {loading ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {shimmerBox("100%", 342)}
          </Grid>
          <Grid item xs={12} md={8}>
            {shimmerBox("100%", 342)}
          </Grid>
        </Grid>
      ) : dealData?.deal_2 ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Link href={dealData?.deal_1_link}>
              <Box
                sx={{
                  overflow: "hidden",
                  transition: "all 500ms",
                  height: "100%",
                  borderRadius: "4px",
                  "&:hover": {
                    "& img": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <LazyImage
                  width={385}
                  height={342}
                  alt="banner"
                  src={dealData?.base_url + dealData?.deal_1}
                  sx={{
                    transition: "transform 500ms",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Link>
          </Grid>

          <Grid item xs={12} md={8}>
            <Link href={dealData?.deal_2_link}>
              <Box
                sx={{
                  overflow: "hidden",
                  transition: "all 500ms",
                  height: "100%",
                  borderRadius: "4px",
                  "&:hover": {
                    "& img": {
                      transform: "scale(1.1)",
                    },
                  },
                }}
              >
                <LazyImage
                  width={790}
                  height={342}
                  alt="banner"
                  src={dealData?.base_url + dealData?.deal_2}
                  sx={{
                    transition: "transform 500ms",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
            </Link>
          </Grid>
        </Grid>
      ) : (
        <Grid container>
          <Grid item xs={12}>
            {loading ? (
              shimmerBox("100%", 342)
            ) : (
              <Link href={dealData?.deal_1_link}>
                <Box
                  sx={{
                    overflow: "hidden",
                    transition: "all 500ms",
                    height: "100%",
                    borderRadius: "4px",
                    "&:hover": {
                      "& img": {
                        transform: "scale(1.1)",
                      },
                    },
                  }}
                >
                  <LazyImage
                    width={385}
                    height={342}
                    alt="banner"
                    src={dealData?.base_url + dealData?.deal_1}
                    sx={{
                      transition: "transform 500ms",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Link>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
