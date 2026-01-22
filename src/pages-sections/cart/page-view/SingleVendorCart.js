import React, { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import {
  Card,
  Typography,
  Button,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Link from "next/link";
import NextLink from "next/link";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Accordion from "@mui/material/Accordion";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { calculatePriceAfterDiscount } from "utils/calculatePriceAfterDiscount";
import useCart from "hooks/useCart";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";
import Product from "./Product";
import { useCurrency } from "contexts/CurrencyContext";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckoutPopup from "./CheckoutPopup";
import { useLocation } from "../../../contexts/location_context"; // Adjust path as needed
import LocationOnIcon from "@mui/icons-material/LocationOn";

const DELIVERY_STORAGE_KEY = "persisted_delivery_options";

// Helper functions for localStorage operations
const getPersistedDeliveryOptions = () => {
  try {
    const stored = localStorage.getItem(DELIVERY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error reading persisted delivery options:", error);
    return {};
  }
};

const setPersistedDeliveryOption = (vendorId, deliveryOption) => {
  try {
    const currentOptions = getPersistedDeliveryOptions();
    const updatedOptions = {
      ...currentOptions,
      [vendorId]: deliveryOption,
    };
    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(updatedOptions));
  } catch (error) {
    console.error("Error persisting delivery option:", error);
  }
};

const removePersistedDeliveryOption = (vendorId) => {
  try {
    const currentOptions = getPersistedDeliveryOptions();
    delete currentOptions[vendorId];
    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(currentOptions));
  } catch (error) {
    console.error("Error removing persisted delivery option:", error);
  }
};

const SingleVendorCart = ({
  wallet,
  cart,
  rawCartItems,
  defaultAddress,
  voucherDetails,
  isSingleVendor,
}) => {
  const router = useRouter();
  const { currency } = useCurrency();
  const { location, setLocation, countries } = useLocation(); // Use location context
  const [formValues, setFormValues] = useState({
    coupon_code: cart?.vendor_coupon?.coupon_data?.coupon_code || "",
  });

  const { state, getCartDetails, getCartItems } = useCart();
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(cart?.coupon_status === true);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [vendorNote, setVendorNote] = useState("");
  const [buyerNote, setBuyerNote] = useState({
    cart_id: cart?.products?.[0]?.cart_id,
    product_id: cart?.products?.[0]?.product_id,
    vendor_id: cart?.vendor_id,
    buyer_note: "",
    _id: null,
  });
  const [deliveryOption, setDeliveryOption] = useState(() => {
    const persistedOptions = getPersistedDeliveryOptions();
    const vendorId = cart?.vendor_id;

    if (vendorId && persistedOptions[vendorId]) {
      return persistedOptions[vendorId];
    }

    return cart?.selectedShipping || "standardShipping";
  });
  const [isModalOpen, setModalOpen] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(() => {
    // Try to get from persisted storage first
    const persistedOptions = getPersistedDeliveryOptions();
    const vendorId = cart?.vendor_id;

    if (vendorId && persistedOptions[vendorId]) {
      return persistedOptions[vendorId];
    }

    // Fallback to cart's selectedShipping or default
    return cart?.selectedShipping || "standardShipping";
  });

  const handleShippingChange = (e) => {
    const newShippingOption = e.target.value;
    const vendorId = cart?.vendor_id;

    // Update both state variables
    setSelectedShipping(newShippingOption);
    setDeliveryOption(newShippingOption);

    // Persist to localStorage
    if (vendorId) {
      setPersistedDeliveryOption(vendorId, newShippingOption);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };
  const totalShopProductQty = cart?.products?.reduce((acc, item) => {
    return acc + item?.qty;
  }, 0);

  const processedCart = useMemo(() => {
    if (!cart) return null;

    const totalShopValue = cart?.products?.reduce((acc, item) => {
      const price = +item.original_price || +item.real_price || 0;
      return acc + price * (item?.qty || 0);
    }, 0);

    const isCouponApplied = cart?.coupon_status;
    const couponValues = cart?.vendor_coupon || {};
    const isSynced =
      couponValues?.isSynced || couponValues?.coupon_data?.isSynced || false;

    const processedProducts = cart.products.map((product) => {
      const variantPrice = +product.original_price || +product.real_price || 0;

      let bestPromotion = null;

      const validPromotions =
        product?.promotionalOfferData?.filter((promo) => {
          if (promo.promotion_type === "qty_per_product")
            return promo.qty <= product.qty;
          // CHECK AGAINST TOTAL SHOP VALUE (Cart Level)
          if (promo.promotion_type === "amount")
            return promo.offer_amount <= totalShopValue;
          if (promo.promotion_type === "qty_total_shop")
            return promo.qty <= totalShopProductQty;
          return false;
        }) || [];

      if (validPromotions.length > 0) {
        bestPromotion = validPromotions.reduce((prev, current) => {
          const prevFinalPrice = calculatePriceAfterDiscount(
            prev.offer_type,
            prev.discount_amount,
            variantPrice,
          );
          const currentFinalPrice = calculatePriceAfterDiscount(
            current.offer_type,
            current.discount_amount,
            variantPrice,
          );

          const prevSavings = variantPrice - prevFinalPrice;
          const currentSavings = variantPrice - currentFinalPrice;

          return currentSavings > prevSavings ? current : prev;
        });
      }

      let finalPrice = variantPrice;
      let appliedPromotion = null;

      if (isCouponApplied && isSynced) {
        finalPrice = variantPrice;
        appliedPromotion = null;
      } else {
        if (bestPromotion) {
          finalPrice = calculatePriceAfterDiscount(
            bestPromotion.offer_type,
            bestPromotion.discount_amount,
            variantPrice,
          );
          appliedPromotion = bestPromotion;
        }
      }

      let upsellData = null;
      if (!isCouponApplied || (isCouponApplied && !isSynced)) {
        const lockedPromotions =
          product?.promotionalOfferData?.filter((promo) => {
            let isLocked = false;
            if (promo.promotion_type === "qty_per_product")
              isLocked = promo.qty > product.qty;
            if (promo.promotion_type === "amount")
              isLocked = promo.offer_amount > totalShopValue;
            if (promo.promotion_type === "qty_total_shop")
              isLocked = promo.qty > totalShopProductQty;
            return isLocked;
          }) || [];

        if (lockedPromotions.length > 0) {
          const currentSavings = appliedPromotion
            ? variantPrice -
              calculatePriceAfterDiscount(
                appliedPromotion.offer_type,
                appliedPromotion.discount_amount,
                variantPrice,
              )
            : 0;
          const betterPromotions = lockedPromotions
            .map((promo) => {
              const potentialPrice = calculatePriceAfterDiscount(
                promo.offer_type,
                promo.discount_amount,
                variantPrice,
              );
              const potentialSavings = variantPrice - potentialPrice;
              return { ...promo, potentialSavings };
            })
            .filter((p) => p.potentialSavings > currentSavings);

          if (betterPromotions.length > 0) {
            const nextBest = betterPromotions.sort((a, b) => {
              if (a.promotion_type !== b.promotion_type) return 0;
              if (a.promotion_type === "amount")
                return a.offer_amount - b.offer_amount;
              return a.qty - b.qty;
            })[0];

            let message = "";
            if (nextBest.promotion_type === "qty_per_product") {
              const diff = nextBest.qty - product.qty;
              message = `Add ${diff} more to save ${currency?.symbol}${(nextBest.potentialSavings - currentSavings).toFixed(2)} per item!`;
            } else if (nextBest.promotion_type === "amount") {
              const diff = nextBest.offer_amount - totalShopValue;
              message = `Add ${currency?.symbol}${diff.toFixed(2)} to cart to save ${currency?.symbol}${(nextBest.potentialSavings - currentSavings).toFixed(2)} per item!`;
            } else if (nextBest.promotion_type === "qty_total_shop") {
              const diff = nextBest.qty - totalShopProductQty;
              message = `Add ${diff} more items from this shop to save ${currency?.symbol}${(nextBest.potentialSavings - currentSavings).toFixed(2)} per item!`;
            }

            upsellData = {
              ...nextBest,
              message,
            };
          }
        }
      }

      return {
        ...product,
        calculatedPrice: finalPrice,
        appliedPromotion: appliedPromotion,
        upsellData: upsellData,
      };
    });

    const calculatedShopValue = processedProducts.reduce((acc, item) => {
      return (
        acc +
        (item.calculatedPrice || item.original_price || 0) * (item.qty || 0)
      );
    }, 0);

    // Calculate Original Value (before any discounts) for display purposes
    const originalShopValue = processedProducts.reduce((acc, item) => {
      return acc + (item.original_price || 0) * (item.qty || 0);
    }, 0);

    const promotionDiscount = originalShopValue - calculatedShopValue;

    return {
      ...cart,
      products: processedProducts,
      totalShopValue: calculatedShopValue,
      originalShopValue,
      promotionDiscount,
    };
  }, [cart, cart?.coupon_status, cart?.vendor_coupon, totalShopProductQty]);

  const deliveryOptions = cart?.matchedShippingOptions
    ?.map((item) => {
      const option = item?.options?.[0];
      if (!option) return null;

      const currentDate = new Date();

      const minDate = new Date(currentDate);
      minDate.setDate(currentDate.getDate() + option.minDays);

      const maxDate = new Date(currentDate);
      maxDate.setDate(currentDate.getDate() + option.maxDays);

      const shippingLabel =
        {
          standardShipping: "Standard Delivery",
          expedited: "Express Delivery",
          twoDays: "Two days",
          oneDay: "One day",
        }[item.shippingType] || item.shippingType;

      const vendorFinalPrice = state.vendorDeliveryMap?.[cart.vendor_id];

      const price =
        selectedShipping === item.shippingType && vendorFinalPrice != null
          ? vendorFinalPrice
          : cart?.previewDelivery?.[item.shippingType] || 0;

      return {
        value: item.shippingType,
        label: `${shippingLabel} (${formatDate(minDate)} - ${formatDate(maxDate)}) ${
          price > 0
            ? `— ${currency.symbol}${(price * currency.rate).toFixed(2)}`
            : ""
        }`,
      };
    })
    .filter(Boolean);

  const handleNoteAccordionToggle = () => {
    setIsNoteOpen((prev) => !prev);
  };
  const handleAccordionToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const [addingNote, setAddingNote] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveNote = async () => {
    try {
      setAddingNote(true);
      console.log({ vendorNote });
      if (!token) {
        return router.push("/login");
      }
      if (!vendorNote)
        return addToast("Note is required", {
          appearance: "error",
          autoDismiss: true,
        });
      const { _id, ...noteWithoutId } = buyerNote;
      const payload = buyerNote._id ? buyerNote : noteWithoutId;
      const res = await postAPIAuth("user/save-note", payload);
      if (res.status === 200) {
        setBuyerNote(res.data.buyerNote);
        console.log("Order Data", res.data.buyerNote);
        return addToast("Add note successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      console.log(error);
      return addToast("Failed to add note", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setAddingNote(false);
    }
  };

  // Enable store coupon functionality for single vendor
  const handleApply = async () => {
    if (!token) {
      return router.push("/login");
    }
    try {
      const payload = {
        coupon_code: formValues?.coupon_code,
        vendor_id: cart?.vendor_id,
      };
      setLoading(true);
      const res = await postAPIAuth("user/check-coupon-for-product", payload);
      if (res.status === 200) {
        setLoading(false);
        getCartItems(defaultAddress?._id);
        const data = wallet ? "1" : "0";
        getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
        setError("");
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      setLoading(false);
      addToast(error?.response?.data.message || error, {
        appearance: "error",
        autoDismiss: true,
      });
      setError(error?.response?.data.message);
      console.log("error", error?.response?.data.message || error);
    }
  };

  const handleRemove = async () => {
    try {
      const payload = {
        coupon_code: formValues?.coupon_code,
        vendor_id: cart?.vendor_id,
      };
      setLoading(true);
      const res = await postAPIAuth("user/remove-coupon-for-product", payload);
      if (res.status === 200) {
        setLoading(false);
        getCartItems(defaultAddress?._id);
        const data = wallet ? "1" : "0";
        getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
        setFormValues({ coupon_code: "" });
        setIsOpen(false);
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      setLoading(false);
      addToast(error?.response?.data.message || error, {
        appearance: "error",
        autoDismiss: true,
      });
      console.log("error", error?.response?.data.message || error);
    }
  };

  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    if (!formValues.coupon_code) {
      setError("");
    }
  }, [formValues.coupon_code]);

  function getVendorReference(cart, selectedType) {
    for (const product of cart.products) {
      const templates = product.selectedShipping?.shippingTemplateData;
      if (templates?.[selectedType]?.length) {
        return {
          shippingId: product.selectedShipping._id,
          option: templates[selectedType][0],
        };
      }
    }
    return null;
  }

  function findNearestShippingProduct(products, currentIndex, deliveryOption) {
    // check left
    for (let i = currentIndex - 1; i >= 0; i--) {
      const templates = products[i]?.selectedShipping?.shippingTemplateData;
      if (templates?.[deliveryOption]?.length) {
        return {
          option: templates[deliveryOption][0],
          shippingId: products[i].selectedShipping._id,
        };
      }
    }

    // check right
    for (let i = currentIndex + 1; i < products.length; i++) {
      const templates = products[i]?.selectedShipping?.shippingTemplateData;
      if (templates?.[deliveryOption]?.length) {
        return {
          option: templates[deliveryOption][0],
          shippingId: products[i].selectedShipping._id,
        };
      }
    }

    return null;
  }

  const addParentCart = async () => {
    try {
      const products = cart.products;

      for (let index = 0; index < products.length; index++) {
        const product = products[index];
        const templates = product.selectedShipping?.shippingTemplateData;

        let option = null;
        let shippingId = null;

        // 1️⃣ Product supports selected shipping
        if (templates?.[deliveryOption]?.length) {
          option = templates[deliveryOption][0];
          shippingId = product.selectedShipping._id;
        }
        // 2️⃣ Borrow from nearest cart neighbor
        else {
          const nearest = findNearestShippingProduct(
            products,
            index,
            deliveryOption,
          );

          if (!nearest) {
            console.warn(`Shipping ${deliveryOption} not supported for vendor`);
            return;
          }

          option = nearest.option;
          shippingId = nearest.shippingId;
        }

        // 3️⃣ Dates
        const now = new Date();
        const minDate = new Date(now);
        minDate.setDate(now.getDate() + option.transitTime.minDays);

        const maxDate = new Date(now);
        maxDate.setDate(now.getDate() + option.transitTime.maxDays);

        // 4️⃣ Payload (CORRECT PER PRODUCT)
        const payload = {
          cart_id: product.cart_id,
          vendor_data: {
            vendor_id: cart.vendor_id,
            product_id: product.product_id,
            shipping_id: shippingId,
            shippingName: deliveryOption,
            minDate,
            maxDate,
            perOrder: option.shippingFee.perOrder,
            perItem: option.shippingFee.perItem,
            region: location.countryName,
          },
        };

        await postAPIAuth("user/add-parent-cart", payload);
      }

      const data = wallet ? "1" : "0";
      getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
    } catch (err) {
      console.error("addParentCart error:", err);
    }
  };

  useEffect(() => {
    if (deliveryOption && token && cart?.shippingAvailable) {
      addParentCart();
    }
  }, [deliveryOption]);

  const handleVendorCheckout = () => {
    if (!token) {
      return router.push("/login");
    }
    setModalOpen(true);
  };

  const handleCountryChange = () => {
    setShowCountryModal(true);
  };

  // Country Modal Component
  const CountryModal = ({ open, onClose }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Your Country</DialogTitle>
      <DialogContent>
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {countries?.map((country) => (
            <MenuItem
              key={country._id}
              onClick={() => {
                setLocation({
                  countryName: country.name,
                  countryCode: country.sortname || "",
                });
                onClose();
                // Refresh cart data with new location
                const data = wallet ? "1" : "0";
                getCartDetails(
                  data,
                  defaultAddress?._id,
                  voucherDetails?.discount,
                );
              }}
              selected={location.countryName === country.name}
            >
              {country.name}
            </MenuItem>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Card
        sx={{
          marginBottom: "16px",
          borderRadius: "12px",
          border: "1px solid #0e0e0e2e",
          overflow: "hidden",
          padding: "16px",
        }}
      >
        <Typography
          component="div"
          display={{ lg: "flex", md: "flex", xs: "block" }}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            component="div"
            display="flex"
            alignItems="center"
            onClick={() => {
              const slug = cart?.slug;
              const url = `/store/${slug}`;
              if (slug) {
                window.open(url, "_blank");
              } else {
                console.error("Vendor slug is not available");
              }
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <img
              src={cart?.shop_icon}
              alt=""
              style={{
                height: "32px",
                width: "32px",
                objectFit: "cover",
                borderRadius: "5px",
                border: "3px solid #000",
              }}
            />
            <Typography
              component="div"
              fontSize={17}
              fontWeight={700}
              pl={1}
              sx={{
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {capitalizeFirstLetter(cart?.shop_name)}
            </Typography>
          </Typography>
          <Typography
            component="div"
            color={"#656464"}
            fontWeight={600}
            sx={{
              "&:hover": {
                textDecoration: "underline !important",
              },
              fontSize: {
                lg: "16px",
                md: "16px",
                xs: "12px",
              },
            }}
          >
            <Link component={NextLink} href="/">
              Contact shop
            </Link>
          </Typography>
        </Typography>
        {processedCart?.products?.map((product, index) => (
          <Product
            key={index}
            cart={processedCart}
            product={product}
            wallet={wallet}
            defaultAddress={defaultAddress}
            voucherDetails={voucherDetails}
          />
        ))}
        <Box>
          {token && (
            <>
              <Typography component="div" display={"flex"}>
                <Typography component="span">
                  <Checkbox inputProps={{ "aria-label": "controlled" }} />
                </Typography>
                <Typography component="div">
                  <Typography variant="span" fontSize={17} fontWeight={600}>
                    Mark order as a gift
                  </Typography>
                  <Typography>
                    We'll hide the price on the packing slip. At checkout you
                    can add free personal touches to your gift - a note, a
                    customisable preview, and more!
                  </Typography>
                </Typography>
              </Typography>
              <Box
                pt={1}
                pb={{ lg: 0, md: 0, xs: 2 }}
                sx={{
                  display: {
                    lg: "flex",
                    md: "flex",
                    xs: "block",
                  },
                  justifyContent: "space-between",
                }}
              >
                <Typography component="div">
                  <Typography component="div" pb={2}>
                    {/* ENABLE STORE COUPON FOR SINGLE VENDOR */}
                    {isSingleVendor && (
                      <Accordion
                        expanded={isOpen}
                        sx={{
                          boxShadow: "none",
                          borderTop: "none",
                        }}
                      >
                        <AccordionSummary
                          aria-controls="panel1-content"
                          id="panel1-header"
                          onClick={handleAccordionToggle}
                        >
                          <Button
                            sx={{
                              background: "transparent",
                              color: "#000",
                              padding: "10px 18px",
                              fontSize: "13px",
                              borderRadius: "25px",
                            }}
                          >
                            <Typography
                              component="span"
                              mr={1}
                              sx={{
                                background: "#43639f",
                                borderRadius: "50%",
                                height: "24px",
                                width: "24px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <svg
                                stroke="#fff"
                                fill="#fff"
                                xmlns="http://www.w3.org/2000/svg"
                                height="14px"
                                width="14px"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                              >
                                <path d="M11,22a1,1,0,0,1-.707-0.293l-8-8a1,1,0,0,1,0-1.414l10-10A1,1,0,0,1,13,2h8a1,1,0,0,1,1,1v8a1,1,0,0,1-.293.707l-10,10A1,1,0,0,1,11,22ZM4.414,13L11,19.586l9-9V4H13.414Z"></path>
                                <circle cx="16" cy="8" r="2"></circle>
                              </svg>
                            </Typography>
                            Apply Store Coupon Code
                          </Button>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            sx={{
                              height: "50px",
                              padding: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#fff",
                              boxShadow: "0 0 3px #000",
                              borderRadius: "30px",
                            }}
                          >
                            <TextField
                              required
                              id="outlined-required"
                              placeholder="Enter your code"
                              sx={{
                                ".MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                              }}
                              disabled={cart?.coupon_status}
                              value={formValues?.coupon_code}
                              name="coupon_code"
                              onChange={handleChange}
                            />
                            {cart?.coupon_status ? (
                              <Button
                                sx={{
                                  paddingLeft: "18px",
                                  paddingRight: "18px",
                                  background: "none",
                                  border: "none",
                                  borderRadius: "30px",
                                }}
                                onClick={handleRemove}
                              >
                                Remove
                              </Button>
                            ) : (
                              <Button
                                sx={{
                                  paddingLeft: "18px",
                                  paddingRight: "18px",
                                  background: "none",
                                  border: "none",
                                  borderRadius: "30px",
                                }}
                                onClick={handleApply}
                                disabled={loading}
                              >
                                {loading ? (
                                  <CircularProgress size={15} />
                                ) : (
                                  "Apply"
                                )}
                              </Button>
                            )}
                          </Box>
                        </AccordionDetails>
                        <Typography pl={2}>
                          {cart?.coupon_status && (
                            <Typography component="div">
                              <Typography
                                color={"green"}
                                sx={{ fontSize: "16px" }}
                              >
                                {currency?.symbol}{" "}
                                {(
                                  currency?.rate * cart?.discountAmount
                                ).toFixed(2)}{" "}
                                Coupon Applied Successfully
                              </Typography>
                            </Typography>
                          )}
                          {error && (
                            <Typography
                              color={"red"}
                              sx={{ fontSize: "16px" }}
                              component="div"
                            >
                              {error}
                            </Typography>
                          )}
                        </Typography>
                      </Accordion>
                    )}

                    <Accordion
                      expanded={isNoteOpen}
                      sx={{
                        boxShadow: "none",
                        borderTop: "none",
                      }}
                    >
                      <AccordionSummary
                        aria-controls="panel2-content"
                        id="panel2-header"
                        onClick={handleNoteAccordionToggle}
                      >
                        <Button
                          sx={{
                            background: "transparent",
                            color: "#000",
                            padding: "10px 18px",
                            fontSize: "13px",
                            borderRadius: "25px",
                          }}
                        >
                          <Typography
                            component="span"
                            mr={1}
                            sx={{
                              background: "#43639f",
                              borderRadius: "50%",
                              height: "24px",
                              width: "24px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <svg
                              stroke="#fff"
                              fill="#fff"
                              xmlns="http://www.w3.org/2000/svg"
                              height="14px"
                              width="14px"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 11h10v2H7v-2z"></path>
                            </svg>
                          </Typography>
                          + Add a note to{" "}
                          {capitalizeFirstLetter(cart?.shop_name)}
                        </Button>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box
                          sx={{
                            height: "50px",
                            padding: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#fff",
                            boxShadow: "0 0 3px #000",
                            borderRadius: "30px",
                          }}
                        >
                          <TextField
                            required
                            id="outlined-required"
                            placeholder="Enter your note"
                            sx={{
                              ".MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                            }}
                            value={vendorNote}
                            name="vendor_note"
                            onChange={(e) => {
                              setVendorNote(e.target.value);
                              setBuyerNote((prev) => ({
                                ...prev,
                                buyer_note: e.target.value,
                              }));
                            }}
                          />
                          <Button
                            sx={{
                              paddingLeft: "18px",
                              paddingRight: "18px",
                              background: "none",
                              border: "none",
                              borderRadius: "30px",
                            }}
                            onClick={handleSaveNote}
                            disabled={addingNote}
                          >
                            {addingNote ? (
                              <CircularProgress size={15} />
                            ) : (
                              "Save"
                            )}
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Typography>
                </Typography>
              </Box>
            </>
          )}
          {token && (
            <>
              {cart?.shippingAvailable ? (
                <Box
                  pt={2}
                  borderTop="1px solid #d4d4d4"
                  sx={{
                    display: "flex",
                    flexDirection: {
                      xs: "column", // mobile
                      md: "row", // desktop/tablet
                    },
                    justifyContent: {
                      xs: "flex-start",
                      md: "space-between",
                    },
                    alignItems: {
                      xs: "flex-start",
                      md: "center",
                    },
                  }}
                >
                  <Box>
                    <Typography fontSize={17} color={"#000"}>
                      Estimated delivery:
                    </Typography>
                    <Select
                      value={selectedShipping}
                      onChange={handleShippingChange}
                      sx={{
                        borderBottom: "1px dashed gray",
                        width: {
                          xs: "auto",
                          md: "397px",
                        },
                      }}
                    >
                      {deliveryOptions?.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Typography fontSize={16}>{option.label}</Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  {/* SHOW "CHECKOUT FOR THIS SHOP ONLY" ONLY FOR MULTIPLE VENDORS */}
                  {!isSingleVendor && (
                    <Button
                      variant="outlined"
                      sx={{
                        border: "none",
                        color: "#000",
                        fontWeight: "bold",
                        textTransform: "none",
                      }}
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleVendorCheckout}
                    >
                      Checkout for this shop only
                    </Button>
                  )}
                </Box>
              ) : (
                <>
                  {/* ADD CHANGE COUNTRY BUTTON ABOVE THE WARNING */}
                  <Box
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LocationOnIcon sx={{ fontSize: 16, color: "gray" }} />
                    <Typography fontSize={14} color={"gray"}>
                      Deliver to {location.countryName}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        ml: 1,
                        fontSize: "12px",
                        padding: "2px 8px",
                      }}
                      onClick={handleCountryChange}
                    >
                      Change
                    </Button>
                  </Box>
                  <Typography color="error">
                    Oops! We're currently unable to deliver to your location.
                  </Typography>
                </>
              )}
            </>
          )}
        </Box>
      </Card>
      {isModalOpen && (
        <CheckoutPopup
          cart={processedCart}
          wallet={wallet}
          open={isModalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
          vendor_id={cart?.vendor_id}
        />
      )}
      <CountryModal
        open={showCountryModal}
        onClose={() => setShowCountryModal(false)}
      />
    </>
  );
};

export default SingleVendorCart;
