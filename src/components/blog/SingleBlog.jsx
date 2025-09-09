"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { H1, H4, Small } from "components/Typography";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { Height } from "@mui/icons-material";
import EastIcon from "@mui/icons-material/East";
import { usePathname } from "next/navigation";
import { getAPIAuth } from "utils/__api__/ApiServies";
import parse from "html-react-parser";
import moment from "moment";
import useAuth from "hooks/useAuth";
import Link from "next/link";

const SingleBlog = () => {
  const pathName = usePathname();
  const { token } = useAuth();
  const [blog, setBlog] = useState({});
  const [realtedBlogs, setRelatedBlogs] = useState([]);

  const slug = pathName.split("slug=");

  console.log(slug, "myslug");

  const getblogData = async () => {
    try {
      const res = await getAPIAuth(`get-blog-by-slug/${slug[1]}`);
      setBlog(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getRelatedBlogs = async () => {
    try {
      const res = await getAPIAuth(`get-recommended-blog/${slug[1]}`, token);
      console.log(res, "related blogs res");
      if (res.status === 200) {
        setRelatedBlogs(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getblogData();
    getRelatedBlogs();
  }, []);

  return (
    <>
      <Container sx={{ padding: "30px 16px" }}>
        <Grid container width={"calc(100% + -32px)"} ml={0} spacing={4}>
          <Grid item lg={12} xs={12}>
            <Box textAlign={"center"}>
              <H1
                fontSize={50}
                fontWeight={500}
                sx={{
                  textAlign: "center",
                  margin: "0 auto",
                  width: { lg: "60%", md: "60%", xs: "100%" },
                }}
              >
                {blog?.title}
              </H1>
              <Typography
                component="div"
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {blog?.tag_id?.length === 0
                  ? ""
                  : blog?.tag_id?.map((tag) => {
                      return (
                        <Typography
                          key={tag._id}
                          component="span"
                          mr={1}
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          px={2}
                          py={1}
                          sx={{ background: "#eaeaea", borderRadius: "30px" }}
                        >
                          <Link
                            href={`/blog?slug=${tag.slug}`}
                            fontSize={12}
                            color={"#000"}
                            sx={{ textDecoration: "none" }}
                          >
                            {tag.title}
                          </Link>
                        </Typography>
                      );
                    })}
              </Typography>
            </Box>
          </Grid>
          <Grid
            container
            width={"calc(100% + -32px)"}
            justifyContent={"center"}
            mt={3}
            ml={0}
            spacing={4}
          >
            <Grid item lg={8} xs={12}>
            <Grid item lg={12} xs={12}>
            <img
              src={blog?.image}
              width={"100%"}
              height={"600px"}
              style={{ objectFit: "cover",borderRadius:'4px' }}
              alt=""
            />
          </Grid>
              <H4 color={"#000"} fontWeight={600} fontSize={20}>
                {blog?.author_name}
              </H4>
              <Typography mb={3}>
                {moment(blog?.updatedAt).format("D-MM-yyyy")}
              </Typography>
              <Typography mb={3} fontSize={16} color={"#000"}>
                {parse(`${blog?.description}`)}
              </Typography>
              {/* <Typography mb={3} fontSize={16} color={"#000"}>
                Hosting isn't just about setting up a table and serving a meal.
                It's all about curating an experience that puts everyone at
                ease—even the host. Whether it's a lively gathering of friends
                or an intimate dinner with family, having people over is a
                heartwarming experience that brings love and laughter into our
                lives. And to help you excel at the art of hosting, we've
                gathered some playful yet practical tips and ideas from our
                wonderful colleagues at Etsy India. With the festive season
                right around the corner, we hope this guide helps you in having
                a wonderful time with your loved ones.
              </Typography> */}
              {/* <Box>
                <H4 color={"#000"} fontWeight={600} fontSize={26}>
                  1. Quick and easy snack trays
                </H4>
                <Box component="figure" my={3} sx={{ textAlign: "center" }}>
                  <img
                    src="https://i.etsystatic.com/inv/73f1ea/5310016542/inv_620x495.5310016542_ukkxc6qi.jpg?version=0"
                    width={"100%"}
                    height={"500px"}
                    style={{ objectFit: "cover", borderRadius: "6px" }}
                    alt=""
                  />
                </Box>
                <Typography mb={3} component="div" fontSize={18} color={"#000"}>
                  {" "}
                  <Typography component="span" fontSize={18} fontWeight={700}>
                    SHOP:
                  </Typography>{" "}
                  <Link href="#" color={"#000"}>
                    {" "}
                    Oval baking dish{" "}
                  </Link>{" "}
                  from Follow TheDunes, Rs. 4,383
                </Typography>
                <Typography mb={3} fontSize={16} color={"#000"}>
                  When asked for her favourite hosting tip, Vrishali’s mantra is
                  simple: snacks, snacks, and some more snacks. Cheese, hummus,
                  meats, breads, and fruits that are basically easy to eat and
                  go well with the drinks. And this sturdy yet stylish serving
                  board could be a practical addition to her party spread. It is
                  made with mango wood and the reversible design can be used
                  either side for cutting and serving.
                </Typography>
              </Box> */}
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {  realtedBlogs.length > 0 && <Container
        sx={{ margin: "30px 0", background: "#ffe0c3", padding: "50px 16px" }}
      >
        <Grid container width={"calc(100% + -32px)"} ml={0} spacing={4}>
          <Grid lg={12} item xs={12}>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography
                component="div"
                color={"#000"}
                fontSize={16}
                fontWeight={600}
              >
                {" "}
                {/* <Link
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  color={"#000"}
                  href="#"
                > */}
                Recommended Posts
                {/* </Link>{" "} */}
              </Typography>
              <Typography
                component="div"
                color="#000"
                fontSize={16}
                fontWeight={600}
              >
                <Link
                  sx={{
                    textDecoration: "none",
                    color: "#000",
                    display: "inline-flex",
                    alignItems: "center",
                    "&:hover .icon": {
                      transform: "translateX(4px)",
                    },
                  }}
                  href="/blog"
                >
                Read the Agukart Journal
                <EastIcon
                  className="icon"
                  sx={{
                    ml: 1,
                    transition: "transform 0.3s ease",
                  }}
                />
                </Link>
              </Typography>
            </Box>
          </Grid>

          {realtedBlogs.map((blog) => {
            return (
              <Grid  key={blog._id} lg={4} item xs={12}>
                <Card
                  sx={{
                    "&:hover": { boxShadow: "0px 1px 3px rgb(3 0 71 / 84%)" },
                  }}
                >
                  <CardMedia>
                    <img
                      src={blog.image}
                      width={"100%"}
                      alt=""
                    />
                  </CardMedia>
                  <CardContent>
                    {/* <Typography component="div" pb={1}>
                      <Typography component="span">Shopping Guides</Typography>
                      <Typography
                        component="span"
                        sx={{
                          "&::before": {
                            content: '" | "', // Note the double quotes within single quotes
                          },
                        }}
                      >
                        Style
                      </Typography>
                    </Typography> */}


<Typography component="div" pb={1}>
                      {blog.tag_id.map((tag, i) => {
                        return (
                          <>
                            <Typography component="span">
                              {tag.title}
                            </Typography>

                            {!(blog.tag_id.length - 1 === i) && (
                              <Typography component="span"> | </Typography>
                            )}

                            {/* <Typography
                              component="span"
                              // sx={{
                              //   "&::before": {
                              //     content: '" | "',
                              //   },
                              // }}
                            >
                              {tag.title}
                            </Typography> */}
                          </>
                        );
                      })}
                    </Typography>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        whiteSpace: "normal",
                        WebkitLineClamp: 1,
                      }}
                    >
                      <Link
                        href={`/blog/single-blog/slug=${blog.slug}`}
                        color="#000"
                        sx={{
                          textDecoration: "none",
                          "&:hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                       {blog.title}
                      </Link>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {blog.short_description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>}
    </>
  );
};

export default SingleBlog;
