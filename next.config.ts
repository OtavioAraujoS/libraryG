import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.steampowered.com",
      },
      {
        protocol: "http",
        hostname: "**.steampowered.com",
      },
      {
        protocol: "https",
        hostname: "**.epicgames.com",
      },
      {
        protocol: "https",
        hostname: "**.gog-statics.com",
      },
      {
        protocol: "https",
        hostname: "**.gog.com",
      },
    ],
  },
};

export default nextConfig;
