const normalize = (value) => {
    return String(value || "")
        .trim()
        .toLowerCase();
};

export const resolveCartStock = (product) => {

    /*
    ===================================
    SIMPLE PRODUCT
    ===================================
    */

    if (!product?.isCombination) {

        return +product?.stock || 0;
    }

    /*
    ===================================
    NO COMBINATION DATA
    ===================================
    */

    if (!product?.combinationData?.length) {

        return +product?.stock || 0;
    }

    /*
===================================
PRODUCT LEVEL STOCK
===================================
*/

    if (+product?.stock > 0) {

        return +product.stock;
    }

    /*
    ===================================
    FIND QUANTITY VARIATION GROUP
    ===================================
    */

    const quantityGroups =
        product.combinationData.filter(group =>
            group?.combinations?.some(
                item =>
                    item?.isQuantityVariation === "true"
            )
        );

    /*
    ===================================
    NO QTY VARIATION
    ===================================
    */

    if (quantityGroups.length === 0) {

        return +product?.stock || 0;
    }

    /*
    ===================================
    MATCH STOCK COMBINATION
    ===================================
    */

    const selectedValues = [
        ...(product?.variantAttributeData || []).map(
            item => normalize(item?.attribute_value)
        ),

        ...(product?.variants || []).map(
            item => normalize(item?.attributeName)
        )
    ];

    for (const group of quantityGroups) {

        for (const combination of group.combinations || []) {

            const combinationValues =
                (combination?.combValues || [])
                    .map(normalize);

            const isSubsetMatch =
                combinationValues.every(value =>
                    selectedValues.includes(value)
                );

            if (isSubsetMatch) {

                // EMPTY = fallback to product stock
                if (
                    combination?.qty === ""
                ) {

                    return +product?.stock || 0;
                }

                return +combination.qty || 0;
            }
        }
    }

    return +product?.stock || 0;
};