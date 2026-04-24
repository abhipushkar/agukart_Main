import { permanentRedirect, notFound } from "next/navigation";
import ProductCategoriesSearchPageView from "pages-sections/product-categories-details/productCategories-search";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
import { Box, Typography, Chip } from "@mui/material";


const baseURL = process.env.NEXT_PUBLIC_BASE_URL;


export async function generateMetadata({ params }) {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const slugArray = params.slug || [];
  const slugPath = slugArray.join("/");

  // 🔥 2. FETCH CATEGORY SEO DATA
  const categoryRes = await fetch(
    `${baseURL}/get-category?slug=${slugPath}`,
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
        ...(current.meta_keywords
          ? current.meta_keywords.split(",").map(k => k.trim())
          : []),
        ...(current.search_terms || [])
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

export default async function ProductSearch({ params }) {
  const slugArray = params.slug || [];
  const slugPath = slugArray.join("/");
  console.log({ slugArray, slugPath, params })

  // 1. CHECK REDIRECT FIRST
  const resolveRes = await fetch(
    `${baseURL}/${slugPath}`,
    { cache: "no-store" }
  );

  // console.log(resolveRes);

  if (resolveRes.ok) {
    const resolveData = await resolveRes.json();

    if (resolveData.redirect && resolveData.newSlug) {
      permanentRedirect(`/category/${resolveData.newSlug}`);
    }
  }

  // 2. THEN FETCH CATEGORY
  const categoryRes = await fetch(
    `${baseURL}/get-category?slug=${slugPath}`,
    { cache: "no-store" }
  );

  if (!categoryRes.ok) {
    return notFound();
  }

  const categoryData = await categoryRes.json();


  const productRes = await fetch(
    `${baseURL}/get-product?categoryId=${categoryData?.current?._id}&page=1&limit=64`,
    { cache: "no-store" }
  );

  const productData = productRes.ok ? await productRes.json() : null;

  const breadcrumbRes = await fetch(
    `${baseURL}/get-category-by-slug/${slugPath}`,
    { cache: "no-store" }
  );

  const breadcrumbData = breadcrumbRes.ok ? await breadcrumbRes.json() : null;
  const title = categoryData?.current?.title || (slugArray.length ? slugArray[slugArray.length - 1] : "Category");
  const description = categoryData?.current?.description || "";
  const searchTerms = categoryData?.current?.search_terms || [];

  // 🔥 3. PASS DATA / SLUG TO CLIENT COMPONENT
  return (
    <>
      <ProductCategoriesSearchPageView
        slug={slugPath}
        initialCategory={categoryData}
        initialProducts={productData}
        initialBreadcrumb={breadcrumbData}
      />

      {/* Description */}
      <Box p={3}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          About {title}
        </Typography>

        <HtmlRenderer html={description} />
      </Box>

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
  );
}