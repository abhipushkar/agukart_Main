"use client";
import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";
import useMyProvider from "hooks/useMyProvider";
const HeaderCategories = () => {
  const { token } = useAuth();
  const [cat, setCat] = useState([]);
  const router = useRouter();
  const { usercredentials } = useMyProvider();

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

  useEffect(() => {
    getAdminCategory();
  }, []);

  const navigation = (cat) => {
    if (cat === "home") {
      router.push("/");
    } else if (cat === "gift-card-category") {
      router.push("/gift-card-category");
    } else {
      router.push(`/${cat.fullSlug}`);
    }
  };
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0, // critical in flex layouts
        overflow: "hidden",
      }}
      ml={3}
    >
      <Box
        className="category-scroll"
        sx={{
          display: "flex",
          overflowX: "auto",
          gap: 2,

          "&::-webkit-scrollbar": {
            height: "5px",
          },

          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "999px",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#9d9d9d96",
            borderRadius: "999px",
          },

          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#717171a6",
          },
        }}
      >
        <Button onClick={() => navigation("home")} sx={{ whiteSpace: "nowrap", flexShrink: 0, }}>
          Home
        </Button>
        {cat?.map((cat) => {
          return (
            <Button
              onClick={() => navigation(cat)}
              key={cat._id}
              sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
            >
              {cat.title}
            </Button>
          );
        })}
        {usercredentials?.designation_id != "4" && (
          <Button
            onClick={() => navigation("gift-card-category")}
            sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
          >
            Gift Card
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default HeaderCategories;
