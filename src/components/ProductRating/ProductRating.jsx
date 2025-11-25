import React from 'react';
import { Typography, Rating } from '@mui/material';

const ProductRating = ({ product }) => {
    return (
        <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="span" pr={1} sx={{ fontSize: "18px", color: "#000" }}>
                {product?.ratingAvg || 0}
            </Typography>

            <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                    precision={0.5}
                    value={product?.ratingAvg || 0}
                    size="small"
                    color="warn"
                    readOnly
                    sx={{ fontSize: 13 }}
                />
            </Typography>

            <Typography
                variant="span"
                pl={2}
                sx={{ fontSize: "18px", fontWeight: "600", color: "#32888a" }}
            >
                {product?.userReviewCount || 0} ratings
            </Typography>
        </Typography>
    );
};

export default ProductRating;
