import { Box, Button, Grid, Typography } from "@mui/material";
import { H2, H3, H4, H6 } from "components/Typography";
import { useCurrency } from "contexts/CurrencyContext";
import React, { useState } from "react";
import MessagePopup from "./MessagePopup";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
const Product = ({ baseUrl, shopBaseUrl, setReviewId, setVendorId, SetOpenPopup, order, product, setReviewProduct, handleOpenReview }) => {
  console.log({ order, product, shopBaseUrl, baseUrl }, "DFhrtfyhrthjrthrt");
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
        <Grid lg={9} md={6} xs={12} sx={{ paddingTop: "0" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                height: "80px",
                minWidth: "80px",
              }}
              border={"1px solid gray"}
            >
              <img
                alt="banner"
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
                src={baseUrl + product?.productData?.image[0]}
              />
            </Box>
            <Typography component="div" ml={2}>
              <H3
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
                fontWeight={600}
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
                    router.push(product.productData.product_code ? `/product/${product.product_id}` : `/products/${product.product_id}`) //old order fallback
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
        <Grid lg={3} md={6} xs={12} sx={{ paddingTop: "0" }}>
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
          </Box>
        </Grid>
        {/* <Box sx={{ flex: 1 }}>
          {!hasReview ? (
            <Box sx={{ bgcolor: "#f8f7f3", borderRadius: 2, p: 3, border: "1px solid #ece8dc", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
              <Typography fontSize={14} color="text.secondary">You haven't reviewed this item yet.</Typography>
            </Box>
          ) : (
            <Box sx={{ bgcolor: "#f8f7f3", borderRadius: 2, p: 2, border: "1px solid #ece8dc" }}>
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
              {review.photoUrls?.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                  {review.photoUrls.map((url, i) => (
                    <Box key={i} sx={{ width: 72, height: 72, borderRadius: 1, overflow: "hidden", border: "1px solid #ddd" }}>
                      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                  ))}
                </Box>
              )}
              <Typography sx={{ color: "#4d4d4d", fontSize: 14, lineHeight: 1.6 }}>{review.review}</Typography>
        
              <Typography
                onClick={() => !isLocked && handleOpenEditReview(product)}
                sx={{ mt: 1.5, color: isLocked ? "#b5b5b5" : "#666", fontSize: 13, textDecoration: "underline", cursor: isLocked ? "not-allowed" : "pointer", width: "fit-content", opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? "none" : "auto" }}
              >
                Edit review
              </Typography>
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
              {buyerNote && (
                <Box sx={{ mt: 2, bgcolor: "#fff8e1", border: "1px solid #f1d58a", borderRadius: 2, p: 2 }}>
                  <Typography sx={{ fontSize: 13, color: "#8a6d1d", lineHeight: 1.6 }}>
                    <strong>Note to Buyer:</strong> {buyerNote}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box> */}
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
export default Product; 3