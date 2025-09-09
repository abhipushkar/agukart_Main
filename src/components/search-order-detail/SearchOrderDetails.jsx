"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import { H2, H3, H4, H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
import Radio from "@mui/material/Radio";
import StarIcon from "@mui/icons-material/Star";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useRouter, useSearchParams } from "next/navigation";
import { getAPI, getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useCurrency } from "contexts/CurrencyContext";

const Search = styled("span")(({ theme }) => ({
  position: "relative",
  borderRadius: "4px 0px 0 4px",
  border: "1px solid #000",
  height: "35px",
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  left: "0",
  top: "1px",
}));

const breadcrumbs = [
  <Link
    style={{
      fontSize: "16px",
      fontWeight: "500",
      color: "green",
      textDecoration: "none",
    }}
    href="/"
    key="1"
  >
    Your Account
  </Link>,
  <Link
    style={{
      fontSize: "16px",
      fontWeight: "500",
      color: "green",
      textDecoration: "none",
    }}
    href="/profile/orders"
    key="2"
  >
    Your Orders
  </Link>,
  <Typography
    style={{
      fontSize: "16px",
      fontWeight: "500",
      color: "orange",
      textDecoration: "none",
    }}
    sx={{ color: "text.primary" }}
    key="3"
  >
    Search Results
  </Typography>,
];

const SearchOrderDetails = () => {
  const {currency} = useCurrency();
  const searchParams = useSearchParams();
  const [allOrders, setAllOrders] = useState([]);
  console.log(allOrders, "all orders");
  const searchTerms = searchParams.get("search-terms");
  const [baseUrl, setBaseUrl] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [reviewPayload, setReviewPayload] = useState(null);

  const router = useRouter();

  console.log(searchTerms);
  const getOrderDetails = async () => {
    try {
      setShowLoading(true);
      const res = await getAPIAuth(
        `user/searchorder?searchParams=${searchTerms}`
      );

      console.log(res, "serach resopoinshhhhhhl");
      if (res.status === 200) {
        setBaseUrl(res.data.base_url);
        setAllOrders(res.data.data);
        setShowLoading(false);
      }
    } catch (error) {
      setShowLoading(false);
      console.log(error);
    } finally {
      setShowLoading(false);
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, [searchTerms]);
  console.log({ allOrders });

  return showLoading ? (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "48px",
        height: "100vh",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Typography variant="h6">We are working on your request</Typography>
        <CircularProgress size={20} />
      </Box>
    </Box>
  ) : (
    <>
      <SectionCreator p={3}>
        <Box mb={4}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Box>
        <Box>
          <Grid
            container
            pb={3}
            spacing={3}
            sx={{ margin: "0", width: "100%", alignItems: "center" }}
          >
            <Grid lg={6} md={6} xs={12} sx={{ paddingTop: "0" }}>
              <Box
                sx={{
                  textAlign: { lg: "start", md: "start", xs: "center" },
                  marginBottom: {
                    lg: "0",
                    md: "0",
                    sm: "12px",
                  },
                }}
              >
                <Typography variant="h4" fontWeight={600}>
                  Search results
                </Typography>
              </Box>
            </Grid>
            <Grid lg={6} md={6} xs={12} sx={{ paddingTop: "0" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "centre",
                  justifyContent: "end",
                }}
              >
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon sx={{ fontSize: "21px" }} />
                  </SearchIconWrapper>
                  <InputBase
                    placeholder="Search by order id,title..."
                    inputProps={{ "aria-label": "search" }}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{
                      paddingLeft: "32px",
                      height: "35px",
                      border: "none",
                      "& input": {
                        height: "35px",
                      },
                    }}
                  />
                </Search>
                <Typography component="span">
                  <Button
                    onClick={() => {
                      if (searchText) {
                        router.push(
                          `/search-order-detail?search-terms=${searchText}`
                        );
                      }
                    }}
                    variant="contained"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: "0 4px 4px 0",
                      background: "#000",
                      color: "#fff",
                      height: "35px",
                      "&:hover": {
                        background: "#363636",
                      },
                    }}
                  >
                    Search order
                  </Button>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {allOrders.length} orders matching "{searchTerms}"
            </Typography>
          </Box>
          <Box mt={4}>
            <Grid container spacing={2} sx={{ margin: "0", width: "100%" }}>
              {allOrders.length === 0 ? (
                <Box width={"100%"}>
                  <Typography
                    fontWeight={600}
                    textAlign={"center"}
                    variant="h4"
                  >
                    No Order Found
                  </Typography>
                </Box>
              ) : (
                allOrders.map((order) => {
                  const date = new Date(order.createdAt);

                  const formattedDate = date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <Grid
                      lg={12}
                      md={12}
                      xs={12}
                      mb={2}
                      pb={2}
                      sx={{
                        paddingTop: "0",
                        borderBottom: "1px solid #dbdbdb",
                      }}
                    >
                      <Box sx={{ display: "flex" }}>
                        <img
                          width={130}
                          height={130}
                          alt="banner"
                          style={{ height: "130px", objectFit: "cover" }}
                          src={baseUrl + order?.saleDetaildata[0]?.productData?.image[0]}
                        />
                        <Typography component="div" ml={4}>
                          <H3
                            sx={{
                              lineHeight: "1",
                              display: { lg: "flex", md: "flex", xs: "block" },
                              alignItems: "center",
                            }}
                            fontWeight={600}
                          >
                            <Typography
                              onClick={() =>
                                router.push(
                                  `order-details?order-id=${order.order_id}`
                                )
                              }
                              component="span"
                              pr={{ lg: "12px", md: "12px", xs: "0" }}
                              fontWeight={600}
                              sx={{
                                cursor: "pointer",
                                color: "#0a8369",
                                fontSize: {
                                  lg: "20px",
                                  md: "18px",
                                  xs: "13px",
                                },
                              }}
                            >
                              Order details
                            </Typography>

                            <Typography
                              pl={{ lg: "12px", md: "12px", xs: "0" }}
                              fontWeight={600}
                              component="span"
                              sx={{
                                fontSize: {
                                  lg: "20px",
                                  md: "18px",
                                  xs: "13px",
                                },
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                "&::before": {
                                  height: "17px",
                                  content: '""',
                                  position: "absolute",
                                  left: "0",
                                  borderLeft: "1px solid #bbb9b9",
                                  top: "8px",
                                  display: {
                                    lg: "block",
                                    md: "block",
                                    xs: "none",
                                  },
                                },
                              }}
                            >
                              Order on {formattedDate} (
                              {order?.saleDetaildata[0]?.qty} items)
                            </Typography>
                          </H3>
                          <Typography
                            variant="h6"
                            pt={1}
                            fontSize={{ lg: "20px", md: "20px", xs: "13px" }}
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: "2",
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              color: "#0a8369",
                            }}
                          >
                            {" "}
                            <Link
                              href={`/products?id=${order.saleDetaildata[0].product_id}`}
                              style={{
                                fontWeight: "500",
                                color: "#0a8369",
                                textDecoration: "none",
                              }}
                            >
                              {order?.saleDetaildata[0]?.productData.product_title?.replace(
                                /<\/?[^>]+(>|$)/g,
                                ""
                              )}
                            </Link>
                          </Typography>
                          {order?.saleDetaildata[0].isCombination && (
                            <>
                              {order?.saleDetaildata[0].variantData?.map((variant, index) => (
                                <Typography fontSize={17} color="gray" key={`variant-${index}`}>
                                  {variant?.variant_name}:{" "}
                                  <Typography fontSize={17} component="span">
                                    {order?.saleDetaildata[0]?.variantAttributeData?.[index]?.attribute_value || "N/A"}
                                  </Typography>
                                </Typography>
                              ))}
                            </>
                          )}
                          {
                            order?.saleDetaildata[0]?.customize == "Yes" && (
                              <>
                                {
                                  order?.saleDetaildata[0]?.customizationData?.map((item, index) => (
                                    <div key={index}>
                                      {Object.entries(item).map(([key, value]) => (
                                        <div key={key}>
                                          {typeof value === 'object' ? (
                                            <div>
                                              {key}:{`${value?.value} (${currency?.symbol}${(value?.price * currency?.rate).toFixed(2)})`}
                                            </div>
                                          ) : (
                                            <div>{key}: {value}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ))
                                }
                              </>
                            )
                          }
                          <Typography
                            sx={{
                              fontSize: "16px",
                              color: "gray",
                              fontWeight: "500",
                            }}
                          >
                            Sold by:
                            {
                              order?.saleDetaildata[0]?.vendor_name
                            }
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "16px",
                              color: "#be0f0f",
                              fontWeight: "500",
                            }}
                          >
                            {currency?.symbol}
                            {(order.saleDetaildata[0]?.sub_total * currency?.rate).toFixed(2)}
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>
        </Box>
      </SectionCreator>
    </>
  );
};

export default SearchOrderDetails;
