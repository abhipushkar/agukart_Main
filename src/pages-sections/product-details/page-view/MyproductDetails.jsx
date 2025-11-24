"use client";
import React, { useEffect, useState, useRef } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Small } from "components/Typography";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import ListItemButton from "@mui/material/ListItemButton";
import parse from "html-react-parser";
import { useRouter, useSearchParams } from "next/navigation";
// import Lightbox from "react-image-lightbox";
// import "react-image-lightbox/style.css";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import StarIcon from "@mui/icons-material/Star";
import CheckIcon from "@mui/icons-material/Check";
import Slider from "react-slick";
import IosShareIcon from "@mui/icons-material/IosShare";
import Modal from "@mui/material/Modal";
import CloseIcon from "@mui/icons-material/Close";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import PinterestIcon from "@mui/icons-material/Pinterest";
import {
  CardContent,
  CardMedia,
  Typography,
  Button,
  Breadcrumbs,
  MenuItem,
  CircularProgress,
  Rating,
  TextField,
  Skeleton,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import {
  ChevronRight as ChevronRightIcon,
  ExpandMore,
} from "@mui/icons-material";
import FormControl from "@mui/material/FormControl";
import axios, { all } from "axios";
import moment from "moment";
import styled from "@emotion/styled";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useCart from "hooks/useCart";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";
import MessagePopup from "./MessagePopup";
import { fontSize } from "theme/typography";
import useMyProvider from "hooks/useMyProvider";
import { set } from "lodash";
import { useCurrency } from "contexts/CurrencyContext";
import { calculatePriceAfterDiscount } from "utils/calculatePriceAfterDiscount";
import DeliveryAndReturnPolicy from "./DeliveryAndReturnPolicy";
import ReportItem from "./ReportItem";
import SimilarProducts from "./SimilarProducts/SimilarProducts";
import ShopProducts from "./ShopProducts/ShopProducts";
import { getTimeLeftText } from "components/getTimeLeftText/getTimeLeftText";
import Link from "next/link";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const MyproductDetails = ({ slug }) => {
  const { currency } = useCurrency();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const affiliate_code = searchParams.get("affiliate_code");
  const { addToast } = useToasts();
  const { token } = useAuth();
  const { usercredentials } = useMyProvider();
  const [value, setValue] = React.useState("1");
  const [myproduct, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [quantity, setQuantiity] = useState(1);
  const [allReviews, setAllReview] = useState([]);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [wishlistIdArr, setWishlistIdArr] = useState([]);
  console.log(wishlistIdArr, "wishlistIdArr");
  const [selectedVariants, setSelectedVariants] = useState({});
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [toggleWishlist, setToggleWishlist] = useState(false);
  const { state, dispatch } = useCart();
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [filterVariantAttributes, setFilterVariantAttributes] = useState([]);
  console.log(filterVariantAttributes, "filterVariantAttributes");
  const [seletedCustomizationDropdown, setSeletedCustomizationDropdown] =
    useState({});
  const [customizeDropdownPrice, setCustomizeDropdownPrice] = useState(0);
  const [customizeTextPrice, setCustomizeTextPrice] = useState(0);
  const [customizationText, setCustomizationText] = useState({});
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  console.log({ validationErrors });
  const [toggle, setToggle] = useState(false);
  const [plusToggle, setPlusToggle] = useState(false);
  const [bestPromotion, setBestPromotion] = useState({});
  const [nextPromotion, setNextPromotion] = useState({});
  const [voucherDetails, setVoucherDetails] = useState({ discount: 0, voucherCode: "" });
  const sliderRef = useRef(null);
  console.log(
    {
      myproduct,
      selectedVariants,
      seletedCustomizationDropdown,
      customizationText,
    },
    "HhHHHHHHHHHHHHHHHH"
  );
  const openLightbox = () => {
    setIsOpen(true);
  };

  const [openModal, setOpenModal] = useState(false);
  const shareUrl = encodeURIComponent(usercredentials?.affiliate_code ? `${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}&affiliate_code=${usercredentials?.affiliate_code}` : `${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}`);
  const shareTitle = encodeURIComponent(myproduct?.product_title);

  const copyToClipboard = () => {
    const url = usercredentials?.affiliate_code ? `${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}&affiliate_code=${usercredentials?.affiliate_code}` : `${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard!", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const settings = {
    vertical: true,
    slidesToShow: media?.length >= 8 ? 8 : media?.length || 0,
    slidesToScroll: 1,
    infinite: false,
    speed: 500,
    focusOnSelect: true,
    arrows: false,
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [expanded, setExpanded] = useState("panel1");

  const handleChangeAccord = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  // modal popup message
  const [openPopup, SetOpenPopup] = useState(false);

  const handleClickPopup = () => {
    if (!token) {
      router.push("/login");
      return;
    }
    SetOpenPopup(true);
  };

  const handleClosePopup = () => {
    SetOpenPopup(false);
  };

  const router = useRouter();
  const fetchProductHandler = async () => {
    const auth_key = localStorage.getItem("auth_key");
    console.log({ auth_key });
    try {
      setLoading(true);
      const res = await getAPIAuth(`get-productById?productId=${id}`);

      if (res.status === 200) {
        setLoading(false);

        console.log(res, "product ressssssssssssponse");
        setProduct({
          image_url: res.data.image_url,
          video_url: res.data.video_url,
          ...res.data.data,
        });
        setPrice(+res.data.data.sale_price);
        setStock(+res.data.data.qty);
        setOriginalPrice(+res.data.data.sale_price);
        setAllReview(res?.data?.rating);
        setMedia([...res.data.data.image, ...res.data.data.videos]);
        const sliderImage = [
          ...(res?.data?.data?.image || []).map((img) => ({
            src: `${res.data.image_url}${img}`,
          })),
          ...(res?.data?.data?.videos?.length > 0
            ? res.data.data.videos.map((vid) => ({
              type: "video",
              width: 1280,
              height: 720,
              poster: `${res.data.video_url}${vid.replace(".mp4", ".jpg")}`,
              sources: [
                {
                  src: `${res.data.video_url}${vid}`,
                  type: "video/mp4",
                },
              ],
            }))
            : []),
        ];
        setSliderImages(sliderImage);
        if (res?.data?.data?.parent_id !== null) {
          const product_id = res?.data?.data?._id;
          const filterCombination = res?.data?.data?.combinationData.find(
            (obj) => {
              return obj.sku_product_id === product_id;
            }
          );

          filterCombination.combination_id.split(",").forEach((ids) => {
            const variants =
              res.data.data.parent_id.variant_attribute_id.filter((variant) => {
                return ids === variant._id;
              });
            variants.forEach((lastVar) => {
              setSelectedVariants((prev) => ({
                ...prev,
                [lastVar.variant]: lastVar._id,
              }));
            });
          });

          // filterCombination.forEach((obj) => {
          //   const variants =
          //     res.data.data.parent_id.variant_attribute_id.filter((variant) => {
          //       return obj.combination_id === variant._id;
          //     });

          //   variants.forEach((lastVar) => {
          //     setSelectedVariants((prev) => ({
          //       ...prev,
          //       [lastVar.variant]: lastVar._id,
          //     }));
          //   });
          // });
        }
        // if (res?.data?.data?.isCombination == true) {
        //   const selectvariants = res?.data?.data?.variant_id?.reduce((acc, variant) => {
        //     const matchingVariantAttribute = res.data.data.variant_attribute_id.find(
        //       (attr) => attr.variant === variant._id
        //     );
        //     if (matchingVariantAttribute) {
        //       acc[variant._id] = matchingVariantAttribute._id;
        //     }
        //     return acc;
        //   }, {});
        //   setSelectedVariants(selectvariants);
        // }
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getCombinations = (arr) => {
    let combinations = arr.map((item) => [item]);
    if (arr.length > 1) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          combinations.push([arr[i], arr[j]]);
        }
      }
    }
    return combinations;
  };

  useEffect(() => {
    if (myproduct?.isCombination) {
      const variantAttributeIds = Object.values(selectedVariants);

      const variantCombinations = getCombinations(variantAttributeIds);
      console.log(variantCombinations, "Generated 2-item combinations");

      const mergedCombinations = myproduct?.combinationData
        ?.map((item) => item.combinations)
        .flat();
      console.log(mergedCombinations, "mergedCombinations");
      const combinationMinimumPrice = mergedCombinations
        ?.reduce((min, obj) => {
          const price = obj.isCheckedPrice ? +obj.price : Infinity;
          return price > 0 ? Math.min(min, price) : min;
        }, Infinity);
      const combinationMinimumStock = mergedCombinations
        ?.reduce((min, obj) => {
          const qty = obj.isCheckedQuantity ? +obj.qty : Infinity;
          return qty > 0 ? Math.min(min, qty) : min;
        }, Infinity);
      const minimumPrice =
        combinationMinimumPrice != Infinity
          ? combinationMinimumPrice
          : myproduct?.sale_price;
      const minimumStock =
        combinationMinimumStock != Infinity
          ? combinationMinimumStock
          : myproduct?.qty;
      // Find the matching combination based on the 2-item combinations
      const data = mergedCombinations?.filter((item) =>
        variantCombinations?.some(
          (combination) =>
            Array.isArray(item?.combIds) &&
            Array.isArray(combination) &&
            JSON.stringify(item?.combIds.sort()) ===
            JSON.stringify(combination.sort())
        )
      );
      if (data.length <= 1) {
        if (+data[0]?.price > 0 && +data[0]?.qty > 0 && data[0]?.isVisible && data[0]?.isCheckedPrice && data[0]?.isCheckedQuantity) {
          let finalPrice =
            +data[0]?.price + customizeDropdownPrice + customizeTextPrice;
          if (
            bestPromotion &&
            Object.keys(bestPromotion).length > 0 &&
            bestPromotion.qty <= quantity
          ) {
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
          setStock(+data[0]?.qty);
          setPlusToggle(false);
        } else if (+data[0]?.price > 0 && data[0]?.isVisible && data[0]?.isCheckedPrice) {
          let finalPrice =
            +data[0]?.price + customizeDropdownPrice + customizeTextPrice;
          if (
            bestPromotion &&
            Object.keys(bestPromotion).length > 0 &&
            bestPromotion.qty <= quantity
          ) {
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
          setPlusToggle(false);
          if (stock == 0) {
            setStock(minimumStock);
          }
        } else if (+data[0]?.qty > 0 && data[0]?.isVisible && data[0]?.isCheckedQuantity) {
          setStock(+data[0]?.qty);
          if (price == 0) {
            let finalPrice =
              +data[0]?.price + customizeDropdownPrice + customizeTextPrice;
            if (
              bestPromotion &&
              Object.keys(bestPromotion).length > 0 &&
              bestPromotion.qty <= quantity
            ) {
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
            setPlusToggle(true);
          }
        } else {
          let finalPrice =
            minimumPrice + customizeDropdownPrice + customizeTextPrice;
          if (
            bestPromotion &&
            Object.keys(bestPromotion).length > 0 &&
            bestPromotion.qty <= quantity
          ) {
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
          setStock(minimumStock);
          setPlusToggle(true);
        }
      } else {
        data.forEach((item) => {
          if (item.isVisible) {
            if (+item.price > 0 && item?.isCheckedPrice) {
              setPlusToggle(false);
              let finalPrice =
                +item.price + customizeDropdownPrice + customizeTextPrice;
              if (
                bestPromotion &&
                Object.keys(bestPromotion).length > 0 &&
                bestPromotion.qty <= quantity
              ) {
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
            }
            if (+item.qty > 0 && item?.isCheckedQuantity) {
              setStock(+item.qty);
            }
          }
        });

        if (!data.some((item) => +item.price > 0 && item.isVisible && item.isCheckedPrice)) {
          let finalPrice =
            minimumPrice + customizeDropdownPrice + customizeTextPrice;
          if (
            bestPromotion &&
            Object.keys(bestPromotion).length > 0 &&
            bestPromotion.qty <= quantity
          ) {
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
          setPlusToggle(true);
        }
        if (!data.some((item) => +item.qty > 0 && item.isVisible && item.isCheckedQuantity)) {
          setStock(minimumStock);
        }
      }
      if (combinationMinimumPrice == Infinity) {
        setPlusToggle(false);
      }
    } else {
      const finalPrice = myproduct?.sale_price + customizeDropdownPrice + customizeTextPrice;
      if (bestPromotion && Object.keys(bestPromotion).length > 0 && bestPromotion.qty <= quantity) {
        console.log(bestPromotion, "bestPromotion");
        setPrice(calculatePriceAfterDiscount(
          bestPromotion?.offer_type,
          +bestPromotion?.discount_amount,
          finalPrice
        ));
        setOriginalPrice(finalPrice);
      } else {
        setPrice(finalPrice);
        setOriginalPrice(finalPrice);
      }
    }
  }, [
    selectedVariants,
    myproduct,
    quantity,
    bestPromotion,
    customizeDropdownPrice,
    customizeTextPrice,
  ]);

  useEffect(() => {
    if (!myproduct?.isCombination) {
      if (myproduct === null) return;
      const variantArr = Object.values(selectedVariants);
      const findCombinationObj = myproduct?.combinationData.find((obj) => {
        return obj.sku_product_id === myproduct?._id;
      });

      const combinationIdsArr = findCombinationObj?.combination_id.split(",");
      console.log({ variantArr, combinationIdsArr });

      const compareArr =
        JSON.stringify(variantArr) === JSON.stringify(combinationIdsArr);

      if (!compareArr) {
        const newStr = variantArr.join(",");
        const findCombinationObj = myproduct?.combinationData.find((obj) => {
          return obj.combination_id === newStr;
        });

        router.push(`/products?id=${findCombinationObj?.sku_product_id}`);
      }
    }
  }, [selectedVariants]);

  useEffect(() => {
    if (!myproduct?.isCombination) {
      if (
        bestPromotion &&
        Object.keys(bestPromotion).length > 0 &&
        bestPromotion.qty <= quantity
      ) {
        setPrice(
          calculatePriceAfterDiscount(
            bestPromotion?.offer_type,
            +bestPromotion?.discount_amount,
            myproduct.sale_price
          )
        );
      }
    }
  }, [myproduct, bestPromotion]);

  const viewProduct = async () => {
    try {
      const res = await postAPIAuth("user/add-viewed-products", {
        product_id: id[1],
      });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchProductHandler();
    if (token) {
      viewProduct();
    }
  }, [id]);

  useEffect(() => {
    if (token && myproduct !== null) {
      getVendorDetailBySlug();
      getWishList();
    }
  }, [myproduct, id]);

  console.log("qunttitititidkdkdkdk", isOpen);

  const VideoAvatarContainer = styled("div")(({ theme }) => ({
    position: "relative",
    width: "80px",
    height: "80px",
    // borderRadius: "10px",
    // border: "1px solid",
    // borderColor: "#dae1e7",
    overflow: "hidden",
  }));
  const VideoAvatar = styled("video")(({ theme }) => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }));

  const VideoShow = styled("video")(({ theme }) => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }));

  const isVideo = (mediaItem) => {
    if (!mediaItem) return;
    return mediaItem.includes(".mp4") || mediaItem.includes(".webm");
  };

  const validateCustomization = () => {
    const errors = {};
    let isValid = true;
    myproduct?.customizationData?.customizations?.forEach((customization) => {
      if (!customization.optionList) {
        if (
          customization.isCompulsory &&
          !customizationText[customization.label]?.value
        ) {
          isValid = false;
          errors[customization.label] =
            `Please enter a value for "${customization.label}".`;
        }
      } else {
        if (
          customization.isCompulsory &&
          !seletedCustomizationDropdown[customization.label]?.value
        ) {
          isValid = false;
          errors[customization.label] = "Please select an option";
        }
      }
    });
    setValidationErrors(errors);
    return isValid;
  };

  const checkInputMinValue = () => {
    let isValid = false;
    Object.entries(customizationText || {}).forEach(([label, { value, min, max }]) => {
      if (value.length < min) {
        setValidationErrors((prev) => ({
          ...prev,
          [label]: `Input should be between ${min} and ${max} characters.`,
        }));
        isValid = true;
      }
    });
    return isValid;
  }

  const handleCartAmountChange = async () => {
    let validationErrors = {};
    let hasError = false;
    const valid_variant_id =
      myproduct?.variant_id?.filter(
        (data) =>
          data?.variant_name &&
          myproduct?.variations_data?.some(
            (variant) => variant.name === data.variant_name
          )
      ) || [];
    valid_variant_id.forEach((variant) => {
      const selectedValue = selectedVariants[variant._id];
      if (!selectedValue) {
        validationErrors[variant._id] = "Please select an option";
        hasError = true;
      }
    });

    setErrors(validationErrors);
    if (!hasError) {
      if (myproduct?.customize === "Yes") {
        if (!validateCustomization()) {
          setToggle(true);
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
      if (!token) {
        let data = [];
        if (myproduct?.customize === "Yes") {
          data.push(seletedCustomizationDropdown);
          data.push(customizationText);
        }
        if (myproduct?.isCombination) {
          const variant_ids = Object.keys(selectedVariants);
          const varint_attribute_ids = Object.values(selectedVariants);
          const filteredVariants = myproduct?.variant_id?.filter((variant) =>
            variant_ids.includes(variant._id)
          );
          const filteredVariantAttributes =
            myproduct?.variant_attribute_id?.filter((variant_attribute) =>
              varint_attribute_ids.includes(variant_attribute._id)
            );
          dispatch({
            type: "CHANGE_CART_AMOUNT",
            payload: {
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
                  variantData: filteredVariants,
                  variantAttributeData: filteredVariantAttributes,
                  variant_attribute_id: varint_attribute_ids,
                  customize: myproduct?.customize,
                  customizationData: data,
                },
              ],
            },
          });
        } else {
          dispatch({
            type: "CHANGE_CART_AMOUNT",
            payload: {
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
                  isCombination: myproduct?.isCombination,
                  combinationData: [],
                  variantData: [],
                  variantAttributeData: [],
                  variant_attribute_id: [],
                  customize: myproduct?.customize,
                  customizationData: data,
                },
              ],
            },
          });
        }
        addToast("Product Added To Cart", {
          appearance: "success",
          autoDismiss: true,
        });
      } else {
        // if (voucherDetails?.discount > 0) {
        //   addToast("Please remove the voucher code first", {
        //     appearance: "error",
        //     autoDismiss: true,
        //   });
        //   return;
        // }
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
            (payload.variant_id = keysArray),
              (payload.variant_attribute_id = valuesArray);
          }
          if (myproduct?.customize === "Yes") {
            let data = [];
            data.push(seletedCustomizationDropdown);
            data.push(customizationText);
            payload.customizationData = data;
          }
          if (affiliate_code) {
            payload.affiliate_id = affiliate_code;
          }
          if (Object.keys(myproduct?.shipping_templates || {})) {
            payload.shippingName = "standardShipping",
              payload.shipping_id = myproduct?.shipping_templates?._id
          }
          const res = await postAPIAuth("user/add-to-cart", payload);
          if (res.status === 200) {
            try {
              const res = await getAPIAuth("user/cart-list");
              if (res.status === 200) {
                dispatch({ type: "INIT_CART", payload: res?.data?.result });
                addToast("Product Added To Cart", {
                  appearance: "success",
                  autoDismiss: true,
                });
              }
            } catch (error) {
              console.log(error);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  console.log(myproduct, "dduuuuooocllll");

  const getWishList = async () => {
    try {
      const res = await getAPIAuth("user/get-wishlist");
      if (res.status === 200) {
        const wishlistIdArr = res.data.wishlist.map((product) => {
          return product.product_id._id;
        });
        setWishlistIdArr(wishlistIdArr);
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWishlist = async (statment) => {
    if (!token) {
      return router.push("/login");
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
        const data = await getWishList();
        if (data) {
          addToast(statment, {
            appearance: "success",
            autoDismiss: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const buyNowHandler = async () => {
    let validationErrors = {};
    let hasError = false;
    const valid_variant_id =
      myproduct?.variant_id?.filter(
        (data) =>
          data?.variant_name &&
          myproduct?.variations_data?.some(
            (variant) => variant.name === data.variant_name
          )
      ) || [];
    valid_variant_id.forEach((variant) => {
      const selectedValue = selectedVariants[variant._id];
      if (!selectedValue) {
        validationErrors[variant._id] = "Please select an option";
        hasError = true;
      }
    });

    setErrors(validationErrors);
    if (!hasError) {
      if (myproduct?.customize === "Yes") {
        if (!validateCustomization()) {
          setToggle(true);
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
      if (!token) {
        let data = [];
        if (myproduct?.customize === "Yes") {
          data.push(seletedCustomizationDropdown);
          data.push(customizationText);
        }
        if (myproduct?.isCombination) {
          const variant_ids = Object.keys(selectedVariants);
          const varint_attribute_ids = Object.values(selectedVariants);
          const filteredVariants = myproduct?.variant_id?.filter((variant) =>
            variant_ids.includes(variant._id)
          );
          const filteredVariantAttributes =
            myproduct?.variant_attribute_id?.filter((variant_attribute) =>
              varint_attribute_ids.includes(variant_attribute._id)
            );
          dispatch({
            type: "CHANGE_CART_AMOUNT",
            payload: {
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
                  isCombination: myproduct?.isCombination,
                  combinationData: myproduct?.combinationData,
                  variantData: filteredVariants,
                  variantAttributeData: filteredVariantAttributes,
                  variant_attribute_id: varint_attribute_ids,
                  customize: myproduct?.customize,
                  customizationData: data,
                },
              ],
            },
          });
        } else {
          dispatch({
            type: "CHANGE_CART_AMOUNT",
            payload: {
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
                  firstImage: `${myproduct?.image_url}${media[0]}`,
                  isCombination: myproduct?.isCombination,
                  combinationData: [],
                  variantData: [],
                  variantAttributeData: [],
                  variant_attribute_id: [],
                  customize: myproduct?.customize,
                  customizationData: data,
                },
              ],
            },
          });
        }
        router.push("/cart");
        addToast("Product Added To Cart", {
          appearance: "success",
          autoDismiss: true,
        });
      } else {
        // if (voucherDetails?.discount > 0) {
        //   addToast("Please remove the voucher code first", {
        //     appearance: "error",
        //     autoDismiss: true,
        //   });
        //   return;
        // }
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
            (payload.variant_id = keysArray),
              (payload.variant_attribute_id = valuesArray);
          }
          if (myproduct?.customize === "Yes") {
            let data = [];
            data.push(seletedCustomizationDropdown);
            data.push(customizationText);
            payload.customizationData = data;
          }
          if (affiliate_code) {
            payload.affiliate_id = affiliate_code;
          }
          if (Object.keys(myproduct?.shipping_templates)) {
            payload.shippingName = "standardShipping",
              payload.shipping_id = myproduct?.shipping_templates?._id
          }
          const res = await postAPIAuth("user/add-to-cart", payload);
          if (res.status === 200) {
            router.push("/cart");
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const quantityArr = Array.from(
    { length: Math.min(stock, 10) },
    (_, i) => i + 1
  );

  const getVendorDetailBySlug = async () => {
    try {
      const res = await getAPIAuth(
        `getVendorDetailsBySlug/${myproduct?.vendor_details?.slug}?userId=${usercredentials?._id}`,
        token
      );

      console.log(res, "vendor_details");
      if (res.status === 200) {
        setVendorDetail(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggelFollowShopHandler = async () => {
    if (!token) {
      return router.push("/login");
    }
    try {
      const res = await postAPIAuth(`user/follow-vendor`, {
        vendorId: vendorDetail?._id,
      });
      if (res.status === 200) {
        getVendorDetailBySlug();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVariantChange = (variantId, value) => {
    setSelectedVariants((prev) => {
      if (value === "") {
        const updatedVariants = { ...prev };
        delete updatedVariants[variantId];
        return updatedVariants;
      }
      return {
        ...prev,
        [variantId]: value,
      };
    });
    setErrors((prv) => ({ ...prv, [variantId]: "" }));
  };

  const disableScroll = (e) => e.preventDefault();
  const handleMouseEnter = () => {
    window.addEventListener("scroll", disableScroll, { passive: true });
    window.addEventListener("wheel", disableScroll, { passive: true });
    window.addEventListener("touchmove", disableScroll, { passive: true });
  };

  const handleMouseLeave = () => {
    window.removeEventListener("scroll", disableScroll);
    window.removeEventListener("wheel", disableScroll);
    window.removeEventListener("touchmove", disableScroll);
  };
  const handleWheel = (e) => {
    e.preventDefault();
    if (sliderRef.current) {
      if (e.deltaY > 0) {
        sliderRef.current.slickNext();
      } else {
        sliderRef.current.slickPrev();
      }
    }
  };
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.slickGoTo(selectedImage);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (token && wishlistIdArr.length > 0) {
      const isMatch = wishlistIdArr.some((id) => id === myproduct?._id);
      setToggleWishlist(isMatch);
    } else {
      setToggleWishlist(false);
    }
  }, [token, wishlistIdArr]);

  useEffect(() => {
    if (myproduct?.isCombination) {
      const mergedCombinations = myproduct?.combinationData
        ?.map((item) => item.combinations)
        .flat();
      const variant_attributes = myproduct?.variant_attribute_id;
      const updatedVariantAttributes = variant_attributes?.map((variant) => {
        const variantCombinations = mergedCombinations.filter((combination) =>
          combination.combIds?.includes(variant._id)
        );
        const prices = variantCombinations
          .filter((combination) => combination.price != "")
          .map((combination) => combination.price);
        const quantities = variantCombinations
          .filter((combination) => combination.qty != "")
          .map((combination) => +combination.qty);
        const isVisible = variantCombinations.map(
          (combination) => combination.isVisible
        );
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        const minQuantity = quantities.length ? Math.min(...quantities) : null;
        const maxQuantity = quantities.length ? Math.max(...quantities) : null;
        const visibleArray = isVisible.length ? isVisible : [];
        return {
          ...variant,
          minPrice,
          maxPrice,
          minQuantity,
          maxQuantity,
          isCheckedQuantity: variantCombinations?.[0]?.isCheckedQuantity,
          isCheckedPrice: variantCombinations?.[0]?.isCheckedPrice,
          visibleArray,
        };
      });
      setVariantAttributes(updatedVariantAttributes);
      setFilterVariantAttributes(updatedVariantAttributes);
    }
  }, [myproduct]);

  useEffect(() => {
    if (myproduct?.isCombination) {
      const mergedCombinations = myproduct?.combinationData
        ?.map((item) => item.combinations)
        .flat();
      let updatedVariantAttributes = variantAttributes.map((variant) => {
        const selectedVariantAttributesIds = Object.values(selectedVariants);
        const selectedVariantCombination = mergedCombinations.filter(
          (combination) =>
            [selectedVariantAttributesIds[0]].every((selectedId) =>
              combination.combIds.includes(selectedId)
            ) && combination.combIds.includes(variant._id)
        );
        const prices = selectedVariantCombination
          .filter((combination) => combination.price != "")
          .map((combination) => combination.price);
        const quantities = selectedVariantCombination
          .filter((combination) => combination.qty != "")
          .map((combination) => +combination.qty);
        const isVisible = selectedVariantCombination.map(
          (combination) => combination.isVisible
        );
        const minPrice = prices.length ? Math.min(...prices) : variant.minPrice;
        const maxPrice = prices.length ? Math.max(...prices) : variant.maxPrice;
        const minQuantity = quantities.length
          ? Math.min(...quantities)
          : variant.minQuantity;
        const maxQuantity = quantities.length
          ? Math.max(...quantities)
          : variant.maxQuantity;
        const visibleArray = isVisible.length
          ? isVisible
          : variant.visibleArray;

        return {
          ...variant,
          minPrice,
          maxPrice,
          minQuantity,
          maxQuantity,
          visibleArray,
        };
      });
      if (Object.values(selectedVariants).length > 1) {
        updatedVariantAttributes = updatedVariantAttributes.map((variant) => {
          const selectedVariantAttributesIds = Object.values(selectedVariants);
          const selectedVariantCombination = mergedCombinations.filter(
            (combination) =>
              [selectedVariantAttributesIds[1]].every((selectedId) =>
                combination.combIds.includes(selectedId)
              ) && combination.combIds.includes(variant._id)
          );
          const prices = selectedVariantCombination
            .filter((combination) => combination.price != "")
            .map((combination) => combination.price);
          const quantities = selectedVariantCombination
            .filter((combination) => combination.qty != "")
            .map((combination) => +combination.qty);
          const isVisible = selectedVariantCombination.map(
            (combination) => combination.isVisible
          );
          const minPrice = prices.length
            ? Math.min(...prices)
            : variant.minPrice;
          const maxPrice = prices.length
            ? Math.max(...prices)
            : variant.maxPrice;
          const minQuantity = quantities.length
            ? Math.min(...quantities)
            : variant.minQuantity;
          const maxQuantity = quantities.length
            ? Math.max(...quantities)
            : variant.maxQuantity;
          const visibleArray = isVisible.length
            ? isVisible
            : variant.visibleArray;

          return {
            ...variant,
            minPrice,
            maxPrice,
            minQuantity,
            maxQuantity,
            visibleArray,
          };
        });
      }
      if (Object.values(selectedVariants).length > 2) {
        updatedVariantAttributes = updatedVariantAttributes.map((variant) => {
          const selectedVariantAttributesIds = Object.values(selectedVariants);
          const selectedVariantCombination = mergedCombinations.filter(
            (combination) =>
              [selectedVariantAttributesIds[2]].every((selectedId) =>
                combination.combIds.includes(selectedId)
              ) && combination.combIds.includes(variant._id)
          );
          const prices = selectedVariantCombination
            .filter((combination) => combination.price != "")
            .map((combination) => combination.price);
          const quantities = selectedVariantCombination
            .filter((combination) => combination.qty != "")
            .map((combination) => +combination.qty);
          const isVisible = selectedVariantCombination.map(
            (combination) => combination.isVisible
          );
          const minPrice = prices.length
            ? Math.min(...prices)
            : variant.minPrice;
          const maxPrice = prices.length
            ? Math.max(...prices)
            : variant.maxPrice;
          const minQuantity = quantities.length
            ? Math.min(...quantities)
            : variant.minQuantity;
          const maxQuantity = quantities.length
            ? Math.max(...quantities)
            : variant.maxQuantity;
          const visibleArray = isVisible.length
            ? isVisible
            : variant.visibleArray;

          return {
            ...variant,
            minPrice,
            maxPrice,
            minQuantity,
            maxQuantity,
            isCheckedQuantity: selectedVariantCombination?.[0]?.isCheckedQuantity,
            isCheckedPrice: selectedVariantCombination?.[0]?.isCheckedPrice,
            visibleArray,
          };
        });
      }
      setFilterVariantAttributes(updatedVariantAttributes);
    }
  }, [selectedVariants]);

  const handleCustomizationDropdownChange = (label, { value, price }) => {
    setSeletedCustomizationDropdown((prev) => {
      if (price == "") {
        const updatedDropdowns = { ...prev };
        delete updatedDropdowns[label];
        return updatedDropdowns;
      }
      return {
        ...prev,
        [label]: { value, price },
      };
    });
    setValidationErrors((prv) => ({ ...prv, [label]: "" }));
  };

  const handleCustomizationTextChange = (label, price, min, max, value) => {
    console.log({ label, price, min, max, value });
    if (value.length > max) {
      setValidationErrors((prev) => ({
        ...prev,
        [label]: `Input should be between ${min} and ${max} characters.`,
      }));
      return;
    }
    setCustomizationText((prev) => {
      if (value == "") {
        const updatedTextArray = { ...prev };
        delete updatedTextArray[label];
        return updatedTextArray;
      }
      return {
        ...prev,
        [label]: { value, price, min, max },
      };
    });
    setValidationErrors((prev) => ({ ...prev, [label]: "" }));
  };

  useEffect(() => {
    const customizeDropdownPrices = Object.values(
      seletedCustomizationDropdown
    ).reduce((acc, item) => {
      return acc + +item.price;
    }, 0);
    setCustomizeDropdownPrice(customizeDropdownPrices);
  }, [seletedCustomizationDropdown]);

  useEffect(() => {
    const customizeTextPrice = Object.values(customizationText).reduce(
      (acc, item) => {
        if (item.value.length >= item.min && item.value.length <= item.max) {
          return acc + +item.price;
        }
        return acc;
      },
      0
    );
    setCustomizeTextPrice(customizeTextPrice);
  }, [customizationText]);

  useEffect(() => {
    if (
      myproduct &&
      Object.keys(myproduct).length > 0 &&
      Array.isArray(myproduct?.promotionData)
    ) {
      const bestPromotion = myproduct.promotionData.reduce((best, promotion) => {
        if (
          promotion.qty !== null &&
          promotion.qty !== undefined &&
          promotion.qty <= quantity
        ) {
          if (
            !best ||
            promotion.qty > best.qty ||
            (promotion.qty === best.qty && promotion.discount_amount > best.discount_amount)
          ) {
            return promotion;
          }
        }
        return best;
      }, null);

      const bestAmountPromotion = myproduct.promotionData.reduce(
        (best, promotion) => {
          if (
            promotion.offer_amount !== null &&
            promotion.offer_amount !== undefined &&
            promotion.offer_amount <= originalPrice
          ) {
            if (!best || promotion.offer_amount > best.offer_amount) {
              return promotion;
            }
          }
          return best;
        },
        null
      );
      const nextPromotion = myproduct.promotionData.reduce(
        (next, promotion) => {
          if (
            promotion.qty !== null &&
            promotion.qty !== undefined &&
            promotion.qty > quantity
          ) {
            if (!next || promotion.qty < next.qty || (promotion.qty === next.qty && promotion.discount_amount > next.discount_amount)) {
              return promotion;
            }
          }
          return next;
        },
        null
      );
      let finalPromotion = {};
      if (
        bestPromotion &&
        Object.keys(bestPromotion).length > 0 &&
        bestAmountPromotion &&
        Object.keys(bestAmountPromotion).length > 0
      ) {
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
        if (offerAmount > offerAmount2) {
          finalPromotion = bestPromotion;
        } else {
          finalPromotion = bestAmountPromotion;
        }
      } else if (bestPromotion && Object.keys(bestPromotion).length > 0) {
        finalPromotion = bestPromotion;
      } else {
        finalPromotion = bestAmountPromotion;
      }
      setBestPromotion(finalPromotion);
      setNextPromotion(nextPromotion);
    }
  }, [myproduct, quantity, originalPrice]);

  const handleVisitCount = async () => {
    try {
      const res = await postAPIAuth("increase-vist-count", {
        product_id: id
      });
      if (res.status === 200) {
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    handleVisitCount();
  }, [])

  useEffect(() => {
    const data = localStorage.getItem("voucherDetails");
    if (data) {
      const voucherDetails = JSON.parse(data);
      const updatedVoucherDetails = {
        ...voucherDetails,
        discount: parseInt(voucherDetails.discount, 10)
      };
      setVoucherDetails(updatedVoucherDetails);
    }
  }, [])


  const ProductDetailShimmer = () => {
    return (
      <Container py={2}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Box sx={{
              display: {
                // xs: "none", 
                md: "flex", // visible on medium+
              },
            }} gap={2}>
              <Box sx={{
                display: {
                  xs: "none",
                  md: "flex", // visible on medium+
                },
              }} flexDirection="column" gap={1}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={60}
                    height={60}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
              <Skeleton
                variant="rectangular"
                width="100%"

                sx={{
                  flex: 1, borderRadius: 2, marginTop: "10px", height: {
                    xs: "300px",
                    md: "450px",
                  }
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Skeleton variant="text" width="50%" height={30} />
            <Skeleton variant="text" width="90%" height={40} />
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="30%" height={25} sx={{ my: 1 }} />
            <Skeleton variant="text" width="60%" height={35} />

            <Box mt={2}>
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
            </Box>
            <Box mt={2}>
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
            </Box>
            <Box mt={2}>
              <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
            </Box>
            <Box mt={3}>
              <Skeleton variant="rectangular" width="100%" height={50} sx={{ borderRadius: 8 }} />
            </Box>

            {/* SELLER INFO */}
            <Box mt={4}>
              <Skeleton variant="text" width="40%" height={30} />
              <Box display="flex" alignItems="center" mt={2} gap={2}>
                <Skeleton variant="circular" width={50} height={50} />
                <Box>
                  <Skeleton variant="text" width={120} height={20} />
                  <Skeleton variant="text" width={100} height={18} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width="100%" height={45} sx={{ mt: 2, borderRadius: 8 }} />
              <Skeleton variant="text" width="80%" height={18} sx={{ mt: 1 }} />
            </Box>
          </Grid>
        </Grid>
        {[...Array(3)].map((_, index) => (
          <Box key={index} mb={4}>
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Box>
        ))}
      </Container>
    );
  };

  return loading ? (
    <ProductDetailShimmer />
  ) : (
    <>
      {Object.keys(myproduct || {}).length > 0 ? (
        <>

          <Box sx={{
            width: '100%',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            justifyContent: "center",
            display: "flex",
            paddingLeft: {
              xs: '94px',
              md: 1,
            }, // optional padding
            paddingRight: {
              xs: '25px',
              md: 1,
            }, // optional padding
            pt: 2,
          }}>
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: "center",
              minWidth: 'max-content', // ensures content doesn't shrink
            }}>
              <Breadcrumbs
                pt={2}
                sx={{
                  display: "inline-flex", justifyContent: "center",

                }}
                separator={<ChevronRightIcon fontSize="small" />}
                aria-label="breadcrumb"
              >
                <Link href="/" color="inherit">
                  Homepage
                </Link>
                {
                  myproduct?.categories?.map((item) => (
                    <Link href={`/products-categories/search/${item.slug}?title=${item.title}&_id=${item._id}`} color="inherit">
                      {item?.title}
                    </Link>
                  ))
                }
              </Breadcrumbs>
            </Box>
          </Box>

          <Container sx={{
            pt: {
              xs: 0,   // mobile: no vertical padding
              md: 2,
            },
          }}>
            <Grid container sx={{
              position: "relative",
              spacing: {
                xs: 0,
                md: 2,
              }
            }} >
              <Grid item lg={8} md={6} xs={12}  >
                <Grid container spacing={2} m={0} width={"100%"} sx={{
                  position: "sticky", top: 0, marginBottom: {
                    xs: "10px",

                  }
                }} >
                  <Grid lg={1} md={2} xs={2} sx={{
                    display: {
                      xs: "none",  // hidden on mobile
                      md: "block", // visible on medium+
                    },
                  }} >
                    <Box
                      sx={{
                        position: "relative",
                        height: "100%",
                        overflow: "hidden",
                        display: {
                          xs: "none",  // hidden on mobile
                          md: "block", // visible on medium+
                        },
                      }}
                      onWheel={handleWheel}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <List sx={{
                        height: "568px",

                      }}>
                        <Slider ref={sliderRef} {...settings} sx={{ overflow: "auto", }}>
                          {media?.map((url, i) => {
                            return (
                              <ListItem
                                sx={{
                                  marginBottom: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                                disablePadding
                              >
                                <Button
                                  onClick={() => {
                                    setSelectedImage(i);
                                  }}
                                  sx={{
                                    border:
                                      selectedImage === i
                                        ? "2px solid #000"
                                        : "none",
                                    opacity: selectedImage === i ? 1 : 0.5,
                                    transition: "opacity 0.3s ease-in-out",
                                    overflow: "hidden",
                                    padding: "0",
                                    height: "60px",
                                    width: "60px",
                                    boxShadow: "0 0 3px #848282",
                                  }}
                                >
                                  {isVideo(url) ? (
                                    <VideoAvatarContainer>
                                      <VideoAvatar
                                        src={`${myproduct?.video_url}${url}`}
                                        loop
                                        muted
                                      />
                                      <PlayCircleOutlineIcon
                                        sx={{
                                          top: "24px",
                                          right: "12px",
                                          position: "absolute",
                                          width: "35px",
                                          height: "35px",
                                        }}
                                      />
                                    </VideoAvatarContainer>
                                  ) : (
                                    <img
                                      height={"80px"}
                                      width={"80px"}
                                      alt="Remy Sharp"
                                      src={`${myproduct.image_url}${url}`}
                                    />
                                  )}
                                </Button>
                              </ListItem>
                            );
                          })}
                        </Slider>
                      </List>
                    </Box>
                  </Grid>
                  <Grid
                    item
                    lg={11}
                    md={10}
                    xs={12}
                    sx={{
                      textAlign: "center", margin: "0", paddingLeft: "0 !important",
                      height: {
                        xs: "auto",
                        md: "559px",
                      }
                    }}
                  >
                    <Box sx={{ position: "relative", height: "100%" }}>
                      {isVideo(media[selectedImage]) ? (
                        <VideoShow
                          onClick={openLightbox}
                          src={`${myproduct?.video_url}${media[selectedImage]}`}
                          loop
                          muted
                          autoPlay
                          style={{
                            width: "100%",
                            height: {
                              xs: "auto",
                              md: "100dvh",
                            },
                            objectFit: "contain",
                            maxHeight: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "6px",
                            cursor: "pointer",
                            zIndex: 2,
                            position: "relative",
                          }}
                        />
                      ) : (
                        <img
                          alt="Remy Sharp"
                          onClick={openLightbox}
                          src={`${myproduct?.image_url}${myproduct?.image[selectedImage]}`}
                          style={{
                            width: "100%",
                            objectFit: "contain",
                            height: "100%",
                            aspectRatio: "1/1",
                            borderRadius: "6px",
                            cursor: "pointer",
                            zIndex: 2,
                            position: "relative",
                          }}
                        />
                      )}
                      {
                        myproduct?.product_bedge && <Typography
                          sx={{
                            zIndex: "9",
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background:
                              myproduct?.product_bedge === "Popular Now"
                                ? "#fed9c9"
                                : myproduct?.product_bedge === "Best Seller"
                                  ? "#e9d8a6"
                                  : "#c1f1c1",
                            boxShadow: "0 0 3px #696969",
                            borderRadius: "30px",
                            padding: "5px 10px",
                            color: "#000",
                            textDecoration: "underline dashed",
                            display: "flex",
                            alignItems: "center",
                            textUnderlineOffset: "2px",
                          }}
                        >
                          {
                            myproduct?.product_bedge == "Popular Now" && <svg
                              height="20px"
                              width="20px"
                              viewBox="-33 0 255 255"
                              xmlns="http://www.w3.org/2000/svg"
                              preserveAspectRatio="xMidYMid"
                              fill="#000000"
                            >
                              <defs>
                                <linearGradient
                                  id="linear-gradient-1"
                                  gradientUnits="userSpaceOnUse"
                                  x1="94.141"
                                  y1="255"
                                  x2="94.141"
                                  y2="0.188"
                                >
                                  <stop offset="0" stopColor="#ff4c0d" />
                                  <stop offset="1" stopColor="#fc9502" />
                                </linearGradient>
                              </defs>
                              <g id="fire">
                                <path
                                  d="M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z"
                                  fill="url(#linear-gradient-1)"
                                  fillRule="evenodd"
                                />
                                <path
                                  d="M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z"
                                  fill="#fc9502"
                                  fillRule="evenodd"
                                />
                                <path
                                  d="M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z"
                                  fill="#fce202"
                                  fillRule="evenodd"
                                />
                              </g>
                            </svg>
                          }
                          {
                            myproduct?.product_bedge == "Best Seller" && <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              height="20px"
                              width="20px"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M12 18a8 8 0 0 0 7.021-4.163q.008-.012.013-.024A8 8 0 1 0 12 18m4.5-8.8c.2-.1.2-.4.2-.6s-.3-.3-.5-.3h-2.8l-.9-2.7c-.1-.4-.8-.4-1 0l-.9 2.7H7.8c-.2 0-.4.1-.5.3s0 .4.2.6l2.3 1.7-.9 2.7c-.1.2 0 .4.2.6q.3.15.6 0l2.3-1.7 2.3 1.7c.1.1.2.1.3.1s.2 0 .3-.1c.2-.1.2-.4.2-.6l-.9-2.7z"
                              ></path>
                              <path d="M4.405 14.831a9 9 0 0 0 6.833 4.137L8.9 23l-2.7-3.3L2 19zm15.19 0a9 9 0 0 1-6.833 4.137L15.1 23l2.7-3.3L22 19z"></path>
                            </svg>
                          }
                          {myproduct?.product_bedge}
                        </Typography>
                      }
                      <Button
                        onClick={() => setOpenModal(true)}
                        sx={{
                          zIndex: "99",
                          position: "absolute",
                          top: "12px",
                          right: "64px",
                          background: "#fff",
                          boxShadow: "0 0 3px #696969",
                          borderRadius: "50%",
                          height: "40px",
                          width: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "&:hover": {
                            background: "#fff",
                            boxShadow: "0 0 4px #000",
                          },
                        }}
                      >
                        <IosShareIcon />
                      </Button>
                      {usercredentials?.designation_id != "4" && (
                        <Button
                          onClick={() => {
                            if (toggleWishlist) {
                              handleWishlist("Product remove from wishlist");
                              return;
                            }
                            handleWishlist("Product add to wishlist");
                          }}
                          sx={{
                            zIndex: "99",
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "#fff",
                            boxShadow: "0 0 3px #696969",
                            borderRadius: "50%",
                            height: "40px",
                            width: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": {
                              background: "#fff",
                              boxShadow: "0 0 4px #000",
                            },
                          }}
                        >
                          {toggleWishlist ? (
                            <FavoriteIcon />
                          ) : (
                            <FavoriteBorderIcon />
                          )}
                        </Button>
                      )}
                      <Box
                        sx={{
                          position: "absolute",
                          top: "0",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Button
                          onClick={() => {
                            let totalImages = media.length;
                            setSelectedImage(
                              (prev) => (prev - 1 + totalImages) % totalImages
                            );
                          }}
                          sx={{
                            background: "#fff",
                            boxShadow: "0 0 3px #000",
                            borderRadius: "50%",
                            width: {
                              xs: "40px",
                              md: "50px"
                            },
                            height: {
                              xs: "40px",
                              md: "50px"
                            },
                            zIndex: 3,
                          }}
                        >
                          <ChevronLeftIcon sx={{ fontSize: "32px" }} />
                        </Button>
                        <Button
                          onClick={() => {
                            let totalImages = media.length;
                            setSelectedImage(
                              (prev) => (prev + 1) % totalImages
                            );
                          }}
                          sx={{
                            background: "#fff",
                            boxShadow: "0 0 3px #000",
                            borderRadius: "50%",
                            width: {
                              xs: "40px",
                              md: "50px"
                            },
                            height: {
                              xs: "40px",
                              md: "50px"
                            },
                            zIndex: 3,
                          }}
                        >
                          <ChevronRightIcon sx={{ fontSize: "32px" }} />
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                  {isOpen && (
                    <Lightbox
                      open={isOpen}
                      close={() => setIsOpen(false)}
                      slides={sliderImages}
                      index={selectedImage}
                      plugins={[Zoom, Video]}
                      zoom={{
                        maxZoomPixelRatio: 3,
                        zoomInMultiplier: 2,
                      }}
                    />
                  )}
                  <ReportItem product_id={myproduct?._id} />
                </Grid>
              </Grid>
              <Grid item lg={4} md={6} xs={12} >
                <CardContent>
                  <Typography
                    component="span"
                    onClick={() => {
                      const slug = myproduct?.vendor_details?.slug;
                      const url = `/store/${slug}`;
                      if (slug) {
                        window.open(url, "_blank");
                      } else {
                        console.error("Vendor slug is not available");
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
                  <Typography
                    style={{
                      textTransform: "capitalize",
                    }}
                    pt={1}
                    sx={{ color: "#8b8b8b", fontWeight: "500" }}
                  >
                    {myproduct !== null &&
                      parse(myproduct?.product_title || "")}
                  </Typography>
                  <Typography
                    component="div"
                    pt={1}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      variant="span"
                      pr={1}
                      sx={{ fontSize: "18px", color: "#000" }}
                    >
                      {myproduct?.ratingAvg}
                    </Typography>
                    <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Rating
                        precision={0.5}
                        value={myproduct?.ratingAvg}
                        size="small"
                        color="warn"
                        readOnly
                        sx={{
                          fontSize: 13,
                        }}
                      />
                    </Typography>
                    <Typography
                      variant="span"
                      pl={2}
                      sx={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#32888a",
                      }}
                    >
                      {myproduct?.userReviewCount} ratings
                    </Typography>
                  </Typography>
                  {nextPromotion &&
                    Object.keys(nextPromotion).length > 0 &&
                    +nextPromotion?.qty > quantity && (
                      <>
                        <p>
                          Save{" "}
                          {nextPromotion?.offer_type == "flat"
                            ? `$ ${nextPromotion?.discount_amount}`
                            : `${nextPromotion?.discount_amount} %`}{" "}
                          when you buy{" "}
                          {nextPromotion?.qty != 0 ? nextPromotion?.qty : ""}{" "}
                          items at this shop
                        </p>
                      </>
                    )}
                  <Typography
                    component="div"
                    sx={{
                      fontSize: "17px",
                      fontWeight: "600",
                      color: "#bc1111",
                    }}
                    pt={2}
                  >
                    {
                      stock == 0 ? "Sold Out" : myproduct?.cartProductCount > 0 ? `Only ${stock} left and in ${myproduct?.cartProductCount || 0} cart${myproduct?.cartProductCount === 1 ? '' : 's'}` : `Only ${stock} left`
                    }
                  </Typography>
                  <Typography
                    component="div"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      component="div"
                      sx={{
                        fontSize: "30px",
                        fontWeight: "600",
                        color: "#20538f",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {currency?.symbol}
                      {(price * currency.rate).toFixed(2)}
                      {myproduct?.isCombination && plusToggle && "+"}
                      <Small
                        pl={1}
                        sx={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "gray",
                        }}
                        component="del"
                      >
                        {originalPrice != price ? currency?.symbol : ""}
                        {originalPrice != price &&
                          (originalPrice * currency.rate).toFixed(2)}
                        {originalPrice != price &&
                          myproduct?.isCombination &&
                          plusToggle &&
                          "+"}
                      </Small>
                    </Typography>
                    {bestPromotion &&
                      Object.keys(bestPromotion).length > 0 &&
                      bestPromotion?.qty <= quantity && (
                        <Box
                          sx={{
                            display: "inline-block",
                            backgroundColor: "#00C853",
                            color: "#fff",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginLeft: "10px",
                          }}
                        >
                          {bestPromotion?.offer_type == "flat"
                            ? `Flat ${bestPromotion?.discount_amount} OFF`
                            : `${bestPromotion?.discount_amount}% OFF`}
                        </Box>
                      )}
                  </Typography>
                  {quantity > 1 && (
                    <Typography
                      component="div"
                      sx={{
                        fontSize: "17px",
                        fontWeight: "600",
                      }}
                    >
                      {"(Per Unit)"}
                    </Typography>
                  )}
                  {
                    bestPromotion && Object.keys(bestPromotion).length > 0 && (() => {
                      const timeLeftText = getTimeLeftText(bestPromotion.start_date, bestPromotion.expiry_date);
                      return timeLeftText ? (
                        <Typography sx={{ color: 'green', fontWeight: 'bold' }}>
                          {timeLeftText}
                        </Typography>
                      ) : null;
                    })()
                  }
                  {myproduct?.parent_id !== null
                    ? myproduct?.parent_id?.variant_id.map((variant) => {
                      return (
                        <Typography
                          key={variant._id}
                          pt={2}
                          container
                          spacing={2}
                          component="div"
                        >
                          <Grid
                            item
                            xs={12}
                            mb={1}
                            variant="span"
                            sx={{ fontSize: "17px" }}
                          >
                            {variant.variant_name}:
                          </Grid>
                          <Grid item lg={12}>
                            <FormControl sx={{ width: "100%" }}>
                              <Select
                                value={selectedVariants[variant._id] || ""} // Step 3: Set the selected value
                                displayEmpty
                                onChange={
                                  (e) =>
                                    handleVariantChange(
                                      variant._id,
                                      e.target.value
                                    ) // Step 4: Handle the change event
                                }
                                sx={{
                                  border: "none",
                                  background: "#fff",
                                  height: "40px",
                                  boxShadow: "0 0 3px #000",
                                  ".MuiOutlinedInput-notchedOutline": {
                                    border: "none",
                                  },
                                }}
                                renderValue={(selected) => {
                                  if (!selected) return "Select an option";
                                  const selectedAttribute =
                                    myproduct?.parent_id?.variant_attribute_id?.find(
                                      (atr) => atr._id === selected
                                    );
                                  return (
                                    selectedAttribute?.attribute_value ||
                                    "Select an option"
                                  );
                                }}
                              >
                                <MenuItem value="" disabled>
                                  Select an option
                                </MenuItem>
                                {myproduct?.parent_id?.variant_attribute_id.map(
                                  (atr) => {
                                    if (atr.variant === variant._id) {
                                      return (
                                        <MenuItem
                                          key={atr._id}
                                          value={atr._id}
                                        >
                                          {atr.attribute_value}
                                        </MenuItem>
                                      );
                                    }
                                  }
                                )}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Typography>
                      );
                    })
                    : myproduct?.isCombination == true
                      ? myproduct?.variant_id?.map((variant) => {
                        const isVariantValid =
                          myproduct?.variations_data.some(
                            (data) => data.name === variant.variant_name
                          );
                        return (
                          isVariantValid && (
                            <Typography
                              key={variant._id}
                              pt={2}
                              container
                              spacing={2}
                              component="div"
                            >
                              <Grid
                                item
                                xs={12}
                                mb={1}
                                variant="span"
                                sx={{ fontSize: "17px" }}
                              >
                                {variant.variant_name}{" "}
                                <span
                                  style={{
                                    color: "red",
                                    fontSize: "15px",
                                    marginRight: "3px",
                                    marginLeft: "3px",
                                  }}
                                >
                                  *
                                </span>
                              </Grid>
                              <Grid item lg={12}>
                                <FormControl sx={{ width: "100%" }}>
                                  <Select
                                    value={
                                      selectedVariants[variant._id] || ""
                                    }
                                    displayEmpty
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variant._id,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() => {
                                      if (!selectedVariants[variant._id]) {
                                        setErrors((prev) => ({
                                          ...prev,
                                          [variant._id]:
                                            "Please select an option",
                                        }));
                                      } else {
                                        setErrors((prev) => ({
                                          ...prev,
                                          [variant._id]: "",
                                        }));
                                      }
                                    }}
                                    renderValue={(selected) => {
                                      if (!selected)
                                        return "Select an option";
                                      const selectedAttribute =
                                        filterVariantAttributes?.find(
                                          (atr) => atr._id === selected
                                        );
                                      return (
                                        selectedAttribute?.attribute_value ||
                                        "Select an option"
                                      );
                                    }}
                                    sx={{
                                      border: "none",
                                      background: "#fff",
                                      height: "40px",
                                      boxShadow: "0 0 3px #000",
                                      ".MuiOutlinedInput-notchedOutline": {
                                        border: "none",
                                      },
                                    }}
                                  >
                                    <MenuItem value="">
                                      Select an option
                                    </MenuItem>
                                    {filterVariantAttributes?.map(
                                      (atr) =>
                                        atr.variant === variant._id &&
                                        !(
                                          atr.visibleArray.length == 1 &&
                                          atr.visibleArray[0] == false
                                        ) && (
                                          <MenuItem
                                            key={atr._id}
                                            value={atr._id}
                                            disabled={
                                              atr.minQuantity == 0 &&
                                              atr.maxQuantity == 0 &&
                                              atr.isCheckedQuantity
                                            }
                                          >
                                            {atr.attribute_value}{" "}
                                            {!Object.values(
                                              selectedVariants
                                            ).includes(atr._id) &&
                                              atr.minQuantity == 0 &&
                                              atr.maxQuantity == 0 &&
                                              atr?.isCheckedQuantity
                                              ? "[Sold Out]"
                                              : !Object.values(
                                                selectedVariants
                                              ).includes(atr._id) &&
                                              atr.minPrice !== 0 &&
                                              (atr.minPrice === atr.maxPrice
                                                ? `(${currency?.symbol}${(atr.minPrice * currency?.rate).toFixed(2)})`
                                                : `(${currency?.symbol}${(atr.minPrice * currency?.rate).toFixed(2)} - ${currency?.symbol}${(atr.maxPrice * currency?.rate).toFixed(2)})`)}
                                          </MenuItem>
                                        )
                                    )}
                                  </Select>
                                  {errors[variant._id] && (
                                    <p
                                      style={{
                                        color: "red",
                                        marginTop: "5px",
                                      }}
                                    >
                                      {errors[variant._id]}
                                    </p>
                                  )}
                                </FormControl>
                              </Grid>
                            </Typography>
                          )
                        );
                      })
                      : ""}
                  {myproduct?.customize === "Yes" && (
                    <Typography pt={2} component="div">
                      <Typography
                        component="div"
                        pb={1}
                        sx={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "gray",
                        }}
                      >
                        {myproduct?.customizationData?.label}
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{
                          background: "#f6bc3b",
                          fontSize: "17px",
                          borderRadius: "25px",
                        }}
                        onClick={() => setToggle((prev) => !prev)}
                      >
                        Customize <ExpandMore fontSize="inherit" />
                      </Button>
                      {toggle && (
                        <>
                          {myproduct?.customizationData?.customizations?.map(
                            (customization, index) => (
                              <Box key={index}>
                                {!customization.optionList ? (
                                  <Grid
                                    container

                                    pt={2}
                                    component="div"
                                  >
                                    <Grid
                                      item
                                      xs={9}
                                      sx={{
                                        fontSize: "17px",
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "-5px",
                                      }}
                                    >
                                      <strong>{customization.label}</strong>{" "}
                                      {customization.isCompulsory ? (
                                        <span
                                          style={{
                                            color: "red",
                                            fontSize: "15px",
                                            marginRight: "3px",
                                            marginLeft: "3px",
                                          }}
                                        >
                                          *
                                        </span>
                                      ) : (
                                        "(Optional)"
                                      )}
                                    </Grid>
                                    <Grid
                                      item
                                      xs={3}
                                      sx={{
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        textAlign: "right",
                                      }}
                                    >
                                      + {currency?.symbol}
                                      {customization.price * currency?.rate}
                                    </Grid>
                                    <Grid
                                      item
                                      xs={12}

                                      sx={{ fontSize: "17px" }}
                                    >
                                      {customization.instructions &&
                                        `[${customization.instructions}]`}
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={12} lg={12}>
                                      <FormControl sx={{ width: "100%" }}>
                                        <TextField
                                          fullWidth
                                          value={
                                            customizationText[
                                              customization.label
                                            ]?.value || ""
                                          }
                                          onBlur={() => {
                                            if (
                                              !customizationText[
                                              customization.label
                                              ] &&
                                              customization.isCompulsory
                                            ) {
                                              setValidationErrors((prev) => ({
                                                ...prev,
                                                [customization.label]: `Please enter a value for "${customization.label}".`,
                                              }));
                                            } else {
                                              setValidationErrors((prev) => ({
                                                ...prev,
                                                [customization.label]: "",
                                              }));
                                            }
                                          }}
                                          onChange={(e) =>
                                            handleCustomizationTextChange(
                                              customization.label,
                                              +customization.price,
                                              +customization.min,
                                              +customization.max,
                                              e.target.value
                                            )
                                          }
                                          placeholder={`${customization.placeholder}`}
                                          variant="outlined"
                                          InputProps={{
                                            sx: {
                                              height: "40px",
                                              display: "flex",
                                              alignItems: "center",
                                            },
                                          }}
                                          sx={{
                                            background: "#fff",
                                            boxShadow: "0 0 3px #000",
                                            ".MuiOutlinedInput-notchedOutline":
                                            {
                                              border: "none",
                                            },
                                          }}
                                        />
                                      </FormControl>
                                      <p
                                        style={{
                                          fontSize: "14px",
                                          color: "gray",
                                          textAlign: "right",
                                          marginTop: "5px",
                                        }}
                                      >
                                        {/* characters left */}
                                      </p>
                                      {validationErrors[
                                        customization.label
                                      ] && (
                                          <p
                                            style={{
                                              color: "red",
                                              marginTop: "5px",
                                            }}
                                          >
                                            {
                                              validationErrors[
                                              customization.label
                                              ]
                                            }
                                          </p>
                                        )}
                                    </Grid>
                                  </Grid>
                                ) : (
                                  <Grid
                                    container
                                    spacing={2}
                                    pt={1}
                                    component="div"
                                    sx={{ marginTop: "0px !important", }}
                                  >
                                    <Grid
                                      item
                                      xs={12}

                                      sx={{ fontSize: "17px", marginBottom: "-5px !important", paddingTop: "5px !important" }}
                                    >
                                      <strong>{customization.label}</strong>{" "}
                                      {customization.isCompulsory ? (
                                        <span
                                          style={{
                                            color: "red",
                                            fontSize: "15px",
                                            marginRight: "3px",
                                            marginLeft: "3px",
                                          }}
                                        >
                                          *
                                        </span>
                                      ) : (
                                        "(Optional)"
                                      )}
                                    </Grid>
                                    <Grid
                                      item
                                      xs={12}
                                      sx={{ fontSize: "17px", paddingTop: "1px !important" }}
                                    >
                                      {customization.instructions &&
                                        `[${customization.instructions}]`}
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ paddingTop: "2px !important" }}>
                                      <FormControl sx={{ width: "100%", }}>
                                        <Select
                                          displayEmpty
                                          value={
                                            seletedCustomizationDropdown[
                                              customization.label
                                            ]?.value || ""
                                          }
                                          onBlur={() => {
                                            if (
                                              !seletedCustomizationDropdown[
                                              customization.label
                                              ] &&
                                              customization.isCompulsory
                                            ) {
                                              setValidationErrors((prev) => ({
                                                ...prev,
                                                [customization.label]:
                                                  "Please select an option",
                                              }));
                                            } else {
                                              setValidationErrors((prev) => ({
                                                ...prev,
                                                [customization.label]: "",
                                              }));
                                            }
                                          }}
                                          onChange={(e) => {
                                            const selectedOption =
                                              customization?.optionList?.find(
                                                (option) =>
                                                  option.priceDifference ===
                                                  e.target.value
                                              );
                                            handleCustomizationDropdownChange(
                                              customization.label,
                                              {
                                                value:
                                                  selectedOption?.optionName,
                                                price: e.target.value,
                                              }
                                            );
                                          }}
                                          renderValue={(selected) => {
                                            if (!selected)
                                              return "Select an option";
                                            const selectedAttribute =
                                              customization?.optionList?.find(
                                                (atr) =>
                                                  atr.optionName === selected
                                              );
                                            return (
                                              selectedAttribute?.optionName ||
                                              "Select an option"
                                            );
                                          }}
                                          sx={{
                                            border: "none",
                                            background: "#fff",
                                            height: "40px",
                                            boxShadow: "0 0 3px #000",
                                            ".MuiOutlinedInput-notchedOutline":
                                            {
                                              border: "none",
                                            },
                                          }}
                                        >
                                          <MenuItem value="">
                                            Select an option
                                          </MenuItem>
                                          {customization?.optionList?.map(
                                            (option, index) => (
                                              <MenuItem
                                                key={index}
                                                value={option?.priceDifference}
                                              >
                                                {option?.optionName}{" "}
                                                {!Object.values(
                                                  seletedCustomizationDropdown
                                                ).some(
                                                  (selected) =>
                                                    selected?.value ===
                                                    option?.optionName
                                                ) &&
                                                  option?.priceDifference &&
                                                  option?.priceDifference !=
                                                  0 &&
                                                  `(+ ${currency?.symbol}${(option?.priceDifference * currency?.rate).toFixed(2)})`}
                                              </MenuItem>
                                            )
                                          )}
                                        </Select>
                                      </FormControl>
                                      {validationErrors[
                                        customization.label
                                      ] && (
                                          <p
                                            style={{
                                              color: "red",
                                              marginTop: "5px",
                                            }}
                                          >
                                            {
                                              validationErrors[
                                              customization.label
                                              ]
                                            }
                                          </p>
                                        )}
                                    </Grid>
                                  </Grid>
                                )}
                              </Box>
                            )
                          )}
                        </>
                      )}
                    </Typography>
                  )}
                  {usercredentials?.designation_id != "4" && (
                    <>
                      {
                        stock != 0 &&
                        <Typography pt={2} component="div">
                          <Typography mb={1} fontSize={17}>
                            Quantity:
                          </Typography>
                          <FormControl sx={{ width: "100%" }}>
                            <Select
                              value={quantity}
                              onChange={(e) => setQuantiity(e.target.value)}
                              sx={{
                                border: "none",
                                background: "#fff",
                                height: "40px",
                                boxShadow: "0 0 3px #000",
                                ".MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                              }}
                            >
                              {quantityArr.map((q) => (
                                <MenuItem key={q} value={q}>
                                  {q}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Typography>
                      }
                      <Typography pt={3} component="div">
                        <Button
                          onClick={handleCartAmountChange}
                          variant="contained"
                          sx={{
                            background: "#fff",
                            color: "#000",
                            padding: "12px 50px",
                            fontSize: "15px",
                            borderRadius: "25px",
                            width: "100%",
                            marginBottom: "12px",
                            border: "2px solid #000",
                          }}
                        >
                          Add to Cart
                        </Button>

                        <Button
                          onClick={buyNowHandler}
                          variant="contained"
                          sx={{
                            background: "#000",
                            padding: "12px 50px",
                            fontSize: "15px",
                            borderRadius: "25px",
                            width: "100%",
                            marginBottom: "12px",
                            color: "#fff",
                            "&:hover": { background: "#4f4e4e" },
                          }}
                        >
                          Buy Now
                        </Button>

                        <Button
                          onClick={() => {
                            if (toggleWishlist) {
                              handleWishlist("Product removed from wishlist");
                            } else {
                              handleWishlist("Product added to wishlist");
                            }
                          }}
                          variant="contained"
                          sx={{
                            background: "transparent",
                            padding: "12px 50px",
                            fontSize: "15px",
                            borderRadius: "25px",
                            width: "100%",
                            color: "#000",
                            display: "flex",
                            alignItems: "center",
                            boxShadow: "none",
                          }}
                        >
                          {toggleWishlist ? (
                            <FavoriteIcon sx={{ marginRight: "6px" }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ marginRight: "6px" }} />
                          )}
                          Add to collection
                        </Button>
                      </Typography>
                    </>
                  )}
                  <Box mt={3}>
                    <Accordion
                      sx={{ boxShadow: "none", background: "transparent" }}
                      expanded={expanded === "panel1"}
                      onChange={handleChangeAccord("panel1")}
                    >
                      <AccordionSummary
                        sx={{
                          ".MuiAccordionSummary-content": {
                            margin: "0 !important",
                          },
                          minHeight: "0 !important",
                          padding: "8px 16px",
                          transition: "all 500ms",
                          "&:hover": {
                            background: "#f0f0f0",
                            borderRadius: "30px",
                          },
                        }}
                        expandIcon={
                          <ExpandMoreIcon
                            sx={{
                              transform:
                                expanded === "panel1"
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        }
                        aria-controls="panel1d-content"
                        id="panel1d-header"
                      >
                        <Typography fontSize={18} fontWeight={600}>
                          Meet your seller
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Typography
                              component="div"
                            >
                              <img
                                src={
                                  myproduct?.vendor_base_url +
                                  myproduct?.vendor_id?.image
                                }
                                style={{
                                  borderRadius: "4px",
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                }}
                                alt=""
                              />
                            </Typography>
                            <Typography component="div" ml={1}>
                              <Typography
                                component="div"
                                sx={{
                                  cursor: "pointer",
                                }}
                              >
                                <Typography variant="h6" fontWeight={500}>
                                  {myproduct?.vendor_id?.name}
                                </Typography>
                              </Typography>
                              <Typography sx={{ color: "#000" }} onClick={() => {
                                const slug = myproduct?.vendor_details?.slug;
                                const url = `/store/${slug}`;

                                if (slug) {
                                  window.open(url, "_blank");
                                } else {
                                  console.error(
                                    "Vendor slug is not available"
                                  );
                                }
                              }}
                              >
                                Owner of{" "}
                                <span style={{ color: "#000", textDecoration: "underline", cursor: "pointer" }}>
                                  {myproduct?.vendor_details?.shop_name}
                                </span>
                              </Typography>
                              {usercredentials?.designation_id != "4" && (
                                <Button
                                  onClick={toggelFollowShopHandler}
                                  sx={{
                                    borderRadius: "30px",
                                    transition: "all 500ms",
                                  }}
                                >
                                  {vendorDetail?.followStatus ? (
                                    <FavoriteIcon
                                      mr={1}
                                      sx={{ color: "red", marginRight: "6px" }}
                                    />
                                  ) : (
                                    <FavoriteBorderIcon
                                      mr={1}
                                      sx={{ marginRight: "6px" }}
                                    />
                                  )}
                                  {vendorDetail?.followStatus
                                    ? "Unfollow Shop"
                                    : "Follow Shop"}
                                </Button>
                              )}
                            </Typography>
                          </Box>
                          <Typography component="div" mt={1}>
                            <Button
                              onClick={handleClickPopup}
                              sx={{
                                fontWeight: "600",
                                fontSize: "16px",
                                textAlign: "center",
                                border: "2px solid #000",
                                width: "100%",
                                background: "#fff",
                                borderRadius: "30px",
                                padding: "8px 18px",
                              }}
                            >
                              Message jen
                            </Button>
                          </Typography>
                          <Typography
                            pt={1}
                            textAlign={"center"}
                            sx={{ fontSize: "13px" }}
                          >
                            This seller usually responds{" "}
                            <Typography fontWeight={500} component="span">
                              within 24 hours
                            </Typography>
                            .
                          </Typography>
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Container>
          <Container py={2} sx={{ padding: "0px 0" }}>
            <Grid container spacing={4}>
              <Grid item lg={12} xs={12}>
                <TabContext value={value}>
                  <Box sx={{ maxWidth: { xs: 320, sm: 900 } }}>
                    <TabList
                      onChange={handleChange}
                      variant="scrollable"
                      scrollButtons="auto"
                      aria-label="scrollable auto tabs example"
                    >
                      <Tab id={"description"} label="Description" value="1" />
                      <Tab id={"specifications"} label="Product specification & details" value="2" />
                      <Tab id={"reviews"} label="reviews" value="3" />
                      <Tab id={"shipping_and_return"} label="Shipping and return policies" value="4" />
                      {myproduct?.tabs?.map((item, index) => (
                        <Tab key={index} label={item.title} value={index + 5} />
                      ))}
                    </TabList>
                  </Box>
                  <TabPanel value="1">
                    <Box sx={{ width: "100%" }}>
                      <HtmlRenderer html={myproduct?.description || ""} />
                    </Box>
                  </TabPanel>
                  <TabPanel value="2">
                    <Grid container spacing={4}>
                      <Grid item lg={6} md={6} xs={12}>
                        <TableContainer
                          sx={{ boxShadow: "none" }}
                          component={Paper}
                        >
                          <Table
                            size="small"
                            aria-label="a dense table"
                            sx={{
                              minWidth: 500,
                              ".MuiTableCell-root": {
                                borderBottom: "1px solid #bbbbbb !important",
                                width: "50%",
                              },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  colSpan={2}
                                  sx={{ fontSize: "18px", fontWeight: "bold" }}
                                >
                                  Information
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow sx={{ borderBottom: "1px solid" }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Gender
                                </TableCell>
                                <TableCell>
                                  {myproduct?.gender.map(
                                    (gender) => `${gender}, `
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid" }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Size
                                </TableCell>
                                <TableCell>
                                  {myproduct?.product_size
                                    ? myproduct?.product_size
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Size Map
                                </TableCell>
                                <TableCell>
                                  {myproduct?.size_map
                                    ? myproduct?.size_map
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Color
                                </TableCell>
                                <TableCell>
                                  {myproduct?.color ? myproduct?.color : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Style Name
                                </TableCell>
                                <TableCell>
                                  {myproduct?.style_name
                                    ? myproduct?.style_name
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Launch Date
                                </TableCell>
                                <TableCell>
                                  {moment(myproduct?.launch_date).format(
                                    "yyyy-MM-D"
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Release Date
                                </TableCell>
                                <TableCell>
                                  {moment(myproduct?.release_date).format(
                                    "yyyy-MM-D"
                                  )}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Shipping Weight
                                </TableCell>
                                <TableCell>
                                  {myproduct?.shipping_weight
                                    ? `${myproduct?.shipping_weight} ${myproduct?.package_weight_unit}`
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                          <Table
                            size="small"
                            aria-label="a dense table"
                            sx={{
                              minWidth: 500,
                              ".MuiTableCell-root": {
                                borderBottom: "1px solid #bbbbbb !important",
                                width: "50%",
                              },
                            }}
                          ></Table>
                        </TableContainer>
                      </Grid>
                      <Grid item lg={6} md={6} xs={12}>
                        <TableContainer
                          sx={{ boxShadow: "none" }}
                          component={Paper}
                        >
                          <Table
                            size="small"
                            aria-label="a dense table"
                            sx={{
                              minWidth: 500,
                              ".MuiTableCell-root": {
                                borderBottom: "1px solid #bbbbbb !important",
                                width: "50%",
                              },
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  colSpan={2}
                                  sx={{ fontSize: "18px", fontWeight: "bold" }}
                                >
                                  Information
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Item Display Dimenssion
                                </TableCell>
                                <TableCell>
                                  {`
    ${myproduct?.display_dimension_height} * ${myproduct?.display_dimension_length} * ${myproduct?.display_dimension_width} ${myproduct?.display_dimension_unit}`}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Package Dimenssion
                                </TableCell>
                                <TableCell>
                                  {`
                                  ${myproduct?.package_dimension_height} *
                                  ${myproduct?.package_dimension_length} *
                                  ${myproduct?.package_dimension_width}

                                  ${myproduct?.package_dimension_unit}`}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Package Weight
                                </TableCell>
                                <TableCell>
                                  {myproduct?.package_weight
                                    ? myproduct?.package_weight
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Unit Count
                                </TableCell>
                                <TableCell>
                                  {myproduct?.unit_count
                                    ? myproduct?.unit_count
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Unit Count type
                                </TableCell>
                                <TableCell>
                                  {myproduct?.unit_count_type
                                    ? myproduct?.unit_count_type
                                    : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Product Made
                                </TableCell>
                                <TableCell>-</TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Design
                                </TableCell>
                                <TableCell>
                                  {myproduct?.design ? myproduct?.design : "-"}
                                </TableCell>
                              </TableRow>
                              <TableRow sx={{ borderBottom: "1px solid " }}>
                                <TableCell sx={{ background: "#e9e9e9" }}>
                                  Material
                                </TableCell>
                                <TableCell>
                                  {myproduct?.material.map((mat) => `${mat}, `)}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    </Grid>
                  </TabPanel>
                  <TabPanel value="3">
                    {allReviews.length > 0 ? (
                      allReviews.map((review) => {
                        return (
                          <Box
                            key={review._id}
                            pb={2}
                            mb={2}
                            sx={{
                              display: { lg: "flex", md: "flex" },
                              borderBottom: "1px solid #e8e8e8",
                            }}
                          >
                            <Typography
                              component="div"
                              sx={{
                                width: { lg: "60%", md: "50%", xs: "100%" },
                              }}
                            >
                              <Rating
                                name="size-large"
                                value={review?.item_rating}
                                readOnly
                                size="large"
                              />
                              <Typography variant="h6">
                                {review.additional_comment}
                              </Typography>
                              <Typography
                                fontSize={14}
                                display={"flex"}
                                alignItems={"center"}
                              >
                                <Typography
                                  component="span"
                                  fontWeight={600}
                                  pr={1}
                                  whiteSpace={"nowrap"}
                                >
                                  Purchased item:{" "}
                                </Typography>
                                <Typography
                                  style={{
                                    width: "60%",
                                    color: "gray",
                                    fontSize: "14px",
                                    textDecoration: "underline",
                                    display: "-webkit-box",
                                    WebkitLineClamp: "1",
                                    WebkitBoxOrient: "vertical",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                  }}
                                >
                                  {parse(myproduct?.product_title || "")}
                                </Typography>
                              </Typography>
                              <Typography
                                fontSize={14}
                                display={"flex"}
                                pt={1}
                                alignItems={"center"}
                              >
                                <Typography
                                  component={"span"}
                                  overflow={"hidden"}
                                >
                                  <img
                                    src={review.user_image}
                                    style={{
                                      borderRadius: "50%",
                                      width: "22px",
                                      height: "22px",
                                    }}
                                    alt=""
                                  />{" "}
                                </Typography>
                                <Typography component="span" pl={1}>
                                  <Typography
                                    href="#"
                                    style={{
                                      color: "gray",
                                      fontSize: "14px",
                                      textDecoration: "underline",
                                    }}
                                  >
                                    {review.user_name}
                                  </Typography>
                                </Typography>
                                <Typography fontSize={14} color={"gray"} pl={1}>
                                  30 Sep, 2024
                                </Typography>
                              </Typography>
                            </Typography>
                            <Typography
                              component="div"
                              sx={{
                                width: { lg: "40%", md: "50%", xs: "100%" },
                                display: {
                                  lg: "flex",
                                  md: "flex",
                                  xs: "block",
                                },
                                flexDirection: "column",
                                alignItems: "end",
                              }}
                            >
                              <Typography component="div">
                                {review.recommended ? (
                                  <Typography
                                    display={"flex"}
                                    alignItems={"center"}
                                  >
                                    <CheckIcon
                                      pr={1}
                                      sx={{ fontSize: "15px", color: "green" }}
                                    />
                                    Recommends this item
                                  </Typography>
                                ) : (
                                  ""
                                )}

                                <Typography
                                  sx={{
                                    display: {
                                      lg: "flex",
                                      md: "flex",
                                      xs: "block",
                                    },
                                    flexDirection: "column",
                                    alignItems: "end",
                                  }}
                                  component="div"
                                  mt={2}
                                >
                                  <Typography
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Item quality{" "}
                                    <Typography component="span" pl={1}>
                                      {review.item_rating}
                                    </Typography>
                                    <Typography component="span">
                                      {" "}
                                      <StarIcon sx={{ fontSize: "20px" }} />
                                    </Typography>
                                  </Typography>
                                  <Typography
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    Delivery{" "}
                                    <Typography component="span" pl={1}>
                                      {review.delivery_rating}
                                    </Typography>
                                    <Typography component="span">
                                      {" "}
                                      <StarIcon sx={{ fontSize: "20px" }} />
                                    </Typography>
                                  </Typography>
                                  {/* <Typography
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              Customer service{" "}
                              <Typography component="span" pl={1}>
                                5
                              </Typography>
                              <Typography component="span">
                                {" "}
                                <StarIcon sx={{ fontSize: "20px" }} />
                              </Typography>
                            </Typography> */}
                                </Typography>
                              </Typography>
                            </Typography>
                          </Box>
                        );
                      })
                    ) : (
                      <div>Review not found</div>
                    )}

                    {/* <Box
                      pb={2}
                      mb={2}
                      sx={{
                        display: { lg: "flex", md: "flex" },
                        borderBottom: "1px solid #e8e8e8",
                      }}
                    >
                      <Typography
                        component="div"
                        sx={{ width: { lg: "60%", md: "50%", xs: "100%" } }}
                      >
                        <Typography
                          component="div"
                          display={"flex"}
                          alignItems={"center"}
                        >
                          <Typography component="span">
                            <StarIcon />
                          </Typography>
                          <Typography component="span">
                            <StarIcon />
                          </Typography>
                          <Typography component="span">
                            <StarIcon />
                          </Typography>
                          <Typography component="span">
                            <StarIcon />
                          </Typography>
                          <Typography component="span">
                            <StarIcon />
                          </Typography>
                        </Typography>
                        <Typography variant="h6">
                          Happy with my new necklace. Thin and fine but very
                          beautiful. It’s not just a watermelon 🍉 it’s a symbol of
                          solidarity with Palestinian people♥️
                        </Typography>
                        <Typography
                          fontSize={14}
                          display={"flex"}
                          alignItems={"center"}
                        >
                          <Typography
                            component="span"
                            fontWeight={600}
                            pr={1}
                            whiteSpace={"nowrap"}
                          >
                            Purchased item:{" "}
                          </Typography>
                          <Link
                            href="#"
                            style={{
                              width: "60%",
                              color: "gray",
                              fontSize: "14px",
                              textDecoration: "underline",
                              display: "-webkit-box",
                              WebkitLineClamp: "1",
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                            }}
                          >
                            Gold Watermelon Charm Necklace, 9K 14K 18K Gold
                            Necklace, Rose Gold, Solid Gold Sweet Fruit Engraved
                            Necklace, Summer Fruit Jewelry For Her
                          </Link>
                        </Typography>
                        <Typography
                          fontSize={14}
                          display={"flex"}
                          pt={1}
                          alignItems={"center"}
                        >
                          <Typography component={"span"} overflow={"hidden"}>
                            <img
                              src="https://i.etsystatic.com/iusa/6dc243/109604397/iusa_75x75.109604397_a4mk.jpg?version=0"
                              style={{
                                borderRadius: "50%",
                                width: "22px",
                                height: "22px",
                              }}
                              alt=""
                            />{" "}
                          </Typography>
                          <Typography component="span" pl={1}>
                            <Link
                              href="#"
                              style={{
                                color: "gray",
                                fontSize: "14px",
                                textDecoration: "underline",
                              }}
                            >
                              Katarzyna
                            </Link>
                          </Typography>
                          <Typography fontSize={14} color={"gray"} pl={1}>
                            30 Sep, 2024
                          </Typography>
                        </Typography>
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          width: { lg: "40%", md: "50%", xs: "100%" },
                          display: { lg: "flex", md: "flex", xs: "block" },
                          flexDirection: "column",
                          alignItems: "end",
                        }}
                      >
                        <Typography component="div">
                          <Typography display={"flex"} alignItems={"center"}>
                            <CheckIcon
                              pr={1}
                              sx={{ fontSize: "15px", color: "green" }}
                            />
                            Recommends this item
                          </Typography>
                          <Typography
                            sx={{
                              display: { lg: "flex", md: "flex", xs: "block" },
                              flexDirection: "column",
                              alignItems: "end",
                            }}
                            component="div"
                            mt={2}
                          >
                            <Typography
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              Item quality{" "}
                              <Typography component="span" pl={1}>
                                5
                              </Typography>
                              <Typography component="span">
                                {" "}
                                <StarIcon sx={{ fontSize: "20px" }} />
                              </Typography>
                            </Typography>
                            <Typography
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              Delivery{" "}
                              <Typography component="span" pl={1}>
                                5
                              </Typography>
                              <Typography component="span">
                                {" "}
                                <StarIcon sx={{ fontSize: "20px" }} />
                              </Typography>
                            </Typography>
                            <Typography
                              sx={{ display: "flex", alignItems: "center" }}
                            >
                              Customer service{" "}
                              <Typography component="span" pl={1}>
                                5
                              </Typography>
                              <Typography component="span">
                                {" "}
                                <StarIcon sx={{ fontSize: "20px" }} />
                              </Typography>
                            </Typography>
                          </Typography>
                        </Typography>
                      </Typography>
                    </Box> */}
                  </TabPanel>
                  <TabPanel value="4">
                    <DeliveryAndReturnPolicy
                      shippingTemplate={myproduct?.shipping_templates}
                      exchangePolicy={myproduct?.exchangePolicy}
                    />
                  </TabPanel>
                  {myproduct?.tabs?.map((item, index) => (
                    <TabPanel value={index + 5} key={index}>
                      <Box sx={{ width: "100%" }}>
                        <HtmlRenderer html={item?.description || ""} />
                      </Box>
                    </TabPanel>
                  ))}
                </TabContext>
              </Grid>
              {/* <Grid
                item
                lg={4}
                xs={12}
                sx={{ display: "flex", justifyContent: "end" }}
              >
                <Box>
                  <Typography
                    component="div"
                    pb={1}
                    sx={{ fontSize: "16px", color: "gray", fontWeight: "600" }}
                  >
                    Sold by{" "}
                    <Typography
                      sx={{ color: "#4e75bf", fontWeight: "600" }}
                      component="span"
                    >
                      Bhoo-Magic{" "}
                    </Typography>
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      background: "transparent",
                      border: "1px solid #000",
                      padding: "6px 50px",
                      fontSize: "15px",
                      borderRadius: "25px",
                    }}
                  >
                    Message{" "}
                    <Typography
                      sx={{ color: "#4e75bf", fontWeight: "600" }}
                      component="span"
                    >
                      &nbsp;Bhoo-Magic{" "}
                    </Typography>
                  </Button>
                  <Typography
                    component="div"
                    pt={1}
                    sx={{ fontSize: "11px", color: "gray" }}
                  >
                    This Seller usually responds within a few hours
                  </Typography>
                </Box>
              </Grid> */}
            </Grid>
          </Container>
          <SimilarProducts product_id={id} />
          <ShopProducts product_id={id} />
          {/* Message popup start */}
          <div>
            <MessagePopup
              vendorName={myproduct?.vendor_id?.name}
              shopName={myproduct?.vendor_details?.shop_name}
              vendorImage={`${myproduct?.vendor_base_url}${myproduct?.vendor_id?.image}`}
              shopImage={`${myproduct?.vendor_details?.vendor_shop_icon_url}${myproduct?.vendor_details?.shop_icon}`}
              openPopup={openPopup}
              receiverid={myproduct?.vendor_id?._id}
              productID={myproduct?._id}
              productTitle={myproduct?.product_title}
              originalPrice={originalPrice}
              productImage={`${myproduct?.image_url}${myproduct?.image[0]}`}
              SetOpenPopup={SetOpenPopup}
              handleClosePopup={handleClosePopup}
              handleClickPopup={handleClickPopup}
            />
          </div>
          {/* message popup end */}

          {/* share message popup start */}
          <div>
            <Modal
              open={openModal}
              onClose={() => setOpenModal(false)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  maxWidth: "800px",
                  width: "100%",
                  backgroundColor: "background.paper",
                  boxShadow: "0 0 2px #9a9a9a",
                  boxShadow: 24,
                  borderRadius: "8px",
                  p: 4,
                }}
              >
                <Typography
                  component="div"
                  sx={{ width: "100%", textAlign: "end" }}
                >
                  <Button
                    sx={{
                      background: "#ededed",
                    }}
                    onClick={() => setOpenModal(false)}
                  >
                    <CloseIcon />
                  </Button>
                </Typography>
                <Box
                  mt={2}
                  p={2}
                  sx={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  <Typography variant="h5" fontWeight={600}>
                    Share this with friends and family
                  </Typography>
                  <Typography
                    mt={2}
                    sx={{
                      border: "1px solid #f0f0f0",
                      boxShadow: "0 0 2px #939393",
                      borderRadius: "6px",
                    }}
                    component="a"
                    href={`${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}`}
                    target="_blank"
                  >
                    <Typography
                      component="div"
                      textAlign={"center"}
                      sx={{
                        img: {
                          width: "100%",
                          height: { md: "400px", sm: "400px", xs: "100%" },
                          objectFit: "contain",
                        },
                      }}
                    >
                      <img
                        src={`${myproduct.image_url}${myproduct?.image[0]}`}
                        alt=""
                        className="img-fluid"
                      />
                    </Typography>
                    <Typography
                      component="div"
                      sx={{ background: "#f9f9f9", padding: "8px 16px" }}
                    >
                      <Typography
                        component="div"
                        sx={{
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          color: "#000",
                          fontWeight: 500,
                        }}
                      >
                        {parse(myproduct?.product_title || "")}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#676767",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {usercredentials?.affiliate_code ? `${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}&affiliate_code=${usercredentials?.affiliate_code}` : `${process.env.NEXT_PUBLIC_WEB_URL}/products?id=${myproduct?._id}`}
                      </Typography>
                    </Typography>
                  </Typography>

                  <Box mt={3}>
                    <List
                      sx={{
                        display: "flex",
                        width: "100%",
                        flexWrap: "wrap",
                        ".MuiButtonBase-root:hover": {
                          background: "#d5d9db",
                        },
                      }}
                    >
                      <ListItem sx={{ padding: "8px", width: "50%" }}>
                        <ListItemButton
                          sx={{
                            width: "100%",
                            background: "#f3f5f6",
                            textAlign: "center",
                            gap: "10px",
                            justifyContent: "center",
                            color: "#000",
                            fontWeight: 500,
                            p: "12px",
                            borderRadius: "6px",
                          }}
                          component="a"
                          href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
                        >
                          <MailOutlineIcon />
                          Email
                        </ListItemButton>
                      </ListItem>
                      <ListItem sx={{ padding: "8px", width: "50%" }}>
                        <ListItemButton
                          sx={{
                            width: "100%",
                            background: "#f3f5f6",
                            textAlign: "center",
                            gap: "10px",
                            justifyContent: "center",
                            color: "#000",
                            fontWeight: 500,
                            p: "12px",
                            borderRadius: "6px"
                          }}
                          component="a"
                          href={`https://api.whatsapp.com/send?text=${shareTitle}${shareUrl}`}
                          target="_blank"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            alt="WhatsApp"
                            width="24px"
                            height="24px"
                          />
                          WhatsApp
                        </ListItemButton>
                      </ListItem>
                      <ListItem sx={{ padding: "8px", width: "50%" }}>
                        <ListItemButton
                          sx={{
                            width: "100%",
                            background: "#f3f5f6",
                            textAlign: "center",
                            gap: "10px",
                            justifyContent: "center",
                            color: "#000",
                            fontWeight: 500,
                            p: "12px",
                            borderRadius: "6px",
                          }}
                          component="a"
                          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`}
                          target="_blank"
                        >
                          <FacebookIcon sx={{ color: "#1877f2" }} />
                          Facebook
                        </ListItemButton>
                      </ListItem>
                      <ListItem sx={{ padding: "8px", width: "50%" }}>
                        <ListItemButton
                          sx={{
                            width: "100%",
                            background: "#f3f5f6",
                            textAlign: "center",
                            gap: "10px",
                            justifyContent: "center",
                            color: "#000",
                            fontWeight: 500,
                            p: "12px",
                            borderRadius: "6px",
                          }}
                          component="a"
                          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                          target="_blank"
                        >
                          <XIcon />
                          Twitter
                        </ListItemButton>
                      </ListItem>
                      <ListItem sx={{ padding: "8px", width: "50%" }}>
                        <ListItemButton
                          sx={{
                            width: "100%",
                            background: "#f3f5f6",
                            textAlign: "center",
                            gap: "10px",
                            justifyContent: "center",
                            color: "#000",
                            fontWeight: 500,
                            p: "12px",
                            borderRadius: "6px",
                          }}
                          component="a"
                          href={`https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${`${myproduct.image_url}${myproduct?.image[0]}`}&description=${shareTitle}`}
                          target="_blank"
                        >
                          <PinterestIcon sx={{ color: "#d11e16" }} />
                          Pinterest
                        </ListItemButton>
                      </ListItem>
                      <ListItem sx={{ padding: "8px", width: "50%" }}>
                        <ListItemButton
                          sx={{
                            width: "100%",
                            background: "#f3f5f6",
                            textAlign: "center",
                            gap: "10px",
                            justifyContent: "center",
                            color: "#000",
                            fontWeight: 500,
                            p: "12px",
                            borderRadius: "6px",
                          }}
                          onClick={copyToClipboard}
                        >
                          <FileCopyIcon />
                          Copy Link
                        </ListItemButton>
                      </ListItem>
                    </List>
                  </Box>
                </Box>
              </Box>
            </Modal>
          </div>
        </>
      ) : (
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
      )}
    </>
  );
};

export default MyproductDetails;
