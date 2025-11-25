import React from 'react';
import { FormControl, Select, MenuItem, Typography } from '@mui/material';

const QuantitySelector = ({ quantity, stock, onQuantityChange }) => {
    const quantityArr = Array.from(
        { length: Math.min(stock, 10) },
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
                    onChange={(e) => onQuantityChange(e.target.value)}
                    sx={{
                        border: "none",
                        background: "#fff",
                        height: "40px",
                        boxShadow: "0 0 3px #000",
                        ".MuiOutlinedInput-notchedOutline": {
                            border: "none",
                        },
                    }}
                >
                    {quantityArr.map((q) => (
                        <MenuItem key={q} value={q}>
                            {q}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Typography>
    );
};

export default QuantitySelector;
