"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { SectionCreator } from "components/section-header";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import CloseIcon from "@mui/icons-material/Close";

import Select from "@mui/material/Select";

// MUI ICON COMPONENTS

import Apps from "@mui/icons-material/Apps";
import ViewList from "@mui/icons-material/ViewList";
import FilterList from "@mui/icons-material/FilterList";
// Local CUSTOM COMPONENT

import productCategoriesFilterCard from "./productCategories-filter-card";
// GLOBAL CUSTOM COMPONENTS

import Sidenav from "components/side-nav";
import { H1, H2, H3, H4, H5, Paragraph } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import ProductsListView from "components/products-view/products-list-view";
// PRODUCT DATA

import productDatabase from "data/product-database";
import productCategories from "data/products-categories";
import ProductsCategoriesPage from "components/products-view/products-categories-page";
import useMyProvider from "hooks/useMyProvider";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import useAuth from "hooks/useAuth";
import { getAPI, getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { CircularProgress, Pagination, Skeleton } from "@mui/material";
import Product from "components/product/Product";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
// TYPE

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
const initialFilters = {
  rating: 0,
  color: [],
  brand: [],
  sales: [],
  price: [0, 300],
};
export default function ProductCategoriesSearchPageView() {
  const searchPrams = useSearchParams();
  const _id = searchPrams.get("_id");
  const title = searchPrams.get("title");
  let queryPage = searchPrams.get("page");
  queryPage = queryPage ? parseInt(queryPage) : "";

  const { slug } = useParams();
  const pathname = usePathname();

  const router = useRouter();
  const [view, setView] = useState("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [productIncreaseValue, SetProductIncreaseValue] = useState(6);
  const [isproductIncreaseValue, SetIsProductIncreaseValue] = useState(true);
  const [productList, setProductList] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    ...initialFilters,
  });
  const { token } = useAuth();
  const [subcategoryMenus, setSubCategoryMenus] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  console.log("asfhdsuifydsuisubcategoryMenus", subcategoryMenus);
  const [isLoading, setIsLoading] = useState(true);
  const parts = pathname.split("/");
  const data = parts[parts.length - 1];
  console.log("isLoadingisLoading", data);
  // const newPathname = pathname.replace('/products-categories', '/products');
  const newPathname = slug.join("/");

  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);

  const getCategoriesData = async () => {
    try {
      setIsLoading(true);
      const res = await getAPI(`get-category?slug=${data}`, token);
      console.log("res?.data?.category", res);
      if (!res?.data?.category?.length) {
        // router.push(`/products/search/${data}`);
        router.push(`/products/search/${data}/id=${_id}`);
      }
      setSubCategoryMenus(res?.data?.category);
    } catch (error) {
      console.log("errro", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategoriesData();
  }, [pathname]);
  const downMd = useMediaQuery((theme) => theme.breakpoints.down("md"));

  const handleChangeFilters = (key, values) => {
    setFilters((prev) => ({
      ...prev,
      [key]: values,
    }));
  };

  const handleChangeSortBy = useCallback((v) => setSortBy(v), []);
  const toggleView = useCallback((v) => () => setView(v), []);
  const PRODUCTS = productDatabase.slice(95, 104).map((pro) => ({
    ...pro,
    discount: 25,
  }));
  const PRODUCTS_CATE = subcategoryMenus
    ?.slice(0, productIncreaseValue)
    .map((pro) => ({
      ...pro,
      discount: 25,
    }));
  // console.log("PRODUCTS_CATEPRODUCTS_CATE" , PRODUCTS_CATE);

  const productSearchById = async () => {
    try {
      setLoading(true);
      const res = await getAPI(
        `get-product?categoryId=${_id}&page=${page}&limit=64&sortBy=${sortBy}`
      );
      console.log("hhdhdh", res);
      if (res.status === 200) {
        setProductList(res.data.data);
        setImageBaseUrl(res.data.base_url);
        setVideoBaseUrl(res.data.video_base_url);
        setTotalPages(res?.data?.pagination?.totalPages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // filter Sidebar
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };

  const getParentCategory = async () => {
    try {
      const res = await getAPI(`get-category-by-slug/${data}`);
      if (res.status === 200) {
        setChildCategories(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    productSearchById();
  }, [page, sortBy]);
  useEffect(() => {
    getParentCategory();
  }, []);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(`${window.location.pathname}?${currentParams.toString()}`);
  };

  return (
    <div className="bg-white  pb-4">
      <Container sx={{ px: 0, pb: 4 }}>
        <Container maxWidth="xl" sx={{ px: 0 }}>
          <Box sx={{ mt: 5 }}>
            <Grid container>
              <Grid item xs={12}>
                <ProductsCategoriesPage
                  childCategories={childCategories}
                  title={title}
                  products={PRODUCTS_CATE}
                  SetProductIncreaseValue={SetProductIncreaseValue}
                  isproductIncreaseValue={isproductIncreaseValue}
                  SetIsProductIncreaseValue={SetIsProductIncreaseValue}
                  subcategoryMenus={subcategoryMenus}
                  isLoading={isLoading}
                  productlength={subcategoryMenus?.length}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Sort + Filter Row */}
          <FlexBetween flexWrap="wrap" alignItems="center" gap={2} mb={3} sx={{ px: 2 }}>
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
          {loading ? (
            <Container sx={{ padding: "30px 16px" }}>
              <Grid container spacing={4}>
                {[...Array(64)].map((_, index) => (
                  <Grid key={index} item xs={6} md={4} lg={3}>
                    <ProductCardShimmer />
                  </Grid>
                ))}
              </Grid>
            </Container>
          ) : (
            <Container sx={{ padding: " 0px" }}>
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
                  <>
                    <Box
                      sx={{
                        textAlign: "center",
                        fontSize: "20px",
                        textTransform: "uppercase",
                        fontWeight: 900,
                      }}
                    >
                      Products Not Found
                    </Box>
                  </>
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
    </div>
  );
}
