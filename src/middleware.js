import { NextResponse } from "next/server";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  // =========================================================
  // 🔥 SEO PRODUCT REDIRECTS
  // =========================================================

  if (pathname.startsWith("/product/")) {
    const segments = pathname.split("/").filter(Boolean);

    // /product/[slug]/[product_code]
    if (segments.length === 3) {
      const slug = segments[1];
      const product_code = segments[2];

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/product/${slug}/${product_code}`,
          {
            cache: "no-store",
          }
        );

        if (res.ok) {
          const data = await res.json();

          if (data?.redirect && data?.newSlug) {
            const redirectUrl = new URL(data.newSlug, request.url);
            // Preserve query parameters
            redirectUrl.search = request.nextUrl.search;
            return NextResponse.redirect(redirectUrl, 301);
          }
        }
      } catch (err) {
        console.error("Product redirect middleware error:", err);
      }
    }
  }

  // =========================================================
  // 🔥 SEO CATEGORY REDIRECTS
  // =========================================================

  if (pathname.startsWith("/category/")) {
    const slugPath = pathname.replace("/category/", "");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/${slugPath}`,
        {
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();

        if (data?.redirect && data?.newSlug) {
          const redirectUrl = new URL(`/category/${data.newSlug}`, request.url);
          // Preserve query parameters
          redirectUrl.search = request.nextUrl.search;
          return NextResponse.redirect(redirectUrl, 301);
        }
      }
    } catch (err) {
      console.error("Category redirect middleware error:", err);
    }
  }

  // =========================================================
  // 🌍 COUNTRY BLOCK LOGIC
  // =========================================================

  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0].trim()) || request.ip || '127.0.0.1';
  
  let data = {};

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/get-country-by-ip?ip=${ip}`
    );
    data = await res.json();
  } catch (error) {
    console.error("Failed to fetch location data for IP", ip);
    return NextResponse.next();
  }

  const userCountry = data?.data?.country;
  let blockedCountries = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/get-blocked-country`
    );
    data = await res.json();
    blockedCountries = data?.result?.map((country) => country.name);
  } catch (error) {
    console.error("Failed to fetch blocked country data");
    return NextResponse.next();
  }

  if (blockedCountries.includes(userCountry) && request.nextUrl.pathname !== '/blocked') {
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

  // =========================================================
  // 🔐 PROTECTED ROUTES
  // =========================================================

  const protectedPaths = [
    "/messages",
    "/messages/:path*",
    "/profile/:path*",
    "/profile/address",
    "/profile",
    "/profile/change-pass",
    "/profile/wish-list",
    "/profile/change-email",
    "/change-social-email",
    "/delivery-address",
  ];

  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path.replace("/:path*", ""))
  );

  if (isProtectedPath) {
    const token = request.cookies.get("TOKEN_NAME");

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/:path*'],  // Match all routes including root
};