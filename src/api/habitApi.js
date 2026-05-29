import apiClient from "./client.js";

// 🗓️ 습관 목록 조회
export async function getHabits(studyId) {
  const response = await apiClient.get(`/studies/${studyId}/habits`);

  return response.data;
}