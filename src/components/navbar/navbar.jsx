// LOCAL CUSTOM COMPONENTS
import Categories from "./categories";
import NavigationList from "./nav-list";
import "./nav.css";
// STYLED COMPONENTS
import HeaderCategories from "./horizontal-category/HeaderCategories";

import { NavBarWrapper, InnerContainer } from "./styles";
// DATA TYPES

// ==========================================================

// ==========================================================
export default function Navbar({
  border,
  elevation = 2,
  hideCategories = false,
}) {
  return (
    <div>
      <NavBarWrapper
        hoverEffect={false}
        elevation={elevation}
        border={border}
        justifyContent={"start"}
      >
        {hideCategories ? (
          <InnerContainer
            sx={{
              justifyContent: "start",
            }}
          >
            <NavigationList />
          </InnerContainer>
        ) : (
          <InnerContainer sx={{ justifyContent: "start" }}>
            {/* CATEGORY MEGA MENU */}
            <div>
              <Categories />
            </div>

            {/* HORIZONTAL MENU */}
            {/* <div className="header_nav">
              <NavigationList />
            </div> */}

            <HeaderCategories />
          </InnerContainer>
        )}
      </NavBarWrapper>
    </div>
  );
}
