import GiftCard from 'components/giftCardPage/GiftCard'
import React from 'react'

export const metadata = {
  title: "Gift Cards - Agukart Next.js E-commerce Template",
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
    <div><GiftCard id={params.id}/></div>
  )
}

export default page