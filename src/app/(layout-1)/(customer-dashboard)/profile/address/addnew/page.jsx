
import AddNewAddressDetailsPageView from "pages-sections/customer-dashboard/address/page-view/adress-new";
// API FUNCTIONS

import api from "utils/__api__/address";
export const metadata = {
  title: "Address - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [{
    name: "UI-LIB",
    url: "https://ui-lib.com"
  }],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};
export default async function Address() {
  return <AddNewAddressDetailsPageView  />;
}