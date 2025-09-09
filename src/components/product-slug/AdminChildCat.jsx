import { Box } from "@mui/material";
import { FlexBetween } from "components/flex-box";
import LazyImage from "components/LazyImage";
import { H6 } from "components/Typography";
import Link from "next/link";
import React from "react";
import { white } from "theme/theme-colors";

const AdminChildCat = ({ cat }) => {
  const { slug, _id, title, image } = cat || {};

  const url = `/product?slug=${slug}&id=${_id}&title=${title}`;

  return (
    <Box sx={{ cursor: "pointer", }}>
      <Link href={url} passHref>
        <Box component="a">
          <Box position="relative" borderRadius={3} mb={2} sx={{ height: "210px" }}>
            <LazyImage
              alt={title || "Category"}
              width={140}
              height={210}
              src={image}
              sx={{
                aspectRatio: "2/3",
                height: "100%",
                width: "100%",
                objectFit: "cover",
                borderRadius: "6px",
                transition: "0.3s",
                "&:hover": {
                  boxShadow: 6,
                  transform: "scale(1.05)",
                },
              }}
            />
          </Box>
        </Box>
      </Link>

      <FlexBetween justifyContent="center" alignItems="flex-end">
        <Link href={url} passHref>
          <H6
            component="a"
            fontWeight={700}
            mb={1}
            sx={{
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
              textWrap: "nowrap",
              "&:hover": {
                textDecoration: "underline",
              }
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
