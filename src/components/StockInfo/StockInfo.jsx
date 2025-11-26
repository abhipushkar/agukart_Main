import React from 'react';
import { Typography } from '@mui/material';

const StockInfo = ({ stock, cartCount }) => {
    return (
        <Typography
            component="div"
            sx={{
                fontSize: "17px",
                fontWeight: "600",
                color: "#bc1111",
            }}
            pt={2}
        >
            {stock === 0
                ? "Sold Out"
                : cartCount > 0
                    ? `Only ${stock} left and in ${cartCount || 0} cart${cartCount === 1 ? '' : 's'}`
                    : `Only ${stock} left`
            }
        </Typography>
    );
};

export default StockInfo;
