"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TabPanel from "@mui/lab/TabPanel";
import LockIcon from "@mui/icons-material/Lock";
import Image from "next/image";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const ShopPolicyTab = ({shop_policy}) => {
  return (
    <>
      <HtmlRenderer html={ shop_policy || ""} />
    </>
  );
};

export default ShopPolicyTab;
