import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 판매글 사진 업로드를 위해 서버 액션 본문 크기 한도를 8MB로 늘림(기본 1MB)
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
