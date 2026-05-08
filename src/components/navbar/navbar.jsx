import Categories from "./categories";
import NavigationList from "./nav-list";
import "./nav.css";
import HeaderCategories from "./horizontal-category/HeaderCategories";
import { NavBarWrapper, InnerContainer } from "./styles";
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
  sx={{ justifyContent: "flex-start" }}
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
            <HeaderCategories />
          </InnerContainer>
        )}
      </NavBarWrapper>
    </div>
  );
}