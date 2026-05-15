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
import Drawer from "@mui/material/Drawer";
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
import MenuIcon from "@mui/icons-material/Menu";
import { getAPIAuth, postAPI } from "utils/__api__/ApiServies";
import { useSearchParams } from "next/navigation";
const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [tags,setTags] = useState([]);
  const [selectedTag,setSelectedTag] = useState("");
  const [openTags, setOpenTags] = useState(false);

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
  sx={{
    display: "flex",
    flexDirection: {
      xs: "column",
      md: "row",
    },
    alignItems: {
      xs: "flex-start",
      md: "center",
    },
    justifyContent: "space-between",
    gap: 2,
    pb: 4,
    borderBottom: "1px solid #e0e0e0",
  }}
>

            <Box>
              <Typography
  variant="h2"
  sx={{
    fontWeight: 500,
    fontSize: {
      xs: "24px",
      md: "40px",
    },
    whiteSpace: {
  xs: "normal",
  md: "nowrap",
},
    lineHeight: 1.1,
  }}
>
  Agukart Journal
</Typography>
              <Typography
  sx={{
    fontSize: {
      xs: "14px",
      md: "16px",
    },
    fontWeight: 500,
    lineHeight: 1.5,
    color: "#555",
    mt: 1,
    maxWidth: {
      xs: "100%",
      md: "500px",
    },
  }}
>
  Explore ideas and inspiration for creative living
</Typography>
            </Box>

            <Box
  sx={{
    position: "relative",
    width: {
      xs: "100%",
      md: "280px",
    },
    display: "flex",
    alignItems: "center",
    gap: 1,
    mt: {
      xs: 1,
      md: 0,
    },
  }}
>
  {/* Mobile Menu Icon */}
  <Box
  onClick={() => setOpenTags(true)}
  sx={{
    
    display: {
      xs: "flex",
      md: "none",
    },
    cursor: "pointer",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
      borderRadius: "50%",
      background: "#f5f5f5",
      border: "1px solid #ddd",
      flexShrink: 0,
    }}
  >
    <MenuIcon sx={{ color: "#000", fontSize: "22px" }} />
  </Box>

  {/* Search Bar */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      width: "100%",
      boxShadow: "inset 1px 1px 4px #0e0e0e3d",
      background: "#fff",
      borderRadius: "99999px",
    }}
  >
    <TextField
      onChange={(e) => setSearch(e.target.value)}
      value={search}
      placeholder="Search By Title"
      sx={{
        width: "100%",
        border: "none",
        boxShadow: "none",
        padding: {
          xs: "6px 10px",
          md: "9px 12px",
        },
        "& fieldset": {
  border: "none",
},
"& .MuiInputBase-input": {
  padding: "12px 14px",
},
      }}
    />

    <IconButton
      onClick={searchBlogs}
      type="button"
      aria-label="search"
      sx={{
        borderRadius: "0 24px 24px 0",
        padding: "8px 13px",
        height: "100%",
minHeight: "48px",
        transition: "all 500ms ease",
        "&:hover": {
          background: "#000",
          color: "#fff",
          "& .MuiSvgIcon-root": {
            transition: "all 500ms ease",
            color: "#fff",
          },
        },
      }}
    >
      <SearchIcon
        sx={{ color: "#000", transition: "all 500ms ease" }}
      />
    </IconButton>
  </Box>
</Box>
          </Box>
          <Box
  sx={{
    position: "relative",
  }}
>
  <Box
    sx={{
      position: {
        xs: "absolute",
        md: "static",
      },

      top: {
        xs: "60px",
        md: "0px",
      },

      left: 0,

      width: {
        xs: "220px",
        md: "100%",
      },

      zIndex: 999,

      display: {
        xs: openTags ? "flex" : "none",
        md: "flex",
      },

      flexDirection: {
        xs: "column",
        md: "row",
      },

      background: {
        xs: "#fff",
        md: "transparent",
      },

      padding: {
        xs: "14px",
        md: "0px",
      },

      borderRadius: "12px",

      boxShadow: {
        xs: "0 8px 24px rgba(0,0,0,0.12)",
        md: "none",
      },

      flexWrap: "wrap",
      gap: 1,
    }}
  >
    {tags?.map((item) => (
      <Box
        key={item.slug}
        onClick={() => setSelectedTag(item._id)}
        sx={{
          marginRight: "14px",
          color: "#000",
          textDecoration: "underline",
          fontSize: {
            lg: "14px",
            md: "14px",
            xs: "12px",
          },
          cursor: "pointer",
          display: "inline-block",
        }}
      >
        {item.title}
      </Box>
    ))}
  </Box>
</Box>
        <Box
  sx={{
    textAlign: "center",
    pt: {
      xs: 2,
      md: 5,
    },
  }}
>
           <Typography fontSize={13}>All articles tagged:</Typography>
           <Typography variant="h3" fontWeight={400} >Style</Typography>
        </Box>
        </Grid>
        <Drawer
  anchor="left"
  open={openTags}
  onClose={() => setOpenTags(false)}
  PaperProps={{
    sx: {
      width: "260px",
      padding: "20px",
      borderTopRightRadius: "18px",
      borderBottomRightRadius: "18px",
    },
  }}
>
  <Typography
    sx={{
      fontSize: "20px",
      fontWeight: 600,
      mb: 3,
    }}
  >
    Categories
  </Typography>

  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    {tags?.map((item) => (
      <Box
        key={item.slug}
        onClick={() => {
          setSelectedTag(item._id);
          setOpenTags(false);
        }}
        sx={{
          padding: "10px 14px",
          borderRadius: "10px",
          background:
            selectedTag === item._id
              ? "#000"
              : "#f5f5f5",

          color:
            selectedTag === item._id
              ? "#fff"
              : "#000",

          cursor: "pointer",
          transition: "0.3s",
          fontSize: "14px",
          fontWeight: 500,

          "&:hover": {
            background: "#000",
            color: "#fff",
          },
        }}
      >
        {item.title}
      </Box>
    ))}
  </Box>
</Drawer>

<Box
  sx={{
    display: {
      xs: "none",
      md: "flex",
    },
    flexWrap: "wrap",
    gap: 1,
    mt: 2,
  }}
>
</Box>
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
