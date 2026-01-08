import React from "react";
import { FormControl, Select, MenuItem, Typography } from "@mui/material";

const QuantitySelector = ({
  quantity,
  stock,
  onQuantityChange,
  disabled = false,
  showVariantWarning = false,
  isCombination = false,
  variantSelected = true,
}) => {
  // Determine what to show in the dropdown
  let quantityOptions = [];
  let selectValue = quantity;
  let isDisabled = disabled;
  let dropdownLabel = "";

  if (isCombination && !variantSelected) {
    // Case: Combination product, no variant selected
    if (stock && stock > 0) {
      // Stock is the minimum non-zero quantity from all combinations
      quantityOptions = Array.from(
        { length: Math.min(stock, 10) }, // Limit to 10 options max
        (_, i) => i + 1
      );
      selectValue = quantityOptions.includes(quantity) ? quantity : 1;
      isDisabled = false;
      dropdownLabel = "";
    } else if (stock === 0) {
      // No stock available in any combination
      quantityOptions = [];
      selectValue = 0;
      isDisabled = false;
      dropdownLabel = "Select variant first";
    } else {
      // stock is null (no data)
      quantityOptions = [];
      selectValue = "";
      isDisabled = false;
      dropdownLabel = "Select variant first";
    }
  } else {
    // Normal cases (variant selected or simple product)
    const availableStock = stock === null ? 0 : stock;
    const isOutOfStock = availableStock === 0;

    if (isOutOfStock) {
      quantityOptions = [];
      selectValue = 0;
      isDisabled = true;
      dropdownLabel = "Sold Out";
    } else if (disabled) {
      quantityOptions = [];
      selectValue = "";
      isDisabled = true;
      dropdownLabel = "Select variant first";
    } else {
      quantityOptions = Array.from(
        { length: Math.min(availableStock || 0, 10) },
        (_, i) => i + 1
      );
      selectValue = quantityOptions.includes(quantity) ? quantity : 1;
      isDisabled = false;
      dropdownLabel = "";
    }
  }

  return (
    <Typography pt={2} component="div">
      <Typography mb={1} fontSize={17}>
        Quantity:
      </Typography>

      <FormControl sx={{ width: "100%" }}>
        <Select
          value={selectValue}
          disabled={isDisabled}
          onChange={(e) => onQuantityChange(e.target.value)}
          displayEmpty
          sx={{
            border: "none",
            background: isDisabled ? "#f5f5f5" : "#fff",
            height: "40px",
            boxShadow: "0 0 3px #000",
            ".MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            opacity: isDisabled ? 0.7 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer",
          }}
        >
          {dropdownLabel ? (
            <MenuItem value={selectValue} disabled>
              {dropdownLabel}
            </MenuItem>
          ) : (
            quantityOptions.map((q) => (
              <MenuItem key={q} value={q}>
                {q}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Typography>
  );
};

export default QuantitySelector;
