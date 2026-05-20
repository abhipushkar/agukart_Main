import { resolveCartItemState } from "./resolveCartItemState";

export const validateCartItem = (product, options = {}) => {

    const resolvedState =
        resolveCartItemState(product);

    const pendingQuantity =
        options?.pendingQuantity;

    /*
    ===================================
    SAFE FLAGS
    ===================================
    */

    const priceExists =
        resolvedState?.priceExists !== false;

    const stockExists =
        resolvedState?.stockExists !== false;

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
    PRICE COMBINATION REMOVED
    ===================================
    */

    if (!priceExists) {

        return {

            valid: false,

            type: "PRICE_COMBINATION_REMOVED",

            message:
                "This pricing option is no longer available.",

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

            message:
                "This variation is currently unavailable.",

            shouldResetQuantity: true,

            disableCheckout: true,

            resolvedState,
        };
    }

    /*
    ===================================
    QTY COMBINATION REMOVED
    ===================================
    */

    if (!stockExists) {

        const invalidValues =
            resolvedState?.invalidValues || [];

        const invalidLabel =
            invalidValues.length > 0
                ? invalidValues.map(value => value.charAt(0).toUpperCase() + value.slice(1)).join(", ")
                : "Selected option";

        return {

            valid: false,

            type: "QTY_COMBINATION_REMOVED",

            message:  `${invalidValues.length>1? "Selected Combination" : "Selected Option"} ${invalidLabel} is no longer available. Please choose another option.`,

            // shouldResetQuantity: true,

            // allowQuantitySelection: true,

            disableCheckout:
                pendingQuantity === undefined ||
                pendingQuantity === null ||
                pendingQuantity === "",

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
    EFFECTIVE QUANTITY
    ===================================
    */

    const effectiveQuantity =
        pendingQuantity !== undefined &&
            pendingQuantity !== null &&
            pendingQuantity !== ""
            ? +pendingQuantity
            : +product?.qty;

    /*
    ===================================
    QUANTITY INVALID
    ===================================
    */

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

            disableCheckout:
                pendingQuantity === undefined ||
                pendingQuantity === null ||
                pendingQuantity === "",

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
        cartSnapshotPrice !==
        resolvedState.latestPrice
    ) {

        return {

            valid: false,

            type: "PRICE_CHANGED",

            message:
                "This item price has changed. Please choose quantity again.",

            shouldResetQuantity: true,

            allowQuantitySelection: true,

            disableCheckout:
                pendingQuantity === undefined ||
                pendingQuantity === null ||
                pendingQuantity === "",

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