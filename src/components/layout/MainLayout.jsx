import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F6F4EF] text-[#2B2B2B]">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}