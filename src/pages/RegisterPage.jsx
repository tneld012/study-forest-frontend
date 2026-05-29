import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { register } from "../api/authApi.js";

// 🔬 이메일 형식 유효성 검사 유틸 함수
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
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
    nickname:
      form.nickname.length > 0 && form.nickname.trim().length < 2
        ? "닉네임은 최소 2글자 이상 입력해야 합니다."
        : form.nickname.trim().length > 8
          ? "닉네임은 최대 8글자 이하로 입력해야 합니다."
          : "",
    password:
      form.password.length > 0 && form.password.length < 8
        ? "비밀번호는 최소 8글자 이상 입력해야 합니다."
        : "",
    passwordConfirm:
      form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm
        ? "비밀번호가 일치하지 않습니다."
        : "",
  };

  const isFormValid =
    validateEmail(form.email) &&
    form.nickname.trim().length >= 2 &&
    form.nickname.trim().length <= 8 &&
    form.password.length >= 8 &&
    form.password === form.passwordConfirm;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await register({
        email: form.email.trim(),
        nickname: form.nickname.trim(),
        password: form.password,
      });

      toast.success("회원가입이 완료되었습니다!");
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">회원가입</h1>
      <p className="mt-2 text-sm text-gray-600">
        공부의 숲에서 함께 성장해요!
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
          id="nickname"
          label="닉네임"
          value={form.nickname}
          onChange={(event) => updateField("nickname", event.target.value)}
          placeholder="닉네임을 작성해주세요"
          autoComplete="nickname"
          errorMessage={errors.nickname}
        />

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

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "가입 중..." : "회원가입"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        이미 회원이신가요?{" "}
        <Link to="/login" className="font-semibold text-[#578246]">
          로그인
        </Link>
      </p>
    </section>
  );
}