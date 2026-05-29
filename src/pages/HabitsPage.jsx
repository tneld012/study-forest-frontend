import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import { checkHabit, getHabits, uncheckHabit } from "../api/habitApi.js";
import { getStudyDetail } from "../api/studyApi.js";

export default function HabitsPage() {
  const { studyId } = useParams();

  const [study, setStudy] = useState(null);
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedHabitIds, setCheckedHabitIds] = useState([]);
  const [submittingHabitId, setSubmittingHabitId] = useState(null);

  const loadHabitsPage = async () => {
    try {
      setIsLoading(true);

      const [studyResponse, habitsResponse] = await Promise.all([
        getStudyDetail(studyId),
        getHabits(studyId),
      ]);

      setStudy(studyResponse.data);

      const nextHabits = habitsResponse.data.habits;

        setHabits(nextHabits);
        setCheckedHabitIds(
          nextHabits
            .filter((habit) => habit.isCheckedToday)
            .map((habit) => habit.habitId)
        );
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

  const handleToggleHabit = async (habitId) => {
    const isChecked = checkedHabitIds.includes(habitId);

    try {
      setSubmittingHabitId(habitId);

      if (isChecked) {
        await uncheckHabit(studyId, habitId);

        setCheckedHabitIds((prev) => prev.filter((id) => id !== habitId));
        toast.success("습관 체크를 해제했습니다.");
      } else {
        await checkHabit(studyId, habitId);

        setCheckedHabitIds((prev) => [...prev, habitId]);
        toast.success("습관을 체크했습니다!");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "습관 체크 처리 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setSubmittingHabitId(null);
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

        {habits.map((habit) => {
          const isChecked = checkedHabitIds.includes(habit.habitId);
          const isSubmitting = submittingHabitId === habit.habitId;

          return (
            <li
              key={habit.habitId}
              className={[
                "flex items-center justify-between rounded-2xl border px-5 py-4 transition",
                isChecked
                  ? "border-[#99C08E] bg-[#E7F3E7]"
                  : "border-[#E5E2DA] bg-[#F6F4EF]",
              ].join(" ")}
            >
              <span
                className={[
                  "font-semibold",
                  isChecked ? "text-[#578246]" : "text-gray-800",
                ].join(" ")}
              >
                {habit.name}
              </span>

              <button
                type="button"
                onClick={() => handleToggleHabit(habit.habitId)}
                disabled={isSubmitting}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50",
                  isChecked
                    ? "bg-[#578246] text-white"
                    : "bg-white text-gray-500 hover:text-[#578246]",
                ].join(" ")}
              >
                {isSubmitting ? "처리 중..." : isChecked ? "완료" : "체크"}
              </button>
            </li>
          );
        })}
      </div>
    </section>
  );
}