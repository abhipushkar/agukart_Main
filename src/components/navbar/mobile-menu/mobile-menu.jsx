import { Fragment, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
// MUI ICON COMPONENTS

import Menu from "@mui/icons-material/Menu";
import Clear from "@mui/icons-material/Clear";
// GLOBAL CUSTOM COMPONENT

import Scrollbar from "components/scrollbar";
// RENDER MENU LEVEL FUNCTION

import { renderLevels } from "./render-levels";
// NAVIGATION DATA LIST
import { updateNavigation } from "./modified-navigation";
import useMyProvider from "hooks/useMyProvider";
import { useRouter } from "next/navigation";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { Button } from "@mui/material";
import { BorderBottom } from "@mui/icons-material";
export default function MobileMenu() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [cat, setCat] = useState([]);
  const [categoryMenus, setCategoryMenus] = useState([]);
  const { usercredentials } = useMyProvider();
  const { token } = useAuth();
  const router = useRouter();

  const handleClose = () => setOpenDrawer(false);

  const navigation = (cat) => {
    if (cat === "home") {
      router.push("/");
    } else if (cat === "gift-card-category") {
      router.push("/gift-card-category");
    } else {
      router.push(`/product?slug=${cat.slug}&title=${cat.title}&id=${cat._id}`);
    }
    setOpenDrawer(false);
  };

  const getAdminCategory = async () => {
    try {
      const res = await getAPIAuth("get-admin-menu-category", token);
      if (res.status === 200) {
        setCat(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCategoriesData = async () => {
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
    getAdminCategory();
    getCategoriesData();
  }, []);

  return (
    <Fragment>
      <IconButton
        onClick={() => setOpenDrawer(true)}
        sx={{
          flexShrink: 0,
          color: "grey.600",
        }}
      >
        <Menu />
      </IconButton>

      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={handleClose}
        sx={{
          zIndex: 15001,
        }}
      >
        <Box width="100vw" height="100%" position="relative">
          <Scrollbar
            autoHide={false}
            sx={{
              height: "100vh",
            }}
          >
            <Box
              px={5}
              py={8}
              maxWidth={500}
              margin="auto"
              position="relative"
              height="100%"
            >
              {/* CLOSE BUTTON */}
              <IconButton
                onClick={handleClose}
                sx={{
                  position: "absolute",
                  right: 30,
                  top: 15,
                }}
              >
                <Clear fontSize="small" />
              </IconButton>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginLeft: "24px",
                  alignItems: "start",
                }}
              >
                <Button
                  onClick={() => navigation("home")}
                  sx={{
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid transparent",
                    "&:hover": {
                      borderBottom: "1px solid black",
                    },
                  }}
                >
                  Home
                </Button>
                {cat?.map((cat) => {
                  return (
                    <Button
                      onClick={() => navigation(cat)}
                      key={cat._id}
                      sx={{
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid transparent",
                        "&:hover": {
                          borderBottom: "1px solid black",
                        },
                      }}
                    >
                      {cat.title}
                    </Button>
                  );
                })}
                {usercredentials?.designation_id != "4" && (
                  <Button
                    onClick={() => navigation("gift-card-category")}
                    sx={{
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid transparent",
                      "&:hover": {
                        borderBottom: "1px solid black",
                      },
                    }}
                  >
                    Gift Card
                  </Button>
                )}
                {categoryMenus?.map((cat) => {
                  return (
                    <Button
                      onClick={() => {
                        router.push(
                          `/products-categories/search/${cat?.slug}?title=${cat?.title}&_id=${cat?._id}`,
                        );
                        setOpenDrawer(false);
                      }}
                      key={cat._id}
                      sx={{
                        whiteSpace: "nowrap",
                        borderBottom: "1px solid transparent",
                        "&:hover": {
                          borderBottom: "1px solid black",
                        },
                      }}
                    >
                      {cat.title}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Scrollbar>
        </Box>
      </Drawer>
    </Fragment>
  );
}
