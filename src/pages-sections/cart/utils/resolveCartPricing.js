const normalize = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};

export const resolveCartPricing = (product) => {

    if (!product?.combinationData?.length) {

        return (
            +product?.real_price ||
            0
        );
    }

    /*
    ===================================
    ALL SELECTED VALUES
    ===================================
    */

    const selectedValues = [

        ...(product?.variantAttributeData || []).map(
            item =>
                normalize(
                    item?.attribute_value
                )
        ),

        ...(product?.variants || []).map(
            item =>
                normalize(
                    item?.attributeName
                )
        )
    ];

    /*
    ===================================
    FIND PRICE COMBINATION
    ===================================
    */

    for (const group of product.combinationData) {

        for (const combination of group.combinations || []) {

            /*
            ONLY PRICE VARIATIONS
            */

            if (
                combination?.isPriceVariation !== "true"
            ) {
                continue;
            }

            const combinationValues =
                (combination?.combValues || [])
                    .map(normalize);

            /*
            SUBSET MATCH
            */

            const isMatch =
                combinationValues.every(value =>
                    selectedValues.includes(value)
                );

            if (isMatch) {

                return (
                    +combination?.price ||
                    +product?.real_price ||
                    0
                );
            }
        }
    }

    /*
    ===================================
    FALLBACK
    ===================================
    */

    return (
        +product?.real_price ||
        0
    );
};