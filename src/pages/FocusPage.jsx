import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import { createFocusSession } from "../api/focusApi.js";
import { getStudyDetail } from "../api/studyApi.js";

function minutesToSeconds(minutes) {
  return minutes * 60;
}

export default function FocusPage() {
  const { studyId } = useParams();

  const [study, setStudy] = useState(null);
  const [targetMinutes, setTargetMinutes] = useState("30");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCompleteFocus = async () => {
    const minutes = Number(targetMinutes);

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

      setResult(response.data);

      toast.success(`${response.data.pointDelta}포인트를 획득했습니다!`);
    } catch (error) {
      const message =
        error.response?.data?.message || "집중 기록 저장 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadFocusPage();
  }, [studyId]);

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        오늘의 집중을 불러오는 중입니다...
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

      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-gray-500">현재 누적 포인트</p>
        <p className="mt-2 text-3xl font-extrabold text-[#578246]">
          {result?.totalPointsAfter ?? study?.totalPoints ?? 0}P
        </p>

        <div className="mt-8 text-left">
          <Input
            id="targetMinutes"
            label="목표 집중 시간(분)"
            type="number"
            value={targetMinutes}
            onChange={(event) => setTargetMinutes(event.target.value)}
            placeholder="예: 30"
          />
        </div>

        <Button
          fullWidth
          size="lg"
          className="mt-6"
          onClick={handleCompleteFocus}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "집중 완료 처리"}
        </Button>

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