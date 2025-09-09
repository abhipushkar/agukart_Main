import { CartPageView } from "pages-sections/cart/page-view";
import Mycart from "pages-sections/cart/page-view/Mycart";
export const metadata = {
  title: "Cart - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [{
    name: "UI-LIB",
    url: "https://ui-lib.com"
  }],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};
export default function Cart() {
  return (
    <>
     <Mycart />
    </>
  )


  // <CartPageView />;
}