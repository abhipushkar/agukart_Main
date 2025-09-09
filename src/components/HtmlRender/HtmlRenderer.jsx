import React from "react";
import parse, { domToReact } from "html-react-parser";
import Box from "@mui/material/Box";

const HtmlRenderer = ({ html }) => {
  const options = {
    replace: (domNode) => {
      if (domNode.type === "tag") {
        // indent classes fix (for any tag, not only <p>)
        if (domNode.attribs?.class?.includes("ql-indent-")) {
          let indentLevel = domNode.attribs.class.match(/ql-indent-(\d+)/)?.[1];
          return React.createElement(
            domNode.name, // jo bhi tag ho (h1, h2, p, etc.)
            {
              style: { paddingLeft: `${indentLevel * 3}em` },
            },
            domToReact(domNode.children, options)
          );
        }

        // alignment fix
        if (domNode.attribs?.class?.includes("ql-align-center")) {
          return React.createElement(
            domNode.name,
            { style: { textAlign: "center" } },
            domToReact(domNode.children, options)
          );
        }
        if (domNode.attribs?.class?.includes("ql-align-right")) {
          return React.createElement(
            domNode.name,
            { style: { textAlign: "right" } },
            domToReact(domNode.children, options)
          );
        }
        if (domNode.attribs?.class?.includes("ql-align-justify")) {
          return React.createElement(
            domNode.name,
            { style: { textAlign: "justify" } },
            domToReact(domNode.children, options)
          );
        }
      }
    },
  };

  return (
    <Box
      component="div"
      sx={{
        "& table": { borderCollapse: "collapse", width: "100%" },
        "& th, & td": { border: "1px solid #e5e7eb", p: 2 },
        "& img": {
          maxWidth: "100%",
          height: "auto",
          display: "block",
        },
      }}
    >
      {parse(html || "", options)}
    </Box>
  );
};

export default HtmlRenderer;
