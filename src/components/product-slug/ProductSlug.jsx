"use client";
import React, { useCallback, useEffect, useState } from "react";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Typography,
  Box,
  Grid,
  Container,
  TextField,
  MenuItem,
  Drawer,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Select,
  Pagination,
} from "@mui/material";
import { H1, H4, H5, Paragraph } from "components/Typography";
import ProductCategories1 from "components/product-cards/product-categories-1";
import AdminChildCat from "./AdminChildCat";
import Link from "next/link";
import Product from "components/product/Product";
import ProductCategoryShimmer from "components/shimmer/ProductCategoryShimmer";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
import { FlexBetween, FlexBox } from "components/flex-box";
import { SectionCreator } from "components/section-header";
import CloseIcon from "@mui/icons-material/Close";

const SORT_OPTIONS = [
  {
    label: "Relevance",
    value: "relevance",
  },
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Price Low to High",
    value: "asc",
  },
  {
    label: "Price High to Low",
    value: "desc",
  },
];

const ProductSlug = () => {
  const router = useRouter();
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [productLoading, setProductLoading] = useState(true);
  const params = useSearchParams();
  const slug = params.get("slug");
  const id = params.get("id");
  const title = params.get("title");
  let queryPage = params.get("page");
  queryPage = queryPage ? parseInt(queryPage) : "";
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);
  const [childrenCategory, setChildrenCategory] = useState([]);

  const [childCategories, setChildCatgories] = useState([]);

  const handleChangeSortBy = useCallback((v) => setSortBy(v), []);

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };

  const getProudctBySlug = async () => {
    try {
      setProductLoading(true);
      const res = await getAPIAuth(`getProductBySlug/${slug}?page=${page}&limit=64&sortBy=${sortBy}`);
      if (res.status === 200) {
        setImageBaseUrl(res.data.base_url);
        setVideoBaseUrl(res.data.video_base_url);
        setProductList(res.data.products);
        setTotalPages(res?.data?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setProductLoading(false);
    }
  };

  const getCategoryBySlug = async () => {
    try {
      setLoading(true);
      const res = await postAPIAuth("getAdminSubcategory", {
        id: id,
      });

      if (res.status === 200) {
        setChildrenCategory(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getChildCategories = async () => {
    try {
      const res = await getAPIAuth(`get-admin-category-by-slug/${slug}`);
      if (res.status === 200) {
        setChildCatgories(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getProudctBySlug();
  }, [slug, page, sortBy])

  useEffect(() => {
    getCategoryBySlug();
    getChildCategories();
  }, [slug, title, id]);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(`${window.location.pathname}?${currentParams.toString()}`);
  };

  console.log(childrenCategory);
  return (
    <>
      <div className="bg-white pb-4">
        <Container sx={{ px: 0, pt: 4, pb: 4 }}>
          <Container maxWidth="xl" sx={{ px: 0 }}>
            <Box>
              <Grid container justifyContent={"center"} spacing={3} sx={{ mb: 2 }}>
                <Grid item lg={12} sm={12} xs={12} >
                  {childCategories.length > 1 && (
                    <H5
                      sx={{ textAlign: "center", marginTop: "56px", }}
                      lineHeight={1}
                      mb={1}
                    >
                      {childCategories.map((cat, i) => {
                        if (childCategories.length - 1 === i)
                          return <span>{cat.title}</span>;
                        return (
                          <>
                            <Link
                              href={`/product?slug=${cat.slug}&title=${cat.title}&_id=${cat._id}`}
                              passHref
                            >
                              <span style={{ cursor: "pointer" }}>
                                {cat.title}
                              </span>
                            </Link>
                            <span>/</span>
                          </>
                        );
                      })}
                    </H5>
                  )}

                  <H4
                    style={{
                      textTransform: "capitalize",
                    }}
                    sx={{ textAlign: "center", marginTop: "20px" }}
                    fontSize={30}
                    color={"#000"}
                  >
                    {title}
                  </H4>
                </Grid>
                {loading ? (
                  <Grid container spacing={3} >
                    {[...Array(6)].map((_, index) => (
                      <ProductCategoryShimmer key={index} />
                    ))}

                  </Grid>
                ) : (
                  <>
                    {childrenCategory.length > 0 ? (
                      childrenCategory?.map((item) => (
                        <Grid item key={item._id} >
                          <AdminChildCat cat={item} />
                        </Grid>
                      ))
                    ) : (
                      <Box
                        sx={{
                          height: "30vh",
                          alignItems: "center",
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                          gap: "10px",
                        }}
                      >
                        <Typography variant="h6">No Data Found</Typography>
                      </Box>
                    )}
                  </>
                )}
              </Grid>
            </Box>


            {/* Sort + Filter Row */}
            <FlexBetween flexWrap="wrap" alignItems="center" gap={2} mb={3}>
              <Box flex="1 1 0">
                {/* <Button
                    onClick={() => toggleDrawer(true)}
                    variant="text"
                    sx={{
                      background: "#fff",
                      border: "1px solid gray",
                      borderRadius: "30px",
                      padding: "4px 16px",
                      transition: "all 500ms",
                      "&:hover": {
                        boxShadow: "0 0 3px #000",
                      },
                    }}
                  >
                    <Typography component="div" display="flex" alignItems="center">
                      <svg
                        height="20px"
                        width="20px"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15 9a3 3 0 0 0 2.599-1.5H21v-2h-3.041a3 3 0 0 0-5.918 0H3v2h9.401A2.999 2.999 0 0 0 15 9Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-6 8a3.001 3.001 0 0 0 2.83-2H21v-2h-9.17a3.001 3.001 0 0 0-5.66 0H3v2h3.17A3.001 3.001 0 0 0 9 15Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm6 8a3.001 3.001 0 0 0 2.83-2H21v-2h-3.17a3.001 3.001 0 0 0-5.66 0H3v2h9.17A3.001 3.001 0 0 0 15 21Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                        />
                      </svg>
                      <Typography component="span" sx={{ marginLeft: "5px" }}>
                        All Filter
                      </Typography>
                    </Typography>
                  </Button> */}
              </Box>
              <Box sx={{ px: 2 }}>
                <FlexBox
                  alignItems="center"
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: "30px",
                    px: 2,
                    py: 0.5,
                    transition: "0.3s",
                    "&:hover": {
                      boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                    },
                  }}
                  gap={1}
                >
                  <Paragraph color="grey.600">Sort by:</Paragraph>
                  <TextField
                    select
                    size="small"
                    value={sortBy}
                    variant="outlined"
                    onChange={(e) => handleChangeSortBy(e.target.value)}
                    sx={{
                      minWidth: 120,
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "& .MuiSelect-select": { pl: 0 },
                    }}
                  >
                    {SORT_OPTIONS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </FlexBox>
              </Box>
            </FlexBetween>
            {productLoading ? (
              <Container >
                <Grid container spacing={4}>
                  {[...Array(64)].map((_, index) => (
                    <Grid key={index} item xs={6} md={4} lg={3}>
                      <ProductCardShimmer />
                    </Grid>
                  ))}
                </Grid>
              </Container>
            ) : (
              <Container sx={{ px: 0 }} >
                <Grid container width={"calc(100% + -32px)"} ml={0} spacing={4}>
                  {productList?.length > 0 ? (
                    productList?.map((product) => (
                      <Grid item lg={3} md={4} xs={6}>
                        <Product
                          key={product._id}
                          product={product}
                          imageBaseUrl={imageBaseUrl}
                          videoBaseUrl={videoBaseUrl}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        textAlign: "center",
                        fontSize: "20px",
                        textTransform: "uppercase",
                        fontWeight: 900,
                      }}
                    >
                      Products Not Found
                    </Box>
                  )}
                </Grid>
              </Container>
            )}
            {productList?.length > 0 && (
              <Box mt={4} display="flex" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  variant="outlined"
                  shape="rounded"
                />
              </Box>
            )}
          </Container>
        </Container>
        <Drawer open={open} onClose={() => toggleDrawer(false)}>
          <Box sx={{ width: 400, position: "relative" }} role="presentation">
            <Typography
              component="span"
              sx={{
                position: "absolute",
                top: "15px",
                right: "15px",
                cursor: "pointer",
              }}
            >
              <CloseIcon onClick={() => toggleDrawer(false)} />
            </Typography>
            <SectionCreator p={3}>
              <H1
                fontWeight={500}
                mb={4}
                sx={{ borderBottom: "1px solid #eaeaea" }}
              >
                Filter
              </H1>
              <Box mb={2}>
                <FormControl>
                  <FormLabel
                    component="legend"
                    sx={{ fontSize: "14px", paddingBottom: "5px" }}
                  >
                    Special offers
                  </FormLabel>
                  <FormGroup
                    sx={{
                      ".MuiCheckbox-root": {
                        padding: "2px 9px",
                        background: "none",
                      },
                    }}
                  >
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="FREE delivery"
                    />
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="On sale"
                    />
                  </FormGroup>
                </FormControl>
              </Box>

              <Box mb={2}>
                <FormControl>
                  <FormLabel
                    id="demo-radio-buttons-group-label"
                    sx={{ fontSize: "14px", paddingBottom: "5px" }}
                  >
                    Shop Location
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="Anywhere"
                    name="radio-buttons-group"
                    sx={{
                      ".MuiRadio-root": {
                        padding: "2px 9px",
                        background: "none",
                      },
                    }}
                  >
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Anywhere"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="India"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Custom"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Box mb={2}>
                <TextField
                  fullWidth
                  name="Your_ecomm_password"
                  placeholder="Enter location"
                />
              </Box>
              <Box mb={2}>
                <FormControl>
                  <FormLabel
                    component="legend"
                    sx={{ fontSize: "14px", paddingBottom: "5px" }}
                  >
                    Special offers
                  </FormLabel>
                  <FormGroup
                    sx={{
                      ".MuiCheckbox-root": {
                        padding: "2px 9px",
                        background: "none",
                      },
                    }}
                  >
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="FREE delivery"
                    />
                    <FormControlLabel
                      control={<Checkbox defaultChecked />}
                      label="On sale"
                    />
                  </FormGroup>
                </FormControl>
                <Typography component="div" pt={1}>
                  <Button
                    sx={{ borderRadius: "30px", transition: "all 500ms" }}
                  >
                    + Show more
                  </Button>
                </Typography>
              </Box>

              <Box mb={2}>
                <FormControl>
                  <FormLabel
                    id="demo-radio-buttons-group-label"
                    sx={{ fontSize: "14px", paddingBottom: "5px" }}
                  >
                    Shop Location
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="Anywhere"
                    name="radio-buttons-group"
                    sx={{
                      ".MuiRadio-root": {
                        padding: "2px 9px",
                        background: "none",
                      },
                    }}
                  >
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Anywhere"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="India"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Custom"
                    />
                  </RadioGroup>
                </FormControl>
                <Typography component="div" pt={1}>
                  <Button
                    sx={{ borderRadius: "30px", transition: "all 500ms" }}
                  >
                    + Show more
                  </Button>
                </Typography>
              </Box>
              <Box mb={2}>
                <FormControl>
                  <FormLabel
                    id="demo-radio-buttons-group-label"
                    sx={{ fontSize: "14px", paddingBottom: "5px" }}
                  >
                    Price
                  </FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="Anywhere"
                    name="radio-buttons-group"
                    sx={{
                      ".MuiRadio-root": {
                        padding: "2px 9px",
                        background: "none",
                      },
                    }}
                  >
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Anywhere"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Any price"
                    />
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Custom"
                    />
                  </RadioGroup>
                </FormControl>
                <Box mt={1} sx={{ display: "flex", alignItems: "center" }}>
                  <TextField fullWidth placeholder="Low" />
                  <Typography component="span" mx={2}>
                    to
                  </Typography>
                  <TextField fullWidth placeholder="High" />
                </Box>
                <Typography component="div" pt={1}>
                  <Button
                    sx={{ borderRadius: "30px", transition: "all 500ms" }}
                  >
                    + Show more
                  </Button>
                </Typography>
              </Box>
              <Box>
                <FormControl sx={{ width: "100%" }}>
                  <Select
                    sx={{
                      border: "none",
                      background: "#fff",
                      height: "50px",
                      boxShadow: "0 0 3px #000",
                      ".MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    }}
                  >
                    <MenuItem>Hello</MenuItem>;
                  </Select>
                </FormControl>
              </Box>
            </SectionCreator>
          </Box>
        </Drawer>
      </div>
    </>
  );
};

export default ProductSlug;
