import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./drizzle/**"],
    "/app/**": ["./drizzle/**"],
  },
};

export default nextConfig;
