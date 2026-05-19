const normalize = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};

export const buildCartItemIdentity = (product) => {

    const parentVariants = (
        product?.variantAttributeData || []
    ).map(item =>
        normalize(item?.attribute_value)
    );

    const internalVariants = (
        product?.variants || []
    ).map(item =>
        normalize(item?.attributeName)
    );

    return JSON.stringify({
        product_id: product?.product_id,

        parentVariants: [...parentVariants].sort(),

        internalVariants: [...internalVariants].sort()
    });
};