import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { resetPassword } from "../api/authApi";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [form, setForm] = useState({
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const errors = {
    newPassword:
      form.newPassword.length > 0 && form.newPassword.length < 8
        ? "새 비밀번호는 최소 8글자 이상이어야 합니다."
        : "",
    newPasswordConfirm:
      form.newPasswordConfirm.length > 0 &&
      form.newPassword !== form.newPasswordConfirm
        ? "비밀번호가 일치하지 않습니다."
        : "",
  };

  const isFormValid =
    token.length > 0 &&
    form.newPassword.length >= 8 &&
    form.newPassword === form.newPasswordConfirm;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await resetPassword({
        token,
        newPassword: form.newPassword,
      });

      toast.success("비밀번호가 재설정되었습니다.");
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

  if (!token) {
    return (
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#578246]">
          재설정 링크 오류
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          비밀번호 재설정 토큰이 없습니다. 다시 비밀번호 재설정을 요청해주세요.
        </p>

        <Link
          to="/password-reset"
          className="mt-6 inline-block font-semibold text-[#578246]"
        >
          비밀번호 재설정 다시 요청하기
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">
        새 비밀번호 설정
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        앞으로 사용할 새 비밀번호를 입력해주세요.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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