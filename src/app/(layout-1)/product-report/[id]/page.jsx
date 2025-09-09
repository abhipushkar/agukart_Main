import React from "react";
import ProductReport from "components/ProductReport/ProductReport";

export const metadata = {
  title: "Product Report - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [
    {
      name: "UI-LIB",
      url: "https://ui-lib.com",
    },
  ],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"],
};

const page = ({params}) => {
  const id = params.id
  return <ProductReport id={id}/>;
};

export default page;
