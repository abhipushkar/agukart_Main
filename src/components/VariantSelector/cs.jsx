import React from 'react';
import {
    FormControl,
    Select,
    MenuItem,
    Grid,
    Typography,
    Box,
    Tooltip,
    Button
} from '@mui/material';

const VariantSelector = ({
    variant,
    selectedValue,
    onChange,
    error,
    currency,
    filterVariantAttributes = []
}) => {
    const renderAttributePrice = (attribute) => {
        if (variant.type === 'internal') return null;

        const variantAttr = filterVariantAttributes.find(attr =>
            attr._id === attribute.id || attr.attribute_value === attribute.value
        );

        if (!variantAttr) return null;

        const { minPrice, maxPrice, minQuantity, maxQuantity, isCheckedQuantity } = variantAttr;

        if (minQuantity === 0 && maxQuantity === 0 && isCheckedQuantity) {
            return " [Sold Out]";
        }

        if (minPrice !== 0) {
            if (minPrice === maxPrice) {
                return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)})`;
            }
            return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)} - ${currency?.symbol}${(maxPrice * currency?.rate).toFixed(2)})`;
        }

        return null;
    };

    const isAttributeDisabled = (attribute) => {
        if (variant.type === 'internal') return false;

        const variantAttr = filterVariantAttributes.find(attr =>
            attr._id === attribute.id || attr.attribute_value === attribute.value
        );

        return variantAttr?.minQuantity === 0 &&
            variantAttr?.maxQuantity === 0 &&
            variantAttr?.isCheckedQuantity;
    };

    // Get the preview image for tooltip - priority: edit_preview_image > preview_image
    const getPreviewImage = (attribute) => {
        // For parent variants
        if (variant.type === 'parent') {
            const variantAttr = filterVariantAttributes.find(attr =>
                attr._id === attribute.id || attr.attribute_value === attribute.value
            );
            return variantAttr?.preview_image || '';
        }

        // For internal variants
        return attribute.edit_preview_image || attribute.preview_image || '';
    };

    // Render Amazon-style grid for parent variants
    const renderParentVariantGrid = () => {
        return (
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: "17px", mb: 2, fontWeight: 600 }}>
                    {variant.name}
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>
                </Typography>

                <Grid container spacing={1.5}>
                    {variant.attributes.map((attr) => {
                        const isSelected = selectedValue === attr.id;
                        const isDisabled = isAttributeDisabled(attr);
                        // const previewImage = getPreviewImage(attr);
                        const priceText = renderAttributePrice(attr);

                        return (
                            <Grid item key={attr.id}>
                                <Tooltip
                                    title={attr.value}
                                    placement="top"
                                    arrow
                                >
                                    <Button
                                        onClick={() => {
                                            if (!isDisabled) {
                                                console.log(`Parent variant ${variant.id} changed to:`, attr.id);
                                                onChange(variant.id, attr.id);
                                            }
                                        }}
                                        disabled={isDisabled}
                                        sx={{
                                            width: '69px',
                                            height: '69px',
                                            minWidth: '69px',
                                            minHeight: '69px',
                                            padding: 0,
                                            border: '1px solid #D23F57',
                                            borderRadius: '8px',
                                            backgroundColor: isDisabled ? '#f0f0f0' : '#ffffff',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            outline: isSelected ? '3px solid #D23F57' : "",
                                            outlineOffset: 2,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            '&:hover:not(:disabled)': {
                                                borderColor: isSelected ? '#000' : '#d84f66ff',
                                                boxShadow: '0 0 0 3px rgba(0, 113, 133, 0.1)'
                                            },
                                            '&:disabled': {
                                                opacity: 0.5,
                                                cursor: 'not-allowed'
                                            }
                                        }}
                                    >
                                        {attr.thumbnail ? (
                                            <img
                                                src={attr.thumbnail}
                                                alt={attr.value}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '6px'
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#f8f9fa',
                                                    color: '#6c757d',
                                                    fontSize: '12px',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    textAlign: 'center',
                                                    padding: '4px',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                {attr.value}
                                            </Box>
                                        )}
                                    </Button>
                                </Tooltip>

                                {/* Attribute name and price below the image */}
                                <Box sx={{ textAlign: 'center', mt: 0.5, maxWidth: '69px' }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontSize: '12px',
                                            fontWeight: isSelected ? 600 : 400,
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {attr.value}
                                    </Typography>
                                    {priceText && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: '10px',
                                                color: isDisabled ? '#d32f2f' : '#666666',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {priceText}
                                        </Typography>
                                    )}
                                    {isDisabled && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: '10px',
                                                color: '#d32f2f',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            Sold Out
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>

                {error && (
                    <Typography color="error" sx={{ mt: 1, fontSize: '14px' }}>
                        {error}
                    </Typography>
                )}
            </Box>
        );
    };

    // Render dropdown for internal variants (keep existing behavior)
    const renderInternalVariantDropdown = () => {
        return (
            <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: "17px", mb: 1 }}>
                    {variant.name}
                </Typography>

                <FormControl fullWidth>
                    <Select
                        value={selectedValue || ""}
                        displayEmpty
                        onChange={(e) => {
                            console.log(`Internal variant ${variant.id} changed to:`, e.target.value);
                            onChange(variant.id, e.target.value);
                        }}
                        renderValue={(selected) => {
                            if (!selected) return "Select an option";
                            const selectedAttr = variant.attributes.find(attr =>
                                attr.id === selected || attr.value === selected
                            );
                            return selectedAttr?.value || "Select an option";
                        }}
                        sx={{
                            border: "none",
                            background: "#fff",
                            height: "40px",
                            boxShadow: "0 0 3px #000",
                            ".MuiOutlinedInput-notchedOutline": { border: "none" },
                        }}
                    >
                        <MenuItem value="">Select an option</MenuItem>
                        {variant.attributes.map((attr) => {
                            const previewImage = getPreviewImage(attr);

                            return (
                                <MenuItem
                                    key={attr.id}
                                    value={attr.id}
                                >
                                    <Tooltip title={previewImage ? <img src={previewImage} alt={attr.value} width={100} height={100} /> : attr.value} placement='left-start'>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {attr.thumbnail && (
                                                    <img
                                                        src={attr.thumbnail}
                                                        alt=""
                                                        style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            marginRight: '8px',
                                                            borderRadius: '3px',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                )}
                                                {attr.value}
                                            </div>
                                        </div>
                                    </Tooltip>
                                </MenuItem>
                            )
                        })}
                    </Select>
                </FormControl>
            </Grid>
        );
    };

    // Render based on variant type
    if (variant.type === 'parent') {
        return renderParentVariantGrid();
    } else {
        return renderInternalVariantDropdown();
    }
};

export default VariantSelector;
