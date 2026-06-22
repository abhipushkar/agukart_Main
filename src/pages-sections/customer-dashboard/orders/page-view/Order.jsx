import React, { useState } from "react";
import { Box, Grid, Typography, Tooltip, tooltipClasses, Rating, Stack, Dialog, DialogActions, DialogContent, Card } from "@mui/material";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCurrency } from "contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { useToasts } from "react-toast-notifications";
import Product from "./Product";
import useAuth from "hooks/useAuth";
import { postAPIAuth, postAPIAuthFormData, putAPIAuthFormData } from "utils/__api__/ApiServies";
import TrackingPopup from "./TrackingPopup";
import Link from "next/link";
import MessagePopup from "./MessagePopup";
import IconButton from "@mui/material/IconButton";
import LightPopover from "components/TooltipPopover/LightPopover";

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
    photoUrls: [],
    existingImageNames: []
  });
  const { currency } = useCurrency();
  const parentSale = order?.parentSale || order;
  const items = order?.items || [];
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewProduct, setReviewProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isoString = parentSale?.createdAt;
  const date = new Date(isoString);


  const handleClosePopup = () => {
    // Refresh orders only when dialog fully closes
    const dateRange = getDateRange(filterOrders);
    if (reviewStep === 3) {
      getAllOrders(dateRange.pastDate, dateRange.currentDate);
    }
    setReviewId("");
    setVendorId("");
    SetOpenPopup(false);
    setOpenTracking(false);
    setReviewStep(0);
    setReviewData({ rating: 0, recommend: null, itemQuality: 0, delivery: 0, customerService: 0, review: '', photos: [], photoUrls: [], existingImageNames: [] });
    setIsEditMode(false);
    setReviewProduct(null);
  };

  const handleMessageClosePopup = () => {
    setMessageOpenPopup(false);
  };

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
    setReviewData({ rating: 0, recommend: null, itemQuality: 0, delivery: 0, customerService: 0, review: '', photos: [], photoUrls: [], existingImageNames: [] });
    SetOpenPopup(true);
  };

  const handleOpenEditReview = (product) => {
    // Get the review data from the product's ratingData
    const existingReview = product?.ratingData?.[0];
    if (!existingReview) {
      addToast("No review found to edit", { appearance: "error", autoDismiss: true });
      return;
    }

    setReviewProduct(product?.productData || product);
    setReviewId(existingReview._id); // This should be the rating_id
    setVendorId(product?.vendor_id);
    setIsEditMode(true);
    setReviewStep(0);
    setReviewData({
      rating: existingReview.rating || 0,
      recommend: existingReview.recommended ?? null,
      itemQuality: existingReview.item_rating || 0,
      delivery: existingReview.delivery_rating || 0,
      customerService: existingReview.customer_service_rating || 0,
      review: existingReview.additional_comment || '',
      photos: [],
      photoUrls: existingReview.images?.map(img => `https://api.agukart.com/uploads/ratings/${img}`) || [],
      existingImageNames: existingReview.images || [] // Store original image names for deletion tracking
    });
    SetOpenPopup(true);
  };

  const submitReviewHandler = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      if (isEditMode) {
        // EDIT MODE - use rating_id
        formData.append("rating_id", reviewId);
        formData.append("rating", reviewData.rating.toString());
        formData.append("customer_service_rating", reviewData.customerService.toString());
        formData.append("delivery_rating", reviewData.delivery.toString());
        formData.append("item_rating", reviewData.itemQuality.toString());
        formData.append("additional_comment", reviewData.review);
        formData.append("recommended", reviewData.recommend ? "true" : "false");

        // Send existing images that are kept
        if (reviewData.existingImageNames && reviewData.existingImageNames.length > 0) {
          reviewData.existingImageNames.forEach((imgName, i) => {
            formData.append(`existingImages[${i}]`, imgName);
          });
        }

        // Send new images
        if (reviewData.photos && reviewData.photos.length > 0) {
          reviewData.photos.forEach((file) => {
            formData.append("images", file);
          });
        }

        const res = await putAPIAuthFormData(
          `user/editRating/${reviewId}`,
          formData,
          token,
          addToast
        );

        if (res.status === 200) {

          setReviewStep(3);
          // Reset form data after successful submission
          setReviewId("");
          setVendorId("");
          
          addToast("Review updated successfully", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      } else {
        // CREATE MODE (existing code)
        formData.append("delivery_rating", reviewData.delivery.toString());
        formData.append("item_rating", reviewData.itemQuality.toString());
        formData.append("additional_comment", reviewData.review);
        formData.append("recommended", reviewData.recommend ? "true" : "false");
        formData.append("saleDetailId", reviewId);
        formData.append("vendor_id", vendorId);
        formData.append("customer_service_rating", reviewData.customerService.toString());
        formData.append("rating", reviewData.rating.toString());

        if (reviewData.photos && reviewData.photos.length > 0) {
          reviewData.photos.forEach((file) => {
            formData.append("images", file);
          });
        }

        const res = await postAPIAuthFormData(
          "user/sendRating",
          formData,
          token,
          addToast
        );

        if (res.status === 200) {

          setReviewStep(3);
          // Reset form data after successful submission
          setReviewId("");
          setVendorId("");
          addToast("Review submitted successfully", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      addToast(error?.response?.data?.message || "Something went wrong", {
        appearance: "error",
        autoDismiss: true
      });
    } finally {
      setIsSubmitting(false);
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

  const subOrderTotal = items.reduce((total, item) => total + item.amount, items[0].shippingAmount);

  return (
    <>
      <Box key={order.sub_order_id || order._id} mb={2} component={Card} borderRadius={{ xs: "10px", md: "12px" }}>
        <TrackingPopup
          open={openTracking}
          onClose={handleClosePopup}
          order={order}
        />
        <Box border={"1px solid"} borderRadius={{ xs: "10px", md: "12px" }} borderColor={"#d5d5d584"}>
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
                        Total {currency?.symbol}
                        {(subOrderTotal * currency?.rate).toFixed(2)}
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
                    <LightPopover
                      title={
                        <Box>
                          <Typography fontSize={16} fontWeight={600}>{parentSale?.userName}</Typography>
                          <Typography fontSize={16}>{parentSale?.address_line1}</Typography>
                          {parentSale?.address_line2 && <Typography fontSize={16}>{parentSale?.address_line2}</Typography>}
                          <Typography fontSize={16}>{parentSale?.city} {parentSale?.state} {parentSale?.pincode}</Typography>
                          <Typography fontSize={16}>{parentSale?.country}</Typography>
                        </Box>
                      }
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: .5 }}>
                        <span>Ship to :</span>
                        <Typography fontSize={15} fontWeight={500} sx={{ color: "#ad1414", textTransform: "capitalize" }}>
                          {parentSale?.userName}
                        </Typography>
                        <ArrowDropDownIcon />
                      </Box>
                    </LightPopover>
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
                      <LightPopover
                        title={
                          <Button
                            onClick={() =>
                              addToast("Please Wait", {
                                appearance: "success",
                                autoDismiss: true,
                              })
                            }
                          >
                            Printable order summary
                          </Button>
                        }
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography fontSize={15} fontWeight={500} sx={{ color: "#ad1414", textTransform: "capitalize" }}>
                            invoice
                          </Typography>
                          <ArrowDropDownIcon />
                        </Box>
                      </LightPopover>
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
                {items.map(product => {
                  console.log("orderproduct", product);
                  return (
                    <Product
                      key={product?._id}
                      baseUrl={baseUrl}
                      shopBaseUrl={shopBaseUrl}
                      SetOpenPopup={SetOpenPopup}
                      setReviewId={setReviewId}
                      setVendorId={setVendorId}
                      order={order}
                      product={product}
                      setReviewProduct={setReviewProduct}
                      handleOpenReview={handleOpenReview}
                      handleOpenEditReview={handleOpenEditReview}
                    />
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
            height: "600px",
            maxHeight: "80vh",
            minHeight: "520px",
            width: { xs: "calc(100% - 24px)", md: "650px" },
            maxWidth: "500px",
            margin: { xs: "12px", sm: "32px" },
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column"
          }
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="h6" fontWeight={500}>
            {reviewStep === 0 && (isEditMode ? 'Edit Your Review' : 'Leave a Review')}
            {reviewStep === 1 && 'Great! Tell us more...'}
            {reviewStep === 2 && 'Extra credit: add a photo!'}
            {reviewStep === 3 && 'Review Submitted!'}
          </Typography>
          <IconButton size="small" onClick={handleClosePopup}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body - Scrollable */}
        <Box sx={{
          p: 2.5,
          flex: 1,
          overflowY: 'auto',
          // For WebKit browsers (Chrome, Safari, newer Edge)
          '&::-webkit-scrollbar': {
            width: '0px',
            background: 'transparent',
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* STEP 1 */}
          {reviewStep === 0 && (
            <Box sx={{ textAlign: 'center' }}>
              {/* Product Info */}
              <Box sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                p: 0.5,
                bgcolor: 'grey.50',
                borderRadius: 2,
                mb: 3,
                height: 200,
                width: '100%'
              }}>
                <Box
                  sx={{
                    minWidth: 200,
                    height: '100%',
                    maxWidth: '40%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2.0px solid #e0e0e0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    bgcolor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      transform: 'scale(1.03)',
                    }
                  }}
                  component={'img'}
                  src={reviewProduct?.image?.[0]
                    ? `${baseUrl}/${reviewProduct.edited_image || reviewProduct.image[0]}`
                    : ""}
                  alt=""
                />
                <Box textAlign="left">
                  <Typography fontSize={16} fontWeight={600}>
                    {reviewProduct?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    {items[0]?.vendorData?.shop_name}
                  </Typography>
                </Box>
              </Box>
              {/* Rating */}
              <Typography fontSize={14} mb={1}>
                Your review rating<strong>*</strong>
                {reviewData.rating > 0 && (
                  <Typography component={"span"} mt={1} ml={1} fontSize={14} fontWeight={600}>
                    {['', 'Disappointed', 'Not a fan', "It's okay", 'Like it', 'Love it'][reviewData.rating]}
                  </Typography>
                )}
              </Typography>
              <Rating
                size="large"
                value={reviewData.rating}
                onChange={(_, v) => setReviewData(p => ({ ...p, rating: v }))}
                sx={{ fontSize: 40 }}
              />
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
                      fontSize: 15,
                      ':hover': {
                        borderColor: reviewData.recommend === val ? '#000' : 'divider',
                        bgcolor: reviewData.recommend === val ? '#000' : 'transparent',
                        color: reviewData.recommend === val ? '#fff' : 'text.primary',
                      }
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

          {/* STEP 3 - Photo Upload with Multiple Images */}
          {reviewStep === 2 && (
            <Box>
              {/* HEADER + UPLOAD BUTTON - Same Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, minHeight: "50px" }}>
                {/* LEFT TEXT */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontSize={16} fontWeight={600} mb={0.5}>
                    {reviewData.photos.length + (reviewData.existingImageNames?.length || 0) < 5 ? "Extra credit: add a photo!" : "Great! You've added 5 images."}
                  </Typography>
                  <Typography fontSize={13} color="text.secondary">
                    Show your appreciation and inspire the community! (optional)
                  </Typography>
                </Box>

                {/* UPLOAD BUTTON */}
                {reviewData.photos.length + (reviewData.existingImageNames?.length || 0) < 5 && (
                  <Button
                    component="label"
                    sx={{
                      minWidth: 100,
                      height: 200,
                      width: 200,
                      border: '2px dashed #ddd',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      bgcolor: '#fafafa',
                      textTransform: 'none',
                      flexShrink: 0,
                      '&:hover': {
                        bgcolor: '#f2f2f2',
                        borderColor: '#999'
                      }
                    }}
                  >
                    <img
                      src="/icons/camera.png"
                      alt="upload"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: 'contain',
                        opacity: 0.8
                      }}
                    />
                    <Typography fontSize={11} color="text.secondary">
                      Upload
                    </Typography>
                    <Typography fontSize={10} color="text.secondary">
                      ({reviewData.photos.length + (reviewData.existingImageNames?.length || 0)}/5)
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        const remaining = 5 - (reviewData.photos.length + (reviewData.existingImageNames?.length || 0));
                        const newFiles = files.slice(0, remaining);
                        setReviewData(p => ({
                          ...p,
                          photos: [...p.photos, ...newFiles]
                        }));
                      }}
                    />
                  </Button>
                )}
              </Box>

              {/* IMAGES GRID - 2×3 Below header & button */}
              {(reviewData.photoUrls?.length > 0 || reviewData.photos.length > 0) && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1.5,
                    gridAutoRows: 'auto'
                  }}>
                    {/* Existing saved photos */}
                    {reviewData.photoUrls?.map((url, i) => (
                      <Box key={`old-${i}`} sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <IconButton
                          size="small"
                          onClick={() => {
                            // Remove from photoUrls
                            const newPhotoUrls = reviewData.photoUrls.filter((_, idx) => idx !== i);
                            // Remove corresponding image name from existingImageNames
                            const newExistingImageNames = reviewData.existingImageNames.filter((_, idx) => idx !== i);
                            setReviewData(p => ({
                              ...p,
                              photoUrls: newPhotoUrls,
                              existingImageNames: newExistingImageNames
                            }));
                          }}
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', width: 22, height: 22, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {/* Newly added photos */}
                    {reviewData.photos.map((photo, i) => (
                      <Box key={`new-${i}`} sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                        <img src={URL.createObjectURL(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <IconButton
                          size="small"
                          onClick={() => setReviewData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
                          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', width: 22, height: 22, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                          <CloseIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* STEP 4 - Success */}
          {reviewStep === 3 && (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              textAlign: 'center'
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: '#E1F5EE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: 40,
                color: '#2E7D64'
              }}>
                ✓
              </Box>
              <Typography variant="h6" fontWeight={500} mb={1}>
                Thanks for your review!
              </Typography>
              <Typography fontSize={14} color="text.secondary" mb={3}>
                Follow <strong>{items[0]?.vendorData?.shop_name}</strong> for updates and special offers.
              </Typography>
              <Button
                onClick={handleFollow}
                variant="outlined"
                startIcon={
                  <span style={{ color: isFollowing ? '#E91E63' : '#999', fontSize: 16 }}>
                    ♥
                  </span>
                }
                sx={{
                  borderRadius: 20,
                  textTransform: 'none',
                  borderColor: isFollowing ? '#E91E63' : 'divider',
                  px: 3,
                  py: 1
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </Box>
          )}
        </Box>

        {/* Footer with DialogActions */}
        {reviewStep < 3 && (
          <DialogActions sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <Button
              onClick={() => setReviewStep(s => s - 1)}
              sx={{
                visibility: reviewStep === 0 ? 'hidden' : 'visible',
                color: 'text.secondary',
                textTransform: 'none'
              }}
            >
              Back
            </Button>

            {/* Stepper Bars */}
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              {[0, 1, 2].map(i => (
                <Box key={i} sx={{
                  width: 24,
                  height: 3,
                  borderRadius: 1.5,
                  bgcolor: i === reviewStep ? '#000' : '#e0e0e0'
                }} />
              ))}
            </Box>

            <Button
              variant="contained"
              disabled={isSubmitting}
              sx={{
                bgcolor: '#000',
                color: '#fff',
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': { bgcolor: '#333' }
              }}
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
              {reviewStep === 2 ? (reviewData.photos.length > 0 ? `Submit ${reviewData.photos.length + reviewData.existingImageNames?.length} photo${reviewData.photos.length > 1 ? 's' : ''}` : 'Skip') : 'Next'}
            </Button>
          </DialogActions>
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