// components/Cart/DrawerProductPricing.jsx
import React from "react";
import { Typography, Box } from "@mui/material";

const DrawerProductPricing = ({
  price,
  originalPrice,
  currency,
  isCombination,
  plusToggle,
  bestPromotion,
  quantity,
}) => {
  const rate = currency?.rate || 1;
  const symbol = currency?.symbol || "$";

  const hasDiscount = originalPrice !== price && originalPrice > price;

  const showPlus = isCombination && plusToggle;

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        {/* Current price */}
        <Typography
          component="span"
          sx={{
            color:"inherit",
            fontSize: "24px",
            fontWeight: 700,
            fontSmooth: "always"
          }}
        >
          {symbol}
          {(price * rate).toFixed(2)}
          {showPlus && "+"}
        </Typography>

        {/* Original price (strikethrough) */}
        {hasDiscount && (
          <Typography
            component="span"
            sx={{
              fontSize: "16px",
              fontWeight: 500,
              color: "gray",
              textDecoration: "line-through",
            }}
          >
            {symbol}
            {(originalPrice * rate).toFixed(2)}
            {showPlus && "+"}
          </Typography>
        )}

        {/* Promotion badge */}
        {bestPromotion &&
          Object.keys(bestPromotion).length > 0 &&
          bestPromotion?.qty <= quantity && (
            <Box
              sx={{
                display: "inline-block",
                backgroundColor: "#00C853",
                color: "#fff",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {bestPromotion?.offer_type === "flat"
                ? `${symbol}${bestPromotion?.discount_amount} OFF`
                : `${bestPromotion?.discount_amount}% OFF`}
            </Box>
          )}
      </Box>

      {/* Per-unit hint when quantity > 1 */}
      {quantity > 1 && (
        <Typography variant="caption" sx={{ color: "gray", mt: 0.5, display: "block" }}>
          ({symbol}
          {(price * rate).toFixed(2)} each)
        </Typography>
      )}
    </Box>
  );
};

export default DrawerProductPricing;