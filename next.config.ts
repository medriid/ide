import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Enable production source maps for better error tracking (optional)
  productionBrowserSourceMaps: false,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
