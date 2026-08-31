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

import Divider from "@mui/material/Divider";
import Slider from "@mui/material/Slider";
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
  const searchParams = useSearchParams();
  const search = searchParams.get("q");
  console.log(searchParams.getAll("q"), search, 'params');
  const [productList, setProductList] = useState([]);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [videoBaseUrl, setVideoBaseUrl] = useState("");
  const [shopDetails, setShopDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const sortBy = searchParams.get("sortBy") || "relevance";
  const [totalPages, setTotalPages] = useState(1);
  const page = Number(searchParams.get("page")) || 1;

  const [filters, setFilters] = useState(initialFilters);

  const [facets, setFacets] = useState({
    categories: [],
    brands: [],
    variants: [],
    price: {
      min: 0,
      max: 10000,
    },
  });

  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };


  const getProductsBySearch = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams(searchParams.toString());

      params.set("q", search || "");
      params.set("page", String(page));
      params.set("limit", "64");
      params.set("sortBy", sortBy);

      const res = await getAPIAuth(
        `search-product-list?${params.toString()}`
      );

      if (res.status === 200) {
        setImageBaseUrl(res?.data?.base_url);
        setVideoBaseUrl(res?.data?.video_base_url);
        setProductList(res?.data?.data || []);
        setTotalPages(res?.data?.pagination?.totalPages || 1);

        if (res?.data?.facets) {
          setFacets(res.data.facets);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayFilterChange = (name, value) => {
    setFilters((prev) => {
      const values = prev[name] || [];

      return {
        ...prev,
        [name]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  };

  const handleVariantFilterChange = (variantName, value) => {
    setFilters((prev) => {
      const currentValues = prev.variants?.[variantName] || [];

      return {
        ...prev,
        variants: {
          ...prev.variants,
          [variantName]: currentValues.includes(value)
            ? currentValues.filter((item) => item !== value)
            : [...currentValues, value],
        },
      };
    });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);

    const params = new URLSearchParams(searchParams.toString());

    [
      "categoryId",
      "minPrice",
      "maxPrice",
      "rating",
      "brand",
      "freeDelivery",
      "onSale",
      "inStock",
      "customizable",
      "shopLocation",
      "variants",
    ].forEach((key) => params.delete(key));

    params.set("page", "1");

    router.push(`/search-product-list?${params.toString()}`);
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    const setOrDelete = (key, value) => {
      if (value === "" || value === null || value === undefined || value === false) {
        params.delete(key);
        return;
      }

      params.set(key, String(value));
    };

    setOrDelete("categoryId", filters.categoryId);
    setOrDelete("minPrice", filters.minPrice);
    setOrDelete("maxPrice", filters.maxPrice);
    setOrDelete("rating", filters.rating);

    if (filters.brand.length) {
      params.set("brand", filters.brand.join(","));
    } else {
      params.delete("brand");
    }

    setOrDelete("freeDelivery", filters.freeDelivery ? "1" : "");
    setOrDelete("onSale", filters.onSale ? "1" : "");
    setOrDelete("inStock", filters.inStock ? "1" : "");
    setOrDelete("customizable", filters.customizable ? "1" : "");

    if (filters.shopLocation !== "anywhere") {
      params.set(
        "shopLocation",
        filters.shopLocation === "custom"
          ? filters.customLocation
          : filters.shopLocation
      );
    } else {
      params.delete("shopLocation");
    }

    const selectedVariants = Object.entries(filters.variants || {}).reduce(
      (acc, [variantName, values]) => {
        if (values?.length) {
          acc[variantName] = values;
        }

        return acc;
      },
      {}
    );

    if (Object.keys(selectedVariants).length) {
      params.set("variants", JSON.stringify(selectedVariants));
    } else {
      params.delete("variants");
    }

    params.set("page", "1");

    router.push(`/search-product-list?${params.toString()}`);

    toggleDrawer(false);
  };

  const handleChangeSortBy = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("sortBy", value);
      params.set("page", "1");

      router.push(`/search-product-list?${params.toString()}`);
    },
    [router, searchParams]
  );

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
      setShopDetails({});
    }
  };

  useEffect(() => {
    getShopBySearch();
  }, [search]);

  const handlePageChange = (_, value) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", value);

    router.push(`/search-product-list?${params.toString()}`);
  };

  return (
    <div className="bg-white pt-2 pb-4">
      <Container sx={{ padding: { xs: "12px", sm: "30px 16px" } }}>
        <Box px={{ xs: 0, sm: 3, md: 4 }}>

          {Object.values(shopDetails || {}).length > 0 && (
            <Typography mb={2}>
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
          <FlexBetween flexWrap="wrap" gap={2} mb={2} p={0}>
            <Box>
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
        </Box>
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
          <Box m={{ xs: 0, sm: 4 }}>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {productList?.length > 0 ? (
                productList?.map((product) => (
                  <Grid key={product._id} item xs={6} md={4} lg={3}>
                    <Product
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
          </Box>
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
      <Drawer
        anchor="left"
        open={open}
        onClose={() => toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: {
              xs: "100%",
              sm: 420,
            },
            maxWidth: "100%",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #e5e5e5",
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              All Filters
            </Typography>

            <CloseIcon
              onClick={() => toggleDrawer(false)}
              sx={{
                cursor: "pointer",
                fontSize: 26,
              }}
            />
          </Box>

          {/* Scrollable filters */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 3,
            }}
          >
            {/* Categories */}
            {facets?.categories?.length > 0 && (
              <>
                <Box py={3}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#222",
                        mb: 1,
                        "&.Mui-focused": {
                          color: "#222",
                        },
                      }}
                    >
                      Category
                    </FormLabel>

                    <RadioGroup
                      value={filters.categoryId}
                      onChange={(e) =>
                        handleFilterChange("categoryId", e.target.value)
                      }
                      sx={{
                        ".MuiRadio-root": {
                          py: 0.5,
                        },
                      }}
                    >
                      <FormControlLabel
                        value=""
                        control={<Radio size="small" />}
                        label="All categories"
                      />

                      {facets.categories.map((category) => (
                        <FormControlLabel
                          key={category._id}
                          value={category._id}
                          control={<Radio size="small" />}
                          label={
                            <FlexBetween width="100%">
                              <Typography fontSize={14}>
                                {category.title}
                              </Typography>

                              {category.count !== undefined && (
                                <Typography
                                  fontSize={12}
                                  color="grey.600"
                                  ml={1}
                                >
                                  ({category.count})
                                </Typography>
                              )}
                            </FlexBetween>
                          }
                          sx={{
                            width: "100%",
                            mr: 0,
                          }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>

                <Divider />
              </>
            )}

            {/* Price */}
            <Box py={3}>
              <Typography
                fontSize={16}
                fontWeight={600}
                mb={2}
              >
                Price
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />

                <Typography color="grey.600">
                  to
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  InputProps={{
                    inputProps: {
                      min: 0,
                    },
                  }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Rating */}
            <Box py={3}>
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#222",
                    mb: 1,
                    "&.Mui-focused": {
                      color: "#222",
                    },
                  }}
                >
                  Customer rating
                </FormLabel>

                <RadioGroup
                  value={String(filters.rating)}
                  onChange={(e) =>
                    handleFilterChange(
                      "rating",
                      Number(e.target.value)
                    )
                  }
                  sx={{
                    ".MuiRadio-root": {
                      py: 0.5,
                    },
                  }}
                >
                  <FormControlLabel
                    value="0"
                    control={<Radio size="small" />}
                    label="Any rating"
                  />

                  <FormControlLabel
                    value="4"
                    control={<Radio size="small" />}
                    label="4 stars & up"
                  />

                  <FormControlLabel
                    value="3"
                    control={<Radio size="small" />}
                    label="3 stars & up"
                  />

                  <FormControlLabel
                    value="2"
                    control={<Radio size="small" />}
                    label="2 stars & up"
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            <Divider />

            {/* Special Offers */}
            <Box py={3}>
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#222",
                    mb: 1,
                    "&.Mui-focused": {
                      color: "#222",
                    },
                  }}
                >
                  Special offers
                </FormLabel>

                <FormGroup
                  sx={{
                    ".MuiCheckbox-root": {
                      py: 0.5,
                    },
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.onSale}
                        onChange={(e) =>
                          handleFilterChange(
                            "onSale",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="On sale"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.freeDelivery}
                        onChange={(e) =>
                          handleFilterChange(
                            "freeDelivery",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="FREE delivery"
                  />
                </FormGroup>
              </FormControl>
            </Box>

            <Divider />

            {/* Availability */}
            <Box py={3}>
              <FormControl>
                <FormLabel
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#222",
                    mb: 1,
                    "&.Mui-focused": {
                      color: "#222",
                    },
                  }}
                >
                  Availability
                </FormLabel>

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.inStock}
                        onChange={(e) =>
                          handleFilterChange(
                            "inStock",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="In stock"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={filters.customizable}
                        onChange={(e) =>
                          handleFilterChange(
                            "customizable",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Customizable"
                  />
                </FormGroup>
              </FormControl>
            </Box>

            <Divider />

            {/* Brand */}
            {facets?.brands?.length > 0 && (
              <>
                <Box py={3}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#222",
                        mb: 1,
                        "&.Mui-focused": {
                          color: "#222",
                        },
                      }}
                    >
                      Brand
                    </FormLabel>

                    <FormGroup>
                      {facets.brands.map((brand) => (
                        <FormControlLabel
                          key={brand._id}
                          control={
                            <Checkbox
                              size="small"
                              checked={filters.brand.includes(
                                brand._id
                              )}
                              onChange={() =>
                                handleArrayFilterChange(
                                  "brand",
                                  brand._id
                                )
                              }
                            />
                          }
                          label={
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <Typography fontSize={14}>
                                {brand.title}
                              </Typography>

                              {brand.count !== undefined && (
                                <Typography
                                  fontSize={12}
                                  color="grey.600"
                                >
                                  ({brand.count})
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Box>

                <Divider />
              </>
            )}

            {/* Dynamic variants */}
            {facets?.variants?.map((variant) => (
              <Box key={variant.name}>
                <Box py={3}>
                  <FormControl fullWidth>
                    <FormLabel
                      sx={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#222",
                        mb: 1,
                        "&.Mui-focused": {
                          color: "#222",
                        },
                      }}
                    >
                      {variant.name}
                    </FormLabel>

                    <FormGroup>
                      {variant.values?.map((attribute) => (
                        <FormControlLabel
                          key={attribute.value}
                          control={
                            <Checkbox
                              size="small"
                              checked={(
                                filters.variants?.[
                                variant.name
                                ] || []
                              ).includes(attribute.value)}
                              onChange={() =>
                                handleVariantFilterChange(
                                  variant.name,
                                  attribute.value
                                )
                              }
                            />
                          }
                          label={
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              <Typography fontSize={14}>
                                {attribute.value}
                              </Typography>

                              {attribute.count !== undefined && (
                                <Typography
                                  fontSize={12}
                                  color="grey.600"
                                >
                                  ({attribute.count})
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      ))}
                    </FormGroup>
                  </FormControl>
                </Box>

                <Divider />
              </Box>
            ))}

            {/* Shop Location */}
            <Box py={3}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#222",
                    mb: 1,
                    "&.Mui-focused": {
                      color: "#222",
                    },
                  }}
                >
                  Shop location
                </FormLabel>

                <RadioGroup
                  value={filters.shopLocation}
                  onChange={(e) =>
                    handleFilterChange(
                      "shopLocation",
                      e.target.value
                    )
                  }
                  sx={{
                    ".MuiRadio-root": {
                      py: 0.5,
                    },
                  }}
                >
                  <FormControlLabel
                    value="anywhere"
                    control={<Radio size="small" />}
                    label="Anywhere"
                  />

                  <FormControlLabel
                    value="India"
                    control={<Radio size="small" />}
                    label="India"
                  />

                  <FormControlLabel
                    value="custom"
                    control={<Radio size="small" />}
                    label="Custom"
                  />
                </RadioGroup>

                {filters.shopLocation === "custom" && (
                  <TextField
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    placeholder="Enter country or location"
                    value={filters.customLocation}
                    onChange={(e) =>
                      handleFilterChange(
                        "customLocation",
                        e.target.value
                      )
                    }
                  />
                )}
              </FormControl>
            </Box>
          </Box>

          {/* Bottom Actions */}
          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid #e5e5e5",
              backgroundColor: "#fff",
              display: "flex",
              gap: 1.5,
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                borderRadius: "30px",
                minHeight: 46,
                borderColor: "#222",
                color: "#222",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Clear all
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                borderRadius: "30px",
                minHeight: 46,
                backgroundColor: "#222",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#000",
                },
              }}
            >
              Show results
            </Button>
          </Box>
        </Box>
      </Drawer>
    </div>
  );
}
