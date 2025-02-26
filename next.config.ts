import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
