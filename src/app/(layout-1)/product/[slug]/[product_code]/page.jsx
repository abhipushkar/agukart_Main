import { cache } from "react";
import { notFound } from "next/navigation";

import MyproductDetails from "pages-sections/product-details/page-view/MyproductDetails";
import SimilarProducts from "pages-sections/product-details/page-view/SimilarProducts/SimilarProducts";
import ShopProducts from "pages-sections/product-details/page-view/ShopProducts/ShopProducts";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const getProductData = cache(async (product_code) => {

    const res = await fetch(
        `${baseUrl}/get-productById?productId=${product_code}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        return null;
    }

    return res.json();
});

export async function generateMetadata({ params }) {

    const product_code = params.product_code;

    const data = await getProductData(product_code);

    if (!data?.data) {
        return {
            title: "Product Not Found",
        };
    }

    const product = data.data;

    return {
        title: product?.meta_title || product?.product_name || "Agukart",

        description: product?.meta_description || "",

        keywords: Array.from(
            new Set([
                ...(Array.isArray(product?.meta_keywords)
                    ? product.meta_keywords

                    : typeof product?.meta_keywords === "string"
                        ? product.meta_keywords
                            .split(",")
                            .map((k) => k.trim())
                        : []),

                ...(product?.search_terms || []),
            ])
        ),

        openGraph: {
            title:
                product?.meta_title ||
                product?.product_name ||
                "Agukart",

            description:
                product?.meta_description || "",

            type: "website",
        },

        alternates: {
            canonical: `${baseUrl}/product/${params.slug}/${product_code}`,
        },
    };
}

export default async function ProductDetails({ params }) {

    const product_code = params.product_code;

    const data = await getProductData(product_code);

    if (!data?.data) {
        return notFound();
    }

    const productid = data?.data?._id;

    const [similarProducts, shopProducts] = await Promise.all([

        fetch(
            `${baseUrl}/get-similar-product?productId=${productid}`,
            {
                cache: "no-store",
            }
        ).then((r) => r.json()),

        fetch(
            `${baseUrl}/get-similar-vendor-product?productId=${productid}`,
            {
                cache: "no-store",
            }
        ).then((r) => r.json()),
    ]);

    return (
        <>
            <MyproductDetails res={data} />

            <SimilarProducts
                similarProducts={similarProducts?.data || []}
                imageBaseUrl={similarProducts?.image_url || ""}
                videoBaseUrl={similarProducts?.video_url || ""}
            />

            <ShopProducts
                shopProducts={shopProducts?.data || []}
                imageBaseUrl={shopProducts?.image_url || ""}
                videoBaseUrl={shopProducts?.video_url || ""}
            />
        </>
    );
}