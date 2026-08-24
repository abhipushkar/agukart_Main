import { Box } from "@mui/material";
import { FlexBetween } from "components/flex-box";
import LazyImage from "components/LazyImage";
import { H6 } from "components/Typography";
import Link from "next/link";
import React from "react";
import { white } from "theme/theme-colors";

const AdminChildCat = ({ cat }) => {
  const { title, image, fullSlug } = cat || {};
  const url = `/${fullSlug}`;

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        cursor: "pointer",
      }}
    >
      <Link href={url}>
        <Box
          sx={{
            width: "100%",
            aspectRatio: "2 / 3",
            position: "relative",
            overflow: "hidden",
            borderRadius: "6px",
            mb: 2,
          }}
        >
          <LazyImage
            alt={title || "Category"}
            src={image}
            width={300}
            height={450}
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>
      </Link>

      <FlexBetween justifyContent="center" alignItems="flex-end">
        <Link href={url}>
          <H6
            fontWeight={700}
            mb={1}
            sx={{
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {title}
          </H6>
        </Link>
      </FlexBetween>
    </Box>
  );
};

export default AdminChildCat;
