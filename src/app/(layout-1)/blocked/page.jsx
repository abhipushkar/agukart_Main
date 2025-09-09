import React from 'react'

export const metadata = {
  title: "Blocked - Agukart Next.js E-commerce Template",
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
    <div>
        <h1>Access Denied</h1>
        <p>Your country is restricted from accessing this page.</p>
    </div>
  )
}

export default page
