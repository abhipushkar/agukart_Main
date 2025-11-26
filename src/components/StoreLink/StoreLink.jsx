import React from 'react';
import { Typography } from '@mui/material';

const StoreLink = ({ product }) => {
    return (
        <Typography
            component="span"
            onClick={() => {
                const slug = product?.vendor_details?.slug;
                if (slug) {
                    window.open(`/store/${slug}`, "_blank");
                }
            }}
            sx={{
                color: "#5454f5",
                fontSize: "15px",
                borderBottom: "2px dashed #5454f5",
                cursor: "pointer",
                "&:hover": {
                    color: "#3434f5",
                    borderBottom: "2px dashed #3434f5",
                }
            }}
        >
            Visit the {product?.vendor_details?.shop_name}
        </Typography>
    );
};

export default StoreLink;
