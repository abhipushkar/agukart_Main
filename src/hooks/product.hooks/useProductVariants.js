import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export const useProductVariants = (product) => {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [variantAttributes, setVariantAttributes] = useState([]);
    const [filterVariantAttributes, setFilterVariantAttributes] = useState([]);
    const [errors, setErrors] = useState({});
    const [hoveredVariantImage, setHoveredVariantImage] = useState(null);
    const [soldOutCombinations, setSoldOutCombinations] = useState(new Set());
    const router = useRouter();

    // Normalize all variant data into a consistent structure - MOVED TO TOP
    const normalizeVariantData = useCallback(() => {
        if (!product) return [];

        const allVariants = [];

        // Handle parent product variants - ONLY if product has parent_id
        if (product?.parent_id) {
            // Try new structure first (product_variants)
            if (product.parent_id.product_variants && product.parent_id.product_variants.length > 0) {
                product.parent_id.product_variants.forEach(variant => {
                    allVariants.push({
                        type: 'parent',
                        id: variant.variant_name, // Using variant_name as identifier
                        name: variant.variant_name,
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

        // Handle internal variants - ONLY if product has product_variants
        if (product?.product_variants?.length > 0) {
            product.product_variants.forEach(variant => {
                allVariants.push({
                    type: 'internal',
                    id: variant.variant_name,
                    name: variant.variant_name,
                    attributes: variant.variant_attributes?.map(attr => ({
                        id: attr.attribute,
                        value: attr.attribute,
                        images: attr.main_images || [],
                        thumbnail: attr.thumbnail || '',
                        preview_image: attr.preview_image || ''
                    })) || []
                });
            });
        }

        console.log("Normalized Variants:", allVariants);
        return allVariants;
    }, [product]);

    // Extract parent combinations (for navigation and hover images)
    const extractParentCombinations = useCallback(() => {
        if (!product?.parentCombinationData) return [];

        const parentCombinations = [];

        product.parentCombinationData.forEach(combo => {
            if (combo.sku_product_id && combo.combination_id) {
                parentCombinations.push({
                    _id: combo._id,
                    sku_product_id: combo.sku_product_id,
                    combination_id: combo.combination_id,
                    combination_ids: combo.combination_id.split(',').filter(id => id.trim() !== ''),
                    sku_first_image: combo.sku_first_image || null,
                    sold_out: combo.sold_out || false
                });
            }
        });

        console.log("Parent combinations for navigation:", parentCombinations);
        return parentCombinations;
    }, [product]);

    // Get sold out combinations
    const getSoldOutCombinations = useCallback(() => {
        const parentCombinations = extractParentCombinations();
        const soldOutSet = new Set();

        parentCombinations.forEach(combo => {
            if (combo.sold_out) {
                // Store the combination string as key for easy lookup
                const comboString = combo.combination_ids.sort().join(',');
                soldOutSet.add(comboString);
            }
        });

        console.log("Sold out combinations:", soldOutSet);
        return soldOutSet;
    }, [extractParentCombinations]);

    const extractInternalCombinations = useCallback(() => {
        if (!product?.combinationData) return [];

        const internalCombinations = [];

        // Look for combinationData that has combinations array (for internal variants)
        product.combinationData.forEach(comboGroup => {
            if (comboGroup.combinations && Array.isArray(comboGroup.combinations)) {
                comboGroup.combinations.forEach(combo => {
                    if (combo.combIds && Array.isArray(combo.combIds)) {
                        internalCombinations.push({
                            combIds: combo.combIds,
                            sku_product_id: combo.sku_product_id || product._id,
                            price: combo.price,
                            qty: combo.qty,
                            isVisible: combo.isVisible
                        });
                    }
                });
            }
        });

        console.log("Internal combinations for pricing:", internalCombinations);
        return internalCombinations;
    }, [product]);

    // Get variant attributes from parent product - handles both old and new structure
    const getParentVariantAttributes = useCallback(() => {
        if (!product?.parent_id) return [];

        // Try new structure first (product_variants)
        if (product.parent_id.product_variants && product.parent_id.product_variants.length > 0) {
            const allAttributes = [];
            product.parent_id.product_variants.forEach(variant => {
                if (variant.variant_attributes && Array.isArray(variant.variant_attributes)) {
                    variant.variant_attributes.forEach(attr => {
                        allAttributes.push({
                            _id: attr._id,
                            variant: variant.variant_name, // Using variant_name as identifier
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

        // Fallback to old structure (variant_attribute_id)
        if (product.parent_id.variant_attribute_id && Array.isArray(product.parent_id.variant_attribute_id)) {
            return product.parent_id.variant_attribute_id;
        }

        return [];
    }, [product]);

    // Check if a specific attribute combination is sold out
    const isAttributeCombinationSoldOut = useCallback((attributeId, currentSelections = {}) => {
        if (!product?.parent_id) return false;

        const tempSelections = { ...currentSelections };
        const normalizedVariants = normalizeVariantData();

        // Find which variant this attribute belongs to
        const attributeVariant = normalizedVariants.find(v =>
            v.attributes.some(attr => attr.id === attributeId)
        );

        if (!attributeVariant) return false;

        // Replace/add the current selection for this variant with the attribute being checked
        tempSelections[attributeVariant.id] = attributeId;

        // Get all selected attribute IDs
        const selectionIds = Object.values(tempSelections).filter(id => id);

        if (selectionIds.length === 0) return false;

        // Create sorted string of selected IDs
        const selectionString = selectionIds.sort().join(',');

        // Check if this combination is in the sold out set
        return soldOutCombinations.has(selectionString);
    }, [product, normalizeVariantData, soldOutCombinations]);

    // Get product image for hover based on current selections and hovered attribute
    const getHoverProductImage = useCallback((hoveredAttributeId) => {
        if (!product?.parent_id || !hoveredAttributeId) return null;

        const parentCombinations = extractParentCombinations();
        const currentSelections = { ...selectedVariants };

        // Find which variant type we're hovering over
        const normalizedVariants = normalizeVariantData();
        const hoveredVariant = normalizedVariants.find(v =>
            v.attributes.some(attr => attr.id === hoveredAttributeId)
        );

        if (!hoveredVariant) return null;

        // Replace the current selection for the hovered variant with the hovered attribute
        const tempSelections = { ...currentSelections };
        tempSelections[hoveredVariant.id] = hoveredAttributeId;

        // Get all selected attribute IDs
        const selectionIds = Object.values(tempSelections).filter(id => id);

        if (selectionIds.length === 0) return null;

        // Create sorted string of selected IDs
        const selectionString = selectionIds.sort().join(',');

        // Find matching parent combination
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
        setSelectedVariants(prev => {
            const newSelected = { ...prev };

            // Check if this is a parent variant selection
            const normalizedVariants = normalizeVariantData();
            const selectedVariant = normalizedVariants.find(v => v.id === variantId);

            if (selectedVariant?.type === 'parent') {
                // When selecting a parent variant, clear all internal variants
                const internalVariantIds = normalizedVariants
                    .filter(v => v.type === 'internal')
                    .map(v => v.id);

                // Remove all internal variants from selection
                internalVariantIds.forEach(internalId => {
                    delete newSelected[internalId];
                });
            }

            if (value === "") {
                delete newSelected[variantId];
            } else {
                newSelected[variantId] = value;
            }

            console.log("Selected Variants Updated:", newSelected);
            return newSelected;
        });
        setErrors(prev => ({ ...prev, [variantId]: "" }));
    }, [normalizeVariantData]);

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

    // Initialize parent variants when product loads
    useEffect(() => {
        if (product?.parent_id) {
            const product_id = product?._id;
            const parentCombinations = extractParentCombinations();

            // Find the combination for current product
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
                        // For new structure, use variant_name as identifier
                        // For old structure, use variant ID as identifier
                        const variantIdentifier = product.parent_id.product_variants ?
                            variantAttr.variant : variantAttr.variant;

                        initialSelections[variantIdentifier] = variantAttr._id;
                        console.log(`Setting parent variant ${variantIdentifier} -> ${variantAttr._id}`);
                    }
                });

                console.log("Initializing parent variants:", initialSelections);
                setSelectedVariants(initialSelections);
            } else {
                console.log("No parent combination found for current product:", product_id);
                console.log("Available parent combinations:", parentCombinations);
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

    const handleParentVariantNavigation = useCallback(() => {
        if (!product?.parent_id) return;

        const currentSelections = Object.values(selectedVariants);

        // Check if we have valid selections
        if (currentSelections.length === 0 || currentSelections.some(sel => !sel)) {
            console.log("Invalid selections, skipping navigation");
            return;
        }

        const parentCombinations = extractParentCombinations();

        // Create sorted string of selected IDs
        const selectionString = currentSelections.sort().join(',');
        console.log("Looking for parent combination matching:", selectionString);

        // Find matching parent combination
        const targetCombination = parentCombinations.find((combo) => {
            const comboString = combo.combination_ids.sort().join(',');
            return comboString === selectionString;
        });

        console.log("Target parent combination found:", targetCombination);

        // Only navigate if we found a different product and it's not sold out
        if (targetCombination &&
            targetCombination.sku_product_id &&
            targetCombination.sku_product_id !== product._id &&
            !targetCombination.sold_out) {

            console.log(`NAVIGATING from ${product._id} to ${targetCombination.sku_product_id}`);

            // Use Next.js router for client-side navigation
            router.push(`/products?id=${targetCombination.sku_product_id}`);
        } else if (!targetCombination) {
            console.log("No matching parent combination found for selections:", selectionString);
            console.log("Available parent combinations:", parentCombinations);
        } else if (targetCombination.sold_out) {
            console.log("Target combination is sold out, skipping navigation");
        }
    }, [selectedVariants, product, router, extractParentCombinations]);

    // Debug effect to log data
    useEffect(() => {
        console.log("=== VARIANT DEBUG ===");
        console.log("Product ID:", product?._id);
        console.log("Has parent:", !!product?.parent_id);
        console.log("Selected variants:", selectedVariants);
        console.log("Hovered variant image:", hoveredVariantImage);
        console.log("Sold out combinations:", soldOutCombinations);

        const parentCombinations = extractParentCombinations();
        const internalCombinations = extractInternalCombinations();

        console.log("Parent combinations:", parentCombinations);
        console.log("Internal combinations:", internalCombinations);
        console.log("=====================");
    }, [product, selectedVariants, hoveredVariantImage, soldOutCombinations, extractParentCombinations, extractInternalCombinations]);

    // Your existing combination logic for filtering (using internal combinations)
    useEffect(() => {
        if (product?.isCombination) {
            const internalCombinations = extractInternalCombinations();

            const variant_attributes = product?.variant_attribute_id;
            const updatedVariantAttributes = variant_attributes?.map((variant) => {
                const variantCombinations = internalCombinations?.filter((combination) =>
                    combination.combIds?.includes(variant._id)
                );
                const prices = variantCombinations
                    ?.filter((combination) => combination.price != "")
                    ?.map((combination) => combination.price) || [];
                const quantities = variantCombinations
                    ?.filter((combination) => combination.qty != "")
                    ?.map((combination) => +combination.qty) || [];
                const isVisible = variantCombinations?.map(
                    (combination) => combination.isVisible
                ) || [];

                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;
                const minQuantity = quantities.length ? Math.min(...quantities) : null;
                const maxQuantity = quantities.length ? Math.max(...quantities) : null;
                const visibleArray = isVisible.length ? isVisible : [];

                return {
                    ...variant,
                    minPrice,
                    maxPrice,
                    minQuantity,
                    maxQuantity,
                    isCheckedQuantity: variantCombinations?.[0]?.isCheckedQuantity,
                    isCheckedPrice: variantCombinations?.[0]?.isCheckedPrice,
                    visibleArray,
                };
            });

            setVariantAttributes(updatedVariantAttributes || []);
            setFilterVariantAttributes(updatedVariantAttributes || []);
        }
    }, [product, extractInternalCombinations]);

    // Filter variant attributes based on selections (using internal combinations)
    useEffect(() => {
        if (product?.isCombination) {
            const internalCombinations = extractInternalCombinations();

            let updatedVariantAttributes = variantAttributes.map((variant) => {
                const selectedVariantAttributesIds = Object.values(selectedVariants);
                const selectedVariantCombination = internalCombinations?.filter(
                    (combination) =>
                        [selectedVariantAttributesIds[0]].every((selectedId) =>
                            combination.combIds?.includes(selectedId)
                        ) && combination.combIds?.includes(variant._id)
                );

                const prices = selectedVariantCombination
                    ?.filter((combination) => combination.price != "")
                    ?.map((combination) => combination.price) || [];
                const quantities = selectedVariantCombination
                    ?.filter((combination) => combination.qty != "")
                    ?.map((combination) => +combination.qty) || [];
                const isVisible = selectedVariantCombination?.map(
                    (combination) => combination.isVisible
                ) || [];

                const minPrice = prices.length ? Math.min(...prices) : variant.minPrice;
                const maxPrice = prices.length ? Math.max(...prices) : variant.maxPrice;
                const minQuantity = quantities.length
                    ? Math.min(...quantities)
                    : variant.minQuantity;
                const maxQuantity = quantities.length
                    ? Math.max(...quantities)
                    : variant.maxQuantity;
                const visibleArray = isVisible.length
                    ? isVisible
                    : variant.visibleArray;

                return {
                    ...variant,
                    minPrice,
                    maxPrice,
                    minQuantity,
                    maxQuantity,
                    visibleArray,
                };
            });

            if (Object.values(selectedVariants).length > 1) {
                updatedVariantAttributes = updatedVariantAttributes.map((variant) => {
                    const selectedVariantAttributesIds = Object.values(selectedVariants);
                    const selectedVariantCombination = internalCombinations?.filter(
                        (combination) =>
                            [selectedVariantAttributesIds[1]].every((selectedId) =>
                                combination.combIds?.includes(selectedId)
                            ) && combination.combIds?.includes(variant._id)
                    );

                    const prices = selectedVariantCombination
                        ?.filter((combination) => combination.price != "")
                        ?.map((combination) => combination.price) || [];
                    const quantities = selectedVariantCombination
                        ?.filter((combination) => combination.qty != "")
                        ?.map((combination) => +combination.qty) || [];
                    const isVisible = selectedVariantCombination?.map(
                        (combination) => combination.isVisible
                    ) || [];

                    const minPrice = prices.length
                        ? Math.min(...prices)
                        : variant.minPrice;
                    const maxPrice = prices.length
                        ? Math.max(...prices)
                        : variant.maxPrice;
                    const minQuantity = quantities.length
                        ? Math.min(...quantities)
                        : variant.minQuantity;
                    const maxQuantity = quantities.length
                        ? Math.max(...quantities)
                        : variant.maxQuantity;
                    const visibleArray = isVisible.length
                        ? isVisible
                        : variant.visibleArray;

                    return {
                        ...variant,
                        minPrice,
                        maxPrice,
                        minQuantity,
                        maxQuantity,
                        visibleArray,
                    };
                });
            }

            setFilterVariantAttributes(updatedVariantAttributes);
        }
    }, [selectedVariants, product, variantAttributes, extractInternalCombinations]);

    return {
        selectedVariants,
        variantAttributes,
        filterVariantAttributes,
        errors,
        hoveredVariantImage,
        soldOutCombinations,
        handleVariantChange,
        handleVariantHover,
        handleVariantHoverOut,
        isAttributeCombinationSoldOut,
        validateVariants,
        normalizeVariantData
    };
};
