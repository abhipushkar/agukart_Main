// hooks/product.hooks/useDrawerProductCustomization.js
import { useState, useEffect } from "react";

export const useDrawerProductCustomization = (product) => {
  const [selectedDropdowns, setSelectedDropdowns] = useState({});
  const [customizationText, setCustomizationText] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [customizeDropdownPrice, setCustomizeDropdownPrice] = useState(0);
  const [customizeTextPrice, setCustomizeTextPrice] = useState(0);
  const [isExpanded, setIsExpanded] = useState(
    product?.availableCustomization?.isExpanded === "true" ||
    product?.availableCustomization?.isExpanded === true ||
    false
  );

  const handleDropdownChange = (label, option) => {
    setSelectedDropdowns((prev) => {
      if (!option || option.optionName === "") {
        const updated = { ...prev };
        delete updated[label];
        return updated;
      }
      return {
        ...prev,
        [label]: {
          value: option.optionName,
          price: option.priceDifference,
          thumbnail: option.thumbnail,
          preview_image: option.preview_image,
          main_images: option.main_images,
          option,
        },
      };
    });
    setValidationErrors((prv) => ({ ...prv, [label]: "" }));
  };

  const handleTextChange = (label, price, min, max, value) => {
    if (value.length > max) {
      setValidationErrors((prev) => ({
        ...prev,
        [label]: `Input should be between ${min} and ${max} characters.`,
      }));
      return;
    }

    setCustomizationText((prev) => {
      if (value === "") {
        const updated = { ...prev };
        delete updated[label];
        return updated;
      }
      return {
        ...prev,
        [label]: { value, price, min, max },
      };
    });
    setValidationErrors((prev) => ({ ...prev, [label]: "" }));
  };

  const validateCustomization = () => {
    const errors = {};
    let isValid = true;

    const customizations = product?.availableCustomization?.customizations || product?.customizationData?.customizations || [];
    customizations.forEach((customization) => {
      const isRequired = customization.isCompulsory === "true";
      if (!isRequired) return;

      if (!customization.optionList) {
        if (!customizationText[customization.label]?.value) {
          isValid = false;
          errors[customization.label] = `Please enter a value for "${customization.label}".`;
        }
      } else {
        if (!selectedDropdowns[customization.label]?.value) {
          isValid = false;
          errors[customization.label] = "Please select an option";
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const checkInputMinValue = () => {
    let hasError = false;
    const customizations = product?.availableCustomization?.customizations || product?.customizationData?.customizations || [];
    Object.entries(customizationText || {}).forEach(([label, { value, min, max }]) => {
      const customField = customizations.find(c => c.label === label);
      if (customField && value.length < min) {
        setValidationErrors((prev) => ({
          ...prev,
          [label]: `Input should be between ${min} and ${max} characters.`,
        }));
        hasError = true;
      }
    });
    return hasError;
  };

  useEffect(() => {
    const total = Object.values(selectedDropdowns).reduce((acc, item) => acc + (+item.price || 0), 0);
    setCustomizeDropdownPrice(total);
  }, [selectedDropdowns]);

  useEffect(() => {
    const total = Object.values(customizationText).reduce((acc, item) => {
      if (item.value.length >= item.min && item.value.length <= item.max) {
        return acc + (+item.price || 0);
      }
      return acc;
    }, 0);
    setCustomizeTextPrice(total);
  }, [customizationText]);

  return {
    selectedDropdowns,
    customizationText,
    validationErrors,
    customizeDropdownPrice,
    customizeTextPrice,
    handleDropdownChange,
    handleTextChange,
    validateCustomization,
    checkInputMinValue,
    isExpanded,
    setIsExpanded,
  };
};