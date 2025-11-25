import React from 'react';
import {
    FormControl,
    Select,
    MenuItem,
    Grid,
    Typography
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

    return (
        <Grid item xs={12} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: "17px", mb: 1 }}>
                {variant.name}
                {variant.type === 'parent' && (
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>
                )}
            </Typography>

            <FormControl fullWidth>
                <Select
                    value={selectedValue || ""}
                    displayEmpty
                    onChange={(e) => {
                        console.log(`Variant ${variant.id} changed to:`, e.target.value);
                        onChange(variant.id, e.target.value);
                    }}
                    onBlur={() => {
                        if (!selectedValue && variant.type === 'parent') {
                            // Error handling for parent variants
                        }
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
                    {variant.attributes.map((attr) => (
                        <MenuItem
                            key={attr.id}
                            value={attr.id}
                            disabled={isAttributeDisabled(attr)}
                        >
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
                                {renderAttributePrice(attr)}
                            </div>
                        </MenuItem>
                    ))}
                </Select>
                {error && (
                    <Typography color="error" sx={{ mt: 1, fontSize: '14px' }}>
                        {error}
                    </Typography>
                )}
            </FormControl>
        </Grid>
    );
};

export default VariantSelector;
