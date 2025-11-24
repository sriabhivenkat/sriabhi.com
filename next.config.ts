import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "home.sriabhi.com",
        pathname: "/api/v1/photo/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/*"
      }
    ]
  },
};

export default nextConfig;
