"use client";

import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
// MUI ICON COMPONENTS

import Place from "@mui/icons-material/Place";
import Person from "@mui/icons-material/Person";
import CreditCard from "@mui/icons-material/CreditCard";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import ShoppingBagOutlined from "@mui/icons-material/ShoppingBagOutlined";
// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box";
import { Paragraph, Span } from "components/Typography";
// CUSTOM ICON COMPONENT

import CustomerService from "icons/CustomerService";
import useMyProvider from "hooks/useMyProvider";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MessageIcon from "@mui/icons-material/Message";
import EmailIcon from "@mui/icons-material/Email";

// STYLED COMPONENTS

import { MainContainer, StyledNavLink } from "./styles";
import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
export default function Navigation() {
  const [navigationCount, setNavigationCount] = useState({});
  const pathname = usePathname();
  const { token } = useAuth();
  const { addresscount } = useMyProvider();
  const { usercredentials } = useMyProvider();
  const getNavigationCount = async()=>{
    try {
      const res = await getAPIAuth(
        "user/get-user-orders",
        token
      );
      if (res.status == 200) {
        setNavigationCount(res?.data);
      }
    } catch (error) {
      console.log("errro", error);
    }
  }
  useEffect(()=>{
    if(token){
      getNavigationCount();
    }
  },[token])
  const MENUS = [
    {
      title: "DASHBOARD",
      list: [
        {
          href: "/profile/orders",
          title: "Orders",
          Icon: ShoppingBagOutlined,
          count: navigationCount?.totalorders,
        },
        {
          href: "/profile/wish-list",
          title: "Wishlist",
          Icon: FavoriteBorder,
          count: navigationCount?.wishlist,
        },
        // {
        //   href: "/profile/support-tickets",
        //   title: "Support Tickets",
        //   Icon: CustomerService,
        //   count: 1,
        // },
        {
          href: "/profile/follow-shop",
          title: "Follow Shop",
          Icon: AddCircleOutlineIcon,
          count: navigationCount?.followedShops,
        },
        {
          href: "/messages",
          title: "Messages",
          Icon: MessageIcon,
          count: "",
        },
        {
          href: "/profile/add-gift-card",
          title: "Add Gift Card",
          Icon: AddCircleOutlineIcon,
          count: "",
        },
        {
          href: "/profile/transaction-history",
          title: "Transaction History",
          Icon: AddCircleOutlineIcon,
          count: "",
        },
      ],
    },

    {
      title: "ACCOUNT SETTINGS",
      list: [
        {
          href: "/profile",
          title: "Profile Info",
          Icon: Person,
          count: "",
        },
        {
          href: "/profile/change-email",
          title: "Change Email",
          Icon: EmailIcon,
          count: "",
        },
        {
          href: "/profile/change-pass",
          title: "Change Password",
          Icon: Person,
          count: "",
        },
        {
          href: "/profile/address",
          title: "Addresses",
          Icon: Place,
          count: `${addresscount ? addresscount : ""}`,
        },
      ],
    },
  ];
  const MENUS_FOR_AFFILIATE = [
    {
      title: "DASHBOARD",
      list: [
        // {
        //   href: "/profile/support-tickets",
        //   title: "Support Tickets",
        //   Icon: CustomerService,
        //   count: 1,
        // },
        {
          href: "/messages",
          title: "Messages",
          Icon: MessageIcon,
          count: 1,
        },
        {
          href: "/profile/follow-shop",
          title: "Follow Shop",
          Icon: AddCircleOutlineIcon,
          count: 1,
        }
      ],
    },

    {
      title: "ACCOUNT SETTINGS",
      list: [
        {
          href: "/profile",
          title: "Profile Info",
          Icon: Person,
          count: "",
        },
        {
          href: "/profile/change-email",
          title: "Change Email",
          Icon: EmailIcon,
          count: "",
        },
        {
          href: "/profile/change-pass",
          title: "Change Password",
          Icon: Person,
          count: "",
        }
      ],
    },
  ];

  console.log({ usercredentials });

  return (
    <MainContainer>
      {usercredentials?.designation_id == "4" ? (
        <>
          {
            MENUS_FOR_AFFILIATE.map((item) => {
              return (
                <Fragment key={item.title}>
                  <Paragraph p="26px 30px 1rem" color="grey.600" fontSize={12}>
                    {item.title}
                  </Paragraph>
                  {item.list.map(({ Icon, count, href, title }) => {
                    if (
                      usercredentials?.type === "google" &&
                      title === "Change Password"
                    ) {
                      return;
                    }
                    return (
                      <StyledNavLink
                        href={href}
                        key={title}
                        isCurrentPath={pathname.includes(href)}
                      >
                        <FlexBox alignItems="center" gap={1}>
                          <Icon
                            color="inherit"
                            fontSize="small"
                            className="nav-icon"
                          />
                          <Span>{title}</Span>
                        </FlexBox>

                        <Span>{count}</Span>
                      </StyledNavLink>
                    );
                  })}
                </Fragment>
              );
            })
          }
        </>
      ) : (
        <>
          {
            MENUS.map((item) => {
              return (
                <Fragment key={item.title}>
                  <Paragraph p="26px 30px 1rem" color="grey.600" fontSize={12}>
                    {item.title}
                  </Paragraph>
                  {item.list.map(({ Icon, count, href, title }) => {
                    if (
                      usercredentials?.type === "google" &&
                      title === "Change Password"
                    ) {
                      return;
                    }
                    return (
                      <StyledNavLink
                        href={href}
                        key={title}
                        isCurrentPath={pathname.includes(href)}
                      >
                        <FlexBox alignItems="center" gap={1}>
                          <Icon
                            color="inherit"
                            fontSize="small"
                            className="nav-icon"
                          />
                          <Span>{title}</Span>
                        </FlexBox>

                        <Span>{count}</Span>
                      </StyledNavLink>
                    );
                  })}
                </Fragment>
              );
            })
          }
        </>
      )}
    </MainContainer>
  );
}
