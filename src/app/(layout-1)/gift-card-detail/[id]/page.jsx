
import GiftCardDetail from 'components/giftCardPage/GiftCardDetail'
import React from 'react'

export const metadata = {
  title: "Gift Card Details - Agukart Next.js E-commerce Template",
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
  return (
    <div><GiftCardDetail id={params.id}/></div>
  )
}

export default page