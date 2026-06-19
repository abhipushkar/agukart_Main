// utils/buildVariantCombinationIdentity.js
const normalize = (value) => String(value || "").trim().toLowerCase();

/**
 * Builds an identity for a cart item based ONLY on product_id and variant selections
 * (EXCLUDING customizations, as customizations don't affect stock)
 */

export const buildCombinationIdentity = (product) => {

    const internalVariants = (product?.variants || []).map(item =>
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