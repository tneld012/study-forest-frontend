import apiClient from "./client.js";

// 🅿️ 오늘의 집중 기록 생성 + 포인트 적립
export async function createFocusSession(
  studyId,
  { targetSeconds, elapsedSeconds, status }
) {
  const response = await apiClient.post(`/studies/${studyId}/focus-sessions`, {
    targetSeconds,
    elapsedSeconds,
    status,
  });

  return response.data;
}