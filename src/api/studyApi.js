import apiClient from "./client.js";

// 📘 스터디 목록 조회 (페이징, 검색, 정렬 포함)
export async function getStudyList({
  page = 1,
  pageSize = 6,
  keyword = "",
  sort = "recent",
} = {}) {
  const response = await apiClient.get("/studies", {
    params: {
      page,
      pageSize,
      keyword,
      sort,
    },
  });

  return response.data; // 스터디 목록 데이터 및 페이지네이션 정보 데이터 반환
}