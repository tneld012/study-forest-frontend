import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { register } from "../api/authApi.js";

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
export default function RegisterPage() {
  // 라우팅 페이지 이동을 위한 내비게이션 훅 선언
  const navigate = useNavigate();

  // 가입 양식 입력 폼 상태 관리
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
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
    // 이메일 형식 검사
    email:
      form.email.length > 0 && !validateEmail(form.email)
        ? "잘못된 이메일 형식입니다."
        : "",
    // 닉네임 글자수 검사 (양끝 공백 제외 2자~8자)
    nickname:
      form.nickname.length > 0 && form.nickname.trim().length < 2
        ? "닉네임은 최소 2글자 이상 입력해야 합니다."
        : form.nickname.trim().length > 8
          ? "닉네임은 최대 8글자 이하로 입력해야 합니다."
          : "",
    // 비밀번호 글자수 검사 (최소 8자)
    password:
      form.password.length > 0 && form.password.length < 8
        ? "비밀번호는 최소 8글자 이상 입력해야 합니다."
        : "",
    // 비밀번호 2차 확인 일치 여부 검사
    passwordConfirm:
      form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm
        ? "비밀번호가 일치하지 않습니다."
        : "",
  };

  // 모든 회원가입 폼 항목이 조건을 충족했는지 유효성을 검사하는 통과 플래그
  const isFormValid =
    validateEmail(form.email) &&
    form.nickname.trim().length >= 2 &&
    form.nickname.trim().length <= 8 &&
    form.password.length >= 8 &&
    form.password === form.passwordConfirm;

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================

  // 회원가입 폼 제출(Submit) 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault(); // submit 기본 동작인 페이지 새로고침 방지

    // 폼 양식이 올바르지 않거나 이미 통신 중인 경우 실행 차단
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 백엔드 회원가입 API 요청 실행
      await register({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });

      toast.success("회원가입이 완료되었습니다!");
      // 가입 성공 후 로그인 페이지로 안전하게 redirect
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";

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
      <h1 className="text-2xl font-bold text-[#578246]">회원가입</h1>
      <p className="mt-2 text-sm text-gray-600">
        공부의 숲에서 함께 성장해요!
      </p>

      {/* 회원가입 정보 입력 폼 구역 */}
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

        {/* 닉네임 입력 컴포넌트 */}
        <Input
          id="nickname"
          label="닉네임"
          value={form.nickname}
          onChange={(event) => updateField("nickname", event.target.value)}
          placeholder="닉네임을 작성해주세요"
          autoComplete="nickname"
          errorMessage={errors.nickname}
        />

        {/* 비밀번호 입력 컴포넌트 */}
        <Input
          id="password"
          label="비밀번호"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="비밀번호를 입력해주세요"
          autoComplete="new-password"
          errorMessage={errors.password}
        />

        {/* 비밀번호 재확인 입력 컴포넌트 */}
        <Input
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          value={form.passwordConfirm}
          onChange={(event) =>
            updateField("passwordConfirm", event.target.value)
          }
          placeholder="비밀번호를 한 번 더 입력해주세요"
          autoComplete="new-password"
          errorMessage={errors.passwordConfirm}
        />

        {/* 폼 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </Button>
      </form>

      {/* 하단 로그인 페이지 이동 링크 구역 */}
      <p className="mt-6 text-center text-sm text-gray-600">
        이미 회원이신가요?{" "}
        <Link to="/login" className="font-semibold text-[#578246]">
          로그인
        </Link>
      </p>
    </section>
  );
}