import { SectionCreator } from "components/section-header";
import LazyImage from "components/LazyImage";
import { H4 } from "components/Typography";
import BazaarCard from "components/BazaarCard";
import DottedStar from "icons/DottedStar";
import { Box, Skeleton } from "@mui/material";
import { Carousel } from "components/carousel";
import Link from "next/link";
import { useEffect, useState } from "react";
import { postAPI } from "utils/__api__/ApiServies";

const section18 = () => {
  const [featureBrand, setFeatureBrand] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFeatureBrands = async () => {
    try {
      const res = await postAPI("get-brands", { type: "featured" });
      if (res.status === 200) {
        setFeatureBrand(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeatureBrands();
  }, []);

  const responsive = [
    {
      breakpoint: 959,
      settings: { slidesToShow: 2 },
    },
    {
      breakpoint: 650,
      settings: { slidesToShow: 1 },
    },
  ];

  // 🔹 Skeleton shimmer card inside carousel
  const ShimmerCard = () => (
    <BazaarCard sx={{ padding: 2 }}>
      <Skeleton variant="rectangular" width="100%" height={300} />
      <Skeleton variant="text" width="70%" height={24} sx={{ mt: 2 }} />
      <Skeleton variant="text" width="90%" height={24} />
    </BazaarCard>
  );

  return (
    <SectionCreator title="Featured Brands" icon={<DottedStar />}>
      {loading ? (
        <Carousel slidesToShow={3} responsive={responsive}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} px={1}>
              <ShimmerCard />
            </Box>
          ))}
        </Carousel>
      ) : (
        <Carousel slidesToShow={featureBrand.length <= 2 ? featureBrand.length : 3} responsive={responsive}>
          {featureBrand.map((brand) => (
            <Link key={brand._id} href={`${brand?.link}`}>
              <BazaarCard className="p-1">
                <LazyImage
                  width={385}
                  height={240}
                  alt="banner"
                  sx={{ height: { xs: "auto", sm: "auto", md: "240px", lg: "auto" }, objectFit: "cover", aspectRatio: "3/2" }}
                  src={brand?.image}
                />
                <H4 fontSize={14} pt={1} sx={{ textTransform: "capitalize", px: 2 }}>
                  {brand?.title}
                </H4>
                <H4 fontSize={14} pt={1} sx={{ textTransform: "capitalize", px: 2 }}>
                  {brand?.description}
                </H4>
              </BazaarCard>
            </Link>
          ))}
        </Carousel>
      )}
    </SectionCreator>
  );
};

export default section18;
