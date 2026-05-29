import { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  return (
    <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">로그인</h1>
      <p className="mt-2 text-sm text-gray-600">
        공부의 숲에 다시 오신 걸 환영해요.
      </p>

      <div className="mt-8 space-y-5">
        <Input
          id="email"
          label="이메일"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일을 입력해주세요"
          autoComplete="email"
        />

        <Button fullWidth size="lg">
          로그인
        </Button>
      </div>
    </section>
  );
}