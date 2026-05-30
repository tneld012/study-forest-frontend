import { Link } from "react-router-dom";

export default function EmptyState({ message, actionText, actionTo }) {
  return (
    <div className="mt-6 rounded-2xl bg-[#F6F4EF] p-8 text-center">
      <p className="text-gray-500">{message}</p>

      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="mt-4 inline-block font-semibold text-[#578246]"
        >
          {actionText} →
        </Link>
      )}
    </div>
  );
}