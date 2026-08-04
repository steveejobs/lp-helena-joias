import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/blog/loja-de-joias-em-araguaina",
        destination: "/loja-de-joias-em-araguaina",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
