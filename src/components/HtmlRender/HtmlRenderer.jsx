import React from "react";
import parse, { domToReact } from "html-react-parser";
import Box from "@mui/material/Box";

const HtmlRenderer = ({ html }) => {
  const cleanHtml = (rawHtml) => {
    if (!rawHtml) return "";

    return rawHtml
      .replace(/width="[^"]*"/gi, "")
      .replace(/height="[^"]*"/gi, "")
      .replace(/style="[^"]*"/gi, "")
      .replace(/align="[^"]*"/gi, "");
  };

  return (
    <Box
  sx={{
    width: "100%",
    overflow: "hidden",

    // TABLE
    "& table": {
      width: "100% !important",
      borderCollapse: "collapse",
      tableLayout: "fixed",
    },

    "& tbody": {
      width: "100%",
    },

    "& tr": {
      borderBottom: "1px solid #e5e7eb",
    },

    "& td, & th": {
      padding: {
        xs: "8px 6px",
        sm: "10px",
      },
      fontSize: {
        xs: "13px",
        sm: "14px",
      },
      textAlign: "left",
      verticalAlign: "top",
      wordBreak: "break-word",
      overflowWrap: "break-word",
      whiteSpace: "normal",
    },

    // MOBILE FIX
    "@media (max-width:600px)": {
      "& td, & th": {
        display: "block",
        width: "100%",
        padding: "8px 0",
      },

      "& tr": {
        display: "block",
        marginBottom: "16px",
        borderBottom: "1px solid #ddd",
      },
    },

    "& img": {
      maxWidth: "100%",
      height: "auto",
      display: "block",
    },

    "& p": {
      marginBottom: "10px",
      lineHeight: 1.7,
    },

    "& ul, & ol": {
      paddingLeft: "20px",
    },
  }}
>
  {parse(cleanHtml(html || ""))}
</Box>
  );
};

export default HtmlRenderer;