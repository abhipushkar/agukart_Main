import React from 'react';
import { Button, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const ProductActions = ({
    onAddToCart,
    onBuyNow,
    onWishlistToggle,
    isInWishlist
}) => {
    return (
        <Typography pt={3} component="div">
            <Button
                onClick={onAddToCart}
                variant="contained"
                sx={{
                    background: "#fff",
                    color: "#000",
                    padding: "12px 50px",
                    fontSize: "15px",
                    borderRadius: "25px",
                    width: "100%",
                    marginBottom: "12px",
                    border: "2px solid #000",
                    "&:hover": {
                        background: "#f5f5f5",
                    }
                }}
            >
                Add to Cart
            </Button>

            <Button
                onClick={onBuyNow}
                variant="contained"
                sx={{
                    background: "#000",
                    padding: "12px 50px",
                    fontSize: "15px",
                    borderRadius: "25px",
                    width: "100%",
                    marginBottom: "12px",
                    color: "#fff",
                    "&:hover": {
                        background: "#4f4e4e"
                    },
                }}
            >
                Buy Now
            </Button>

            <Button
                onClick={onWishlistToggle}
                variant="contained"
                sx={{
                    background: "transparent",
                    padding: "12px 50px",
                    fontSize: "15px",
                    borderRadius: "25px",
                    width: "100%",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "none",
                    "&:hover": {
                        background: "rgba(0, 0, 0, 0.04)",
                    }
                }}
            >
                {isInWishlist ? (
                    <FavoriteIcon sx={{ marginRight: "6px" }} />
                ) : (
                    <FavoriteBorderIcon sx={{ marginRight: "6px" }} />
                )}
                Add to collection
            </Button>
        </Typography>
    );
};

export default ProductActions;
