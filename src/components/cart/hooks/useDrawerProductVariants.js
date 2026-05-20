// hooks/product.hooks/useDrawerProductVariants.js
import { useState, useEffect, useCallback, useMemo } from "react";

export const useDrawerProductVariants = (product) => {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [variantAttributes, setVariantAttributes] = useState([]);
    const [filterVariantAttributes, setFilterVariantAttributes] = useState([]);
    const [errors, setErrors] = useState({});
    const [hoveredVariantImage, setHoveredVariantImage] = useState(null);
    const [soldOutCombinations, setSoldOutCombinations] = useState(new Set());
    const [internalCombinationsMap, setInternalCombinationsMap] = useState({
        combinationsMap: new Map(),
        attributeCombinations: new Map(),
    });
    const [selectedVariantImages, setSelectedVariantImages] = useState([]);

    // Get controlling variants from form_values or combinationData
    const getControllingVariants = useCallback(
        (field) => {
            if (product?.form_values?.[field]) {
                const value = product.form_values[field];
                if (typeof value === "string") {
                    return value.split(" and ").filter((name) => name.trim() !== "");
                }
            }
            if (product?.combinationData && product.combinationData.length > 0) {
                const targetField = field === "prices" ? "priceInput" : "quantityInput";
                for (const group of product.combinationData) {
                    if (group.combinations && group.combinations.length > 0) {
                        const val = group.combinations[0][targetField];
                        if (val && typeof val === "string") {
                            return val.split(" and ").filter((name) => name.trim() !== "");
                        }
                    }
                }
            }
            return [];
        },
        [product]
    );

    const priceControllingVariants = useMemo(
        () => getControllingVariants("prices"),
        [getControllingVariants]
    );
    const quantityControllingVariants = useMemo(
        () => getControllingVariants("quantities"),
        [getControllingVariants]
    );

    const shouldUseCombinationPrice = useMemo(() => {
        let isChecked = product?.form_values?.isCheckedPrice === true;
        if (!isChecked && product?.combinationData && product.combinationData.length > 0) {
            for (const group of product.combinationData) {
                if (group.combinations && group.combinations.length > 0) {
                    if (group.combinations[0].isCheckedPrice === "true" || group.combinations[0].isCheckedPrice === true) {
                        isChecked = true;
                        break;
                    }
                }
            }
        }
        return isChecked;
    }, [product]);

    const shouldUseCombinationQuantity = useMemo(() => {
        let isChecked = product?.form_values?.isCheckedQuantity === true;
        if (!isChecked && product?.combinationData && product.combinationData.length > 0) {
            for (const group of product.combinationData) {
                if (group.combinations && group.combinations.length > 0) {
                    if (group.combinations[0].isCheckedQuantity === "true" || group.combinations[0].isCheckedQuantity === true) {
                        isChecked = true;
                        break;
                    }
                }
            }
        }
        return isChecked;
    }, [product]);

    // Normalize variant data (same as original, but returns all variants)
    const normalizeVariantData = useCallback(() => {
        if (!product) return [];
        const allVariants = [];

        // Parent variants
        if (product?.parent_id) {
            if (product.parent_id.product_variants?.length) {
                product.parent_id.product_variants.forEach((variant) => {
                    const guideData = variant?.guide;
                    allVariants.push({
                        type: "parent",
                        id: variant.variant_name,
                        name: variant.variant_name,
                        guide_name: guideData?.guide_name || "",
                        guide_file: guideData?.guide_file || "",
                        guide_type: guideData?.guide_type || "",
                        guide_description: guideData?.guide_description || "",
                        attributes: (variant.variant_attributes || [])
                            .filter(attr => product.variant_attribute_id?.some(va => va._id === attr._id))
                            .map((attr) => ({
                                id: attr._id,
                                value: attr.attribute,
                                images: attr.main_images || [],
                                thumbnail: attr.thumbnail || "",
                                preview_image: attr.preview_image || "",
                            })) || [],
                    });
                });
            } else if (product.parent_id.variant_id?.length) {
                product.parent_id.variant_id.forEach((variant) => {
                    allVariants.push({
                        type: "parent",
                        id: variant._id,
                        name: variant.variant_name,
                        guide_name: variant.guide_name || "",
                        guide_file: variant.guide_file || "",
                        guide_type: variant.guide_type || "",
                        guide_description: variant.guide_description || "",
                        attributes: (product.parent_id.variant_attribute_id || [])
                            .filter((attr) => attr.variant === variant._id)
                            .map((attr) => ({
                                id: attr._id,
                                value: attr.attribute_value,
                                images: attr.main_images || [],
                                thumbnail: attr.thumbnail || "",
                                preview_image: attr.preview_image || "",
                            })) || [],
                    });
                });
            }
        }

        // Internal variants
        if (product?.product_variants?.length) {
            product.product_variants.forEach((variant) => {
                const guideData = variant?.guide?.[0];
                const customVariant = product.variations_data?.find(v => v.name === variant.variant_name && v.type === 'custom');
                if (customVariant) {
                    const customVariantAttributes = (variant.variant_attributes || []).map((attr) => ({
                        id: attr.attribute,
                        value: attr.attribute,
                        attribute: attr.attribute_value,
                        attribute_value: attr.attribute_value,
                        images: attr.main_images || [],
                        thumbnail: attr.thumbnail || "",
                        preview_image: attr.preview_image || "",
                        edit_preview_image: attr.edit_preview_image || "",
                        price: null,
                        quantity: null,
                        priceRange: null,
                        quantityRange: null,
                        isSoldOut: false,
                    }));
                    allVariants.push({
                        type: "internal",
                        id: variant.variant_name,
                        name: variant.variant_name,
                        guide_name: guideData?.guide_name || "",
                        guide_file: guideData?.guide_file || "",
                        guide_type: guideData?.guide_type || "",
                        guide_description: guideData?.guide_description || "",
                        attributes: customVariantAttributes,
                        viewAllVisible: variant.viewAll === "true",
                        isCustom: true,
                    });
                }

                const variantInVariantId = product.variant_id?.find(v => v.variant_name === variant.variant_name);
                if (!variantInVariantId) return;

                const variantAttributes = product.variant_attribute_id?.filter(attr => attr.variant === variantInVariantId._id) || [];
                const variantFromPV = product.product_variants.find(pv => pv.variant_name === variant.variant_name);
                const pvAttributesMap = {};
                if (variantFromPV?.variant_attributes) {
                    variantFromPV.variant_attributes.forEach((pvAttr) => {
                        pvAttributesMap[pvAttr.attribute] = {
                            thumbnail: pvAttr.thumbnail || "",
                            preview_image: pvAttr.preview_image || "",
                            edit_preview_image: pvAttr.edit_preview_image || "",
                            main_images: pvAttr.main_images || [],
                        };
                    });
                }

                const filteredAttributes = variantAttributes
                    .filter(attr => variantFromPV?.variant_attributes?.some(pvAttr => pvAttr.attribute === attr.attribute_value))
                    .map((attr) => {
                        const pvAttr = pvAttributesMap[attr.attribute_value];
                        return {
                            id: attr._id,
                            value: attr.attribute_value,
                            attribute: attr.attribute_value,
                            attribute_value: attr.attribute_value,
                            images: pvAttr?.main_images || [],
                            thumbnail: pvAttr?.thumbnail || "",
                            preview_image: pvAttr?.preview_image || "",
                            edit_preview_image: pvAttr?.edit_preview_image || "",
                            price: null,
                            quantity: null,
                            priceRange: null,
                            quantityRange: null,
                            isSoldOut: false,
                        };
                    });

                const orderMap = new Map((variant.variant_attributes || []).map((attr, index) => [attr.attribute, index]));
                const orderedVariantAttributes = new Array(filteredAttributes.length);
                filteredAttributes.forEach(item => {
                    const index = orderMap.get(item.value);
                    if (index !== undefined) orderedVariantAttributes[index] = item;
                });
                const cleanOrderedAttributes = orderedVariantAttributes.filter(Boolean);
                if (cleanOrderedAttributes.length) {
                    allVariants.push({
                        type: "internal",
                        id: variant.variant_name,
                        name: variant.variant_name,
                        guide_name: guideData?.guide_name || "",
                        guide_file: guideData?.guide_file || "",
                        guide_type: guideData?.guide_type || "",
                        guide_description: guideData?.guide_description || "",
                        attributes: cleanOrderedAttributes,
                        viewAllVisible: variant.viewAll === "true",
                    });
                }
            });
        }
        return allVariants;
    }, [product]);

    // Extract parent combinations (only for sold out checks, no navigation)
    const extractParentCombinations = useCallback(() => {
        if (!product?.parentCombinationData) return [];
        const parentCombinations = [];
        product.parentCombinationData.forEach((combo) => {
            if (combo.combination_id) {
                const combinationIds = combo.combination_id.toString().split(",").filter(id => id.trim() !== "");
                parentCombinations.push({
                    _id: combo._id,
                    sku_product_id: combo.sku_product_id,
                    combination_id: combo.combination_id,
                    combination_ids: combinationIds,
                    sku_first_image: combo.sku_first_image || null,
                    sold_out: combo.sold_out || false,
                    product_code: combo.product_code || "",
                    slug: combo.slug || "",
                });
            }
        });
        return parentCombinations;
    }, [product]);

    const getSoldOutCombinations = useCallback(() => {
        const parentCombinations = extractParentCombinations();
        const soldOutSet = new Set();
        parentCombinations.forEach((combo) => {
            const isSoldOut = combo.sold_out === true || combo.sold_out === "true" || combo.sold_out === 1;
            if (isSoldOut && combo.combination_ids.length) {
                const comboString = combo.combination_ids.sort().join(",");
                soldOutSet.add(comboString);
                if (combo.combination_ids.length === 1) soldOutSet.add(combo.combination_ids[0]);
            }
        });
        return soldOutSet;
    }, [extractParentCombinations]);

    const extractInternalCombinations = useCallback(() => {
        if (!product?.combinationData) return { combinationsMap: new Map(), attributeCombinations: new Map() };
        const combinationsMap = new Map();
        const attributeCombinations = new Map();

        product.combinationData.forEach((comboGroup) => {
            if (comboGroup.combinations?.length) {
                comboGroup.combinations.forEach((combo) => {
                    const attributeIds = [];
                    const attributes = [];

                    // value1 / name1
                    if (combo.value1 && combo.name1) {
                        let attribute = null;
                        const variant = product.variant_id?.find(v => v.variant_name === combo.name1);
                        if (variant) {
                            attribute = product.variant_attribute_id?.find(attr => attr.variant === variant._id && attr.attribute_value === combo.value1);
                        }
                        if (!attribute) {
                            attribute = { _id: combo.value1, variant: combo.name1, attribute_value: combo.value1 };
                        }
                        if (attribute) {
                            attributeIds.push(attribute._id);
                            attributes.push({ id: attribute._id, variant: combo.name1, value: combo.value1 });
                        }
                    }

                    // value2 / name2
                    if (combo.value2 && combo.name2) {
                        let attribute = null;
                        const variant = product.variant_id?.find(v => v.variant_name === combo.name2);
                        if (variant) {
                            attribute = product.variant_attribute_id?.find(attr => attr.variant === variant._id && attr.attribute_value === combo.value2);
                        }
                        if (!attribute) {
                            attribute = { _id: combo.value2, variant: combo.name2, attribute_value: combo.value2 };
                        }
                        if (attribute) {
                            attributeIds.push(attribute._id);
                            attributes.push({ id: attribute._id, variant: combo.name2, value: combo.value2 });
                        }
                    }

                    if (attributeIds.length) {
                        const sortedIds = [...attributeIds].sort().join(",");
                        const price = combo.price && combo.price !== "" ? parseFloat(combo.price) : null;
                        const qty = (combo.qty === "" || combo.qty === null || combo.qty === undefined) ? "NOT_CONTROLLED" : parseInt(combo.qty, 10);
                        const isVisible = combo.isVisible === true || combo.isVisible === "true";
                        combinationsMap.set(sortedIds, {
                            price, qty, isVisible,
                            isCheckedPrice: combo.isCheckedPrice === "true",
                            isCheckedQuantity: combo.isCheckedQuantity === "true",
                            attributes, comboIds: attributeIds,
                        });
                        if (isVisible) {
                            attributeIds.forEach((attrId) => {
                                if (!attributeCombinations.has(attrId)) {
                                    attributeCombinations.set(attrId, { prices: new Set(), quantities: new Set(), isVisible: new Set(), isIndependent: false });
                                }
                                const attrData = attributeCombinations.get(attrId);
                                if (price !== null && !isNaN(price)) attrData.prices.add(price);
                                if (qty !== "NOT_CONTROLLED" && qty !== null && !isNaN(qty)) attrData.quantities.add(qty);
                                attrData.isVisible.add(isVisible);
                                if (attributeIds.length === 1) attrData.isIndependent = true;
                            });
                        }
                    }
                });
            }
        });

        const processedAttributeCombinations = new Map();
        attributeCombinations.forEach((data, attrId) => {
            processedAttributeCombinations.set(attrId, {
                prices: Array.from(data.prices),
                quantities: Array.from(data.quantities),
                isVisible: Array.from(data.isVisible),
                isIndependent: data.isIndependent,
            });
        });
        return { combinationsMap, attributeCombinations: processedAttributeCombinations };
    }, [product]);

    const isAttributeVisible = useCallback((attributeId, currentSelections = {}) => {
        if (!(product?.isCombination || product?.combinationData?.length)) return true;
        const { combinationsMap } = internalCombinationsMap;
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find(v => v.attributes.some(a => a.id === attributeId));
        if (!attributeVariant) return true;
        const testSelections = { ...currentSelections, [attributeVariant.id]: attributeId };
        let hasVisibleCombination = false;
        combinationsMap.forEach((combo, key) => {
            const ids = key.split(",").filter(Boolean);
            if (!ids.includes(attributeId)) return;
            const matches = Object.entries(testSelections).every(([variantName, attrId]) => {
                const variantInCombo = combo.attributes.some(a => a.variant === variantName);
                if (!variantInCombo) return true;
                return ids.includes(attrId);
            });
            if (matches && (combo.isVisible === "true" || combo.isVisible === true)) hasVisibleCombination = true;
        });
        return hasVisibleCombination;
    }, [product, internalCombinationsMap, normalizeVariantData]);

    const getAttributeRanges = useCallback((attributeId) => {
        if (!internalCombinationsMap.attributeCombinations) return null;
        const attrData = internalCombinationsMap.attributeCombinations.get(attributeId);
        if (!attrData) return null;
        const validPrices = attrData.prices.filter(p => p !== null && !isNaN(p));
        const validQuantities = attrData.quantities.filter(q => q !== null && !isNaN(q));
        const nonZeroQuantities = validQuantities.filter(q => q > 0);
        const quantityValues = nonZeroQuantities.length ? nonZeroQuantities : validQuantities;
        const priceRange = validPrices.length ? { min: Math.min(...validPrices), max: Math.max(...validPrices) } : null;
        const quantityRange = quantityValues.length ? { min: Math.min(...quantityValues), max: Math.max(...quantityValues) } : null;
        return { priceRange, quantityRange, isIndependent: attrData.isIndependent };
    }, [internalCombinationsMap]);

    const areAllInternalVariantsSelected = useCallback(() => {
        const normalizedVariants = normalizeVariantData();
        const internalVariants = normalizedVariants.filter(v => v.type === "internal");
        return internalVariants.length === 0 || internalVariants.every(v => selectedVariants[v.id]);
    }, [normalizeVariantData, selectedVariants]);

    const isAttributeCombinationSoldOut = useCallback((attributeId, currentSelections = {}) => {
        if (product?.parent_id) {
            if (soldOutCombinations.has(attributeId)) return true;
            const tempSelections = { ...currentSelections };
            const normalizedVariants = normalizeVariantData();
            const attributeVariant = normalizedVariants.find(v => v.attributes.some(attr => attr.id === attributeId));
            if (!attributeVariant) return false;
            tempSelections[attributeVariant.id] = attributeId;
            const selectionIds = Object.values(tempSelections).filter(id => id);
            if (!selectionIds.length) return false;
            const selectionString = selectionIds.sort().join(",");
            return soldOutCombinations.has(selectionString);
        }

        if ((product?.isCombination || product?.combinationData?.length) && shouldUseCombinationQuantity) {
            const { combinationsMap } = internalCombinationsMap;
            const tempSelections = { ...currentSelections };
            const normalizedVariants = normalizeVariantData();
            const attributeVariant = normalizedVariants.find(v => v.attributes.some(attr => attr.id === attributeId));
            if (!attributeVariant) return false;
            if (!quantityControllingVariants.includes(attributeVariant.id)) return false;

            const controllingSelections = {};
            Object.entries(tempSelections).forEach(([variantName, attrId]) => {
                if (quantityControllingVariants.includes(variantName)) controllingSelections[variantName] = attrId;
            });
            if (quantityControllingVariants.includes(attributeVariant.id)) controllingSelections[attributeVariant.id] = attributeId;
            const selectedIds = Object.values(controllingSelections).filter(Boolean);

            let hasStock = false, hasAnyVisibleCombo = false;
            combinationsMap.forEach((combo, key) => {
                const ids = key.split(",").filter(Boolean);
                if (!ids.includes(attributeId)) return;
                if (!combo.isVisible) return;
                const matches = selectedIds.every(id => ids.includes(id));
                if (!matches) return;
                hasAnyVisibleCombo = true;
                if (combo.qty === "" || combo.qty === null || combo.qty === undefined || Number(combo.qty) > 0) hasStock = true;
            });
            if (!hasAnyVisibleCombo) return false;
            return !hasStock;
        }
        return false;
    }, [product, soldOutCombinations, normalizeVariantData, internalCombinationsMap, shouldUseCombinationQuantity, quantityControllingVariants]);

    const getSelectedVariantMainImages = useCallback((currentSelections = selectedVariants) => {
        if (!product?.product_variants) return [];
        const variantImages = [];
        Object.entries(currentSelections).forEach(([variantName, attributeId]) => {
            const variant = product.product_variants.find(pv => pv.variant_name === variantName);
            if (variant?.variant_attributes) {
                const selectedAttribute = variant.variant_attributes.find(attr => {
                    const attrInVariantAttr = product.variant_attribute_id?.find(va => va._id === attributeId);
                    return attrInVariantAttr && attr.attribute === attrInVariantAttr.attribute_value;
                });
                if (selectedAttribute?.main_images?.length) {
                    // Remove existing from same variant to keep only latest selection
                    const filtered = variantImages.filter(img => img.variantName !== variantName);
                    selectedAttribute.main_images.forEach((img, imgIndex) => {
                        if (img && typeof img === "string" && img.trim()) {
                            filtered.push({
                                variantName,
                                attributeId,
                                attributeValue: selectedAttribute.attribute,
                                imageUrl: img,
                                type: "variant",
                                priority: Object.keys(currentSelections).indexOf(variantName),
                                imageIndex: imgIndex,
                            });
                        }
                    });
                    variantImages.length = 0;
                    variantImages.push(...filtered);
                }
            }
        });
        variantImages.sort((a, b) => a.priority - b.priority);
        return variantImages;
    }, [product, selectedVariants]);

    useEffect(() => {
        if (product?.product_variants) {
            setSelectedVariantImages(getSelectedVariantMainImages());
        }
    }, [product, selectedVariants, getSelectedVariantMainImages]);

    const getAttributePrice = useCallback((attributeId, currentSelections = {}) => {
        if (!(product?.isCombination || product?.combinationData?.length) || !shouldUseCombinationPrice) return null;
        const { combinationsMap } = internalCombinationsMap;
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find(v => v.attributes.some(attr => attr.id === attributeId));
        if (!attributeVariant) return null;
        const controllingSelections = {};
        Object.entries(currentSelections).forEach(([variantName, attrId]) => {
            if (priceControllingVariants.includes(variantName)) controllingSelections[variantName] = attrId;
        });
        if (priceControllingVariants.includes(attributeVariant.id)) controllingSelections[attributeVariant.id] = attributeId;
        const selectionIds = Object.values(controllingSelections).filter(id => id);
        if (selectionIds.length === 0) {
            const ranges = getAttributeRanges(attributeId);
            return ranges?.priceRange ? { type: "range", min: ranges.priceRange.min, max: ranges.priceRange.max, isIndependent: ranges.isIndependent } : null;
        }
        const selectionString = selectionIds.sort().join(",");
        const comboData = combinationsMap.get(selectionString);
        if (comboData && comboData.price !== null) return { type: "fixed", value: comboData.price, isIndependent: selectionIds.length === 1 };
        const ranges = getAttributeRanges(attributeId);
        return ranges?.priceRange ? { type: "range", min: ranges.priceRange.min, max: ranges.priceRange.max, isIndependent: ranges.isIndependent } : null;
    }, [product, normalizeVariantData, internalCombinationsMap, getAttributeRanges, shouldUseCombinationPrice, priceControllingVariants]);

    const getAttributeQuantity = useCallback((attributeId, currentSelections = {}) => {
        if (!(product?.isCombination || product?.combinationData?.length) || !shouldUseCombinationQuantity) return null;
        const { combinationsMap } = internalCombinationsMap;
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find(v => v.attributes.some(attr => attr.id === attributeId));
        if (!attributeVariant) return null;
        const controllingSelections = {};
        Object.entries(currentSelections).forEach(([variantName, attrId]) => {
            if (quantityControllingVariants.includes(variantName)) controllingSelections[variantName] = attrId;
        });
        if (quantityControllingVariants.includes(attributeVariant.id)) controllingSelections[attributeVariant.id] = attributeId;
        const selectionIds = Object.values(controllingSelections).filter(id => id);
        if (selectionIds.length === 0) {
            const ranges = getAttributeRanges(attributeId);
            return ranges?.quantityRange ? { type: "range", min: ranges.quantityRange.min, max: ranges.quantityRange.max } : null;
        }
        const selectionString = selectionIds.sort().join(",");
        const comboData = combinationsMap.get(selectionString);
        if (comboData && comboData.qty !== null) return { type: "fixed", value: comboData.qty };
        const ranges = getAttributeRanges(attributeId);
        return ranges?.quantityRange ? { type: "range", min: ranges.quantityRange.min, max: ranges.quantityRange.max } : null;
    }, [product, normalizeVariantData, internalCombinationsMap, getAttributeRanges, shouldUseCombinationQuantity, quantityControllingVariants]);

    const getHoverProductImage = useCallback((hoveredAttributeId) => {
        if (!hoveredAttributeId) return null;
        const normalizedVariants = normalizeVariantData();
        const hoveredVariant = normalizedVariants.find(v => v.attributes.some(attr => attr.id === hoveredAttributeId));
        if (!hoveredVariant) return null;

        if (hoveredVariant.type === "parent") {
            if (!product?.parent_id) return null;
            const parentCombinations = extractParentCombinations();
            const currentSelections = { ...selectedVariants, [hoveredVariant.id]: hoveredAttributeId };
            const selectionIds = [];
            normalizedVariants.filter(v => v.type === "parent").forEach(variant => {
                const selectedId = currentSelections[variant.id];
                if (selectedId) selectionIds.push(selectedId);
            });
            if (!selectionIds.length) return null;
            const selectionString = selectionIds.sort().join(",");
            const targetCombination = parentCombinations.find(combo => combo.combination_ids.sort().join(",") === selectionString);
            return targetCombination?.sku_first_image ? { type: "hover-preview", url: targetCombination.sku_first_image, source: "parent-variant", attributeId: hoveredAttributeId } : null;
        }

        if (hoveredVariant.type === "internal") {
            const attr = hoveredVariant.attributes.find(a => a.id === hoveredAttributeId);
            if (attr?.images?.length && typeof attr.images[0] === "string") {
                return { type: "hover-preview", url: attr.images[0], source: "internal-variant", attributeId: hoveredAttributeId };
            }
        }
        return null;
    }, [product, selectedVariants, extractParentCombinations, normalizeVariantData]);

    const handleVariantHover = useCallback((attributeId) => {
        const hoverImage = getHoverProductImage(attributeId);
        setHoveredVariantImage(hoverImage);
    }, [getHoverProductImage]);

    const handleVariantHoverOut = useCallback(() => {
        setHoveredVariantImage(null);
    }, []);

    const handleVariantChange = useCallback((variantId, value) => {
        setSelectedVariants(prev => {
            const newSelected = { ...prev };
            const normalizedVariants = normalizeVariantData();
            const selectedVariant = normalizedVariants.find(v => v.id === variantId);
            if (selectedVariant?.type === "parent") {
                const internalVariantIds = normalizedVariants.filter(v => v.type === "internal").map(v => v.id);
                internalVariantIds.forEach(internalId => delete newSelected[internalId]);
            }
            if (value === "" || value === undefined || value === null) {
                delete newSelected[variantId];
            } else {
                newSelected[variantId] = value;
            }
            return newSelected;
        });
        setErrors(prev => ({ ...prev, [variantId]: "" }));
    }, [normalizeVariantData]);

    const validateVariants = useCallback(() => {
        const errorsObj = {};
        const normalizedVariants = normalizeVariantData();
        const parentVariants = normalizedVariants.filter(v => v.type === "parent");
        parentVariants.forEach(variant => {
            if (!selectedVariants[variant.id]) errorsObj[variant.id] = "Please select an option";
        });
        setErrors(errorsObj);
        const allInternalSelected = areAllInternalVariantsSelected();
        return Object.keys(errorsObj).length === 0 && allInternalSelected;
    }, [selectedVariants, normalizeVariantData, areAllInternalVariantsSelected]);

    const getCurrentCombinationData = useCallback(() => {
        if (!(product?.isCombination || product?.combinationData?.length) || !selectedVariants || !Object.keys(selectedVariants).length) {
            return { price: null, quantity: null, priceRange: null, quantityRange: null };
        }
        const priceControlVariants = priceControllingVariants;
        const quantityControlVariants = quantityControllingVariants;
        const priceSelectionIds = [], quantitySelectionIds = [];
        Object.entries(selectedVariants).forEach(([variantName, attrId]) => {
            if (priceControlVariants.includes(variantName)) priceSelectionIds.push(attrId);
            if (quantityControlVariants.includes(variantName)) quantitySelectionIds.push(attrId);
        });
        const { combinationsMap } = internalCombinationsMap;
        let priceResult = null, quantityResult = null;
        if (shouldUseCombinationPrice && priceSelectionIds.length) {
            const priceKey = priceSelectionIds.sort().join(",");
            const priceCombo = combinationsMap.get(priceKey);
            if (priceCombo && priceCombo.price !== null && priceCombo.isVisible) priceResult = priceCombo.price;
        }
        if (shouldUseCombinationQuantity && quantitySelectionIds.length) {
            const quantityKey = quantitySelectionIds.sort().join(",");
            const quantityCombo = combinationsMap.get(quantityKey);
            if (quantityCombo && quantityCombo.qty !== null && quantityCombo.isVisible) {
                quantityResult = quantityCombo.qty;
            } else {
                let minQuantity = Infinity, foundAnyVisible = false;
                combinationsMap.forEach((combo, key) => {
                    const ids = key.split(",");
                    const matches = quantitySelectionIds.every(id => ids.includes(id));
                    if (matches && combo.qty !== "NOT_CONTROLLED" && combo.isVisible) {
                        foundAnyVisible = true;
                        if (combo.qty > 0) minQuantity = Math.min(minQuantity, combo.qty);
                    }
                });
                if (minQuantity !== Infinity && minQuantity > 0) quantityResult = minQuantity;
                else if (foundAnyVisible) quantityResult = 0;
            }
        }
        return { price: priceResult, quantity: quantityResult, priceRange: null, quantityRange: null, isVisible: true };
    }, [product, selectedVariants, internalCombinationsMap, shouldUseCombinationPrice, shouldUseCombinationQuantity, priceControllingVariants, quantityControllingVariants]);

    const currentCombinationData = useMemo(() => getCurrentCombinationData(), [getCurrentCombinationData]);

    const calculateAttributeData = useCallback((attributeId, currentSelections = selectedVariants) => {
        if (!(product?.isCombination || product?.combinationData?.length)) {
            return { price: null, quantity: null, priceRange: null, quantityRange: null, isSoldOut: false, isIndependent: false, isVisible: true };
        }
        const { combinationsMap, attributeCombinations } = internalCombinationsMap;
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find(v => v.attributes.some(a => a.id === attributeId));
        if (!attributeVariant) {
            return { price: null, quantity: null, priceRange: null, quantityRange: null, isSoldOut: false, isIndependent: false, isVisible: true };
        }
        const visible = isAttributeVisible(attributeId, currentSelections);
        const attrMeta = attributeCombinations.get(attributeId);
        const isIndependent = attrMeta?.isIndependent || false;
        const priceControlSelections = {}, quantityControlSelections = {};
        Object.entries(currentSelections).forEach(([variantName, attrId]) => {
            if (priceControllingVariants.includes(variantName)) priceControlSelections[variantName] = attrId;
            if (quantityControllingVariants.includes(variantName)) quantityControlSelections[variantName] = attrId;
        });
        if (priceControllingVariants.includes(attributeVariant.id)) priceControlSelections[attributeVariant.id] = attributeId;
        if (quantityControllingVariants.includes(attributeVariant.id)) quantityControlSelections[attributeVariant.id] = attributeId;
        const priceSelectedIds = Object.values(priceControlSelections);
        const quantitySelectedIds = Object.values(quantityControlSelections);
        let price = null, priceRange = null;
        if (shouldUseCombinationPrice) {
            if (priceSelectedIds.length === 0) {
                const ranges = getAttributeRanges(attributeId);
                priceRange = ranges?.priceRange || null;
            } else {
                const priceKey = priceSelectedIds.sort().join(",");
                const priceCombo = combinationsMap.get(priceKey);
                if (priceCombo && priceCombo.price !== null && priceCombo.isVisible) price = priceCombo.price;
                else {
                    const ranges = getAttributeRanges(attributeId);
                    priceRange = ranges?.priceRange || null;
                }
            }
        }
        let quantity = null, quantityRange = null;
        if (shouldUseCombinationQuantity) {
            if (quantitySelectedIds.length === 0) {
                const ranges = getAttributeRanges(attributeId);
                quantityRange = ranges?.quantityRange || null;
            } else {
                const quantityKey = quantitySelectedIds.sort().join(",");
                const quantityCombo = combinationsMap.get(quantityKey);
                if (quantityCombo && quantityCombo.qty !== null && quantityCombo.isVisible) quantity = quantityCombo.qty;
                else {
                    const ranges = getAttributeRanges(attributeId);
                    quantityRange = ranges?.quantityRange || null;
                }
            }
        }
        let isSoldOut = false;
        if (shouldUseCombinationQuantity && quantityControllingVariants.includes(attributeVariant.id)) {
            let hasAnyVisibleCombo = false, hasStock = false;
            combinationsMap.forEach((combo, key) => {
                const ids = key.split(",");
                if (!ids.includes(attributeId)) return;
                if (!combo.isVisible) return;
                const matches = quantitySelectedIds.every(id => ids.includes(id));
                if (!matches) return;
                hasAnyVisibleCombo = true;
                if (combo.qty === "" || combo.qty === null || combo.qty === undefined || Number(combo.qty) > 0) hasStock = true;
            });
            if (hasAnyVisibleCombo && !hasStock) isSoldOut = true;
        }
        return { price, quantity, priceRange, quantityRange, isSoldOut, isIndependent, isVisible: visible };
    }, [product, selectedVariants, internalCombinationsMap, normalizeVariantData, getAttributeRanges, shouldUseCombinationPrice, shouldUseCombinationQuantity, priceControllingVariants, quantityControllingVariants, isAttributeVisible]);

    // Initialize internal combinations
    useEffect(() => {
        if ((product?.isCombination || product?.combinationData?.length) && product?.combinationData) {
            const internalCombos = extractInternalCombinations();
            setInternalCombinationsMap(internalCombos);
        }
    }, [product, extractInternalCombinations]);

    // Update variant attributes with price/quantity data
    useEffect(() => {
        if ((product?.isCombination || product?.combinationData?.length)) {
            const normalizedVariants = normalizeVariantData();
            const updatedVariants = normalizedVariants.map((variant) => {
                if (variant.type === "internal") {
                    const updatedAttributes = variant.attributes.map((attr) => {
                        const ranges = getAttributeRanges(attr.id);
                        const priceData = getAttributePrice(attr.id, selectedVariants);
                        const quantityData = getAttributeQuantity(attr.id, selectedVariants);
                        const isSoldOut = isAttributeCombinationSoldOut(attr.id, selectedVariants);
                        const isVisible = isAttributeVisible(attr.id, selectedVariants);
                        return {
                            ...attr,
                            priceRange: ranges?.priceRange || null,
                            quantityRange: ranges?.quantityRange || null,
                            price: priceData?.type === "fixed" ? priceData.value : null,
                            quantity: quantityData?.type === "fixed" ? quantityData.value : null,
                            isSoldOut,
                            isIndependent: ranges?.isIndependent || false,
                            isVisible,
                        };
                    });
                    return { ...variant, attributes: updatedAttributes };
                }
                return variant;
            });
            const updatedVariantAttributes = updatedVariants.flatMap((variant) =>
                variant.attributes.map((attr) => ({
                    _id: attr.id,
                    variant: variant.name,
                    attribute_value: attr.value,
                    thumbnail: attr.thumbnail,
                    preview_image: attr.preview_image,
                    edit_preview_image: attr.edit_preview_image,
                    price: attr.price,
                    quantity: attr.quantity,
                    priceRange: attr.priceRange,
                    quantityRange: attr.quantityRange,
                    isSoldOut: attr.isSoldOut,
                    isIndependent: attr.isIndependent,
                    isVisible: attr.isVisible,
                }))
            );
            setFilterVariantAttributes(updatedVariantAttributes);
            setVariantAttributes(updatedVariantAttributes);
        }
    }, [product, selectedVariants, normalizeVariantData, getAttributeRanges, getAttributePrice, getAttributeQuantity, isAttributeCombinationSoldOut, isAttributeVisible]);

    // Initialize parent variants (no navigation, just selection)
    useEffect(() => {
        if (product?.parent_id) {
            const product_id = product._id;
            const parentCombinations = extractParentCombinations();
            const currentCombination = parentCombinations.find(combo => combo.sku_product_id === product_id);
            if (currentCombination) {
                const initialSelections = {};
                const variantAttributes = (product.parent_id.product_variants?.length)
                    ? product.parent_id.product_variants.flatMap(v => v.variant_attributes || [])
                    : (product.parent_id.variant_attribute_id || []);
                currentCombination.combination_ids.forEach((combId) => {
                    const variantAttr = variantAttributes.find(attr => attr._id === combId);
                    if (variantAttr) {
                        const variantIdentifier = product.parent_id.product_variants ? variantAttr.variant : variantAttr.variant;
                        initialSelections[variantIdentifier] = variantAttr._id;
                    }
                });
                setSelectedVariants(initialSelections);
            }
        }
    }, [product, extractParentCombinations]);

    // Update sold out combinations
    useEffect(() => {
        if (product?.parentCombinationData) {
            const soldOutCombos = getSoldOutCombinations();
            setSoldOutCombinations(soldOutCombos);
        }
    }, [product, getSoldOutCombinations]);


    // Prefill selected variants from cart item (called from parent)
    const prefillFromCart = useCallback((cartItem) => {
        console.log("========== PREFILL FROM CART ==========");
        console.log("Called with cartItem:", cartItem);

        if (!cartItem) {
            console.log("No cartItem, exiting");
            return;
        }

        const newSelections = {};

        // Handle parent variants (variantData + variantAttributeData)
        if (cartItem.variantData?.length && cartItem.variantAttributeData?.length) {
            console.log("Parent variants found:", cartItem.variantData);
            cartItem.variantData.forEach((variant, index) => {
                const attribute = cartItem.variantAttributeData[index];
                if (variant?.variant_name && attribute?._id) {
                    newSelections[variant.variant_name] = attribute._id;
                    console.log(`  Added parent variant: ${variant.variant_name} = ${attribute._id}`);
                }
            });
        }

        // Handle internal variants - use normalized variants data
        const normalizedVariants = normalizeVariantData();
        const internalVariants = normalizedVariants.filter(v => v.type === "internal");

        if (cartItem.variants?.length) {
            console.log("Internal variants found in cartItem.variants:", cartItem.variants);
            cartItem.variants.forEach(({ variantName, attributeName }) => {
                console.log(`Looking for internal variant: ${variantName} with attribute: ${attributeName}`);

                // Find the variant in normalized variants
                const variant = internalVariants.find(v => v.id === variantName);
                if (variant) {
                    console.log(`  Found variant in normalized data:`, variant.name);

                    // Find the attribute in the variant's attributes
                    const attr = variant.attributes.find(a => {
                        // Compare using value property (from normalized data)
                        return a.value === attributeName;
                    });

                    console.log(`  Found attribute in normalized data:`, attr);

                    if (attr?.id) {
                        newSelections[variantName] = attr.id;
                        console.log(`  ✅ Added internal variant: ${variantName} = ${attr.id}`);
                    } else {
                        console.log(`  ❌ Could not find attribute ID for ${variantName}:${attributeName}`);
                        console.log(`  Available attributes:`, variant.attributes.map(a => ({ value: a.value, id: a.id })));
                    }
                } else {
                    console.log(`  ❌ Variant not found in normalized data: ${variantName}`);
                    console.log(`  Available normalized variants:`, internalVariants.map(v => v.id));
                }
            });
        }

        console.log("Final newSelections:", newSelections);
        setSelectedVariants(prev => ({ ...prev, ...newSelections }));
    }, [product, normalizeVariantData]);

    return {
        selectedVariants,
        variantAttributes,
        filterVariantAttributes,
        errors,
        hoveredVariantImage,
        soldOutCombinations,
        internalCombinationsMap,
        currentCombinationData,
        selectedVariantImages,
        calculateAttributeData,
        handleVariantChange,
        handleVariantHover,
        handleVariantHoverOut,
        isAttributeCombinationSoldOut,
        getAttributePrice,
        getAttributeQuantity,
        getAttributeRanges,
        validateVariants,
        normalizeVariantData,
        areAllInternalVariantsSelected,
        isAttributeVisible,
        prefillFromCart
    };
};