import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const isLoggedIn = false;

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E2DA] bg-[#F6F4EF]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
        <Link to="/" className="text-2xl font-extrabold text-[#578246]">
          공부의 숲
        </Link>

        <nav className="flex items-center gap-3">
          <NavLink
            to="/community"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold ${
                isActive
                  ? "bg-[#DDEED8] text-[#578246]"
                  : "text-gray-700 hover:bg-white"
              }`
            }
          >
            커뮤니티
          </NavLink>

          <Link
            to={isLoggedIn ? "/studies/new" : "/login"}
            className="rounded-full bg-[#99C08E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#578246]"
          >
            스터디 만들기
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                to="/mypage"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
              >
                마이페이지
              </Link>

              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
              >
                로그인
              </Link>

              <Link
                to="/register"
                className="rounded-full border border-[#99C08E] px-4 py-2 text-sm font-semibold text-[#578246] hover:bg-white"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}