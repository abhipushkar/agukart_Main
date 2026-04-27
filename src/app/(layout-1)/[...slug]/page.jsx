import React from 'react'
import ProductSlug from 'components/product-slug/ProductSlug';
import { permanentRedirect, notFound } from 'next/navigation';
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
import { Box, Typography, Chip } from "@mui/material";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;


export async function generateMetadata({ params }) {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const slugArray = params.slug || [];
  const slugPath = slugArray.join("/");

  // 🔥 2. FETCH CATEGORY SEO DATA
  const categoryRes = await fetch(
    `${baseURL}/get-admin-category-by-slug/${slugPath}`,
    { cache: "no-store" }
  );

  if (!categoryRes.ok) {
    return {
      title: "Not Found",
    };
  }

  const categoryData = await categoryRes.json();
  const current = categoryData?.current || {};

  return {
    title: current.meta_title || current.title || "Agukart",
    description: current.meta_description || "",
    keywords: Array.from(
      new Set([
        ...(current.meta_keyword
          ? current.meta_keyword.split(",").map(k => k.trim())
          : []),
        ...(current.search_term || [])
      ])
    ),
    openGraph: {
      title: current.meta_title || current.title,
      description: current.meta_description,
      type: "website",
    },

    alternates: {
      canonical: `${baseURL}/category/${slugPath}`,
    },
  };
}


const page = async ({ params }) => {
  const slugArray = params.slug || [];
  const slugPath = slugArray.join("/");

  const resolveRes = await fetch(
    `${baseURL}/${slugPath}`,
    { cache: "no-store" }
  );

  if (resolveRes.ok) {
    const resolveData = await resolveRes.json();

    if (resolveData.redirect && resolveData.newSlug) {
      permanentRedirect(`/${resolveData.newSlug}`);
    }
  }

  // 🔥 2. BREADCRUMB + CURRENT
  const breadcrumbRes = await fetch(
    `${baseURL}/get-admin-category-by-slug/${slugPath}`,
    { cache: "no-store" }
  );


  if (!breadcrumbRes.ok) return notFound();

  const breadcrumbData = await breadcrumbRes.json();
  const current = breadcrumbData?.current;
  const id = current?._id;

  // 🔥 3. CHILD CATEGORIES
  const childRes = await fetch(`${baseURL}/getAdminSubcategory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
    cache: "no-store",
  });

  const childData = childRes.ok ? await childRes.json() : { data: [] };

  // 🔥 4. PRODUCTS (SSR now)
  const productRes = await fetch(
    `${baseURL}/getProductBySlug/${slugPath}?page=1&limit=64`,
    { cache: "no-store" }
  );


  const productData = productRes.ok ? await productRes.json() : null;
  const title = breadcrumbData?.current?.title;
  const description = breadcrumbData?.current?.description || "";
  const searchTerms = breadcrumbData?.current?.search_term || [];


  return (
    <>
      <ProductSlug
        slug={slugPath}
        current={current}
        breadcrumbs={breadcrumbData?.data || []}
        children={childData?.data || []}
        initialProducts={productData}
      />


      {/* Description */}
      {description.length > 0 && (<Box p={3}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          About {title}
        </Typography>

        <HtmlRenderer html={description} />
      </Box>)}

      {/* Search Tags */}
      {searchTerms.length > 0 && (<Box my={1} p={3}>
        <Typography variant="h6" fontWeight={500} mb={2}>
          Related Searches
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {searchTerms.map((term, index) => (
            <Chip
              key={index}
              label={term}
              clickable
              sx={{
                borderRadius: "16px",
                fontSize: "14px",
                backgroundColor: "#f5f5f5",   // light gray background
                color: "#222",                // dark text
                fontWeight: 500,
                border: "1px solid #e0e0e0",
                transition: "all 0.2s ease",

                "&:hover": {
                  backgroundColor: "#ededed", // slightly darker on hover
                  borderColor: "#e9e9e9",
                  color: "#000",
                },

                "&:active": {
                  backgroundColor: "#ddd",
                }
              }}
            />
          ))}
        </Box>
      </Box>)}

    </>
  )
}

export default page