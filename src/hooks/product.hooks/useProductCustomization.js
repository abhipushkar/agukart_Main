import { useState, useEffect } from "react";

export const useProductCustomization = (product) => {
  const [selectedDropdowns, setSelectedDropdowns] = useState({});
  const [customizationText, setCustomizationText] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [customizeDropdownPrice, setCustomizeDropdownPrice] = useState(0);
  const [customizeTextPrice, setCustomizeTextPrice] = useState(0);

  // useProductCustomization.js - Updated handleDropdownChange
  const handleDropdownChange = (label, option) => {
    setSelectedDropdowns((prev) => {
      if (!option || option.optionName === "") {
        const updatedDropdowns = { ...prev };
        delete updatedDropdowns[label];
        return updatedDropdowns;
      }
      return {
        ...prev,
        [label]: {
          value: option.optionName,
          price: option.priceDifference,
          thumbnail: option.thumbnail,
          preview_image: option.preview_image,
          main_images: option.main_images,
          option, // Store full option object
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
      if (value == "") {
        const updatedTextArray = { ...prev };
        delete updatedTextArray[label];
        return updatedTextArray;
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

    product?.customizationData?.customizations?.forEach((customization) => {
      const isRequired = customization.isCompulsory === "true";

      if (!isRequired) return; // 👈 IMPORTANT

      // TEXT FIELD
      if (!customization.optionList) {
        if (!customizationText[customization.label]?.value) {
          isValid = false;
          errors[customization.label] =
            `Please enter a value for "${customization.label}".`;
        }
      }

      // DROPDOWN FIELD
      else {
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
    let isValid = false;
    Object.entries(customizationText || {}).forEach(
      ([label, { value, min, max }]) => {
        if (value.length < min) {
          setValidationErrors((prev) => ({
            ...prev,
            [label]: `Input should be between ${min} and ${max} characters.`,
          }));
          isValid = true;
        }
      },
    );
    return isValid;
  };

  // Calculate dropdown prices
  useEffect(() => {
    const customizeDropdownPrices = Object.values(selectedDropdowns).reduce(
      (acc, item) => {
        return acc + +item.price;
      },
      0,
    );
    setCustomizeDropdownPrice(customizeDropdownPrices);
  }, [selectedDropdowns]);

  // Calculate text prices
  useEffect(() => {
    const customizeTextPrice = Object.values(customizationText).reduce(
      (acc, item) => {
        if (item.value.length >= item.min && item.value.length <= item.max) {
          return acc + +item.price;
        }
        return acc;
      },
      0,
    );
    setCustomizeTextPrice(customizeTextPrice);
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
  };
};
