import apiClient from "./client.js";

// 📘💬 스터디 댓글 목록 조회
export async function getStudyComments(studyId) {
  const response = await apiClient.get(`/studies/${studyId}/comments`);

  return response.data;
}

// 📘💬 스터디 댓글 작성
export async function createStudyComment(studyId, { content }) {
  const response = await apiClient.post(`/studies/${studyId}/comments`, {
    content,
  });

  return response.data;
}

// 📘💬 스터디 댓글 수정
export async function updateStudyComment(studyId, commentId, { content }) {
  const response = await apiClient.patch(
    `/studies/${studyId}/comments/${commentId}`,
    {
      content,
    }
  );

  return response.data;
}

// 📘💬 스터디 댓글 삭제
export async function deleteStudyComment(studyId, commentId) {
  const response = await apiClient.delete(
    `/studies/${studyId}/comments/${commentId}`
  );

  return response.data;
}