import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { login } from "../api/authApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

// =============================================================================
// 전역 일반 유틸리티 함수 구역
// =============================================================================

/**
 * 이메일 형식의 유효성을 정규표현식으로 검사하는 함수
 * @param {string} email - 검사할 이메일 문자열
 * @returns {boolean} 정규식 일치 여부 (true/false)
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function LoginPage() {
  // 라우팅 및 리다이렉트 경로 관리를 위한 훅 선언
  const navigate = useNavigate();
  const location = useLocation();
  // 인증이 필요한 페이지에서 튕겨서 온 경우 해당 목적지를 기록 (없으면 메인 '/'로 이동)
  const from = location.state?.from?.pathname || "/";

  // 인증 관련 전역 컨텍스트 상태 관리
  const { refreshMe } = useAuth(); // 로그인 성공 후 내 유저 정보 전역 상태 동기화용 함수

  // 입력 폼 및 컴포넌트 로딩 상태 관리
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // API 요청 중 버튼 중복 클릭 차단용

  // 입력 필드 값 변경 공통 핸들러 함수
  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // =============================================================================
  // 실시간 실시간 입력 데이터 유효성 검사 및 에러 메시지 구역
  // =============================================================================
  const errors = {
    email:
      form.email.length > 0 && !validateEmail(form.email)
        ? "잘못된 이메일 형식입니다."
        : "",
    password:
      form.password.length > 0 && form.password.length < 8
        ? "비밀번호는 최소 8글자 이상 입력해야 합니다."
        : "",
  };

  // 모든 폼 항목이 정상적으로 입력되었는지 검사하는 통과 조건 플래그
  const isFormValid =
    validateEmail(form.email) && form.password.length >= 8;

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================

  // 로그인 폼 전송(Submit) 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault(); // submit 기본 동작인 페이지 새로고침 방지

    // 폼 형식이 올바르지 않거나 이미 통신 중인 경우 가드 절(Early Return)로 실행 차단
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 백엔드 로그인 API 요청 실행
      await login({
        email: form.email.trim(),
        password: form.password,
      });

      // 전역 인증 상태에 내 최신 정보 반영
      await refreshMe();

      toast.success("로그인에 성공했습니다!");
      // 이전 페이지(from)로 이동하되, 뒤로가기로 로그인 페이지가 다시 나오지 않게 replace 처리
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "로그인 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      {/* 상단 타이틀 및 소개 문구 구역 */}
      <h1 className="text-2xl font-bold text-[#578246]">로그인</h1>
      <p className="mt-2 text-sm text-gray-600">
        공부의 숲에 다시 오신 걸 환영해요~
      </p>

      {/* 로그인 입력 폼 구역 */}
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {/* 이메일 입력 컴포넌트 */}
        <Input
          id="email"
          label="이메일"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="이메일을 입력해주세요"
          autoComplete="email"
          errorMessage={errors.email}
        />

        {/* 비밀번호 입력 컴포넌트 */}
        <Input
          id="password"
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="비밀번호를 입력해주세요"
          autoComplete="current-password"
          errorMessage={errors.password}
        />

        {/* 폼 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      {/* 하단 서비스 내비게이션 링크 구역 (회원가입, 비밀번호 재설정) */}
      <div className="mt-6 space-y-3 text-center text-sm text-gray-600">
        <p>
          공부의 숲이 처음이신가요?{" "}
          <Link to="/register" className="font-semibold text-[#578246]">
            회원가입
          </Link>
        </p>

        <p>
          <Link
            to="/password-reset"
            className="font-semibold text-gray-500 hover:text-[#578246]"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>
      </div>
    </section>
  );
}