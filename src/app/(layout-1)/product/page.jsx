import React from 'react'
import ProductSlug from 'components/product-slug/ProductSlug';


export const metadata = {
    title: "Product Search - Agukart Next.js E-commerce Template",
    description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
    authors: [{
      name: "UI-LIB",
      url: "https://ui-lib.com"
    }],
    keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
  };

const page = () => {
  return (
    <ProductSlug/>
  )
}

export default page