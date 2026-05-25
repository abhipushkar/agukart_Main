// utils/resolveCartCustomizationPrice.js
const normalize = (value) => String(value || "").trim();

/**
 * Compute total customization price based on selectedCustomization from cart item
 * and current customization options from the product.
 * @param {Object} product - Current product data (contains availableCustomization)
 * @param {Object} cartItem - Cart item snapshot (contains selectedCustomization)
 * @returns {number} Total customization price
 */
export const resolveCartCustomizationPrice = (product, cartItem = null) => {
    if (product?.customize !== "Yes") return 0;

    // Use cartItem's selectedCustomization if provided, otherwise product's (current selection)
    const selectedCustomization = cartItem?.selectedCustomization || product?.selectedCustomization;
    if (!selectedCustomization || !Array.isArray(selectedCustomization)) return 0;

    // Get current customization options from product (for price lookups)
    const currentCustomizations = product?.availableCustomization?.customizations || [];

    let totalPrice = 0;

    selectedCustomization.forEach((customGroup) => {
        if (!customGroup || typeof customGroup !== "object") return;
        Object.entries(customGroup).forEach(([label, selection]) => {
            if (!selection?.value) return;

            const customField = currentCustomizations.find((c) => c.label === label);
            if (!customField) return; // customization option removed

            if (customField.optionList) {
                // Dropdown type
                const option = customField.optionList.find((opt) => opt.optionName === selection.value);
                if (option?.priceDifference) {
                    totalPrice += parseFloat(option.priceDifference) || 0;
                }
            } else {
                // Text field type
                const price = parseFloat(customField.price) || 0;
                if (price) totalPrice += price;
            }
        });
    });

    return totalPrice;
};