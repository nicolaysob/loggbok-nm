import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Feltbilder komprimeres i nettleseren, men server action må tåle noen MB
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
