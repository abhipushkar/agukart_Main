import Container from "@mui/material/Container";
import styled from "@mui/material/styles/styled"; 
// CONSTANT VARIABLES

import { layoutConstant } from "utils/constants";
export const HeaderWrapper = styled("div")(({
  theme
}) => ({
  zIndex: 3,
  position: "relative",
  height: layoutConstant.headerHeight,
  transition: "height 250ms ease-in-out",
  background: theme.palette.background.paper,
  marginTop:"10px",

  [theme.breakpoints.down("md")]: {
    height: layoutConstant.tabletHeaderHeight
  },
  [theme.breakpoints.down("sm")]: {
    height: layoutConstant.mobileHeaderHeight
  },
  "@media (min-width: 900px) and (max-width: 1149px)": {
    height: layoutConstant.tabletHeaderHeight + 10
  }
}));
export const StyledContainer = styled(Container)({
  gap: 2,
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
});