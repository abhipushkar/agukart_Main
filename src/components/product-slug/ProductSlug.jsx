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
  { label: "Relevance", value: "relevance" },
  { label: "Newest", value: "newest" },
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

  // ✅ URL STATE (same as category page)
  const sortBy = searchParams.get("sort") || "relevance";
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
      params.set("sort", value);
    } else {
      params.delete("sort");
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

              <H4 textAlign="center">
                {current?.title}
              </H4>
            </Grid>
          </Grid>
        </Box>

        {/* 🔥 CHILD CATEGORIES (SSR ONLY) */}
        {children.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              {children.map((item) => (
                <Grid item key={item._id}>
                  <AdminChildCat cat={item} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* 🔥 SORT */}
        <Box mb={3}>
          <FlexBetween>
            <Box />
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
        <Box sx={{ width: 400, position: "relative" }}>
          <CloseIcon
            onClick={() => toggleDrawer(false)}
            style={{ position: "absolute", right: 10, top: 10, cursor: "pointer" }}
          />
          <SectionCreator p={3}>
            <H1>Filter</H1>
            {/* keep your existing filters */}
          </SectionCreator>
        </Box>
      </Drawer>
    </Container>
  );
};

export default ProductSlug;