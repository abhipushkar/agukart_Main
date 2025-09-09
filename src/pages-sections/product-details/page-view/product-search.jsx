"use client";
import { Fragment, useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import { SectionCreator } from "components/section-header";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Select from "@mui/material/Select";
import { H1, H5, Paragraph } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { CircularProgress, Pagination } from "@mui/material";
import Product from "components/product/Product";
import Link from "next/link";
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
const initialFilters = {
  rating: 0,
  color: [],
  brand: [],
  sales: [],
  price: [0, 300],
};
export default function ProductSearchPageView() {
  const router = useRouter();
  const { token } = useAuth();
  console.log("ssssstoken", token);
  const param = useParams();
  console.log("param", param);
  const pathname = usePathname();
  const [sortBy, setSortBy] = useState("relevance");
  const [ProductsMenus, setProductsMenus] = useState([]);
  const parts = pathname.split("-");
  const data = parts[parts.length - 2];
  const searchPrams = useSearchParams();
  let queryPage = searchPrams.get("page");
  queryPage = queryPage ? parseInt(queryPage) : "";
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(queryPage || 1);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);

  console.log("aaaaaaaaaadataaaa", data);

  const catId = pathname.split("id=");

  console.log({ catId });

  const [childCategories, setChildCategories] = useState([]);
  const params = useSearchParams();
  const slug = params.get("slug");

  const getChildCategories = async () => {
    try {
      const res = await getAPIAuth(`get-category-by-slug/${slug}`);
      if (res.status === 200) {
        setChildCategories(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getChildCategories();
  }, [slug]);

  const handleChangeSortBy = useCallback((v) => setSortBy(v), []);

  const getProductsData = async () => {
    try {
      const res = await getAPIAuth(
        `get-product?categoryId=${catId[1]}&page=${page}&limit=64&sortBy=${sortBy}`,
        token
      );
      console.log("getprofileres", res);
      if (res.status == 200) {
        const myData = res?.data.data.map((item) => {
          return { base_url: res.data.base_url, ...item };
        });
        setProductsMenus(myData);
        setImageBaseUrl(res.data.base_url);
        setVideoBaseUrl(res.data.video_base_url);
        setTotalPages(res?.data?.pagination?.totalPages);
      }
    } catch (error) {
      console.log("errro", error);
    } finally {
      setLoading(false);
    }
  };
  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };
  useEffect(() => {
    getProductsData();
  }, [token, pathname, sortBy, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("page", value);
    router.push(`${window.location.pathname}?${currentParams.toString()}`);
  };

  return (
    <div className="bg-white  pb-4">
      <Container sx={{ px: 2, pb: 4 }}>
        <Container maxWidth="xl">
          <Box mt={3}>
            <Box textAlign="center" mt={4} mb={2}>
              <H5 fontWeight={400} color="primary.main">
                {childCategories.map((cat, i) => (
                  <Fragment key={cat._id}>
                    {i !== childCategories.length - 1 ? (
                      <>
                        <Link
                          href={`/products-categories/search/${cat.slug}?title=${cat.title}&_id=${cat._id}`}
                          passHref
                        >
                          <Box
                            component="a"
                            sx={{
                              cursor: "pointer",
                              color: "primary.main",
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                          >
                            {cat.title}
                          </Box>
                        </Link>
                        <span> / </span>
                      </>
                    ) : (
                      <span>{cat.title}</span>
                    )}
                  </Fragment>
                ))}
              </H5>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {childCategories?.[childCategories.length - 1]?.title}
              </Typography>
            </Box>
            <FlexBetween flexWrap="wrap" gap={2} mb={3}>
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
                    "&:hover": { boxShadow: "0 0 3px #000" },
                  }}
                >
                  <Typography display="flex" alignItems="center">
                    <svg height="20px" width="20px" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M15 9a3 3 0 0 0 2.599-1.5H21v-2h-3.041a3 3 0 0 0-5.918 0H3v2h9.401A2.999 2.999 0 0 0 15 9Zm-6 8a3.001 3.001 0 0 0 2.83-2H21v-2h-9.17a3.001 3.001 0 0 0-5.66 0H3v2h3.17A3.001 3.001 0 0 0 9 15Zm6 6a3.001 3.001 0 0 0 2.83-2H21v-2h-3.17a3.001 3.001 0 0 0-5.66 0H3v2h9.17A3.001 3.001 0 0 0 15 21Z"
                      />
                    </svg>
                    <Typography component="span" ml={1}>All Filter</Typography>
                  </Typography>
                </Button> */}
              </Box>
              <Box>
                <FlexBox
                  alignItems="center"
                  sx={{
                    border: "1px solid gray",
                    borderRadius: "30px",
                    px: 2,
                    py: 0.5,
                    "&:hover": { boxShadow: "0 0 3px #000" },
                  }}
                  gap={1}
                >
                  <Paragraph color="grey.600">Sort by:</Paragraph>
                  <TextField
                    select
                    size="small"
                    value={sortBy}
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
            </FlexBetween>
            {loading ? (
              <Container sx={{ padding: "30px 16px" }}>
                <Grid container spacing={3}>
                  {[...Array(64)].map((_, index) => (
                    <Grid key={index} item xs={6} md={4} lg={3}>
                      <ProductCardShimmer />
                    </Grid>
                  ))}
                </Grid>
              </Container>
            ) : (
              <Container sx={{ padding: "30px 16px" }}>
                <Grid container spacing={3}>
                  {ProductsMenus?.length > 0 ? (
                    ProductsMenus.map((item) => (
                      <Grid item lg={3} md={4} xs={6} key={item.id}>
                        <Product
                          product={item}
                          imageBaseUrl={imageBaseUrl}
                          videoBaseUrl={videoBaseUrl}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          textAlign: "center",
                          fontSize: "20px",
                          textTransform: "uppercase",
                          fontWeight: 900,
                          padding: "40px 0",
                          width: "100%",
                        }}
                      >
                        Products Not Found
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Container>
            )}
          </Box>
          {ProductsMenus?.length > 0 && (
            <Box mt={5} display="flex" justifyContent="center">
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
