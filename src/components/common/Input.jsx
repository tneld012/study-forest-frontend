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

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={[
          "h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none transition",
          "placeholder:text-gray-400",
          errorMessage
            ? "border-[#D9534F] focus:border-[#D9534F]"
            : "border-[#D9D6CE] focus:border-[#99C08E]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {errorMessage && (
        <p className="mt-2 text-sm text-[#D9534F]">{errorMessage}</p>
      )}
    </div>
  );
}