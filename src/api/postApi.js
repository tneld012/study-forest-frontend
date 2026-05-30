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

// 👨🏻‍👨🏻‍👦🏻 게시글 생성
export async function createPost({ title, content }) {
  const response = await apiClient.post("/posts", {
    title,
    content,
  });

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻 게시글 상세 조회
export async function getPostDetail(postId) {
  const response = await apiClient.get(`/posts/${postId}`);

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻 게시글 삭제
export async function deletePost(postId) {
  const response = await apiClient.delete(`/posts/${postId}`);

  return response.data;
}