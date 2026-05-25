// utils/buildCartItemIdentity.js
const normalize = (value) => String(value || "").trim().toLowerCase();

const getCustomizationFingerprint = (product) => {
    if (product?.customize !== "Yes") return null;
    const selectedCustomization = product?.selectedCustomization || [];
    const entries = [];
    for (const group of selectedCustomization) {
        for (const [key, val] of Object.entries(group)) {
            if (val?.value) {
                entries.push(`${key}:${normalize(val.value)}`);
            }
        }
    }
    entries.sort();
    return entries.join("|");
};

export const buildCartItemIdentity = (product) => {
    const parentVariants = (product?.variantAttributeData || []).map((item) =>
        normalize(item?.attribute_value)
    );
    const internalVariants = (product?.variants || []).map((item) =>
        normalize(item?.attributeName)
    );
    const customizationFingerprint = getCustomizationFingerprint(product);

    return JSON.stringify({
        product_id: product?.product_id,
        parentVariants: [...parentVariants].sort(),
        internalVariants: [...internalVariants].sort(),
        customizationFingerprint,
    });
};