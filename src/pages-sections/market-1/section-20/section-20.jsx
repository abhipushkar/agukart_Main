"use client";

import Link from "next/link";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Box, CardActionArea } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Carousel } from "components/carousel";
import { FlexBox } from "components/flex-box";
import { SectionCreator } from "components/section-header";
import useSettings from "hooks/useSettings";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { postAPI } from "utils/__api__/ApiServies";
import { H2 } from "components/Typography";

const section20 = () => {
  const { settings } = useSettings();
  const [featureBlog, setFeatureBlog] = useState([]);
  const [loading, setLoading] = useState(true);

  const responsive = [
    {
      breakpoint: 959,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 650,
      settings: {
        slidesToShow: 1,
      },
    },
  ];

  const getFeatureBlog = async () => {
    try {
      const res = await postAPI("get-blog", { type: "featured" });
      if (res?.status === 200) {
        setFeatureBlog(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeatureBlog();
  }, []);

  const router = useRouter();

  const ShimmerBlogCard = () => (
    <Card>
      <Skeleton variant="rectangular" height={300} />
      <CardContent>
        <Skeleton width="40%" height={20} />
        <Skeleton width="80%" height={30} sx={{ mt: 1 }} />
        <Skeleton width="90%" height={20} />
        <Skeleton width="60%" height={20} />
      </CardContent>
    </Card>
  );

  return (
    <SectionCreator>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <H2 fontSize={25} mb={1} sx={{ display: "flex", alignItems: "center" }}>
          Fresh from the blog <ArrowForwardIcon sx={{ marginLeft: "8px" }} />
        </H2>

        <Link href={"/blog"}>
          <FlexBox alignItems="center" color="grey.600">
            View All
            {settings.direction === "ltr" ? (
              <ArrowRight fontSize="small" color="inherit" />
            ) : (
              <ArrowLeft fontSize="small" color="inherit" />
            )}
          </FlexBox>
        </Link>
      </Box>

      {loading ? (
        <Carousel slidesToShow={3} responsive={responsive}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ShimmerBlogCard key={i} />
          ))}
        </Carousel>
      ) : featureBlog?.length <= 2 ? (
        <Grid container spacing={"20px"}>
          {featureBlog.map((blog) => (
            <Grid item xs={12} md={4} key={blog._id}>
              <Card>
                <CardActionArea
                  onClick={() =>
                    router.push(`blog/singleBlog/slug=${blog.slug}`)
                  }
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={blog.image}
                    alt=""
                  />
                  <CardContent>
                    <Typography gutterBottom fontSize={14}>
                      Shopping Guides
                    </Typography>
                    <Typography
                      gutterBottom
                      fontSize={18}
                      fontWeight="bold"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: "1",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {blog.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {blog.short_description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Carousel slidesToShow={3} responsive={responsive}>
          {featureBlog.map((blog) => (
            <Card key={blog._id}>
              <CardActionArea
                onClick={() =>
                  router.push(`blog/single-blog/slug=${blog.slug}`)
                }
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={blog.image}
                  alt=""
                />
                <CardContent>
                  <Typography gutterBottom fontSize={14}>
                    Shopping Guides
                  </Typography>
                  <Typography
                    gutterBottom
                    fontSize={18}
                    fontWeight="bold"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: "1",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {blog.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {blog.short_description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Carousel>
      )}
    </SectionCreator>
  );
};

export default section20;
