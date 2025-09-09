/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: { theme: "DEFAULT", currency: "USD" },
  publicRuntimeConfig: { theme: "DEFAULT", currency: "USD" },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ui-lib.com" },
      { protocol: "http", hostname: "ecommerce.imgglobal.in" },
    ],
    domains: [
      "images.entitysport.com",
      "159.89.164.11",
      "i.etsystatic.com",
      "d13ir53smqqeyp.cloudfront.net",
      "ecommerce.imgglobal.in", 
      "api.ecommerce.imgglobal.in",
      "admin.ecommerce.imgglobal.in",
      "project.imgglobal.in",
      "api.agukart.com",
    ],
    // domains: ['i.etsystatic.com'],
  }
};

module.exports = nextConfig;
