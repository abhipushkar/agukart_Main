import GroceryThreePageView from "pages-sections/grocery-3/page-view";
export const metadata = {
  title: "Grocery 3 - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [{
    name: "UI-LIB",
    url: "https://ui-lib.com"
  }],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};
export default async function GroceryThree() {
  return <GroceryThreePageView />;
}