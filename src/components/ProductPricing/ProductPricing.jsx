import React from 'react';
import { Typography, Box } from '@mui/material';
import { Small } from 'components/Typography';

const ProductPricing = ({
    price,
    originalPrice,
    currency,
    isCombination,
    plusToggle,
    bestPromotion,
    quantity
}) => {
    return (
        <Typography component="div">
            <Typography component="div" sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                    component="div"
                    sx={{
                        fontSize: "30px",
                        fontWeight: "600",
                        color: "#20538f",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {currency?.symbol}
                    {(price * currency.rate).toFixed(2)}
                    {isCombination && plusToggle && "+"}

                    <Small
                        pl={1}
                        sx={{
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "gray",
                        }}
                        component="del"
                    >
                        {originalPrice != price ? currency?.symbol : ""}
                        {originalPrice != price && (originalPrice * currency.rate).toFixed(2)}
                        {originalPrice != price && isCombination && plusToggle && "+"}
                    </Small>
                </Typography>

                {bestPromotion && Object.keys(bestPromotion).length > 0 && bestPromotion?.qty <= quantity && (
                    <Box
                        sx={{
                            display: 'inline-block',
                            backgroundColor: "#00C853",
                            color: "#fff",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            marginLeft: "10px",
                        }}
                    >
                        {bestPromotion?.offer_type == "flat"
                            ? `Flat ${bestPromotion?.discount_amount} OFF`
                            : `${bestPromotion?.discount_amount}% OFF`}
                    </Box>
                )}
            </Typography>

            {quantity > 1 && (
                <Typography component="div" sx={{ fontSize: "17px", fontWeight: "600" }}>
                    {"(Per Unit)"}
                </Typography>
            )}
        </Typography>
    );
};

export default ProductPricing;
