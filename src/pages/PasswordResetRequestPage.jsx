import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { requestPasswordReset } from "../api/authApi";

// 🔬 이메일 형식 유효성 검사 유틸 함수
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  const emailError =
    email.length > 0 && !validateEmail(email)
      ? "잘못된 이메일 형식입니다."
      : "";

  const isFormValid = validateEmail(email);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await requestPasswordReset({
        email: email.trim(),
      });

      setIsRequested(true);
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

  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">비밀번호 찾기</h1>
      <p className="mt-2 text-sm text-gray-600">
        가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드려요.
      </p>

      {isRequested ? (
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
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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