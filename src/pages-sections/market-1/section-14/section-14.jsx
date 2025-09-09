import Link from "next/link";
import Grid from "@mui/material/Grid";
import { H4 } from "components/Typography";
import HoverBox from "components/HoverBox";
import LazyImage from "components/LazyImage";
import { SectionCreator } from "components/section-header";
import { useEffect, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import { Carousel } from "components/carousel";
import { postAPI } from "utils/__api__/ApiServies";

const section14 = () => {
  const [popularGiftCategories, setPopularGiftCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPopularGiftCatgories = async () => {
    try {
      const res = await postAPI("get-admin-category", {
        type: "popular",
      });

      if (res.status === 200) {
        setPopularGiftCategories(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPopularGiftCatgories();
  }, []);

  const responsive = [
    { breakpoint: 1024, settings: { slidesToShow: 5 } },
    { breakpoint: 959, settings: { slidesToShow: 4 } },
    { breakpoint: 650, settings: { slidesToShow: 2 } },
    { breakpoint: 370, settings: { slidesToShow: 1 } },
  ];

  const shimmerCard = (
    <Box
      sx={{
        border: "1px solid #cbcbcb",
        borderRadius: "8px",
        overflow: "hidden",
        padding: 1,
      }}
    >
      <Skeleton variant="rectangular" height={198} width="100%" animation="wave" />
      <Skeleton
        variant="text"
        height={30}
        width="60%"
        sx={{ mx: "auto", mt: 2 }}
      />
    </Box>
  );

  return (
    <>
      <SectionCreator title="Shop Our Popular Gift Categories">
        {loading ? (
          <Carousel slidesToShow={5} responsive={responsive}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i}>{shimmerCard}</Box>
            ))}
          </Carousel>
        ) : popularGiftCategories.length <= 5 ? (
          <Grid container spacing={"20px"}>
            {popularGiftCategories.map((gift) => (
              <Grid key={gift._id} item xs={12} md={4} lg={2.4}>
                <Box
                  sx={{
                    border: "1px solid #cbcbcb",
                    borderRadius: "8px",
                    transition: "all 500ms",
                    overflow: "hidden",
                    "&:hover": {
                      boxShadow: "0 0 6px #c2c1c1",
                    },
                  }}
                >
                  <Link
                    href={`/product?slug=${gift.slug}&id=${gift._id}&title=${gift.title}`}
                  >
                    <Box sx={{ borderRadius: "8px 8px 0px 0px" }}>
                      <LazyImage
                        width={198}
                        height={198}
                        alt={gift.title}
                        src={gift.image}
                        sx={{
                          height: "198px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <H4
                      style={{ textTransform: "capitalize" }}
                      fontSize={18}
                      py={3}
                      sx={{ textAlign: "center" }}
                    >
                      {gift.title}
                    </H4>
                  </Link>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Carousel slidesToShow={5} responsive={responsive}>
            {popularGiftCategories.map((gift) => (
              <Box
                key={gift._id}
                sx={{
                  border: "1px solid #cbcbcb",
                  borderRadius: "8px",
                  transition: "all 500ms",
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: "0 0 6px #c2c1c1",
                  },
                }}
              >
                <Link
                  href={`/product?slug=${gift.slug}&id=${gift._id}&title=${gift.title}`}
                >
                  <HoverBox sx={{ borderRadius: "8px 8px 0px 0px" }}>
                    <LazyImage
                      width={198}
                      height={198}
                      alt={gift.title}
                      src={gift.image}
                      sx={{
                        height: {
                          md: "289px",
                          sm: "auto",
                        },
                        objectFit: "cover",
                      }}
                    />
                  </HoverBox>
                  <H4 fontSize={18} my={2} sx={{ textAlign: "center" }}>
                    {gift.title}
                  </H4>
                </Link>
              </Box>
            ))}
          </Carousel>
        )}
      </SectionCreator>
    </>
  );
};

export default section14;
