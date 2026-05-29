import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Emoji } from "emoji-picker-react";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import { deleteStudy, getStudyDetail } from "../api/studyApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  getMyStudyMembership,
  joinStudy,
  leaveStudy,
} from "../api/studyMemberApi.js";

export default function StudyDetailPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoggedIn } = useAuth();
  const [membership, setMembership] = useState(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);
  const [isMembershipSubmitting, setIsMembershipSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMyMembership = async () => {
    if (!isLoggedIn) {
      setMembership(null);
      return;
    }

    try {
      setIsMembershipLoading(true);

      const response = await getMyStudyMembership(studyId);

      console.log("멤버십 응답:", response.data);

      setMembership(response.data);
    } catch (error) {
      console.error("멤버십 조회 실패:", error.response?.data || error);
      setMembership(null);
    } finally {
      setIsMembershipLoading(false);
    }
  };

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

  useEffect(() => {
    loadMyMembership();
  }, [studyId, isLoggedIn]);

  const handleJoinStudy = async () => {
    if (!isLoggedIn) {
      toast.info("로그인이 필요합니다.");
      return;
    }

    try {
      setIsMembershipSubmitting(true);
      await joinStudy(studyId);
      toast.success("스터디에 참여했습니다!");
      await loadMyMembership();
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 참여 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsMembershipSubmitting(false);
    }
  };

  const handleLeaveStudy = async () => {
    try {
      setIsMembershipSubmitting(true);
      await leaveStudy(studyId);
      toast.success("스터디에서 탈퇴했습니다.");
      await loadMyMembership();
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 탈퇴 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsMembershipSubmitting(false);
    }
  };

  const handleDeleteStudy = async () => {
    const isConfirmed = window.confirm(
      "정말 이 스터디를 삭제하시겠습니까? 삭제 후에는 목록에서 보이지 않습니다."
    );

    if (!isConfirmed || isDeleting) return;

    try {
      setIsDeleting(true);

      await deleteStudy(studyId);

      toast.success("스터디가 삭제되었습니다.");
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 삭제 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoToMemberOnlyPage = (path) => {
    if (!isLoggedIn) {
      toast.info("로그인이 필요합니다.");
      navigate("/login", {
        state: {
          from: {
            pathname: path,
          },
        },
      });
      return;
    }

    if (!isMember) {
      toast.info("스터디에 참여한 멤버만 이용할 수 있습니다.");
      return;
    }

    navigate(path);
  };

  const isMember = Boolean(membership?.isMember);
  const role = membership?.membership?.role;
  const isOwner = role === "OWNER";

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
          {isMembershipLoading ? (
            <Button disabled>멤버십 확인 중...</Button>
          ) : isOwner ? (
            <>
              <Button disabled>OWNER</Button>
              <Link to={`/studies/${study.studyId}/edit`}>
                <Button variant="secondary">스터디 수정</Button>
              </Link>
              <Button
                variant="danger"
                onClick={handleDeleteStudy}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "스터디 삭제"}
              </Button>
            </>
          ) : isMember ? (
            <>
              <Button disabled>참여중</Button>
              <Button
                variant="secondary"
                onClick={handleLeaveStudy}
                disabled={isMembershipSubmitting}
              >
                {isMembershipSubmitting ? "처리 중..." : "스터디 탈퇴"}
              </Button>
            </>
          ) : (
            <Button onClick={handleJoinStudy} disabled={isMembershipSubmitting}>
              {isMembershipSubmitting ? "참여 중..." : "스터디 참여하기"}
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() =>
              handleGoToMemberOnlyPage(`/studies/${study.studyId}/habits`)
            }
          >
            오늘의 습관
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              handleGoToMemberOnlyPage(`/studies/${study.studyId}/focus`)
            }
          >
            오늘의 집중
          </Button>

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