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

const Search = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  borderRadius: "4px",
  border: "1px solid #000",
  height: 35,
  width: "100%",
  maxWidth: 500,

  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
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
  const { currency } = useCurrency();
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
    <Box p={{ xs: 2.5, sm: 4 }}>
      <Box
        mb={4}
        sx={{
          overflowX: "auto",
          whiteSpace: "nowrap",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{
            flexWrap: "nowrap",
          }}
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "centre",
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: 2
          }}
        >
          <Typography variant="h4" fontWeight={600} fontSize={{ xs: 20, md: 30 }}>
            Search results
          </Typography>
          <Box sx={{
            ml: { sm: "auto" },
            width: { xs: "100%", sm: "fit-content" },
          }}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ fontSize: "21px" }} />
              </SearchIconWrapper>
              <InputBase
                placeholder="Search by order id,title..."
                onChange={(e) => setSearchText(e.target.value)}
                sx={{
                  flex: 1,
                  pl: "36px",
                  height: "100%",
                }}
              />

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

            </Search>

          </Box>
        </Box>
        <Box>
          <Typography fontSize={{ xs: 15, md: 20 }} color={"GrayText"} fontWeight={600}>
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
              allOrders.map((order, index) => {
                const date = new Date(order.createdAt);

                const formattedDate = date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
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
                    key={index}
                    container
                  >
                    <Grid item xs={3} sm={3} md={2}>
                      <img
                        width="100%"
                        alt="banner"
                        style={{ maxHeight: "100%", maxWidth: "100%", aspectRatio: '1/1', objectFit: "cover", marginTop: '10px' }}
                        src={baseUrl + order?.saleDetaildata[0]?.productData?.image[0]}
                      />
                    </Grid>
                    <Grid item xs={9} sm={9} md={10} pl={'0 !important'}>
                      <Typography component="div" pl={{ xs: 1, sm: 3 }}>
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
                                `order-details?order-id=${order.order_id}&sub-order-id=${order?.saleDetaildata[0]?.sub_order_id}`
                              )
                            }
                            component="span"
                            pr={{ lg: "12px", md: "12px", xs: 2 }}
                            fontWeight={600}
                            sx={{
                              cursor: "pointer",
                              fontSize: {
                                lg: "20px",
                                md: "18px",
                                xs: "15px",
                              },
                            }}
                            color="primary" borderColor='primary'
                          >
                            View Order details
                          </Typography>

                          <Typography
                            pl={{ lg: "12px", md: "12px", xs: "0" }}
                            fontWeight={600}
                            component="span"
                            sx={{
                              fontSize: {
                                md: "18px",
                                xs: "12px",
                              },
                              position: "relative",
                              display: "inline-flex",
                              alignItems: "center",
                              ml: { xs: 'auto', sm: '0' },
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
                            {formattedDate}
                          </Typography>
                        </H3>
                        <Typography
                          variant="h6"
                          pt={{ xs: 0, sm: 1 }}
                          fontSize={{ lg: "20px", md: "20px", xs: "14px" }}
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
                            href={order.saleDetaildata[0].productData.product_code ? `/product/${order.saleDetaildata[0].productData.slug}/${order.saleDetaildata[0].productData.product_code}` : `/products/${order.saleDetaildata[0].product_id}`} //old order fallback
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
                        {/* <Typography
                          sx={{
                            fontSize: { xs: "12px", sm: "16px" },
                            color: "gray",
                            fontWeight: "500",
                          }}
                        >  Sold by: {order?.saleDetaildata[0]?.vendor_name}
                        </Typography> */}
                        <Box display={{ xs: 'none', sm: 'block' }}>

                          {order?.saleDetaildata[0].variantData.length > 0 && order?.saleDetaildata[0].variantData?.map((variant, index) => (
                            <Typography
                              fontSize={17}
                              key={`variant-${index}`}
                            >
                              {variant?.variant_name} {"  "}:{"  "}
                              <Typography fontSize={17} fontWeight={500} component="span">
                                {order?.saleDetaildata[0].variantAttributeData?.[index]
                                  ?.attribute_value || "N/A"}
                              </Typography>
                            </Typography>
                          ))}
                          {order?.saleDetaildata[0].variants && order?.saleDetaildata[0].variants.length > 0 && (
                            order?.saleDetaildata[0].variants.map((variant, index) => (
                              <Typography
                                fontSize={14}
                                sx={{ color: "#000", pt: 0.2 }}
                                key={variant._id || index}
                              >
                                {variant.variantName}{"   "}:{"   "}
                                <Box component="span" ml={1} fontWeight={500}>
                                  {variant.attributeName}
                                </Box>

                              </Typography>
                            ))
                          )}
                          {order?.saleDetaildata[0].customize == "Yes" && (
                            <>
                              {order?.saleDetaildata[0].customizationData?.map((item, index) => (
                                <div key={index}>
                                  {Object.entries(item).map(([key, value]) => (
                                    <div key={key} style={{ paddingTop: 2 }}>
                                      {typeof value === "object" ? (
                                        <div>
                                          {key}{"  "}:{"  "}<Box component="span" ml={1} fontWeight={500} color={'black'}>{`${value?.value}`}</Box>
                                        </div>
                                      ) : (
                                        <div>
                                          {key}{"  "}:{"  "}<Box component="span" ml={1} fontWeight={500} color={'black'}>{value}</Box>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </>
                          )}
                        </Box>

                        <Typography
                          sx={{
                            fontSize: { xs: "13px", sm: "16px" },
                            color: "#be0f0f",
                            fontWeight: "500",
                          }}
                        >
                          {currency?.symbol}
                          {(order.saleDetaildata[0]?.sub_total * currency?.rate).toFixed(2)}
                          <Typography component={'span'} color="secondary.light" fontWeight={500} textAlign={'center'} fontSize={{xs: 12, sm:15}} ml={2}>qty: {order?.saleDetaildata[0]?.qty} {+order?.saleDetaildata[0]?.qty > 1 ? "items" : "item"}</Typography>

                        </Typography>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} display={{ xs: 'block', sm: 'none' }} pl={3}>
                      {order?.saleDetaildata[0].variantData.length > 0 && order?.saleDetaildata[0].variantData?.map((variant, index) => (
                        <Typography
                          fontSize={17}
                          key={`variant-${index}`}
                        >
                          {variant?.variant_name} {"  "}:{"  "}
                          <Typography fontSize={12} fontWeight={500} component="span">
                            {order?.saleDetaildata[0].variantAttributeData?.[index]?.attribute_value || "N/A"}
                          </Typography>
                        </Typography>
                      ))}
                      {order?.saleDetaildata[0].variants && order?.saleDetaildata[0].variants.length > 0 && (
                        order?.saleDetaildata[0].variants.map((variant, index) => (
                          <Typography
                            fontSize={12}
                            sx={{ color: "#000", pt: 0.2 }}
                            key={variant._id || index}
                          >
                            {variant.variantName}{"   "}:{"   "}
                            <Box component="span" ml={1} fontWeight={500}>
                              {variant.attributeName}
                            </Box>

                          </Typography>
                        ))
                      )}
                      {order?.saleDetaildata[0].customize == "Yes" && (
                        <>
                          {order?.saleDetaildata[0].customizationData?.map((item, index) => (
                            <div key={index}>
                              {Object.entries(item).map(([key, value]) => (
                                <div key={key} style={{ paddingTop: 2, fontSize: '12px' }}>
                                  {typeof value === "object" ? (
                                    <div>
                                      {key}{"  "}:{"  "}<Box component="span" ml={1} fontWeight={500} color={'black'}>{`${value?.value}`}</Box>
                                    </div>
                                  ) : (
                                    <div>
                                      {key}{"  "}:{"  "}<Box component="span" ml={1} fontWeight={500} color={'black'}>{value}</Box>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </>
                      )}
                    </Grid>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default SearchOrderDetails;
