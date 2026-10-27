import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow the dev server to be reached over the LAN (e.g. http://192.168.x.x:3000).
  // Next.js blocks cross-origin dev requests by default, which prevents React
  // from hydrating when the app is opened via a non-localhost hostname.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.2*.*.*",
    "172.30.*.*",
    "172.31.*.*",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
