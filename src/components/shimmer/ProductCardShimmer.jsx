import { Box, Grid, Skeleton } from "@mui/material";
import React from "react";

const ProductCardShimmer = () => {
  return (
    <>
      <Box
        pb={1}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box borderRadius={1} mb={1} sx={{ overflow: "hidden", height: { xs: 140, md: 260 } }}>
          <Skeleton variant="rectangular" width="100%" height="100%" />
        </Box>

        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <Skeleton variant="text" width="50%" height={18} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
    </>
  );
};

export default ProductCardShimmer;
