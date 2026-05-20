// components/Cart/DrawerQuantitySelector.jsx
import React from "react";
import { Box, Typography, IconButton, Button, Tooltip } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

const DrawerQuantitySelector = ({
  quantity,
  stock,
  onQuantityChange,
  disabled,
  showVariantWarning,
  isCombination,
  variantSelected,
}) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && quantity < stock) {
      onQuantityChange(quantity + 1);
    }
  };

  const isDisabled = disabled || stock === 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
        Quantity
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          onClick={handleDecrease}
          disabled={quantity <= 1 || isDisabled}
          size="small"
          sx={{ border: "1px solid #ddd", borderRadius: 1 }}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>

        <Typography sx={{ minWidth: "40px", textAlign: "center" }}>{quantity}</Typography>

        <IconButton
          onClick={handleIncrease}
          disabled={quantity >= stock || isDisabled}
          size="small"
          sx={{ border: "1px solid #ddd", borderRadius: 1 }}
        >
          <AddIcon fontSize="small" />
        </IconButton>

        {stock > 0 && stock <= 10 && (
          <Typography variant="caption" sx={{ color: "#d32f2f", ml: 1 }}>
            Only {stock} left
          </Typography>
        )}
      </Box>

      {showVariantWarning && isCombination && !variantSelected && (
        <Typography variant="caption" sx={{ color: "#ff9800", mt: 0.5, display: "block" }}>
          Please select variant options first
        </Typography>
      )}

      {stock === 0 && (
        <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5, display: "block" }}>
          Out of stock
        </Typography>
      )}
    </Box>
  );
};

export default DrawerQuantitySelector;