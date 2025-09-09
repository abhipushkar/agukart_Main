import Grid from "@mui/material/Grid";
import NewArrival from "icons/NewArrival";
import { SectionCreator } from "components/section-header";
import { useEffect, useState } from "react";
import { Carousel } from "components/carousel";
import ProductWithoutVideo from "components/productWithoutVideo/ProductWithoutVideo";
import { getAPI } from "utils/__api__/ApiServies";
import { Box, Skeleton } from "@mui/material";
import ProductCardShimmerWithoutVideo from "components/shimmer/ProductCardShimmerWithoutVideo";

export default function Section5() {
  const [newArrivals, setArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  const getNewArrivals = async () => {
    try {
      const res = await getAPI("get-product");
      if (res.status === 200) {
        const arr = res.data.data.map((item) => ({
          ...item,
          base_url: res.data.base_url,
        }));
        setArrivals(arr);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNewArrivals();
  }, []);

  const responsive = [
    {
      breakpoint: 1024,
      settings: { slidesToShow: 5 },
    },
    {
      breakpoint: 959,
      settings: { slidesToShow: 4 },
    },
    {
      breakpoint: 650,
      settings: { slidesToShow: 2 },
    },
    {
      breakpoint: 370,
      settings: { slidesToShow: 1 },
    },
  ];

  return (
    <SectionCreator
      icon={<NewArrival />}
      title="New Arrivals"
      seeMoreLink="#"
    >
      {loading ? (
        <Carousel slidesToShow={5} responsive={responsive}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardShimmerWithoutVideo key={i} />
          ))}
        </Carousel>
      ) : newArrivals.length <= 4 ? (
        <Grid container spacing={3}>
          {newArrivals.map((product) => (
            <Grid item lg={2} md={3} sm={4} xs={6} key={product.id}>
              <ProductWithoutVideo product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Carousel slidesToShow={5} responsive={responsive}>
          {newArrivals.map((product) => (
            <ProductWithoutVideo key={product.id} product={product} />
          ))}
        </Carousel>
      )}
    </SectionCreator>
  );
}
