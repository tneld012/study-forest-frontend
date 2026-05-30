import apiClient from "./client.js";

// 📘😉 스터디 이모지 목록 조회
export async function getStudyEmojis(studyId) {
  const response = await apiClient.get(`/studies/${studyId}/emojis`);

  return response.data;
}

// 📘😉 스터디 이모지 반응 추가
export async function addStudyEmoji(studyId, { emojiUnifiedCode }) {
  const response = await apiClient.post(`/studies/${studyId}/emojis`, {
    emojiUnifiedCode,
  });

  return response.data;
}