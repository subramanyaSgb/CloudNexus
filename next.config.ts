import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: "./src/lib/utils/empty-module.ts" },
      net: { browser: "./src/lib/utils/empty-module.ts" },
      tls: { browser: "./src/lib/utils/empty-module.ts" },
      path: { browser: "./src/lib/utils/empty-module.ts" },
      os: { browser: "./src/lib/utils/empty-module.ts" },
    },
  },
};

export default nextConfig;
