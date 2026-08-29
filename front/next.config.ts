import type { NextConfig } from "next";
import path from "path";

const BACK_BASE = process.env.NEXT_PUBLIC_BACK_BASE;

const nextConfig: NextConfig = {
  output: "standalone",
  // 빌드 추적 범위를 무조건 현재 폴더로 제한
  outputFileTracingRoot: path.join(__dirname, "./"),
  turbopack: {}, // Turbopack 경고 비활성화
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/get/gmail",
        destination: BACK_BASE + "/get/gmail",
      },
      {
        source: "/history",
        destination: BACK_BASE + "/notify/list",
      },
      {
        source: "/submit/:path*",
        destination: BACK_BASE + "/submit/:path*",
      },
      {
        source: "/get/recommand/:path*",
        destination: BACK_BASE + "/get/recommand/:path*",
      },
      {
        source: "/update/:path*",
        destination: BACK_BASE + "/update/:path*",
      },
    ];
  },
};

export default nextConfig;
