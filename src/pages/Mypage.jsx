import { useAuth } from "../contexts/AuthContext.jsx";

export default function MyPage() {
  const { user } = useAuth();

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">마이페이지</h1>
      <p className="mt-4 text-gray-700">
        {user?.nickname}님의 마이페이지입니다!
      </p>
    </section>
  );
}