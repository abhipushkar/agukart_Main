"use client";

import { createContext, useEffect, useMemo, useReducer } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { CART_ITEM } from "constant";
import { useToasts } from "react-toast-notifications";
import { useLocation } from "./location_context";

// =================================================================================
const INITIAL_STATE = {
    cart: [],
    shopDiscount: 0,
    subTotal: 0,
    delivery: 0,
    superTotal: 0,
    total: 0,
    walletAmount: 0,
    voucherDiscount: 0,
    loading: false,
    error: null,
};
// ==============================================================

// Helper function to compare arrays
const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i] !== sortedB[i]) return false;
    }
    return true;
};

// Helper function to compare variant objects
const variantsEqual = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort((x, y) => x.variantName?.localeCompare(y.variantName));
    const sortedB = [...b].sort((x, y) => x.variantName?.localeCompare(y.variantName));

    for (let i = 0; i < sortedA.length; i++) {
        if (sortedA[i].variantName !== sortedB[i].variantName ||
            sortedA[i].attributeName !== sortedB[i].attributeName) {
            return false;
        }
    }
    return true;
};

// Helper function to compare variant data/attribute data
const variantDataEqual = (variantDataA, variantAttributeDataA, variantDataB, variantAttributeDataB) => {
    if (!variantDataA && !variantDataB && !variantAttributeDataA && !variantAttributeDataB) return true;

    const variantIdsA = variantDataA?.map(v => v._id) || [];
    const variantIdsB = variantDataB?.map(v => v._id) || [];
    const attributeIdsA = variantAttributeDataA?.map(v => v._id) || [];
    const attributeIdsB = variantAttributeDataB?.map(v => v._id) || [];

    return arraysEqual(variantIdsA, variantIdsB) && arraysEqual(attributeIdsA, attributeIdsB);
};

// Main reducer function
const reducer = (state, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        case "INIT_CART":
            return { ...state, cart: action.payload, loading: false };
        case "CHANGE_CART_AMOUNT":
            let cartList = state.cart;
            let cartItem = action.payload;
            const productItem = cartItem?.products[0];

            if (!productItem) return state;

            // Check if product has combination (variant-based)
            if (productItem?.isCombination) {
                // Remove item if quantity is 0
                if (productItem?.qty < 1) {
                    const updatedCartList = cartList
                        ?.map((vendor) => {
                            const filteredProducts = vendor.products.filter((product) => {
                                // First check if same product
                                if (product?.product_id !== productItem?.product_id) {
                                    return true;
                                }

                                // For combination products, check all variant types
                                // Check parent variants (variantData/variantAttributeData)
                                const parentVariantsMatch = variantDataEqual(
                                    product.variantData,
                                    product.variantAttributeData,
                                    productItem.variantData,
                                    productItem.variantAttributeData
                                );

                                // Check internal variants (variants array)
                                const internalVariantsMatch = variantsEqual(product.variants, productItem.variants);

                                // If both parent and internal variants match, remove this product
                                return !(parentVariantsMatch && internalVariantsMatch);
                            });
                            return { ...vendor, products: filteredProducts };
                        })
                        .filter((vendor) => vendor?.products?.length > 0);

                    return { ...state, cart: updatedCartList };
                }

                // Update existing item or add new one
                let exist = false;
                const updatedCartList = cartList?.map((vendor) => {
                    if (vendor.vendor_id !== cartItem.vendor_id) return vendor;

                    const updatedProducts = vendor?.products?.map((product) => {
                        // Check if same product
                        if (product?.product_id !== productItem?.product_id) {
                            return product;
                        }

                        // Check parent variants match
                        const parentVariantsMatch = variantDataEqual(
                            product.variantData,
                            product.variantAttributeData,
                            productItem.variantData,
                            productItem.variantAttributeData
                        );

                        // Check internal variants match
                        const internalVariantsMatch = variantsEqual(product.variants, productItem.variants);

                        // If both match, update this product
                        if (parentVariantsMatch && internalVariantsMatch) {
                            exist = true;
                            return {
                                ...product,
                                sale_price: productItem?.sale_price,
                                qty: productItem?.qty,
                                // Update variant data if provided
                                ...(productItem.variants && { variants: productItem.variants }),
                                ...(productItem.variantData && { variantData: productItem.variantData }),
                                ...(productItem.variantAttributeData && { variantAttributeData: productItem.variantAttributeData })
                            };
                        }
                        return product;
                    });

                    return { ...vendor, products: updatedProducts };
                });

                if (!exist) {
                    const vendorIndex = cartList.findIndex((vendor) => vendor.vendor_id === cartItem.vendor_id);

                    // Prepare the product object with all variant data
                    const newProduct = {
                        ...productItem,
                        variants: productItem.variants || [],
                        variantData: productItem.variantData || [],
                        variantAttributeData: productItem.variantAttributeData || []
                    };

                    if (vendorIndex >= 0) {
                        // Add to existing vendor
                        if (!updatedCartList[vendorIndex]?.products) {
                            updatedCartList[vendorIndex].products = [];
                        }
                        updatedCartList[vendorIndex].products.push(newProduct);
                    } else {
                        // Create new vendor entry
                        updatedCartList.push({
                            vendor_id: cartItem.vendor_id,
                            vendor_name: cartItem.vendor_name,
                            shop_icon: cartItem.shop_icon,
                            shop_name: cartItem.shop_name,
                            slug: cartItem.slug,
                            products: [newProduct],
                        });
                    }
                }

                return { ...state, cart: updatedCartList };

            } else {
                // For non-combination products (simple products)
                if (productItem?.qty < 1) {
                    const updatedCartList = cartList
                        ?.map((vendor) => {
                            const filteredProducts = vendor.products.filter(
                                (product) => product?.product_id !== productItem?.product_id
                            );
                            return { ...vendor, products: filteredProducts };
                        })
                        .filter((vendor) => vendor?.products?.length > 0);

                    return { ...state, cart: updatedCartList };
                }

                let exist = false;
                const updatedCartList = cartList?.map((vendor) => {
                    const updatedProducts = vendor?.products?.map((product) => {
                        if (product?.product_id === productItem?.product_id) {
                            exist = true;
                            return {
                                ...product,
                                sale_price: productItem?.sale_price,
                                qty: productItem?.qty
                            };
                        }
                        return product;
                    });

                    return { ...vendor, products: updatedProducts };
                });

                if (!exist) {
                    const vendorIndex = cartList.findIndex((vendor) => vendor.vendor_id === cartItem.vendor_id);
                    if (vendorIndex >= 0) {
                        updatedCartList[vendorIndex]?.products?.push({
                            ...productItem,
                        });
                    } else {
                        updatedCartList.push({
                            vendor_id: cartItem.vendor_id,
                            vendor_name: cartItem.vendor_name,
                            shop_icon: cartItem.shop_icon,
                            shop_name: cartItem.shop_name,
                            slug: cartItem.slug,
                            products: [
                                {
                                    ...productItem,
                                },
                            ],
                        });
                    }
                }
                return { ...state, cart: updatedCartList };
            }

        case "CALCULATION":
            return {
                ...state,
                total: action?.payload?.subTotal,
                shopDiscount: action?.payload?.couponDiscount,
                walletAmount: action?.payload?.walletAmount,
                voucherDiscount: action?.payload?.voucherDiscount,
                subTotal: action?.payload?.subTotal - action?.payload?.couponDiscount - action?.payload?.voucherDiscount,
                delivery: action?.payload?.delivery,
                superTotal:
                    action?.payload?.subTotal -
                    action?.payload?.couponDiscount -
                    action?.payload?.walletAmount +
                    action?.payload?.delivery -
                    action?.payload?.voucherDiscount,
            };

        default: {
            return state;
        }
    }
};

export const CartContext = createContext({});

export default function CartProvider({ children }) {
    const { addToast } = useToasts();
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    const { token } = useAuth();
    const { location } = useLocation();

    const getCartItems = async (address_id) => {
        const cartData = JSON.parse(localStorage.getItem(CART_ITEM));
        if (token && cartData?.length) {
            const res = await getAPIAuth(`user/cart-list?address_id=${address_id || ""}&country=${location.countryName}`, token);
            if (res.status === 200) {
                dispatch({ type: "INIT_CART", payload: [...res?.data?.result, ...cartData] });
            }
            localStorage.removeItem(CART_ITEM);
            return;
        }

        try {
            const res = await getAPIAuth(`user/cart-list?address_id=${address_id || ""}&country=${location.countryName}`, token);
            if (res.status === 200) {
                dispatch({ type: "INIT_CART", payload: res?.data?.result });
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (token) {
            getCartItems();
        }
    }, [token, location]);

    useEffect(() => {
        if (!token) {
            let cart = JSON.parse(localStorage.getItem(CART_ITEM));
            if (cart?.length > 0) {
                cart = cart
            } else {
                cart = [];
            }
            dispatch({ type: "INIT_CART", payload: cart });
        }
    }, []);

    const getCartDetails = async (wallet, address_id, discount) => {
        try {
            const res = await getAPIAuth(`user/getCartDetails?wallet=${wallet}&address_id=${address_id || ""}&voucher_discount=${discount}`, token);

            if (res?.data?.status) {
                dispatch({ type: "CALCULATION", payload: res.data.data });
            } else {
                dispatch({ type: "CALCULATION", payload: res.data.data });
                addToast(res?.data?.message, {
                    appearance: "error",
                    autoDismiss: true,
                })
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (!token) {
            localStorage.setItem(CART_ITEM, JSON.stringify(state.cart));
            const totalPrice = state?.cart?.reduce((vendorTotal, vendor) => {
                const productTotal = vendor?.products?.reduce((productTotal, product) => {
                    return productTotal + (product?.sale_price || 0) * (product?.qty || 1);
                }, 0);
                return vendorTotal + productTotal;
            }, 0);

            // Calculate shop discount for guest users
            const shopDiscount = state?.cart?.reduce((vendorTotal, vendor) => {
                return vendorTotal + (vendor?.discountAmount || 0);
            }, 0);

            const payload = {
                delivery: 0,
                discount: 0,
                walletAmount: 0,
                netAmount: 0,
                couponDiscount: shopDiscount,
                voucherDiscount: 0,
                subTotal: totalPrice
            }
            dispatch({ type: "CALCULATION", payload: payload });
        }
    }, [state.cart]);

    const contextValue = useMemo(
        () => ({
            state,
            dispatch,
            getCartItems,
            getCartDetails
        }),
        [state, dispatch]
    );

    return (
        <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
    );
}
