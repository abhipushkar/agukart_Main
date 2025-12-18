import MyproductDetails from "pages-sections/product-details/page-view/MyproductDetails";

export async function generateMetadata({ params }) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/get-productById?productId=${params.productId}`,
        { cache: "no-store" }
    );
    const data = await res.json();

    return {
        title: data?.data?.meta_title ?? data?.data?.description,
        description: data?.data?.meta_description ?? "",
        keywords: data?.data?.meta_keywords ?? [],
    };
}

export default async function ProductDetails({ params }) {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/get-productById?productId=${params.productId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch product");
    }

    const data = await res.json();

    return <MyproductDetails res={data} />;
}
