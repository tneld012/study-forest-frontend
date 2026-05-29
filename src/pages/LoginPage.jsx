import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { login } from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

// 🔬 이메일 형식 유효성 검사 유틸 함수
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const navigate = useNavigate();

  const { refreshMe } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

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

  const isFormValid =
    validateEmail(form.email) && form.password.length >= 8;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await login({
        email: form.email.trim(),
        password: form.password,
      });

      await refreshMe();

      toast.success("로그인에 성공했습니다!");
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "로그인 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">로그인</h1>
      <p className="mt-2 text-sm text-gray-600">
        공부의 숲에 다시 오신 걸 환영해요~
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </Button>
      </form>

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