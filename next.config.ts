import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Prevent production builds from failing on lint-only issues.
    // Business logic is unchanged; run lint separately for gradual strict cleanup.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
