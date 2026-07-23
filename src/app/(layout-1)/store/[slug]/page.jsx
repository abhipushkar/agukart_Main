import { notFound } from "next/navigation";
import { cache } from "react";
import ShopView from "components/shopView/ShopView";
import ShopUnavailable from "components/shopView/ShopUnavailable";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const getVendorDetails = cache(async (slug) => {
  const res = await fetch(
    `${baseURL}/getVendorDetailsBySlug/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return null;

  return res.json();
});

export async function generateMetadata({ params }) {
  const vendor = await getVendorDetails(params.slug);

  if (!vendor) {
    return {
      title: "Shop Not Found | Agukart",
    };
  }

  const data = vendor.data;

  return {
    title: data.meta_title || data.shop_name || "Agukart",

    description:
      data.meta_description ||
      data.shop_title ||
      "",

    keywords: data.meta_keyword || [],

    openGraph: {
      title: data.meta_title || data.shop_name,
      description:
        data.meta_description ||
        data.shop_title,
      images: data.shop_icon
        ? [
          {
            url: data.shop_icon,
          },
        ]
        : [],
    },

    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_WEB_URL}/store/${params.slug}`,
    },
  };
}

export default async function Page({ params }) {
  const vendor = await getVendorDetails(params.slug);

  if (!vendor) {
    notFound();
  }

  const members = vendor.data?.members?.map((member) => ({
    ...member,
    imageUrl: member.images
      ? `${vendor.data?.member_image_url}${member.images}`
      : "",
  }));
  const shop_photos = vendor.data?.shop_photos?.map((shop) => ({
    ...shop,
    imageUrl: shop.image
      ? `${vendor.data?.member_image_url}${shop.image}`
      : "",
  }));
  // console.log({slug: params.slug, data: vendor.data, members, shop_photos })

  if (vendor.isDisabled) return (
    <ShopUnavailable
      vendorDetail={{ ...vendor.data, members, shop_photos }}
    />
  );

  return (
    <ShopView
      initialVendor={{ ...vendor.data, members, shop_photos }}
      isDisabled={vendor.isDisabled}
      slug={params.slug}
    />
  );
}