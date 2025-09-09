"use client";

import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useToasts } from "react-toast-notifications";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DescriptionIcon from "@mui/icons-material/Description";
import MessageIcon from "@mui/icons-material/Message";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InfoIcon from "@mui/icons-material/Info";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import CreditCardIcon from "@mui/icons-material/CreditCard";

// MUI ICON COMPONENT

import PersonOutline from "@mui/icons-material/PersonOutline";
// CUSTOM ICON COMPONENT

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
// GLOBAL CUSTOM HOOK

import useCart from "hooks/useCart";
import { CART_ITEM, TOKEN_NAME, USER_DETAILS } from "constant";
import useHeader from "../hooks/use-header";
import useMyProvider from "hooks/useMyProvider";
import { googleLogout } from "@react-oauth/google";
import { Avatar, Collapse } from "@mui/material";
import { StarBorder } from "@mui/icons-material";
import { getAPIAuth } from "utils/__api__/ApiServies";
import Link from "next/link";
// ==============================================================

// ==============================================================
export default function LoginCartButtons({ toggleDialog, toggleSidenav }) {
  const [openOrder, setOpenOrder] = React.useState(false);

  const [openProfile, setOpenProfile] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [openTickets, setOpenTickets] = useState(false);
  const { token, setToken } = useAuth();
  const { dispatch } = useCart();

  const { setUserCredentials, usercredentials } = useMyProvider();
  const { addToast } = useToasts();
  const router = useRouter();
  const logoutHandle = async() => {
    try{
      const res = await getAPIAuth("user/logout", token);
      if (res.status === 200) {
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(USER_DETAILS);
        dispatch({ type: "INIT_CART", payload: [] });
        googleLogout();
        document.cookie =
          "TOKEN_NAME=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
        router.push("/login");
        setToken("");
        setUserCredentials("");
        addToast("User Logout Sucessfully!", {
          appearance: "success",
          autoDismiss: true,
        });
      }
    }catch(error){
      console.log(error);
      addToast("Something went wrong", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
  const { state } = useCart();
  const ICON_COLOR = {
    color: "grey.600",
  };

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
    setOpenOrder(false);
    setOpenProfile(false);
    setOpenTickets(false);
    setOpenAddress(false);
  };

  const handleClickOrder = () => {
    setOpenOrder(!openOrder);
  };

  return (
    <Badge sx={{ display: "flex", alignItems: "center" }}>
      {token ? (
        <>
          <Box>

            <IconButton
              sx={{
                borderRadius: "33px",
                transition: "background-color 500ms ease",
              }}
              onClick={handleOpenUserMenu}
            >
              <Typography component="div" display="flex" alignItems="center">
                  {usercredentials?.image ? (
                    <Avatar
                      src={usercredentials.image}
                      alt={usercredentials?.name || "User"}
                      sx={{ width: 30, height: 30 }}
                    />
                  ) : (
                    <AccountCircleIcon sx={{ color: "#7D879C" }} />
                  )}
                <ArrowDropDownIcon />
              </Typography>
            </IconButton>
            <Menu
              sx={{
                mt: "45px",
                ".MuiList-root": {
                  padding: "0",
                },
              }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* <MenuItem style={{ padding: "0" }} > */}

              <List
                sx={{
                  padding: "0",
                  width: "100%",
                  maxWidth: 360,
                  bgcolor: "background.paper",
                }}
                component="nav"
              >
                <MenuItem disableGutters>
                  <Link href="/profile" passHref legacyBehavior>
                    <ListItemButton
                      component="a"
                      sx={{
                        backgroundColor: "#e6f3ff", 
                        py: 2,
                        px: 3,
                        borderTopLeftRadius: "12px",
                        borderTopRightRadius: "12px",
                        "&:hover": {
                          backgroundColor: "#d0eaff",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: "#7D879C" }}>
                         {usercredentials?.image ? (
                            <Avatar
                              src={usercredentials.image}
                              alt={usercredentials?.name || "User"}
                              sx={{ width: 32, height: 32 }}
                            />
                          ) : (
                            <AccountCircleIcon />
                          )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            component="h6"
                            fontSize={16}
                            fontWeight={600}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {usercredentials?.name}
                          </Typography>
                        }
                        secondary={
                          <Typography fontSize={13} color="text.secondary">
                            View your profile
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </Link>
                </MenuItem>
                {
                  usercredentials?.designation_id != "4" && <>
                    <MenuItem style={{ padding: "0" }}>
                      <Link href="/profile/orders" passHref>
                        <ListItemButton component="a">
                          <ListItemIcon>
                            <DescriptionIcon />
                          </ListItemIcon>
                          <ListItemText>Purchases and reviews</ListItemText>
                        </ListItemButton>
                      </Link>
                    </MenuItem>

                    <MenuItem style={{ padding: "0" }}>
                      <Link href="/profile/wish-list" passHref>
                        <ListItemButton component="a">
                          <ListItemIcon>
                            <MessageIcon />
                          </ListItemIcon>
                          <ListItemText>WishList</ListItemText>
                        </ListItemButton>
                      </Link>
                    </MenuItem>
                  </>
                }
                {/* <MenuItem style={{ padding: "0" }}>
                  <ListItemButton>
                    <ListItemIcon>
                      <MessageIcon />
                    </ListItemIcon>
                    <ListItemText>Message</ListItemText>
                  </ListItemButton>
                </MenuItem> */}

                {/* <MenuItem style={{ padding: "0" }}>
                  <ListItemButton onClick={handleClickOrder}>
                    <ListItemIcon>
                      <InboxIcon />
                    </ListItemIcon>
                    <ListItemText primary="Order" />
                    {openOrder ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </MenuItem>

                <Collapse in={openOrder} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() => router.push("/orders")}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <FormatListBulletedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Order List" />
                      </ListItemButton>
                    </MenuItem>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() =>
                          router.push(
                            "/orders/f0ba538b-c8f3-45ce-b6c1-209cf07ba5f8"
                          )
                        }
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="Order Details" />
                      </ListItemButton>
                    </MenuItem>
                  </List>
                </Collapse> */}

                {/* <MenuItem style={{ padding: "0" }}>
                  <ListItemButton onClick={() => setOpenProfile((prv) => !prv)}>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                    {openProfile ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </MenuItem>

                <Collapse in={openProfile} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() => router.push("/profile")}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <FormatListBulletedIcon />
                        </ListItemIcon>
                        <ListItemText primary="View Profile" />
                      </ListItemButton>
                    </MenuItem>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() =>
                          router.push(
                            "/profile/e42e28ea-528f-4bc8-81fb-97f658d67d75"
                          )
                        }
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="Edit Profile" />
                      </ListItemButton>
                    </MenuItem>
                  </List>
                </Collapse> */}

                {/* <MenuItem style={{ padding: "0" }}>
                  <ListItemButton onClick={() => setOpenAddress((prv) => !prv)}>
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Address" />
                    {openAddress ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </MenuItem>

                <Collapse in={openAddress} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() => router.push("/address")}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <FormatListBulletedIcon />
                        </ListItemIcon>
                        <ListItemText primary="Address List" />
                      </ListItemButton>
                    </MenuItem>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() =>
                          router.push(
                            "/address/d27d0e28-c35e-4085-af1e-f9f1b1bd9c34"
                          )
                        }
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="Add Address" />
                      </ListItemButton>
                    </MenuItem>
                  </List>
                </Collapse> */}
                {/* 
                <MenuItem style={{ padding: "0" }}>
                  <ListItemButton onClick={() => setOpenTickets((prv) => !prv)}>
                    <ListItemIcon>
                      <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Support Tickets" />
                    {openTickets ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </MenuItem>

                <Collapse in={openTickets} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() => router.push("/support-tickets")}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <FormatListBulletedIcon />
                        </ListItemIcon>
                        <ListItemText primary="All Tickets" />
                      </ListItemButton>
                    </MenuItem>
                    <MenuItem style={{ padding: "0" }}>
                      <ListItemButton
                        onClick={() =>
                          router.push(
                            "/support-tickets/when-will-my-product-arrive"
                          )
                        }
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="Tickets Details" />
                      </ListItemButton>
                    </MenuItem>
                  </List>
                </Collapse> */}
                <ListItemButton
                  onClick={logoutHandle}
                  sx={{ margin: "5px 0", borderTop: "1px solid #ebebeb" }}
                >
                  <ListItemIcon>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>logout</ListItemText>
                </ListItemButton>
              </List>
              {/* </MenuItem> */}
            </Menu>
          </Box>
        </>
      ) : (
        <IconButton
          onClick={toggleDialog}
          sx={{
            borderRadius: "30px",
            padding: "5px 5px",
            transition: "background-color 500ms ease",
          }}
        >
          <Typography sx={{ fontWeight: "500" }}>Sign in</Typography>
        </IconButton>
      )}
      {
        usercredentials?.designation_id != "4" &&   <Badge badgeContent={state?.cart?.reduce((total, cartItem) => total + cartItem?.products?.length, 0)} color="primary">
        <IconButton onClick={toggleSidenav}>
          <ShoppingCartIcon sx={ICON_COLOR} />
        </IconButton>
      </Badge>
      }
    </Badge>
  );
}
