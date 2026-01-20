"use client";
// LOCAL CUSTOM COMPONENTS
import MegaMenu1 from "../mega-menu/mega-menu-1";
import MegaMenu2 from "../mega-menu/mega-menu-2";
import CategoryListItem from "../category-list-item";
import useAuth from "hooks/useAuth";
// NAVIGATION DATA

import { categoryMenus } from "data/navigations";
// console.log("category-dropdown-linkcategory-dropdown-link" , categoryMenus);
// STYLED COMPONENT

import { StyledRoot } from "./styles";
import { useEffect, useState } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
// PROPS TYPE

export default function CategoryList({ open, position = "absolute" }) {
  const { token } = useAuth;
  const [categoryMenus, setCategoryMenus] = useState([]);
  const getCategoriesData = async () => {
    // const offset = calculateOffset(currentPage);

    try {
      const res = await getAPIAuth(`get-category`, token);
      console.log("getprofileres", res);
      if (res.status == 200) {
        setCategoryMenus(res?.data?.category);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };
  useEffect(() => {
    getCategoriesData();
  }, [token]);
  return (
    <StyledRoot open={open} position={position}>
      {categoryMenus?.map((item) => {
        const { title, slug, _id } = item;
        // const MegaMenu = component === MegaMenu1.name ? MegaMenu1 : MegaMenu2;
        return (
          <CategoryListItem
            _id={_id}
            item={item}
            key={title}
            title={title}
            subcategorySlug={slug}
          />
        );
      })}
    </StyledRoot>
  );
}
