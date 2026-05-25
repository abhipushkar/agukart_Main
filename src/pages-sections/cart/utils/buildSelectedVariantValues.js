const normalizeValue = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};

export const buildSelectedVariantValues = (product) => {

    const values = [];

    // PARENT VARIANTS
    if (
        product?.variantData?.length > 0 &&
        product?.variantAttributeData?.length > 0
    ) {

        product.variantAttributeData.forEach((attribute) => {

            if (attribute?.attribute_value) {

                values.push(
                    normalizeValue(attribute.attribute_value)
                );
            }
        });
    }

    // INTERNAL VARIANTS
    if (product?.variants?.length > 0) {

        product.variants.forEach((variant) => {

            if (variant?.attributeName) {

                values.push(
                    normalizeValue(variant.attributeName)
                );
            }
        });
    }

    return values;
};