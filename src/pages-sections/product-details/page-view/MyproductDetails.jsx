"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Grid,
  CardContent,
  Typography,
  Box,
  Breadcrumbs,
  FormControl,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ChevronRight as ChevronRightIcon } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import parse from "html-react-parser";

// Hooks
import { useProductVariants } from "hooks/product.hooks/useProductVariants";
import { useProductCustomization } from "hooks/product.hooks/useProductCustomization";
import useCart from "hooks/useCart";
import useAuth from "hooks/useAuth";
import { useCurrency } from "contexts/CurrencyContext";
import { useToasts } from "react-toast-notifications";

// Components
import VariantSelector from "components/VariantSelector/VariantSelector";
import ProductCustomization from "components/ProductCustomization/ProductCustomization";
import ProductImageGallery from "components/ProductImageGallery/ProductImageGallery";
import ProductDetailShimmer from "components/ProductDetailShimmer/ProductDetailShimmer";
import ProductTabs from "components/ProductTabs/ProductTabs";
import SellerInfo from "components/SellerInfo/SellerInfo";
import ProductActions from "components/ProductActions/ProductActions";
import QuantitySelector from "components/QuantitySelector/QuantitySelector";
import MessagePopup from "./MessagePopup";
import ShareModal from "./ShareModal";
import SimilarProducts from "./SimilarProducts/SimilarProducts";
import ShopProducts from "./ShopProducts/ShopProducts";
import ReportItem from "./ReportItem";

// Services
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { calculatePriceAfterDiscount } from "utils/calculatePriceAfterDiscount";
import useMyProvider from "hooks/useMyProvider";
import ProductRating from "components/ProductRating/ProductRating";
import ProductPricing from "components/ProductPricing/ProductPricing";

const MyproductDetails = ({ slug }) => {
  // Hooks and Context
  const { currency } = useCurrency();
  const searchParams = useSearchParams();
  const { addToast } = useToasts();
  const { token } = useAuth();
  const { usercredentials } = useMyProvider();
  const { state, dispatch } = useCart();
  const router = useRouter();

  // State
  const [myproduct, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [media, setMedia] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [wishlistIdArr, setWishlistIdArr] = useState([]);
  const [toggleWishlist, setToggleWishlist] = useState(false);
  const [bestPromotion, setBestPromotion] = useState({});
  const [nextPromotion, setNextPromotion] = useState({});
  const [plusToggle, setPlusToggle] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Custom Hooks
  const {
    selectedVariants,
    filterVariantAttributes,
    errors,
    handleVariantChange,
    validateVariants,
    normalizeVariantData,
    hoveredVariantImage,
    handleVariantHover,
    handleVariantHoverOut,
    isAttributeCombinationSoldOut,
    currentCombinationData,
    calculateAttributeData,
    // variantAttributes,
  } = useProductVariants(myproduct);

  const {
    selectedDropdowns,
    customizationText,
    validationErrors,
    customizeDropdownPrice,
    customizeTextPrice,
    handleDropdownChange,
    handleTextChange,
    validateCustomization,
    checkInputMinValue,
  } = useProductCustomization(myproduct);


  const viewProduct = async () => {
    try {
      const id = searchParams.get("id");
      const res = await postAPIAuth("user/add-viewed-products", {
        product_id: id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Data Fetching
  const fetchProductHandler = async () => {
    const id = searchParams.get("id");
    try {
      setLoading(true);
      const res = await getAPIAuth(`get-productById?productId=${id}`);

      if (res.status === 200) {
        const productData = {
          image_url: res.data.image_url,
          video_url: res.data.video_url,
          ...res.data.data,
        };

        setProduct(productData);
        setPrice(+res.data.data.sale_price);
        setStock(+res.data.data.qty);
        setOriginalPrice(+res.data.data.sale_price);

        // Set media
        const productMedia = [...res.data.data.image, ...res.data.data.videos];
        setMedia(productMedia);

        // Handle initial variant selections for parent products
        if (res?.data?.data?.parent_id !== null) {
          handleParentProductVariants(res.data.data);
          // In fetchProductHandler, after setting the product
          console.log("Product price fields:", {
            sale_price: res.data.data.sale_price,
            price: res.data.data.price,
            regular_price: res.data.data.regular_price,
            product_price: res.data.data.product_price,
            original_price: res.data.data.original_price,
            discounted_price: res.data.data.discounted_price
          });

          // Also check if price is in the main data object
          console.log("All price-related keys:", Object.keys(res.data.data).filter(key =>
            key.toLowerCase().includes('price')
          ));
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myproduct?.isCombination && currentCombinationData) {
      if (currentCombinationData.quantity !== null) {
        setStock(currentCombinationData.quantity);
      } else if (currentCombinationData.quantityRange) {
        // Use the maximum available quantity from range
        setStock(currentCombinationData.quantityRange.max);
      } else {
        // Fallback to product quantity
        setStock(myproduct?.qty || 0);
      }
    } else {
      setStock(myproduct?.qty || 0);
    }
  }, [myproduct, currentCombinationData]);

  const handleParentProductVariants = (productData) => {
    const product_id = productData?._id;
    const filterCombination = productData?.parentCombinationData?.find(
      (obj) => obj.sku_product_id === product_id
    );

    if (filterCombination) {
      filterCombination.combination_id.split(",").forEach((ids) => {
        // Try to find variant attribute in the new structure first
        let variantAttr = null;

        // Check new structure (product_variants)
        if (productData.parent_id.product_variants) {
          for (const variant of productData.parent_id.product_variants) {
            const attr = variant.variant_attributes.find(attr => attr._id === ids);
            if (attr) {
              variantAttr = {
                ...attr,
                variant: variant.variant_name // Use variant_name as identifier
              };
              break;
            }
          }
        }

        // Fallback to old structure
        if (!variantAttr && productData.parent_id.variant_attribute_id) {
          variantAttr = productData.parent_id.variant_attribute_id.find(
            (variant) => ids === variant._id
          );
        }

        if (variantAttr) {
          // For new structure, use variant_name as identifier
          // For old structure, use variant ID as identifier
          const variantIdentifier = productData.parent_id.product_variants ?
            variantAttr.variant : variantAttr.variant;

          handleVariantChange(variantIdentifier, variantAttr._id);
        }
      });
    }
  };

  const getWishList = async () => {
    try {
      const res = await getAPIAuth("user/get-wishlist");
      if (res.status === 200) {
        const wishlistIdArr = res.data.wishlist.map((product) => {
          return product.product_id._id;
        });
        setWishlistIdArr(wishlistIdArr);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const getVendorDetailBySlug = async () => {
    if (!myproduct?.vendor_details?.slug) return;

    try {
      const res = await getAPIAuth(
        `getVendorDetailsBySlug/${myproduct?.vendor_details?.slug}?userId=${usercredentials?._id}`,
        token
      );
      if (res.status === 200) {
        setVendorDetail(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendor details:", error);
    }
  };

  // Effects
  useEffect(() => {
    fetchProductHandler();
    if (token) {
      viewProduct();
    }
  }, [searchParams.get("id")]);

  useEffect(() => {
    if (token && myproduct) {
      getVendorDetailBySlug();
      getWishList();
    }
  }, [myproduct, token]);

  useEffect(() => {
    if (token && wishlistIdArr.length > 0 && myproduct) {
      const isMatch = wishlistIdArr.some((id) => id === myproduct?._id);
      setToggleWishlist(isMatch);
    } else {
      setToggleWishlist(false);
    }
  }, [token, wishlistIdArr, myproduct]);

  // Price Calculation
  useEffect(() => {
    if (!myproduct) return;

    const calculateProductPrice = () => {
      if (myproduct?.isCombination) {
        calculateCombinationPrice();
      } else {
        calculateSimpleProductPrice();
      }
    };

    calculateProductPrice();
  }, [
    selectedVariants,
    myproduct,
    quantity,
    bestPromotion,
    customizeDropdownPrice,
    customizeTextPrice,
    currentCombinationData,
  ]);

  const calculateCombinationPrice = useCallback(() => {
    console.log("=== DEBUG calculateCombinationPrice ===");
    console.log("selectedVariants:", selectedVariants);
    console.log("currentCombinationData:", currentCombinationData);

    // Check if we have any price at all from combinations
    let combinationPrice = null;

    if (currentCombinationData) {
      console.log("currentCombinationData.price:", currentCombinationData.price);
      console.log("currentCombinationData.priceRange:", currentCombinationData.priceRange);

      // Check for fixed price first
      if (currentCombinationData.price !== null) {
        combinationPrice = currentCombinationData.price;
        console.log("Using fixed price from combination:", combinationPrice);
      }
      // Then check for price range (use min price)
      else if (currentCombinationData.priceRange) {
        combinationPrice = currentCombinationData.priceRange.min;
        console.log("Using min price from range:", combinationPrice);
      }
    }

    // Get base price from product - we should have this from the API
    const basePrice = myproduct?.sale_price || myproduct?.price || myproduct?.regular_price || 0;
    console.log("Base price from product:", basePrice);

    // Use combination price if available, otherwise use base price
    const effectivePrice = combinationPrice !== null ? combinationPrice : basePrice;
    console.log("Effective price to use:", effectivePrice);

    // Add customization prices
    let finalPrice = effectivePrice + customizeDropdownPrice + customizeTextPrice;
    console.log("Final price with customizations:", finalPrice);

    // Apply promotion if applicable
    if (bestPromotion && Object.keys(bestPromotion).length > 0 && bestPromotion.qty <= quantity) {
      const discountedPrice = calculatePriceAfterDiscount(
        bestPromotion?.offer_type,
        +bestPromotion?.discount_amount,
        finalPrice
      );
      console.log("Applying promotion, discounted price:", discountedPrice);
      setPrice(discountedPrice);
      setOriginalPrice(finalPrice);
    } else {
      setPrice(finalPrice);
      setOriginalPrice(finalPrice);
    }

    console.log("=== END DEBUG ===");
  }, [
    myproduct,
    selectedVariants,
    currentCombinationData,
    quantity,
    bestPromotion,
    customizeDropdownPrice,
    customizeTextPrice,
  ]);

  const calculateSimpleProductPrice = useCallback(() => {
    const finalPrice = myproduct?.sale_price + customizeDropdownPrice + customizeTextPrice;
    if (bestPromotion && Object.keys(bestPromotion).length > 0 && bestPromotion.qty <= quantity) {
      setPrice(
        calculatePriceAfterDiscount(
          bestPromotion?.offer_type,
          +bestPromotion?.discount_amount,
          finalPrice
        )
      );
      setOriginalPrice(finalPrice);
    } else {
      setPrice(finalPrice);
      setOriginalPrice(finalPrice);
    }
  }, [myproduct, bestPromotion, quantity, customizeDropdownPrice, customizeTextPrice]);

  // Promotion Calculation
  useEffect(() => {
    if (myproduct && Array.isArray(myproduct?.promotionData)) {
      calculatePromotions();
    }
  }, [myproduct, quantity, originalPrice]);

  const calculatePromotions = useCallback(() => {
    const bestPromotion = myproduct.promotionData.reduce((best, promotion) => {
      if (promotion.qty !== null && promotion.qty !== undefined && promotion.qty <= quantity) {
        if (!best || promotion.qty > best.qty || (promotion.qty === best.qty && promotion.discount_amount > best.discount_amount)) {
          return promotion;
        }
      }
      return best;
    }, null);

    const bestAmountPromotion = myproduct.promotionData.reduce((best, promotion) => {
      if (promotion.offer_amount !== null && promotion.offer_amount !== undefined && promotion.offer_amount <= originalPrice) {
        if (!best || promotion.offer_amount > best.offer_amount) {
          return promotion;
        }
      }
      return best;
    }, null);

    const nextPromotion = myproduct.promotionData.reduce((next, promotion) => {
      if (promotion.qty !== null && promotion.qty !== undefined && promotion.qty > quantity) {
        if (!next || promotion.qty < next.qty || (promotion.qty === next.qty && promotion.discount_amount > next.discount_amount)) {
          return promotion;
        }
      }
      return next;
    }, null);

    let finalPromotion = {};
    if (bestPromotion && bestAmountPromotion) {
      let offerAmount = calculatePriceAfterDiscount(
        bestPromotion?.offer_type,
        +bestPromotion?.discount_amount,
        originalPrice
      );
      let offerAmount2 = calculatePriceAfterDiscount(
        bestAmountPromotion?.offer_type,
        +bestAmountPromotion?.discount_amount,
        originalPrice
      );
      offerAmount = originalPrice - offerAmount;
      offerAmount2 = originalPrice - offerAmount2;
      finalPromotion = offerAmount > offerAmount2 ? bestPromotion : bestAmountPromotion;
    } else if (bestPromotion) {
      finalPromotion = bestPromotion;
    } else {
      finalPromotion = bestAmountPromotion;
    }

    setBestPromotion(finalPromotion);
    setNextPromotion(nextPromotion);
  }, [myproduct, quantity, originalPrice]);

  // Handlers
  const handleAddToCart = async () => {
    if (!validateVariants()) {
      addToast("Please select all required options", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    if (myproduct?.customize === "Yes") {
      if (!validateCustomization()) {
        addToast("Please complete all required customizations", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
      if (checkInputMinValue()) {
        return;
      }
    }

    if (stock <= 0) {
      addToast("This product is currently out of stock", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    // Your existing cart logic...
    await addToCart();
  };

  const addToCart = async () => {
    const affiliate_code = searchParams.get("affiliate_code");

    if (!token) {
      // Handle guest cart
      handleGuestCart();
    } else {
      // Handle authenticated user cart
      await handleUserCart(affiliate_code);
    }
  };

  const handleGuestCart = () => {
    let data = [];
    if (myproduct?.customize === "Yes") {
      data.push(selectedDropdowns);
      data.push(customizationText);
    }

    const payload = {
      vendor_id: myproduct?.vendor_id?._id,
      vendor_name: myproduct?.vendor_id?.name,
      shop_icon: `${myproduct?.vendor_details?.vendor_shop_icon_url}${myproduct?.vendor_details?.shop_icon}`,
      shop_name: myproduct?.vendor_details?.shop_name,
      slug: myproduct?.vendor_details?.slug,
      products: [
        {
          product_id: myproduct?._id,
          qty: quantity,
          stock: +myproduct?.qty,
          product_name: myproduct?.product_title,
          sale_price: price,
          original_price: originalPrice,
          promotionalOfferData: myproduct?.promotionData,
          firstImage: `${myproduct?.image_url}${media[0]}`,
          status: myproduct?.status,
          isDeleted: myproduct?.isDeleted,
          isCombination: myproduct?.isCombination,
          combinationData: myproduct?.combinationData,
          variantData: myproduct?.isCombination ? getVariantData() : [],
          variantAttributeData: myproduct?.isCombination ? getVariantAttributeData() : [],
          variant_attribute_id: Object.values(selectedVariants),
          customize: myproduct?.customize,
          customizationData: data,
        },
      ],
    };

    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: payload,
    });

    addToast("Product Added To Cart", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const handleUserCart = async (affiliate_code) => {
    try {
      const payload = {
        product_id: myproduct?._id,
        vendor_id: myproduct?.vendor_id?._id,
        qty: quantity,
        price: price,
        original_price: originalPrice,
        isCombination: myproduct?.isCombination,
        variant_id: [],
        variant_attribute_id: [],
        customize: myproduct?.customize,
        customizationData: [],
      };

      if (myproduct?.isCombination) {
        const keysArray = Object.keys(selectedVariants);
        const valuesArray = Object.values(selectedVariants);
        payload.variant_id = keysArray;
        payload.variant_attribute_id = valuesArray;
      }

      if (myproduct?.customize === "Yes") {
        let data = [];
        data.push(selectedDropdowns);
        data.push(customizationText);
        payload.customizationData = data;
      }

      if (affiliate_code) {
        payload.affiliate_id = affiliate_code;
      }

      if (Object.keys(myproduct?.shipping_templates || {})) {
        payload.shippingName = "standardShipping";
        payload.shipping_id = myproduct?.shipping_templates?._id;
      }

      const res = await postAPIAuth("user/add-to-cart", payload);
      if (res.status === 200) {
        const cartRes = await getAPIAuth("user/cart-list");
        if (cartRes.status === 200) {
          dispatch({ type: "INIT_CART", payload: cartRes?.data?.result });
          addToast("Product Added To Cart", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const getVariantData = () => {
    const variant_ids = Object.keys(selectedVariants);
    return myproduct?.variant_id?.filter((variant) =>
      variant_ids.includes(variant._id)
    );
  };

  const getVariantAttributeData = () => {
    const varint_attribute_ids = Object.values(selectedVariants);
    return myproduct?.variant_attribute_id?.filter((variant_attribute) =>
      varint_attribute_ids.includes(variant_attribute._id)
    );
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      let price = 0;
      if (myproduct?.isCombination) {
        price = originalPrice;
      } else {
        if (bestPromotion && Object.keys(bestPromotion).length > 0) {
          price = calculatePriceAfterDiscount(
            bestPromotion?.offer_type,
            +bestPromotion?.discount_amount,
            +myproduct.sale_price
          );
        } else {
          price = +myproduct.sale_price;
        }
      }

      const payload = {
        product_id: myproduct?._id,
        price: price,
        original_price: originalPrice,
        isCombination: myproduct?.isCombination,
        variant_id: [],
        variant_attribute_id: [],
      };

      const res = await postAPIAuth("user/add-delete-wishlist", payload);
      if (res.status === 200) {
        await getWishList();
        addToast(
          toggleWishlist ? "Product removed from wishlist" : "Product added to wishlist",
          { appearance: "success", autoDismiss: true }
        );
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  const toggelFollowShopHandler = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await postAPIAuth(`user/follow-vendor`, {
        vendorId: vendorDetail?._id,
      });
      if (res.status === 200) {
        getVendorDetailBySlug();
      }
    } catch (error) {
      console.error("Error following vendor:", error);
    }
  };

  // Render Methods
  const renderBreadcrumbs = () => (
    <Box sx={{
      width: '100%',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      justifyContent: "center",
      display: "flex",
      paddingLeft: { xs: '94px', md: 1 },
      paddingRight: { xs: '25px', md: 1 },
      pt: 2,
    }}>
      <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: "center",
        minWidth: 'max-content',
      }}>
        <Breadcrumbs
          separator={<ChevronRightIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link href="/" color="inherit">
            Homepage
          </Link>
          {myproduct?.categories?.map((item) => (
            <Link
              key={item._id}
              href={`/products-categories/search/${item.slug}?title=${item.title}&_id=${item._id}`}
              color="inherit"
            >
              {item?.title}
            </Link>
          ))}
        </Breadcrumbs>
      </Box>
    </Box>
  );

  const renderVariantsSection = () => {
    const normalizedVariants = normalizeVariantData();

    return normalizedVariants.map(variant => {
      let guideInfo = {};

      if (variant.type === 'parent' && myproduct?.parent_id?.variant_id) {
        const parentVariantInfo = myproduct.parent_id.variant_id.find(
          v => v.variant_name === variant.name || v._id === variant.id
        );
        if (parentVariantInfo) {
          guideInfo = {
            guide_name: parentVariantInfo.guide_name,
            guide_file: parentVariantInfo.guide_file,
            guide_type: parentVariantInfo.guide_type,
            guide_description: parentVariantInfo.guide_description
          };
        }
      } else if (variant.type === 'internal' && myproduct?.variant_id) {
        const internalVariantInfo = myproduct.variant_id.find(
          v => v.variant_name === variant.name
        );
        if (internalVariantInfo) {
          guideInfo = {
            guide_name: internalVariantInfo.guide_name,
            guide_file: internalVariantInfo.guide_file,
            guide_type: internalVariantInfo.guide_type,
            guide_description: internalVariantInfo.guide_description
          };
        }
      }

      const variantWithGuide = {
        ...variant,
        ...guideInfo
      };

      return (
        <VariantSelector
          key={variant.id}
          variant={variantWithGuide}
          selectedValue={selectedVariants[variant.id]}
          selectedVariants={selectedVariants}
          onChange={handleVariantChange}
          onHover={handleVariantHover}
          onHoverOut={handleVariantHoverOut}
          error={errors[variant.id]}
          currency={currency}
          filterVariantAttributes={filterVariantAttributes}
          isAttributeCombinationSoldOut={isAttributeCombinationSoldOut}
          calculateAttributeData={calculateAttributeData} // Pass this
        />
      );
    });
  };

  const getCurrentDisplayImage = () => {
    if (hoveredVariantImage) {
      return hoveredVariantImage;
    }
    // Return the normal selected image from media array
    return media[selectedImage] ? `${myproduct?.image_url}${media[selectedImage]}` : null;
  };

  const renderProductInfo = () => (
    <CardContent>
      {/* Store Link */}
      <Typography
        component="span"
        onClick={() => {
          const slug = myproduct?.vendor_details?.slug;
          if (slug) {
            window.open(`/store/${slug}`, "_blank");
          }
        }}
        sx={{
          color: "#5454f5",
          fontSize: "15px",
          borderBottom: "2px dashed #5454f5",
          cursor: "pointer",
        }}
      >
        Visit the {myproduct?.vendor_details?.shop_name}
      </Typography>

      {/* Product Title */}
      <Typography
        style={{ textTransform: "capitalize" }}
        pt={1}
        sx={{ color: "#8b8b8b", fontWeight: "500" }}
      >
        {parse(myproduct?.product_title || "")}
      </Typography>

      {/* Rating */}
      <ProductRating product={myproduct} />

      {/* Promotion Info */}
      {nextPromotion && Object.keys(nextPromotion).length > 0 && +nextPromotion?.qty > quantity && (
        <Typography>
          Save {nextPromotion?.offer_type == "flat" ? `$ ${nextPromotion?.discount_amount}` : `${nextPromotion?.discount_amount} %`} when you buy {nextPromotion?.qty != 0 ? nextPromotion?.qty : ""} items at this shop
        </Typography>
      )}

      {/* Stock Info */}
      <Typography
        component="div"
        sx={{
          fontSize: "17px",
          fontWeight: "600",
          color: "#bc1111",
        }}
        pt={2}
      >
        {stock == 0 ? "Sold Out" : myproduct?.cartProductCount > 0 ? `Only ${stock} left and in ${myproduct?.cartProductCount || 0} cart${myproduct?.cartProductCount === 1 ? '' : 's'}` : `Only ${stock} left`}
      </Typography>

      {/* Pricing */}
      <ProductPricing
        price={price}
        originalPrice={originalPrice}
        currency={currency}
        isCombination={myproduct?.isCombination}
        plusToggle={plusToggle}
        bestPromotion={bestPromotion}
      />

      {/* Variants */}
      {renderVariantsSection()}

      {/* Customization */}
      {myproduct?.customize === "Yes" && (
        <ProductCustomization
          customizationData={myproduct?.customizationData}
          selectedDropdowns={selectedDropdowns}
          customizationText={customizationText}
          onDropdownChange={handleDropdownChange}
          onTextChange={handleTextChange}
          validationErrors={validationErrors}
          currency={currency}
        />
      )}

      {/* Quantity and Actions */}
      {usercredentials?.designation_id !== "4" && stock !== 0 && (
        <>
          <QuantitySelector
            quantity={quantity}
            stock={stock}
            onQuantityChange={setQuantity}
          />

          <ProductActions
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onWishlistToggle={handleWishlistToggle}
            isInWishlist={toggleWishlist}
          />
        </>
      )}

      {/* Seller Info */}
      <SellerInfo
        product={myproduct}
        vendorDetail={vendorDetail}
        onFollowShop={toggelFollowShopHandler}
        onMessage={() => setOpenPopup(true)}
        userDesignation={usercredentials?.designation_id}
      />

      <ReportItem product_id={myproduct?._id} />
    </CardContent>
  );

  if (loading) return <ProductDetailShimmer />;

  if (!myproduct || Object.keys(myproduct).length === 0) {
    return (
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          mt: 5,
          px: 2,
        }}
      >
        <SentimentDissatisfiedIcon
          sx={{ fontSize: 60, color: "#9e9e9e", mb: 2 }}
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, fontSize: "22px", color: "#444" }}
        >
          Sorry, this item is unavailable.
        </Typography>
        <Typography sx={{ color: "#777", mt: 1 }}>
          It might have been removed or is out of stock.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {renderBreadcrumbs()}

      <Container sx={{ pt: { xs: 0, md: 2 } }}>
        <Grid container spacing={{ xs: 0, md: 2 }}>
          {/* Image Gallery */}
          <Grid item lg={8} md={6} xs={12}>
            <Box sx={{
              position: "relative",
              height: "100%",
              display: "flex",
              flexDirection: "column"
            }}>
              <ProductImageGallery
                product={myproduct}
                media={media}
                selectedImage={selectedImage}
                onImageSelect={setSelectedImage}
                onWishlistToggle={handleWishlistToggle}
                onShareClick={() => setOpenModal(true)}
                isInWishlist={toggleWishlist}
                userDesignation={usercredentials?.designation_id}
                hoveredImage={hoveredVariantImage}
              />
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid item lg={4} md={6} xs={12}>
            {renderProductInfo()}
          </Grid>
        </Grid>
      </Container>

      {/* Product Tabs */}
      <ProductTabs product={myproduct} />

      {/* Related Products */}
      <SimilarProducts product_id={searchParams.get("id")} />
      <ShopProducts product_id={searchParams.get("id")} />

      {/* Modals */}
      <MessagePopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        vendorName={myproduct?.vendor_id?.name}
        shopName={myproduct?.vendor_details?.shop_name}
        vendorImage={`${myproduct?.vendor_base_url}${myproduct?.vendor_id?.image}`}
        shopImage={`${myproduct?.vendor_details?.vendor_shop_icon_url}${myproduct?.vendor_details?.shop_icon}`}
        receiverid={myproduct?.vendor_id?._id}
        productID={myproduct?._id}
        productTitle={myproduct?.product_title}
        originalPrice={originalPrice}
        productImage={`${myproduct?.image_url}${myproduct?.image[0]}`}
      />

      <ShareModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        product={myproduct}
        usercredentials={usercredentials}
      />
    </>
  );
};

export default MyproductDetails;
