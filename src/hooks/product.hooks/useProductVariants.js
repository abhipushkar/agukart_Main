import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';

export const useProductVariants = (product) => {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [variantAttributes, setVariantAttributes] = useState([]);
    const [filterVariantAttributes, setFilterVariantAttributes] = useState([]);
    const [errors, setErrors] = useState({});
    const [hoveredVariantImage, setHoveredVariantImage] = useState(null);
    const [soldOutCombinations, setSoldOutCombinations] = useState(new Set());
    const [internalCombinationsMap, setInternalCombinationsMap] = useState({ combinationsMap: new Map(), attributeCombinations: new Map() });
    const [selectedVariantImages, setSelectedVariantImages] = useState([]);
    const router = useRouter();

    // Normalize all variant data into a consistent structure
    const normalizeVariantData = useCallback(() => {
        if (!product) return [];

        const allVariants = [];

        // Handle parent product variants - ONLY if product has parent_id
        if (product?.parent_id) {
            // Try new structure first (product_variants)
            if (product.parent_id.product_variants && product.parent_id.product_variants.length > 0) {
                product.parent_id.product_variants.forEach(variant => {
                    // Find corresponding variant info from variant_id array for guide data
                    const variantInfo = product.parent_id.variant_id?.find(
                        v => v.variant_name === variant.variant_name || v._id === variant.variant_name
                    );

                    allVariants.push({
                        type: 'parent',
                        id: variant.variant_name,
                        name: variant.variant_name,
                        guide_name: variantInfo?.guide_name || '',
                        guide_file: variantInfo?.guide_file || '',
                        guide_type: variantInfo?.guide_type || '',
                        guide_description: variantInfo?.guide_description || '',
                        attributes: variant.variant_attributes?.map(attr => ({
                            id: attr._id,
                            value: attr.attribute,
                            images: attr.main_images || [],
                            thumbnail: attr.thumbnail || '',
                            preview_image: attr.preview_image || ''
                        })) || []
                    });
                });
            }
            // Fallback to old structure (variant_id)
            else if (product.parent_id.variant_id && Array.isArray(product.parent_id.variant_id)) {
                product.parent_id.variant_id.forEach(variant => {
                    allVariants.push({
                        type: 'parent',
                        id: variant._id,
                        name: variant.variant_name,
                        guide_name: variant.guide_name || '',
                        guide_file: variant.guide_file || '',
                        guide_type: variant.guide_type || '',
                        guide_description: variant.guide_description || '',
                        attributes: product.parent_id.variant_attribute_id
                            ?.filter(attr => attr.variant === variant._id)
                            ?.map(attr => ({
                                id: attr._id,
                                value: attr.attribute_value,
                                images: attr.main_images || [],
                                thumbnail: attr.thumbnail || '',
                                preview_image: attr.preview_image || ''
                            })) || []
                    });
                });
            }
        }

        // Handle internal variants - ONLY show variants that are in product_variants
        if (product?.product_variants?.length > 0) {
            product.product_variants.forEach(variant => {
                // Find corresponding variant info from variant_id array for guide data
                const variantInfo = product.variant_id?.find(
                    v => v.variant_name === variant.variant_name || v._id === variant.variant_name
                );

                // Get variant attributes ONLY from variant_attribute_id that belong to this variant
                const variantInVariantId = product.variant_id?.find(
                    v => v.variant_name === variant.variant_name
                );

                if (!variantInVariantId) {
                    return; // Skip this variant
                }

                // Filter variant_attribute_id to get only attributes for this specific variant
                const variantAttributes = product.variant_attribute_id?.filter(
                    attr => attr.variant === variantInVariantId._id
                ) || [];

                // Find attribute data from product_variants structure
                const variantFromPV = product.product_variants.find(
                    pv => pv.variant_name === variant.variant_name
                );

                // Create a map of attributes from product_variants for quick lookup
                const pvAttributesMap = {};
                if (variantFromPV?.variant_attributes) {
                    variantFromPV.variant_attributes.forEach(pvAttr => {
                        pvAttributesMap[pvAttr.attribute] = {
                            thumbnail: pvAttr.thumbnail || '',
                            preview_image: pvAttr.preview_image || '',
                            edit_preview_image: pvAttr.edit_preview_image || '',
                            main_images: pvAttr.main_images || []
                        };
                    });
                }

                // Only include attributes that exist in product_variants
                const filteredAttributes = variantAttributes
                    .filter(attr => {
                        // Check if this attribute value exists in product_variants
                        const existsInPV = variantFromPV?.variant_attributes?.some(
                            pvAttr => pvAttr.attribute === attr.attribute_value
                        );
                        return existsInPV;
                    })
                    .map(attr => {
                        const pvAttr = pvAttributesMap[attr.attribute_value];

                        return {
                            id: attr._id,
                            value: attr.attribute_value,
                            images: pvAttr?.main_images || [],
                            thumbnail: pvAttr?.thumbnail || attr.thumbnail || '',
                            preview_image: pvAttr?.preview_image || attr.preview_image || '',
                            edit_preview_image: pvAttr?.edit_preview_image || '',
                            price: null,
                            quantity: null,
                            priceRange: null,
                            quantityRange: null,
                            isSoldOut: false
                        };
                    });

                if (filteredAttributes.length > 0) {
                    allVariants.push({
                        type: 'internal',
                        id: variant.variant_name,
                        name: variant.variant_name,
                        guide_name: variantInfo?.guide_name || '',
                        guide_file: variantInfo?.guide_file || '',
                        guide_type: variantInfo?.guide_type || '',
                        guide_description: variantInfo?.guide_description || '',
                        attributes: filteredAttributes
                    });
                } else {
                    console.error(`No filtered attributes for ${variant.variant_name}, skipping variant`);
                }
            });
        } else {
            console.error("No product_variants found in product");
        }
        return allVariants;
    }, [product]);

    // Extract parent combinations (for navigation and hover images)
    const extractParentCombinations = useCallback(() => {
        if (!product?.parentCombinationData) return [];

        const parentCombinations = [];

        product.parentCombinationData.forEach(combo => {
            if (combo.combination_id) {
                const combinationIds = combo.combination_id.toString().split(',').filter(id => id.trim() !== '');

                parentCombinations.push({
                    _id: combo._id,
                    sku_product_id: combo.sku_product_id,
                    combination_id: combo.combination_id,
                    combination_ids: combinationIds,
                    sku_first_image: combo.sku_first_image || null,
                    sold_out: combo.sold_out || false
                });
            }
        });

        return parentCombinations;
    }, [product]);

    // Get sold out combinations for parent variants
    const getSoldOutCombinations = useCallback(() => {
        const parentCombinations = extractParentCombinations();
        const soldOutSet = new Set();

        parentCombinations.forEach(combo => {
            const isSoldOut = combo.sold_out === true || combo.sold_out === "true" || combo.sold_out === 1;

            if (isSoldOut && combo.combination_ids.length > 0) {
                const comboString = combo.combination_ids.sort().join(',');
                soldOutSet.add(comboString);

                if (combo.combination_ids.length === 1) {
                    soldOutSet.add(combo.combination_ids[0]);
                }
            }
        });

        return soldOutSet;
    }, [extractParentCombinations]);

    // Extract and map internal combinations for price/quantity calculations
    const extractInternalCombinations = useCallback(() => {
        if (!product?.combinationData) return { combinationsMap: new Map(), attributeCombinations: new Map() };

        const combinationsMap = new Map();
        const attributeCombinations = new Map();

        product.combinationData.forEach((comboGroup) => {
            if (comboGroup.combinations && Array.isArray(comboGroup.combinations)) {
                comboGroup.combinations.forEach(combo => {
                    const attributeIds = [];
                    const attributes = [];

                    // Handle value1 and name1
                    if (combo.value1 && combo.name1) {
                        const variant = product.variant_id?.find(v => v.variant_name === combo.name1);
                        if (variant) {
                            const attribute = product.variant_attribute_id?.find(
                                attr => attr.variant === variant._id && attr.attribute_value === combo.value1
                            );
                            if (attribute) {
                                attributeIds.push(attribute._id);
                                attributes.push({
                                    id: attribute._id,
                                    variant: combo.name1,
                                    value: combo.value1
                                });
                            }
                        }
                    }

                    // Handle value2 and name2 (for 2-attribute combinations)
                    if (combo.value2 && combo.name2) {
                        const variant = product.variant_id?.find(v => v.variant_name === combo.name2);
                        if (variant) {
                            const attribute = product.variant_attribute_id?.find(
                                attr => attr.variant === variant._id && attr.attribute_value === combo.value2
                            );
                            if (attribute) {
                                attributeIds.push(attribute._id);
                                attributes.push({
                                    id: attribute._id,
                                    variant: combo.name2,
                                    value: combo.value2
                                });
                            }
                        }
                    }

                    if (attributeIds.length > 0) {
                        const sortedIds = [...attributeIds].sort().join(',');

                        // Store combination data
                        const price = combo.price && combo.price !== "" ? parseFloat(combo.price) : null;
                        const qty = combo.qty && combo.qty !== "" ? parseInt(combo.qty, 10) : null;

                        combinationsMap.set(sortedIds, {
                            price: price,
                            qty: qty,
                            isVisible: combo.isVisible === "true",
                            isCheckedPrice: combo.isCheckedPrice === "true",
                            isCheckedQuantity: combo.isCheckedQuantity === "true",
                            attributes: attributes,
                            comboIds: attributeIds // Store for reference
                        });

                        // Also store for individual attributes to calculate ranges
                        attributeIds.forEach((attrId, idx) => {
                            if (!attributeCombinations.has(attrId)) {
                                attributeCombinations.set(attrId, {
                                    prices: new Set(),
                                    quantities: new Set(),
                                    isVisible: new Set(),
                                    isIndependent: false
                                });
                            }

                            const attrData = attributeCombinations.get(attrId);
                            if (price !== null && !isNaN(price)) {
                                attrData.prices.add(price);
                            }
                            if (qty !== null && !isNaN(qty)) {
                                attrData.quantities.add(qty);
                            }
                            attrData.isVisible.add(combo.isVisible === "true");

                            // Check if this attribute appears alone (independent pricing)
                            if (attributeIds.length === 1) {
                                attrData.isIndependent = true;
                            }
                        });
                    }
                });
            }
        });

        // Convert Sets to Arrays for easier processing
        const processedAttributeCombinations = new Map();
        attributeCombinations.forEach((data, attrId) => {
            processedAttributeCombinations.set(attrId, {
                prices: Array.from(data.prices),
                quantities: Array.from(data.quantities),
                isVisible: Array.from(data.isVisible),
                isIndependent: data.isIndependent
            });
        });

        return {
            combinationsMap,
            attributeCombinations: processedAttributeCombinations
        };
    }, [product]);

    // Get price and quantity ranges for an attribute
    const getAttributeRanges = useCallback((attributeId) => {
        if (!internalCombinationsMap.attributeCombinations) return null;

        const attrData = internalCombinationsMap.attributeCombinations.get(attributeId);
        if (!attrData) return null;

        const priceRange = attrData.prices.length > 0 ? {
            min: Math.min(...attrData.prices),
            max: Math.max(...attrData.prices)
        } : null;

        const quantityRange = attrData.quantities.length > 0 ? {
            min: Math.min(...attrData.quantities),
            max: Math.max(...attrData.quantities)
        } : null;

        return { priceRange, quantityRange, isIndependent: attrData.isIndependent };
    }, [internalCombinationsMap]);

    // Check if a specific attribute combination is sold out or has 0 quantity
    const isAttributeCombinationSoldOut = useCallback((attributeId, currentSelections = {}) => {
        // For parent variants
        if (product?.parent_id) {
            if (soldOutCombinations.size === 0) return false;

            if (soldOutCombinations.has(attributeId)) {
                return true;
            }

            const tempSelections = { ...currentSelections };
            const normalizedVariants = normalizeVariantData();
            const attributeVariant = normalizedVariants.find(v =>
                v.attributes.some(attr => attr.id === attributeId)
            );

            if (!attributeVariant) return false;

            tempSelections[attributeVariant.id] = attributeId;
            const selectionIds = Object.values(tempSelections).filter(id => id);

            if (selectionIds.length === 0) return false;

            const selectionString = selectionIds.sort().join(',');
            return soldOutCombinations.has(selectionString);
        }

        // For internal variants
        if (product?.isCombination) {
            const { combinationsMap } = internalCombinationsMap;

            const tempSelections = { ...currentSelections };
            const normalizedVariants = normalizeVariantData();
            const attributeVariant = normalizedVariants.find(v =>
                v.attributes.some(attr => attr.id === attributeId)
            );

            if (!attributeVariant) return false;

            tempSelections[attributeVariant.id] = attributeId;
            const selectionIds = Object.values(tempSelections).filter(id => id);

            if (selectionIds.length === 0) {
                // Check single attribute quantity
                const attrData = internalCombinationsMap.attributeCombinations?.get(attributeId);
                if (attrData && attrData.quantities.length > 0) {
                    const allZero = attrData.quantities.every(qty => qty === 0);
                    return allZero;
                }
                return false;
            }

            // Check combination quantity
            const selectionString = selectionIds.sort().join(',');
            const comboData = combinationsMap?.get(selectionString);
            if (comboData) {
                return comboData.qty == 0;
            }

            return false;
        }

        return false;
    }, [product, soldOutCombinations, normalizeVariantData, internalCombinationsMap]);


    const getSelectedVariantMainImages = useCallback((currentSelections = selectedVariants) => {
        if (!product?.product_variants) return [];

        const variantImages = [];
        const variantImageMap = new Map(); // Track which variant each image belongs to

        // Loop through each selected variant in order of selection (maintain selection order)
        Object.entries(currentSelections).forEach(([variantName, attributeId]) => {
            // Find the variant in product_variants
            const variant = product.product_variants.find(
                pv => pv.variant_name === variantName
            );

            if (variant?.variant_attributes) {
                // Find the selected attribute in variant_attributes
                const selectedAttribute = variant.variant_attributes.find(attr => {
                    // Try to find by attribute value
                    const attrInVariantAttr = product.variant_attribute_id?.find(
                        va => va._id === attributeId
                    );
                    if (attrInVariantAttr) {
                        return attr.attribute === attrInVariantAttr.attribute_value;
                    }
                    return false;
                });

                // If attribute has main_images, add them
                if (selectedAttribute?.main_images?.length > 0) {
                    // Remove any existing images from this variant first (replacement logic)
                    variantImages.forEach((img, index) => {
                        if (img.variantName === variantName) {
                            variantImages.splice(index, 1);
                        }
                    });

                    // Add new images for this variant
                    selectedAttribute.main_images.forEach((img, imgIndex) => {
                        if (img && typeof img === 'string' && img.trim() !== '') {
                            variantImages.push({
                                variantName,
                                attributeId,
                                attributeValue: selectedAttribute.attribute,
                                imageUrl: img,
                                type: 'variant',
                                variantType: variantName, // e.g., "Gemstones", "Metal Type"
                                isVariantImage: true,
                                priority: Object.keys(currentSelections).indexOf(variantName), // Order priority
                                imageIndex: imgIndex
                            });
                        }
                    });
                }
            }
        });

        // Sort by priority (most recently selected first)
        variantImages.sort((a, b) => a.priority - b.priority);
        return variantImages;
    }, [product, selectedVariants]);

    // Update selected variant images when selections change
    useEffect(() => {
        if (product?.product_variants) {
            const newVariantImages = getSelectedVariantMainImages();
            setSelectedVariantImages(newVariantImages);
        }
    }, [product, selectedVariants, getSelectedVariantMainImages]);

    const cleanupVariantImages = useCallback((previousSelections, newSelections) => {
        // Find which variants were removed or changed
        const removedVariants = [];
        const changedVariants = [];

        // Check for removed variants
        Object.keys(previousSelections).forEach(variantName => {
            if (!newSelections[variantName]) {
                removedVariants.push(variantName);
            }
        });

        // Check for changed variants
        Object.keys(newSelections).forEach(variantName => {
            if (previousSelections[variantName] &&
                previousSelections[variantName] !== newSelections[variantName]) {
                changedVariants.push(variantName);
            }
        });

        // The getSelectedVariantMainImages function will handle the removal
        // based on the new selections
    }, []);

    // Get price for an attribute or combination
    const getAttributePrice = useCallback((attributeId, currentSelections = {}) => {
        if (!product?.isCombination) return null;

        const { combinationsMap } = internalCombinationsMap;

        const tempSelections = { ...currentSelections };
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find(v =>
            v.attributes.some(attr => attr.id === attributeId)
        );

        if (!attributeVariant) return null;

        tempSelections[attributeVariant.id] = attributeId;
        const selectionIds = Object.values(tempSelections).filter(id => id);

        if (selectionIds.length === 0) {
            // Return price range for single attribute
            const ranges = getAttributeRanges(attributeId);
            return ranges?.priceRange ? {
                type: 'range',
                min: ranges.priceRange.min,
                max: ranges.priceRange.max,
                isIndependent: ranges.isIndependent
            } : null;
        }

        // Check combination price
        const selectionString = selectionIds.sort().join(',');
        const comboData = combinationsMap?.get(selectionString);

        if (comboData && comboData.price !== null) {
            return {
                type: 'fixed',
                value: comboData.price,
                isIndependent: selectionIds.length === 1
            };
        }

        // If no combination price found, return range
        const ranges = getAttributeRanges(attributeId);
        return ranges?.priceRange ? {
            type: 'range',
            min: ranges.priceRange.min,
            max: ranges.priceRange.max,
            isIndependent: ranges.isIndependent
        } : null;
    }, [product, normalizeVariantData, internalCombinationsMap, getAttributeRanges]);

    // Get quantity for an attribute or combination
    const getAttributeQuantity = useCallback((attributeId, currentSelections = {}) => {
        if (!product?.isCombination) return null;

        const { combinationsMap } = internalCombinationsMap;

        const tempSelections = { ...currentSelections };
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find(v =>
            v.attributes.some(attr => attr.id === attributeId)
        );

        if (!attributeVariant) return null;

        tempSelections[attributeVariant.id] = attributeId;
        const selectionIds = Object.values(tempSelections).filter(id => id);

        if (selectionIds.length === 0) {
            // Return quantity range for single attribute
            const ranges = getAttributeRanges(attributeId);
            return ranges?.quantityRange ? {
                type: 'range',
                min: ranges.quantityRange.min,
                max: ranges.quantityRange.max
            } : null;
        }

        // Check combination quantity
        const selectionString = selectionIds.sort().join(',');
        const comboData = combinationsMap?.get(selectionString);

        if (comboData && comboData.qty !== null) {
            return {
                type: 'fixed',
                value: comboData.qty
            };
        }

        // If no combination quantity found, return range
        const ranges = getAttributeRanges(attributeId);
        return ranges?.quantityRange ? {
            type: 'range',
            min: ranges.quantityRange.min,
            max: ranges.quantityRange.max
        } : null;
    }, [product, normalizeVariantData, internalCombinationsMap, getAttributeRanges]);


    // Get product image for hover based on current selections and hovered attribute
    const getHoverProductImage = useCallback((hoveredAttributeId) => {
        if (!product?.parent_id || !hoveredAttributeId) return null;

        const parentCombinations = extractParentCombinations();
        const currentSelections = { ...selectedVariants };

        const normalizedVariants = normalizeVariantData();
        const hoveredVariant = normalizedVariants.find(v =>
            v.attributes.some(attr => attr.id === hoveredAttributeId)
        );

        if (!hoveredVariant) return null;

        const tempSelections = { ...currentSelections };
        tempSelections[hoveredVariant.id] = hoveredAttributeId;

        const selectionIds = Object.values(tempSelections).filter(id => id);

        if (selectionIds.length === 0) return null;

        const selectionString = selectionIds.sort().join(',');

        const targetCombination = parentCombinations.find((combo) => {
            const comboString = combo.combination_ids.sort().join(',');
            return comboString === selectionString;
        });

        return targetCombination?.sku_first_image || null;
    }, [product, selectedVariants, extractParentCombinations, normalizeVariantData]);

    // Handle variant hover for image preview
    const handleVariantHover = useCallback((attributeId) => {
        if (!product?.parent_id) return;

        const hoverImage = getHoverProductImage(attributeId);
        setHoveredVariantImage(hoverImage);
    }, [product, getHoverProductImage]);

    // Handle variant hover out
    const handleVariantHoverOut = useCallback(() => {
        setHoveredVariantImage(null);
    }, []);

    // Handle variant selection
    const handleVariantChange = useCallback((variantId, value) => {
        const previousSelections = { ...selectedVariants };

        setSelectedVariants(prev => {
            const newSelected = { ...prev };

            const normalizedVariants = normalizeVariantData();
            const selectedVariant = normalizedVariants.find(v => v.id === variantId);

            if (selectedVariant?.type === 'parent') {
                const internalVariantIds = normalizedVariants
                    .filter(v => v.type === 'internal')
                    .map(v => v.id);

                internalVariantIds.forEach(internalId => {
                    delete newSelected[internalId];
                });
            }

            if (value === "") {
                delete newSelected[variantId];
            } else {
                newSelected[variantId] = value;
            }

            return newSelected;
        });

        // Clean up variant images if needed
        const newSelections = { ...selectedVariants };
        if (value === "") {
            delete newSelections[variantId];
        } else {
            newSelections[variantId] = value;
        }

        cleanupVariantImages(previousSelections, newSelections);
        setErrors(prev => ({ ...prev, [variantId]: "" }));
    }, [normalizeVariantData, selectedVariants, cleanupVariantImages]);

    // Validate variant selections
    const validateVariants = useCallback(() => {
        const errors = {};
        const normalizedVariants = normalizeVariantData();

        // Only validate parent variants for navigation
        const parentVariants = normalizedVariants.filter(v => v.type === 'parent');

        parentVariants.forEach(variant => {
            if (!selectedVariants[variant.id]) {
                errors[variant.id] = "Please select an option";
            }
        });

        setErrors(errors);
        return Object.keys(errors).length === 0;
    }, [selectedVariants, normalizeVariantData]);

    // Initialize internal combinations when product loads
    useEffect(() => {
        if (product?.isCombination && product?.combinationData) {
            const internalCombos = extractInternalCombinations();
            setInternalCombinationsMap(internalCombos);
        }
    }, [product, extractInternalCombinations]);

    // Update variant attributes with price/quantity data
    useEffect(() => {
        if (product?.isCombination) {
            const normalizedVariants = normalizeVariantData();
            const updatedVariants = normalizedVariants.map(variant => {
                if (variant.type === 'internal') {
                    const updatedAttributes = variant.attributes.map(attr => {
                        const ranges = getAttributeRanges(attr.id);
                        const priceData = getAttributePrice(attr.id, selectedVariants);
                        const quantityData = getAttributeQuantity(attr.id, selectedVariants);
                        const isSoldOut = isAttributeCombinationSoldOut(attr.id, selectedVariants);

                        return {
                            ...attr,
                            priceRange: ranges?.priceRange || null,
                            quantityRange: ranges?.quantityRange || null,
                            price: priceData?.type === 'fixed' ? priceData.value : null,
                            quantity: quantityData?.type === 'fixed' ? quantityData.value : null,
                            isSoldOut,
                            isIndependent: ranges?.isIndependent || false
                        };
                    });

                    return { ...variant, attributes: updatedAttributes };
                }
                return variant;
            });

            const updatedVariantAttributes = updatedVariants.flatMap(variant =>
                variant.attributes.map(attr => ({
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
                    isIndependent: attr.isIndependent
                }))
            );

            setFilterVariantAttributes(updatedVariantAttributes);
            setVariantAttributes(updatedVariantAttributes);
        }
    }, [product, selectedVariants, normalizeVariantData, getAttributeRanges, getAttributePrice, getAttributeQuantity, isAttributeCombinationSoldOut]);

    // Get parent variant attributes
    const getParentVariantAttributes = useCallback(() => {
        if (!product?.parent_id) return [];

        if (product.parent_id.product_variants && product.parent_id.product_variants.length > 0) {
            const allAttributes = [];
            product.parent_id.product_variants.forEach(variant => {
                if (variant.variant_attributes && Array.isArray(variant.variant_attributes)) {
                    variant.variant_attributes.forEach(attr => {
                        allAttributes.push({
                            _id: attr._id,
                            variant: variant.variant_name,
                            attribute_value: attr.attribute,
                            thumbnail: attr.thumbnail || '',
                            preview_image: attr.preview_image || '',
                            main_images: []
                        });
                    });
                }
            });
            return allAttributes;
        }

        if (product.parent_id.variant_attribute_id && Array.isArray(product.parent_id.variant_attribute_id)) {
            return product.parent_id.variant_attribute_id;
        }

        return [];
    }, [product]);

    // Initialize parent variants when product loads
    useEffect(() => {
        if (product?.parent_id) {
            const product_id = product?._id;
            const parentCombinations = extractParentCombinations();

            const currentCombination = parentCombinations.find(
                combo => combo.sku_product_id === product_id
            );

            if (currentCombination) {
                const initialSelections = {};
                const variantAttributes = getParentVariantAttributes();

                currentCombination.combination_ids.forEach((combId) => {
                    const variantAttr = variantAttributes.find(
                        (attr) => attr._id === combId
                    );

                    if (variantAttr) {
                        const variantIdentifier = product.parent_id.product_variants ?
                            variantAttr.variant : variantAttr.variant;

                        initialSelections[variantIdentifier] = variantAttr._id;
                    }
                });

                setSelectedVariants(initialSelections);
            }
        }
    }, [product, extractParentCombinations, getParentVariantAttributes]);



    // Update sold out combinations when product changes
    useEffect(() => {
        if (product?.parentCombinationData) {
            const soldOutCombos = getSoldOutCombinations();
            setSoldOutCombinations(soldOutCombos);
        }
    }, [product, getSoldOutCombinations]);

    // Handle navigation when parent variants change
    useEffect(() => {
        if (product?.parent_id && Object.keys(selectedVariants).length > 0) {
            handleParentVariantNavigation();
        }
    }, [selectedVariants, product]);

    const getCurrentCombinationData = useCallback(() => {

        if (!product?.isCombination || !selectedVariants || Object.keys(selectedVariants).length === 0) {
            return { price: null, quantity: null, priceRange: null, quantityRange: null };
        }

        // Get variant names and their selected attribute values
        const variantSelections = {};

        Object.entries(selectedVariants).forEach(([variantName, attrId]) => {
            const attr = product.variant_attribute_id?.find(a => a._id === attrId);
            if (attr) {
                // Find which variant this attribute belongs to
                const variant = product.variant_id?.find(v => v._id === attr.variant);
                if (variant) {
                    const actualVariantName = variant.variant_name;
                    variantSelections[actualVariantName] = attr.attribute_value;
                }
            }
        });

        if (Object.keys(variantSelections).length === 0) {
            return { price: null, quantity: null, priceRange: null, quantityRange: null };
        }

        // Get values from selections
        const ringSizeValue = variantSelections["Ring Size"];
        const gemstoneValue = variantSelections["Gemstones"];
        const metalTypeValue = variantSelections["Metal Type"];

        let ringSizeQty = null;
        let gemstoneMetalPrice = null;
        let gemstoneMetalQty = null;
        let foundRingSize = false;
        let foundGemstoneMetal = false;

        // Search through combinationData
        product.combinationData?.forEach((comboGroup) => {
            if (comboGroup.combinations && Array.isArray(comboGroup.combinations)) {
                comboGroup.combinations.forEach(combo => {
                    // Check for Ring Size combinations (single value)
                    if (combo.name1 === "Ring Size" && combo.value1) {
                        if (combo.value1 === ringSizeValue) {
                            ringSizeQty = combo.qty && combo.qty !== "" ? parseInt(combo.qty, 10) : null;
                            foundRingSize = true;
                        }
                    }

                    // Check for Gemstones + Metal Type combinations (pair values)
                    if (combo.name1 === "Gemstones" && combo.name2 === "Metal Type") {
                        if (combo.value1 === gemstoneValue && combo.value2 === metalTypeValue) {
                            gemstoneMetalPrice = combo.price && combo.price !== "" ? parseFloat(combo.price) : null;
                            gemstoneMetalQty = combo.qty && combo.qty !== "" ? parseInt(combo.qty, 10) : null;
                            foundGemstoneMetal = true;
                        }
                    }
                });
            }
        });

        // Calculate final quantity (take the minimum of available quantities)
        let finalQuantity = null;
        if (ringSizeQty !== null && gemstoneMetalQty !== null) {
            finalQuantity = Math.min(ringSizeQty, gemstoneMetalQty);
        } else if (ringSizeQty !== null) {
            finalQuantity = ringSizeQty;
        } else if (gemstoneMetalQty !== null) {
            finalQuantity = gemstoneMetalQty;
        }

        // If we found both combinations
        if (foundRingSize && foundGemstoneMetal) {
            return {
                price: gemstoneMetalPrice,
                quantity: finalQuantity,
                priceRange: null,
                quantityRange: null,
                isVisible: true
            };
        }

        // If we only found Gemstones+Metal combination
        if (foundGemstoneMetal) {
            return {
                price: gemstoneMetalPrice,
                quantity: gemstoneMetalQty,
                priceRange: null,
                quantityRange: null,
                isVisible: true
            };
        }

        // If we only found Ring Size
        if (foundRingSize) {
            return {
                price: null,
                quantity: ringSizeQty,
                priceRange: null,
                quantityRange: null,
                isVisible: true
            };
        }
        return { price: null, quantity: null, priceRange: null, quantityRange: null };
    }, [product, selectedVariants]);

    const currentCombinationData = useMemo(() => {
        return getCurrentCombinationData();
    }, [getCurrentCombinationData]);

    const handleParentVariantNavigation = useCallback(() => {
        if (!product?.parent_id) return;

        const currentSelections = Object.values(selectedVariants);

        if (currentSelections.length === 0 || currentSelections.some(sel => !sel)) {
            return;
        }

        const parentCombinations = extractParentCombinations();

        const selectionString = currentSelections.sort().join(',');

        const targetCombination = parentCombinations.find((combo) => {
            const comboString = combo.combination_ids.sort().join(',');
            return comboString === selectionString;
        });

        if (targetCombination &&
            targetCombination.sku_product_id &&
            targetCombination.sku_product_id !== product._id &&
            !targetCombination.sold_out) {

            router.push(`/products/${targetCombination.sku_product_id}`);
        }
    }, [selectedVariants, product, router, extractParentCombinations]);

    const calculateAttributeData = useCallback(
        (attributeId, currentSelections = selectedVariants) => {
            if (!product?.isCombination) {
                return {
                    price: null,
                    quantity: null,
                    priceRange: null,
                    quantityRange: null,
                    isSoldOut: false,
                    isIndependent: false
                };
            }

            const { combinationsMap, attributeCombinations } = internalCombinationsMap;
            const normalizedVariants = normalizeVariantData();

            const attributeVariant = normalizedVariants.find(v =>
                v.attributes.some(a => a.id === attributeId)
            );

            if (!attributeVariant) {
                return {
                    price: null,
                    quantity: null,
                    priceRange: null,
                    quantityRange: null,
                    isSoldOut: false,
                    isIndependent: false
                };
            }

            const attrMeta = attributeCombinations.get(attributeId);
            const isIndependent = attrMeta?.isIndependent || false;

            const selectedAttrIds = Object.values(currentSelections);
            const isThisAttributeSelected = selectedAttrIds.includes(attributeId);

            // ─────────────────────────────────────
            // Collect ALL combos that include this attribute
            // ─────────────────────────────────────
            const relatedCombos = [];
            combinationsMap.forEach((combo, key) => {
                const ids = key.split(',').filter(Boolean);
                if (ids.includes(attributeId)) {
                    relatedCombos.push({ ids, combo });
                }
            });

            // Find which OTHER attributes from this group are selected
            const selectedFromSameGroup = new Set();
            relatedCombos.forEach(({ ids }) => {
                ids.forEach(id => {
                    if (selectedAttrIds.includes(id)) {
                        selectedFromSameGroup.add(id);
                    }
                });
            });

            const selectedCount = selectedFromSameGroup.size;

            // ─────────────────────────────────────
            // 1️⃣ Independent pricing (not your case here)
            // ─────────────────────────────────────
            if (isIndependent) {
                const single = relatedCombos.find(c => c.ids.length === 1);
                if (single) {
                    return {
                        price: single.combo.price,
                        quantity: single.combo.qty,
                        priceRange: null,
                        quantityRange: null,
                        isSoldOut: single.combo.qty === 0,
                        isIndependent: true
                    };
                }
            }

            // ─────────────────────────────────────
            // 2️⃣ NOTHING selected → RANGE
            // ─────────────────────────────────────
            if (selectedCount === 0) {
                const prices = relatedCombos
                    .map(c => c.combo.price)
                    .filter(p => p !== null);

                return prices.length
                    ? {
                        price: null,
                        quantity: null,
                        priceRange: {
                            min: Math.min(...prices),
                            max: Math.max(...prices)
                        },
                        quantityRange: null,
                        isSoldOut: prices.every(p => p === 0),
                        isIndependent: false
                    }
                    : {
                        price: null,
                        quantity: null,
                        priceRange: null,
                        quantityRange: null,
                        isSoldOut: false,
                        isIndependent: false
                    };
            }

            // ─────────────────────────────────────
            // 3️⃣ ONE OR MORE selected
            // Selected attribute → NO price
            // Other attributes → FIXED price
            // ─────────────────────────────────────
            if (isThisAttributeSelected) {
                return {
                    price: null,
                    quantity: null,
                    priceRange: null,
                    quantityRange: null,
                    isSoldOut: false,
                    isIndependent: false
                };
            }

            const matchingCombo = relatedCombos.find(({ ids }) =>
                [...selectedFromSameGroup].every(id => ids.includes(id))
            );

            if (matchingCombo) {
                return {
                    price: matchingCombo.combo.price,
                    quantity: matchingCombo.combo.qty,
                    priceRange: null,
                    quantityRange: null,
                    isSoldOut: matchingCombo.combo.qty === 0,
                    isIndependent: false
                };
            }

            // ─────────────────────────────────────
            // Fallback
            // ─────────────────────────────────────
            return {
                price: null,
                quantity: null,
                priceRange: null,
                quantityRange: null,
                isSoldOut: false,
                isIndependent: false
            };
        },
        [product, selectedVariants, internalCombinationsMap, normalizeVariantData]
    );

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
        normalizeVariantData
    };
};
