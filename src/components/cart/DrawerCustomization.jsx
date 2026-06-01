// components/Cart/DrawerCustomization.jsx
import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
  productMainImage,
}) => {
  const [hoveredOption, setHoveredOption] = useState(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [viewAllOptions, setViewAllOptions] = useState([]);
  const [viewAllLabel, setViewAllLabel] = useState("");

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

  const handleViewAllOpen = (options, label) => {
    setViewAllOptions(options);
    setViewAllLabel(label);
    setIsViewAllOpen(true);
  };

  const handleImageSelect = (option, label) => {
    onDropdownChange(label, option);
    setIsViewAllOpen(false);
  };

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
        const visibleOptions = options.filter(
          (opt) => opt.isVisible === "true" || opt.isVisible === true
        );

        if (isDropdown) {
          return (
            <Box key={custom.label} sx={{ mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {custom.label}
                  {custom.isCompulsory === "true" && (
                    <Typography component="span" sx={{ color: "#d32f2f", ml: 0.5 }}>
                      *
                    </Typography>
                  )}
                </Typography>
                {custom.viewAll === "true" && visibleOptions.length > 0 && (
                  <Button
                    onClick={() => handleViewAllOpen(visibleOptions, custom.label)}
                    size="small"
                    variant="text"
                    sx={{
                      fontSize: "11px",
                      textTransform: "none",
                      color: "#D23F57",
                      fontWeight: "bold",
                      minWidth: "auto",
                      p: 0,
                    }}
                  >
                    View All
                  </Button>
                )}
              </Box>

              <FormControl fullWidth size="small">
                <Select
                  value={selectedValue?.value || ""}
                  onChange={(e) => handleDropdownLocal(custom.label, e.target.value, options)}
                  displayEmpty
                  renderValue={(selected) => {
                    const option = options.find((opt) => opt.optionName === selected);
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {option?.thumbnail && (
                          <img
                            src={option.thumbnail}
                            alt=""
                            style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }}
                          />
                        )}
                        <span>{option?.optionName || "Select an option"}</span>
                      </Box>
                    );
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select an option</em>
                  </MenuItem>
                  {options.map((option) => {
                    const isOptionVisible = option.isVisible === "true" || option.isVisible === true;
                    if (!isOptionVisible) return null;

                    return (
                      <MenuItem
                        key={option.optionName}
                        value={option.optionName}
                        onMouseEnter={() => handleOptionHover(option, option.main_images)}
                        onMouseLeave={handleOptionHoverOut}
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {option.thumbnail && (
                          <img
                            src={option.thumbnail}
                            alt=""
                            style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }}
                          />
                        )}
                        <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="body2">{option.optionName}</Typography>
                          {option.priceDifference > 0 && (
                            <Typography component="span" variant="caption" sx={{ color: "#666" }}>
                              +{currency?.symbol}{(option.priceDifference * (currency?.rate || 1)).toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })}
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
          variant="outlined"
        >
          {isExpanded ? "See less" : `See ${customizations.length - 2} more`}
        </Button>
      )}

      {/* View All Dialog */}
      <Dialog
        open={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "12px",
            maxHeight: "80vh",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" sx={{ fontSize: "17px", fontWeight: 500 }}>
              {viewAllLabel}
            </Typography>
            <IconButton onClick={() => setIsViewAllOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(auto-fill, minmax(180px, 1fr))",
              },
              gap: 2,
            }}
          >
            {viewAllOptions.map((option) => {
              const cleanImages = (option.main_images || []).filter(
                (img) => img && typeof img === "string" && img.trim() !== "" && img !== "null"
              );

              let imageSrc = null;
              if (cleanImages.length > 0) {
                imageSrc = cleanImages[0];
              } else if (option.preview_image && option.preview_image !== "__DELETE__") {
                imageSrc = option.preview_image;
              } else if (productMainImage) {
                imageSrc = Array.isArray(productMainImage)
                  ? `https://api.agukart.com/uploads/product/${productMainImage[0]}`
                  : `https://api.agukart.com/uploads/product/${productMainImage}`;
              }

              const showThumbnail = cleanImages.length === 0 && !option.preview_image && option.thumbnail;

              return (
                <Box
                  key={option.optionName}
                  onClick={() => handleImageSelect(option, viewAllLabel)}
                  onMouseEnter={() => handleOptionHover(option, option.main_images)}
                  onMouseLeave={handleOptionHoverOut}
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      paddingTop: "100%",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={option.optionName}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#f5f5f5",
                          color: "#999",
                        }}
                      >
                        No Image
                      </Box>
                    )}

                    {showThumbnail && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: "8px",
                          right: "8px",
                          width: "48px",
                          height: "48px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          border: "2px solid white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          backgroundColor: "white",
                        }}
                      >
                        <img
                          src={option.thumbnail}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ p: 1.5, textAlign: "center" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: "13px",
                        mb: 0.5,
                      }}
                    >
                      {option.optionName}
                    </Typography>
                    {option.priceDifference > 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#D23F57",
                          fontSize: "11px",
                          display: "block",
                          fontWeight: 500,
                        }}
                      >
                        +{currency?.symbol}{(option.priceDifference * (currency?.rate || 1)).toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DrawerCustomization;