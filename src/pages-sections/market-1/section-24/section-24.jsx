import GiftBox from "icons/GiftBox";
import { Carousel } from "components/carousel";
import { SectionCreator } from "components/section-header";
import { Grid, Skeleton, Box } from "@mui/material";
import ProductWithoutVideo from "components/productWithoutVideo/ProductWithoutVideo";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import ProductCardShimmerWithoutVideo from "components/shimmer/ProductCardShimmerWithoutVideo";

export default function Section24() {
  const [popularGift, setPopularGift] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPopularGift = async () => {
    try {
      const res = await getAPIAuth("getPopularGiftProducts");
      if (res.status === 200) {
        const arr = res.data.products.map((item) => {
          return { ...item, base_url: res.data.base_url };
        });
        setPopularGift(arr);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPopularGift();
  }, []);

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

  return (
    <div>
      <SectionCreator icon={<GiftBox />} title="Popular Gifts for You">
        {loading ? (
          <Carousel slidesToShow={5} responsive={responsive}>
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardShimmerWithoutVideo key={i} />
            ))}
          </Carousel>
        ) : popularGift.length <= 4 ? (
          <Grid container spacing={"20px"}>
            {popularGift.map((gift) => (
              <Grid key={gift._id} item xs={12} md={4} lg={2}>
                <ProductWithoutVideo product={gift} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Carousel slidesToShow={5} responsive={responsive}>
            {popularGift.map((gift) => (
              <ProductWithoutVideo key={gift._id} product={gift} />
            ))}
          </Carousel>
        )}
      </SectionCreator>
    </div>
  );
}
