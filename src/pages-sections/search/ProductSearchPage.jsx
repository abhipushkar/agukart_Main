"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
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
import { H1, Paragraph } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { CircularProgress, Pagination } from "@mui/material";
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
    value: "date",
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
export default function ProductSearchPage() {
  const router = useRouter();
  const searchPrams = useSearchParams();
  const search = searchPrams.get("q");
  let queryPage = searchPrams.get("page");
  queryPage = queryPage ? parseInt(queryPage) : "";
  const [productList, setProductList] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [shopDetails, setShopDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const getProductsBySearch = async () => {
    try {
      setLoading(true);
      const res = await getAPIAuth(
        `search-product-list?q=${search}&page=${page}&limit=16&sortBy=${sortBy}`
      );
      if (res.status === 200) {
        setLoading(false);
        setImageBaseUrl(res?.data?.base_url);
        setVideoBaseUrl(res?.data?.video_base_url);
        setProductList(res?.data?.data);
        setTotalPages(res?.data?.pagination?.totalPages);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSortBy = useCallback((v) => setSortBy(v), []);

  useEffect(() => {
    if (search) {
      getProductsBySearch();
    } else {
      setProductList([]);
    }
  }, [search, sortBy, page]);

  const getShopBySearch = async () => {
    try {
      const res = await getAPIAuth(`get-shop-detail?name=${search}`);
      if (res.status === 200) {
        setShopDetails(res?.data?.shop);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getShopBySearch();
  }, [search]);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(`${window.location.pathname}?${currentParams.toString()}`);
  };

  return (
    <div className="bg-white pt-2 pb-4">
      <Container sx={{ padding: "30px 16px" }}>
        <Container>
          <Grid container width={"calc(100% + -32px)"} ml={0} spacing={4}>
            <Grid item lg={12} md={12} xs={12}>
              <FlexBetween flexWrap="wrap" gap={2} mb={2}>
                <Box>
                  {/* <Button onClick={toggleDrawer(true)}
                    variant="text"
                    sx={{
                      '&:hover': {
                        boxShadow: '0 0 3px #000'
                      },
                      background: '#fff',
                      border: '1px solid gray',
                      borderRadius: '30px',
                      padding: '4px 16px',
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
                      <Typography component="span" sx={{ marginLeft: '5px' }}>
                        All Filter
                      </Typography>
                    </Typography>
                  </Button> */}
                  {Object.values(shopDetails || {}).length > 0 && (
                    <Typography>
                      Did you mean the shop{" "}
                      <b
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          const url = `/store/${shopDetails?.slug}`;
                          window.open(url, "_blank");
                        }}
                      >
                        {shopDetails?.shop_name}
                      </b>{" "}
                      ?
                    </Typography>
                  )}
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
                    <Paragraph color="grey.600">Sort by: </Paragraph>
                    <TextField
                      select
                      size="small"
                      value={sortBy}
                      variant="outlined"
                      onChange={(e) => handleChangeSortBy(e.target.value)}
                      sx={{
                        minWidth: 120,
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
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
            </Grid>
          </Grid>
        </Container>
        {loading ? (
          <Container sx={{ padding: "30px 16px" }}>
            <Grid container spacing={4}>
              {[...Array(16)].map((_, index) => (
                <Grid key={index} item xs={6} md={4} lg={3}>
                  <ProductCardShimmer />
                </Grid>
              ))}
            </Grid>
          </Container>
        ) : (
          <Container sx={{ padding: "30px 16px" }}>
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
      <Drawer open={open} onClose={toggleDrawer(false)}>
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
            <CloseIcon onClick={toggleDrawer(false)} />
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
