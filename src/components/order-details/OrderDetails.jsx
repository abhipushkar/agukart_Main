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
import { Flag as FlagIcon, ExpandMore as ExpandMoreIcon, LocalOffer as LocalOfferIcon } from "@mui/icons-material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Alert, CircularProgress, Rating, Avatar, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Accordion, AccordionDetails, AccordionSummary, TextareaAutosize } from "@mui/material";
import { useToast } from "react-toastify";
import { useToasts } from "react-toast-notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCurrency } from "contexts/CurrencyContext";
import LightPopover from "components/TooltipPopover/LightPopover";
import TrackingPopup from "pages-sections/customer-dashboard/orders/page-view/TrackingPopup";
import ReviewPopup from "pages-sections/customer-dashboard/orders/page-view/ReviewPopup";
import parse from 'html-react-parser';
import {
  Divider,
  Chip,
  Paper,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from "@mui/material";
import MessagePopup from "pages-sections/customer-dashboard/orders/page-view/MessagePopup";

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
  const { currency } = useCurrency();
  const baseUrl = 'https://api.agukart.com/uploads/product/';
  const [orderDetail, setOrderDetail] = useState(null);
  console.log(orderDetail, "---------orderDetail");
  // Add these state variables at the top of your component
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { addToast } = useToasts();

  const { token } = useAuth();

  const searchParams = useSearchParams();

  const sub_order_id = searchParams.get("sub-order-id");

  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [messageProduct, setMessageProduct] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [reviewId, setReviewId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [initialReviewData, setInitialReviewData] = useState(null);
  const [shopName, setShopName] = useState("");
  const [shopBaseUrl, setShopBaseUrl] = useState("https://api.agukart.com/uploads/");
  const [trackOpen, setTrackOpen] = useState(false);
  const [openMessagePopup, setOpenMessagePopup] = useState(false);

  const getOrderDetail = async () => {
    try {
      const res = await getAPIAuth(`user/getOrderDetail/${sub_order_id}`, token);
      console.log(res, "order detail fetchhhhhhhhhhh");
      if (res.status === 200) {
        let order = res.data.data;
        order = { ...order.order, ...order };
        setOrderDetail(order);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle Open Review (Create Mode)
  const handleOpenReview = (product, vendorId, shopName) => {
    setReviewProduct(product);
    setIsEditMode(false);
    setReviewId(product?._id || product?.saleDetailId);
    setVendorId(vendorId);
    setShopName(shopName);
    setInitialReviewData(null);
    setReviewPopupOpen(true);
  };


  // Handle Open Edit Review (Edit Mode)
  const handleOpenEditReview = (product, reviewData, vendorId, shopName) => {
    if (!reviewData) {
      addToast("No review found to edit", { appearance: "error", autoDismiss: true });
      return;
    }

    // Prepare initial data for edit mode
    const initialEditData = {
      rating: reviewData.rating || 0,
      recommend: reviewData.recommended ?? null,
      itemQuality: reviewData.item_rating || 0,
      delivery: reviewData.delivery_rating || 0,
      customerService: reviewData.customer_service_rating || 0,
      review: reviewData.additional_comment || '',
      photos: [],
      photoUrls: reviewData.images?.map(img => `https://api.agukart.com/uploads/ratings/${img}`) || [],
      existingImageNames: reviewData.images || []
    };

    setReviewProduct(product);
    setReviewId(reviewData._id);
    setVendorId(vendorId);
    setShopName(shopName);
    setIsEditMode(true);
    setInitialReviewData(initialEditData);
    setReviewPopupOpen(true);
  };

  // Handle Close Popup
  const handleCloseReviewPopup = () => {
    setReviewPopupOpen(false);
    setIsEditMode(false);
    setReviewProduct(null);
    setReviewId("");
    setVendorId("");
    setInitialReviewData(null);
    setShopName("");
  };

  // Handle Review Success
  const handleReviewSuccess = () => {
    // Refresh order details to get updated review data
    getOrderDetail();
    addToast("Review saved successfully", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const handleCloseMessage = () => {
    setOpenMessagePopup(false);
    setMessageProduct(null)
  };

  const orderTotals = useMemo(() => {
    const vendorItems = orderDetail?.items || [];
    if (!vendorItems.length) return { subTotal: 0, shippingTotal: 0, itemTotal: 0, grandTotal: 0, paypalAmount: 0 };
    const subTotal = vendorItems.reduce((a, b) => a + (b.original_price * b.qty || 0), 0);
    const promotionalDiscount = vendorItems.reduce((a, b) => a + (b.promotional_discount || 0), 0);
    const couponDiscount = vendorItems[0].couponDiscountAmount || 0;
    const shippingTotal = vendorItems[0].shippingAmount || 0;
    const itemTotal = vendorItems.reduce((a, b) => a + (b.amount || 0), 0) + shippingTotal - couponDiscount;
    const grandTotal = itemTotal;
    const voucherDiscount = vendorItems.reduce((a, b) => a + (b.voucherDiscountAmount || 0), 0);
    const walletAmount = vendorItems.reduce((a, b) => a + (b.suborder_wallet_used || 0), 0);
    return {
      subTotal: subTotal.toFixed(2),
      shippingTotal: shippingTotal.toFixed(2),
      itemTotal: itemTotal.toFixed(2),
      suborderTotal: grandTotal.toFixed(2),
      promotionalDiscount: promotionalDiscount.toFixed(2),
      couponDiscount: couponDiscount.toFixed(2),
      voucherDiscount: voucherDiscount.toFixed(2),
      walletAmount: walletAmount.toFixed(2),
      grandTotal: (grandTotal - voucherDiscount).toFixed(2)
    };
  }, [orderDetail]);

  const RefundTotals = useMemo(() => {
    const items = orderDetail?.items || [];
    if (!items.length) return { itemsRefund: 0, shippingRefund: 0, voucherRefund: 0, couponRefund: 0, totalRefund: 0 };
    const itemsRefund = items.reduce((a, b) => a + (b.refunded_cash_amount), 0);
    const shippingRefund = items.reduce((a, b) => a + (b.shipping_refunded_amount || 0), 0);
    const voucherRefund = items[0].voucher_refunded_amount || 0;
    const couponRefund = items[0].coupon_refunded_amount || 0;
    const totalRefund = itemsRefund + shippingRefund - voucherRefund - couponRefund;

    return {
      itemsRefund: itemsRefund.toFixed(2),
      shippingRefund: shippingRefund.toFixed(2),
      voucherRefund: voucherRefund.toFixed(2),
      couponRefund: couponRefund.toFixed(2),
      totalRefund: totalRefund.toFixed(2)
    };

  }, [orderDetail]);

  useEffect(() => {
    getOrderDetail();
  }, [sub_order_id]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "...";
    let date;
    if (typeof timestamp === "number" || !isNaN(Number(timestamp))) {
      if (timestamp.toString().length === 10) timestamp = timestamp * 1000;
      date = new Date(Number(timestamp));
    } else { date = new Date(timestamp); }
    if (isNaN(date.getTime())) return "...";
    try {
      return new Intl.DateTimeFormat("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric", timeZone: "America/Los_Angeles" }).format(date);
    } catch { return "..."; }
  };

  const date = new Date(orderDetail?.createdAt);
  const hasReviews = orderDetail?.items?.some(item => item.rating || item.rating?.buyer_note?.note);
  const deliveryStatus = orderDetail?.items?.[0]?.delivery_status === "No tracking"
    ? { tracking: false, status: "Getting ready to dispatch" } : { tracking: true, status: orderDetail?.items?.[0]?.delivery_status };

  const shippingName = orderDetail?.items[0].deliveryData.shippingName;

  const deliveryDates = useMemo(() => {
    if (!orderDetail?.items[0]?.deliveryData.minDate || !orderDetail?.items[0]?.deliveryData?.maxDate) {
      return { minDate: "...", maxDate: "..." };
    }
    const formatDeliveryDate = (dateString) => {
      try {
        return new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
      } catch { return "..."; }
    };
    return {
      minDate: formatDeliveryDate(orderDetail.items[0].deliveryData.minDate),
      maxDate: formatDeliveryDate(orderDetail.items[0].deliveryData.maxDate)
    };
  }, [orderDetail]);

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
          <Box display={'flex'} justifyContent={'space-between'} pb={2}>
            <Typography variant="h4" fontWeight={600}>
              Order Details
            </Typography>

            <Box display={'flex'} gap={1}>
              {orderDetail?.items[0].delivery_status !== "No tracking" && orderDetail?.items[0].order_status === 'completed' && (
                <Button
                  variant="outlined"
                  sx={{ borderRadius: "30px", borderColor: "#000", color: "#000", px: 3 }}
                  onClick={() => setTrackOpen(true)}
                >
                  Track package
                </Button>
              )}
              <Button
                variant="outlined"
                sx={{ borderRadius: "30px", borderColor: "#000", color: "#000", px: 3 }}
                onClick={() => setOpenMessagePopup(true)}>
                Help with Order
              </Button>
            </Box>
          </Box>
          {/* Order Header */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={7}>
                <Typography fontWeight={600}>
                  Order on {date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
                <Typography fontWeight={600} fontSize={17}>
                  Order # {orderDetail?.sub_order_id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={5} sx={{ display: "flex", flexDirection: "column", alignItems: 'start', gap: 2, flexWrap: "wrap" }}>
                <Typography fontSize={16} fontWeight={500} color="initial"><span style={{ color: 'GrayText' }}>Status: </span>{deliveryStatus.status}</Typography>
                <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 2, flexWrap: "wrap" }}>
                  <LightPopover
                    title={
                      <Button onClick={() => addToast("Please Wait", { appearance: "success", autoDismiss: true })}>
                        Printable order summary
                      </Button>
                    }
                  >
                    <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                      <Typography fontSize={15} fontWeight={500} sx={{ color: "#ad1414" }}>
                        invoice
                      </Typography>
                      <ArrowDropDownIcon />
                    </Box>
                  </LightPopover>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Shipping Address */}
          {/* <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid #e0e0e0", borderRadius: 2, display: 'flex' }}>
            <Box>
            </Box>
            <Box>
              <Typography fontSize={16} fontWeight={700} mb={1.5}>
                Shipping Address
              </Typography>
              <Typography fontWeight={600} sx={{ textTransform: "capitalize" }}>
                {orderDetail?.name}
              </Typography>
              <Typography>{orderDetail?.address_line1}</Typography>
              {orderDetail?.address_line2 && <Typography>{orderDetail?.address_line2}</Typography>}
              <Typography sx={{ textTransform: "uppercase" }}>
                {orderDetail?.city}, {orderDetail?.state} {orderDetail?.pincode} {orderDetail?.country}
              </Typography>
            </Box>
          </Paper> */}

          <Grid container width={"100%"} m={0} py={1} mb={2} spacing={2} component={Paper}>
            <Grid lg={7} md={6} sm={12} xs={12}>
              <Box p={1.5}>
                <Typography fontSize={18} fontWeight={600}>Order summary</Typography>
                <Grid container width={"100%"} m={0} spacing={2}>
                  <Grid lg={7} md={7} sm={7} xs={12}>
                    <List>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                        <Typography fontWeight={500} sx={{ width: "30%" }}>Purchase date:</Typography>
                        <Typography fontWeight={600} sx={{ width: "70%" }}>{formatDate(orderDetail?.createdAt)}</Typography>
                      </ListItem>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                        <Typography fontWeight={500} sx={{ width: "30%" }}>Ship by:</Typography>
                        <Typography fontWeight={600} color={"#e2912c"} sx={{ width: "70%" }}>{deliveryDates.minDate} to {deliveryDates.maxDate}</Typography>
                      </ListItem>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                        <Typography fontWeight={500} sx={{ width: "30%" }}>Deliver by:</Typography>
                        <Typography fontWeight={600} sx={{ width: "70%" }}>{deliveryDates.minDate} to {deliveryDates.maxDate}</Typography>
                      </ListItem>
                      {orderDetail.items[0].delivered_date && (<ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                        <Typography fontWeight={500} sx={{ width: "30%" }}>Delivered date:</Typography>
                        <Typography fontWeight={600} sx={{ width: "70%" }}>
                          {orderDetail?.items?.[0]?.delivered_date ? formatDate(orderDetail.items[0].delivered_date) : "..."}
                        </Typography>
                      </ListItem>)}
                    </List>
                  </Grid>
                  <Grid lg={5} md={5} sm={5} xs={12}>
                    <List>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                        <Typography fontWeight={500} sx={{}}>Shipping services:</Typography>
                        <Typography fontWeight={600} sx={{ textTransform: 'capitalize', pl: 1 }}> {shippingName}</Typography>
                      </ListItem>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center" }}>
                        <Typography fontSize={14} mt={1}>
                          Store: <Box fontWeight={600} component={'span'} ml={1}>
                            <Link
                              href={`/store/${orderDetail?.vendor?.slug}`}
                              style={{
                                color: "#3b66cb",
                                fontSize: "15px",
                                textDecoration: "none",
                              }}

                            >{orderDetail?.vendor.shop_name || "..."}</Link>
                          </Box>
                        </Typography>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid py={2} lg={5} md={6} sm={12} xs={12} sx={{ paddingLeft: { lg: "20px", md: "20px" }, borderLeft: { md: '1px solid #ddd' } }}>
              <Box>
                <Typography fontSize={18} fontWeight={600}>Shipping Address</Typography>
                <Grid container width={"100%"} m={0} spacing={1}>
                  <Grid lg={6} md={4} sm={4} xs={12}>
                    <Box mt={2}>
                      <Typography fontSize={15}>{(orderDetail?.receiver_name)}</Typography>
                      <Typography>{(orderDetail?.address_line1)}</Typography>
                      <Typography>{(orderDetail?.address_line2)}</Typography>
                      <Typography>{(orderDetail?.city)}, {(orderDetail?.state)} {(orderDetail?.pincode)}</Typography>
                      <Typography>{(orderDetail?.country)}</Typography>
                      <Typography fontSize={15} fontWeight={500}>Mob. No.: {`${(orderDetail?.phone_code)} ${(orderDetail?.mobile)}`}</Typography>
                    </Box>
                  </Grid>
                  <Grid lg={6} md={8} sm={8} xs={12}>
                    <List>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center", whiteSpace: "normal", paddingBottom: "0" }}>
                        <Typography fontWeight={501}>Buyer Name:</Typography>
                        <Typography fontWeight={500} pl={1} color={"green"}>{(orderDetail?.name)}</Typography>
                      </ListItem>
                      <ListItem sx={{ paddingLeft: "0", width: "auto", display: "flex", alignItems: "center", whiteSpace: "normal", paddingBottom: "0" }}>

                        <Typography fontWeight={500}>Buyer Email: {(orderDetail?.email)}</Typography>
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>

          {/* Products Grid */}
          <Typography variant="h6" fontWeight={600} mb={2}>
            Products
          </Typography>
          <Grid container spacing={2}>
            {orderDetail?.items?.map((product, i) => {
              const productData = product?.productData || {};
              const productTitle = parse(productData.product_title || "");
              const productImage = productData.image?.[0] || "";

              return (
                <Grid item xs={12} key={product._id}>
                  <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      {/* Product Image */}
                      <Grid item xs={4} sm={3} md={2}>
                        <Box sx={{
                          position: "relative",
                          width: "100%",
                          pt: "100%",
                          bgcolor: "#fafafa",
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid #eee"
                        }}>
                          {productImage ? (
                            <img
                              src={`${baseUrl}${productImage}`}
                              alt={productTitle}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <Box sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}>
                              <Typography color="text.secondary">No image</Typography>
                            </Box>
                          )}
                          {product?.qty > 1 && (
                            <Chip
                              label={`x${product.qty}`}
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 4,
                                right: 4,
                                bgcolor: "rgba(0,0,0,0.8)",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            />
                          )}
                        </Box>
                      </Grid>

                      {/* Product Details */}
                      <Grid item xs={8} sm={5} md={6}>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{
                            color: "#0a8369",
                            fontSize: { xs: "15px", sm: "18px" },
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          <Link
                            href={product.productData.product_code ? `/product/${product?.productData.slug}/${product?.productData.product_code}` : `/products/${product?.product_id}`}
                            style={{ color: "#0a8369", textDecoration: "none" }}
                          >
                            {productTitle}
                          </Link>
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                          Transaction ID: <Box component="span" ml={1} fontWeight={500}>{product?.item_id}</Box>
                        </Typography>

                        {/* Variants */}
                        {product?.variantData?.length > 0 && product?.variantData?.map((variant, index) => (
                          <Typography variant="body2" key={`variant-${index}`} sx={{ mt: 0.5 }}>
                            {variant?.variant_name}:{" "}
                            <Box component="span" fontWeight={500}>
                              {product?.variantAttributes?.[index]?.attribute_value || "N/A"}
                            </Box>
                          </Typography>
                        ))}

                        {product?.variants && product.variants.length > 0 && (
                          product.variants.map((variant, index) => (
                            <Typography variant="body2" sx={{ mt: 0.5 }} key={variant._id || index}>
                              {variant.variantName}:{" "}
                              <Box component="span" fontWeight={500}>
                                {variant.attributeName}
                              </Box>
                            </Typography>
                          ))
                        )}

                        {/* Customizations */}
                        {product?.customizationData?.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {product?.customizationData?.map((item, index) => (
                              <div key={index}>
                                {Object.entries(item).map(([key, value]) => (
                                  <Typography variant="body2" key={key} mt={0.5}>
                                    {key}: <Box component="span" fontWeight={500}>{typeof value === "object" ? value?.value : value}</Box>
                                  </Typography>
                                ))}
                              </div>
                            ))}
                          </Box>
                        )}

                        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} gap={1}>
                          <Button
                            onClick={() => { setMessageProduct(product); setOpenMessagePopup(true); }}
                            variant="contained"
                            size="small"
                            sx={{
                              bgcolor: "#efe8bd",
                              
                              borderRadius: "30px",
                              px: 3,
                              mt: 1.5,
                              '&:hover': { bgcolor: "#ebe3b3" }
                            }}
                          >
                            Help with Item
                          </Button>
                          {/* Write Review Button */}
                          {!product?.ratingStatus && product.delivery_status == "Delivered" && (

                            <Button
                              onClick={() => {
                                handleOpenReview(
                                  product?.productData || product,
                                  product?.vendor_id,
                                  product?.vendor_name
                                );
                              }}
                              variant="contained"
                              size="small"
                              sx={{
                                bgcolor: "#000",
                                color: "#fff",
                                borderRadius: "30px",
                                px: 3,
                                mt: 1.5,
                                '&:hover': { bgcolor: "#333" }
                              }}
                            >
                              Write Product review
                            </Button>
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4} md={3} ml={{ md: "auto" }}>
                        <List>
                          <ListItem sx={{ padding: "0" }}>
                            <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                              <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                <Typography color={"#000"} fontSize={15}>Item subtotal:</Typography>
                                <Box color={"#000"} fontSize={15}>${((product?.original_price || 0) * (product?.qty || 0)).toFixed(2)}</Box>
                              </Box>
                              {product?.promotional_discount > 0 && (
                                <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                  <Typography color={"#32be19"} fontSize={13} sx={{ display: "flex", alignItems: "center" }}>
                                    <LocalOfferIcon sx={{ marginRight: "4px", fontSize: "18px", transform: "rotate(115deg)" }} />
                                    {`${product?.promotionData?.promotional_title} (${product?.promotionData?.offer_type === "percentage" ? (product?.promotionData?.discount_amount) + "%" : "$" + (product?.promotionData?.discount_amount)} off)`}:
                                  </Typography>
                                  <Box color={"red"} fontSize={13}>- ${(product?.promotional_discount || 0).toFixed(2)}</Box>
                                </Box>
                              )}

                            </Box>
                          </ListItem>
                          <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                            <Box pb={1} sx={{ width: "100%", borderBottom: "2px solid #d9d9d9" }}>
                              <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                <Typography color={"#000"} fontSize={15}>Sub Total:</Typography>
                                <Box color={"#000"} fontSize={15}>${((product?.amount || 0)).toFixed(2)}</Box>
                              </Box>

                              <Box pt={1} sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                                <Typography color={"#000"} fontSize={15}>Tax:</Typography>
                                <Box color={"#000"} fontSize={15}>$0</Box>
                              </Box>
                            </Box>
                          </ListItem>
                          <ListItem sx={{ padding: "0", marginTop: "10px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                              <Typography color={"#000"} fontSize={15} fontWeight={600}>Item Total:</Typography>
                              <Box color={"#000"} fontSize={15} fontWeight={600}>${(product?.amount || 0).toFixed(2)}</Box>
                            </Box>
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {/* Order Summary & Reviews - Desktop View */}
          <Box sx={{ display: { xs: "none", md: "block" }, mt: 3 }}>
            <Grid container spacing={3}>
              {/* Order Summary */}
              <Grid item md={RefundTotals.totalRefund > 0 ? hasReviews ? 3 : 6 : 6}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                  <Typography fontSize={16} fontWeight={700} mb={2}>
                    Order Summary
                  </Typography>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Item(s) SubTotal:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(orderDetail?.items.reduce((a, b) => a + b.amount, 0) * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Shipping:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(orderTotals.shippingTotal * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                    {orderTotals.couponDiscount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Coupon Discount:</Typography>
                        <Typography fontWeight={600} sx={{ color: "red" }}>
                          - {currency?.symbol}{(orderTotals.couponDiscount * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {orderTotals.voucherDiscount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Voucher Discount:</Typography>
                        <Typography fontWeight={600} sx={{ color: "red" }}>
                          - {currency?.symbol}{(orderTotals.voucherDiscount * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography fontWeight={700}>Grand Total:</Typography>
                      <Typography fontWeight={700}>
                        {currency?.symbol}{(orderTotals.grandTotal * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                    {orderTotals.walletAmount > 0 && (<>
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Paid via Wallet:</Typography>
                        <Typography fontWeight={600}>
                          {currency?.symbol}{(orderTotals.walletAmount * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Paid via Paypal:</Typography>
                        <Typography fontWeight={600}>
                          {currency?.symbol}{((orderTotals.grandTotal - orderTotals.walletAmount) * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    </>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {RefundTotals.totalRefund > 0 && (<Grid item md={hasReviews ? 4 : 6}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                  <Typography fontSize={16} fontWeight={700} mb={2}>
                    Refund Summary
                  </Typography>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Item(s) Refund:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(RefundTotals.itemsRefund * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                    {RefundTotals.shippingRefund > 0 && (<Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Shipping Refund:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(RefundTotals.shippingRefund * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>)}
                    {RefundTotals.couponRefund > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Shop Coupon Adjustment:</Typography>
                        <Typography fontWeight={600} sx={{ color: "red" }}>
                          - {currency?.symbol}{(RefundTotals.couponRefund * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {RefundTotals.voucherRefund > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Agukart Voucher Adjustment:</Typography>
                        <Typography fontWeight={600} sx={{ color: "red" }}>
                          - {currency?.symbol}{(RefundTotals.voucherRefund * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography fontWeight={700}>Total Refunded Amount:</Typography>
                      <Typography fontWeight={700}>
                        {currency?.symbol}{(RefundTotals.totalRefund * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>)}

              {/* Reviews - Desktop */}
              <Grid item md={5}>
                {hasReviews && (
                  <Paper elevation={0} sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                    <Typography fontSize={16} fontWeight={700} mb={2}>
                      Your Reviews
                    </Typography>
                    {orderDetail?.items?.map((product) => {
                      const reviewHidden = product.rating?.is_hidden;
                      const review = reviewHidden ? null : product.rating;
                      const reviewNote = product.rating?.buyer_note?.note ? product.rating?.buyer_note?.note : null;

                      if (!review && !reviewNote) return null;

                      return (
                        <Box key={product._id} sx={{ mb: 2, bgcolor: "#f8f7f3", borderRadius: 2, p: 2, border: "1px solid #ece8dc" }}>
                          {!reviewHidden && review && (
                            <>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Typography fontWeight={600} fontSize={14}>Your Review</Typography>
                                  <Typography variant="caption" color="GrayText">Item: {product.item_id}</Typography>
                                  <Rating
                                    value={review?.rating}
                                    readOnly
                                    size="small"
                                    sx={{ color: "#000", "& .MuiRating-iconEmpty": { color: "#000" } }}
                                  />
                                </Box>
                                {review?.recommended && (
                                  <Chip
                                    label="✓ Recommended"
                                    size="small"
                                    sx={{ bgcolor: "#e8f5e9", color: "#68be6c" }}
                                  />
                                )}
                              </Box>

                              {review?.images?.length > 0 && (
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                                  {review?.images.map((url, i) => (
                                    <Box key={i} sx={{ width: 56, height: 56, borderRadius: 1, overflow: "hidden", border: "1px solid #ddd" }}>
                                      <img src={`https://api.agukart.com/uploads/ratings/${url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </Box>
                                  ))}
                                </Box>
                              )}

                              <Typography sx={{ color: "#4d4d4d", fontSize: 14, lineHeight: 1.6, mb: 1 }}>
                                {review?.additional_comment}
                              </Typography>

                              <Typography
                                onClick={() => {
                                  if (review?.is_locked) {
                                    addToast("This review is locked and cannot be edited", {
                                      appearance: "error",
                                      autoDismiss: true
                                    });
                                    return;
                                  }
                                  handleOpenEditReview(
                                    product?.productData || product,
                                    review,
                                    product?.vendor_id,
                                    product?.vendor_name
                                  );
                                }}
                                sx={{
                                  color: review?.is_locked ? "#b5b5b5" : "#666",
                                  fontSize: 13,
                                  textDecoration: "underline",
                                  cursor: review?.is_locked ? "not-allowed" : "pointer",
                                  width: "fit-content",
                                  opacity: review?.is_locked ? 0.6 : 1,
                                  pointerEvents: review?.is_locked ? "none" : "auto"
                                }}
                              >
                                {review?.is_locked ? "You cannot edit this review" : "Edit review"}
                              </Typography>

                              {review?.seller_reply?.message && (
                                <Box sx={{ mt: 2, bgcolor: "#fff", border: "1px solid #ececec", borderRadius: 2, p: 1.5 }}>
                                  <Box sx={{ display: "flex", gap: 1.5 }}>
                                    <Avatar
                                      src={review?.replyShopIcon ? shopBaseUrl + review?.replyShopIcon : undefined}
                                      alt="Shop"
                                      sx={{ width: 32, height: 32 }}
                                    >
                                      A
                                    </Avatar>
                                    <Box>
                                      <Typography fontWeight={600} fontSize={13}>
                                        {review?.replyShopName}
                                        <Typography component="span" sx={{ color: "#666", fontWeight: 400, ml: 1, fontSize: 12 }}>
                                          responded on {new Date(review?.seller_reply?.replied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || ""}
                                        </Typography>
                                      </Typography>
                                      <Typography sx={{ mt: 0.5, color: "#555", fontSize: 13 }}>{review?.seller_reply?.message}</Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            </>
                          )}

                          {reviewNote && (
                            <Alert severity="info" sx={{ fontSize: 13, color: "#5b4b20", bgcolor: "lightyellow", mt: 1 }}>
                              <strong>Note from Agukart:</strong> {reviewNote}
                            </Alert>
                          )}
                        </Box>
                      );
                    })}
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Mobile/Tablet Accordion View */}
          <Box sx={{ display: { xs: "block", md: "none" }, mt: 3 }}>
            {/* Order Summary Accordion */}
            <Accordion sx={{ borderRadius: 2, mb: 2, border: "1px solid #e0e0e0" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight={600}>Order Summary</Typography>
                <Box sx={{ ml: "auto", mr: 2 }}>
                  <Typography fontWeight={700} color="primary">
                    {currency?.symbol}{(orderTotals.grandTotal * currency?.rate).toFixed(2)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography>Item(s) SubTotal:</Typography>
                    <Typography fontWeight={600}>
                      {currency?.symbol}{(orderDetail?.items.reduce((a, b) => a + b.amount, 0) * currency?.rate).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography>Shipping:</Typography>
                    <Typography fontWeight={600}>
                      {currency?.symbol}{(orderTotals.shippingTotal * currency?.rate).toFixed(2)}
                    </Typography>
                  </Box>
                  {orderDetail?.order.coupon_discount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Coupon Discount:</Typography>
                      <Typography fontWeight={600} sx={{ color: "red" }}>
                        - {currency?.symbol}{(orderDetail?.order.coupon_discount * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  {orderTotals.voucherDiscount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Voucher Discount:</Typography>
                      <Typography fontWeight={600} sx={{ color: "red" }}>
                        - {currency?.symbol}{(orderTotals.voucherDiscount * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                    <Typography fontWeight={700}>Grand Total:</Typography>
                    <Typography fontWeight={700}>
                      {currency?.symbol}{(orderTotals.grandTotal * currency?.rate).toFixed(2)}
                    </Typography>
                  </Box>
                  {orderTotals.walletAmount > 0 && (<>
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Paid via Wallet:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(orderTotals.walletAmount * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Paid via Paypal:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{((orderTotals.grandTotal - orderTotals.walletAmount) * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                  </>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {RefundTotals.totalRefund > 0 && (
              <Accordion sx={{ borderRadius: 2, mb: 2, border: "1px solid #e0e0e0" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>Refund Summary</Typography>
                  <Box sx={{ ml: "auto", mr: 2 }}>
                    <Typography fontWeight={700} color="primary">
                      {currency?.symbol}{(RefundTotals.totalRefund * currency?.rate).toFixed(2)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Item(s) Refund:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(RefundTotals.itemsRefund * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                    {RefundTotals.shippingRefund > 0 && (<Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography>Shipping Refund:</Typography>
                      <Typography fontWeight={600}>
                        {currency?.symbol}{(RefundTotals.shippingRefund * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>)}
                    {RefundTotals.couponRefund > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Shop Coupon Adjustment:</Typography>
                        <Typography fontWeight={600} sx={{ color: "red" }}>
                          - {currency?.symbol}{(RefundTotals.couponRefund * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    {RefundTotals.voucherRefund > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                        <Typography>Agukart Voucher Adjustment:</Typography>
                        <Typography fontWeight={600} sx={{ color: "red" }}>
                          - {currency?.symbol}{(RefundTotals.voucherRefund * currency?.rate).toFixed(2)}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                      <Typography fontWeight={700}>Total Refunded Amount:</Typography>
                      <Typography fontWeight={700}>
                        {currency?.symbol}{(RefundTotals.totalRefund * currency?.rate).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>)}

            {/* Reviews Accordion */}
            {orderDetail?.items?.some(item => item.rating || item.rating?.buyer_note?.note) && (
              <Accordion sx={{ borderRadius: 2, border: "1px solid #e0e0e0" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>Your Reviews</Typography>
                  <Chip
                    label={`${orderDetail?.items?.filter(item => item.rating).length} review(s)`}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  {orderDetail?.items?.map((product) => {
                    const reviewHidden = product.rating?.is_hidden;
                    const review = reviewHidden ? null : product.rating;
                    const reviewNote = product.rating?.buyer_note?.note ? product.rating?.buyer_note?.note : null;

                    if (!review && !reviewNote) return null;

                    return (
                      <Box key={product._id} sx={{ mb: 2, bgcolor: "#f8f7f3", borderRadius: 2, p: 2, border: "1px solid #ece8dc" }}>
                        {!reviewHidden && review && (
                          <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography fontWeight={600} fontSize={14}>Your Review</Typography>
                                <Rating
                                  value={review?.rating}
                                  readOnly
                                  size="small"
                                  sx={{ color: "#000", "& .MuiRating-iconEmpty": { color: "#000" } }}
                                />
                              </Box>
                              <Typography variant="caption" color="GrayText">Transaction: {product.item_id}</Typography>
                              {review?.recommended && (
                                <Chip
                                  label="✓ Recommended"
                                  size="small"
                                  sx={{ bgcolor: "#e8f5e9", color: "#68be6c" }}
                                />
                              )}
                            </Box>

                            {review?.images?.length > 0 && (
                              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                                {review?.images.map((url, i) => (
                                  <Box key={i} sx={{ width: 56, height: 56, borderRadius: 1, overflow: "hidden", border: "1px solid #ddd" }}>
                                    <img src={`https://api.agukart.com/uploads/ratings/${url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  </Box>
                                ))}
                              </Box>
                            )}

                            <Typography sx={{ color: "#4d4d4d", fontSize: 14, lineHeight: 1.6, mb: 1 }}>
                              {review?.additional_comment}
                            </Typography>

                            <Typography
                              onClick={() => {
                                if (review?.is_locked) {
                                  addToast("This review is locked and cannot be edited", {
                                    appearance: "error",
                                    autoDismiss: true
                                  });
                                  return;
                                }
                                handleOpenEditReview(
                                  product?.productData || product,
                                  review,
                                  product?.vendor_id,
                                  product?.vendor_name
                                );
                              }}
                              sx={{
                                color: review?.is_locked ? "#b5b5b5" : "#666",
                                fontSize: 13,
                                textDecoration: "underline",
                                cursor: review?.is_locked ? "not-allowed" : "pointer",
                                width: "fit-content",
                                opacity: review?.is_locked ? 0.6 : 1,
                                pointerEvents: review?.is_locked ? "none" : "auto"
                              }}
                            >
                              {review?.is_locked ? "You cannot edit this review" : "Edit review"}
                            </Typography>

                            {review?.seller_reply?.message && (
                              <Box sx={{ mt: 2, bgcolor: "#fff", border: "1px solid #ececec", borderRadius: 2, p: 1.5 }}>
                                <Box sx={{ display: "flex", gap: 1.5 }}>
                                  <Avatar
                                    src={review?.replyShopIcon ? shopBaseUrl + review?.replyShopIcon : undefined}
                                    alt="Shop"
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    A
                                  </Avatar>
                                  <Box>
                                    <Typography fontWeight={600} fontSize={13}>
                                      {review?.replyShopName}
                                      <Typography component="span" sx={{ color: "#666", fontWeight: 400, ml: 1, fontSize: 12 }}>
                                        responded on {new Date(review?.seller_reply?.replied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || ""}
                                      </Typography>
                                    </Typography>
                                    <Typography sx={{ mt: 0.5, color: "#555", fontSize: 13 }}>{review?.seller_reply?.message}</Typography>
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </>
                        )}

                        {reviewNote && (
                          <Alert severity="info" sx={{ fontSize: 13, color: "#5b4b20", bgcolor: "lightyellow", mt: 1 }}>
                            <strong>Note from Agukart:</strong> {reviewNote}
                          </Alert>
                        )}
                      </Box>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </Box>
        <Box width={'100%'} mt={2}>
          <Typography variant="h6">Note to Seller</Typography>
          <TextField id="outlined-multiline" multiline rows={3} variant="outlined" value={orderDetail?.buyer_note || "No buyer notes"} fullWidth InputProps={{ readOnly: true }} />
        </Box>
      </SectionCreator>
      <ReviewPopup
        open={reviewPopupOpen}
        onClose={handleCloseReviewPopup}
        baseUrl={baseUrl}
        reviewProduct={reviewProduct}
        isEditMode={isEditMode}
        reviewId={reviewId}
        vendorId={vendorId}
        shopName={shopName}
        initialData={initialReviewData}
        onSuccess={handleReviewSuccess}
      />
      <TrackingPopup
        open={trackOpen}
        onClose={() => setTrackOpen(false)}
        order={orderDetail}
      />
      <MessagePopup
        vendorName={orderDetail?.vendor.shop_name}
        shopName={orderDetail?.vendor.shop_name}
        shopImage={`${"https://api.agukart.com/uploads/shop-icon"}/${orderDetail?.vendor.shop_icon}`}
        openPopup={openMessagePopup}
        receiverid={orderDetail?.vendor._id}
        baseUrl={baseUrl}
        productID={messageProduct}
        productData={messageProduct?.productData._id}
        orderId={orderDetail?.order_id}
        handleClosePopup={handleCloseMessage}
        subOrderId={orderDetail?.sub_order_id}
        subOrderProducts={orderDetail?.items || []}
      />
    </>
  );
};

export default OrderDetails;
