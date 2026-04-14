import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@meshsdk/core", "@meshsdk/react"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
