import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  errorMessage,
  autoComplete,
  className = "",
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordType = type === "password";
  const inputType =
    isPasswordType && isPasswordVisible ? "text" : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={[
            "h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition",
            "placeholder:text-gray-400",
            isPasswordType ? "pr-14" : "",
            errorMessage
              ? "border-[#D9534F] focus:border-[#D9534F]"
              : "border-[#D9D6CE] focus:border-[#99C08E]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:text-[#578246] transition-colors"
            aria-label={
              isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"
            }
          >
            {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="mt-2 text-sm text-[#D9534F]">{errorMessage}</p>
      )}
    </div>
  );
}