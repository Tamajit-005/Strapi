import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow ALL HTTPS images (production - Vercel, CDN, etc.)
      {
        protocol: "https",
        hostname: "**",
      },

      // Allow ALL HTTP images (development - Strapi running on localhost)
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;