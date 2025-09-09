import { Box, Grid, Skeleton } from "@mui/material";
import React from "react";

const ProductCategoryShimmer = () => {
  return (
    <>
      <Grid item xs={6} sm={4} md={2}>
        <Box>
          <Box
            sx={{
              width: "100%",
              height: 180,
              borderRadius: 2,
              mb: 1,
              overflow: "hidden",
            }}
          >
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </Box>
          <Skeleton variant="text" width="80%" height={20} />
        </Box>
      </Grid>
    </>
  );
};

export default ProductCategoryShimmer;
