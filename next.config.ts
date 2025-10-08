import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Enable highest quality modern formats when supported
    formats: ["image/avif", "image/webp"],
    // Extend device sizes to support ultra‑high resolutions (5K/6K/8K)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840, 5120, 6144, 7680],
    // Allow remote Shopify CDN images if used
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.cdn.shopify.com" },
      { protocol: "https", hostname: "shopify.com" },
    ],
  },
  async redirects() {
    const host = process.env.NEXT_PUBLIC_SITE_HOST || "www.solace-golf.com";
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `:domain` }],
        permanent: true,
        destination: `https://${host}/:path*`,
      },
    ];
  },
};

export default nextConfig;
