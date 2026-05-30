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

// 🗓️ 습관 생성
export async function createHabit(studyId, { name }) {
  const response = await apiClient.post(`/studies/${studyId}/habits`, {
    name,
  });

  return response.data;
}

// 🗓️ 습관 수정
export async function updateHabit(studyId, habitId, { name }) {
  const response = await apiClient.patch(
    `/studies/${studyId}/habits/${habitId}`,
    {
      name,
    }
  );

  return response.data;
}

// 🗓️ 습관 종료
export async function endHabit(studyId, habitId) {
  const response = await apiClient.delete(
    `/studies/${studyId}/habits/${habitId}`
  );

  return response.data;
}

// 🗓️ 주간 습관 기록표 조회
export async function getWeeklyHabitRecords(studyId, { startDate }) {
  const response = await apiClient.get(
    `/studies/${studyId}/habits/weekly-records`,
    {
      params: {
        startDate,
      },
    }
  );

  return response.data;
}