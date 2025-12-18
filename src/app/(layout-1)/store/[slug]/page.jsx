import React from "react";
import ShopView from "components/shopView/ShopView";
export const metadata = {
  title: "Shop View - Agukart",
  description: `Agukart is a React. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [
    {
      name: "UI-LIB",
      url: "https://ui-lib.com",
    },
  ],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"],
};

const page = () => {
  return <ShopView />;
};

export default page;
