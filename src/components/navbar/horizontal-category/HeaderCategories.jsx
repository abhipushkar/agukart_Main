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
      router.push(`/product?slug=${cat.slug}&title=${cat.title}&id=${cat._id}`);
    }
  };
  return (
    <Box sx={{ display: "flex", gap: "16px", marginLeft: "24px" }}>
      <Button onClick={() => navigation("home")} sx={{ whiteSpace: "nowrap" }}>
        Home
      </Button>
      {cat?.map((cat) => {
        return (
          <Button
            onClick={() => navigation(cat)}
            key={cat._id}
            sx={{ whiteSpace: "nowrap" }}
          >
            {cat.title}
          </Button>
        );
      })}
      {usercredentials?.designation_id != "4" && (
        <Button
          onClick={() => navigation("gift-card-category")}
          sx={{ whiteSpace: "nowrap" }}
        >
          Gift Card
        </Button>
      )}
    </Box>
  );
};

export default HeaderCategories;
