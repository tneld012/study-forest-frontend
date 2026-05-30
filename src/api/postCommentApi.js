import apiClient from "./client.js";

// 👨🏻‍👨🏻‍👦🏻💬 게시글 댓글 목록 조회
export async function getPostComments(postId) {
  const response = await apiClient.get(`/posts/${postId}/comments`);

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻💬 게시글 댓글 작성
export async function createPostComment(postId, { content }) {
  const response = await apiClient.post(`/posts/${postId}/comments`, {
    content,
  });

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻💬 게시글 댓글 수정
export async function updatePostComment(postId, commentId, { content }) {
  const response = await apiClient.patch(
    `/posts/${postId}/comments/${commentId}`,
    {
      content,
    }
  );

  return response.data;
}

// 👨🏻‍👨🏻‍👦🏻💬 게시글 댓글 삭제
export async function deletePostComment(postId, commentId) {
  const response = await apiClient.delete(
    `/posts/${postId}/comments/${commentId}`
  );

  return response.data;
}