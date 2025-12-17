import Link from "next/link";
import Grid from "@mui/material/Grid";
import { Box, Skeleton } from "@mui/material";
import LazyImage from "components/LazyImage";
import { SectionCreator } from "components/section-header";
import { H4 } from "components/Typography";
import { Carousel } from "components/carousel";
import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";

const responsive = [
  { breakpoint: 1024, settings: { slidesToShow: 5 } },
  { breakpoint: 959, settings: { slidesToShow: 4 } },
  { breakpoint: 650, settings: { slidesToShow: 2 } },
  { breakpoint: 370, settings: { slidesToShow: 1 } },
];

const ShimmerCard = () => (
  <Box px={1}>
    <Box sx={{ textAlign: "center" }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={260}
        sx={{ borderRadius: "5px" }}
      />
    </Box>
  </Box>
);

const Slider = ({ cat }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getProductData = async (_id) => {
    try {
      const res = await getAPIAuth(`get-product?categoryId=${_id}`, token);
      if (res.status === 200) {
        const arr = res.data.data.map((item) => ({
          ...item,
          base_url: res.data.base_url,
        }));
        setProducts(arr);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductData(cat._id);
  }, []);

  if (loading) {
    return (
      <Box key={cat._id} sx={{ background: "#fff" }} p={2} my={1}>
        <Skeleton variant="text" width="200px" height={30} sx={{ mb: 2 }} />
        <Carousel slidesToShow={6} responsive={responsive}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ShimmerCard key={i} />
          ))}
        </Carousel>
      </Box>
    );
  }

  if (products.length === 0) return null;

  return (
    <Box key={cat._id} sx={{ background: "#fff" }} p={2} my={1}>
      <H4 fontSize={20} pb={1}>
        Best Sellers in {cat.title}
      </H4>

      {products.length <= 6 ? (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid key={product._id} item lg={2} md={4} xs={6}>
              <Link href={`/products/${product._id}`}>
                <Box
                  sx={{
                    overflow: "hidden",
                    transition: "all 500ms",
                    borderRadius: "4px",
                    "&:hover": {
                      boxShadow: "0 0 6px #c2c1c1",
                    },
                  }}
                >
                  <LazyImage
                    width={260}
                    height={260}
                    alt="banner"
                    src={product.base_url + product.image[0]}
                    sx={{
                      height: "260px",
                      objectFit: "cover",
                      aspectRatio: "1/1",
                    }}
                  />
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Carousel slidesToShow={6} responsive={responsive}>
          {products.map((product) => (
            <Link key={product._id} href={`/products/${product._id}`}>
              <Box
                sx={{
                  overflow: "hidden",
                  transition: "all 500ms",
                  borderRadius: "4px",
                  "&:hover": {
                    boxShadow: "0 0 6px #c2c1c1",
                  },
                }}
              >
                <LazyImage
                  width={260}
                  height={260}
                  alt="banner"
                  src={product.base_url + product.image[0]}
                  sx={{
                    height: "260px",
                    objectFit: "cover",
                    aspectRatio: "1/1",
                  }}
                />
              </Box>
            </Link>
          ))}
        </Carousel>
      )}
    </Box>
  );
};

const Section21 = () => {
  const { token } = useAuth();
  const [bestSellerCategories, setBestSellerCategories] = useState([]);

  const getBestSellerCategories = async () => {
    try {
      const res = await getAPIAuth("bestsellerCategory", token);
      if (res.status === 200) {
        setBestSellerCategories(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getBestSellerCategories();
  }, [token]);

  return (
    <>
      {bestSellerCategories?.length > 0 && (
        <SectionCreator seeMoreLink="#" pt={2} sx={{ background: "#e9e7e7" }}>
          {bestSellerCategories?.map((cat) => (
            <Slider key={cat._id} cat={cat} />
          ))}
        </SectionCreator>
      )}
    </>
  );
};

export default Section21;
