import type { NextConfig } from "next";

const portalDevOrigin =
  process.env.PORTAL_DEV_ORIGIN ?? "http://localhost:3001";

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
  // Local parity with production: proxy /complain/* to the Hinza Public app (basePath=/complain).
  async rewrites() {
    return [
      {
        source: "/complain",
        destination: `${portalDevOrigin}/complain`,
      },
      {
        source: "/complain/:path*",
        destination: `${portalDevOrigin}/complain/:path*`,
      },
    ];
  },
};

export default nextConfig;
