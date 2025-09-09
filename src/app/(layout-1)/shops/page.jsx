import { notFound } from "next/navigation"; 
// API FUNCTIONS

import api from "utils/__api__/shop"; 
// PAGE VIEW COMPONENT

import { ShopsPageView } from "pages-sections/shops/page-view";
export const metadata = {
  title: "Shops - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [{
    name: "UI-LIB",
    url: "https://ui-lib.com"
  }],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};
export default async function Shops() {
  try {
    const shops = await api.getShopList();
    return <ShopsPageView shops={shops} />;
  } catch (error) {
    notFound();
  }
}