import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite 프로젝트 빌드 및 개발 서버 설정
export default defineConfig({
  // 개발에 필요한 확장 도구(플러그인)들
  plugins: [react(), tailwindcss()],
});