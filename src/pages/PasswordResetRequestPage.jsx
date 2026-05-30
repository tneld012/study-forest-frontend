import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { requestPasswordReset } from "../api/authApi.js";

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
export default function PasswordResetRequestPage() {
  // 입력 필드 및 전송 완료 유무 상태 관리
  const [email, setEmail] = useState("");
  const [isRequested, setIsRequested] = useState(false); // 메일 발송 성공 후 UI 전환용 플래그

  // 데이터 로딩 동기 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false); // API 요청 중 버튼 중복 클릭 차단용

  // =============================================================================
  // 실시간 입력 데이터 유효성 검사 구역
  // =============================================================================
  
  // 이메일 실시간 에러 메시지 배정
  const emailError =
    email.length > 0 && !validateEmail(email)
      ? "잘못된 이메일 형식입니다."
      : "";

  // 폼 전체 통과 조건 플래그
  const isFormValid = validateEmail(email);

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================

  // 비밀번호 재설정 요청 폼 전송(Submit) 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault(); // submit 기본 동작인 페이지 새로고침 방지

    // 유효하지 않은 입력이거나 이미 통신 중인 경우 실행 차단
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // 백엔드 비밀번호 재설정 메일 발송 API 호출
      await requestPasswordReset({
        email: email.trim(),
      });

      setIsRequested(true); // 성공 시 화면을 완료 안내 레이아웃으로 전환
      toast.success("비밀번호 재설정 메일을 확인해주세요.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "비밀번호 재설정 요청 중 오류가 발생했습니다.";

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
      <h1 className="text-2xl font-bold text-[#578246]">비밀번호 찾기</h1>
      <p className="mt-2 text-sm text-gray-600">
        가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드려요.
      </p>

      {/* 요청 성공 여부(isRequested)에 따른 조건부 화면 렌더링 구역 */}
      {isRequested ? (
        // [성공 화면] 메일 발송이 성공적으로 완료되었을 때 노출할 안내 UI
        <div className="mt-8 rounded-2xl bg-[#F6F4EF] p-5 text-sm text-gray-700">
          <p className="font-semibold text-[#578246]">메일 발송 완료</p>
          <p className="mt-2">
            가입된 이메일이라면 비밀번호 재설정 링크가 발송됩니다.
            메일함과 스팸함을 함께 확인해주세요.
          </p>

          <Link
            to="/login"
            className="mt-5 inline-block font-semibold text-[#578246]"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      ) : (
        // [입력 화면] 메일 요청 전 기본으로 노출되는 이메일 폼 UI
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* 이메일 입력 컴포넌트 */}
          <Input
            id="email"
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="이메일을 입력해주세요"
            autoComplete="email"
            errorMessage={emailError}
          />

          {/* 링크 전송 요청 버튼 */}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "메일 발송 중..." : "재설정 링크 받기"}
          </Button>
        </form>
      )}

      {/* 하단 로그인 페이지 회귀 링크 구역 (요청 전 단계에서만 노출) */}
      {!isRequested && (
        <p className="mt-6 text-center text-sm text-gray-600">
          비밀번호가 기억나셨나요?{" "}
          <Link to="/login" className="font-semibold text-[#578246]">
            로그인
          </Link>
        </p>
      )}
    </section>
  );
}