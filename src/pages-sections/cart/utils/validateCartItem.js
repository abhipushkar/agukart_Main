// utils/validateCartItem.js
import { resolveCartItemState } from "./resolveCartItemState";
import { resolveCartStock } from "./resolveCartStock";
import { buildCombinationIdentity } from "./buildCombinationIdentity";

/**
 * Validates a cart item against current product data.
 * Returns a detailed result including validity, message, and suggested action.
 * @param {Object} product - Current product data
 * @param {Object} options - { pendingQuantity, cartItem }
 * @returns {Object} Validation result
 */
export const validateCartItem = (product, options = {}) => {
    const { pendingQuantity, cartItem, quantityMap } = options;

    const state = resolveCartItemState(product, cartItem || product);
    const pendingQty = pendingQuantity !== undefined && pendingQuantity !== null && pendingQuantity !== ""
        ? +pendingQuantity
        : undefined;

    // --- 1. Product deleted / inactive ---
    if (product?.isDeleted === true) {
        return {
            valid: false,
            type: "PRODUCT_DELETED",
            caseType: "PRODUCT_DELETED",
            message: "This item is no longer available. Please remove it from your cart.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }
    if (product?.status === false) {
        return {
            valid: false,
            type: "PRODUCT_INACTIVE",
            caseType: "PRODUCT_INACTIVE",
            message: "This item is currently unavailable. Please remove it.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- 2. Missing variant selection (product now requires variants) ---
    if (state.caseType === "VARIANT_SELECTION_REQUIRED") {
        return {
            valid: false,
            type: "VARIANT_SELECTION_REQUIRED",
            caseType: "VARIANT_SELECTION_REQUIRED",
            message: "This product now requires variant selection. Please edit your item.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: true,
            resolvedState: state,
        };
    }

    // --- 3. Parent variant removed ---
    if (state.caseType === "PARENT_VARIANT_REMOVED") {
        return {
            valid: false,
            type: "PARENT_VARIANT_REMOVED",
            caseType: "PARENT_VARIANT_REMOVED",
            message: "The selected option is no longer available. Please edit your selection.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: true,
            resolvedState: state,
        };
    }

    // --- 4. Combination removed (internal variants) ---
    if (state.caseType === "COMBINATION_REMOVED") {
        return {
            valid: false,
            type: "COMBINATION_REMOVED",
            caseType: "COMBINATION_REMOVED",
            message: "The selected variation is no longer available. Please edit your selection.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: true,
            resolvedState: state,
        };
    }

    // --- 5. Product unavailable (general) ---
    if (state.caseType === "PRODUCT_UNAVAILABLE") {
        return {
            valid: false,
            type: "PRODUCT_UNAVAILABLE",
            caseType: "PRODUCT_UNAVAILABLE",
            message: "This item is no longer available. Please remove it from your cart.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- 6. Customization removed or invalid ---
    if (state.hasCustomization && (!state.customizationValid || state.customizationRemoved)) {
        if (state.customizationRemoved) {
            return {
                valid: false,
                type: "CUSTOMIZATION_REMOVED",
                caseType: "CUSTOMIZATION_REMOVED",
                message: "Some customization options you selected are no longer available. Please edit your item.",
                shouldResetQuantity: true,
                allowQuantitySelection: false,
                disableCheckout: true,
                openEditDrawer: true,
                resolvedState: state,
            };
        }
        if (!state.customizationValid) {
            return {
                valid: false,
                type: "CUSTOMIZATION_INCOMPLETE",
                caseType: "CUSTOMIZATION_INCOMPLETE",
                message: "Required customizations are missing. Please complete them.",
                shouldResetQuantity: true,
                allowQuantitySelection: false,
                disableCheckout: true,
                openEditDrawer: true,
                resolvedState: state,
            };
        }
    }

    // --- 7. Price changed (combination or main) ---
    if (state.priceChangeType !== "none") {
        const isCombinationPriceChange = state.caseType === "COMBINATION_PRICE_CHANGED";
        const isCustomizationPriceChange = state.caseType === "CUSTOMIZATION_PRICE_CHANGED";

        let message = "This item's price has changed. Please review.";
        if (isCombinationPriceChange) {
            message = "The price of this variation has changed. Please review.";
        } else if (isCustomizationPriceChange) {
            message = "The price of your customizations has changed. Please review.";
        }

        return {
            valid: false,
            type: "PRICE_CHANGED",
            caseType: state.caseType,
            message,
            shouldResetQuantity: true,
            allowQuantitySelection: true,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- 8. Customization price changed (separate message - kept for backward compatibility) ---
    if (state.customizationPriceChanged && state.caseType !== "PRICE_CHANGED") {
        return {
            valid: false,
            type: "CUSTOMIZATION_PRICE_CHANGED",
            caseType: "CUSTOMIZATION_PRICE_CHANGED",
            message: "The price of your customizations has changed. Please review.",
            shouldResetQuantity: true,
            allowQuantitySelection: true,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- 9. Stock validation (combination or main) ---
    const stockState = resolveCartStock(product);
    const currentStock = stockState.latestStock;

    if (currentStock <= 0) {
        return {
            valid: false,
            type: "OUT_OF_STOCK",
            caseType: state.caseType === "MAIN_STOCK_CHANGED" ? "MAIN_STOCK_CHANGED" : "OUT_OF_STOCK",
            message: "This item is out of stock.",
            shouldResetQuantity: true,
            allowQuantitySelection: false,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- 10. Quantity exceeds stock ---
    const effectiveQuantity = pendingQty !== undefined ? pendingQty : (+product?.qty || 0);
    if (effectiveQuantity > currentStock) {
        return {
            valid: false,
            type: "QUANTITY_EXCEEDS_STOCK",
            caseType: "QUANTITY_EXCEEDS_STOCK",
            message: `Only ${currentStock} item(s) available. Please adjust quantity.`,
            shouldResetQuantity: true,
            allowQuantitySelection: true,
            disableCheckout: false,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- 11. Aggregated quantity across identical variants exceeds stock ---
    console.log("qtymap", quantityMap, currentStock);
    let totalQuantity = 0;
    if (quantityMap) {
        const variantIdentity = buildCombinationIdentity(product);
        totalQuantity = quantityMap[variantIdentity] || 0;
    }

    if (quantityMap && totalQuantity > currentStock) {
        return {
            valid: false,
            type: "AGGREGATED_QUANTITY_EXCEEDS_STOCK",
            caseType: "AGGREGATED_QUANTITY_EXCEEDS_STOCK",
            message: `Total quantity (${totalQuantity}) for this variant exceeds available stock (${currentStock}). Please reduce quantity.`,
            shouldResetQuantity: true,
            allowQuantitySelection: true,
            disableCheckout: true,
            openEditDrawer: false,
            resolvedState: state,
        };
    }

    // --- All valid ---
    return {
        valid: true,
        type: "VALID",
        caseType: "VALID",
        message: "",
        shouldResetQuantity: false,
        allowQuantitySelection: true,
        disableCheckout: false,
        openEditDrawer: false,
        resolvedState: state,
    };
};


// Helper to get simple error message
export const getCartCheckoutErrorMessage = (validation) => {
    if (validation.valid) return null;

    switch (validation.type) {
        case "VARIANT_SELECTION_REQUIRED":
            return "Your Cart items need variant selection";
        case "PARENT_VARIANT_REMOVED":
        // case "COMBINATION_REMOVED":

        case "CUSTOMIZATION_REMOVED":
            return "Your cart selection is either removed or no longer available";
        case "CUSTOMIZATION_INCOMPLETE":
            return "Some items in your cart need your attention. Please edit them.";
        // case "PRICE_CHANGED":

        case "CUSTOMIZATION_PRICE_CHANGED":
            return "Prices have changed for some items. Please review your cart.";
        case "OUT_OF_STOCK":
            return "Some items are out of stock. Please remove them to proceed.";
        // case "PRODUCT_DELETED":

        // case "PRODUCT_INACTIVE":

        case "PRODUCT_UNAVAILABLE":
            return "Some items are no longer available. Please remove them.";
        case "QUANTITY_EXCEEDS_STOCK":
            return "Quantity exceeds available stock for some items. Please adjust.";
        case "AGGREGATED_QUANTITY_EXCEEDS_STOCK":
            return "Total quantity across multiple items exceeds stock. Please reduce quantity.";
        default:
            return "Please review your cart before checkout.";
    }
};