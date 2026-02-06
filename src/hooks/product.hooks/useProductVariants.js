import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";

export const useProductVariants = (product) => {
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
  const router = useRouter();

  // Get controlling variants from form_values
  const getControllingVariants = useCallback(
    (field) => {
      if (!product?.form_values?.[field]) return [];

      const value = product.form_values[field];
      if (!value || typeof value !== "string") return [];

      // Split by " and " to get variant names
      return value.split(" and ").filter((name) => name.trim() !== "");
    },
    [product],
  );

  // Get controlling variant names for price and quantity
  const priceControllingVariants = useMemo(
    () => getControllingVariants("prices"),
    [getControllingVariants],
  );
  const quantityControllingVariants = useMemo(
    () => getControllingVariants("quantities"),
    [getControllingVariants],
  );

  // Check if combination logic should be applied for price
  const shouldUseCombinationPrice = useMemo(() => {
    return (
      product?.form_values?.isCheckedPrice === true &&
      (product?.sale_price === 0 || product?.sale_price === "0")
    );
  }, [product]);

  // Check if combination logic should be applied for quantity
  const shouldUseCombinationQuantity = useMemo(() => {
    return (
      product?.form_values?.isCheckedQuantity === true &&
      (product?.qty === 0 || product?.qty === "0")
    );
  }, [product]);

  // Normalize all variant data into a consistent structure
  const normalizeVariantData = useCallback(() => {
    if (!product) return [];

    const allVariants = [];

    // Handle parent product variants - ONLY if product has parent_id
    if (product?.parent_id) {
      // Try new structure first (product_variants)
      if (
        product.parent_id.product_variants &&
        product.parent_id.product_variants.length > 0
      ) {
        product.parent_id.product_variants.forEach((variant) => {
          // Find corresponding variant info from variant_id array for guide data
          const guideData = variant?.guide;

          allVariants.push({
            type: "parent",
            id: variant.variant_name,
            name: variant.variant_name,
            guide_name: guideData?.guide_name || "",
            guide_file: guideData?.guide_file || "",
            guide_type: guideData?.guide_type || "",
            guide_description: guideData?.guide_description || "",
            attributes:
              variant.variant_attributes?.map((attr) => ({
                id: attr._id,
                value: attr.attribute,
                images: attr.main_images || [],
                thumbnail: attr.thumbnail || "",
                preview_image: attr.preview_image || "",
              })) || [],
          });
        });
      }
      // Fallback to old structure (variant_id)
      else if (
        product.parent_id.variant_id &&
        Array.isArray(product.parent_id.variant_id)
      ) {
        product.parent_id.variant_id.forEach((variant) => {
          allVariants.push({
            type: "parent",
            id: variant._id,
            name: variant.variant_name,
            guide_name: variant.guide_name || "",
            guide_file: variant.guide_file || "",
            guide_type: variant.guide_type || "",
            guide_description: variant.guide_description || "",
            attributes:
              product.parent_id.variant_attribute_id
                ?.filter((attr) => attr.variant === variant._id)
                ?.map((attr) => ({
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

    // Handle internal variants - ONLY show variants that are in product_variants
    if (product?.product_variants?.length > 0) {
      product.product_variants.forEach((variant) => {
        // Find corresponding variant info from variant_id array for guide data
        const guideData =
          variant?.guide && variant?.guide.length > 0
            ? variant?.guide[0]
            : null;

        const variantInfo = product.variant_id?.find(
          (v) =>
            v.variant_name === variant.variant_name ||
            v._id === variant.variant_name,
        );

        // Get variant attributes ONLY from variant_attribute_id that belong to this variant
        const variantInVariantId = product.variant_id?.find(
          (v) => v.variant_name === variant.variant_name,
        );

        if (!variantInVariantId) {
          return; // Skip this variant
        }

        // Filter variant_attribute_id to get only attributes for this specific variant
        const variantAttributes =
          product.variant_attribute_id?.filter(
            (attr) => attr.variant === variantInVariantId._id,
          ) || [];

        const orderMap = new Map(
          variant.variant_attributes.map((attr, index) => [
            attr.attribute,
            index
          ])
        );
        // Create an array with fixed length
        const orderedVariantAttributes = new Array(variant.variant_attributes.length);
        // Place each item into its exact position
        variantAttributes.forEach(item => {
          const index = orderMap.get(item.attribute_value);
          if (index !== undefined) {
            orderedVariantAttributes[index] = item; 
          }
        });
        // Find attribute data from product_variants structure
        const filteredAttributes = orderedVariantAttributes.map(attr => {
          return {
            id: attr._id,
            value: attr.attribute_value,
            images: attr.main_images || [],
            thumbnail: attr.thumbnail || "",
            preview_image: attr?.edit_preview_image || attr?.preview_image || "",
            edit_preview_image: attr?.edit_preview_image || "",
            price: null,
            quantity: null,
            priceRange: null,
            quantityRange: null,
            isSoldOut: false,
          }
        });

        if (filteredAttributes.length > 0) {
          allVariants.push({
            type: "internal",
            id: variant.variant_name,
            name: variant.variant_name,
            guide_name: guideData?.guide_name || "",
            guide_file: guideData?.guide_file || "",
            guide_type: guideData?.guide_type || "",
            guide_description: guideData?.guide_description || "",
            attributes: filteredAttributes,
          });
        } else {
          console.error(
            `No filtered attributes for ${variant.variant_name}, skipping variant`,
          );
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

    product.parentCombinationData.forEach((combo) => {
      if (combo.combination_id) {
        const combinationIds = combo.combination_id
          .toString()
          .split(",")
          .filter((id) => id.trim() !== "");

        parentCombinations.push({
          _id: combo._id,
          sku_product_id: combo.sku_product_id,
          combination_id: combo.combination_id,
          combination_ids: combinationIds,
          sku_first_image: combo.sku_first_image || null,
          sold_out: combo.sold_out || false,
        });
      }
    });

    return parentCombinations;
  }, [product]);

  // Get sold out combinations for parent variants
  const getSoldOutCombinations = useCallback(() => {
    const parentCombinations = extractParentCombinations();
    const soldOutSet = new Set();

    parentCombinations.forEach((combo) => {
      const isSoldOut =
        combo.sold_out === true ||
        combo.sold_out === "true" ||
        combo.sold_out === 1;

      if (isSoldOut && combo.combination_ids.length > 0) {
        const comboString = combo.combination_ids.sort().join(",");
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
    if (!product?.combinationData)
      return { combinationsMap: new Map(), attributeCombinations: new Map() };

    const combinationsMap = new Map();
    const attributeCombinations = new Map();

    product.combinationData.forEach((comboGroup) => {
      if (comboGroup.combinations && Array.isArray(comboGroup.combinations)) {
        comboGroup.combinations.forEach((combo) => {
          const attributeIds = [];
          const attributes = [];

          // Handle value1 and name1
          if (combo.value1 && combo.name1) {
            const variant = product.variant_id?.find(
              (v) => v.variant_name === combo.name1,
            );
            if (variant) {
              const attribute = product.variant_attribute_id?.find(
                (attr) =>
                  attr.variant === variant._id &&
                  attr.attribute_value === combo.value1,
              );
              if (attribute) {
                attributeIds.push(attribute._id);
                attributes.push({
                  id: attribute._id,
                  variant: combo.name1,
                  value: combo.value1,
                });
              }
            }
          }

          // Handle value2 and name2 (for 2-attribute combinations)
          if (combo.value2 && combo.name2) {
            const variant = product.variant_id?.find(
              (v) => v.variant_name === combo.name2,
            );
            if (variant) {
              const attribute = product.variant_attribute_id?.find(
                (attr) =>
                  attr.variant === variant._id &&
                  attr.attribute_value === combo.value2,
              );
              if (attribute) {
                attributeIds.push(attribute._id);
                attributes.push({
                  id: attribute._id,
                  variant: combo.name2,
                  value: combo.value2,
                });
              }
            }
          }

          if (attributeIds.length > 0) {
            const sortedIds = [...attributeIds].sort().join(",");

            // Store combination data - ignore empty strings
            const price =
              combo.price && combo.price !== ""
                ? parseFloat(combo.price)
                : null;
            const qty =
              combo.qty && combo.qty !== "" ? parseInt(combo.qty, 10) : null;
            const isVisible =
              combo.isVisible === true || combo.isVisible === "true";

            combinationsMap.set(sortedIds, {
              price: price,
              qty: qty,
              isVisible: isVisible,
              isCheckedPrice: combo.isCheckedPrice === "true",
              isCheckedQuantity: combo.isCheckedQuantity === "true",
              attributes: attributes,
              comboIds: attributeIds,
            });

            // Also store for individual attributes to calculate ranges
            // BUT ONLY IF COMBINATION IS VISIBLE
            if (isVisible) {
              attributeIds.forEach((attrId, idx) => {
                if (!attributeCombinations.has(attrId)) {
                  attributeCombinations.set(attrId, {
                    prices: new Set(),
                    quantities: new Set(),
                    isVisible: new Set(),
                    isIndependent: false,
                  });
                }

                const attrData = attributeCombinations.get(attrId);
                if (price !== null && !isNaN(price)) {
                  attrData.prices.add(price);
                }
                if (qty !== null && !isNaN(qty)) {
                  attrData.quantities.add(qty);
                }
                attrData.isVisible.add(isVisible); // Store visibility status for this combination

                // Check if this attribute appears alone (independent pricing)
                if (attributeIds.length === 1) {
                  attrData.isIndependent = true;
                }
              });
            }
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
        isIndependent: data.isIndependent,
      });
    });

    return {
      combinationsMap,
      attributeCombinations: processedAttributeCombinations,
    };
  }, [product]);

  const isAttributeVisible = useCallback(
    (attributeId, currentSelections = {}) => {
      if (!product?.isCombination) return true;

      const { combinationsMap } = internalCombinationsMap;
      const normalizedVariants = normalizeVariantData();

      // Find which variant this attribute belongs to
      const attributeVariant = normalizedVariants.find((v) =>
        v.attributes.some((a) => a.id === attributeId),
      );

      if (!attributeVariant) return true; // Not an internal variant

      // Build current selections including this attribute for checking
      const testSelections = { ...currentSelections };
      testSelections[attributeVariant.id] = attributeId;

      // Check all combinations that include this attribute
      let hasVisibleCombination = false;

      combinationsMap.forEach((combo, key) => {
        const ids = key.split(",").filter(Boolean);

        // Must include this attribute
        if (!ids.includes(attributeId)) return;

        // Check if combination matches all current selections
        const matches = Object.entries(testSelections).every(
          ([variantName, attrId]) => {
            // Only check if this variant is represented in the combination
            const variantInCombo = combo.attributes.some(
              (a) => a.variant === variantName,
            );
            if (!variantInCombo) return true; // Variant not in this combination

            return ids.includes(attrId);
          },
        );

        if (
          matches &&
          (combo.isVisible === "true" || combo.isVisible === true)
        ) {
          hasVisibleCombination = true;
        }
      });

      return hasVisibleCombination;
    },
    [product, internalCombinationsMap, normalizeVariantData],
  );

  // Get price and quantity ranges for an attribute
  const getAttributeRanges = useCallback(
    (attributeId) => {
      if (!internalCombinationsMap.attributeCombinations) return null;

      const attrData =
        internalCombinationsMap.attributeCombinations.get(attributeId);
      if (!attrData) return null;

      // Filter out null/undefined and zero when non-zero exists for quantities
      const validPrices = attrData.prices.filter(
        (p) => p !== null && !isNaN(p),
      );
      const validQuantities = attrData.quantities.filter(
        (q) => q !== null && !isNaN(q),
      );

      // For quantity ranges, ignore zero if there are non-zero values
      const nonZeroQuantities = validQuantities.filter((q) => q > 0);
      const quantityValues =
        nonZeroQuantities.length > 0 ? nonZeroQuantities : validQuantities;

      const priceRange =
        validPrices.length > 0
          ? {
            min: Math.min(...validPrices),
            max: Math.max(...validPrices),
          }
          : null;

      const quantityRange =
        quantityValues.length > 0
          ? {
            min: Math.min(...quantityValues),
            max: Math.max(...quantityValues),
          }
          : null;

      return {
        priceRange,
        quantityRange,
        isIndependent: attrData.isIndependent,
      };
    },
    [internalCombinationsMap],
  );

  const areAllInternalVariantsSelected = useCallback(() => {
    const normalizedVariants = normalizeVariantData();

    // Get all internal variants
    const internalVariants = normalizedVariants.filter(
      (v) => v.type === "internal",
    );

    // If there are no internal variants, return true (no validation needed)
    if (internalVariants.length === 0) {
      return true;
    }

    // Check if every internal variant has a selected value
    return internalVariants.every(
      (variant) =>
        selectedVariants[variant.id] && selectedVariants[variant.id] !== "",
    );
  }, [normalizeVariantData, selectedVariants]);

  // Check if a specific attribute combination is sold out or has 0 quantity
  const isAttributeCombinationSoldOut = useCallback(
    (attributeId, currentSelections = {}) => {
      // For parent variants (unchanged)
      if (product?.parent_id) {
        if (soldOutCombinations.size === 0) return false;

        if (soldOutCombinations.has(attributeId)) {
          return true;
        }

        const tempSelections = { ...currentSelections };
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find((v) =>
          v.attributes.some((attr) => attr.id === attributeId),
        );

        if (!attributeVariant) return false;

        tempSelections[attributeVariant.id] = attributeId;
        const selectionIds = Object.values(tempSelections).filter((id) => id);

        if (selectionIds.length === 0) return false;

        const selectionString = selectionIds.sort().join(",");
        return soldOutCombinations.has(selectionString);
      }

      // For internal variants - only apply if quantity is controlled by combinations
      if (product?.isCombination && shouldUseCombinationQuantity) {
        const { combinationsMap } = internalCombinationsMap;

        const tempSelections = { ...currentSelections };
        const normalizedVariants = normalizeVariantData();
        const attributeVariant = normalizedVariants.find((v) =>
          v.attributes.some((attr) => attr.id === attributeId),
        );

        if (!attributeVariant) return false;

        // Only consider controlling variants for quantity
        const controllingSelections = {};
        Object.entries(tempSelections).forEach(([variantName, attrId]) => {
          if (quantityControllingVariants.includes(variantName)) {
            controllingSelections[variantName] = attrId;
          }
        });

        // Add current attribute if it belongs to a controlling variant
        if (quantityControllingVariants.includes(attributeVariant.id)) {
          controllingSelections[attributeVariant.id] = attributeId;
        }

        const selectedIds = Object.values(controllingSelections).filter(
          Boolean,
        );

        // Collect ALL matching VISIBLE combinations
        let hasStock = false;
        let hasAnyVisibleCombo = false;

        combinationsMap.forEach((combo, key) => {
          const ids = key.split(",").filter(Boolean);

          // Must include this attribute
          if (!ids.includes(attributeId)) return;

          // Only consider VISIBLE combinations
          if (!combo.isVisible) return;

          // Must match current partial selection of controlling variants
          const matches = selectedIds.every((id) => ids.includes(id));
          if (!matches) return;

          hasAnyVisibleCombo = true;

          if (Number(combo.qty) > 0) {
            hasStock = true;
          }
        });

        // If no visible combos, don't consider it sold out - it's just not visible/compatible
        if (!hasAnyVisibleCombo) return false;

        // ✅ Sold out ONLY if NO stock anywhere in visible combos
        return !hasStock;
      }

      return false;
    },
    [
      product,
      soldOutCombinations,
      normalizeVariantData,
      internalCombinationsMap,
      shouldUseCombinationQuantity,
      quantityControllingVariants,
    ],
  );

  const getSelectedVariantMainImages = useCallback(
    (currentSelections = selectedVariants) => {
      if (!product?.product_variants) return [];

      const variantImages = [];
      const variantImageMap = new Map(); // Track which variant each image belongs to

      // Loop through each selected variant in order of selection (maintain selection order)
      Object.entries(currentSelections).forEach(
        ([variantName, attributeId]) => {
          // Find the variant in product_variants
          const variant = product.product_variants.find(
            (pv) => pv.variant_name === variantName,
          );

          if (variant?.variant_attributes) {
            // Find the selected attribute in variant_attributes
            const selectedAttribute = variant.variant_attributes.find(
              (attr) => {
                // Try to find by attribute value
                const attrInVariantAttr = product.variant_attribute_id?.find(
                  (va) => va._id === attributeId,
                );
                if (attrInVariantAttr) {
                  return attr.attribute === attrInVariantAttr.attribute_value;
                }
                return false;
              },
            );

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
                if (img && typeof img === "string" && img.trim() !== "") {
                  variantImages.push({
                    variantName,
                    attributeId,
                    attributeValue: selectedAttribute.attribute,
                    imageUrl: img,
                    type: "variant",
                    variantType: variantName, // e.g., "Gemstones", "Metal Type"
                    isVariantImage: true,
                    priority:
                      Object.keys(currentSelections).indexOf(variantName), // Order priority
                    imageIndex: imgIndex,
                  });
                }
              });
            }
          }
        },
      );

      // Sort by priority (most recently selected first)
      variantImages.sort((a, b) => a.priority - b.priority);
      return variantImages;
    },
    [product, selectedVariants],
  );

  // Update selected variant images when selections change
  useEffect(() => {
    if (product?.product_variants) {
      const newVariantImages = getSelectedVariantMainImages();
      setSelectedVariantImages(newVariantImages);
    }
  }, [product, selectedVariants, getSelectedVariantMainImages]);

  const cleanupVariantImages = useCallback(
    (previousSelections, newSelections) => {
      // Find which variants were removed or changed
      const removedVariants = [];
      const changedVariants = [];

      // Check for removed variants
      Object.keys(previousSelections).forEach((variantName) => {
        if (!newSelections[variantName]) {
          removedVariants.push(variantName);
        }
      });

      // Check for changed variants
      Object.keys(newSelections).forEach((variantName) => {
        if (
          previousSelections[variantName] &&
          previousSelections[variantName] !== newSelections[variantName]
        ) {
          changedVariants.push(variantName);
        }
      });

      // The getSelectedVariantMainImages function will handle the removal
      // based on the new selections
    },
    [],
  );

  // Get price for an attribute or combination
  const getAttributePrice = useCallback(
    (attributeId, currentSelections = {}) => {
      if (!product?.isCombination || !shouldUseCombinationPrice) return null;

      const { combinationsMap } = internalCombinationsMap;

      const tempSelections = { ...currentSelections };
      const normalizedVariants = normalizeVariantData();
      const attributeVariant = normalizedVariants.find((v) =>
        v.attributes.some((attr) => attr.id === attributeId),
      );

      if (!attributeVariant) return null;

      // Only consider controlling variants for price
      const controllingSelections = {};
      Object.entries(tempSelections).forEach(([variantName, attrId]) => {
        if (priceControllingVariants.includes(variantName)) {
          controllingSelections[variantName] = attrId;
        }
      });

      // Add current attribute if it belongs to a controlling variant
      if (priceControllingVariants.includes(attributeVariant.id)) {
        controllingSelections[attributeVariant.id] = attributeId;
      }

      const selectionIds = Object.values(controllingSelections).filter(
        (id) => id,
      );

      if (selectionIds.length === 0) {
        // Return price range for single attribute
        const ranges = getAttributeRanges(attributeId);
        return ranges?.priceRange
          ? {
            type: "range",
            min: ranges.priceRange.min,
            max: ranges.priceRange.max,
            isIndependent: ranges.isIndependent,
          }
          : null;
      }

      // Check combination price
      const selectionString = selectionIds.sort().join(",");
      const comboData = combinationsMap?.get(selectionString);

      if (comboData && comboData.price !== null) {
        return {
          type: "fixed",
          value: comboData.price,
          isIndependent: selectionIds.length === 1,
        };
      }

      // If no combination price found, return range
      const ranges = getAttributeRanges(attributeId);
      return ranges?.priceRange
        ? {
          type: "range",
          min: ranges.priceRange.min,
          max: ranges.priceRange.max,
          isIndependent: ranges.isIndependent,
        }
        : null;
    },
    [
      product,
      normalizeVariantData,
      internalCombinationsMap,
      getAttributeRanges,
      shouldUseCombinationPrice,
      priceControllingVariants,
    ],
  );

  // Get quantity for an attribute or combination
  const getAttributeQuantity = useCallback(
    (attributeId, currentSelections = {}) => {
      if (!product?.isCombination || !shouldUseCombinationQuantity) return null;

      const { combinationsMap } = internalCombinationsMap;

      const tempSelections = { ...currentSelections };
      const normalizedVariants = normalizeVariantData();
      const attributeVariant = normalizedVariants.find((v) =>
        v.attributes.some((attr) => attr.id === attributeId),
      );

      if (!attributeVariant) return null;

      // Only consider controlling variants for quantity
      const controllingSelections = {};
      Object.entries(tempSelections).forEach(([variantName, attrId]) => {
        if (quantityControllingVariants.includes(variantName)) {
          controllingSelections[variantName] = attrId;
        }
      });

      // Add current attribute if it belongs to a controlling variant
      if (quantityControllingVariants.includes(attributeVariant.id)) {
        controllingSelections[attributeVariant.id] = attributeId;
      }

      const selectionIds = Object.values(controllingSelections).filter(
        (id) => id,
      );

      if (selectionIds.length === 0) {
        // Return quantity range for single attribute
        const ranges = getAttributeRanges(attributeId);
        return ranges?.quantityRange
          ? {
            type: "range",
            min: ranges.quantityRange.min,
            max: ranges.quantityRange.max,
          }
          : null;
      }

      // Check combination quantity
      const selectionString = selectionIds.sort().join(",");
      const comboData = combinationsMap?.get(selectionString);

      if (comboData && comboData.qty !== null) {
        return {
          type: "fixed",
          value: comboData.qty,
        };
      }

      // If no combination quantity found, return range
      const ranges = getAttributeRanges(attributeId);
      return ranges?.quantityRange
        ? {
          type: "range",
          min: ranges.quantityRange.min,
          max: ranges.quantityRange.max,
        }
        : null;
    },
    [
      product,
      normalizeVariantData,
      internalCombinationsMap,
      getAttributeRanges,
      shouldUseCombinationQuantity,
      quantityControllingVariants,
    ],
  );

  // Get product image for hover based on current selections and hovered attribute
  const getHoverProductImage = useCallback(
    (hoveredAttributeId) => {
      if (!hoveredAttributeId) return null;

      const normalizedVariants = normalizeVariantData();

      // Find which variant this attribute belongs to
      const hoveredVariant = normalizedVariants.find((v) =>
        v.attributes.some((attr) => attr.id === hoveredAttributeId),
      );

      if (!hoveredVariant) return null;

      // ─────────────────────────────────────
      // 1️⃣ PARENT VARIANT → SKU image
      // ─────────────────────────────────────
      if (hoveredVariant.type === "parent") {
        if (!product?.parent_id) return null;

        const parentCombinations = extractParentCombinations();
        const currentSelections = { ...selectedVariants };

        currentSelections[hoveredVariant.id] = hoveredAttributeId;

        const selectionIds = Object.values(currentSelections).filter(
          (val) => val === hoveredAttributeId,
        );
        if (selectionIds.length === 0) return null;

        const selectionString = selectionIds.sort().join(",");

        const targetCombination = parentCombinations.find(
          (combo) => combo.combination_ids.sort().join(",") === selectionString,
        );

        return {
          type: "hover-preview",
          url: targetCombination?.sku_first_image || null,
          source: "parent-variant",
          attributeId: hoveredAttributeId,
        };
      }

      // ─────────────────────────────────────
      // 2️⃣ INTERNAL VARIANT → first main_image
      // ─────────────────────────────────────
      if (hoveredVariant.type === "internal") {
        const attr = hoveredVariant.attributes.find(
          (a) => a.id === hoveredAttributeId,
        );

        if (
          attr?.images &&
          attr.images.length > 0 &&
          typeof attr.images[0] === "string"
        ) {
          return {
            type: "hover-preview",
            url: attr.images[0],
            source: "internal-variant",
            attributeId: hoveredAttributeId,
          };
        }

        return null;
      }

      return null;
    },
    [
      product,
      selectedVariants,
      extractParentCombinations,
      normalizeVariantData,
    ],
  );

  // Handle variant hover for image preview
  const handleVariantHover = useCallback(
    (attributeId) => {
      const hoverImage = getHoverProductImage(attributeId);
      setHoveredVariantImage(hoverImage);
    },
    [product, getHoverProductImage],
  );

  // Handle variant hover out
  const handleVariantHoverOut = useCallback(() => {
    setHoveredVariantImage(null);
  }, []);

  // Handle variant selection
  const handleVariantChange = useCallback(
    (variantId, value) => {
      const previousSelections = { ...selectedVariants };

      setHoveredVariantImage(null);

      setSelectedVariants((prev) => {
        const newSelected = { ...prev };

        const normalizedVariants = normalizeVariantData();
        const selectedVariant = normalizedVariants.find(
          (v) => v.id === variantId,
        );

        if (selectedVariant?.type === "parent") {
          const internalVariantIds = normalizedVariants
            .filter((v) => v.type === "internal")
            .map((v) => v.id);

          internalVariantIds.forEach((internalId) => {
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
      setErrors((prev) => ({ ...prev, [variantId]: "" }));
    },
    [normalizeVariantData, selectedVariants, cleanupVariantImages],
  );

  // Validate variant selections
  const validateVariants = useCallback(() => {
    const errors = {};
    const normalizedVariants = normalizeVariantData();

    // Only validate parent variants for navigation
    const parentVariants = normalizedVariants.filter(
      (v) => v.type === "parent",
    );

    parentVariants.forEach((variant) => {
      if (!selectedVariants[variant.id]) {
        errors[variant.id] = "Please select an option";
      }
    });

    setErrors(errors);

    const allInternalSelected = areAllInternalVariantsSelected();

    return Object.keys(errors).length === 0 && allInternalSelected;
  }, [selectedVariants, normalizeVariantData, areAllInternalVariantsSelected]);

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
      const updatedVariants = normalizedVariants.map((variant) => {
        if (variant.type === "internal") {
          const updatedAttributes = variant.attributes.map((attr) => {
            const ranges = getAttributeRanges(attr.id);
            const priceData = getAttributePrice(attr.id, selectedVariants);
            const quantityData = getAttributeQuantity(
              attr.id,
              selectedVariants,
            );
            const isSoldOut = isAttributeCombinationSoldOut(
              attr.id,
              selectedVariants,
            );
            const isVisible = isAttributeVisible(attr.id, selectedVariants);

            return {
              ...attr,
              priceRange: ranges?.priceRange || null,
              quantityRange: ranges?.quantityRange || null,
              price: priceData?.type === "fixed" ? priceData.value : null,
              quantity:
                quantityData?.type === "fixed" ? quantityData.value : null,
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
        })),
      );

      setFilterVariantAttributes(updatedVariantAttributes);
      setVariantAttributes(updatedVariantAttributes);
    }
  }, [
    product,
    selectedVariants,
    normalizeVariantData,
    getAttributeRanges,
    getAttributePrice,
    getAttributeQuantity,
    isAttributeCombinationSoldOut,
    isAttributeVisible,
  ]);

  // Get parent variant attributes
  const getParentVariantAttributes = useCallback(() => {
    if (!product?.parent_id) return [];

    if (
      product.parent_id.product_variants &&
      product.parent_id.product_variants.length > 0
    ) {
      const allAttributes = [];
      product.parent_id.product_variants.forEach((variant) => {
        if (
          variant.variant_attributes &&
          Array.isArray(variant.variant_attributes)
        ) {
          variant.variant_attributes.forEach((attr) => {
            allAttributes.push({
              _id: attr._id,
              variant: variant.variant_name,
              attribute_value: attr.attribute,
              thumbnail: attr.thumbnail || "",
              preview_image: attr.preview_image || "",
              main_images: [],
            });
          });
        }
      });
      return allAttributes;
    }

    if (
      product.parent_id.variant_attribute_id &&
      Array.isArray(product.parent_id.variant_attribute_id)
    ) {
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
        (combo) => combo.sku_product_id === product_id,
      );

      if (currentCombination) {
        const initialSelections = {};
        const variantAttributes = getParentVariantAttributes();

        currentCombination.combination_ids.forEach((combId) => {
          const variantAttr = variantAttributes.find(
            (attr) => attr._id === combId,
          );

          if (variantAttr) {
            const variantIdentifier = product.parent_id.product_variants
              ? variantAttr.variant
              : variantAttr.variant;

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

  // In useProductVariants.js - getCurrentCombinationData function
  // Update to only consider visible combinations
  const getCurrentCombinationData = useCallback(() => {
    if (
      !product?.isCombination ||
      !selectedVariants ||
      Object.keys(selectedVariants).length === 0
    ) {
      return {
        price: null,
        quantity: null,
        priceRange: null,
        quantityRange: null,
      };
    }

    // Get controlling variants for price and quantity
    const priceControlVariants = priceControllingVariants;
    const quantityControlVariants = quantityControllingVariants;

    // Build selection strings for controlling variants only
    const priceSelectionIds = [];
    const quantitySelectionIds = [];

    Object.entries(selectedVariants).forEach(([variantName, attrId]) => {
      if (priceControlVariants.includes(variantName)) {
        priceSelectionIds.push(attrId);
      }
      if (quantityControlVariants.includes(variantName)) {
        quantitySelectionIds.push(attrId);
      }
    });

    const { combinationsMap } = internalCombinationsMap;

    let priceResult = null;
    let quantityResult = null;

    // Resolve price from VISIBLE combinations if applicable
    if (shouldUseCombinationPrice && priceSelectionIds.length > 0) {
      const priceKey = priceSelectionIds.sort().join(",");
      const priceCombo = combinationsMap.get(priceKey);

      if (priceCombo && priceCombo.price !== null && priceCombo.isVisible) {
        priceResult = priceCombo.price;
      }
    }

    // Resolve quantity from VISIBLE combinations if applicable
    if (shouldUseCombinationQuantity && quantitySelectionIds.length > 0) {
      const quantityKey = quantitySelectionIds.sort().join(",");
      const quantityCombo = combinationsMap.get(quantityKey);

      if (
        quantityCombo &&
        quantityCombo.qty !== null &&
        quantityCombo.isVisible
      ) {
        quantityResult = quantityCombo.qty;
      }

      // If no exact match, find minimum non-zero quantity from all matching VISIBLE combos
      if (quantityResult === null) {
        let minQuantity = Infinity;
        let foundAnyVisible = false;

        combinationsMap.forEach((combo, key) => {
          const ids = key.split(",");

          // Check if this combo matches all controlling quantity selections AND is visible
          const matches = quantitySelectionIds.every((id) => ids.includes(id));
          if (matches && combo.qty !== null && combo.isVisible) {
            foundAnyVisible = true;
            if (combo.qty > 0) {
              minQuantity = Math.min(minQuantity, combo.qty);
            }
          }
        });

        if (minQuantity !== Infinity && minQuantity > 0) {
          quantityResult = minQuantity;
        } else if (foundAnyVisible) {
          quantityResult = 0;
        }
      }
    }

    return {
      price: priceResult,
      quantity: quantityResult,
      priceRange: null,
      quantityRange: null,
      isVisible: true,
    };
  }, [
    product,
    selectedVariants,
    internalCombinationsMap,
    shouldUseCombinationPrice,
    shouldUseCombinationQuantity,
    priceControllingVariants,
    quantityControllingVariants,
  ]);

  const currentCombinationData = useMemo(() => {
    return getCurrentCombinationData();
  }, [getCurrentCombinationData]);

  const handleParentVariantNavigation = useCallback(() => {
    if (!product?.parent_id) return;

    const currentSelections = Object.values(selectedVariants);

    if (
      currentSelections.length === 0 ||
      currentSelections.some((sel) => !sel)
    ) {
      return;
    }

    const parentCombinations = extractParentCombinations();

    const selectionString = currentSelections.sort().join(",");

    const targetCombination = parentCombinations.find((combo) => {
      const comboString = combo.combination_ids.sort().join(",");
      return comboString === selectionString;
    });

    if (
      targetCombination &&
      targetCombination.sku_product_id &&
      targetCombination.sku_product_id !== product._id &&
      !targetCombination.sold_out
    ) {
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
          isIndependent: false,
          isVisible: true, // Default to visible
        };
      }

      const { combinationsMap, attributeCombinations } =
        internalCombinationsMap;
      const normalizedVariants = normalizeVariantData();

      const attributeVariant = normalizedVariants.find((v) =>
        v.attributes.some((a) => a.id === attributeId),
      );

      if (!attributeVariant) {
        return {
          price: null,
          quantity: null,
          priceRange: null,
          quantityRange: null,
          isSoldOut: false,
          isIndependent: false,
          isVisible: true,
        };
      }

      // Check visibility FIRST (separate from sold-out)
      const visible = isAttributeVisible(attributeId, currentSelections);

      const attrMeta = attributeCombinations.get(attributeId);
      const isIndependent = attrMeta?.isIndependent || false;

      // Get controlling selections for price and quantity
      const priceControlSelections = {};
      const quantityControlSelections = {};

      Object.entries(currentSelections).forEach(([variantName, attrId]) => {
        if (priceControllingVariants.includes(variantName)) {
          priceControlSelections[variantName] = attrId;
        }
        if (quantityControllingVariants.includes(variantName)) {
          quantityControlSelections[variantName] = attrId;
        }
      });

      // Add current attribute if it belongs to controlling variants
      if (priceControllingVariants.includes(attributeVariant.id)) {
        priceControlSelections[attributeVariant.id] = attributeId;
      }
      if (quantityControllingVariants.includes(attributeVariant.id)) {
        quantityControlSelections[attributeVariant.id] = attributeId;
      }

      const priceSelectedIds = Object.values(priceControlSelections);
      const quantitySelectedIds = Object.values(quantityControlSelections);

      // ─────────────────────────────────────
      // Price Calculation (existing logic, but only from visible combinations)
      // ─────────────────────────────────────
      let price = null;
      let priceRange = null;

      if (shouldUseCombinationPrice) {
        if (priceSelectedIds.length === 0) {
          const ranges = getAttributeRanges(attributeId);
          priceRange = ranges?.priceRange || null;
        } else {
          const priceKey = priceSelectedIds.sort().join(",");
          const priceCombo = combinationsMap.get(priceKey);

          if (priceCombo && priceCombo.price !== null && priceCombo.isVisible) {
            price = priceCombo.price;
          } else {
            const ranges = getAttributeRanges(attributeId);
            priceRange = ranges?.priceRange || null;
          }
        }
      }

      // ─────────────────────────────────────
      // Quantity Calculation (existing logic, but only from visible combinations)
      // ─────────────────────────────────────
      let quantity = null;
      let quantityRange = null;

      if (shouldUseCombinationQuantity) {
        if (quantitySelectedIds.length === 0) {
          const ranges = getAttributeRanges(attributeId);
          quantityRange = ranges?.quantityRange || null;
        } else {
          const quantityKey = quantitySelectedIds.sort().join(",");
          const quantityCombo = combinationsMap.get(quantityKey);

          if (
            quantityCombo &&
            quantityCombo.qty !== null &&
            quantityCombo.isVisible
          ) {
            quantity = quantityCombo.qty;
          } else {
            const ranges = getAttributeRanges(attributeId);
            quantityRange = ranges?.quantityRange || null;
          }
        }
      }

      // ─────────────────────────────────────
      // Sold Out Calculation (existing logic, but only from visible combinations)
      // ─────────────────────────────────────
      let isSoldOut = false;

      if (
        shouldUseCombinationQuantity &&
        quantityControllingVariants.includes(attributeVariant.id)
      ) {
        const quantityKey = quantitySelectedIds.sort().join(",");
        const quantityCombo = combinationsMap.get(quantityKey);

        let hasAnyVisibleCombo = false;
        let hasStock = false;

        combinationsMap.forEach((combo, key) => {
          const ids = key.split(",");

          if (!ids.includes(attributeId)) return;

          // Only consider VISIBLE combinations for sold-out check
          if (!combo.isVisible) return;

          const matches = quantitySelectedIds.every((id) => ids.includes(id));
          if (!matches) return;

          hasAnyVisibleCombo = true;

          if (Number(combo.qty) > 0) {
            hasStock = true;
          }
        });

        if (hasAnyVisibleCombo && !hasStock) {
          isSoldOut = true;
        }
      }

      return {
        price,
        quantity,
        priceRange,
        quantityRange,
        isSoldOut,
        isIndependent,
        isVisible: visible, // Add visibility flag
      };
    },
    [
      product,
      selectedVariants,
      internalCombinationsMap,
      normalizeVariantData,
      getAttributeRanges,
      shouldUseCombinationPrice,
      shouldUseCombinationQuantity,
      priceControllingVariants,
      quantityControllingVariants,
      isAttributeVisible,
    ],
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
    normalizeVariantData,
    areAllInternalVariantsSelected,
    isAttributeVisible,
  };
};
