"use client";
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { H1, H4, Small } from "components/Typography";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import List from "@mui/material/List";
import Link from "@mui/material/Link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
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
import { getAPIAuth, postAPI } from "utils/__api__/ApiServies";
import { useSearchParams } from "next/navigation";
const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [tags,setTags] = useState([]);
  const [selectedTag,setSelectedTag] = useState("");

  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const getBlogs = async () => {
    const payload = {
      type: "",
      offset: (page - 1) * 12,
      tag_id:selectedTag
    };

    const payload2 = {
      type: "",
      tag: slug,
      offset: (page - 1) * 12,
      tag_id:selectedTag
    };
    try {
      const res = await postAPI("get-blog", slug ? payload2 : payload);

      console.log(res, "this is res");
      if (res.status === 200) {
        setBlogs(res.data.data);
        let roundedNum = Math.ceil(res.data.count / 12);
        setTotalPages(roundedNum);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchBlogs = async () => {
    const payload = {
      type: "",
      search: search,
      offset: (page - 1) * 12,
    };
    const payload2 = {
      type: "",
      search: search,
      tag: slug,
      offset: (page - 1) * 12,
    };
    try {
      const res = await postAPI("get-blog", slug ? payload2 : payload);
      console.log(res, "this is res");
      if (res.status === 200) {
        let roundedNum = Math.ceil(res.data.count / 12);
        setTotalPages(roundedNum);
        setBlogs(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!search) {
      getBlogs();
    }
  }, [search, page,selectedTag]);

  console.log(blogs, "alll blogsssssss");

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  const getBlogsTags = async()=>{
    try {
      const res = await getAPIAuth(`get-blog-tags`);
      if (res.status === 200) {
        setTags(res.data.blogTags)
      }
    } catch (error) {
      console.log(error);
    } 
  }
  useEffect(() => {
    getBlogsTags();
  }, []);
  return (
    <Container sx={{ padding: "30px 16px" }}>
      <Grid container width={"calc(100% + -32px)"} ml={0} spacing={4}>
        <Grid item lg={12} xs={12}>
          <Box
            display={"flex"}
            alignItems={"center"}
            pb={4}
            sx={{
              borderBottom:"1px solid #e0e0e0",
              justifyContent: { lg: "space-between", md: "space-between", xs: "center" },
            }}
          >

            <Typography component="div">
              <Typography variant="h2" fontWeight={400}>
                Agukart Journal
              </Typography>
              <Typography fontSize={16} fontWeight={600}>
                 Explore ideas and inspiration for creative living
              </Typography>
            </Typography>

            <Typography
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
              position={"relative"}
              component="div"
              sx={{
                width: "100%",
                boxShadow: "inset 1px 1px 4px #0e0e0e3d",
                background: "#fff",
                maxWidth: "280px",
                height: "fit-content",
                borderRadius: "99999px",
              }}
            >
              <TextField
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                placeholder="Search By Title"
                sx={{
                  border: "none",
                  boxShadow: "none",
                  padding: "9px 12px",
                  "& fieldset": {
                    border: "none",
                  },
                }}
              />
              <IconButton
                onClick={searchBlogs}
                type="button"
                aria-label="search"
                sx={{
                  borderRadius: "0 24px 24px 0",
                  padding: "8 13px",
                  height: "55px",
                  transition: "all 500ms ease",
                  "&:hover": {
                    background: "#000",
                    color: "#fff",
                    "& .MuiSvgIcon-root": {
                      transition: "all 500ms ease",
                      color: "#fff", // Change icon color on hover
                    },
                  },
                }}
              >
                <SearchIcon
                  sx={{ color: "#000", transition: "all 500ms ease" }}
                />
              </IconButton>
            </Typography>
          </Box>
          <Box pt={2}>
           <Typography component="div" display="flex">
            {
              tags?.map((item) => (
                <Box
                  key={item.slug}
                  onClick={() => setSelectedTag(item._id)}
                  sx={{
                    marginRight: '14px',
                    color: '#000',
                    textDecoration: 'underline',
                    fontSize: { lg: '14px', md: '14px', xs: '12px' },
                    cursor: 'pointer',
                    display: 'inline-block',
                  }}
                >
                  {item.title}
                </Box>
              ))
            }
           </Typography>
        </Box>
        <Box sx={{textAlign:'center'}} pt={5}>
           <Typography fontSize={13}>All articles tagged:</Typography>
           <Typography variant="h3" fontWeight={400} >Style</Typography>
        </Box>
        </Grid>
      </Grid>
      <Grid
        container
        width={"calc(100% + -32px)"}
        ml={0}
        py={5}
        spacing={4}
        alignItems={"center"}
      >
        {blogs.length === 0 ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h3">No blog Found</Typography>
          </Box>
        ) : (
          blogs.map((blog) => {
            return (
              <Grid lg={4} item xs={12}>
                <Card
                  sx={{
                    "&:hover": { boxShadow: "0px 1px 3px rgb(3 0 71 / 84%)" },
                  }}
                >
                  <CardMedia>
                    <img src={blog?.image} width={"100%"} alt="" />
                  </CardMedia>
                  <CardContent>
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
          })
        )}
      </Grid>

      <Box
        width="100%"
        display={"flex"}
        justifyContent={"center"}
        sx={{
          marginBottom: {
            lg: "0",
            md: "68px",
            xs: "68px",
          },
        }}
      >
        {blogs.length > 0 && (
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
            />
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default Blog;
