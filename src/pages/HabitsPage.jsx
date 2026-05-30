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

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function HabitsPage() {
  const { studyId } = useParams();

  // 1. 스터디 및 습관 리스트 핵심 데이터 상태 관리
  const [study, setStudy] = useState(null);
  const [habits, setHabits] = useState([]);
  
  // 2. 사용자의 체크 여부 및 실시간 폼 입력 상태 관리
  const [checkedHabitIds, setCheckedHabitIds] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [editingHabitNames, setEditingHabitNames] = useState({});
  
  // 3. UI 토글 및 서버 제출 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingList, setIsEditingList] = useState(false);
  const [submittingHabitId, setSubmittingHabitId] = useState(null);
  const [submittingManagementId, setSubmittingManagementId] = useState(null);

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 스터디 정보와 습관 목록을 동시에 한 번에 가져와서 상태에 세팅
  const loadHabitsPage = async () => {
    try {
      setIsLoading(true);

      // 두 개의 API 데이터를 기다리지 않고 동시에 호출
      const [studyResponse, habitsResponse] = await Promise.all([
        getStudyDetail(studyId),
        getHabits(studyId),
      ]);

      // 가져온 데이터를 각각의 상태(State)에 나누어 저장
      setStudy(studyResponse.data);

      const nextHabits = habitsResponse.data.habits;
      setHabits(nextHabits);

      // 수정용 임시 텍스트 맵 생성 (객체 형태로 각 습관 이름 매핑)
      setEditingHabitNames(
        nextHabits.reduce((acc, habit) => {
          acc[habit.habitId] = habit.name;
          return acc;
        }, {})
      );

      // 오늘 이미 체크 완료된 습관 ID들만 골라내어 체크 상태 리스트에 저장
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

  // 습관 체크 토글 처리 (체크하기 / 체크 해제하기)
  const handleToggleHabit = async (habitId) => {
    const isChecked = checkedHabitIds.includes(habitId);

    try {
      setSubmittingHabitId(habitId);

      if (isChecked) {
        // 이미 체크되어 있다면 백엔드에 체크 해제 요청
        await uncheckHabit(studyId, habitId);
        setCheckedHabitIds((prev) => prev.filter((id) => id !== habitId));
        toast.success("습관 체크를 해제했습니다.");
      } else {
        // 체크되어 있지 않다면 백엔드에 체크 추가 요청
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

  // 새로운 습관 추가 제출 처리
  const handleCreateHabit = async () => {
    const trimmedName = newHabitName.trim();

    // 공백만 입력되었을 경우 차단
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
      
      // 목록 최신화를 위해 전체 다시 로드
      await loadHabitsPage();
    } catch (error) {
      const message =
        error.response?.data?.message || "습관 생성 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setSubmittingManagementId(null);
    }
  };

  // 기존 습관 이름 수정 제출 처리
  const handleUpdateHabit = async (habitId) => {
    const trimmedName = editingHabitNames[habitId]?.trim();

    // 빈 이름 수정 방지
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

  // 특정 습관을 더 이상 진행하지 않고 완전히 중단 처리
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

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 컴포넌트 마운트 시 및 URL 파라미터(studyId) 변경 시 페이지 데이터 일괄 로드
  useEffect(() => {
    loadHabitsPage();
  }, [studyId]);

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        오늘의 습관을 불러오는 중입니다...
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="space-y-8">
      {/* 상단 헤더 네비게이션 카드 구역 */}
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

      {/* 메인 습관 리스트 및 관리 컨테이너 카드 구역 */}
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

        {/* '목록 수정' 활성화 시 노출되는 새 습관 생성 폼 */}
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

        {/* 습관 리스트가 텅 비었을 때 */}
        {habits.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-8 text-center text-gray-500">
            아직 습관이 없어요. 목록 수정을 눌러 습관을 생성해보세요.
          </p>
        ) : (
          /* 동적 습관 목록 출력 */
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
                  {/* 목록 수정 모드 UI */}
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
                    /* 일반 사용자 체크 모드 UI */
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