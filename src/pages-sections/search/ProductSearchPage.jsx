"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

import CloseIcon from "@mui/icons-material/Close";

import { H1, Paragraph } from "components/Typography";
import { FlexBetween, FlexBox } from "components/flex-box";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { Card, CircularProgress, Pagination, Paper } from "@mui/material";
import Product from "components/product/Product";
import ProductCardShimmer from "components/shimmer/ProductCardShimmer";
import ProductFilterDrawer from "components/search/ProductFilterDrawer";
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

export default function ProductSearchPage({ initialData, initialSearchParams, }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const search = searchParams.get("q");
  const [productList, setProductList] = useState(initialData?.data || []);
  const [imageBaseUrl, setImageBaseUrl] = useState(initialData?.base_url || "");
  const [videoBaseUrl, setVideoBaseUrl] = useState(initialData?.video_base_url || "");
  const [shopDetails, setShopDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sortBy = searchParams.get("sortBy") || "relevance";
  const [totalPages, setTotalPages] = useState(
    initialData?.pagination?.totalPages || 1
  );
  const page = Number(searchParams.get("page")) || 1;
  const filterQueryRef = useRef(null);

  const [availableFilters, setAvailableFilters] = useState(
    initialData?.filters || {
      price: {},
      brands: [],
      ratings: [],
      dynamicFields: {},
    }
  );

  const [filterState, setFilterState] = useState({
    minPrice: "",
    maxPrice: "",
    ratings: [],
    brands: [],
    badges: [],
    dynamicFields: {},
  });

  useEffect(() => {
    setProductList(initialData?.data || []);
    console.log(initialData?.data?.slice(0, 3), "products")
    setImageBaseUrl(initialData?.base_url || "");
    setVideoBaseUrl(initialData?.video_base_url || "");
    setTotalPages(initialData?.pagination?.totalPages || 1);

    if (filterQueryRef.current !== search) {
      setAvailableFilters(
        initialData?.filters || {
          price: {},
          brands: [],
          badges: [],
          ratings: [],
          bestseller: [],
          featured: [],
          popularGifts: [],
          topRated: [],
          dynamicFields: {},
        }
      );

      filterQueryRef.current = search;
    }
  }, [initialData, search]);


  const toggleDrawer = (newOpen) => {
    setOpen(newOpen);
  };


  const handleFilterChange = (key, value, isArray = false) => {
    setFilterState((prev) => {
      if (key === "priceRange") {
        return {
          ...prev,
          minPrice: String(value[0]),
          maxPrice: String(value[1]),
        };
      }

      if (!isArray) {
        return {
          ...prev,
          [key]: value,
        };
      }

      const currentValues = prev[key] || [];

      return {
        ...prev,
        [key]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleDynamicFieldChange = (fieldName, value, isRadio = false) => {
    setFilterState((prev) => {
      const currentValues =
        prev.dynamicFields?.[fieldName] || [];

      let updatedValues;

      if (isRadio) {
        updatedValues =
          currentValues[0] === value ? [] : [value];
      } else {
        updatedValues = currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value];
      }

      const updatedDynamicFields = {
        ...prev.dynamicFields,
      };

      if (updatedValues.length > 0) {
        updatedDynamicFields[fieldName] = updatedValues;
      } else {
        delete updatedDynamicFields[fieldName];
      }

      return {
        ...prev,
        dynamicFields: updatedDynamicFields,
      };
    });
  };


  const handleClearField = (type, fieldName, value, autoApply = false) => {
    let updatedState = { ...filterState };

    if (type === "price") {
      updatedState = {
        ...updatedState,
        minPrice: "",
        maxPrice: "",
      };
    }

    if (type === "brands") {
      updatedState = {
        ...updatedState,
        brands: [],
      };
    }

    if (["featured", "popularGifts", "bestseller", "topRated"].includes(type)) {
      delete updatedState[type];
    }

    if (type === "ratings") {
      updatedState = {
        ...updatedState,
        ratings: 0,
      };
    }

    if (type === "badges") {
      updatedState = {
        ...updatedState,
        badges: [],
      };
    }

    if (type === "dynamicField") {
      const updatedDynamicFields = {
        ...updatedState.dynamicFields,
      };

      if (value !== undefined) {
        const updatedValues = (
          updatedDynamicFields[fieldName] || []
        ).filter((item) => item !== value);

        if (updatedValues.length > 0) {
          updatedDynamicFields[fieldName] = updatedValues;
        } else {
          delete updatedDynamicFields[fieldName];
        }
      } else {
        delete updatedDynamicFields[fieldName];
      }

      updatedState = {
        ...updatedState,
        dynamicFields: updatedDynamicFields,
      };
    }

    setFilterState(updatedState);

    if (autoApply) {
      handleApplyFilters(updatedState, false);
    }
  };

  const handleClearFilters = () => {
    setFilterState({
      minPrice: "",
      maxPrice: "",
      ratings: [],
      brands: [],
      badges: [],
      dynamicFields: {},
    });

    const params = new URLSearchParams(searchParams.toString());

    [
      "minPrice",
      "maxPrice",
      "ratings",
      "brands",
      "badges",
      "dynamicFields",
      "featured",
      "popularGifts",
      "bestseller",
      "topRated"
    ].forEach((key) => params.delete(key));

    params.set("page", "1");

    router.push(`/search-product-list?${params.toString()}`);

    toggleDrawer(false);
  };

  const handleApplyFilters = (state = filterState, closeDrawer = true) => {
    const params = new URLSearchParams(searchParams.toString());

    if (state.minPrice) {
      params.set("minPrice", state.minPrice);
    } else {
      params.delete("minPrice");
    }

    if (state.maxPrice) {
      params.set("maxPrice", state.maxPrice);
    } else {
      params.delete("maxPrice");
    }

    if (state.ratings?.length > 0) {
      params.set("ratings", state.ratings.join(","));
    } else {
      params.delete("ratings");
    }

    if (state.bestseller) {
      params.set("bestseller", String(state.bestseller));
    } else {
      params.delete("bestseller");
    }

    if (state.featured) {
      params.set("featured", String(state.featured));
    } else {
      params.delete("featured");
    }

    if (state.popularGifts) {
      params.set("popularGifts", String(state.popularGifts));
    } else {
      params.delete("popularGifts");
    }

    if (state.topRated) {
      params.set("topRated", String(state.topRated));
    } else {
      params.delete("topRated");
    }

    if (state.brands?.length > 0) {
      params.set("brands", state.brands.join(","));
    } else {
      params.delete("brands");
    }

    if (state.badges?.length > 0) {
      params.set("badges", state.badges.join(","));
    } else {
      params.delete("badges");
    }

    if (Object.keys(state.dynamicFields || {}).length > 0) {
      params.set(
        "dynamicFields",
        JSON.stringify(state.dynamicFields)
      );
    } else {
      params.delete("dynamicFields");
    }

    params.set("page", "1");

    router.push(`/search-product-list?${params.toString()}`);

    if (closeDrawer) {
      toggleDrawer(false);
    }
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
    let dynamicFields = {};

    try {
      dynamicFields = JSON.parse(
        searchParams.get("dynamicFields") || "{}"
      );
    } catch (error) {
      dynamicFields = {};
    }

    setFilterState({
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      ratings: searchParams.get("ratings")
        ? searchParams.get("ratings").split(",").map(Number)
        : [],
      brands: searchParams.get("brands")
        ? searchParams.get("brands").split(",")
        : [],
      badges: searchParams.get("badges")
        ? searchParams.get("badges").split(",")
        : [],
      dynamicFields,

      ...(searchParams.has("featured") && { featured: searchParams.get("featured") === "true", }),
      ...(searchParams.has("popularGifts") && { popularGifts: searchParams.get("popularGifts") === "true", }),
      ...(searchParams.has("bestseller") && { bestseller: searchParams.get("bestseller") === "true", }),
      ...(searchParams.has("topRated") && { topRated: searchParams.get("topRated") === "true", }),
    });
  }, [queryString]);

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

  const selectedFilterChips = (() => {
    const chips = [];

    const brands = searchParams.get("brands")
      ? searchParams.get("brands").split(",")
      : [];

    const badges = searchParams.get("badges")
      ? searchParams.get("badges").split(",")
      : [];

    const featured = searchParams.get("featured") === "true";

    let dynamicFields = {};

    try {
      dynamicFields = JSON.parse(
        searchParams.get("dynamicFields") || "{}"
      );
    } catch {
      dynamicFields = {};
    }

    // brands.forEach((value) => {
    //   chips.push({
    //     type: "brands",
    //     value,
    //     label: value,
    //   });
    // });

    badges.forEach((value) => {
      chips.push({
        type: "badges",
        value,
        label: value,
      });
    });

    if (featured) {
      chips.push({
        type: "featured",
        value: "true",
        label: "Featured",
      });
    }

    Object.entries(dynamicFields).forEach(
      ([fieldName, values]) => {
        values.forEach((value) => {
          chips.push({
            type: "dynamicField",
            fieldName,
            value,
            label: value === "Yes" || value === "No" ? `${fieldName} : ${value}` : value,
          });
        });
      }
    );

    return (
      chips.map((chip) => (
        <Chip
          key={`${chip.type}-${chip.fieldName || ""}-${chip.value}`}
          label={chip.label}
          onDelete={() => handleClearField(chip.type, chip.fieldName, chip.value, true)}
          sx={{
            fontSize: {xs: 12, sm: 14},
            p: {xs: 0, sm: "auto"},
            color: "whitesmoke",
            bgcolor: "#2b3445",
            height: {xs: 28, sm: 32},
            "&:hover": { bgcolor: "#2b3445f5", color: "white" },
            "& .MuiChip-deleteIcon": {
              fontSize: {xs: 15, sm: 18},
              color: "white",
              borderRadius: 4,
              "&:hover": { bgcolor: "#4a608a", },
              transition: "all 200ms"
            },
          }}
          deleteIcon={<CloseIcon />}
        />
      )))
  })();

  return (
    <div className="bg-white pt-1 pb-4">
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
              {/* {searchParams.size > 2 && (
                <Button variant="text" onClick={handleClearFilters} sx={{ "&:hover": { bgcolor: "transparent" }, ml: 0.5 }}>
                  <u>Reset</u>
                </Button>
              )} */}
            </Box>
            <Box
              display={{ xs: "none", sm: "flex" }}
              gap={1}
              flex={1}
              minWidth={0}
              alignItems={"center"}
              overflow={"auto"}
              sx={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
              borderRadius={16}
            >
              {selectedFilterChips}
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
        <Box
          display={{ xs: "flex", sm: "none" }}
          gap={1}
          flex={1}
          minWidth={0}
          alignItems={"center"}
          overflow={"auto"}
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
          borderRadius={4}
          mb={2}
        >
          {selectedFilterChips}
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
      <ProductFilterDrawer
        open={open}
        onClose={() => toggleDrawer(false)}
        filters={availableFilters}
        filterState={filterState}
        onFilterChange={handleFilterChange}
        onDynamicFieldChange={handleDynamicFieldChange}
        onClearField={handleClearField}
        onClearFilters={handleClearFilters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}
