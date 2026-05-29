import apiClient from "./client.js";

// 🗓️ 습관 목록 조회
export async function getHabits(studyId) {
  const response = await apiClient.get(`/studies/${studyId}/habits`);

  return response.data;
}

// 🗓️ 습관 체크
export async function checkHabit(studyId, habitId) {
  const response = await apiClient.post(
    `/studies/${studyId}/habits/${habitId}/check`
  );

  return response.data;
}

// 🗓️ 습관 체크 해제
export async function uncheckHabit(studyId, habitId) {
  const response = await apiClient.delete(
    `/studies/${studyId}/habits/${habitId}/check`
  );

  return response.data;
}