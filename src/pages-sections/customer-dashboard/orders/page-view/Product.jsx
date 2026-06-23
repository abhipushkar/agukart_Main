import { Box, Button, Grid, Typography, Rating, Avatar, Alert } from "@mui/material";
import { H2, H3, H4, H6 } from "components/Typography";
import { useCurrency } from "contexts/CurrencyContext";
import React, { useState } from "react";
import MessagePopup from "./MessagePopup";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
import LightPopover from "components/TooltipPopover/LightPopover";
import { Flag as FlagIcon } from "@mui/icons-material";
import { fontSize } from "theme/typography";

const Product = ({ baseUrl, shopBaseUrl, setReviewId, setVendorId, SetOpenPopup, order, product, setReviewProduct, handleOpenReview, handleOpenEditReview }) => {
  console.log({ order, rating: product.ratingData[0], shopBaseUrl, baseUrl }, "DFhrtfyhrthjrthrt");
  const reviewHidden = product.ratingData?.[0]?.is_hidden;
  const review = reviewHidden ? null : product.ratingData?.[0];
  const reviewNote = product.ratingData?.[0]?.buyer_note?.note ? product.ratingData?.[0]?.buyer_note?.note : null;
  const router = useRouter();
  const { addToast } = useToasts();
  const { currency } = useCurrency();
  const [openMessagePopup, SetMessageOpenPopup] = useState(false);
  const handleMessageClickPopup = () => {
    SetMessageOpenPopup(true);
  };
  const handleMessageClosePopup = () => {
    SetMessageOpenPopup(false);
  };
  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ margin: "0", width: "100%", mb: "20px" }}
      >
        <Grid lg={(review || reviewNote) ? 6 : 9} md={(review || reviewNote) ? 6 : 9} xs={12} sx={{ paddingTop: "0" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src={baseUrl + (product?.productData?.edited_image || product?.productData?.image?.[0])}
              alt={product?.productData?.product_title}
              sx={{
                width: { xs: 70, md: 100 },
                height: { xs: 70, md: 100 },
                minWidth: { xs: 70, md: 100 },
                border: "1px solid #d9d9d9",
                borderRadius: 1,
                p: 0,
                objectFit: "contain",
                bgcolor: "#fff",
              }}
            />
            <Typography component="div" ml={2}>
              <H3
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  cursor: "pointer",
                  fontSize: {xs: "14px", sm: "16px", md: "18px", lg: "18px"}
                }}
                fontWeight={600}
                onClick={() =>
                  router.push(product.productData.product_code ? `/product/slug/${product.productData.product_code}` : `/products/${product.product_id}`) //old order fallback
                }
              >
                {product?.productData?.product_title?.replace(
                  /<\/?[^>]+(>|$)/g,
                  ""
                )}
              </H3>
              {product?.isCombination && (
                <>
                  {product?.variantData?.map((variant, index) => (
                    <Typography
                      fontSize={17}
                      color="gray"
                      key={`variant-${index}`}
                    >
                      {variant?.variant_name}:{" "}
                      <Typography fontSize={17} component="span">
                        {product?.variantAttributeData?.[index]
                          ?.attribute_value || "N/A"}
                      </Typography>
                    </Typography>
                  ))}
                </>
              )}
              {product?.customize == "Yes" && (
                <>
                  {product?.customizationData?.map((item, index) => (
                    <div key={index}>
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key}>
                          {typeof value === "object" ? (
                            <div>
                              {key}:
                              {`${value?.value} (${currency?.symbol} ${(value?.price * currency?.rate).toFixed(2)})`}
                            </div>
                          ) : (
                            <div>
                              {key}: {value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
              <Typography fontSize={15}>
                <span style={{ fontWeight: "600" }}>Qty :</span>
                <span> {product.qty}</span>
              </Typography>
              <Box
                mt={1}
                display="flex"
                width={{ xs: "100%", sm: "auto" }}
                maxWidth={{ xs: "100%", sm: "none" }}
                flexDirection={{ xs: "column", sm: "row", md: "row" }}
                gap={2}
              >
                <Button
                  onClick={() =>
                    router.push(product.productData.product_code ? `/product/slug/${product.productData.product_code}` : `/products/${product.product_id}`) //old order fallback
                  }
                  variant="contained"
                  size="small"
                  sx={{
                    background: "#efe8bd",
                    borderRadius: "30px",
                    width: { xs: "100%", sm: "130px" },
                    minWidth: { xs: "100%", sm: "130px" },
                    textTransform: "none",
                  }}
                >
                  Buy it again
                </Button>
                <Button
                  onClick={handleMessageClickPopup}
                  variant="contained"
                  size="small"
                  sx={{
                    background: "#efe8bd",
                    borderRadius: "30px",
                    width: { xs: "100%", sm: "130px" },
                    minWidth: { xs: "100%", sm: "130px" },
                    textTransform: "none",
                  }}
                >
                  Help with order
                </Button>
              </Box>
            </Typography>
          </Box>
        </Grid>
        <Grid lg={!product.is_reviewed ? 3 : 6} md={!product.is_reviewed ? 3 : 6} xs={12} sx={{ paddingTop: { xs: 1 } }}>
          {!product.is_reviewed ? (<Box
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
              {product.order_status == "completed" &&
                product.delivery_status == "Delivered" && (
                  <Button
                    onClick={() => {
                      if (product.ratingStatus) {
                        addToast("Product review have already given", {
                          appearance: "error",
                          autoDismiss: true,
                        });
                        return;
                      }
                      setReviewId(product?._id);
                      setVendorId(product?.vendor_id);
                      handleOpenReview(product?.productData);
                    }}
                    variant="contained"
                    sx={{
                      background: "#fff",
                      borderRadius: "30px",
                      border: "1px solid #000",
                      width: "100%",
                      marginBottom: "12px",
                    }}
                  >
                    write a product review
                  </Button>
                )}
            </Typography>
          </Box>) : ((review && !reviewHidden) || reviewNote) && (

            <Box sx={{ bgcolor: "#f8f7f3", borderRadius: 2, p: 1, border: "1px solid #ece8dc", ml: 2 }}>
              {!reviewHidden && review && (<>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row", md: "row" }, justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <LightPopover
                    title={
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, flexWrap: "wrap", mb: 1 }}>
                        <Rating
                          value={review?.rating}
                          readOnly
                          sx={{
                            fontSize: 22,
                            color: "#000",
                            "& .MuiRating-iconEmpty": {
                              color: "#000",
                            },
                          }}
                        />
                        {[
                          { label: "Item Quality", val: review?.item_rating },
                          { label: "Delivery", val: review?.delivery_rating },
                          { label: "Customer Service", val: review?.customer_service_rating },
                        ].map(({ label, val }) => (
                          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Typography fontSize={12} variant="caption" color="GrayText">{label}:</Typography>
                            <Rating value={val} readOnly size="small" sx={{ fontSize: 14 }} />
                          </Box>
                        ))}
                      </Box>
                    }
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography fontWeight={600} fontSize={15}>Your Review</Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Rating
                          value={review?.rating}
                          readOnly
                          sx={{
                            fontSize: 18,
                            color: "#000",
                            "& .MuiRating-iconEmpty": { color: "#000" },
                          }}
                        />
                        <Typography sx={{ ml: 0.5 }}>⏷</Typography>
                      </Box>
                    </Box>
                  </LightPopover>
                  {review?.recommended && (
                    <Typography fontSize={12} sx={{ bgcolor: "#e8f5e9", color: "#68be6c", px: 1.5, py: 0.3, borderRadius: 10 }}>✓ You Recommended this item</Typography>
                  )}
                </Box>

                {review?.images?.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                    {review?.images.map((url, i) => (
                      <Box key={i} sx={{ width: 72, height: 72, borderRadius: 1, overflow: "hidden", border: "1px solid #ddd" }}>
                        <img src={`https://api.agukart.com/uploads/ratings/${url}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </Box>
                    ))}
                  </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 0.5 }}>
                  {review?.is_flagged && (
                    <FlagIcon sx={{ fontSize: 18, mt: "2px", color: "red" }} />
                  )}
                  <Typography sx={{ color: "#4d4d4d", fontSize: 14, lineHeight: 1.6 }}>
                    {review?.additional_comment}
                  </Typography>
                </Box>
                <Typography
                  onClick={() => {
                    if (review?.is_locked) {
                      addToast("This review is locked and cannot be edited", {
                        appearance: "error",
                        autoDismiss: true
                      });
                      return;
                    }
                    handleOpenEditReview(product);
                  }}
                  sx={{ my: 1, color: review?.is_locked ? "#b5b5b5" : "#666", fontSize: 13, textDecoration: "underline", cursor: review?.is_Locked ? "not-allowed" : "pointer", width: "fit-content", opacity: review?.is_locked ? 0.6 : 1, pointerEvents: review?.is_locked ? "none" : "auto" }}
                >
                  {review?.is_locked ? "You cannot edit this review" : "Edit review"}
                </Typography>
                {review?.seller_reply?.message && (
                  <Box sx={{ mt: 2, bgcolor: "#fff", border: "1px solid #ececec", borderRadius: 2, p: 1 }}>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Avatar
                        src={review?.replyShopIcon ? shopBaseUrl + review?.replyShopIcon : undefined}
                        alt="Shop"
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
                        <Typography fontWeight={600} fontSize={14}>
                          {review?.replyShopName}
                          <Typography component="span" sx={{ color: "#666", fontWeight: 400, ml: 1 }}>responded on {new Date(review?.seller_reply?.replied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) || ""}</Typography>
                        </Typography>
                        <Typography sx={{ mt: 1, color: "#555", fontSize: 14 }}>{review?.seller_reply?.message}</Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </>)}
              {reviewNote && (
                <Typography component={Alert} severity="info" sx={{ fontSize: 13, color: "#5b4b20", bgcolor: "lightyellow", lineHeight: 1.6, my: 0.5, "& .MuiAlert-icon": { color: "#5b4b20" }, "& .MuiAlert-message": { p: 0 } }}>
                  <strong>Note from Agukart:</strong> {reviewNote}
                </Typography>
              )}
            </Box>

          )}

        </Grid>

      </Grid>
      <MessagePopup
        vendorName={product?.vendor_name}
        shopName={product?.vendorData?.shop_name}
        shopImage={`${shopBaseUrl}/${product?.vendorData?.shop_icon}`}
        openPopup={openMessagePopup}
        receiverid={product?.vendor_id}
        productID={product?.productData?._id}
        productData={product}
        product_image={baseUrl + product?.productData?.image[0]}
        orderId={order?.order_id}
        handleClosePopup={handleMessageClosePopup}
        subOrderId={product?.sub_order_id || order?.sub_order_id}
        baseUrl={baseUrl}
        subOrderProducts={order?.items || []}
      />
    </>
  );
};
export default Product;