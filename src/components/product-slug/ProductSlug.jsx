"use client";
import React, { useCallback, useEffect, useState } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
import { H1, H2, H3, H4, H5, Paragraph } from "components/Typography";
import AdminChildCat from "./AdminChildCat";
import Link from "next/link";
import Product from "components/product/Product";
import ProductCategoryShimmer from "components/shimmer/ProductCategoryShimmer";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
import { FlexBetween, FlexBox } from "components/flex-box";
import { SectionCreator } from "components/section-header";
import CloseIcon from "@mui/icons-material/Close";

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Most Recent", value: "latest" },
  { label: "Price Low to High", value: "asc" },
  { label: "Price High to Low", value: "desc" },
];

const ProductSlug = ({
  slug,
  current,
  breadcrumbs = [],
  children = [],
  initialProducts,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  console.log({ initialProducts });

  // ✅ URL STATE (same as category page)
  const sortBy = searchParams.get("sortBy") || "relevance";
  const page = Number(searchParams.get("page") || 1);

  // ✅ INITIAL SSR DATA
  const [productList, setProductList] = useState(
    initialProducts?.products || []
  );
  const [totalPages, setTotalPages] = useState(
    initialProducts?.pagination?.totalPages || 1
  );
  const [imageBaseUrl, setImageBaseUrl] = useState(
    initialProducts?.base_url || ""
  );
  const [videoBaseUrl, setVideoBaseUrl] = useState(
    initialProducts?.video_base_url || ""
  );

  const [expanded, setExpanded] = useState(false);
  const visibleChildren = expanded ? children : children.slice(0, 6);

  const [productLoading, setProductLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ FETCH ONLY ON CHANGE (NOT INITIAL)
  const fetchProducts = async () => {
    try {
      setProductLoading(true);

      const res = await getAPIAuth(
        `getProductBySlug/${slug}?page=${page}&limit=64&sortBy=${sortBy}`
      );

      if (res.status === 200) {
        setProductList(res.data.products);
        setTotalPages(res?.data?.pagination?.totalPages || 1);
        setImageBaseUrl(res.data.base_url);
        setVideoBaseUrl(res.data.video_base_url);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setProductLoading(false);
    }
  };

  // 🔥 IMPORTANT: skip first render (SSR already has data)
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }
    fetchProducts();
  }, [page, sortBy]);

  // ✅ SORT HANDLER (URL DRIVEN)
  const handleChangeSortBy = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("sortBy", value);
    } else {
      params.delete("sortBy");
    }

    params.delete("page"); // reset page

    router.push(`${pathname}?${params.toString()}`);
  };

  // ✅ PAGINATION HANDLER
  const handlePageChange = (event, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", value.toString());

    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleDrawer = (val) => setOpen(val);

  return (
    <Container sx={{ bgcolor: "background.paper" }}>
      <Box sx={{ pt: 4, pb: 4 }}>

        {/* 🔥 Breadcrumb */}
        <Box sx={{ mb: 4 }}>
          <Grid container justifyContent="center">
            <Grid item xs={12}>
              {breadcrumbs.length > 1 && (
                <H5 textAlign="center" mb={1}>
                  {breadcrumbs.map((cat, i) =>
                    i === breadcrumbs.length - 1 ? (
                      <span key={cat._id}>{cat.title}</span>
                    ) : (
                      <React.Fragment key={cat._id}>
                        <Link
                          href={`/${cat.fullSlug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <span style={{ cursor: "pointer" }}>
                            {cat.title}
                          </span>
                        </Link>
                        <span> / </span>
                      </React.Fragment>
                    )
                  )}
                </H5>
              )}

              <H2 textAlign="center">
                {current?.title}
              </H2>
            </Grid>
          </Grid>
        </Box>

        {/* 🔥 CHILD CATEGORIES (SSR ONLY) */}
        {children.length > 0 && page === 1 && (
          <Box sx={{ mb: 4, px: { xs: 1, sm: 2, md: 8, lg: 8 }, }}>
            <Grid
              container
              spacing={2}
              sx={{
                width: "100%",
                margin: 0,
                display: 'flex', justifyContent: 'center'
              }}
            >
              {visibleChildren.map((item) => (
                <Grid
                  item
                  xs={6}
                  sm={4}
                  md={2}
                  key={item._id}
                  sx={{
                    minWidth: 0,
                  }}
                >
                  <AdminChildCat cat={item} />
                </Grid>
              ))}
            </Grid>

            {children.length > 6 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setExpanded((prev) => !prev)}
                  sx={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: 30,
                    borderColor: "transparent",
                    padding: "10px 24px",
                    fontWeight: 500,
                    fontSize: 16,
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                      borderColor: "transparent",
                    },
                  }}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* 🔥 SORT */}
        <Box mb={3}>
          <FlexBetween>
            <Button onClick={() => toggleDrawer(true)}
              variant="text"
              sx={{
                '&:hover': {
                  boxShadow: '0 0 3px #000'
                },
                background: '#fff',
                border: '1px solid',
                borderColor: '#ccc',
                borderRadius: '30px',
                padding: { xs: '12px', sm: '12px 16px' },
                transition: 'all 500ms',
              }}
            >
              <Typography component="div" display="flex" alignItems="center">
                <svg
                  height="20px"
                  width="20px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15 9a3 3 0 0 0 2.599-1.5H21v-2h-3.041a3 3 0 0 0-5.918 0H3v2h9.401A2.999 2.999 0 0 0 15 9Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-6 8a3.001 3.001 0 0 0 2.83-2H21v-2h-9.17a3.001 3.001 0 0 0-5.66 0H3v2h3.17A3.001 3.001 0 0 0 9 15Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm6 8a3.001 3.001 0 0 0 2.83-2H21v-2h-3.17a3.001 3.001 0 0 0-5.66 0H3v2h9.17A3.001 3.001 0 0 0 15 21Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  ></path>
                </svg>
                <Typography component="span" sx={{ marginLeft: '5px', display: { xs: 'none', sm: 'block' } }}>
                  All Filters
                </Typography>
              </Typography>
            </Button>
            <FlexBox alignItems="center" gap={1}>
              <Paragraph>Sort by:</Paragraph>
              <TextField
                select
                size="small"
                value={sortBy}
                onChange={(e) => handleChangeSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </FlexBox>
          </FlexBetween>
        </Box>

        {/* 🔥 PRODUCTS */}
        {productLoading ? (
          <Grid container spacing={2}>
            {[...Array(12)].map((_, i) => (
              <Grid key={i} item xs={6} sm={4} md={3}>
                <ProductCardShimmer />
              </Grid>
            ))}
          </Grid>
        ) : productList?.length > 0 ? (
          <Grid container spacing={2}>
            {productList.map((product) => (
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
          <Box textAlign="center" py={8}>
            Products Not Found
          </Box>
        )}

        {/* 🔥 PAGINATION */}
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
      </Box>

      {/* 🔥 FILTER DRAWER (unchanged) */}
      <Drawer open={open} onClose={() => toggleDrawer(false)}>
        <Box sx={{ width: { xs: '90vw', sm: '500px' }, position: "relative" }} role="presentation">
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
                <Button sx={{ borderRadius: "30px", transition: "all 500ms" }}>
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
                <Button sx={{ borderRadius: "30px", transition: "all 500ms" }}>
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
                <Button sx={{ borderRadius: "30px", transition: "all 500ms" }}>
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