import apiClient from "./client";

// 🔐 회원가입 요청
export async function register({ email, nickname, password }) {
  const response = await apiClient.post("/auth/register", {
    email,
    nickname,
    password,
  });

  return response.data; // 백엔드에서 보낸 회원가입 결과 데이터 반환
}

// 🔐 로그인 요청
export async function login({ email, password }) {
  const response = await apiClient.post("/auth/login", {
    email,
    password,
  });

  return response.data; // 로그인 성공 메시지 및 유저 데이터 반환
}

// 🔐 로그아웃 요청
export async function logout() {
  const response = await apiClient.post("/auth/logout");

  return response.data; // 로그아웃 완료 응답 반환
}

// 🔐 현재 로그인된 내 정보(세션) 조회
export async function getMe() {
  const response = await apiClient.get("/auth/me");

  return response.data; // 내 프로필 데이터 반환
}

// 🔐 비밀번호 재설정 이메일 발송 요청
export async function requestPasswordReset({ email }) {
  const response = await apiClient.post("/auth/password-reset/request", {
    email,
  });

  return response.data; // 이메일 발송 결과 응답 반환
}

// 🔐 새 비밀번호로 변경 확정 요청
export async function resetPassword({ token, newPassword }) {
  const response = await apiClient.post("/auth/password-reset/confirm", {
    token,
    newPassword,
  });

  return response.data; // 비밀번호 변경 완료 응답 반환
}