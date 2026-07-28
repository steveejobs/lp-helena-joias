import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Product files are validated to 4 MB; the extra room covers multipart fields.
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
