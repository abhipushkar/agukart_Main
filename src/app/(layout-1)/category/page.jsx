import { permanentRedirect, notFound } from "next/navigation";
import AllCategoriesSearchPageView from "pages-sections/all-category/allCategory-search";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
import { Box, Typography, Chip } from "@mui/material";


const baseURL = process.env.NEXT_PUBLIC_BASE_URL;


export function generateMetadata({ params }) {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    return {
        title: "All Categories - Agukart | Shop Everything in One Place",

        description: "Browse all categories on Agukart. Discover a wide range of products across fashion, electronics, home essentials, and more at the best prices.",

        keywords: [
            "Agukart categories",
            "shop all categories",
            "online shopping Worldwide",
            "buy products online",
            "fashion electronics home",
            "best deals online",
            "Agukart products",
        ],

        openGraph: {
            title: "All Categories - Agukart",
            description:
                "Explore all product categories on Agukart and find everything you need in one place.",
            type: "website",
        },

        alternates: {
            canonical: `${baseURL}/categories`, // IMPORTANT: not /category/${slugPath}
        },
    };
}

export default async function AllCategory({ params }) {

    // FETCH CATEGORY
    const categoryRes = await fetch(
        `${baseURL}/get-category`,
        { cache: "no-store" }
    );

    if (!categoryRes.ok) {
        return notFound();
    }

    const categoryData = await categoryRes.json();


    const productRes = await fetch(
        `${baseURL}/get-product?page=1&limit=64`,
        { cache: "no-store" }
    );

    const productData = productRes.ok ? await productRes.json() : null;

    // 🔥 3. PASS DATA / SLUG TO CLIENT COMPONENT
    return (
            <AllCategoriesSearchPageView
                slug={"Jwellery"}
                initialCategory={categoryData || {}}
                initialProducts={productData||{}}
                initialBreadcrumb={{}} 
            />
    );
}