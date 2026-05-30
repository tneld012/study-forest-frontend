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

// 👨🏻‍👨🏻‍👦🏻 게시글 수정
export async function updatePost(postId, { title, content }) {
  const response = await apiClient.patch(`/posts/${postId}`, {
    title,
    content,
  });

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻 게시글 좋아요 추가
export async function likePost(postId) {
  const response = await apiClient.post(`/posts/${postId}/likes`);

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻 게시글 좋아요 취소
export async function unlikePost(postId) {
  const response = await apiClient.delete(`/posts/${postId}/likes`);

  return response.data;
}