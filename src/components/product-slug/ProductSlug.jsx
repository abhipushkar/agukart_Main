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
    <Container sx={{ bgcolor: "background.paper" }}>
      {/* Main Content */}
      <Box sx={{ pt: 4, pb: 4 }}>
        {/* Breadcrumb and Title Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container justifyContent="center">
            <Grid item xs={12}>
              {childCategories.length > 1 && (
                <H5
                  sx={{
                    textAlign: "center",
                    mb: 1,
                    px: { xs: 2, sm: 0 }
                  }}
                  lineHeight={1}
                >
                  {childCategories.map((cat, i) => {
                    if (childCategories.length - 1 === i)
                      return <span>{cat.title}</span>;
                    return (
                      <React.Fragment key={cat._id}>
                        <Link
                          href={`/product?slug=${cat.slug}&title=${cat.title}&id=${cat._id}`}
                          passHref
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <span style={{ cursor: "pointer" }}>
                            {cat.title}
                          </span>
                        </Link>
                        <span>/</span>
                      </React.Fragment>
                    );
                  })}
                </H5>
              )}

              <H4
                sx={{
                  textAlign: "center",
                  textTransform: "capitalize",
                  fontSize: { xs: 24, sm: 30 },
                  color: "#000",
                  px: { xs: 2, sm: 0 }
                }}
              >
                {title}
              </H4>
            </Grid>
          </Grid>
        </Box>

        {/* Child Categories */}
        {loading ? (
          <Box sx={{ mb: 4, px: { xs: 2, sm: 0 } }}>
            <Grid container spacing={2} justifyContent="center">
              {[...Array(6)].map((_, index) => (
                <Grid item key={index}>
                  <ProductCategoryShimmer />
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          childrenCategory.length > 0 && (
            <Box sx={{ mb: 4, px: { xs: 2, sm: 0 } }}>
              <Grid container spacing={2} justifyContent="center">
                {childrenCategory?.map((item) => (
                  <Grid item key={item._id}>
                    <AdminChildCat cat={item} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )
        )}

        {/* Sort + Filter Row */}
        <Box sx={{
          mb: 3,
          px: { xs: 2, sm: 0 },
          mx: "auto"
        }}>
          <FlexBetween
            flexWrap="wrap"
            alignItems="center"
            gap={2}
          >
            <Box flex="1 1 0">
              {/* Filter button can be added here if needed */}
            </Box>
            <Box>
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
        </Box>

        {/* Products Grid */}
        <Box sx={{
          px: { xs: 2, sm: 0 },
          mx: "auto"
        }}>
          {productLoading ? (
            <Grid container spacing={2}>
              {[...Array(12)].map((_, index) => (
                <Grid key={index} item xs={6} sm={4} md={3}>
                  <ProductCardShimmer />
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              {productList?.length > 0 ? (
                <Grid container spacing={2}>
                  {productList?.map((product) => (
                    <Grid key={product._id} item xs={6} sm={4} md={3}>
                      <Product
                        product={product}
                        imageBaseUrl={imageBaseUrl}
                        videoBaseUrl={videoBaseUrl}
                      />
                    </Grid>
                  ))}
                </Grid>
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
                    py: 8,
                  }}
                >
                  Products Not Found
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Pagination */}
        {productList?.length > 0 && (
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
              px: { xs: 2, sm: 0 },
              maxWidth: "1400px",
              mx: "auto"
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
            />
          </Box>
        )}
      </Box>

      {/* Filter Drawer */}
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
    </Container>
  );
};

export default ProductSlug;
