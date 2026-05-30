import apiClient from "./client.js";

// 👨🏻‍👨🏻‍👦🏻 게시글 목록 조회
export async function getPostList({
  page = 1,
  pageSize = 10,
  keyword = "",
  sort = "recent",
} = {}) {
  const response = await apiClient.get("/posts", {
    params: {
      page,
      pageSize,
      keyword,
      sort,
    },
  });

  return response.data;
}