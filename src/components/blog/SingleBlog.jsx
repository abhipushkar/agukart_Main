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
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

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
        <Grid container width={{ xs: "100%", md: "calc(100% + -32px)" }} ml={0} spacing={4}>
          <Grid item lg={12} xs={12} px={{xs: '0 !important', sm: 'inherit'}}>
            <Box textAlign={"center"}>
              <H1
                fontSize={{ xs: 28, sm: 35, md: 50 }}
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
                sx={{ flexWrap: "wrap", gap: "8px" }}
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
            width={{ xs: "100%", md: "calc(100% + -32px)" }}
            justifyContent={"center"}
            mt={3}
            ml={0}
            spacing={4}
          >
            <Grid item lg={8} xs={12} px={{xs: '0 !important', sm: 'inherit'}}>
              <Grid item lg={12} xs={12}>
                <Box sx={{
                  width: "100%", 
                  overflow: "hidden",
                  borderRadius: "4px"
                }}>
                  <img
                    src={blog?.image}
                    width={"100%"}
                    height={{ xs: "250px", sm: "350px", md: "450px", lg: "600px" }}
                    style={{ 
                      objectFit: "cover",
                      borderRadius: "4px",
                      display: "block"
                    }}
                    alt=""
                  />
                </Box>
              </Grid>
              <H4 color={"#000"} fontWeight={600} fontSize={20}>
                {blog?.author_name}
              </H4>
              <Typography mb={3}>
                {moment(blog?.updatedAt).format("D-MM-yyyy")}
              </Typography>
              <Typography mb={3} fontSize={16} color={"#000"}>
                {<HtmlRenderer html={blog?.description}/>}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {realtedBlogs.length > 0 && (
        <Container
          sx={{ margin: "30px 0", background: "#ffe0c3", padding: "50px 16px" }}
        >
          <Grid container width={{ xs: "100%", md: "calc(100% + -32px)" }} ml={0} spacing={4}>
            <Grid lg={12} item xs={12}>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 0 } }}
              >
                <Typography
                  component="div"
                  color={"#000"}
                  fontSize={16}
                  fontWeight={600}
                >
                  Recommended Posts
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
                <Grid key={blog._id} lg={4} md={6} xs={12} item>
                  <Card
                    sx={{
                      "&:hover": { boxShadow: "0px 1px 3px rgb(3 0 71 / 84%)" },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia sx={{ overflow: "hidden" }}>
                      <img
                        src={blog.image}
                        width={"100%"}
                        height={{ xs: "200px", sm: "250px" }}
                        style={{ 
                          objectFit: "cover",
                          display: "block",
                          width: "100%"
                        }}
                        alt=""
                      />
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography component="div" pb={1}>
                        {blog.tag_id.map((tag, i) => {
                          return (
                            <span key={tag._id || i}>
                              <Typography component="span">
                                {tag.title}
                              </Typography>
                              {!(blog.tag_id.length - 1 === i) && (
                                <Typography component="span"> | </Typography>
                              )}
                            </span>
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
        </Container>
      )}
    </>
  );
};

export default SingleBlog;
