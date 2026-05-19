import { resolveCartItemState } from "./resolveCartItemState";

export const validateCartItem = (product, options = {}) => {

    const resolvedState =
        resolveCartItemState(product);

    const pendingQuantity =
        options?.pendingQuantity;

    /*
    ===================================
    PRODUCT REMOVED
    ===================================
    */

    if (product?.isDeleted === true) {

        return {

            valid: false,

            type: "PRODUCT_DELETED",

            message:
                "This item is no longer available.",

            shouldResetQuantity: true,

            disableCheckout: true,

            resolvedState,
        };
    }

    /*
    ===================================
    PRODUCT INACTIVE
    ===================================
    */

    if (product?.status === false) {

        return {

            valid: false,

            type: "PRODUCT_INACTIVE",

            message:
                "This item is currently unavailable.",

            shouldResetQuantity: true,

            disableCheckout: true,

            resolvedState,
        };
    }

    /*
    ===================================
    VARIANT REMOVED
    ===================================
    */

    if (!resolvedState.exists) {

        const variantNames = [];

        if (product?.variantData?.length > 0) {

            product.variantData.forEach((variant) => {

                if (variant?.variant_name) {

                    variantNames.push(
                        variant.variant_name
                    );
                }
            });
        }

        if (product?.variants?.length > 0) {

            product.variants.forEach((variant) => {

                if (variant?.variantName) {

                    variantNames.push(
                        variant.variantName
                    );
                }
            });
        }

        return {

            valid: false,

            type: "VARIANT_REMOVED",

            message:
                variantNames.length > 0
                    ? `Your selected ${variantNames.join(", ")} is no longer available. Please choose another option.`
                    : "This variation is no longer available.",

            shouldResetQuantity: true,
            allowQuantitySelection: false,

            disableCheckout: true,

            resolvedState,
        };
    }

    /*
    ===================================
    VARIANT HIDDEN
    ===================================
    */

    if (!resolvedState.isVisible) {

        return {

            valid: false,

            type: "VARIANT_HIDDEN",

            message: "This variation is currently unavailable.",

            shouldResetQuantity: true,

            disableCheckout: true,

            resolvedState,
        };
    }

    /*
    ===================================
    PRICE CHANGED
    ===================================
    */

    const cartSnapshotPrice =
        +product?.original_price || 0;

    if (
        cartSnapshotPrice !== resolvedState.latestPrice
    ) {

        return {

            valid: false,

            type: "PRICE_CHANGED",

            message: "This item price has changed. Please choose quantity again.",

            shouldResetQuantity: true,
            allowQuantitySelection: true,
            disableCheckout: pendingQuantity === undefined || pendingQuantity === null || pendingQuantity === "",

            resolvedState,
        };
    }

    /*
    ===================================
    OUT OF STOCK
    ===================================
    */

    if (
        resolvedState.latestStock <= 0
    ) {

        return {

            valid: false,

            type: "OUT_OF_STOCK",

            message:
                "This item is out of stock.",

            shouldResetQuantity: true,

            disableCheckout: true,

            resolvedState,
        };
    }

    /*
    ===================================
    QUANTITY INVALID
    ===================================
    */

    const effectiveQuantity =
        pendingQuantity !== undefined &&
            pendingQuantity !== null &&
            pendingQuantity !== ""
            ? +pendingQuantity
            : +product?.qty;

    if (
        effectiveQuantity >
        resolvedState.latestStock
    ) {

        return {

            valid: false,

            type: "QTY_CHANGED",

            message:
                "The selected quantity is no longer available. Please choose quantity again.",

            shouldResetQuantity: true,
            allowQuantitySelection: true,

            disableCheckout: pendingQuantity === undefined || pendingQuantity === null || pendingQuantity === "",

            resolvedState,
        };
    }

    /*
    ===================================
    VALID
    ===================================
    */

    return {

        valid: true,

        type: "VALID",

        message: "",

        shouldResetQuantity: false,
        allowQuantitySelection: true,

        disableCheckout: false,

        resolvedState,
    };
};