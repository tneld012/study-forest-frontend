import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { createFocusSession } from "../api/focusApi.js";
import { getStudyDetail } from "../api/studyApi.js";

// =============================================================================
// 전역 일반 유틸리티 함수 구역
// =============================================================================

// 분 단위를 초 단위로 변환
function minutesToSeconds(minutes) {
  return minutes * 60;
}

// 초 단위를 "MM:SS" 포맷의 문자열로 변환
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function FocusPage() {
  const { studyId } = useParams();
  
  // 로컬 스토리지 타이머 세션 캐싱용 고유 키값 생성
  const timerStorageKey = `focus-timer-${studyId}`;

  // 1. 스터디 및 집중 통계 결과 상태 관리
  const [study, setStudy] = useState(null);
  const [result, setResult] = useState(null);
  const [targetMinutes, setTargetMinutes] = useState("30");

  // 2. 타이머 코어 및 흐름 제어 상태 관리
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // 3. 페이지 초기 로드 및 API 제출 동기 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 스터디 기본 상세 정보 조회 및 대시보드 데이터 동기화
  const loadFocusPage = async () => {
    try {
      setIsLoading(true);

      const response = await getStudyDetail(studyId);
      setStudy(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 정보를 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `focus-load-error-${studyId}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 목표 시간 완주 시 집중 세션 최종 생성 및 포인트 지급 요청 처리
  const handleCompleteFocus = async () => {
    const minutes = Number(targetMinutes);

    // 비정상적이거나 0 이하인 타겟 시간 제출 예외 차단
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.error("목표 시간을 1분 이상 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const targetSeconds = minutesToSeconds(minutes);

      const response = await createFocusSession(studyId, {
        targetSeconds,
        elapsedSeconds: targetSeconds,
        status: "COMPLETED",
      });

      // 결과 리포트 반영 및 타이머 상태 초기화
      setResult(response.data);
      setRemainingSeconds(null);
      setIsCompleted(false);

      // 완주 성공 세션에 대한 캐시 제거
      localStorage.removeItem(timerStorageKey);
      toast.success(`${response.data.pointDelta}포인트를 획득했습니다!`);
    } catch (error) {
      const message =
        error.response?.data?.message || "집중 기록 저장 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // 사용자 인터랙션 이벤트 핸들러 구역
  // =============================================================================
  
  // 새 집중 타이머 세션 시작 및 로컬스토리지 시점 동기화 캐싱
  const handleStartTimer = () => {
    const minutes = Number(targetMinutes);

    // 시간 미입력 및 음수 필터링
    if (!Number.isFinite(minutes) || minutes <= 0) {
      toast.error("목표 시간을 입력해주세요.");
      return;
    }

    const targetSeconds = minutesToSeconds(minutes);
    const endsAt = Date.now() + targetSeconds * 1000;

    // 브라우저 이탈 및 새로고침 방어용 로컬 세션 캐시 저장
    localStorage.setItem(
      timerStorageKey,
      JSON.stringify({
        targetMinutes: String(minutes),
        targetSeconds,
        endsAt,
      })
    );

    setRemainingSeconds(targetSeconds);
    setIsRunning(true);
    setIsCompleted(false);
  };

  // 타이머 일시정지 핸들러
  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  // 타이머 작동 재개 핸들러
  const handleResumeTimer = () => {
    setIsRunning(true);
  };

  // 사용자의 명시적 중단 의사에 따른 세션 초기화 및 캐시 영구 제거
  const handleStopTimer = () => {
    const confirmed = window.confirm("집중을 중단하시겠습니까?");

    if (!confirmed) return;

    localStorage.removeItem(timerStorageKey);

    setRemainingSeconds(null);
    setIsRunning(false);
    setIsCompleted(false);
  };

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 컴포넌트 마운트 시 및 URL 파라미터(studyId) 변경 시 스터디 메타 정보 로드
  useEffect(() => {
    loadFocusPage();
  }, [studyId]);

  // 컴포넌트 첫 진입 시 브라우저 캐시에 비정상 종료된 기존 집중 타이머 세션이 있는지 확인 후 복구
  useEffect(() => {
    const savedTimer = localStorage.getItem(timerStorageKey);

    if (!savedTimer) return;

    try {
      const parsedTimer = JSON.parse(savedTimer);
      const secondsLeft = Math.max(
        0,
        Math.ceil((parsedTimer.endsAt - Date.now()) / 1000)
      );

      // 이미 시간이 만료된 파손 데이터인 경우 브라우저 저장소 비우고 복구 생략
      if (secondsLeft <= 0) {
        localStorage.removeItem(timerStorageKey);
        return;
      }

      // 유효할 경우 직전 타이머 상태값으로 복구 후 재생 상태 자동 트리거
      setTargetMinutes(parsedTimer.targetMinutes);
      setRemainingSeconds(secondsLeft);
      setIsRunning(true);
      setIsCompleted(false);
    } catch {
      localStorage.removeItem(timerStorageKey);
    }
  }, [timerStorageKey]);

  // 1초 단위로 인터벌을 발생 시켜 실시간 잔여 초(remainingSeconds) 차감 처리
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);

          setIsRunning(false);
          setIsCompleted(true);

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  // 타이머 카운트다운 완료(isCompleted === true)를 감지하여 백엔드 API 제출 핸들러와 연동
  useEffect(() => {
    if (!isCompleted) return;

    handleCompleteFocus();
  }, [isCompleted]);

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        오늘의 집중을 불러오는 중입니다...
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="space-y-8">
      {/* 타이머 대시보드 상단 네비게이션 영역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link to={`/studies/${studyId}`}>
            <Button variant="ghost">홈으로</Button>
          </Link>

          <div className="text-center">
            <p className="text-sm font-semibold text-[#578246]">
              오늘의 집중
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-gray-900">
              {study?.name ?? "스터디"}
            </h1>
          </div>

          <Link to={`/studies/${studyId}/habits`}>
            <Button variant="secondary">오늘의 습관으로</Button>
          </Link>
        </div>
      </div>

      {/* 집중 타이머 작동 핵심 컨테이너 카드 구역 */}
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-500">현재 누적 포인트</p>
        <p className="mt-2 text-3xl font-extrabold text-[#578246]">
          {result?.totalPointsAfter ?? study?.totalPoints ?? 0}P
        </p>

        {/* 타겟 목표 시간 입력 폼 스크립트 구역 */}
        <div className="mt-8 text-left">
          <Input
            id="targetMinutes"
            label="목표 집중 시간(분)"
            type="number"
            value={targetMinutes}
            onChange={(event) => setTargetMinutes(event.target.value)}
            placeholder="예: 30"
            disabled={remainingSeconds !== null}
          />

          {/* 현재 타이머 카운트 다운 시각 디스플레이 */}
          {remainingSeconds !== null && (
            <div className="mt-8 text-center">
              <p className="text-5xl font-mono font-extrabold text-[#578246] tracking-wider">
                {formatTime(remainingSeconds)}
              </p>
            </div>
          )}
        </div>

        {/* 타이머 상태 변화 및 세션 진행 여부에 따른 분기별 동적 버튼 배치 */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!isRunning && remainingSeconds === null && (
            <Button fullWidth size="lg" onClick={handleStartTimer}>
              집중 시작
            </Button>
          )}

          {isRunning && (
            <Button variant="secondary" onClick={handlePauseTimer}>
              일시정지
            </Button>
          )}

          {!isRunning &&
            remainingSeconds !== null &&
            remainingSeconds > 0 && (
              <Button variant="secondary" onClick={handleResumeTimer}>
                재개
              </Button>
            )}

          {remainingSeconds !== null &&
            remainingSeconds > 0 && (
              <Button variant="danger" onClick={handleStopTimer}>
                중단
              </Button>
            )}
        </div>

        {/* 완주 성공 레코드 자동 제출 트랜잭션 피드백 로딩 문구 */}
        {isSubmitting && (
          <p className="mt-4 text-sm font-semibold text-[#578246] animate-pulse">
            🚀 집중 완주 성공! 기록을 저장하는 중입니다...
          </p>
        )}

        {/* 완주 저장 완료 후 포인트 요약 리포트 위젯 조건부 렌더링 구역 */}
        {result && (
          <div className="mt-8 rounded-2xl bg-[#F6F4EF] p-5 text-left">
            <p className="font-semibold text-[#578246]">집중 결과</p>

            <dl className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <dt>목표 시간</dt>
                <dd>{result.targetSeconds / 60}분</dd>
              </div>

              <div className="flex justify-between">
                <dt>획득 포인트</dt>
                <dd>{result.pointDelta}P</dd>
              </div>

              <div className="flex justify-between">
                <dt>누적 포인트</dt>
                <dd>{result.totalPointsAfter}P</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}