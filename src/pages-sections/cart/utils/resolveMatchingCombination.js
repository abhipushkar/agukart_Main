const normalize = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};

export const resolveMatchingCombination = (product) => {

    if (!product?.combinationData?.length) {
        return null;
    }

    // BUILD SELECTED VALUES

    const selectedValues = [];

    // CHILD PRODUCT VARIANTS
    if (
        product?.variantAttributeData?.length > 0
    ) {

        product.variantAttributeData.forEach((attribute) => {

            if (attribute?.attribute_value) {

                selectedValues.push(
                    normalize(attribute.attribute_value)
                );
            }
        });
    }

    // INTERNAL VARIANTS
    if (product?.variants?.length > 0) {

        product.variants.forEach((variant) => {

            if (variant?.attributeName) {

                selectedValues.push(
                    normalize(variant.attributeName)
                );
            }
        });
    }

    if (selectedValues.length === 0) {
        return null;
    }

    // FIND MATCHING COMBINATION

    for (const group of product.combinationData) {

        for (const combination of group.combinations || []) {

            const combinationValues =
                (combination?.combValues || [])
                    .map(normalize);

            const isMatch =
                combinationValues.every((value) =>
                    selectedValues.includes(value)
                );

            if (isMatch) {
                return combination;
            }
        }
    }

    return null;
};