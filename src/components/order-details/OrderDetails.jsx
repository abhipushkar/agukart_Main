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
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CircularProgress, Tooltip, tooltipClasses } from "@mui/material";
import { useToast } from "react-toastify";
import { useToasts } from "react-toast-notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCurrency } from "contexts/CurrencyContext";

const invoices = [
  {
    value: "Invoice",
    label: "Invoice",
  },
  {
    value: "Invoice",
    label: "Invoice",
  },
  {
    value: "Invoice",
    label: "Invoice",
  },
  {
    value: "Invoice",
    label: "Invoice",
  },
];

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
    Order Details
  </Typography>,
];
const OrderDetails = () => {
  const {currency} = useCurrency();
  const [baseUrl, setBaseUrl] = useState("");
  const [orderDetail, setOrderDetail] = useState(null);
  console.log(orderDetail, "---------orderDetail");

  const { addToast } = useToasts();

  const { token } = useAuth();

  const searchParams = useSearchParams();

  const orderId = searchParams.get("order-id");

  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));

  const getOrderDetail = async () => {
    try {
      const res = await getAPIAuth(`user/getOrderDetail/${orderId}`, token);
      console.log(res, "order detail fetchhhhhhhhhhh");
      if (res.status === 200) {
        setBaseUrl(res.data.base_url);
        setOrderDetail(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getOrderDetail();
  }, [orderId]);

  const date = new Date(orderDetail?.createdAt);

  return orderDetail === null ? (
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
          <Typography variant="h4" fontWeight={600}>
            Order Details
          </Typography>
          <Grid
            container
            pb={3}
            pt={1}
            spacing={3}
            sx={{ margin: "0", width: "100%", alignItems: "center" }}
          >
            <Grid lg={6} md={6} xs={8} sx={{ paddingTop: "0" }}>
              <Box>
                <Typography
                  sx={{
                    display: { lg: "flex", md: "flex", xs: "block" },
                    alignItems: "center",
                  }}
                  fontWeight={600}
                >
                  <Typography
                    component="span"
                    pr={2}
                    fontWeight={600}
                    sx={{ fontSize: "16px" }}
                  >
                    Order on{" "}
                    {date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Typography>

                  <Typography
                    pl={{ lg: "12px", md: "12px", xs: "0" }}
                    fontWeight={600}
                    component="span"
                    sx={{
                      fontSize: "16px",
                      position: "relative",
                      display: "inline-flex",
                      "&::before": {
                        height: "17px",
                        content: '""',
                        position: "absolute",
                        left: "0",
                        borderLeft: "1px solid #bbb9b9",
                        top: "4px",
                        display: { lg: "block", md: "block", xs: "none" },
                      },
                    }}
                  >
                    Order # {orderDetail?.order_id}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
            <Grid lg={6} md={6} xs={4} sx={{ paddingTop: "0" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
              >
                <Typography component="div">
                  <LightTooltip
                    title={
                      <Box>
                        <Button
                          onClick={() => {
                            addToast("Please Wait", {
                              appearance: "success",
                              autoDismiss: true,
                            });
                          }}
                        >
                          Printable order summary
                        </Button>
                      </Box>
                    }
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        fontSize={15}
                        fontWeight={500}
                        sx={{
                          color: "#ad1414",
                          cursor: "pointer",
                          textTransform: "capitalize",
                        }}
                      >
                        invoice
                      </Typography>
                      <ArrowDropDownIcon />
                    </Box>
                  </LightTooltip>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box p={2} sx={{ border: "1px solid #dbdbdb", borderRadius: "5px" }}>
            <Grid container spacing={3} sx={{ margin: "0", width: "100%" }}>
              <Grid lg={4} md={4} xs={6} sx={{ paddingTop: "0" }}>
                <Box>
                  <Typography fontSize={16} fontWeight={700}>
                    Shipping Address
                  </Typography>
                  <Typography
                    sx={{ textTransform: "capitalize" }}
                    fontWeight={600}
                  >
                    {orderDetail?.name}
                  </Typography>
                  <Typography fontWeight={600}>
                    {orderDetail?.address_line1}
                  </Typography>
                  <Typography fontWeight={600}>
                    {orderDetail?.address_line2
                      ? orderDetail?.address_line2
                      : ""}
                  </Typography>
                  <Typography
                    fontWeight={600}
                    sx={{ textTransform: "uppercase" }}
                  >
                    {orderDetail?.city}, {orderDetail?.state}{" "}
                    {orderDetail?.pincode} {orderDetail?.country}
                  </Typography>
                </Box>
              </Grid>
              <Grid lg={4} md={4} xs={6} sx={{ paddingTop: "0" }}>
                {/* <Box>
                  <Typography fontSize={16} fontWeight={700}>
                    Payments Methods
                  </Typography>
                  <Typography
                    sx={{ display: "flex", alignItems: "center" }}
                    fontWeight={600}
                  >
                    <CreditCardIcon pr={1} /> Amazon Pay ICICI Bank Credit Card
                    ending in 1005
                  </Typography>
                </Box> */}
              </Grid>
              <Grid lg={4} md={4} xs={12} sx={{ paddingTop: "0" }}>
                <Box>
                  <Typography fontSize={16} fontWeight={700}>
                    Order Summary
                  </Typography>
                  <Typography component="div">
                    <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography width={"50%"} fontWeight={600}>
                        Item(s) SubTotal:
                      </Typography>
                      <Typography width={"50%"} fontWeight={600}>
                        {currency?.symbol}{(orderDetail?.sales_details?.reduce((a,b)=>{return a + (b?.amount - b?.couponDiscountAmount)},0) * currency?.rate).toFixed(2)}
                      </Typography>
                    </Typography>
                    <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography width={"50%"} fontWeight={600}>
                        Shipping:
                      </Typography>
                      <Typography width={"50%"} fontWeight={600}>
                        {currency?.symbol}{(orderDetail?.sales_details?.reduce((a,b)=>{return a + b?.shippingAmount},0)* currency?.rate).toFixed(2)}
                      </Typography>
                    </Typography>
                    {
                      orderDetail?.voucher_dicount > 0 && (
                          <Typography
                            component="div"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <Typography width={"50%"} fontWeight={600}>
                              Voucher Discount:
                            </Typography>
                            <Typography width={"50%"} fontWeight={600}>
                              - {currency?.symbol}{(orderDetail?.voucher_dicount * currency?.rate).toFixed(2)}
                            </Typography>
                          </Typography>
                      )
                    }
                    {/* <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography width={"50%"} fontWeight={600}>
                        Total:
                      </Typography>
                      <Typography width={"50%"} fontWeight={600}>
                        {currency?.symbol}
                        {((
                          orderDetail?.sales_details?.reduce((a, b) => a + (b?.amount + b?.shippingAmount - b?.couponDiscountAmount), 0) - orderDetail?.voucher_dicount
                        ), currency?.rate).toFixed(2)}
                      </Typography>
                    </Typography> */}
                    {/* <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography width={"50%"} fontWeight={600}>
                        Promotion Applied:
                      </Typography>
                      <Typography width={"50%"} fontWeight={600}>
                        -{currency?.symbol}{(orderDetail?.discount * currency?.rate).toFixed(2)}
                      </Typography>
                    </Typography> */}
                    <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography width={"50%"} fontWeight={700}>
                        Grand Total:
                      </Typography>
                      <Typography width={"50%"} fontWeight={700}>
                        {currency?.symbol}{(orderDetail?.sales_details?.reduce((a,b)=>{return a + (b?.amount - b?.couponDiscountAmount + b?.shippingAmount)},0) - orderDetail?.voucher_dicount * currency?.rate).toFixed(2)}
                      </Typography>
                    </Typography>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box
            p={2}
            mt={4}
            sx={{ border: "1px solid #dbdbdb", borderRadius: "5px" }}
          >
            {/* <Typography component="div" mb={2}>
              <H2 fontWeight={600}>Delivered today</H2>
              <Typography>Package was handed to resident</Typography>
            </Typography> */}

            {orderDetail?.sales_details.map((product, i) => {
              return (
                <Grid
                  key={product._id}
                  container
                  spacing={2}
                  sx={{ margin: "0", width: "100%", marginBottom: "30px" }}
                >
                  <Grid lg={8} md={6} xs={12} sx={{ paddingTop: "0" }}>
                    <Box mb={2} sx={{ display: "flex" }}>
                      <Box
                        sx={{
                          position: "relative",
                        }}
                        style={{
                          height: "130px",
                          width: "130px",
                        }}
                      >
                        <img
                          alt="banner"
                          style={{
                            width: "130px",
                            height: "130px",
                            objectFit: "cover",
                          }}
                          src={baseUrl + product?.productData?.image[0]}
                        />
                        {product.qty > 0 ? (
                          <Box
                            sx={{
                              position: "absolute",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              border: "1px solid gray",
                              background: "white",
                              bottom: "4px",
                              right: "4px",
                            }}
                          >
                            <Typography fontWeight={600}>
                              {product?.qty}
                            </Typography>
                          </Box>
                        ) : (
                          ""
                        )}
                      </Box>

                      <Typography component="div" ml={4}>
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
                            href={`/products?id=${product?.product_id}`}
                            style={{
                              fontWeight: "500",
                              color: "#0a8369",
                              textDecoration: "none",
                            }}
                          >
                            {product?.productData?.product_title?.replace(
                              /<\/?[^>]+(>|$)/g,
                              ""
                            )}
                          </Link>
                        </Typography>
                        {product?.isCombination && (
                          <>
                            {product?.variantData?.map((variant, index) => (
                              <Typography fontSize={17} color="gray" key={`variant-${index}`}>
                                {variant?.variant_name}:{" "}
                                <Typography fontSize={17} component="span">
                                  {product?.variantAttributeData?.[index]?.attribute_value || "N/A"}
                                </Typography>
                              </Typography>
                            ))}
                          </>
                        )}
                        {
                          product?.customize == "Yes" && (
                            <>
                              {
                                product?.customizationData?.map((item, index) => (
                                  <div key={index}>
                                    {Object.entries(item).map(([key, value]) => (
                                      <div key={key}>
                                        {typeof value === 'object' ? (
                                          <div>
                                            {key}:{`${value?.value} (${currency?.symbol} ${(value?.price * currency?.rate).toFixed(2)})`}
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
                          Sold by: {product?.vendor_name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "16px",
                            color: "#be0f0f",
                            fontWeight: "500",
                          }}
                        >
                          {currency?.symbol}{(product?.productData?.sale_price * currency?.rate).toFixed(2)}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid
                    lg={4}
                    md={6}
                    xs={12}
                    sx={{
                      paddingTop: "0",
                      paddingLeft: { lg: "50px", md: "40px", xs: "0" },
                      marginTop: { lg: "0", md: "0", xs: "30px" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: {
                          lg: "flex-end",
                          md: "flex-end",
                          xs: "flex-start",
                        },
                      }}
                    >
                      <Typography
                        component="div"
                        sx={{
                          marginTop: {
                            lg: "0",
                            md: "0",
                            xs: "12px",
                          },
                        }}
                      >
                        {product.delivery_status !== "No tracking" ? (
                          <Button
                            variant="contained"
                            sx={{
                              marginBottom: "16px",
                              background: "#fff",
                              borderRadius: "30px",
                              border: "1px solid #000",
                              width: "100%",
                            }}
                          >
                            Track package
                          </Button>
                        ) : (
                          ""
                        )}

                        {product.order_status == "completed" &&
                          product.delivery_status == "Delivered" && (
                            <Button
                              variant="contained"
                              sx={{
                                background: "#fff",
                                borderRadius: "30px",
                                border: "1px solid #000",
                                width: "100%",
                                marginTop: "12px",
                              }}
                            >
                              Write Product review
                            </Button>
                          )}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              );
            })}
          </Box>
        </Box>
      </SectionCreator>
    </>
  );
};

export default OrderDetails;
