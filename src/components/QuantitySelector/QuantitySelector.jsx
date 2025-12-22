import React from 'react';
import { FormControl, Select, MenuItem, Typography } from '@mui/material';

const QuantitySelector = ({
    quantity,
    stock,
    onQuantityChange,
    disabled = false,
    showVariantWarning = false
}) => {

    const quantityArr = Array.from(
        { length: Math.min(stock || 0, 10) },
        (_, i) => i + 1
    );

    return (
        <Typography pt={2} component="div">
            <Typography mb={1} fontSize={17}>
                Quantity:
            </Typography>

            <FormControl sx={{ width: "100%" }}>
                <Select
                    value={quantity}
                    disabled={disabled}
                    onChange={(e) => onQuantityChange(e.target.value)}
                    displayEmpty
                    sx={{
                        border: "none",
                        background: disabled ? "#f5f5f5" : "#fff",
                        height: "40px",
                        boxShadow: "0 0 3px #000",
                        ".MuiOutlinedInput-notchedOutline": {
                            border: "none",
                        },
                        opacity: disabled ? 0.7 : 1,
                        cursor: disabled ? "not-allowed" : "pointer"
                    }}
                >
                    {disabled ? (
                        <MenuItem value="">
                            Select variant first
                        </MenuItem>
                    ) : (
                        quantityArr.map((q) => (
                            <MenuItem key={q} value={q}>
                                {q}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            {/* ⚠️ Warning Message */}
            {showVariantWarning && (
                <Typography
                    sx={{
                        mt: 1,
                        fontSize: "13px",
                        color: "#d32f2f",
                        fontWeight: 500
                    }}
                >
                    Please choose a variant to select quantity
                </Typography>
            )}
        </Typography>
    );
};

export default QuantitySelector;
