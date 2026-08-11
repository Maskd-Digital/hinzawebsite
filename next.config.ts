import type { NextConfig } from "next";

const portalOrigin =
  process.env.PORTAL_ORIGIN ??
  (process.env.VERCEL
    ? "https://hinzawebsite-complain.vercel.app"
    : "http://localhost:3001");

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
  // Proxy /complain/* to the intake app (basePath=/complain).
  async rewrites() {
    return [
      {
        source: "/complain",
        destination: `${portalOrigin}/complain`,
      },
      {
        source: "/complain/:path*",
        destination: `${portalOrigin}/complain/:path*`,
      },
    ];
  },
};

export default nextConfig;
