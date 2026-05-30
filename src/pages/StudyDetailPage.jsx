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
import { getWeeklyHabitRecords } from "../api/habitApi.js";
import {
  createStudyComment,
  deleteStudyComment,
  getStudyComments,
  updateStudyComment,
} from "../api/studyCommentApi.js";

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function getMonday(date = new Date()) {
  const copiedDate = new Date(date);
  const day = copiedDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  copiedDate.setDate(copiedDate.getDate() + diff);
  copiedDate.setHours(0, 0, 0, 0);

  return copiedDate;
}

function addDays(date, days) {
  const copiedDate = new Date(date);
  copiedDate.setDate(copiedDate.getDate() + days);
  return copiedDate;
}

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function StudyDetailPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  const [study, setStudy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isLoggedIn } = useAuth();
  const [membership, setMembership] = useState(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(false);
  const [isMembershipSubmitting, setIsMembershipSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [weeklyRecords, setWeeklyRecords] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState(formatDateOnly(getMonday()));
  const [isWeeklyRecordsLoading, setIsWeeklyRecordsLoading] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const isMember = Boolean(membership?.isMember);
  const role = membership?.membership?.role;
  const isOwner = role === "OWNER";

  const loadMyMembership = async () => {
    if (!isLoggedIn) {
      setMembership(null);
      return;
    }

    try {
      setIsMembershipLoading(true);
      const response = await getMyStudyMembership(studyId);
      setMembership(response.data);
    } catch (error) {
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

  const loadWeeklyHabitRecords = async () => {
    if (!isLoggedIn || !isMember) {
      setWeeklyRecords(null);
      return;
    }

    try {
      setIsWeeklyRecordsLoading(true);
      const response = await getWeeklyHabitRecords(studyId, {
        startDate: weekStartDate,
      });
      setWeeklyRecords(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message || "습관 기록표를 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `weekly-records-error-${studyId}`,
      });
    } finally {
      setIsWeeklyRecordsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setIsCommentsLoading(true);
      const response = await getStudyComments(studyId);
      setComments(response.data.comments);
    } catch (error) {
      const message =
        error.response?.data?.message || "댓글 목록을 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `study-comments-error-${studyId}`,
      });
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => {
    loadStudyDetail();
  }, [studyId]);

  useEffect(() => {
    loadMyMembership();
  }, [studyId, isLoggedIn]);

  useEffect(() => {
    loadWeeklyHabitRecords();
  }, [studyId, weekStartDate, isLoggedIn, isMember]);

  useEffect(() => {
    loadComments();
  }, [studyId]);

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

  const handlePreviousWeek = () => {
    setWeekStartDate((prev) => formatDateOnly(addDays(new Date(prev), -7)));
  };

  const handleNextWeek = () => {
    setWeekStartDate((prev) => formatDateOnly(addDays(new Date(prev), 7)));
  };

  const handleCreateComment = async () => {
    const trimmedContent = commentContent.trim();

    if (!isLoggedIn) {
      toast.info("로그인이 필요합니다.");
      return;
    }

    if (!isMember) {
      toast.info("스터디에 참여한 멤버만 댓글을 작성할 수 있습니다.");
      return;
    }

    if (!trimmedContent) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setIsCommentSubmitting(true);
      await createStudyComment(studyId, {
        content: trimmedContent,
      });
      toast.success("댓글이 작성되었습니다.");
      setCommentContent("");
      await loadComments();
    } catch (error) {
      const message =
        error.response?.data?.message || "댓글 작성 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.commentId);
    setEditingCommentContent(comment.content);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent("");
  };

  const handleUpdateComment = async (commentId) => {
    const trimmedContent = editingCommentContent.trim();

    if (!trimmedContent) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      setIsCommentSubmitting(true);
      await updateStudyComment(studyId, commentId, {
        content: trimmedContent,
      });
      toast.success("댓글이 수정되었습니다.");
      setEditingCommentId(null);
      setEditingCommentContent("");
      await loadComments();
    } catch (error) {
      const message =
        error.response?.data?.message || "댓글 수정 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const isConfirmed = window.confirm("댓글을 삭제하시겠습니까?");

    if (!isConfirmed) return;

    try {
      setIsCommentSubmitting(true);
      await deleteStudyComment(studyId, commentId);
      toast.success("댓글이 삭제되었습니다.");
      await loadComments();
    } catch (error) {
      const message =
        error.response?.data?.message || "댓글 삭제 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsCommentSubmitting(false);
    }
  };

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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">습관 기록표</h2>
            <p className="mt-2 text-sm text-gray-500">
              스터디 멤버들의 주간 습관 달성 현황입니다.
            </p>
          </div>

          {isMember && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handlePreviousWeek}>
                이전 주
              </Button>
              <Button variant="secondary" onClick={handleNextWeek}>
                다음 주
              </Button>
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-6 text-center text-gray-500">
            로그인하면 습관 기록표를 확인할 수 있어요.
          </p>
        ) : !isMember ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-6 text-center text-gray-500">
            스터디에 참여한 멤버만 습관 기록표를 볼 수 있어요.
          </p>
        ) : isWeeklyRecordsLoading ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-6 text-center text-gray-500">
            습관 기록표를 불러오는 중입니다...
          </p>
        ) : !weeklyRecords || weeklyRecords.habits.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-6 text-center text-gray-500">
            아직 습관 기록이 없어요.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr>
                  <th className="w-44 rounded-l-2xl bg-[#F6F4EF] px-4 py-3 text-left font-bold text-gray-700">
                    습관
                  </th>

                  {WEEK_DAYS.map((day, index) => (
                    <th
                      key={day}
                      className="bg-[#F6F4EF] px-4 py-3 text-center font-bold text-gray-700 last:rounded-r-2xl"
                    >
                      <div>{day}</div>
                      <div className="mt-1 text-xs font-normal text-gray-400">
                        {weeklyRecords.habits[0]?.records[index]?.date?.slice(5)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {weeklyRecords.habits.map((habit) => (
                  <tr key={habit.habitId}>
                    <td className="rounded-l-2xl bg-white px-4 py-4 font-semibold text-gray-800 shadow-sm">
                      {habit.name}
                    </td>

                    {habit.records.map((record) => (
                      <td
                        key={record.date}
                        className="bg-white px-4 py-4 text-center shadow-sm last:rounded-r-2xl"
                      >
                        <div
                          className={[
                            "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold",
                            record.isCompleted
                              ? "bg-[#578246] text-white"
                              : record.doneCount > 0
                                ? "bg-[#E7F3E7] text-[#578246]"
                                : "bg-[#F6F4EF] text-gray-400",
                          ].join(" ")}
                        >
                          {record.doneCount}/{record.totalMemberCount}
                        </div>

                        <p className="mt-1 text-xs text-gray-400">
                          {record.completionRate}%
                        </p>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4 text-sm text-gray-500">
              전체 멤버 수: {weeklyRecords.memberCount}명
            </p>
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">댓글</h2>

        <div className="mt-6 rounded-2xl bg-[#F6F4EF] p-5">
          <textarea
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            placeholder={
              isLoggedIn
                ? isMember
                  ? "댓글을 작성해주세요"
                  : "스터디 멤버만 댓글을 작성할 수 있어요"
                : "로그인 후 댓글을 작성할 수 있어요"
            }
            disabled={!isLoggedIn || !isMember || isCommentSubmitting}
            className="min-h-24 w-full resize-none rounded-2xl border border-[#D9D6CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#99C08E] disabled:bg-gray-100"
          />

          <div className="mt-3 flex justify-end">
            <Button
              onClick={handleCreateComment}
              disabled={!isLoggedIn || !isMember || isCommentSubmitting}
            >
              {isCommentSubmitting ? "작성 중..." : "댓글 작성"}
            </Button>
          </div>
        </div>

        {isCommentsLoading ? (
          <p className="mt-8 text-center text-gray-500">댓글을 불러오는 중입니다...</p>
        ) : comments.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-6 text-center text-gray-500">
            아직 댓글이 없어요.
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {comments.map((comment) => {
              const isMine = user?.userId === comment.authorId;
              const isEditing = editingCommentId === comment.commentId;

              return (
                <li
                  key={comment.commentId}
                  className="rounded-2xl border border-[#E5E2DA] bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {comment.author?.nickname ?? "알 수 없음"}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {isMine && !isEditing && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEditComment(comment)}
                          className="text-sm font-semibold text-gray-500 hover:text-[#578246]"
                        >
                          수정
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.commentId)}
                          className="text-sm font-semibold text-[#D9534F]"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-4">
                      <textarea
                        value={editingCommentContent}
                        onChange={(event) =>
                          setEditingCommentContent(event.target.value)
                        }
                        className="min-h-24 w-full resize-none rounded-2xl border border-[#D9D6CE] bg-white px-4 py-3 text-sm outline-none focus:border-[#99C08E]"
                      />

                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancelEditComment}>
                          취소
                        </Button>

                        <Button
                          onClick={() => handleUpdateComment(comment.commentId)}
                          disabled={isCommentSubmitting}
                        >
                          저장
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 whitespace-pre-wrap text-gray-700">
                      {comment.content}
                    </p>
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