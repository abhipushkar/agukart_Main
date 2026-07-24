"use client";

import { Box } from "@mui/material";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import styled from "@mui/material/styles/styled";
// GLOBAL CUSTOM COMPONENTS

import HoverBox from "components/HoverBox";
import LazyImage from "components/LazyImage";
// STYLED COMPONENT

const StyledChip = styled(Chip)({
  zIndex: 2,
  top: "0.875rem",
  fontSize: "10px",
  padding: "0 8px",
  fontWeight: "600",
  position: "absolute",
});
// ========================================================
{/* <StyledChip
  style={{
    textTransform: "capitalize",
  }}
  size="small"
  label={title}
  color="secondary"
  sx={{
    backgroundColor: "secondary.main",
    left: 12,
    color: "white",
  }}
/> */}
{/* <StyledChip
  style={{
    textTransform: "capitalize",
  }}
  color="default"
  label={title}
  size="small"
  sx={{
    right: 12,
    maxWidth: "90%",
    bgcolor: "#fefefe4f",
  }}
/> */}

// ========================================================
export default function TopCategoriesCard({ title, subtitle, imgUrl }) {
  return (
    <Card
      sx={{
        position: "relative",
        aspectRatio: "2 / 3",
        overflow: "hidden",
      }}
    >
      <img
        src={imgUrl}
        alt={title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </Card>
  );
}
