import axios from "axios";

// Axios 인스턴스 생성 (백엔드와 통신할 공통 클라이언트 설정)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 환경 변수에 등록된 백엔드 API 기본 주소 사용
  withCredentials: true,                     // 서로 다른 포트 간에 쿠키(JWT 토큰 등)를 자동으로 주고받도록 허용
});

export default apiClient;