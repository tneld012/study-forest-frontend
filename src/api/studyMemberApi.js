import apiClient from "./client.js";

// 🎫 내 스터디 멤버십 조회
export async function getMyStudyMembership(studyId) {
  const response = await apiClient.get(`/studies/${studyId}/members/me`);

  return response.data;
}

// 🎫 스터디 참여하기
export async function joinStudy(studyId) {
  const response = await apiClient.post(`/studies/${studyId}/members/join`);

  return response.data;
}

// 🎫 스터디 탈퇴하기
export async function leaveStudy(studyId) {
  const response = await apiClient.post(`/studies/${studyId}/members/leave`);

  return response.data;
}