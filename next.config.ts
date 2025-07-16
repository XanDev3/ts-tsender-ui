import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: "out",
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "",
  assetPrefix: "./",
  trailingSlash: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
