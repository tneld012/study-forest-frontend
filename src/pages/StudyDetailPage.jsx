import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Emoji } from "emoji-picker-react";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import { getStudyDetail } from "../api/studyApi.js";

export default function StudyDetailPage() {
  const { studyId } = useParams();

  const [study, setStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudyDetail = async () => {
    try {
      setIsLoading(true);

      const response = await getStudyDetail(studyId);

      setStudy(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "스터디 상세 정보를 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `study-detail-error-${studyId}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudyDetail();
  }, [studyId]);

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        스터디 상세 정보를 불러오는 중입니다...
      </section>
    );
  }

  if (!study) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        스터디 정보를 찾을 수 없습니다.
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#578246]">
              {study.owner?.nickname}님의 스터디
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-gray-900">
              {study.name}
            </h1>

            <p className="mt-4 max-w-2xl leading-7 text-gray-700">
              {study.introduce}
            </p>
          </div>

          <div className="rounded-2xl bg-[#F6F4EF] px-5 py-4 text-center">
            <p className="text-sm text-gray-500">누적 포인트</p>
            <p className="mt-1 text-2xl font-extrabold text-[#578246]">
              {study.totalPoints}P
            </p>
          </div>
        </div>

        {study.topEmojis?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {study.topEmojis.map((emoji) => (
              <span
                key={emoji.emojiUnifiedCode}
                className="inline-flex items-center gap-2 rounded-full bg-[#F6F4EF] px-4 py-2 text-sm font-semibold text-gray-700"
              >
                <Emoji
                  unified={emoji.emojiUnifiedCode.toLowerCase()}
                  size={18}
                  emojiStyle="apple"
                />
                {emoji.count}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>스터디 참여하기</Button>

          <Link to={`/studies/${study.studyId}/habits`}>
            <Button variant="secondary">오늘의 습관</Button>
          </Link>

          <Link to={`/studies/${study.studyId}/focus`}>
            <Button variant="secondary">오늘의 집중</Button>
          </Link>

          <Button variant="ghost">공유하기</Button>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">습관 기록표</h2>
        <p className="mt-4 text-gray-500">
          주간 습관 기록표는 다음 단계에서 연결할 예정입니다.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">댓글</h2>
        <p className="mt-4 text-gray-500">
          스터디 댓글은 이후 단계에서 연결할 예정입니다.
        </p>
      </div>
    </section>
  );
}