import { cache } from "react";
import { notFound } from "next/navigation";
import ProductCategoriesSearchPageView from "pages-sections/product-categories-details/productCategories-search";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
import { Box, Typography, Chip } from "@mui/material";


const baseURL = process.env.NEXT_PUBLIC_BASE_URL;


const getCategoryData = cache(async (slugPath) => {
  const res = await fetch(
    `${baseURL}/get-category?slug=${slugPath}`,
    {
      next: {
        revalidate: 10,
      },
    }
  );

  if (!res.ok) return null;

  return res.json();
});

const getBreadcrumbData = cache(async (slugPath) => {
  const res = await fetch(
    `${baseURL}/get-category-by-slug/${slugPath}`,
    {
      next: {
        revalidate: 10,
      },
    }
  );

  if (!res.ok) return null;

  return res.json();
});

const getInitialProducts = cache(async (categoryId) => {
  const res = await fetch(
    `${baseURL}/get-product?categoryId=${categoryId}&page=1&limit=64`,
    {
      next: {
        revalidate: 10,
      },
    }
  );

  if (!res.ok) return null;

  return res.json();
});


export async function generateMetadata({ params }) {

  const slugArray = params.slug || [];
  const slugPath = slugArray.join("/");

  // 🔥 2. FETCH CATEGORY SEO DATA
  const categoryData = await getCategoryData(slugPath);

  if (!categoryData) {
    return {
      title: "Not Found",
    };
  }

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

  // 2. THEN FETCH CATEGORY
  const categoryData = await getCategoryData(slugPath);

  if (!categoryData) {
    return notFound();
  }

  const [productData, breadcrumbData] = await Promise.all([
    getInitialProducts(categoryData?.current?._id),
    getBreadcrumbData(slugPath),
  ]);

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
  );
}