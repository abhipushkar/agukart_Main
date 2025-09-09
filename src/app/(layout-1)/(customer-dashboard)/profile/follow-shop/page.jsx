import React from "react";
import FollowShop from "components/follow-shop/FollowShop";

export const metadata = {
  title: "Market 1 - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [
    {
      name: "UI-LIB",
      url: "https://ui-lib.com",
    },
  ],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"],
};

const page = () => {
  return <FollowShop />;
};

export default page;
