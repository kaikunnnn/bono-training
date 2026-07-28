import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["iconsax-react"],
  experimental: {
    optimizePackageImports: ["iconsax-react", "lucide-react"],
  },
  async rewrites() {
    return [
      // /docs/xxx → public/docs/xxx.html（拡張子なしURLで静的ドキュメントを配信）
      {
        source: "/docs/:slug",
        destination: "/docs/:slug.html",
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
      },
      {
        protocol: "https",
        hostname: "uploads-ssl.webflow.com",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "bo-no.design",
      },
      {
        protocol: "https",
        hostname: "*.bo-no.design",
      },
      {
        protocol: "https",
        hostname: "*.st-note.com",
      },
    ],
  },
};

export default nextConfig;
