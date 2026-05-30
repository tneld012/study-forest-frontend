import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import Button from "../components/common/Button.jsx";
import {
  deletePost,
  getPostDetail,
  likePost,
  unlikePost,
} from "../api/postApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  // 인증 및 권한 관련 상태
  const { user, isLoggedIn } = useAuth();

  // 1. 게시글 상세 정보 관련 상태
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 2. 삭제 처리 로딩 상태 관리
  const [isDeleting, setIsDeleting] = useState(false);

  // 3. 좋아요 상호작용 관련 상태 관리
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);

  // 파생 상태 연산: 현재 로그인한 유저가 게시글 작성자인지 여부 확인
  const isMine = user?.userId === post?.authorId;

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 게시글 단건 단일 디테일 조회
  const loadPostDetail = async () => {
    try {
      setIsLoading(true);

      const response = await getPostDetail(postId);

      setPost(response.data);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      const message =
        error.response?.data?.message || "게시글 상세 정보를 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `post-detail-error-${postId}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 사용자 인터랙션 이벤트 핸들러 구역
  // =============================================================================
  
  // 게시글 삭제 핸들러
  const handleDeletePost = async () => {
    const isConfirmed = window.confirm("게시글을 삭제하시겠습니까?");

    // 사용자가 취소했거나 이미 삭제 처리가 진행 중인 경우 차단
    if (!isConfirmed || isDeleting) return;

    try {
      setIsDeleting(true);

      await deletePost(postId);

      toast.success("게시글이 삭제되었습니다.");
      // 삭제 성공 후 커뮤니티 메인 목록으로 이동
      navigate("/community");
    } catch (error) {
      const message =
        error.response?.data?.message || "게시글 삭제 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // 좋아요 / 좋아요 취소 토글 핸들러
  const handleToggleLike = async () => {
    // 비로그인 사용자가 접근 시 차단 및 알림
    if (!isLoggedIn) {
      toast.info("로그인이 필요합니다.");
      return;
    }

    try {
      setIsLikeSubmitting(true);

      if (isLiked) {
        // 이미 좋아요 상태라면 취소 API 호출
        await unlikePost(postId);

        setIsLiked(false);
        setPost((prev) => ({
          ...prev,
          likeCount: Math.max((prev?.likeCount ?? 1) - 1, 0),
        }));

        toast.success("좋아요를 취소했습니다.");
      } else {
        // 좋아요 상태가 아니라면 등록 API 호출
        await likePost(postId);

        setIsLiked(true);
        setPost((prev) => ({
          ...prev,
          likeCount: (prev?.likeCount ?? 0) + 1,
        }));

        toast.success("좋아요를 눌렀습니다.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "좋아요 처리 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsLikeSubmitting(false);
    }
  };

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 컴포넌트 마운트 시 및 URL 파라미터(postId)가 변경될 때마다 디테일 데이터 로드
  useEffect(() => {
    loadPostDetail();
  }, [postId]);

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        게시글을 불러오는 중입니다...
      </section>
    );
  }

  if (!post) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        게시글을 찾을 수 없습니다.
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="space-y-8">
      {/* 게시글 상단 정보 및 본문 영역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              to="/community"
              className="text-sm font-semibold text-[#578246]"
            >
              ← 커뮤니티로 돌아가기
            </Link>

            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
              {post.title}
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              {post.author?.nickname ?? "알 수 없음"} ·{" "}
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>

          {/* 본인 글일 때만 수정/삭제 버튼 구역 노출 */}
          {isMine && (
            <div className="flex gap-2">
              <Link to={`/community/${post.postId}/edit`}>
                <Button variant="secondary">수정</Button>
              </Link>

              <Button
                variant="danger"
                onClick={handleDeletePost}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          )}
        </div>

        {/* 게시글 본문 내용 */}
        <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-[#F6F4EF] p-6 leading-7 text-gray-700">
          {post.content}
        </div>

        {/* 하단 반응 정보 및 로그인 권유 문구 */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* 좋아요 토글 버튼 */}
          <Button
            variant={isLiked ? "primary" : "secondary"}
            onClick={handleToggleLike}
            disabled={isLikeSubmitting}
            className="flex flex-row items-center justify-center gap-1.5"
          >
            {isLikeSubmitting ? (
              "처리 중..."
            ) : (
              <>
                {isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />}
                <span>{post.likeCount}</span>
              </>
            )}
          </Button>

          <span className="text-sm text-gray-500">
            댓글 {post.commentCount}
          </span>

          {!isLoggedIn && (
            <span className="text-sm text-gray-400">
              로그인하면 좋아요와 댓글을 남길 수 있어요.
            </span>
          )}
        </div>
      </div>

      {/* 게시글 하단 댓글 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">댓글</h2>
        <p className="mt-4 text-gray-500">
          게시글 댓글은 다음 단계에서 연결할 예정입니다.
        </p>
      </div>
    </section>
  );
}