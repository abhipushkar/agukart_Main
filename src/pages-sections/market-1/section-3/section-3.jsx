import Link from "next/link";
import CategoryIcon from "icons/Category";
import BazaarCard from "components/BazaarCard";
import { Carousel } from "components/carousel";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import TopCategoriesCard from "../shared/top-categories-card";
import { useEffect, useState } from "react";
import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { Box, Skeleton } from "@mui/material";

export default function Section3() {
  const { token } = useAuth();
  const [topRatedCategory, setTopRatedCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTopRatedCategories = async () => {
    try {
      const res = await getAPIAuth("top-rated-category", token);
      if (res.status === 200) {
        const arr = res.data.data.map((item) => ({
          ...item,
          base_url: res.data.base_url,
        }));
        setTopRatedCategory(arr);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTopRatedCategories();
  }, [token]);

  const responsive = [
    { breakpoint: 959, settings: { slidesToShow: 2 } },
    { breakpoint: 650, settings: { slidesToShow: 1 } },
  ];

  const ShimmerCard = () => (
    <BazaarCard
      elevation={0}
      className="p-1"
      sx={{
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={300}
        sx={{
          borderRadius: "8px",
        }}
      />
    </BazaarCard>
  );

  return (
    <SectionCreator
      seeMoreLink="#"
      title="Top Categories"
      icon={<CategoryIcon color="primary" />}
    >
      {loading ? (
        <Carousel slidesToShow={3} responsive={responsive}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </Carousel>
      ) : topRatedCategory.length <= 3 ? (
        <Grid container spacing={"20px"}>
          {topRatedCategory.map((item) => (
            <Grid key={item._id} item xs={12} md={6} lg={4}>
              <Link
                href={`/products-categories/search/${item.slug}?title=${item.title}&_id=${item._id}`}
              >
                <BazaarCard
                  elevation={0}
                  className="p-1"
                  sx={{
                    overflow: "hidden",
                    transition: "all 500ms",
                    borderRadius: "12px",
                    "&:hover": {
                      boxShadow: "0 0 6px #c2c1c1",
                    },
                  }}
                >
                  <TopCategoriesCard
                    title={item.title}
                    imgUrl={item.base_url + item.topRatedImage}
                    subtitle={item.description}
                  />
                </BazaarCard>
              </Link>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Carousel slidesToShow={3} responsive={responsive}>
          {topRatedCategory.map((item) => (
            <Link
              key={item._id}
              href={`/products-categories/search/${item.slug}?title=${item.title}&_id=${item._id}`}
            >
              <BazaarCard
                elevation={0}
                className="p-1"
                sx={{
                  overflow: "hidden",
                  transition: "all 500ms",
                  borderRadius: "12px",
                  "&:hover": {
                    boxShadow: "0 0 6px #c2c1c1",
                  },
                }}
              >
                <TopCategoriesCard
                  title={item.title}
                  imgUrl={item.base_url + item.topRatedImage}
                  subtitle={item.description}
                />
              </BazaarCard>
            </Link>
          ))}
        </Carousel>
      )}
    </SectionCreator>
  );
}
