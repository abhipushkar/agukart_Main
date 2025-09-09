import { Box, Skeleton } from "@mui/material";
import React from "react";

const ProductCardShimmerWithoutVideo = () => {
  return (
    <>
      <Box>
        <Skeleton variant="rectangular" height={200} animation="wave" />
        <Skeleton variant="text" height={20} width="80%" sx={{ mt: 1 }} />
        <Skeleton variant="text" height={20} width="60%" />
      </Box>
    </>
  );
};

export default ProductCardShimmerWithoutVideo;
