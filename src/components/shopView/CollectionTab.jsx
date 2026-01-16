"use client";
import Link from "next/link";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TabPanel from "@mui/lab/TabPanel";
import { FlexBox } from "components/flex-box";
import AddIcon from "@mui/icons-material/Add";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";

import {
  Checkbox,
  CircularProgress,
  IconButton,
  InputBase,
  MenuItem,
  TextField,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import FavoriteIcon from "@mui/icons-material/Favorite";
import useAuth from "hooks/useAuth";
import { getAPI, getAPIAuth, postAPI } from "utils/__api__/ApiServies";
import useCart from "hooks/useCart";
import useMyProvider from "hooks/useMyProvider";
import { useCallback, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import Product from "components/product/Product";
import ReportShop from "./ReportShop";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";

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

const CollectionTab = ({
  wishListProducts,
  getWishListProducts,
  vendor_id,
  vendorDetail,
  vendorCategories,
  handleClickPopup,
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const store_id = params.get("store_id");
  let queryPage = params.get("page");
  queryPage = queryPage ? parseInt(queryPage) : "";
  const { usercredentials } = useMyProvider();
  const { dispatch } = useCart();
  const { token } = useAuth();
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(store_id || "all");
  const [storeProductLoading, setStoreProductLoading] = useState(true);
  const [storeProducts, setStoreProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);
  const [productbaseUrl, setProductBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  console.log({ search, sortBy });

  const handleChangeSortBy = useCallback((v) => setSortBy(v), []);

  console.log({ storeProducts });
  console.log({ stores });
  const toggleWishList = async (id) => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await getAPIAuth(`user/add-delete-wishlist/${id}`, token);
      if (res.status === 200) {
        getWishListProducts();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addToCartHandler = (product) => {
    if (!token) {
      dispatch({
        type: "CHANGE_CART_AMOUNT",
        payload: {
          vendor_id: product?.vendor_id?._id,
          vendor_name: product?.vendor_id?.name,
          shop_icon: `${product?.vendor_details?.vendor_shop_icon_url}${product?.vendor_details?.shop_icon}`,
          shop_name: product?.vendor_details?.shop_name,
          slug: product?.vendor_details?.slug,
          products: [
            {
              product_id: product?._id,
              qty: 1,
              stock: +product?.qty,
              product_name: product?.product_title,
              sale_price: product?.sale_price
                ? product?.sale_price
                : product?.price,
              firstImage: productbaseUrl + product.image[0],
            },
          ],
        },
      });
    }
  };
  const getStoreName = async () => {
    try {
      const res = await getAPI(`get-store-by-vendor-id/${vendor_id}`);
      if (res.status === 200) {
        setStores(res?.data?.store);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getStoreName();
  }, []);

  const getStoreProducts = async (search) => {
    try {
      const payload = {
        vendor_id: vendor_id,
        store_id: selectedStoreId,
        page: page,
        limit: 40,
        sort_by: sortBy,
        search: search,
      };
      setStoreProductLoading(true);
      const res = await postAPI(`get-product-by-vendor-id`, payload);
      if (res.status === 200) {
        setStoreProductLoading(false);
        setStoreProducts(res?.data?.data);
        setProductBaseUrl(res?.data?.baseUrl);
        setVideoBaseUrl(res?.data?.video_base_url);
        setTotalPages(res?.data?.totalPages);
      }
    } catch (error) {
      setStoreProductLoading(false);
      console.log(error);
    } finally {
      setStoreProductLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStoreId) {
      getStoreProducts(search);
    }
  }, [selectedStoreId, page, search, sortBy]);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(
      `${window.location.pathname}?${currentParams.toString()}#collection`
    );
  };

  return (
    <>
      <Box
        mt={3}
        mb={3}
        sx={{
          display: "flex",
          flexDirection: { xs: "row", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: { lg: "300px", md: "250px", xs: "100%" },
            background: "#e5e5e5",
            boxShadow: "0 0 3px #a9a9a9",
            borderRadius: "30px",
            px: 2,
            py: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <InputBase
            placeholder="Search all orders..."
            inputProps={{ "aria-label": "search" }}
            sx={{ flex: 1 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconButton size="small">
            <SearchIcon />
          </IconButton>
        </Box>
        <Box sx={{ minWidth: "150px" }}>
          <FlexBox alignItems="center" gap={1}>
            <Typography
              color="grey.600"
              sx={{
                whiteSpace: "nowrap",
              }}
            >
              Sort by:
            </Typography>
            <TextField
              select
              size="small"
              value={sortBy}
              variant="outlined"
              onChange={(e) => handleChangeSortBy(e.target.value)}
              sx={{
                minWidth: 120,
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                ".MuiSelect-select": { pl: 0 },
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
      </Box>
      <Grid container spacing={3}>
        <Grid item lg={2.5} md={3.5} xs={12}>
          <Box sx={{ pr: { lg: 2, md: 2, xs: 0 } }}>
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
              <Select
                value={selectedStoreId}
                onChange={(e) => {
                  const value = e.target.value;
                  const currentParams = new URLSearchParams(
                    window.location.search
                  );
                  currentParams.set("store_id", value);
                  router.push(
                    `${window.location.pathname}?${currentParams.toString()}#collection`
                  );
                  setSelectedStoreId(value);
                }}
                fullWidth
                sx={{
                  borderRadius: "30px",
                  height: "40px",
                  bgcolor: "#fff",
                  border: "1px solid #ccc",
                  "& fieldset": { border: "none" }, // Remove default border
                }}
                displayEmpty
              >
                <MenuItem value="all">All ({stores?.length ?? 0})</MenuItem>
                {stores?.map((store) => (
                  <MenuItem key={store._id} value={store._id}>
                    {store?.store_name?.charAt(0)?.toUpperCase() +
                      store?.store_name?.slice(1)?.toLowerCase()}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <List
              sx={{
                borderRight: { md: "1px solid #d6d6d6", xs: "none" },
                display: {
                  xs: "none", // hide on small screens
                  md: "block", // show on desktop and larger
                },
              }}
            >
              <ListItem sx={{ px: 0, mb: 2 }}>
                <Typography fontWeight={600} fontSize={16}>
                  All Product
                </Typography>
              </ListItem>

              <ListItem
                sx={{ px: 0, cursor: "pointer" }}
                onClick={() => {
                  const currentParams = new URLSearchParams(
                    window.location.search
                  );
                  currentParams.set("store_id", "all");
                  currentParams.set("page", 1);

                  router.push(
                    `${window.location.pathname}?${currentParams.toString()}#collection`
                  );
                  setSelectedStoreId("all");
                  setPage(1);
                }}
              >
                <Typography
                  fontWeight={selectedStoreId === "all" ? "bold" : "normal"}
                >
                  All
                </Typography>
              </ListItem>

              {stores?.map((store) => (
                <ListItem
                  key={store._id}
                  sx={{ px: 0, cursor: "pointer" }}
                  onClick={() => {
                    const currentParams = new URLSearchParams(
                      window.location.search
                    );
                    currentParams.set("store_id", store._id);
                    currentParams.set("page", 1);
                    router.push(
                      `${window.location.pathname}?${currentParams.toString()}#collection`
                    );
                    setSelectedStoreId(store._id);
                    setPage(1);
                  }}
                >
                  <Typography
                    fontWeight={
                      selectedStoreId === store._id ? "bold" : "normal"
                    }
                  >
                    {store?.store_name?.charAt(0)?.toUpperCase() +
                      store?.store_name?.slice(1)?.toLowerCase()}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleClickPopup}
              startIcon={<MailOutlineIcon />}
              sx={{
                mt: 2,
                borderRadius: "4px",
                textTransform: "none",
                display: {
                  xs: "none", // hide on mobile
                  md: "flex", // show on desktop
                },
              }}
            >
              Contact shop owner
            </Button>

            <Typography mt={2} sx={{ display: { xs: "none", md: "flex" } }}>
              {vendorCategories?.sale_count} Sales
            </Typography>
            <Typography mt={1} sx={{ display: { xs: "none", md: "flex" } }}>
              <Link
                href="#"
                style={{ textDecoration: "underline", color: "#000" }}
              >
                {vendorCategories?.favourite_count} Admires
              </Link>
            </Typography>

            <Box mt={2} sx={{ display: { xs: "none", md: "flex" } }}>
              <ReportShop shop_id={vendorDetail?._id} />
            </Box>
          </Box>
        </Grid>
        <Grid item lg={9.5} md={8.5} xs={12}>
          <Grid container spacing={3}>
            {storeProductLoading ? (
              <>
                {[...Array(40)].map((_, index) => (
                  <Grid key={index} item xs={6} md={4} lg={3}>
                    <ProductCardShimmer />
                  </Grid>
                ))}
              </>
            ) : storeProducts?.length > 0 ? (
              storeProducts.map((product) => (
                <Grid item key={product._id} lg={3} md={4} xs={6}>
                  <Product
                    product={product}
                    imageBaseUrl={productbaseUrl}
                    videoBaseUrl={videoBaseUrl}
                  />
                </Grid>
              ))
            ) : (
              <Box sx={{ py: 6, textAlign: "center", width: "100%" }}>
                <Typography variant="h6" color="textSecondary">
                  No products found.
                </Typography>
              </Box>
            )}
          </Grid>
          {storeProducts?.length > 0 && (
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
        </Grid>
      </Grid>
    </>
  );
};

export default CollectionTab;
