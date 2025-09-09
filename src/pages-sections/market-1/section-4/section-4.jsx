import Link from "next/link";
import Grid from "@mui/material/Grid";
import RankBadge from "icons/RankBadge";
import { SectionCreator, SectionHeader } from "components/section-header";
import { useEffect, useState } from "react";
import { Carousel } from "components/carousel";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import ProductCardShimmerWithoutVideo from "components/shimmer/ProductCardShimmerWithoutVideo";
import ProductWithoutVideo from "components/productWithoutVideo/ProductWithoutVideo";

export default function Section4() {
  const { token } = useAuth();
  const [bestRatedProduct, setBestRatedProduct] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBestRatedProduct = async () => {
    try {
      const res = await getAPIAuth("bestRatedProduct", token);
      if (res.status === 200) {
        const arr = res.data.data.map((item) => ({
          ...item,
          base_url: res.data.base_url,
        }));
        setBestRatedProduct(arr);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBestRatedProduct();
  }, [token]);

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
      icon={<RankBadge />}
      title="Top Ratings"
      seeMoreLink="#"
    >
      {loading ? (
        <Carousel slidesToShow={5} responsive={responsive}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardShimmerWithoutVideo key={i} />
          ))}
        </Carousel>
      ) : bestRatedProduct?.length <= 4 ? (
        <Grid container spacing={3}>
          {bestRatedProduct?.map((product) => (
            <Grid item lg={2.4} md={3} sm={4} xs={5} key={product.id}>
              <ProductWithoutVideo product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Carousel slidesToShow={5} responsive={responsive}>
          {bestRatedProduct?.map((product) => (
            <ProductWithoutVideo key={product.id} product={product} />
          ))}
        </Carousel>
      )}
    </SectionCreator>
  );
}
