import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { resetPassword } from "../api/authApi.js";

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function ResetPasswordPage() {
  // 라우팅 및 쿼리 스트링 파싱을 위한 훅 선언
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 쿼리 스트링에서 인증 토큰(?token=...) 추출 및 메모이제이션
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  // 새 비밀번호 입력 폼 상태 관리
  const [form, setForm] = useState({
    newPassword: "",
    newPasswordConfirm: "",
  });

  // 데이터 로딩 동기 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false); // API 요청 중 버튼 중복 클릭 차단용

  // 입력 필드 값 변경 공통 핸들러 함수
  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // =============================================================================
  // 실시간 입력 데이터 유효성 검사 및 에러 메시지 객체 배정 구역
  // =============================================================================
  const errors = {
    // 새 비밀번호 글자수 검사 (최소 8자)
    newPassword:
      form.newPassword.length > 0 && form.newPassword.length < 8
        ? "새 비밀번호는 최소 8글자 이상이어야 합니다."
        : "",
    // 새 비밀번호 2차 확인 일치 여부 검사
    newPasswordConfirm:
      form.newPasswordConfirm.length > 0 &&
      form.newPassword !== form.newPasswordConfirm
        ? "비밀번호가 일치하지 않습니다."
        : "",
  };

  // 토큰이 존재하고, 모든 폼 항목이 조건을 충족했는지 유효성 검사
  const isFormValid =
    token.length > 0 &&
    form.newPassword.length >= 8 &&
    form.newPassword === form.newPasswordConfirm;

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================

  // 비밀번호 재설정 폼 제출(Submit) 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault(); // submit 기본 동작인 페이지 새로고침 방지

    // 폼 양식이 올바르지 않거나 이미 통신 중인 경우 가드 절(Early Return)로 실행 차단
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 백엔드 비밀번호 재설정(확인) API 요청 실행
      await resetPassword({
        token,
        newPassword: form.newPassword,
      });

      toast.success("비밀번호가 재설정되었습니다.");
      // 변경 성공 후 로그인 페이지로 리다이렉트
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "비밀번호 재설정 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  
  // URL에 비밀번호 재설정 토큰이 누락되었거나 비어있을 때 노출할 에러 뷰
  if (!token) {
    return (
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#578246]">
          재설정 링크 오류
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          비밀번호 재설정 토큰이 없습니다. 다시 비밀번호 재설정을 요청해주세요.
        </p>

        {/* 다시 요청할 수 있도록 링크 제공 */}
        <Link
          to="/password-reset"
          className="mt-6 inline-block font-semibold text-[#578246]"
        >
          비밀번호 재설정 다시 요청하기
        </Link>
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역 (토큰이 유효할 때만 렌더링)
  // =============================================================================
  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      {/* 상단 타이틀 및 소개 문구 구역 */}
      <h1 className="text-2xl font-bold text-[#578246]">
        새 비밀번호 설정
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        앞으로 사용할 새 비밀번호를 입력해주세요.
      </p>

      {/* 비밀번호 재설정 입력 폼 구역 */}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {/* 새 비밀번호 입력 컴포넌트 */}
        <Input
          id="newPassword"
          label="새 비밀번호"
          type="password"
          value={form.newPassword}
          onChange={(event) => updateField("newPassword", event.target.value)}
          placeholder="새 비밀번호를 입력해주세요"
          autoComplete="new-password"
          errorMessage={errors.newPassword}
        />

        {/* 새 비밀번호 재확인 입력 컴포넌트 */}
        <Input
          id="newPasswordConfirm"
          label="새 비밀번호 확인"
          type="password"
          value={form.newPasswordConfirm}
          onChange={(event) =>
            updateField("newPasswordConfirm", event.target.value)
          }
          placeholder="새 비밀번호를 한 번 더 입력해주세요"
          autoComplete="new-password"
          errorMessage={errors.newPasswordConfirm}
        />

        {/* 폼 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "변경 중..." : "비밀번호 재설정"}
        </Button>
      </form>
    </section>
  );
}