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

const Section18 = () => {
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
            <Box key={brand._id} px={1}>
              <Link href={`${brand?.link}`} style={{ display: 'block', textDecoration: 'none' }}>
                <BazaarCard
                  className="p-1"
                  sx={{
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Box sx={{
                    overflow: 'hidden',
                    borderRadius: '8px'
                  }}>
                    <LazyImage
                      width={385}
                      height={240}
                      alt="banner"
                      sx={{
                        height: { xs: "auto", sm: "auto", md: "240px", lg: "auto" },
                        objectFit: "cover",
                        aspectRatio: "3/2",
                        width: '100%',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        }
                      }}
                      src={brand?.image}
                    />
                  </Box>
                  <H4
                    fontSize={14}
                    pt={1}
                    sx={{
                      textTransform: "capitalize",
                      px: 2,
                      color: 'text.primary',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {brand?.title}
                  </H4>
                  <H4
                    fontSize={14}
                    pt={1}
                    sx={{
                      textTransform: "capitalize",
                      px: 2,
                      color: 'text.secondary',
                      transition: 'color 0.3s ease',
                      '&:hover': {
                        color: 'text.primary'
                      }
                    }}
                  >
                    {brand?.description}
                  </H4>
                </BazaarCard>
              </Link>
            </Box>
          ))}
        </Carousel>
      )}
    </SectionCreator>
  );
};

export default Section18;
