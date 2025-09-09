import AddGiftCard from 'components/giftCardPage/AddGiftCard'
import React from 'react'
export const metadata = {
  title: "Add Gift Card - Agukart Next.js E-commerce Template",
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
  return (
    <div><AddGiftCard/></div>
  )
}

export default page