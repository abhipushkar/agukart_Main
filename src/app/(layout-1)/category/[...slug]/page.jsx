import { permanentRedirect, notFound } from "next/navigation";
import ProductCategoriesSearchPageView from "pages-sections/product-categories-details/productCategories-search";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

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

  // 🔥 3. PASS DATA / SLUG TO CLIENT COMPONENT
  return (
    <ProductCategoriesSearchPageView
      slug={slugPath}
      initialCategory={categoryData}
      initialProducts={productData}
      initialBreadcrumb={breadcrumbData}
    />
  );
}