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

// ========================================================
export default function TopCategoriesCard({ title, subtitle, imgUrl }) {
  return (
    <Card
      sx={{
        position: "relative",
        aspectRatio: '2/3'
      }}
    >
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


      <img
        priority
        src={imgUrl}
        alt={title}
        style={{aspectRatio: '2/3', maxHeight: '100%', maxWidth: '100%'}}
        objectFit='contain'
      />
    </Card>
  );
}
