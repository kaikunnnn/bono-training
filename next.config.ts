import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["iconsax-react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.sanity.io",
      },
    ],
  },
};

export default nextConfig;
