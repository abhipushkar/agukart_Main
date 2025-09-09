import MenuItem from "@mui/material/MenuItem";
import TouchRipple from "@mui/material/ButtonBase";
import useTheme from "@mui/material/styles/useTheme";
// MUI ICON COMPONENT

import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
// GLOBAL CUSTOM COMPONENT

import BazaarMenu from "components/BazaarMenu";
// STYLED COMPONENT

import { DropDownHandler } from "../styles";
// DATA

import { categories } from "../categories";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
// ==============================================================

// ==============================================================
export default function CategoryDropdown({ title, handleChange,cat }) {
  const { breakpoints } = useTheme();

  // const [cat, setCat] = useState([]);

  // const getCategories = async () => {
  //   try {
  //     const res = await getAPIAuth("get-category");
  //     if (res.status === 200) {
  //       setCat([{title:"All Categories"},...res?.data?.category]);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // console.log(cat,'hthththth')

  // useEffect(() => {
  //   getCategories();
  // }, []);

  

  return (
    <BazaarMenu
      direction="left"
      sx={{
        zIndex: breakpoints.down("md") ? 99999 : 1502,
      }}
      handler={(e) => (
        <DropDownHandler component={TouchRipple} onClick={e}>
          {title}
          <KeyboardArrowDownOutlined fontSize="small" color="inherit" />
        </DropDownHandler>
      )}
      options={(onClose) => {
        return cat?.map((item) => (
          <MenuItem
            key={item._id}
            onClick={() => {
              handleChange(item);
              onClose();
            }}
          >
            {item.title}
          </MenuItem>
        ));
      }}
    />
  );
}
