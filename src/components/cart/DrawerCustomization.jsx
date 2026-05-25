// components/Cart/DrawerCustomization.jsx
import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";

const DrawerCustomization = ({
  customizationData,
  selectedDropdowns,
  customizationText,
  onDropdownChange,
  onTextChange,
  validationErrors,
  currency,
  onOptionHover,
  onOptionHoverOut,
  isExpanded,
  setIsExpanded,
}) => {
  const [hoveredOption, setHoveredOption] = useState(null);

  const customizations = customizationData?.customizations || [];
  const visibleCustomizations = useMemo(() => {
    return isExpanded ? customizations : customizations.slice(0, 2);
  }, [customizations, isExpanded]);
  const hasMore = customizations.length > 2;

  const handleOptionHover = useCallback(
    (option, mainImages) => {
      if (onOptionHover && mainImages?.length) {
        onOptionHover({
          type: "hover-preview",
          url: mainImages[0],
          source: "customization",
          optionName: option.optionName,
        });
      }
      setHoveredOption(option.optionName);
    },
    [onOptionHover]
  );

  const handleOptionHoverOut = useCallback(() => {
    if (onOptionHoverOut) onOptionHoverOut();
    setHoveredOption(null);
  }, [onOptionHoverOut]);

  const handleDropdownLocal = useCallback(
    (label, value, options) => {
      const option = options.find((opt) => opt.optionName === value);
      onDropdownChange(label, option || "");
    },
    [onDropdownChange]
  );

  const handleTextLocal = useCallback(
    (label, price, min, max, value) => {
      onTextChange(label, price, min, max, value);
    },
    [onTextChange]
  );

  if (!customizations.length) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: "14px", mb: 1 }}>
        Customizations
      </Typography>

      {visibleCustomizations.map((custom) => {
        const isDropdown = !!custom.optionList;
        const selectedValue = selectedDropdowns[custom.label];
        const textValue = customizationText[custom.label]?.value || "";
        const error = validationErrors[custom.label];
        const options = custom.optionList || [];

        if (isDropdown) {
          return (
            <Box key={custom.label} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                {custom.label}
                {custom.isCompulsory === "true" && (
                  <Typography component="span" sx={{ color: "#d32f2f", ml: 0.5 }}>
                    *
                  </Typography>
                )}
              </Typography>

              <FormControl fullWidth size="small">
                <Select
                  value={selectedValue?.value || ""}
                  onChange={(e) => handleDropdownLocal(custom.label, e.target.value, options)}
                  displayEmpty
                  renderValue={(selected) => {
                    const option = options.find((opt) => opt.optionName === selected);
                    return option?.optionName || "Select an option";
                  }}
                >
                  <MenuItem value="">
                    <em>Select an option</em>
                  </MenuItem>
                  {options.map((option) => (
                    <MenuItem
                      key={option.optionName}
                      value={option.optionName}
                      onMouseEnter={() => handleOptionHover(option, option.main_images)}
                      onMouseLeave={handleOptionHoverOut}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                        <span>{option.optionName}</span>
                        {option.priceDifference > 0 && (
                          <Typography component="span" variant="caption" sx={{ color: "#666" }}>
                            +{currency?.symbol}{(option.priceDifference * (currency?.rate || 1)).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {error && (
                <Typography color="error" sx={{ fontSize: "12px", mt: 0.5 }}>
                  {error}
                </Typography>
              )}
            </Box>
          );
        } else {
          const price = custom.price || 0;
          const minLength = parseInt(custom.min) || 0;
          const maxLength = parseInt(custom.max) || 100;

          return (
            <Box key={custom.label} sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                {custom.label}
                {custom.isCompulsory === "true" && (
                  <Typography component="span" sx={{ color: "#d32f2f", ml: 0.5 }}>
                    *
                  </Typography>
                )}
                {price > 0 && (
                  <Typography component="span" sx={{ fontSize: "12px", color: "#666", ml: 1 }}>
                    (+{currency?.symbol}{(price * (currency?.rate || 1)).toFixed(2)})
                  </Typography>
                )}
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder={`Enter ${custom.label} (${minLength}-${maxLength} characters)`}
                value={textValue}
                onChange={(e) => handleTextLocal(custom.label, price, minLength, maxLength, e.target.value)}
                error={!!error}
                helperText={error || `${minLength}-${maxLength} characters`}
              />
            </Box>
          );
        }
      })}

      {hasMore && (
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
          sx={{ textTransform: "none", fontSize: "12px", mt: 1 }}
        >
          {isExpanded ? "See less" : `See ${customizations.length - 2} more`}
        </Button>
      )}
    </Box>
  );
};

export default DrawerCustomization;