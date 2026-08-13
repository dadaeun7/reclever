import type { NextConfig } from "next";
import path from "path";
import { BACK_BASE } from "./app/constants/Default";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/reclever",
  // 빌드 추적 범위를 무조건 현재 폴더로 제한
  outputFileTracingRoot: path.join(__dirname, "./"),

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
    ];
  },
};

export default nextConfig;
