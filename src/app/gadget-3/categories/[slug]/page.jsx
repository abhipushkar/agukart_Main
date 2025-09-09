
// PAGE VIEW COMPONENT
import { GadgetThreeCategoriesPageView } from "pages-sections/gadget-3/page-view"; 
// CUSTOM DATA MODEL

export const metadata = {
  title: "Gadget Products - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [{
    name: "UI-LIB",
    url: "https://ui-lib.com"
  }],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};
export default function GadgetThreeCategories({
  params
}) {
  return <GadgetThreeCategoriesPageView slug={params.slug} />;
}