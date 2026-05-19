import { resolveCartPricing } from "./resolveCartPricing";
import { resolveCartStock } from "./resolveCartStock";
import { resolveMatchingCombination } from "./resolveMatchingCombination";

export const resolveCartItemState = (product) => {

    const matchedCombination =
        resolveMatchingCombination(product);

    const isCombinationProduct =
        !!product?.isCombination;

    /*
    ===================================
    SIMPLE PRODUCT
    ===================================
    */

    if (!isCombinationProduct) {

        const latestPrice =
            +product?.original_price ||
            +product?.real_price ||
            0;

        const latestStock =
            +product?.stock || 0;

        return {

            type: "simple",

            exists: true,

            isVisible:
                product?.status !== false &&
                product?.isDeleted !== true,

            latestPrice,

            latestStock,

            matchedCombination: null,
        };
    }

    /*
    ===================================
    COMBINATION REMOVED
    ===================================
    */

    if (!matchedCombination) {

        return {

            type: "combination",

            exists: false,

            isVisible: false,

            latestPrice:
                +product?.original_price ||
                +product?.real_price ||
                0,

            latestStock: 0,

            matchedCombination: null,
        };
    }

    /*
    ===================================
    COMBINATION PRODUCT
    ===================================
    */

    const latestPrice = resolveCartPricing(product);

    const latestStock = resolveCartStock(product);

    return {

        type: "combination",

        exists: true,

        isVisible:
            matchedCombination?.isVisible !== "false" &&
            product?.status !== false &&
            product?.isDeleted !== true,

        latestPrice,

        latestStock,

        matchedCombination,
    };
};