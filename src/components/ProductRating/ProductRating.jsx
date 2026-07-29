import React from 'react';
import { Typography, Rating } from '@mui/material';

// {
//     "shopReviewCount": 6,
//     "itemReviewCount": 2,
//     "shopRatingAvg": 4,
//     "itemRatingAvg": 4
// }

const ProductRating = ({ product, reviewData }) => {
    return (
        <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
            {/* <Typography
                variant="span"
                pr={1}
                sx={{ fontSize: "18px", fontWeight: "600", color: "#32888a" }}
            >
                ({reviewData?.itemReviewCount || 0})
            </Typography> */}

            <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
                <Rating
                    precision={0.1}
                    value={reviewData?.itemRatingAvg || 0}
                    size="small"
                    color="warn"
                    readOnly
                    sx={{ fontSize: 16 }}
                />
            </Typography>
            <Typography
                variant="span"
                pr={1}
                sx={{ fontSize: "18px", fontWeight: "600", color: "#32888a" }}
            >
                ({reviewData?.itemReviewCount || 0})
            </Typography>
        </Typography>
    );
};

export default ProductRating;
