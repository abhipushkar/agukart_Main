"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const ShopPolicyTab = ({ shop_policy }) => {
  if (!shop_policy) return null;

  return (
    <Box sx={{ width: "100%" }}>
  <Typography
    sx={{
      fontWeight: 700,
      fontSize: "20px",
      mb: 2,
    }}
  >
     
  </Typography>

  <HtmlRenderer html={shop_policy || ""} />
</Box>
  );
};

export default ShopPolicyTab;