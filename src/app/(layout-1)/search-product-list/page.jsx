import ProductSearchPage from "pages-sections/search/ProductSearchPage";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const search = params?.q || "";

  return {
    title: search
      ? `Search results for "${search}" | Agukart`
      : "Product Search | Agukart",
    description: search
      ? `Explore products matching "${search}" on Agukart.`
      : "Search and discover unique products on Agukart.",
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function Search({ searchParams }) {
  const params = await searchParams;

  const queryString = new URLSearchParams(params).toString();

  let initialData = {
    data: [],
    filters: {
      price: {},
      brands: [],
      ratings: [],
      dynamicFields: {},
    },
    pagination: {
      totalPages: 1,
    },
    base_url: "",
    video_base_url: "",
  };

  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(
      `${baseURL}/search-product-list?${queryString}&limit=64&page=1`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
    console.log(response.body, response)
    
    if (response.ok) {
      const result = await response.json();
      initialData = {
        data: result?.data || [],
        filters: result?.filters || {
          price: {},
          brands: [],
          ratings: [],
          dynamicFields: {},
        },
        pagination: result?.pagination || {
          totalPages: 1,
        },
        base_url: result?.base_url || "",
        video_base_url: result?.video_base_url || "",
      };
    }
  } catch (error) {
    console.error("Error fetching search products:", error);
  }

  return (
    <ProductSearchPage
      initialData={initialData}
      initialSearchParams={params}
    />
  );
}