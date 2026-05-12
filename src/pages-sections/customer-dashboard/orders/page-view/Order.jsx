import React, { useState } from "react";
import { Box, Grid, Typography, Tooltip, tooltipClasses, Rating, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCurrency } from "contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { useToasts } from "react-toast-notifications";
import Product from "./Product";
import useAuth from "hooks/useAuth";
import { postAPIAuth, postAPIAuthFormData } from "utils/__api__/ApiServies";
import TrackingPopup from "./TrackingPopup";
import Link from "next/link";
import MessagePopup from "./MessagePopup";
import IconButton from "@mui/material/IconButton";
const Order = ({ baseUrl, shopBaseUrl, filterOrders, getAllOrders, order }) => {
  const router = useRouter();
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [reviewId, setReviewId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [openPopup, SetOpenPopup] = useState(false);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [itemRating, setItemRating] = useState(0);
  const [openTracking, setOpenTracking] = useState(false);
  const [openMessagePopup, setMessageOpenPopup] = useState(false);
  const [reviewStep, setReviewStep] = useState(0);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    recommend: null,
    itemQuality: 0,
    delivery: 0,
    customerService: 0,
    review: '',
    photos: [],
    photoUrls: []
  });
  const { currency } = useCurrency();
  const parentSale = order?.parentSale || order;
  const items = order?.items || [];
  const [localReviews, setLocalReviews] = useState({});
  const [localReplies, setLocalReplies] = useState({});
  const [localBuyerNotes, setLocalBuyerNotes] = useState({});
  const [hiddenReviews, setHiddenReviews] = useState({});
  const [lockedReviews, setLockedReviews] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const isoString = parentSale?.createdAt;
  const date = new Date(isoString);
  const handleClosePopup = () => {
    setReviewId("");
    setVendorId("");
    SetOpenPopup(false);
    setOpenTracking(false);
    setReviewStep(0); // reset step
    setReviewData({ rating: 0, recommend: null, itemQuality: 0, delivery: 0, customerService: 0, review: '', photos: [], photoUrls: [] });
    setIsEditMode(false);
    setReviewProduct(null);
  };
  const handleMessageClosePopup = () => {
    setMessageOpenPopup(false);
  };
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
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  function getDateRange(filterOrders) {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setMonth(currentDate.getMonth() - filterOrders);
    return {
      currentDate: formatDate(currentDate),
      pastDate: formatDate(pastDate),
    };
  }
  const formattedDate = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "";
    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  const validationSchema = Yup.object({
    deliveryRating: Yup.number()
      .required("Delivery rating is required")
      .min(1, "Please give a rating"),
    itemRating: Yup.number()
      .required("Item rating is required")
      .min(1, "Please give a rating"),
    comments: Yup.string()
      .required("Comments are required")
      .min(5, "Comment should be at least 5 characters"),
  });
  const handleOpenReview = (product) => {
    setReviewProduct(product);
    setIsEditMode(false);
    setReviewStep(0);
    setReviewData({ rating: 0, recommend: null, itemQuality: 0, delivery: 0, customerService: 0, review: '', photos: [], photoUrls: [] });
    SetOpenPopup(true);
  };
  const handleOpenEditReview = (product) => {
    const existing = localReviews[product._id];
    if (!existing) return;
    setReviewProduct(product);
    setIsEditMode(true);
    setReviewStep(0);
    setReviewData({
      rating: existing.rating || 0,
      recommend: existing.recommend ?? null,
      itemQuality: existing.itemQuality || 0,
      delivery: existing.delivery || 0,
      customerService: existing.customerService || 0,
      review: existing.review || '',
      photos: [],
      photoUrls: existing.photoUrls || [],
    });
    SetOpenPopup(true);
  };
  const submitReviewHandler = async () => {
    try {
      const newPhotoUrls = reviewData.photos.map((file) => URL.createObjectURL(file));
      const savedReview = {
        rating: reviewData.rating,
        recommend: reviewData.recommend,
        itemQuality: reviewData.itemQuality,
        delivery: reviewData.delivery,
        customerService: reviewData.customerService,
        review: reviewData.review,
        photoUrls: [...(reviewData.photoUrls || []), ...newPhotoUrls],
        submitted: true,
      };
      setLocalReviews((prev) => ({ ...prev, [reviewProduct._id]: savedReview }));
      setReviewStep(3);
    } catch (error) {
      addToast("Something went wrong", { appearance: "error", autoDismiss: true });
    }
  };
  const [isFollowing, setIsFollowing] = useState(false);
  const handleFollow = async () => {
    try {
      const res = await postAPIAuth(
        "user/follow-vendor",
        { vendorId: vendorId },
        token,
        addToast
      );
      if (res.status === 200) {
        setIsFollowing(prev => !prev);
        addToast(
          !isFollowing ? "Followed successfully" : "Unfollowed successfully",
          {
            appearance: "success",
            autoDismiss: true,
          }
        );
      }
    } catch (err) {
      console.log(err);
      addToast("Something went wrong", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
  const deliveryStatus = (items?.[0]?.delivery_status || parentSale?.delivery_status) === "No tracking"
    ? { tracking: false, status: "Shipped" } : { tracking: true, status: (items?.[0]?.delivery_status || parentSale?.delivery_status) };
  const refundStatus = (items?.[0]?.refund_status || parentSale?.refund_status) === "none"
    ? null : (items?.[0]?.refund_status || parentSale?.refund_status)
  return (
    <>
      <Box key={order.sub_order_id || order._id} mb={2}>
        <TrackingPopup
          open={openTracking}
          onClose={handleClosePopup}
          order={order}
        />
        <Box border={"1px solid"} borderRadius={{ xs: "10px", md: "12px" }} borderColor={"#e4e4e484"}>
          <Grid
            container
            p={1}
            pb={2}
            spacing={2}
            sx={{
              background: "#f0f2f2",
              margin: "0",
              width: "100%",
              borderRadius: { xs: "10px 10px 0 0", md: "12px 12px 0 0" },
            }}
          >
            <Grid item lg={8} md={7} xs={12} sx={{ paddingTop: "0" }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", md: "flex-start" },
                    flexWrap: { xs: "wrap", md: "nowrap" },
                    gap: { xs: 1.5, md: 2 },
                    p: 0,
                    m: 0,
                  }}
                >
                  <Stack
                    spacing={2}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 8px)", md: "33.33%" },
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography fontSize={14} fontWeight={500}>
                        Order placed {" "}{formattedDate(date)}
                      </Typography>
                      {(items?.[0]?.shipped_date || parentSale?.shipped_date) && (<Typography fontSize={14} fontWeight={500}>
                        Shipped  {" "}{formattedDate(items?.[0]?.shipped_date || parentSale?.shipped_date) || "—"}
                      </Typography>)}
                      {(items?.[0]?.delivered_date || parentSale?.delivered_date) && (<Typography fontSize={14} fontWeight={500}>
                        Delivered {" "}{formattedDate(items?.[0]?.delivered_date || parentSale?.delivered_date) || "—"}
                      </Typography>)}
                    </Box>
                  </Stack>
                  <Stack
                    spacing={1}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 8px)", md: "33.33%" },
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography fontSize={14} fontWeight={500}>
                        <span>Status :</span> {deliveryStatus.status}
                      </Typography>
                      {deliveryStatus.tracking ? (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            marginTop: "10px",
                            bgcolor: "#404040",
                            "&:hover": {
                              bgcolor: "#515151",
                            },
                            borderRadius: "30px",
                            border: "1px solid #000",
                            width: { xs: "100%", sm: "auto", md: "auto" },
                            maxWidth: { md: "150px" },
                            color: "#eee",
                          }}
                          onClick={() => setOpenTracking(true)}
                        >
                          Track package
                        </Button>
                      ) : (
                        ""
                      )}
                    </Box>
                  </Stack>
                  <Stack
                    spacing={1}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 8px)", md: "33.33%" },
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography fontSize={14} fontWeight={500}>
                        Total (change!) {currency?.symbol}
                        {(order.subtotal * currency?.rate).toFixed(2)}
                        {refundStatus && (<span style={{ color: "red" }}>{refundStatus}</span>)}
                      </Typography>
                      <Typography fontSize={14} fontWeight={500}>
                        Store name : <Link
                          href={`/store/${items[0]?.vendorData?.slug}`}
                          style={{
                            color: "#3b66cb",
                            fontSize: "15px",
                            textDecoration: "none",
                          }}
                        >
                          {items[0]?.vendorData?.shop_name}
                        </Link>
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          setMessageOpenPopup(true);
                        }}
                        variant="contained"
                        sx={{
                          background: "#fff",
                          borderRadius: "30px",
                          border: "1px solid #252525bd",
                          width: { xs: "100%", sm: "auto", md: "auto" },
                          maxWidth: { md: "150px" },
                          marginBottom: "12px",
                        }}
                      >
                        Message to Seller
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Grid>
            <Grid item lg={4} md={5} xs={12} sx={{ paddingTop: "0" }}>
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
                <Box display={"flex"} flexDirection={"column"} gap={1.5} width="100%">
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    sx={{ textTransform: "uppercase", wordBreak: "break-word" }}
                  >
                    Order # {order.sub_order_id}
                  </Typography>
                  <Box>
                    <LightTooltip
                      title={
                        <Box>
                          <Typography
                            fontSize={"16px"}
                            sx={{ textTransform: "capitalize" }}
                            fontWeight={600}
                          >
                            {parentSale?.userName}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.address_line1}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.address_line2 ? parentSale?.address_line2 : ""}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.city} {parentSale?.state} {parentSale?.pincode}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.country}
                          </Typography>
                        </Box>
                      }
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                        <span>Ship to :</span>
                        <Typography
                          fontSize={15}
                          fontWeight={500}
                          sx={{
                            color: "#ad1414",
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {" "}{parentSale?.userName}
                        </Typography>
                        <ArrowDropDownIcon />
                      </Box>
                    </LightTooltip>
                  </Box>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      rowGap: 1,
                    }}
                  >
                    <Typography
                      onClick={() =>
                        router.push(`/order-details?order-id=${order.order_id}&sub-order-id=${order.sub_order_id}`)
                      }
                      component="span"
                      fontSize={15}
                      pr={{ xs: 0, sm: 2 }}
                      fontWeight={500}
                      sx={{
                        color: "#ad1414",
                        cursor: "pointer",
                        borderRight: { xs: "none", sm: "2px solid #dad9d9" },
                      }}
                    >
                      View order details
                    </Typography>
                    <Typography
                      sx={{
                        marginLeft: { xs: "0px", sm: "10px" },
                        display: "flex",
                        minWidth: { xs: "auto", sm: 100 },
                        alignItems: "center",
                      }}
                      component="div"
                    >
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
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box p={{ xs: 2, sm: 2.5, md: 3 }} sx={{ background: "#fff", borderRadius: "0 0 12px 12px" }}>
            <Typography component="div" mb={2}>
              {/* <H2 fontWeight={600}>Delivered 5 july 2024</H2> */}
              {/* <Typography>Package was handed to resident</Typography> */}
            </Typography>
            {/* Shop section - using items array */}
            {items.length > 0 && (
              <Box>
                {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <H4 sx={{color:'grey'}}>Shop name : { items[0]?.vendorData?.shop_name || 'Unknown'}</H4>
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: '1px',
                      backgroundColor: '#e0e0e0',
                      ml: 2,
                    }}
                  />
                </Box> */}
                {items.map((product, index) => {
                  const review = localReviews[product._id];
                  const reply = localReplies[product._id];
                  const buyerNote = localBuyerNotes[product._id];
                  const isHidden = hiddenReviews[product._id];
                  const isLocked = lockedReviews[product._id];
                  const hasReview = review?.submitted;
                  if (isHidden && hasReview) {
                    return (
                      <Box key={product?._id} sx={{ display: "flex", justifyContent: "flex-end", py: 3, borderBottom: index !== items.length - 1 ? "1px solid #ececec" : "none" }}>
                        <Box sx={{ width: "100%", maxWidth: 520, bgcolor: "#f8f7f3", border: "1px solid #ece8dc", borderRadius: 2, p: 2 }}>
                          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                            <Box sx={{ width: 42, height: 42, borderRadius: "50%", bgcolor: "#f1641e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                              {items[0]?.vendorData?.shop_name?.[0] || "S"}
                            </Box>
                            <Typography sx={{ color: "#666", fontSize: 14 }}>This review has been hidden by admin.</Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  }
                  return (
                    <Box
                      key={product?._id}
                      sx={{
                        display: "flex",
                        gap: 3,
                        py: 3,
                        borderBottom:
                          index !== items.length - 1
                            ? "1px solid #ececec"
                            : "none",
                        flexDirection: {
                          xs: "column",
                          md: "row",
                        },
                      }}
                    >
                      {/* LEFT PRODUCT */}
                      <Box
                        sx={{
                          width: {
                            xs: "100%",
                            md: "45%",
                          },
                          display: "flex",
                          gap: 2,
                        }}
                      >
                        {/* IMAGE */}
                        <Box
                          sx={{
                            width: 95,
                            height: 95,
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "1px solid #e5e5e5",
                            bgcolor: "#fafafa",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={
                              product?.image?.[0]
                                ? `${baseUrl}/${product.image[0]}`
                                : ""
                            }
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                        {/* PRODUCT INFO */}
                        <Box>
                          <Typography
                            sx={{
                              fontSize: 18,
                              fontWeight: 500,
                              lineHeight: 1.5,
                              color: "#2b2b2b",
                            }}
                          >
                            {product?.product_name?.replace(
                              /<\/?[^>]+(>|$)/g,
                              ""
                            )}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 1,
                              color: "#777",
                              fontSize: 15,
                            }}
                          >
                            Materials: Sterling silver
                          </Typography>
                          <Typography
                            sx={{
                              color: "#777",
                              fontSize: 15,
                            }}
                          >
                            Ring Size (US size): 10
                          </Typography>
                          <Typography
                            sx={{
                              color: "#444",
                              fontSize: 15,
                              mt: 0.3,
                            }}
                          >
                            Qty : {product?.quantity}
                          </Typography>

                          {/* BUTTONS */}
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1,
                              mt: 2,
                              flexWrap: "wrap",
                            }}
                          >
                            <Button
                              sx={{
                                bgcolor: "#f7efcf",
                                color: "#222",
                                borderRadius: "30px",
                                px: 2,
                                textTransform: "none",
                                fontSize: 14,
                                "&:hover": {
                                  bgcolor: "#f1e4b2",
                                },
                              }}
                            >
                              Buy it Again
                            </Button>
                            <Button
                              sx={{
                                bgcolor: "#f7efcf",
                                color: "#222",
                                borderRadius: "30px",
                                px: 2,
                                textTransform: "none",
                                fontSize: 14,
                                "&:hover": {
                                  bgcolor: "#f1e4b2",
                                },
                              }}
                            >
                              Help With Item
                            </Button>
                            {!hasReview && (
                              <Button
                                onClick={() => handleOpenReview(product)}
                                sx={{ bgcolor: "#222", color: "#fff", borderRadius: "30px", px: 2, textTransform: "none", fontSize: 14, "&:hover": { bgcolor: "#444" } }}
                              >
                                Leave a Review
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      {/* RIGHT REVIEW */}
                      {/* RIGHT REVIEW */}
<Box sx={{ flex: 1 }}>
  {!hasReview ? (
    <Box sx={{ bgcolor: "#f8f7f3", borderRadius: 2, p: 3, border: "1px solid #ece8dc", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
      <Typography fontSize={14} color="text.secondary">You haven't reviewed this item yet.</Typography>
    </Box>
  ) : (
    <Box sx={{ bgcolor: "#f8f7f3", borderRadius: 2, p: 2, border: "1px solid #ece8dc" }}>
      {/* Stars */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontWeight={600} fontSize={15}>Your Review</Typography>
          <Typography sx={{ color: "#000", letterSpacing: 1, fontSize: 16 }}>
            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
          </Typography>
        </Box>
        {review.recommend !== null && (
          <Typography fontSize={12} sx={{ bgcolor: review.recommend ? "#e8f5e9" : "#fce4ec", color: review.recommend ? "#2e7d32" : "#c62828", px: 1.5, py: 0.3, borderRadius: 10 }}>
            {review.recommend ? "✓ Recommended" : "✕ Not recommended"}
          </Typography>
        )}
      </Box>
      {/* Sub ratings */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1.5 }}>
        {[
          { label: "Item Quality", val: review.itemQuality },
          { label: "Delivery", val: review.delivery },
          { label: "Customer Service", val: review.customerService },
        ].map(({ label, val }) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography fontSize={12} color="text.secondary">{label}:</Typography>
            <Rating value={val} readOnly size="small" sx={{ fontSize: 14 }} />
          </Box>
        ))}
      </Box>
      {/* Photos */}
      {review.photoUrls?.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
          {review.photoUrls.map((url, i) => (
            <Box key={i} sx={{ width: 72, height: 72, borderRadius: 1, overflow: "hidden", border: "1px solid #ddd" }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      )}
      {/* Review text */}
      <Typography sx={{ color: "#4d4d4d", fontSize: 14, lineHeight: 1.6 }}>{review.review}</Typography>
      {/* Edit review */}
      <Typography
        onClick={() => !isLocked && handleOpenEditReview(product)}
        sx={{ mt: 1.5, color: isLocked ? "#b5b5b5" : "#666", fontSize: 13, textDecoration: "underline", cursor: isLocked ? "not-allowed" : "pointer", width: "fit-content", opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? "none" : "auto" }}
      >
        Edit review
      </Typography>
      {/* Seller Reply */}
      {reply && (
        <Box sx={{ mt: 2, bgcolor: "#fff", border: "1px solid #ececec", borderRadius: 2, p: 2 }}>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: "50%", bgcolor: "#f1641e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
              {items[0]?.vendorData?.shop_name?.[0] || "S"}
            </Box>
            <Box>
              <Typography fontWeight={600} fontSize={14}>
                {reply.seller}
                <Typography component="span" sx={{ color: "#666", fontWeight: 400, ml: 1 }}>responded on {reply.date}</Typography>
              </Typography>
              <Typography sx={{ mt: 1, color: "#555", fontSize: 14 }}>{reply.message}</Typography>
            </Box>
          </Box>
        </Box>
      )}
      {/* Note to Buyer */}
      {buyerNote && (
        <Box sx={{ mt: 2, bgcolor: "#fff8e1", border: "1px solid #f1d58a", borderRadius: 2, p: 2 }}>
          <Typography sx={{ fontSize: 13, color: "#8a6d1d", lineHeight: 1.6 }}>
            <strong>Note to Buyer:</strong> {buyerNote}
          </Typography>
        </Box>
      )}
    </Box>
  )}
</Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openPopup}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="md"
        sx={{
          ".MuiPaper-root": {
            minHeight: "520px",
            width: { xs: "calc(100% - 24px)", md: "650px" },
            maxWidth: "500px",
            margin: { xs: "12px", sm: "32px" },
            borderRadius: "12px"
          }
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={500}>
{reviewStep === 0 && (isEditMode ? 'Edit Your Review' : 'Leave a Review')}
            {reviewStep === 1 && 'Great! Tell us more...'}
            {reviewStep === 2 && 'Extra credit: add a photo!'}
          </Typography>
          <IconButton size="small" onClick={handleClosePopup}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {/* Body */}
        <Box sx={{ p: 2.5 }}>
          {/* STEP 1 */}
          {reviewStep === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              {/* Product Info */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 3
              }}>
                <Box
                  sx={{
                    width: 500,
                    height: 130,
                    borderRadius: 2,
                    overflow: 'hidden',
                    // 🔥 highlight styles
                    border: '2.0px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    bgcolor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    // 🔥 hover effect (premium feel)
                    '&:hover': {
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      transform: 'scale(1.03)',
                    }
                  }}
                >
                  <img
                    src={reviewProduct?.image?.[0]
                      ? `${baseUrl}/${reviewProduct.image[0]}`
                      : ""}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                <Box textAlign="left">
                  <Typography fontSize={16} fontWeight={600}>
                    {reviewProduct?.product_name?.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {items[0]?.vendorData?.shop_name}
                  </Typography>
                </Box>
              </Box>
              {/* Rating */}
              <Typography fontSize={14} mb={1}>
                Your review rating *
              </Typography>
              <Rating
                size="large"
                value={reviewData.rating}
                onChange={(_, v) => setReviewData(p => ({ ...p, rating: v }))}
                sx={{ fontSize: 40 }}   // 🔥 BIG STARS
              />
              {reviewData.rating > 0 && (
                <Typography mt={1} fontSize={14}>
                  {['', 'Disappointed', 'Not a fan', "It's okay", 'Like it', 'Love it'][reviewData.rating]}
                </Typography>
              )}
              {/* Recommend */}
              <Typography mt={3} mb={1} fontSize={14}>
                Would you recommend this item?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {[true, false].map(val => (
                  <Button
                    key={String(val)}
                    onClick={() => setReviewData(p => ({ ...p, recommend: val }))}
                    sx={{
                      px: 4,
                      py: 1.2,
                      borderRadius: 5,
                      border: '1px solid',
                      borderColor: reviewData.recommend === val ? '#000' : 'divider',
                      bgcolor: reviewData.recommend === val ? '#000' : 'transparent',
                      color: reviewData.recommend === val ? '#fff' : 'text.primary',
                      fontSize: 15
                    }}
                  >
                    {val ? '✓ Yes' : '✕ No'}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
          {/* STEP 2 */}
          {reviewStep === 1 && (
            <Box>
              {[
                { label: 'Item quality', key: 'itemQuality' },
                { label: 'Delivery', key: 'delivery' },
                { label: 'Customer service', key: 'customerService' }
              ].map(({ label, key }) => (
                <Box key={key} mb={2}>
                  <Typography fontSize={13} color="text.secondary" mb={0.5}>{label}</Typography>
                  <Rating
                    value={reviewData[key]}
                    onChange={(_, v) => setReviewData(p => ({ ...p, [key]: v }))}
                  />
                </Box>
              ))}
              <Typography fontSize={13} color="text.secondary" mb={0.5}>
                Your review <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                fullWidth multiline rows={5}
                placeholder="What did you like or dislike?"
                value={reviewData.review}
                onChange={e => setReviewData(p => ({ ...p, review: e.target.value }))}
              />
              <Typography fontSize={11} color="text.secondary" mt={0.5}>
                By submitting, you agree to our Review Policy
              </Typography>
            </Box>
          )}
          {/* STEP 3 - Photo Upload */}
          {reviewStep === 2 && (
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              {/* LEFT TEXT */}
              <Box sx={{ flex: 1 }}>
                <Typography fontSize={18} fontWeight={500} mb={1}>
                  Extra credit: add a photo!
                </Typography>
                <Typography fontSize={14} color="text.secondary">
                  Show your appreciation <br />
                  and inspire the <br />
                  community! <span style={{ fontSize: 13 }}>(optional)</span>
                </Typography>
              </Box>
              {/* RIGHT UPLOAD BOX */}
              {reviewData.photos.length < 4 && (
                <Button
                  component="label"
                  sx={{
                    width: 220,
                    height: 220,
                    border: '1px solid #ddd',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    bgcolor: '#fafafa',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#f2f2f2'
                    }
                  }}
                >
                  {/* 🔥 YOUR DOWNLOADED ICON */}
                  <img
                    src="/icons/camera.png"
                    alt="upload"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                      opacity: 0.8
                    }}
                  />
                  <Typography fontSize={14} color="text.secondary">
                    Click to upload an image
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setReviewData(p => ({
                          ...p,
                          photos: [...p.photos, file]
                        }));
                      }
                    }}
                  />
                </Button>
              )}
              {/* 🔥 IMAGES BELOW (same screen jaisa flow) */}
              {(reviewData.photoUrls?.length > 0 || reviewData.photos.length > 0) && (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
    {/* Purani saved photos */}
    {reviewData.photoUrls?.map((url, i) => (
      <Box key={`old-${i}`} sx={{ width: 90, height: 90, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        <IconButton
          size="small"
          onClick={() => setReviewData(p => ({ ...p, photoUrls: p.photoUrls.filter((_, idx) => idx !== i) }))}
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'black', color: '#fff', width: 20, height: 20 }}
        >
          <CloseIcon sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
    ))}
    {/* Naye photos */}
    {reviewData.photos.map((photo, i) => (
      <Box key={`new-${i}`} sx={{ width: 90, height: 90, borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd', position: 'relative' }}>
        <img src={URL.createObjectURL(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        <IconButton
          size="small"
          onClick={() => setReviewData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'black', color: '#fff', width: 20, height: 20 }}
        >
          <CloseIcon sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
    ))}
  </Box>
)}
            </Box>
          )}
          {/* STEP 4 - Success */}
          {reviewStep === 3 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, fontSize: 28 }}>✓</Box>
              <Typography variant="h6" fontWeight={500} mb={1}>Thanks for your review!</Typography>
              <Typography fontSize={14} color="text.secondary" mb={2}>
                Follow <strong>{items[0]?.vendorData?.shop_name}</strong> for updates and special offers.
              </Typography>
              <Button
                onClick={handleFollow}
                variant="outlined"
                startIcon={
                  <span style={{ color: isFollowing ? 'red' : '#999', fontSize: 14 }}>
                    ♥
                  </span>
                }
                sx={{
                  borderRadius: 20,
                  textTransform: 'none',
                  borderColor: isFollowing ? '#000' : 'divider'
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </Box>
          )}
        </Box>
        {/* Footer */}
        {reviewStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={() => setReviewStep(s => s - 1)} sx={{ visibility: reviewStep === 0 ? 'hidden' : 'visible', color: 'text.secondary', textTransform: 'none' }}>
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {[0, 1, 2].map(i => (
                <Box key={i} sx={{ width: 20, height: 3, borderRadius: 1, bgcolor: i === reviewStep ? 'text.primary' : 'divider' }} />
              ))}
            </Box>
            <Button
              variant="contained"
              sx={{ bgcolor: '#000', color: '#fff', borderRadius: 2, textTransform: 'none', '&:hover': { bgcolor: '#333' } }}
              onClick={() => {
                if (reviewStep === 0) {
  if (!reviewData.rating) {
    addToast("Please give a rating", { appearance: "error", autoDismiss: true });
    return;
  }
  setReviewStep(1);
  return;
}
                if (reviewStep === 1) {
  if (!reviewData.itemQuality || !reviewData.delivery || !reviewData.review) {
    addToast("Please fill all fields", { appearance: "error", autoDismiss: true });
    return;
  }
  setReviewStep(2);
  return;
}
if (reviewStep === 2) {
  submitReviewHandler();
  return;
}
setReviewStep(s => s + 1);
              }}
            >
              {reviewStep === 2 ? (reviewData.photos.length > 0 ? 'Submit photo' : 'Skip') : 'Next'}
            </Button>
          </Box>
        )}
      </Dialog>
      <MessagePopup
        vendorName={order.items[0]?.vendor_name}
        shopName={order?.vendorData?.shop_name}
        shopImage={`${shopBaseUrl}/${order?.vendorData?.shop_icon}`}
        openPopup={openMessagePopup}
        receiverid={order?.vendor_id}
        baseUrl={baseUrl}
        productID={null}
        productData={null}
        orderId={order?.order_id}
        handleClosePopup={handleMessageClosePopup}
        subOrderId={order.sub_order_id}
        subOrderProducts={order.items || []}
      />
    </>
  );
};
export default Order;