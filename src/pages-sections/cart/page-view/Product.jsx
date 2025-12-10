import React from 'react'
import Box from "@mui/material/Box";
import { Typography, Button, Avatar } from '@mui/material';
import { H4 } from "components/Typography";
import Link from "next/link";
import NextLink from "next/link";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import parse from "html-react-parser";
import { useState, useEffect } from 'react';
import useAuth from "hooks/useAuth";
import { useCurrency } from 'contexts/CurrencyContext';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useRouter } from 'next/navigation';
import { Small } from "components/Typography";
import useCart from 'hooks/useCart';
import { postAPIAuth } from 'utils/__api__/ApiServies';
import { set, update } from 'lodash';
import { calculatePriceAfterDiscount } from 'utils/calculatePriceAfterDiscount';
import { useToasts } from 'react-toast-notifications';

const Product = ({ cart, product, wallet, defaultAddress, voucherDetails, showButtons=true }) => {
    console.log({ product }, "ERyhert4yhert")
    const { addToast } = useToasts();
    const router = useRouter();
    const { currency } = useCurrency();
    const [stock, setStock] = useState(0);
    const { token } = useAuth();
    const { dispatch, getCartDetails, getCartItems } = useCart();
    const combinationVariant = new Set();
    const [promotion, setPromotion] = useState({});
    const [bestPromotion, setBestPromotion] = useState({});
    const [nextPromotion, setNextPromotion] = useState({});
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState(0);

    product.combinationData?.forEach(e => {
        const variantName = e?.variant_name || "";
        variantName.split("and").forEach(part => {
            if (part.trim()) combinationVariant.add(part.trim());
        });
    });
    const uniqueCombinationVariant = Array.from(combinationVariant);

    const getCombinations = (arr) => {
        let combinations = arr.map(item =>
            [item]
        );
        if (arr.length > 1) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    combinations.push([arr[i], arr[j]]);
                }
            }
        }
        return combinations;
    };
    const handleQuantityChnage = (e) => {
        const newQuantity = e.target.value;
        setQuantity(newQuantity);
    };

    const updateCart = async () => {
        const bestPromotion = product?.promotionalOfferData?.reduce((best, promotion) => {
            if (promotion.qty !== null && promotion.qty !== undefined && promotion.qty <= quantity) {
                if (!best || promotion.qty > best.qty || (promotion.qty === best.qty && promotion.discount_amount > best.discount_amount)) {
                    return promotion;
                }
            }
            return best;
        }, null);
        const bestAmountPromotion = product?.promotionalOfferData?.reduce((best, promotion) => {
            if (promotion.offer_amount !== null && promotion.offer_amount !== undefined && promotion.offer_amount <= +product.real_price) {
                console.log(promotion.offer_amount <= +product.real_price, promotion.offer_amount, +product.real_price, "SDRftghrthr")
                if (!best || promotion.offer_amount > best.offer_amount) {
                    return promotion;
                }
            }
            return best;
        }, null);
        let finalPromotion = {};
        if (bestPromotion && Object.keys(bestPromotion).length > 0 && bestAmountPromotion && Object.keys(bestAmountPromotion).length > 0) {
            let offerAmount = calculatePriceAfterDiscount(bestPromotion?.offer_type, +bestPromotion?.discount_amount, originalPrice)
            let offerAmount2 = calculatePriceAfterDiscount(bestAmountPromotion?.offer_type, +bestAmountPromotion?.discount_amount, originalPrice)
            offerAmount = originalPrice - offerAmount;
            offerAmount2 = originalPrice - offerAmount2;
            if (offerAmount > offerAmount2) {
                finalPromotion = bestPromotion;
            } else {
                finalPromotion = bestAmountPromotion;
            }
        }
        else if (bestPromotion && Object.keys(bestPromotion).length > 0) {
            finalPromotion = bestPromotion;
        }
        else {
            finalPromotion = bestAmountPromotion;
        }

        let finalPrice = 0;
        if (finalPromotion && Object.keys(finalPromotion).length > 0 && finalPromotion.qty <= quantity) {
            finalPrice = calculatePriceAfterDiscount(finalPromotion?.offer_type, +finalPromotion?.discount_amount, originalPrice)
        } else {
            finalPrice = originalPrice;
        }

        if (!token) {
            dispatch({
                type: "CHANGE_CART_AMOUNT",
                payload: {
                    vendor_id: cart?.vendor_id,
                    vendor_name: cart?.vendor_name,
                    shop_icon: cart?.shop_icon,
                    shop_name: cart?.shop_name,
                    slug: cart?.slug,
                    products: [
                        { ...product, sale_price: finalPrice, qty: quantity }
                    ]
                },
            });
        } else {
            // if (voucherDetails?.discount > 0) {
            //     addToast("Please remove the voucher code first", {
            //         appearance: "error",
            //         autoDismiss: true,
            //     });
            //     return;
            // }
            try {
                const payload = {
                    product_id: product.product_id,
                    vendor_id: cart?.vendor_id,
                    qty: quantity,
                    price: finalPrice,
                    original_price: originalPrice,
                    isCombination: product?.isCombination,
                    variant_id: [],
                    variant_attribute_id: []
                };

                if (product?.isCombination) {
                    payload.variant_id = product?.variant_id;
                    payload.variant_attribute_id = product?.variant_attribute_id;
                }

                const res = await postAPIAuth("user/add-to-cart", payload);
                if (res.status === 200) {
                    getCartItems(defaultAddress?._id);
                    const data = wallet ? "1" : "0";
                    getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (product?.qty !== quantity) {
                updateCart();
            }
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [product?.qty, quantity]);

    useEffect(()=>{
        if(price && quantity && originalPrice){
            updateCart();
        }
    },[price,quantity,originalPrice])


    const removeItemHandler = async () => {
        if (!token) {
            dispatch({
                type: "CHANGE_CART_AMOUNT",
                payload: {
                    vendor_id: cart?.vendor_id,
                    vendor_name: cart?.vendor_name,
                    shop_icon: cart?.shop_icon,
                    shop_name: cart?.shop_name,
                    slug: cart?.slug,
                    products: [
                        {
                            ...product,
                            qty: 0
                        }
                    ]
                }
            })
        } else {
            // if (voucherDetails?.discount > 0) {
            //     addToast("Please remove the voucher code first", {
            //         appearance: "error",
            //         autoDismiss: true,
            //     });
            //     return;
            // }
            try {
                const res = await postAPIAuth("user/delete-cart", {
                    cart_id: product.cart_id,
                });
                if (res.status === 200) {
                    getCartItems(defaultAddress?._id);
                    const data = wallet ? "1" : "0";
                    getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
                    return true;
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    const addToWishlistHandler = async () => {
        if (!token) {
            router.push("/login");
        } else {
            try {
                // if (voucherDetails?.discount > 0) {
                //     addToast("Please remove the voucher code first", {
                //         appearance: "error",
                //         autoDismiss: true,
                //     });
                //     return;
                // }
                let price = 0;
                let original_price = 0;
                if (product?.isCombination) {
                    const mergedCombinations = product?.combinationData?.map((item) => item.combinations).flat();
                    const minimumPrice = mergedCombinations?.filter(obj => +obj.price > 0)?.reduce((min, obj) => Math.min(min, +obj.price), Infinity);
                    price = minimumPrice === Infinity ? +product.real_price : minimumPrice;
                    original_price = minimumPrice === Infinity ? +product.real_price : minimumPrice;
                    if (promotion && Object.keys(promotion).length > 0) {
                        price = calculatePriceAfterDiscount(promotion?.offer_type, +promotion?.discount_amount, minimumPrice === Infinity ? +product.real_price : minimumPrice)
                    }
                } else {
                    price = +product?.real_price;
                    original_price = +product?.real_price;
                    if (promotion && Object.keys(promotion).length > 0 && promotion.qty <= 1) {
                        price = calculatePriceAfterDiscount(promotion?.offer_type, +promotion?.discount_amount, +product?.real_price);
                    }
                }
                const payload = {
                    product_id: product?.product_id,
                    price: price,
                    original_price: original_price,
                    isCombination: product?.isCombination,
                    variant_id: [],
                    variant_attribute_id: []
                }
                const res = await postAPIAuth("user/add-delete-wishlist", payload);
                console.log(res, "let chek the wishlist thing");
                if (res.status === 200) {
                    const cartRes = await removeItemHandler();
                    if (cartRes) {
                        addToast("Product added to wishlist", {
                            appearance: "success",
                            autoDismiss: true,
                        });
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    useEffect(() => {
        if (product.isCombination) {
            const variantAttributeIds = product?.variant_attribute_id;
            const variantCombinations = getCombinations(variantAttributeIds);
            const mergedCombinations = product?.combinationData?.map((item) => item.combinations).flat();

            const data = mergedCombinations?.filter((item) =>
                variantCombinations?.some((combination) =>
                    Array.isArray(item?.combIds) && Array.isArray(combination) &&
                    JSON.stringify(item?.combIds.sort()) === JSON.stringify(combination.sort())
                )
            );
            if (data.length <= 1) {
                if (data[0]?.isVisible && +data[0]?.qty > 0) {
                    setStock(+data[0]?.qty);
                } else {
                    setStock(+product.stock);
                }
            } else {
                data.forEach((item) => {
                    if (item.isVisible) {
                        if (+item.qty > 0) {
                            setStock(+item.qty);
                        }
                    }
                });
                if (!data.some((item) => +item.qty > 0 && item.isVisible)) {
                    setStock(+product.stock);
                }
            }
        } else {
            setStock(+product.stock);
        }
    }, [cart, product])

    useEffect(() => {
        setQuantity(+product?.qty);
        setPrice(+product?.sale_price);
        setOriginalPrice(+product?.original_price);
    }, [product])

    useEffect(() => {
        const bestPromotion = product?.promotionalOfferData?.reduce((best, promotion) => {
            if (promotion.qty !== null && promotion.qty !== undefined && promotion.qty <= product?.qty) {
                if (!best || promotion.qty > best.qty || (promotion.qty === best.qty && promotion.discount_amount > best.discount_amount)) {
                    return promotion;
                }
            }
            return best;
        }, null);
        const bestAmountPromotion = product?.promotionalOfferData?.reduce((best, promotion) => {
            console.log(promotion.offer_amount <= originalPrice, originalPrice, "hhhwdfsdfsdf")
            if (promotion.offer_amount !== null && promotion.offer_amount !== undefined && promotion.offer_amount <= originalPrice) {
                if (!best || promotion.offer_amount > best.offer_amount) {
                    return promotion;
                }
            }
            return best;
        }, null);
        let finalBestPromotion = {};
        if (bestPromotion && Object.keys(bestPromotion).length > 0 && bestAmountPromotion && Object.keys(bestAmountPromotion).length > 0) {
            let offerAmount = calculatePriceAfterDiscount(bestPromotion?.offer_type, +bestPromotion?.discount_amount, originalPrice)
            let offerAmount2 = calculatePriceAfterDiscount(bestAmountPromotion?.offer_type, +bestAmountPromotion?.discount_amount, originalPrice)
            offerAmount = originalPrice - offerAmount;
            offerAmount2 = originalPrice - offerAmount2;
            if (offerAmount > offerAmount2) {
                finalBestPromotion = bestPromotion;
            } else {
                finalBestPromotion = bestAmountPromotion;
            }
        } else if (bestPromotion && Object.keys(bestPromotion).length > 0) {
            finalBestPromotion = bestPromotion;
        } else {
            finalBestPromotion = bestAmountPromotion;
        }

        const nextPromotion = product?.promotionalOfferData?.reduce((next, promotion) => {
            if (promotion.qty !== null && promotion.qty !== undefined && promotion.qty > product?.qty) {
                if (!next || promotion.qty < next.qty || (promotion.qty === next.qty && promotion.discount_amount > next.discount_amount)) {
                    return promotion;
                }
            }
            return next;
        }, null);

        const promotion = product?.promotionalOfferData?.find((promotion) => promotion.qty == 1);
        const amountPromotion = product?.promotionalOfferData?.find(
            (promotion) => promotion?.offer_amount != null && promotion.offer_amount <= originalPrice
        );
        let finalPromotion = {};
        if (promotion && Object.keys(promotion).length > 0 && amountPromotion && Object.keys(amountPromotion).length > 0) {
            let offerAmount = calculatePriceAfterDiscount(promotion?.offer_type, +promotion?.discount_amount, originalPrice)
            let offerAmount2 = calculatePriceAfterDiscount(amountPromotion?.offer_type, +amountPromotion?.discount_amount, originalPrice)
            offerAmount = originalPrice - offerAmount;
            offerAmount2 = originalPrice - offerAmount2;
            if (offerAmount > offerAmount2) {
                finalPromotion = bestPromotion;
            } else {
                finalPromotion = bestAmountPromotion;
            }
        } else if (promotion && Object.keys(promotion).length > 0) {
            finalPromotion = promotion;
        } else {
            finalPromotion = amountPromotion;
        }
        setBestPromotion(finalBestPromotion);
        setNextPromotion(nextPromotion);
        setPromotion(finalPromotion);
    }, [product, originalPrice]);
    return (
        <>
            <Box
                borderBottom={"1px solid #0e0e0e2e"}
                pb={2}
                pt={1}
                mb={2}
            >
                <Box
                    sx={{
                        display: {
                            lg: "flex",
                            md: "flex",
                            sx: "block",
                        },
                    }}
                >
                    <Typography component="div" sx={{ flex: "1", position: "relative" }}>
                        <Avatar
                            alt="image"
                            src={product?.firstImage}
                            sx={{ width: 150, height: 150, borderRadius: 2 }}
                            variant="square"
                        />
                        {product?.product_bedge && (
                            <Box
                                sx={{
                                    zIndex: "9",
                                    position: "absolute",
                                    top: "12px",
                                    left: "12px",
                                    background:
                                        product?.product_bedge === "Popular Now"
                                            ? "#fed9c9"
                                            : product?.product_bedge === "Best Seller"
                                                ? "#e9d8a6"
                                                : "#c1f1c1",
                                    boxShadow: "0 0 3px #696969",
                                    borderRadius: "30px",
                                    padding: "5px 10px",
                                    color: "#000",
                                    textDecoration: "underline dashed",
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "13px",
                                    textUnderlineOffset: "2px",
                                }}
                            >
                                {
                                    product?.product_bedge == "Popular Now" && <svg
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
                                    product?.product_bedge == "Best Seller" && <svg
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
                                {product?.product_bedge}
                            </Box>
                        )}
                    </Typography>

                    <Typography
                        component="div"
                        sx={{
                            paddingLeft: {
                                lg: "18px",
                                md: "18px",
                                xs: "0",
                            },
                            flex: {
                                lg: "3",
                                md: "3",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: {
                                    lg: "flex",
                                    md: "flex",
                                    xs: "block",
                                },
                            }}
                        >
                            <Typography
                                component="div"
                                sx={{
                                    flexGrow: "1",
                                    maxWidth: {
                                        lg: "58.3333%",
                                        md: "58.3333%",
                                        xs: "100%",
                                    },
                                }}
                            >
                                <H4
                                    color={"#d23f57"}
                                    fontSize={16}
                                    sx={{ textTransform: "uppercase" }}
                                >
                                    In {product?.cartAddedUserCount} carts with {product?.viewCount} views
                                </H4>
                                <Typography
                                    sx={{
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        whiteSpace: "normal",
                                        WebkitLineClamp: 1,
                                        "&:hover": {
                                            textDecoration: "underline !important",
                                        },
                                    }}
                                    fontSize={16}
                                    lineHeight={1.7}
                                >
                                    <Link
                                        href={`/products?id=${product?.product_id}`}
                                        component={NextLink}
                                    >
                                        {parse(product?.product_name)}
                                    </Link>
                                </Typography>
                                {
                                    (stock > 0 && !product?.isDeleted && product?.status) ? (
                                        <Typography component="div">
                                            {
                                                product?.isCombination && (
                                                    <>
                                                        {
                                                            product?.variantData?.length > 0 ? (
                                                                product?.variantData?.map((variant, index) => (
                                                                    <Typography fontSize={17} color="gray" key={`variant-${index}`}>
                                                                        {variant?.variant_name}:{" "}
                                                                        <Typography fontSize={17} component="span">
                                                                            {product?.variantAttributeData?.[index]?.attribute_value || "N/A"}
                                                                        </Typography>
                                                                    </Typography>
                                                                ))
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        backgroundColor: "#ffe5e5",
                                                                        border: "1px solid #ffcccc",
                                                                        color: "#d32f2f",
                                                                        padding: "16px",
                                                                        borderRadius: "8px",
                                                                        textAlign: "center",
                                                                        display: "flex",
                                                                        gap: "8px",
                                                                        maxWidth: "600px",
                                                                        margin: "16px auto",
                                                                        cursor: "pointer"
                                                                    }}
                                                                    onClick={() => router.push(`/products?id=${product?.product_id}`)}
                                                                >
                                                                    <ErrorOutlineIcon sx={{ fontSize: 24 }} />
                                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                                        Choose a {uniqueCombinationVariant.map((variant) => variant).join(", ")}
                                                                    </Typography>
                                                                </Box>
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                            {
                                                product?.customize == "Yes" && (
                                                    <>
                                                        {
                                                            product?.customizationData?.map((item, index) => (
                                                                <div key={index}>
                                                                    {Object.entries(item).map(([key, value]) => (
                                                                        <div key={key}>
                                                                            {typeof value === 'object' ? (
                                                                                <div>
                                                                                    {key}:{`${value?.value} (${currency?.symbol}${(value?.price * currency?.rate).toFixed(2)})`}
                                                                                </div>
                                                                            ) : (
                                                                                <div>{key}: {value}</div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))
                                                        }
                                                    </>
                                                )
                                            }
                                            {
                                                nextPromotion && Object.keys(nextPromotion).length > 0 && +nextPromotion?.qty > product.qty && <>
                                                    <p>Save {nextPromotion?.offer_type == "flat" ? `$ ${nextPromotion?.discount_amount}` : `${nextPromotion?.discount_amount} %`} when you buy {nextPromotion?.qty != 0 ? nextPromotion?.qty : ''} items at this shop</p>
                                                    <p>Shop the sale</p>
                                                </>
                                            }
                                            <Typography
                                                component="div"
                                                pt={1}
                                                display={"flex"}
                                                alignItems={"center"}
                                            >
                                                <FormControl sx={{ width: "100px" }}>
                                                    <Select
                                                        onChange={handleQuantityChnage}
                                                        value={product?.qty}
                                                        sx={{
                                                            border: "none",
                                                            background: "#fff",
                                                            height: "50px",
                                                        }}
                                                    >
                                                        {
                                                            Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((q) => (
                                                                <MenuItem key={q} value={q}>
                                                                    {q}
                                                                </MenuItem>
                                                            ))
                                                        }
                                                    </Select>
                                                </FormControl>
                                            </Typography>
                                        </Typography>
                                    ) : (
                                        <Typography
                                            component="div"
                                            sx={{
                                                color: "#bc1111",
                                            }}
                                            pt={2}
                                        >
                                            {(!product?.status || product?.isDeleted) ? "Currently Unavailable" : "Sold Out"}
                                        </Typography>
                                    )
                                }
                                {showButtons && <Typography component="div" mt={2}>
                                    <Button
                                        onClick={addToWishlistHandler}
                                        variant="contained"
                                        sx={{
                                            background: "transparent",
                                            fontSize: "14px",
                                            boxShadow: "none",
                                            borderRadius: "25px",
                                            marginRight: "10px",
                                        }}
                                    >
                                        Save for later
                                    </Button>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            background: "transparent",
                                            fontSize: "14px",
                                            boxShadow: "none",
                                            borderRadius: "25px",
                                        }}
                                        onClick={removeItemHandler}
                                    >
                                        Remove
                                    </Button>

                                </Typography>}
                            </Typography>

                            <Typography
                                component="div"
                                sx={{
                                    flexGrow: "1",
                                    maxWidth: {
                                        lg: "41.6667%",
                                        md: "41.6667%",
                                        xs: "100%",
                                    },
                                    paddingLeft: {
                                        lg: "18px",
                                        md: "18px",
                                        xs: "0,",
                                    },
                                }}
                            >
                                <Typography
                                    component="div"
                                    // flexWrap={"wrap"}
                                    display={"flex"}
                                >
                                    <Typography
                                        component="div"
                                        flexGrow={1}
                                        flexBasis={"100%"}
                                        maxWidth={"100%"}
                                        textAlign={"right"}
                                        sx={{
                                            flexDirection: "column",
                                            display: "flex",
                                            alignItems: {
                                                xs: "start",
                                                md: "end",
                                            },
                                            justifyContent: {
                                                xs: "flex-start",
                                                md: "flex-end",
                                            },
                                        }}
                                    >
                                        {
                                            price != originalPrice && bestPromotion && Object.keys(bestPromotion).length > 0 && bestPromotion?.qty <= product.qty && <Box
                                                sx={{
                                                    display: "inline-block",
                                                    backgroundColor: "#00C853",
                                                    color: "#fff",
                                                    borderRadius: "4px",
                                                    padding: "4px 8px",
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    display: "flex",
                                                    width: "fit-content",
                                                }}
                                            >
                                                {bestPromotion?.offer_type == "flat" ? `Flat ${bestPromotion?.discount_amount} OFF` : `${bestPromotion?.discount_amount}% OFF`}
                                            </Box>
                                        }
                                        <Typography
                                            fontSize={19}
                                            fontWeight={600}
                                            textAlign={"right"}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: {
                                                    lg: "end",
                                                    md: "end",
                                                    xs: "start",
                                                },
                                            }}
                                        >
                                            {currency?.symbol}{(price * product.qty * currency?.rate).toFixed(2)}
                                        </Typography>
                                        <Typography
                                            fontSize={19}
                                            fontWeight={600}
                                            textAlign={"right"}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: {
                                                    lg: "end",
                                                    md: "end",
                                                    xs: "start",
                                                },
                                            }}
                                        >
                                            <Small
                                                pl={1}
                                                sx={{
                                                    fontSize: "18px",
                                                    fontWeight: "600",
                                                    color: "gray",
                                                }}
                                                component="del"
                                            >
                                                {originalPrice != price && currency?.symbol}
                                                {originalPrice != price && (originalPrice * currency.rate * product.qty).toFixed(2)}
                                            </Small>
                                        </Typography>
                                        {
                                            quantity > 1 && <Typography
                                                fontSize={12}
                                                color={"gray"}
                                                textAlign={"right"}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: {
                                                        lg: "end",
                                                        md: "end",
                                                        xs: "start",
                                                    },
                                                }}
                                            >
                                                ({currency?.symbol}{(price * currency?.rate).toFixed(2)} each)
                                            </Typography>
                                        }
                                    </Typography>
                                </Typography>
                            </Typography>
                        </Box>
                    </Typography>
                </Box>
            </Box>
        </>
    )
}

export default Product
