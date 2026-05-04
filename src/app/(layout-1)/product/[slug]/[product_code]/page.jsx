import MyproductDetails from "pages-sections/product-details/page-view/MyproductDetails";
import SimilarProducts from "pages-sections/product-details/page-view/SimilarProducts/SimilarProducts";
import ShopProducts from "pages-sections/product-details/page-view/ShopProducts/ShopProducts";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

async function resolveSlug(slug, product_code) {
    const res = await fetch(
        `${baseUrl}/product/${slug}/${product_code}`,
        { cache: "no-store" }
    );

    console.log(res);
    if (!res.ok) return null;

    return res.json();
}

export async function generateMetadata({ params }) {

    const slug = params.slug;
    const product_code = params.product_code;

    const resolved = await resolveSlug(slug, product_code);
    console.log(resolved);

    if (resolved?.redirect) {
        redirect(`${resolved.newSlug}`);
    }

    const res = await fetch(
        `${baseUrl}/get-productById?productId=${product_code}`,
        { cache: "no-store" }
    );

    const data = await res.json();

    return {
        title: data?.data?.meta_title ?? "",
        description: data?.data?.meta_description ?? "",
        keywords: data?.data?.meta_keywords ?? [],
    };
}

export default async function ProductDetails({ params }) {

    const product_code = params.product_code;

    const res = await fetch(
        `${baseUrl}/get-productById?productId=${product_code}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch product");
    }

    const data = await res.json();
    const productid = data?.data._id;


    const [similarProducts, shopProducts] = await Promise.all([
        fetch(`${baseUrl}/get-similar-product?productId=${productid}`).then(r => r.json()),
        fetch(`${baseUrl}/get-similar-vendor-product?productId=${productid}`).then(r => r.json())
    ]);

    return (
        <>
            <MyproductDetails res={data} />

            <SimilarProducts
                similarProducts={similarProducts?.data}
                imageBaseUrl={similarProducts?.image_url}
                videoBaseUrl={similarProducts?.video_url}
            />

            <ShopProducts
                shopProducts={shopProducts?.data}
                imageBaseUrl={shopProducts?.image_url}
                videoBaseUrl={shopProducts?.video_url}
            />
        </>
    );
}
