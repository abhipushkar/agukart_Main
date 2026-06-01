import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
    Box,
    Typography,
    Chip,
} from "@mui/material";

import MyproductDetails from "pages-sections/product-details/page-view/MyproductDetails";
import SimilarProducts from "pages-sections/product-details/page-view/SimilarProducts/SimilarProducts";
import ShopProducts from "pages-sections/product-details/page-view/ShopProducts/ShopProducts";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

/* =========================================================
   HELPERS
========================================================= */

const normalizeKeywords = (keywords) => {
    if (Array.isArray(keywords)) {
        return keywords;
    }

    if (typeof keywords === "string") {
        return keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean);
    }

    return [];
};

/* =========================================================
   CACHED PRODUCT FETCH
========================================================= */

const getProductData = cache(async (product_code) => {
    const res = await fetch(
        `${baseUrl}/get-productById?productId=${product_code}`,
        {
            next: {
                revalidate: 5,
            },
        }
    );

    if (!res.ok) {
        return null;
    }

    return res.json();
});

/* =========================================================
   SEO METADATA
========================================================= */

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
        title:
            product?.meta_title ||
            product?.product_name ||
            "Agukart",

        description:
            product?.meta_description || "",

        keywords: Array.from(
            new Set([
                ...normalizeKeywords(product?.meta_keywords),
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

/* =========================================================
   PAGE
========================================================= */

export default async function ProductDetails({ params }) {
    const product_code = params.product_code;

    const data = await getProductData(product_code);

    if (!data?.data) {
        return notFound();
    }

    const product = data.data;

    const productid = product._id;

    const searchTerms = product?.search_terms || [];

    /* =========================================================
       PARALLEL FETCHES
    ========================================================= */

    const [similarProducts, shopProducts] = await Promise.all([
        fetch(
            `${baseUrl}/get-similar-product?productId=${productid}`,
            {
                next: {
                    revalidate: 120,
                },
            }
        ).then((r) => r.json()),

        fetch(
            `${baseUrl}/get-similar-vendor-product?productId=${productid}`,
            {
                next: {
                    revalidate: 120,
                },
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

            {/* SEARCH TERMS */}
            {searchTerms.length > 0 && (
                <Box my={1} p={3}>
                    <Typography
                        variant="h6"
                        fontWeight={500}
                        mb={2}
                    >
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
                            <Link
                                key={`${term}-${index}`}
                                href={`/search-product-list?q=${encodeURIComponent(term)}`}
                                style={{ textDecoration: "none" }}
                            >
                                <Chip
                                    label={term}
                                    clickable
                                    sx={{
                                        borderRadius: "16px",
                                        fontSize: "14px",
                                        backgroundColor: "#f5f5f5",
                                        color: "#222",
                                        fontWeight: 500,
                                        border: "1px solid #e0e0e0",
                                        transition: "all 0.2s ease",

                                        "&:hover": {
                                            backgroundColor: "#ededed",
                                            borderColor: "#e9e9e9",
                                            color: "#000",
                                        },

                                        "&:active": {
                                            backgroundColor: "#ddd",
                                        },
                                    }}
                                />
                            </Link>
                        ))}
                    </Box>
                </Box>
            )}
        </>
    );
}