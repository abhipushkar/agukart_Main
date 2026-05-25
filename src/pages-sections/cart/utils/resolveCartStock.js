// utils/resolveCartStock.js
const normalize = (value) => String(value || "").trim();

/**
 * Resolves current stock for a cart item based on current selections.
 * @param {Object} product - Current product data
 * @returns {Object} { stockExists, latestStock, invalidValues }
 */
export const resolveCartStock = (product) => {
    // Simple product
    if (!product?.isCombination && !product.form_values?.isCheckedQuantity) {
        const stock = +product?.stock || 0;
        return {
            stockExists: stock > 0,
            latestStock: stock,
            invalidValues: [],
        };
    }

    const productStock = +product?.stock || 0;
    const isQuantityControlled = product?.form_values?.isCheckedQuantity === true;

    // If product stock > 0, prefer it (override combination)
    if (productStock > 0 && !isQuantityControlled) {
        return {
            stockExists: true,
            latestStock: productStock,
            invalidValues: [],
        };
    }
    if (productStock === 0 && !isQuantityControlled) {
        return {
            stockExists: false,
            latestStock: 0,
            invalidValues: [],
        };
    }

    // Get quantity controlling variant from form_values
    const quantityControllingVariant = product?.form_values?.quantities;

    // If quantity not controlled by combinations, fallback to product stock
    if (!quantityControllingVariant) {
        return {
            stockExists: productStock > 0,
            latestStock: productStock,
            invalidValues: [],
        };
    }

    // Build selected values from current selections
    const selectedValues = [];

    // Parent variants
    if (product?.variantAttributeData?.length) {
        product.variantAttributeData.forEach((attr) => {
            if (attr?.attribute_value) selectedValues.push(normalize(attr.attribute_value));
        });
    }

    // Internal variants
    if (product?.variants?.length) {
        product.variants.forEach((v) => {
            if (v?.attributeName) selectedValues.push(normalize(v.attributeName));
        });
    }

    // Inside resolveCartStock, after building selectedValues
    if (isQuantityControlled && selectedValues.length === 0 && !product?.variants?.length) {
        // No internal variants selected - return product stock
        return {
            stockExists: productStock > 0,
            latestStock: productStock,
            invalidValues: [],
        };
    }

    // Find the combination group that matches the quantity controlling variant
    const quantityGroup = product.combinationData.find(
        (group) => group.variant_name === quantityControllingVariant
    );

    if (!quantityGroup) {
        return {
            stockExists: productStock > 0,
            latestStock: productStock,
            invalidValues: [],
        };
    }

    // Find matching combination for quantity
    let foundStock = null;
    for (const combo of quantityGroup.combinations || []) {
        const comboValues = (combo.combValues || []).map(normalize);
        const isMatch = comboValues.every((val) => selectedValues.includes(val));
        if (isMatch && combo.qty !== undefined && combo.qty !== "") {
            foundStock = +combo.qty;
            console.log("Found stock for combination:", combo);
            break;
        }
    }
    if (foundStock !== null) {
        return {
            stockExists: foundStock > 0,
            latestStock: foundStock,
            invalidValues: [],
        };
    }

    // No matching combination found
    return {
        stockExists: false,
        latestStock: 0,
        invalidValues: selectedValues,
    };
};