import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoids a known dev-only RSC / webpack issue on Windows (SegmentViewNode + missing *.js chunks).
  experimental: {
    devtoolSegmentExplorer: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
