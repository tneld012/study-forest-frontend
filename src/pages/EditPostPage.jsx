import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { getPostDetail, updatePost } from "../api/postApi.js";

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function EditPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  // 1. 폼 데이터 관련 상태 (기존 데이터 로드 후 초기화 예정)
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  // 2. 초기 데이터 로딩 및 수정 제출 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // 내부 유틸리티 및 폼 핸들링 함수
  // =============================================================================
  
  // 지정된 필드의 값을 업데이트하는 공통 함수
  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 실시간 필드별 에러 메시지 검증
  const errors = {
    title:
      form.title.length > 0 && form.title.trim().length < 2
        ? "제목은 최소 2글자 이상 입력해야 합니다."
        : form.title.trim().length > 50
          ? "제목은 최대 50글자 이하로 입력해야 합니다."
          : "",
    content:
      form.content.length > 0 && form.content.trim().length < 2
        ? "내용은 최소 2글자 이상 입력해야 합니다."
        : form.content.trim().length > 1000
          ? "내용은 최대 1000글자 이하로 입력해야 합니다."
          : "",
  };

  // 전체 폼 유효성 검증 (버튼 비활성화 여부)
  const isFormValid =
    form.title.trim().length >= 2 &&
    form.title.trim().length <= 50 &&
    form.content.trim().length >= 2 &&
    form.content.trim().length <= 1000;

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 기존 게시글 데이터 로드 및 폼 상태 동기화
  const loadPost = async () => {
    try {
      setIsLoading(true);

      const response = await getPostDetail(postId);
      const post = response.data;

      setForm({
        title: post.title,
        content: post.content,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "게시글 정보를 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `edit-post-load-error-${postId}`,
      });

      // 불러오기 실패 시 커뮤니티 목록으로 튕겨내기
      navigate("/community");
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 사용자 인터랙션 이벤트 핸들러 구역
  // =============================================================================
  
  // 게시글 수정 제출 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 유효하지 않은 폼이거나 이미 제출 중인 경우 차단
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await updatePost(postId, {
        title: form.title.trim(),
        content: form.content.trim(),
      });

      toast.success("게시글이 수정되었습니다!");
      // 수정 성공 후 해당 게시글 상세 페이지로 복귀
      navigate(`/community/${postId}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "게시글 수정 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 수정할 게시글의 기존 데이터를 불러오기 위한 훅 호출
  useEffect(() => {
    loadPost();
  }, [postId]);

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        게시글 정보를 불러오는 중입니다...
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">게시글 수정</h1>
      <p className="mt-2 text-sm text-gray-600">
        작성한 내용을 다시 정리해보세요.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {/* 제목 입력 필드 (공통 Input 컴포넌트 사용) */}
        <Input
          id="postTitle"
          label="제목"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="제목을 입력해주세요"
          errorMessage={errors.title}
        />

        {/* 내용 입력 필드 */}
        <div>
          <label
            htmlFor="postContent"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            내용
          </label>

          <textarea
            id="postContent"
            value={form.content}
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="내용을 입력해주세요"
            className={[
              "min-h-56 w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition",
              "placeholder:text-gray-400",
              errors.content
                ? "border-[#D9534F] focus:border-[#D9534F]"
                : "border-[#D9D6CE] focus:border-[#99C08E]",
            ].join(" ")}
          />

          {/* 내용 에러 메시지 조건부 렌더링 */}
          {errors.content && (
            <p className="mt-2 text-sm text-[#D9534F]">{errors.content}</p>
          )}
        </div>

        {/* 하단 액션 버튼 구역 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(`/community/${postId}`)}
          >
            취소
          </Button>

          <Button type="submit" disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </Button>
        </div>
      </form>
    </section>
  );
}