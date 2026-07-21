import { Box, Button, Grid, Typography, Rating, Avatar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { H2, H3, H4, H6 } from "components/Typography";
import { useCurrency } from "contexts/CurrencyContext";
import React, { useState, useRef } from "react";
import MessagePopup from "./MessagePopup";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
import LightPopover from "components/TooltipPopover/LightPopover";
import { Flag as FlagIcon, Close as CloseIcon, Collections } from "@mui/icons-material";
import parse from 'html-react-parser'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const Product = ({ baseUrl, shopBaseUrl, setReviewId, setVendorId, SetOpenPopup, order, product, setReviewProduct, handleOpenReview, handleOpenEditReview }) => {
  console.log({ order, rating: product.ratingData[0], shopBaseUrl, baseUrl }, "DFhrtfyhrthjrthrt");
  const reviewHidden = product.ratingData?.[0]?.is_hidden;
  const review = reviewHidden ? null : product.ratingData?.[0];
  const reviewNote = product.ratingData?.[0]?.buyer_note?.note ? product.ratingData?.[0]?.buyer_note?.note : null;
  const router = useRouter();
  const { addToast } = useToasts();
  const { currency } = useCurrency();
  const [openMessagePopup, SetMessageOpenPopup] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState({});
  const transformRef = useRef(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleMessageClickPopup = () => {
    SetMessageOpenPopup(true);
  };
  const handleMessageClosePopup = () => {
    SetMessageOpenPopup(false);
  };

  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setCurrentImageIndex(0);
  };

  const getVariantImages = () => {
    let images = [];
    console.log(product, "productd")
    product?.variants.forEach((variant, i) => {
      const currVariant = product?.productData.product_variants.find(pv => pv.variant_name.trim().toLowerCase() === variant.variantName.trim().toLowerCase());
      const imageAttr = currVariant.variant_attributes.find(a => a.attribute.trim().toLowerCase() === variant.attributeName.trim().toLowerCase());
      if (imageAttr && (imageAttr.main_images.filter(Boolean).length || imageAttr.preview_image || imageAttr.thumbnail)) {
        const currAttrMainImage = imageAttr.edit_main_image || imageAttr.main_images.filter(Boolean)[0] || imageAttr.preview_image || `${baseUrl}/${product?.productData.image[0]}`;
        const variant_attr_name = variant.variantName + ": " + variant.attributeName;
        images.push({ name: variant_attr_name, image: currAttrMainImage, thumbnail: imageAttr.thumbnail });
      }
    });
    return images;
  };

  const getCustomizationImages = () => {
    let images = [];
    const customization = product?.customizationData?.[0];
    if (!customization || product?.customize !== "Yes") {
      return [];
    }
    Object.entries(customization).forEach(([key, value]) => {
      const mainImage = Array.isArray(value.main_images) ? value.main_images.find(Boolean)
        : null;
      if (mainImage || value.edit_main_image || value.preview_image || value.thumbnail) {
        const custImage = mainImage || value.edit_main_image || value.preview_image || `${baseUrl}/${product?.productData.image[0]}`;
        images.push({
          name: `${key}: ${value.value}`,
          image: custImage,
          thumbnail: value.thumbnail
        })
      }
    })
    return images;
  };

  const mainImages =
    product?.productData?.image?.map((img) => ({
      name: "main image",
      image: `${baseUrl}/${img}`,
      thumbnail: "",
    })) ?? [];

  const [firstMainImage, ...remainingMainImages] = mainImages;
  if (firstMainImage && firstMainImage?.image && product && product?.productData?.edited_image) {
    firstMainImage.image = `${baseUrl}/${product?.productData?.edited_image}`;
  }

  const images = [
    ...(firstMainImage ? [firstMainImage] : []),
    ...getVariantImages(),
    ...getCustomizationImages(),
    ...remainingMainImages,
  ];

  const goToNextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const goToPrevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };


  const variantHasGuide = (v) => product?.productData.product_variants.find(pv => pv.variant_name === v.variantName).guide || null;
  const handleGuideClick = (variant) => {
    const productVariant = product?.productData.product_variants.find(v => v.variant_name === variant.variantName);
    console.log(productVariant, "pv");
    const guide = productVariant.guide[0];
    setCurrentGuide({
      name: guide.guide_name,
      file: guide.guide_file,
      type: guide.guide_type,
      description: guide.guide_description,
    });
    setGuideOpen(true);
  };


  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ margin: "0", width: "100%", mb: "20px" }}
      >
        <Grid lg={(review || reviewNote) ? 6 : 9} md={(review || reviewNote) ? 6 : 9} xs={12} sx={{ paddingTop: "0" }}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{
              position: "relative",
              display: "inline-block",
              width: { xs: 70, md: 100 },
              height: { xs: 70, md: 100 },
              minWidth: { xs: 70, md: 100 },
              mt: 1, cursor: 'pointer'
            }}
              onClick={handleImageClick}
            >
              <Box
                component="img"
                src={baseUrl + (product?.productData?.edited_image || product?.productData?.image?.[0])}
                alt={product?.productData?.product_title}
                sx={{
                  border: "1px solid #d9d9d9",
                  borderRadius: 1,
                  p: 0,
                  objectFit: "contain",
                  bgcolor: "#fff",
                  width: '100%', height: '100%',

                }}
              />
              {images.length > 1 && (
                <Typography component={'span'}
                  sx={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    padding: "3px 3px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    backgroundColor: 'white'
                  }}
                >
                  <Collections fontSize='9px' /> {images.length}
                </Typography>)}
            </Box>
            <Box>
              <Box pt={1} pl={2}>
                <H3
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    fontSize: { xs: "14px", sm: "14px", md: "16px", lg: "16px" },
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                  fontWeight={600}
                  onClick={() =>
                    router.push(product.productData.product_code ? `/product/slug/${product.productData.product_code}` : `/products/${product.product_id}`) //old order fallback
                  }
                >
                  {product?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "").replace('&amp;', "&")}
                </H3>
                <Typography fontSize={15} pt={1}>
                  <span style={{ fontWeight: "600" }}>Qty :</span>
                  <span> {product.qty}</span>
                </Typography>
              </Box>
              <Box ml={2} display={{xs: 'none', md: 'block'}}>

                {product?.variantData.length > 0 && product?.variantData?.map((variant, index) => (
                  <Typography
                    fontSize={17}
                    key={`variant-${index}`}
                  >
                    {variant?.variant_name} {"  "}:{"  "}
                    <Typography fontSize={17} fontWeight={500} component="span">
                      {product?.variantAttributeData?.[index]
                        ?.attribute_value || "N/A"}
                    </Typography>
                  </Typography>
                ))}
                {product?.variants && product.variants.length > 0 && (
                  product.variants.map((variant, index) => (
                    <Typography
                      fontSize={14}
                      sx={{ color: "#000", pt: 0.5 }}
                      key={variant._id || index}
                    >
                      {variant.variantName}{variantHasGuide(variant) && variantHasGuide(variant)?.[0] && (<Typography component={"span"} color="primary.main" ml={1.5}
                        onClick={() => handleGuideClick(variant)} sx={{ cursor: "pointer", borderColor: 'primary', border: "1px solid", px: 1, borderRadius: 1, fontSize: 12 }} fontWeight={600}
                      >Guide</Typography>)}{"   "}:{"   "}
                      <Box component="span" ml={1} fontWeight={500}>
                        {variant.attributeName}
                      </Box>

                    </Typography>
                  ))
                )}
                {product?.customize == "Yes" && (
                  <>
                    {product?.customizationData?.map((item, index) => (
                      <div key={index}>
                        {Object.entries(item).map(([key, value]) => (
                          <div key={key} style={{ paddingTop: 4 }}>
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

                <Box
                  mt={1}
                  display="flex"
                  width={{ xs: "100%", sm: "auto" }}
                  maxWidth={{ xs: "100%", sm: "none" }}
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
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* mobile only grid */}
        <Grid
          item
          xs={12}
          sx={{ display: { xs: "block", md: "none" }, paddingLeft: "0 !important", }}
        >
          {product?.variantData.length > 0 && product?.variantData?.map((variant, index) => (
            <Typography
              fontSize={17}
              key={`variant-${index}`}
            >
              {variant?.variant_name} {"  "}:{"  "}
              <Typography fontSize={17} fontWeight={500} component="span">
                {product?.variantAttributeData?.[index]
                  ?.attribute_value || "N/A"}
              </Typography>
            </Typography>
          ))}
          {product?.variants && product.variants.length > 0 && (
            product.variants.map((variant, index) => (
              <Typography
                fontSize={14}
                sx={{ color: "#000", pt: 0.5 }}
                key={variant._id || index}
              >
                {variant.variantName}{variantHasGuide(variant) && variantHasGuide(variant)?.[0] && (<Typography component={"span"} color="primary.main" ml={1.5}
                  onClick={() => handleGuideClick(variant)} sx={{ cursor: "pointer", borderColor: 'primary', border: "1px solid", px: 1, borderRadius: 1, fontSize: 12 }} fontWeight={600}
                >Guide</Typography>)}{"   "}:{"   "}
                <Box component="span" ml={1} fontWeight={500}>
                  {variant.attributeName}
                </Box>

              </Typography>
            ))
          )}
          {product?.customize == "Yes" && (
            <>
              {product?.customizationData?.map((item, index) => (
                <div key={index}>
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} style={{ paddingTop: 4 }}>
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

          <Box
            mt={2}
            display="flex"
            width={"100%"}
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
                textTransform: "none",
              }}
              fullWidth
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
                textTransform: "none",
              }}
              fullWidth
            >
              Help with order
            </Button>
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
      <Dialog
        open={imageModalOpen}
        onClose={closeImageModal}
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ position: 'relative', padding: 2 }}>
          <Button
            onClick={closeImageModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              minWidth: 'auto',
              padding: '4px'
            }}
          >
            <CloseIcon />
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: "300px" }}>
            <Button
              onClick={goToPrevImage}
              sx={{ minWidth: 'auto', padding: '8px', fontSize: '25px' }}
            >
              ‹
            </Button>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {images[currentImageIndex] && (
                <>
                  <img
                    src={images[currentImageIndex].image}
                    alt={images[currentImageIndex].image}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "500px",
                      objectFit: "contain",
                    }}
                  />

                  {images[currentImageIndex].thumbnail && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: { xs: 0, sm: 6, md: 12 },
                        right: { xs: 0, sm: 6, md: 12 },
                        width: { xs: 40, sm: 60, md: 64 },
                        height: { xs: 40, sm: 60, md: 64 },
                        borderRadius: 1,
                        overflow: "hidden",
                        border: "2px solid #fff",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }}
                    >
                      <img
                        src={images[currentImageIndex].thumbnail}
                        alt="Thumbnail"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>

            <Button
              onClick={goToNextImage}
              sx={{ minWidth: 'auto', padding: '8px', fontSize: '25px' }}
            >
              ›
            </Button>
          </Box>

          {images.length > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, gap: 5 }}>
              <Typography variant="body1" fontWeight={500} fontSize={{xs: 12, sm : 14}}>
                {images[currentImageIndex].name}
              </Typography>
              <Typography fontSize={{xs: 12, sm : 14}}>
                Image {currentImageIndex + 1} of {images.length}
              </Typography>
            </Box>
          )}
        </Box>
      </Dialog>

      {guideOpen && (
        <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} maxWidth="md" fullWidth sx={{ "& .MuiDialog-paper": { maxWidth: "90vw", maxHeight: "95vh" } }}>
          <DialogTitle sx={{ m: 0, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography>{currentGuide?.name} Guide</Typography>
            <IconButton onClick={() => setGuideOpen(false)}><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, overflow: "visible" }}>
            {currentGuide?.description && <Box sx={{ p: 3, pb: 0 }}>{parse(currentGuide.description)}</Box>}
            {currentGuide?.file && currentGuide?.type === "image" && (
              <Box sx={{ width: "100%", height: "85vh", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                <TransformWrapper ref={transformRef} initialScale={1} minScale={1} maxScale={5} wheel={{ step: 0.2 }} doubleClick={{ disabled: false }} pinch={{ step: 10 }} bg>
                  <TransformComponent wrapperStyle={{ display: "inline-block", width: "85vw", height: "fit-content", background: "#f2f2f2", "&:hover": { cursor: "grab" } }} contentStyle={{ display: "inline-block" }}>
                    <img src={currentGuide.file} alt="guide" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }} />
                  </TransformComponent>
                </TransformWrapper>
              </Box>
            )}
            {currentGuide?.file && currentGuide?.type === "video" && <Box sx={{ textAlign: "center", mb: 2 }}><video controls style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "8px" }}><source src={currentGuide.file} type="video/mp4" /></video></Box>}
            {currentGuide?.file && currentGuide?.type === "document" && <Box sx={{ textAlign: "center", mb: 2 }}><Button variant="contained" href={currentGuide.file} target="_blank">View Guide</Button></Box>}
            {!currentGuide?.file && !currentGuide?.description && <Typography color="textSecondary" sx={{ textAlign: "center", py: 4 }}>No guide content available</Typography>}
          </DialogContent>
          {currentGuide?.file && currentGuide?.type === "image" && (
            <DialogActions sx={{ p: 2 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button onClick={() => transformRef.current?.zoomIn()} size="small" variant="outlined">Zoom +</Button>
                <Button onClick={() => transformRef.current?.zoomOut()} size="small" variant="outlined">Zoom -</Button>
                <Button onClick={() => transformRef.current?.resetTransform()} size="small" variant="outlined">Reset</Button>
                <Button onClick={() => setGuideOpen(false)} size="small" variant="outlined">Close</Button>
              </Box>
            </DialogActions>
          )}
        </Dialog>
      )}
      {openMessagePopup && (<MessagePopup
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
      />)}
    </>
  );
};
export default Product;