import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export const useProductVariants = (product) => {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [variantAttributes, setVariantAttributes] = useState([]);
    const [filterVariantAttributes, setFilterVariantAttributes] = useState([]);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // Extract parent combinations (for navigation) and internal combinations (for pricing)
    const extractParentCombinations = useCallback(() => {
        if (!product?.combinationData) return [];

        const parentCombinations = [];

        // Look for combinationData that has sku_product_id and combination_id (for parent variants)
        product.parentCombinationData.forEach(combo => {
            if (combo.sku_product_id && combo.combination_id) {
                parentCombinations.push({
                    sku_product_id: combo.sku_product_id,
                    combination_id: combo.combination_id,
                    combination_ids: combo.combination_id.split(',').filter(id => id.trim() !== '')
                });
            }
        });

        console.log("Parent combinations for navigation:", parentCombinations);
        return parentCombinations;
    }, [product]);

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

    // Normalize all variant data into a consistent structure
    const normalizeVariantData = useCallback(() => {
        if (!product) return [];

        const allVariants = [];

        // Handle parent product variants - ONLY if product has parent_id
        if (product?.parent_id) {
            product.parent_id.variant_id?.forEach(variant => {
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
                            thumbnail: attr.thumbnail || ''
                        })) || []
                });
            });
        }

        // Handle internal variants - ONLY if product has variations_data
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

                currentCombination.combination_ids.forEach((combId) => {
                    const variantAttr = product.parent_id.variant_attribute_id.find(
                        (attr) => attr._id === combId
                    );

                    if (variantAttr) {
                        initialSelections[variantAttr.variant] = variantAttr._id;
                        console.log(`Setting parent variant ${variantAttr.variant} -> ${variantAttr._id}`);
                    }
                });

                console.log("Initializing parent variants:", initialSelections);
                setSelectedVariants(initialSelections);
            } else {
                console.log("No parent combination found for current product:", product_id);
                console.log("Available parent combinations:", parentCombinations);
            }
        }
    }, [product, extractParentCombinations]);

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

        // Only navigate if we found a different product
        if (targetCombination && targetCombination.sku_product_id && targetCombination.sku_product_id !== product._id) {
            console.log(`NAVIGATING from ${product._id} to ${targetCombination.sku_product_id}`);

            // Use Next.js router for client-side navigation
            router.push(`/products?id=${targetCombination.sku_product_id}`);
        } else if (!targetCombination) {
            console.log("No matching parent combination found for selections:", selectionString);
            console.log("Available parent combinations:", parentCombinations);
        }
    }, [selectedVariants, product, router, extractParentCombinations]);

    // Debug effect to log data
    useEffect(() => {
        console.log("=== VARIANT DEBUG ===");
        console.log("Product ID:", product?._id);
        console.log("Has parent:", !!product?.parent_id);
        console.log("Selected variants:", selectedVariants);

        const parentCombinations = extractParentCombinations();
        const internalCombinations = extractInternalCombinations();

        console.log("Parent combinations:", parentCombinations);
        console.log("Internal combinations:", internalCombinations);
        console.log("=====================");
    }, [product, selectedVariants, extractParentCombinations, extractInternalCombinations]);

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
        handleVariantChange,
        validateVariants,
        normalizeVariantData
    };
};
