import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import {
  checkHabit,
  createHabit,
  endHabit,
  getHabits,
  uncheckHabit,
  updateHabit,
} from "../api/habitApi.js";
import { getStudyDetail } from "../api/studyApi.js";

export default function HabitsPage() {
  const { studyId } = useParams();

  const [study, setStudy] = useState(null);
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [checkedHabitIds, setCheckedHabitIds] = useState([]);
  const [submittingHabitId, setSubmittingHabitId] = useState(null);

  const [isEditingList, setIsEditingList] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabitNames, setEditingHabitNames] = useState({});
  const [submittingManagementId, setSubmittingManagementId] = useState(null);

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

      setEditingHabitNames(
        nextHabits.reduce((acc, habit) => {
          acc[habit.habitId] = habit.name;
          return acc;
        }, {})
      );

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

  const handleCreateHabit = async () => {
    const trimmedName = newHabitName.trim();

    if (trimmedName.length < 1) {
      toast.error("습관 이름을 입력해주세요.");
      return;
    }

    try {
      setSubmittingManagementId("new");

      await createHabit(studyId, {
        name: trimmedName,
      });

      toast.success("습관이 추가되었습니다.");
      setNewHabitName("");
      await loadHabitsPage();
    } catch (error) {
      const message =
        error.response?.data?.message || "습관 생성 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setSubmittingManagementId(null);
    }
  };

  const handleUpdateHabit = async (habitId) => {
    const trimmedName = editingHabitNames[habitId]?.trim();

    if (!trimmedName) {
      toast.error("습관 이름을 입력해주세요.");
      return;
    }

    try {
      setSubmittingManagementId(habitId);

      await updateHabit(studyId, habitId, {
        name: trimmedName,
      });

      toast.success("습관이 수정되었습니다.");
      await loadHabitsPage();
    } catch (error) {
      const message =
        error.response?.data?.message || "습관 수정 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setSubmittingManagementId(null);
    }
  };

  const handleEndHabit = async (habitId) => {
    const isConfirmed = window.confirm(
      "이 습관을 중단하시겠습니까?\n\n기존 기록은 유지됩니다."
    );

    if (!isConfirmed) return;

    try {
      setSubmittingManagementId(habitId);

      await endHabit(studyId, habitId);

      toast.success("습관이 중단되었습니다.");
      await loadHabitsPage();
    } catch (error) {
      const message =
        error.response?.data?.message || "습관 중단 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setSubmittingManagementId(null);
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
            <p className="text-sm font-semibold text-[#578246]">오늘의 습관</p>
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

          <Button
            variant="secondary"
            onClick={() => setIsEditingList((prev) => !prev)}
          >
            {isEditingList ? "수정 닫기" : "목록 수정"}
          </Button>
        </div>

        {isEditingList && (
          <div className="mt-8 rounded-2xl border border-[#E5E2DA] bg-[#F6F4EF] p-5">
            <p className="text-sm font-semibold text-gray-800">새 습관 추가</p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={newHabitName}
                onChange={(event) => setNewHabitName(event.target.value)}
                placeholder="새 습관 이름을 입력해주세요"
                className="h-11 flex-1 rounded-2xl border border-[#D9D6CE] bg-white px-4 text-sm outline-none focus:border-[#99C08E]"
              />

              <Button
                onClick={handleCreateHabit}
                disabled={submittingManagementId === "new"}
              >
                {submittingManagementId === "new" ? "추가 중..." : "추가"}
              </Button>
            </div>
          </div>
        )}

        {habits.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-8 text-center text-gray-500">
            아직 습관이 없어요. 목록 수정을 눌러 습관을 생성해보세요.
          </p>
        ) : (
          <ul className="mt-8 space-y-3">
            {habits.map((habit) => {
              const isChecked = checkedHabitIds.includes(habit.habitId);
              const isSubmitting = submittingHabitId === habit.habitId;
              const isManaging = submittingManagementId === habit.habitId;

              return (
                <li
                  key={habit.habitId}
                  className={[
                    "rounded-2xl border px-5 py-4 transition",
                    isChecked
                      ? "border-[#99C08E] bg-[#E7F3E7]"
                      : "border-[#E5E2DA] bg-[#F6F4EF]",
                  ].join(" ")}
                >
                  {isEditingList ? (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <input
                        value={editingHabitNames[habit.habitId] ?? habit.name}
                        onChange={(event) =>
                          setEditingHabitNames((prev) => ({
                            ...prev,
                            [habit.habitId]: event.target.value,
                          }))
                        }
                        className="h-11 flex-1 rounded-2xl border border-[#D9D6CE] bg-white px-4 text-sm outline-none focus:border-[#99C08E]"
                      />

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateHabit(habit.habitId)}
                          disabled={isManaging}
                        >
                          {isManaging ? "처리 중..." : "수정"}
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => handleEndHabit(habit.habitId)}
                          disabled={isManaging}
                        >
                          중단
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
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
                        {isSubmitting
                          ? "처리 중..."
                          : isChecked
                            ? "완료"
                            : "체크"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}