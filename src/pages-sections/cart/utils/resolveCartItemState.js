// utils/resolveCartItemState.js
import { resolveCartPricing } from "./resolveCartPricing";
import { resolveCartStock } from "./resolveCartStock";
import { resolveCartCustomizationPrice } from "./resolveCartCustomizationPrice";

const normalize = (value) => String(value || "").trim();

/**
 * Resolves the current state of a cart item, detecting changes in combination,
 * price, stock, and customizations.
 */
export const resolveCartItemState = (product, cartItem = null) => {
    const target = cartItem || product;
    const hasCombinationData = !!(product?.combinationData?.length);
    const hasParentId = !!product?.parent_id;
    const hasCustomization = product?.customize === "Yes" || product?.availableCustomization?.customizations?.length > 0;
    const isSimpleProduct = !hasCombinationData && !hasParentId;

    // ---- Helper: Validate parent variants (child product) ----
    const validateParentVariants = () => {
        if (!hasParentId) return true;
        // If cart has no parent selections but product now requires them -> missing selection
        if (!target?.variantAttributeData?.length) return false;
        
        // Get all valid parent attribute IDs from parent product
        const parentAttributeIds = product.parent_id?.product_variants?.flatMap((variant) => {
            return variant.variant_attributes?.map((attr) => attr._id) || [];
        }) || [];
        
        // Check if all selected parent variants exist in parent product
        return target.variantAttributeData.every((attr) => parentAttributeIds.includes(attr._id));
    };

    // ---- Helper: Validate internal variants (combination product) ----
    const validateInternalVariants = () => {
        if (!hasCombinationData) return true;
        // If cart has no internal selections but product now requires them -> missing selection
        if (!target?.variants?.length) return false;
        
        // Build selected values from cart
        const selectedValues = target.variants.map(v => normalize(v.attributeName));
        
        // Try to find a matching combination
        for (const group of product.combinationData) {
            for (const combo of group.combinations || []) {
                const comboValues = (combo.combValues || []).map(normalize);
                const isMatch = comboValues.every(val => selectedValues.includes(val));
                if (isMatch) {
                    return combo.isVisible === true || combo.isVisible === "true";
                }
            }
        }
        return false; // No matching combination found
    };

    // ---- Determine existence ----
    let exists = true;
    let missingSelection = false;
    let combinationExists = true;
    let parentVariantsValid = true;
    let internalVariantsValid = true;

    if (isSimpleProduct) {
        // Simple product: always exists if product is not deleted/inactive
        exists = true;
    } else {
        // Check parent variants if product has parent_id
        if (hasParentId) {
            parentVariantsValid = validateParentVariants();
            console.log("Parent variants valid:", parentVariantsValid);
            if (!parentVariantsValid && !target?.variantAttributeData?.length) {
                missingSelection = true;
            }
        }
        
        // Check internal variants if product has combinationData
        if (hasCombinationData) {
            internalVariantsValid = validateInternalVariants();
            console.log("Internal variants valid:", internalVariantsValid);
            if (!internalVariantsValid && !target?.variants?.length) {
                missingSelection = true;
            }
        }
        
        // Product exists only if both parent and internal variants are valid
        // If missing selection, product is considered non-existent (needs user action)
        if (missingSelection) {
            exists = false;
        } else {
            exists = parentVariantsValid && internalVariantsValid;
        }
        
        // Store combination existence flag for case type
        combinationExists = internalVariantsValid;
    }

    // ---- Current price and stock ----
    const currentPrice = resolveCartPricing(product, product);
    const originalCartPrice = +target?.original_price || +target?.real_price || 0;
    const priceChangeType = currentPrice !== originalCartPrice ? "changed" : "none";

    const stockState = resolveCartStock(product);
    const currentStock = stockState.latestStock;
    const originalCartStock = +target?.stock || 0;
    const stockChangeType = currentStock !== originalCartStock ? "changed" : "none";

    // ---- Customization validation ----
    let customizationExists = hasCustomization;
    let customizationValid = true;
    let customizationPriceChanged = false;
    let customizationRemoved = false;

    if (hasCustomization) {
        const currentCustomizationPrice = resolveCartCustomizationPrice(product, product);
        const cartCustomizationPrice = resolveCartCustomizationPrice(product, target);
        customizationPriceChanged = currentCustomizationPrice !== cartCustomizationPrice;

        const currentCustomizations = product?.availableCustomization?.customizations || [];
        const selectedCustomization = target?.selectedCustomization || [];

        // Check required customizations
        for (const custom of currentCustomizations) {
            if (custom.isCompulsory === "true") {
                const hasSelection = selectedCustomization.some(
                    (group) => group[custom.label]?.value
                );
                if (!hasSelection) {
                    customizationValid = false;
                    break;
                }
            }
        }

        // Check if any selected option still exists
        for (const selectedGroup of selectedCustomization) {
            for (const [label, selection] of Object.entries(selectedGroup)) {
                if (!selection?.value) continue;
                const currentField = currentCustomizations.find((c) => c.label === label);
                if (!currentField) {
                    customizationRemoved = true;
                    customizationValid = false;
                } else if (currentField.optionList) {
                    const optionExists = currentField.optionList.some(
                        (opt) => opt.optionName === selection.value
                    );
                    if (!optionExists) customizationRemoved = true;
                }
            }
        }
    }

    // ---- Determine case type ----
    let caseType = null;
    
    if (!exists) {
        if (missingSelection) {
            caseType = "VARIANT_SELECTION_REQUIRED";
        } else if (!combinationExists && hasCombinationData) {
            caseType = hasCustomization ? "COMBINATION_REMOVED" : "COMBINATION_REMOVED";
        } else if (!parentVariantsValid && hasParentId) {
            caseType = "PARENT_VARIANT_REMOVED";
        } else {
            caseType = "PRODUCT_UNAVAILABLE";
        }
    } else if (priceChangeType !== "none") {
        const isPriceControlled = product?.form_values?.isCheckedPrice === true;
        if (isPriceControlled && hasCombinationData) {
            caseType = hasCustomization ? "COMBINATION_PRICE_CHANGED" : "COMBINATION_PRICE_CHANGED";
        } else {
            caseType = hasCustomization ? "MAIN_PRICE_CHANGED" : "MAIN_PRICE_CHANGED";
        }
    } else if (customizationPriceChanged) {
        caseType = "CUSTOMIZATION_PRICE_CHANGED";
    } else if (customizationRemoved) {
        caseType = "CUSTOMIZATION_REMOVED";
    } else if (!customizationValid && customizationExists) {
        caseType = "CUSTOMIZATION_INCOMPLETE";
    } else if (stockChangeType !== "none" && !product?.form_values?.isCheckedQuantity) {
        caseType = "MAIN_STOCK_CHANGED";
    } else if (currentStock <= 0) {
        caseType = "OUT_OF_STOCK";
    }
    console.log(caseType);

    return {
        type: isSimpleProduct ? "simple" : (hasParentId ? "child" : "combination"),
        exists,
        isVisible: exists && product?.status !== false && product?.isDeleted !== true,
        latestPrice: currentPrice,
        latestStock: currentStock,
        hasCustomization,
        customizationValid,
        customizationPriceChanged,
        customizationRemoved,
        priceChangeType,
        stockChangeType,
        caseType,
        originalCartPrice,
        originalCartStock,
        missingSelection, // useful for UI
        parentVariantsValid,
        internalVariantsValid,
    };
};