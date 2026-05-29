import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import { getHabits } from "../api/habitApi.js";
import { getStudyDetail } from "../api/studyApi.js";

export default function HabitsPage() {
  const { studyId } = useParams();

  const [study, setStudy] = useState(null);
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHabitsPage = async () => {
    try {
      setIsLoading(true);

      const [studyResponse, habitsResponse] = await Promise.all([
        getStudyDetail(studyId),
        getHabits(studyId),
      ]);

      setStudy(studyResponse.data);
      setHabits(habitsResponse.data.habits);
    } catch (error) {
      const message =
        error.response?.data?.message || "오늘의 습관을 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `habits-load-error-${studyId}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabitsPage();
  }, [studyId]);

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        오늘의 습관을 불러오는 중입니다...
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to={`/studies/${studyId}`}>
            <Button variant="ghost">홈으로</Button>
          </Link>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#578246]">
              오늘의 습관
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
              {study?.name ?? "스터디"}
            </h1>
          </div>

          <Link to={`/studies/${studyId}/focus`}>
            <Button variant="secondary">오늘의 집중으로</Button>
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900">습관 목록</h2>

          <Button variant="secondary">목록 수정</Button>
        </div>

        {habits.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-8 text-center text-gray-500">
            아직 습관이 없어요. 목록 수정을 눌러 습관을 생성해보세요.
          </p>
        ) : (
          <ul className="mt-8 space-y-3">
            {habits.map((habit) => (
              <li
                key={habit.habitId}
                className="flex items-center justify-between rounded-2xl border border-[#E5E2DA] bg-[#F6F4EF] px-5 py-4"
              >
                <span className="font-semibold text-gray-800">
                  {habit.name}
                </span>

                <span className="text-sm text-gray-400">체크 준비중</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}