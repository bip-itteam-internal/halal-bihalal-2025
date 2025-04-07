import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"]
  },
  webpack(config) {
    config.cache = {
      type: "filesystem",
      compression: "gzip",
      allowCollectingMemory: true
    }
    return config;
  }
};

export default nextConfig;
