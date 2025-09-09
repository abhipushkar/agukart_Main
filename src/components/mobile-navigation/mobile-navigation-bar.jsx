"use client";

import Badge from "@mui/material/Badge";
import useMediaQuery from "@mui/material/useMediaQuery";
// CUSTOM ICON COMPONENTS

import Home from "icons/Home";
import User2 from "icons/User2";
import CategoryOutlined from "icons/CategoryOutline";
import ShoppingBagOutlined from "icons/ShoppingBagOutlined";
// GLOBAL CUSTOM HOOK

import useCart from "hooks/useCart";
import useMyProvider from "hooks/useMyProvider";
// STYLED COMPONENTS

import { iconStyle, StyledNavLink, Wrapper } from "./styles";
export default function MobileNavigationBar() {
  const {
    state
  } = useCart();
  const { usercredentials } = useMyProvider();
  const list = [{
    title: "Home",
    Icon: Home,
    href: "/"
  }, {
    title: "Category",
    Icon: CategoryOutlined,
    href: "/mobile-category-nav"
  }, {
    title: "Cart",
    Icon: ShoppingBagOutlined,
    href: "/cart"
  }, {
    title: "Account",
    Icon: User2,
    href: "/profile"
  }];

  const list_for_affiliate = [{
    title: "Home",
    Icon: Home,
    href: "/"
  }, {
    title: "Category",
    Icon: CategoryOutlined,
    href: "/mobile-category-nav"
  }, {
    title: "Account",
    Icon: User2,
    href: "/profile"
  }];
  const DOWN_900 = useMediaQuery(theme => theme.breakpoints.down(900));

  if (DOWN_900) {
    return <Wrapper style={{ display: "none" }}>
      {
        usercredentials?.designation_id != "4"
          ? list?.map(({ Icon, href, title }) => (
            <StyledNavLink href={href} key={title}>
              {title === "Cart" ? (
                <Badge
                  badgeContent={state?.cart?.reduce(
                    (total, cartItem) => total + cartItem?.products?.length,
                    0
                  )}
                  color="primary"
                >
                  <Icon fontSize="small" sx={iconStyle} />
                </Badge>
              ) : (
                <Icon sx={iconStyle} fontSize="small" />
              )}
              {title}
            </StyledNavLink>
          ))
          : list_for_affiliate?.map(({ Icon, href, title }) => (
            <StyledNavLink href={href} key={title}>
                <Icon sx={iconStyle} fontSize="small" />
              {title}
            </StyledNavLink>
          ))
      }
    </Wrapper>;
  }

  return null;
}
