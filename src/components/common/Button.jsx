const variantClassMap = {
  primary: "bg-[#99C08E] text-white hover:bg-[#578246]",
  secondary: "border border-[#99C08E] text-[#578246] hover:bg-white",
  ghost: "text-gray-700 hover:bg-white",
  danger: "bg-[#E57373] text-white hover:bg-[#C94F4F]",
};

const sizeClassMap = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  className = "",
  onClick,
}) {
  const variantClass = variantClassMap[variant] ?? variantClassMap.primary;
  const sizeClass = sizeClassMap[size] ?? sizeClassMap.md;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-full font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        sizeClass,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}