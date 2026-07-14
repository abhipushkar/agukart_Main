"use client";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import StarIcon from "@mui/icons-material/Star";
import TabPanel from "@mui/lab/TabPanel";
import { FlexBox } from "components/flex-box";
import Pagination from "@mui/material/Pagination";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import FlagIcon from "@mui/icons-material/Flag";
import { Close as CloseIcon, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getAPIAuth, postAPI } from "utils/__api__/ApiServies";
import { Avatar, CircularProgress, Rating, Dialog, DialogActions, DialogTitle, IconButton, Card } from "@mui/material";
import moment from 'moment';


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

const ReviewsTab = ({ vendor_id, setSummary }) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [productImageBaseUrl, setProductImageBaseUrl] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [dialogImages, setDialogImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const getAllVendorReview = async (page) => {

    try {
      setLoading(true);
      const baseurl = 'product-reviews';
      const queryPayload = {
        vendor_id,
        review_type: "shop",
        page,
        limit: 10
      }
      const url = `${baseurl}?${new URLSearchParams(queryPayload).toString()}`;
      const res = await getAPIAuth(url);
      if (res.status === 200) {
        setLoading(false);
        setReviews(res?.data?.reviews);
        setAvgRating(res?.data?.summary?.shopRatingAvg);
        setImageBaseUrl(res?.data?.image_url);
        setProductImageBaseUrl("https://api.agukart.com/uploads/product/");
        setTotalPages(res?.data?.pagination?.pages);
        setSummary(res?.data?.summary)
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    if (vendor_id) {
      getAllVendorReview(page);
    }
  }, [vendor_id, page])

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const openImageDialog = (images, index = 0) => {
    setDialogImages(images);
    setActiveImageIndex(index);
    setOpen(true);
  };

  const handleImageDialogClose = () => {
    setOpen(false);
    setDialogImages([]);
  }

  const handlePrev = () => {
    setActiveImageIndex(prev =>
      prev === 0 ? dialogImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveImageIndex(prev =>
      prev === dialogImages.length - 1 ? 0 : prev + 1
    );
  };

  const ReviewCard = ({ review }) => (
    <Box sx={{ borderBottom: '1px solid #e5e5e5', py: 3 }}>
      {/* Main layout */}
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1.5}
      >

        {/* Left avatar */}
        <Avatar
          src={"https://api.agukart.com/uploads/profileImage/" + review.user_image}
          sx={{ width: 42, height: 42, flexShrink: 0 }}
        />

        {/* Right content */}
        <Box flex={1}>

          {/* Name + date */}
          <Typography fontSize={15} mb={1.5}>
            <span
              style={{
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {review.user_name}
            </span>

            <span style={{ color: '#666' }}>
              {' '}on {moment(review.createdAt).format('MMM DD, YYYY')}
            </span>
          </Typography>

          {review.recommended && (
            <Box display="flex" alignItems="center" gap={0.5} mb={1}>
              <Typography fontSize={13} sx={{ color: '#2e7d32', fontWeight: 500 }}>
                ✓ Recommends this item
              </Typography>
            </Box>
          )}

          {/* Photos */}
          {review.photos?.length > 0 && (
            <Box
              display="flex"
              gap={1.5}
              mb={1.5}
              flexWrap="wrap"
            >
              {review.photos.map((photo, i) => (
                <Box
                  key={i}
                  component="img"
                  src={"https://api.agukart.com/uploads/ratings/" + photo}
                  alt=""
                  onClick={() => openImageDialog(review.photos, i)}
                  sx={{
                    width: { xs: 90, sm: 120, md: 140 },
                    height: { xs: 90, sm: 120, md: 140 },
                    objectFit: 'cover',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Rating */}
          <Rating
            value={review.rating}
            readOnly
            size="small"
            sx={{ mb: 1 }}
          />

          {/* Comment */}
          <Typography
            fontSize={14}
            color="#333"
            lineHeight={1.7}
            mb={1.5}
          >
            {review.additional_comment}
          </Typography>

          {/* Seller reply */}
          {review.seller_reply?.message && (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                mt: 1.5,
                mb: 2,
                background: '#f7f7f7',
                borderRadius: 1,
                p: 1.5,
              }}
            >
              <Avatar
                src={"https://api.agukart.com/uploads/shop-icon/" + review.seller_reply.shop_image}
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "#fff",
                  color: "#000",
                  fontFamily: "Constantia, serif",
                  fontSize: 28,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  border: "2px solid",
                  borderColor: "divider",
                  fontSmooth: "anti-aliased"
                }}
              >
                A
              </Avatar>

              <Box>
                <Typography fontSize={13}>
                  <span
                    style={{
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {review.seller_reply.shop_name}
                  </span>

                  <span style={{ color: '#666' }}>
                    {' '}
                    responded on{' '}
                    {moment(
                      review.seller_reply.replied_on
                    ).format('MMM DD, YYYY')}
                  </span>
                </Typography>

                <Typography
                  fontSize={13}
                  color="#444"
                  mt={0.5}
                >
                  {review.seller_reply?.message}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Purchased item */}
          {review.purchased_item && (
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
              mt={1}
              component={Link}
              href={`/product/${review.purchased_item.slug}/${review.purchased_item.product_code}`}
              passHref
              sx={{ '&:hover': { textDecoration: "underline" } }}
              border={"1px solid #eaeaea"}
            >
              <Box
                component="img"
                src={"https://api.agukart.com/uploads/product/" + review.purchased_item.image}
                alt=""
                sx={{
                  width: { xs: 52, md: 64 },
                  height: { xs: 52, md: 64 },
                  objectFit: 'cover',
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />

              <Typography
                fontSize={13}
                color="#555"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {review.purchased_item.title.replace(/<[^>]*>/g, '')}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {
        loading ?
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              padding: "48px",
              height: "100vh",
            }}
          >
            <CircularProgress size={20} />
          </Box>
          :
          <Box px={{xs: 0, md: 10}}>
            <Typography variant="h5" fontWeight={600}>
              Review
            </Typography>
            <Box
              mt={2}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Typography pr={1}>Average item review</Typography>
                <Typography
                  pr={1}
                  component="div"
                  sx={{ paddingTop: "4px" }}
                  display={"flex"}
                  alignItems={"center"}
                >
                  <Rating
                    precision={0.5}
                    value={Number(avgRating) || 0}
                    size="small"
                    readOnly
                    sx={{
                      fontSize: 13,
                      color: '#fbc02d'
                    }}
                  />
                </Typography>
                <Typography>{reviews?.length}</Typography>
              </Typography>
            </Box>
            <Box>
              {
                reviews?.map((review, i) => (
                  <ReviewCard key={review._id} review={review} />
                ))
              }
            </Box>
            {
              reviews.length > 0 && (
                <Box mt={4}>
                  <Pagination count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined" />
                </Box>
              )
            }
          </Box>
      }
      <Dialog
        open={open}
        onClose={handleImageDialogClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: "90vw", sm: "80vw", md: "60vw", lg: "50vw" },
            maxWidth: "900px",
            height: { xs: "80vh", sm: "85vh", md: "85vh" },
            maxHeight: "800px",
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            bgcolor: "#f5f0eb",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          },
        }}
      >

        <DialogTitle sx={{ p: 0 }}>
          {/* Close Button - Top Right */}
          <IconButton
            onClick={handleImageDialogClose}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 20,
              color: "rgba(0,0,0,0.5)",
              bgcolor: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(4px)",
              width: 36,
              height: 36,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
                color: "#000",
              },
            }}
            component={Card}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Counter - Top Left */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 20,
              zIndex: 20,
            }}
            component={Card}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(0,0,0,0.5)",
                bgcolor: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(4px)",
                px: 1.5,
                py: 0.5,
                borderRadius: 16,
              }}
            >
              {activeImageIndex + 1} / {dialogImages.length}
            </Typography>
          </Box>
        </DialogTitle>

        {/* Navigation Buttons */}
        {dialogImages.length > 1 && (
          <>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                bgcolor: "rgba(255,255,255,0.7)",
                color: "#333",
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.95)",
                },
              }}
              component={Card}
            >
              <ChevronLeft sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>

            <IconButton
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                bgcolor: "rgba(255,255,255,0.7)",
                color: "#333",
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.95)",
                },
              }}
              component={Card}
            >
              <ChevronRight sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </>
        )}

        {/* Main Image Area */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: dialogImages.length > 1
              ? "calc(100% - 120px)"
              : "calc(100% - 60px)",
            px: { xs: 2, sm: 4 },
            pt: 4,
            pb: dialogImages.length > 1 ? 0 : 2,
          }}
        >
          <Box
            component="img"
            src={`https://api.agukart.com/uploads/ratings/${dialogImages[activeImageIndex]}`}
            alt={`Product image ${activeImageIndex + 1}`}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: 1,
              userSelect: "none",
              WebkitUserDrag: "none",
            }}
          />
        </Box>

        {/* Thumbnail Strip - Bottom */}
        {dialogImages.length > 1 && (
          <DialogActions sx={{ p: 0, justifyContent: "center" }}>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
                px: 2,
                py: 1.5,
                overflowX: "auto",
                overflowY: "hidden",
                maxWidth: "100%",
                "&::-webkit-scrollbar": {
                  height: 3,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "rgba(0,0,0,0.15)",
                  borderRadius: 10,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "transparent",
                },
              }}
            >
              {dialogImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  sx={{
                    width: 64,
                    height: 64,
                    minWidth: 64,
                    flexShrink: 0,
                    borderRadius: 1,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: index === activeImageIndex
                      ? "2px solid #333"
                      : "2px solid transparent",
                    opacity: index === activeImageIndex ? 1 : 0.5,
                    transition: "all 0.2s",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={`https://api.agukart.com/uploads/ratings/${img}`}
                    alt={`Thumbnail ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </Box>
              ))}
            </Box>
          </DialogActions>
        )}

      </Dialog>
    </>
  );
};

export default ReviewsTab;
