// utils/resolveCartPricing.js
import { resolveCartCustomizationPrice } from "./resolveCartCustomizationPrice";

const normalize = (value) => String(value || "").trim();

/**
 * Calculate the current price of the product based on current selections.
 * @param {Object} product - Current product data
 * @param {Object} cartItem - Optional cart item snapshot (to use its selected variants)
 * @returns {number} Total current price
 */
export const resolveCartPricing = (product, cartItem = null) => {
    // Simple product
    if (!product?.combinationData?.length && !product.form_values?.isCheckedPrice) {
        return (+product?.real_price || 0) + resolveCartCustomizationPrice(product, cartItem || product);
    }


    // Get price controlling variant from form_values
    const priceControllingVariant = product?.form_values?.prices;
    const isPriceControlled = product?.form_values?.isCheckedPrice === true;
    if (!priceControllingVariant && !isPriceControlled) {
        // Fallback to product price
        return (+product?.real_price || 0) + resolveCartCustomizationPrice(product, cartItem || product);
    }

    // Build selected values from current selections
    const selectedValues = [];

    // Parent variants (for child products)
    if (cartItem?.variantAttributeData?.length) {
        cartItem.variantAttributeData.forEach((attr) => {
            if (attr?.attribute_value) selectedValues.push(normalize(attr.attribute_value));
        });
    } else if (product?.variantAttributeData?.length) {
        product.variantAttributeData.forEach((attr) => {
            if (attr?.attribute_value) selectedValues.push(normalize(attr.attribute_value));
        });
    }
 
    // Add this at the beginning of the function
    if (product?.combinationData?.length && selectedValues.length === 0 && !product?.variants?.length) {
        // No internal variants selected - return base product price
        return (+product?.real_price || 0) + customizationPrice;
    }

    // Internal variants
    if (cartItem?.variants?.length) {
        cartItem.variants.forEach((v) => {
            if (v?.attributeName) selectedValues.push(normalize(v.attributeName));
        });
    } else if (product?.variants?.length) {
        product.variants.forEach((v) => {
            if (v?.attributeName) selectedValues.push(normalize(v.attributeName));
        });
    }

    // Find the combination group that matches the price controlling variant
    const priceGroup = product.combinationData.find(
        (group) => group.variant_name === priceControllingVariant
    );

    if (!priceGroup) {
        return (+product?.real_price || 0) + resolveCartCustomizationPrice(product, cartItem || product);
    }

    // Find matching price combination
    let foundPrice = null;
    for (const combo of priceGroup.combinations || []) {
        const comboValues = (combo.combValues || []).map(normalize);
        const isMatch = comboValues.every((val) => selectedValues.includes(val));
        if (isMatch && combo.price !== undefined && combo.price !== "") {
            foundPrice = +combo.price;
            break;
        }
    }

    const basePrice = foundPrice !== null ? foundPrice : (+product?.real_price || 0);
    const customizationPrice = resolveCartCustomizationPrice(product, cartItem || product);

    return basePrice + customizationPrice;
};