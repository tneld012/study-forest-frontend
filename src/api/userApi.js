import apiClient from "./client.js";

// 🏠 마이페이지 요약 조회
export async function getMySummary() {
  const response = await apiClient.get("/users/me/summary");

  return response.data;
}

// 🏠 내 스터디 목록 조회
export async function getMyStudies({ page = 1, pageSize = 10 } = {}) {
  const response = await apiClient.get("/users/me/studies", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
}

// 🏠 내 게시글 목록 조회
export async function getMyPosts({ page = 1, pageSize = 10 } = {}) {
  const response = await apiClient.get("/users/me/posts", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
}

// 🏠 내 댓글 목록 조회
export async function getMyComments() {
  const response = await apiClient.get("/users/me/comments");

  return response.data;
}

// 🏠 내 집중 기록 목록 조회
export async function getMyFocusSessions({ page = 1, pageSize = 10 } = {}) {
  const response = await apiClient.get("/users/me/focus-sessions", {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
}