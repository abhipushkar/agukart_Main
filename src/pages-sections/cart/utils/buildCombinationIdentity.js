// utils/buildVariantCombinationIdentity.js
const normalize = (value) => String(value || "").trim().toLowerCase();

/**
 * Builds an identity for a cart item based ONLY on product_id and variant selections
 * (EXCLUDING customizations, as customizations don't affect stock)
 */

export const buildCombinationIdentity = (product) => {
    // get qty controlling variants' attributes
    const isQtyControlled = product?.form_values?.isCheckedQuantity;
    const controllingVariant = isQtyControlled ? normalize(product?.form_values?.quantities) : "";
    const filteredVariants = isQtyControlled ? product?.variants.filter(v => controllingVariant.includes(normalize(v.variantName))) : product?.variants;
    const internalVariants = (filteredVariants || []).map(item =>
        normalize(item?.attributeName)
    );
    return JSON.stringify({
        product_id: product?.product_id,
        internalVariants: [...internalVariants].sort(),
    });
};

export const productQuantityMap = (products) => {
    if (!products) return null;
    const quantityMap = {};
    products.forEach(product => {
        const productIdentity = buildCombinationIdentity(product);
        quantityMap[productIdentity] = (quantityMap[productIdentity] || 0) + Number(product.qty);
    });
    return quantityMap;
};