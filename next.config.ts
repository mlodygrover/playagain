import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // <--- TO JEST KLUCZOWE DLA THREE.JS
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // <--- Te dwie gwiazdki oznaczają "wszystkie domeny"
      },
    ],
  },
};


export default nextConfig;