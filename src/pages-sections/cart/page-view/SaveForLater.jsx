"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import useMyProvider from "hooks/useMyProvider";
import useCart from "hooks/useCart";
import useAuth from "hooks/useAuth";
import { useCurrency } from "contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
import Link from "next/link";
import { Paper } from "@mui/material";
import SavedProductCheckout from "./SavedProductCheckout";

const getSavedProductId = (item) =>
  item?._id || item?.save_id || item?.saved_id || item?.id;

const getProductSlug = (item) => item?.slug || item?.product_slug || "";

const getProductCode = (item) =>
  item?.product_code || item?.code || item?.productCode || "";

const getProductImage = (item) =>
  item?.image?.[0]
    ? `https://api.agukart.com/uploads/product/${item.image[0]}`
    : "";

const getProductName = (item) =>
  item?.product_title?.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 12).join(" ") + '...' || "Saved item";

const getShopName = (item) =>
  item?.shop_name || item?.vendor_name || item?.shop?.shop_name || "";

const getPrice = (item) =>
  Number(item?.saved_price || 0);

const getOriginalPrice = (item) =>
  Number(item?.saved_original_price || 0);

const getPersonalization = (item) => {
  const allChips = [];

  // Handle variants array format
  if (Array.isArray(item?.variants) && item.variants.length > 0) {
    const variantsChips = item.variants.map((variant, index) => ({
      id: `variants-${index}`,
      label: `${variant.variantName}: ${variant.attributeName}`,
      variantName: variant.variantName,
      attributeName: variant.attributeName,
      source: 'variants'
    }));
    allChips.push(...variantsChips);
  }

  // Handle variant_id and variant_attribute_id relationship
  if (Array.isArray(item?.variant_id) && Array.isArray(item?.variant_attribute_id)) {
    item.variant_id.forEach((variant) => {
      const matchingAttribute = item.variant_attribute_id.find(
        (attr) => attr.variant === variant._id
      );

      if (matchingAttribute) {
        allChips.push({
          id: variant._id,
          label: `${variant.variant_name}: ${matchingAttribute.attribute_value}`,
          variantName: variant.variant_name,
          attributeValue: matchingAttribute.attribute_value,
          source: 'variant_id'
        });
      }
    });
  }

  // Remove duplicates based on label (optional - if needed)
  const uniqueChips = allChips.filter((chip, index, self) =>
    index === self.findIndex((c) => c.label === chip.label)
  );

  if (uniqueChips.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {uniqueChips.map((chip) => (
        <Box
          key={chip.id}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '16px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#333',
            border: '1px solid #e0e0e0',
          }}
        >
          {chip.label}
        </Box>
      ))}
    </Box>
  );
};

const getCustomizationChips = (item) => {
  const allChips = [];

  // Check if customizationData exists and is an array
  if (Array.isArray(item?.customizationData) && item.customizationData.length > 0) {
    item.customizationData.forEach((customization, index) => {
      // Handle each customization object
      Object.entries(customization).forEach(([key, value]) => {
        if (value && typeof value === 'object') {
          // Handle Personalization Engraved Name type
          if (value.value) {
            allChips.push({
              id: `customization-${index}-${key}`,
              label: `${key}: ${value.value}`,
              type: key,
              value: value.value,
              price: value.price,
              min: value.min,
              max: value.max
            });
          }
        } else if (value && typeof value === 'string') {
          // Handle simple key-value pairs like Metal Type
          allChips.push({
            id: `customization-${index}-${key}`,
            label: `${key}: ${value}`,
            type: key,
            value: value
          });
        } else if (value && typeof value === 'object' && value.value) {
          // Handle nested objects with value property
          allChips.push({
            id: `customization-${index}-${key}`,
            label: `${key}: ${value.value}`,
            type: key,
            ...value
          });
        }
      });
    });
  }

  if (allChips.length === 0) return null;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {allChips.map((chip) => (
        <Box
          key={chip.id}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#e8f0fe',
            borderRadius: '16px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#1a73e8',
            border: '1px solid #d2e3fc',
          }}
        >
          {chip.label}
          {/* {chip.price && (
            <Box
              component="span"
              sx={{
                ml: 0.5,
                color: '#0d47a1',
                fontWeight: 600,
              }}
            >
              (+${chip.price})
            </Box>
          )} */}
        </Box>
      ))}
    </Box>
  );
};

const SaveForLater = () => {
  const router = useRouter();
  const { addToast } = useToasts();
  const { token } = useAuth();
  const { currency } = useCurrency();
  const { getCartItems, getCartDetails } = useCart();
  const {
    savedProducts,
    getSavedProducts,
    deleteSavedProduct,
    moveSavedProductToCart,
  } = useMyProvider();

  const [loading, setLoading] = useState(true);
  const [activeActionId, setActiveActionId] = useState(null);
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const items = useMemo(
    () => (Array.isArray(savedProducts) ? savedProducts : []),
    [savedProducts],
  );

  useEffect(() => {
    let isMounted = true;

    const loadSavedProducts = async () => {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        await getSavedProducts();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSavedProducts();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const refreshCart = async () => {
    await getCartItems();
    await getCartDetails("0", null, 0);
  };

  const handleMoveToCart = async (item, redirectToCart = false) => {
    const saveId = getSavedProductId(item);
    if (!saveId) return;

    try {
      setActiveActionId(`${saveId}-move`);
      const res = await moveSavedProductToCart(saveId);
      if (res?.status === 200) {
        await refreshCart();
        addToast("Moved to cart", {
          appearance: "success",
          autoDismiss: true,
        });

        if (redirectToCart) {
          router.push("/cart");
        }
      }
    } catch (error) {
      addToast(
        error?.response?.data?.message || "Failed to move item to cart",
        {
          appearance: "error",
          autoDismiss: true,
        },
      );
    } finally {
      setActiveActionId(null);
    }
  };

  const handleRemove = async (item) => {
    const saveId = getSavedProductId(item);
    if (!saveId) return;

    try {
      setActiveActionId(`${saveId}-remove`);
      const res = await deleteSavedProduct(saveId);
      if (res?.status === 200) {
        addToast("Removed from saved items", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast(
        error?.response?.data?.message || "Failed to remove saved item",
        {
          appearance: "error",
          autoDismiss: true,
        },
      );
    } finally {
      setActiveActionId(null);
    }
  };

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    setCheckoutItem(null);
  }

  if (!token) return null;

  return (
    <>
      <Box
        sx={{
          mt: 2,
          mb: 2,
          overflow: "hidden",
          p: { xs: 2, md: 2.5 },
          px: { xs: 2, md: 12 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 600,
              color: "#000",
              pb: 1,
              mb: 2,
            }}
          >
            {items.length} item{items.length === 1 ? "" : "s"} saved for later
          </Typography>

          {loading ? (
            <SaveForLaterSkeleton />
          ) : items.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 5,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontSize: 18, fontWeight: 600, color: "#000", mb: 1 }}
              >
                Nothing saved yet
              </Typography>
              <Typography sx={{ color: "#656464", fontSize: 14, mb: 3 }}>
                Items you save for later will show up here for quick checkout.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => router.push("/")}
                sx={{
                  borderRadius: "25px",
                  px: 3,
                  py: 1,
                  borderColor: "#0e0e0e2e",
                  color: "#000",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Continue shopping
              </Button>
            </Box>
          ) : (
            <>
              {items.map((item, index) => {
                const itemId = getSavedProductId(item);
                const slug = getProductSlug(item?.product_id);
                const productCode = getProductCode(item?.product_id);
                const href =
                  slug && productCode
                    ? `/product/${slug}/${productCode}`
                    : slug
                      ? `/product/${slug}`
                      : "#";
                const price = getPrice(item);
                const originalPrice = getOriginalPrice(item);
                const hasDiscount = originalPrice > price && price > 0;
                const discountPercent = hasDiscount
                  ? Math.round(((originalPrice - price) / originalPrice) * 100)
                  : 0;
                const isMoving = activeActionId === `${itemId}-move`;
                const isRemoving = activeActionId === `${itemId}-remove`;

                return (
                  <Box key={itemId || index}>
                    {index > 0 && <Divider sx={{ my: 2.5, color: 'divider' }} />}

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "180px 1fr 170px" },
                        gap: { xs: 2, md: 2.25 },
                        alignItems: "start",
                      }}
                    >
                      <Box
                        sx={{
                          display: "block",
                          width: "100%",
                          maxWidth: { xs: "100%", sm: 180, md: 180 },
                          textDecoration: "none",
                        }}
                        component={Paper}
                        paperElevation={3}
                        boxShadow={2}
                      >
                        <Avatar
                          component={Link}
                          href={href}
                          src={getProductImage(item?.product_id)}
                          alt={getProductName(item)}
                          variant="square"
                          sx={{
                            width: "100%",
                            height: { xs: 220, md: 180 },
                            objectFit: "cover",
                            borderRadius: 2,
                            backgroundColor: "#fff",
                          }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        <Typography
                          component={Link}
                          href={href}
                          sx={{
                            display: "inline-block",
                            color: "#000",
                            textDecoration: "none",
                            fontSize: 16,
                            lineHeight: 1.7,
                            "&:hover": {
                              textDecoration: "underline !important",
                            },
                          }}
                        >
                          {getProductName(item.product_id)}
                        </Typography>

                        {item.shop && (
                          <Typography sx={{ mt: 0.5, color: "gray", fontSize: 12 }}>
                            from{" "}
                            <Box
                              component={Link}
                              href={`/shop/${item.shop.slug}`}
                              sx={{
                                color: "#303030",
                                fontWeight: 500,
                                '&:hover': {
                                  textDecoration: "underline",
                                  textUnderlineOffset: "2px",
                                }
                              }}
                            >
                              {getShopName(item.shop)}
                            </Box>
                          </Typography>
                        )}

                        <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {getPersonalization(item)}
                          {getCustomizationChips(item)}
                        </Box>

                        <Box
                          sx={{
                            mt: "auto",
                            display: { xs: "grid", md: "flex" },
                            gridTemplateColumns: { xs: "1fr 1fr", md: "none" },
                            gap: { xs: 1, sm: 2, md: 4 },
                            alignItems: "center",
                            '.MuiButton-root': {
                              maxWidth: { xs: "200px", md: "auto" },
                            },
                          }}
                          py={1}
                        >
                          <Button
                            variant="contained"
                            disabled={isMoving || isRemoving}
                            onClick={() => {
                              setCheckoutItem(item);
                              setCheckoutOpen(true);
                            }}
                            sx={{
                              borderRadius: "25px",
                              px: 2.5,
                              py: 0.9,
                              backgroundColor: "#000",
                              color: "#fff",
                              textTransform: "none",
                              fontSize: "14px",
                              fontWeight: 600,
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "#323232",
                                boxShadow: "none",
                              },
                            }}
                          >
                            Buy it now
                          </Button>

                          <Button
                            variant="outlined"
                            disabled={isMoving || isRemoving}
                            onClick={() => handleMoveToCart(item, true)}
                            sx={{
                              borderRadius: "25px",
                              px: 2.5,
                              py: 0.9,
                              borderColor: "#0e0e0e2e",
                              color: "#000",
                              textTransform: "none",
                              fontSize: "14px",
                              fontWeight: 600,
                            }}
                          >
                            Move to cart
                          </Button>

                          <Button
                            variant="text"
                            component={Link}
                            href={href}
                            sx={{
                              color: "#000",
                              textTransform: "none",
                              fontSize: "14px",
                              fontWeight: 600,
                              minWidth: "auto",
                              px: 1,
                            }}
                          >
                            View
                          </Button>

                          <Button
                            variant="text"
                            disabled={isMoving || isRemoving}
                            onClick={() => handleRemove(item)}
                            sx={{
                              color: "#000",
                              textTransform: "none",
                              fontSize: "14px",
                              fontWeight: 600,
                              minWidth: "auto",
                              px: 1,
                            }}
                          >
                            Remove
                          </Button>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          textAlign: { xs: "left", md: "right" },
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#000",
                            fontSize: 19,
                            fontWeight: 600,
                          }}
                        >
                          {currency?.symbol}
                          {(price * currency?.rate).toFixed(2)}
                        </Typography>

                        {hasDiscount && (
                          <Typography sx={{ mt: 0.25, color: "gray", fontSize: 14 }}>
                            <Box component="span" sx={{ textDecoration: "line-through", pr: 0.5 }}>
                              {currency?.symbol}
                              {(originalPrice * currency?.rate).toFixed(2)}
                            </Box>
                            ({discountPercent}% off)
                          </Typography>
                        )}

                        <Typography sx={{ mt: 0.25, color: "gray", fontSize: 12 }}>
                          plus shipping charges
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}

              <Box sx={{ textAlign: "center", pt: 5 }}>
                <Typography sx={{ color: "#000", fontSize: 16, mb: 2 }}>
                  Looking for more of your finds?
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/profile/wish-list")}
                  sx={{
                    borderRadius: "25px",
                    px: 3,
                    py: 1,
                    borderColor: "#0e0e0e2e",
                    color: "#000",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  View your favourites
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
      <SavedProductCheckout
        open={checkoutOpen}
        onClose={handleCheckoutClose}  // Changed from 'close' to 'onClose'
        savedItems={checkoutItem ? [checkoutItem] : []}  // Pass single item as array
        vendorId={checkoutItem?.vendor_id}
        vendorName={checkoutItem?.shop?.shop_name}
        vendorIcon={checkoutItem?.shop?.shop_icon || ""}
      />
    </>
  );
};

const SaveForLaterSkeleton = () => (
  <>
    {[0, 1].map((item) => (
      <Box key={item}>
        {item > 0 && <Divider sx={{ my: 3, borderColor: "#ece7e3" }} />}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "180px 1fr 180px" },
            gap: { xs: 2, md: 3 },
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{ borderRadius: "8px", width: "100%", height: { xs: 220, md: 150 } }}
          />
          <Box>
            <Skeleton variant="text" width="85%" height={36} />
            <Skeleton variant="text" width="38%" height={28} />
            <Skeleton variant="text" width="58%" height={28} />
            <Box sx={{ display: "flex", gap: 1.2, mt: 2.5, flexWrap: "wrap" }}>
              <Skeleton variant="rounded" width={124} height={44} />
              <Skeleton variant="rounded" width={140} height={44} />
              <Skeleton variant="rounded" width={90} height={44} />
            </Box>
          </Box>
          <Box>
            <Skeleton variant="text" width="70%" height={34} sx={{ ml: "auto" }} />
            <Skeleton variant="text" width="90%" height={24} sx={{ ml: "auto" }} />
            <Skeleton variant="text" width="65%" height={24} sx={{ ml: "auto" }} />
          </Box>
        </Box>
      </Box>
    ))}
  </>
);

export default SaveForLater;
