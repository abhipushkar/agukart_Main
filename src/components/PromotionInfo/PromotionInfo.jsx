import React from 'react';
import { Typography } from '@mui/material';

const PromotionInfo = ({ nextPromotion, quantity }) => {
    if (!nextPromotion || Object.keys(nextPromotion).length === 0 || +nextPromotion?.qty <= quantity) {
        return null;
    }

    return (
        <Typography sx={{ color: 'green', fontWeight: '500', mt: 1 }}>
            Save{" "}
            {nextPromotion?.offer_type === "flat"
                ? `$ ${nextPromotion?.discount_amount}`
                : `${nextPromotion?.discount_amount} %`}{" "}
            when you buy{" "}
            {nextPromotion?.qty !== 0 ? nextPromotion?.qty : ""}{" "}
            items at this shop
        </Typography>
    );
};

export default PromotionInfo;
