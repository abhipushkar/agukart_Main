import { NextResponse } from "next/server";

export async function middleware(request) {
  const ip = (request.headers.get('x-forwarded-for')?.split(',')[0].trim()) || request.ip || '127.0.0.1';
  console.log("Real IP Address: ", ip); 
  let data = {};
  try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-country-by-ip?ip=${ip}`);
    data = await res.json();
    console.log("location data", data);
  }catch(error){
    console.error("Failed to fetch location data for IP", ip);
    return NextResponse.next();
  }

  const userCountry = data?.data?.country;
  console.log({userCountry})
  let blockedCountries = [];

  try{
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/get-blocked-country`);
    data = await res.json();
    console.log("blocked country", data); 
    blockedCountries = data?.result?.map((country) => country.name);
    console.log({blockedCountries})
  }catch(error){
    console.error("Failed to fetch blocked country data");
    return NextResponse.next();
  }

  if (blockedCountries.includes(userCountry) && request.nextUrl.pathname !== '/blocked') {
    return NextResponse.redirect(new URL('/blocked', request.url));
  }

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
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = request.cookies.get("TOKEN_NAME");

    // If token does not exist, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If the token exists or the route is not protected, allow the request to proceed
  return NextResponse.next();

}

export const config = {
  matcher: ['/', '/:path*'],  // Match all routes
};
