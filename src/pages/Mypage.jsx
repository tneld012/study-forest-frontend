import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getMyComments,
  getMyFocusSessions,
  getMyPosts,
  getMyStudies,
  getMySummary,
} from "../api/userApi.js";

// =============================================================================
// 전역 일반 유틸리티 함수 구역
// =============================================================================

// 초 단위를 분 단위로 내림 변환
function secondsToMinutes(seconds) {
  return Math.floor(seconds / 60);
}

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function MyPage() {
  // 1. 유저 통계 데이터 및 카테고리별 마이 리스트 상태 관리
  const [summary, setSummary] = useState(null);
  const [studies, setStudies] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  
  // 2. 통합 대시보드 데이터 동기 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 마이페이지에 필요한 여러 데이터를 동시에 한 번에 가져오기
  const loadMyPage = async () => {
    try {
      setIsLoading(true);

      const [
        summaryResponse,
        studiesResponse,
        postsResponse,
        commentsResponse,
        focusResponse,
      ] = await Promise.all([
        getMySummary(),
        getMyStudies(),
        getMyPosts(),
        getMyComments(),
        getMyFocusSessions(),
      ]);

      // 가져온 데이터를 각각의 상태(State)에 나누어 저장
      setSummary(summaryResponse.data);
      setStudies(studiesResponse.data.studies);
      setPosts(postsResponse.data.posts);
      setComments(commentsResponse.data.comments);
      setFocusSessions(focusResponse.data.focusSessions);
    } catch (error) {
      const message =
        error.response?.data?.message || "마이페이지 정보를 불러오지 못했습니다.";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 컴포넌트 마운트 최초 시점에 다중 레코드 비동기 Fetcher 함수 트리거
  useEffect(() => {
    loadMyPage();
  }, []);

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        마이페이지를 불러오는 중입니다...
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="space-y-8">
      {/* 유저 핵심 요약 지표 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-[#578246]">마이페이지</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
          {summary?.user.nickname}님, 안녕하세요!
        </h1>
        <p className="mt-2 text-sm text-gray-500">{summary?.user.email}</p>

        {/* 상단 4열 통계 요약 카드 배정 */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-[#F6F4EF] p-5">
            <p className="text-sm text-gray-500">총 포인트</p>
            <p className="mt-2 text-2xl font-extrabold text-[#578246]">
              {summary?.points.totalPoint ?? 0}P
            </p>
          </div>

          <div className="rounded-2xl bg-[#F6F4EF] p-5">
            <p className="text-sm text-gray-500">참여 스터디</p>
            <p className="mt-2 text-2xl font-extrabold text-[#578246]">
              {summary?.studies.joinedStudyCount ?? 0}개
            </p>
          </div>

          <div className="rounded-2xl bg-[#F6F4EF] p-5">
            <p className="text-sm text-gray-500">작성 게시글</p>
            <p className="mt-2 text-2xl font-extrabold text-[#578246]">
              {summary?.posts.postCount ?? 0}개
            </p>
          </div>

          <div className="rounded-2xl bg-[#F6F4EF] p-5">
            <p className="text-sm text-gray-500">작성 댓글</p>
            <p className="mt-2 text-2xl font-extrabold text-[#578246]">
              {summary?.comments.totalCommentCount ?? 0}개
            </p>
          </div>
        </div>
      </div>

      {/* 내 스터디 소속 리스트 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">내 스터디</h2>

        <ul className="mt-6 space-y-3">
          {studies.map((study) => (
            <li key={study.studyId}>
              <Link
                to={`/studies/${study.studyId}`}
                className="block rounded-2xl bg-[#F6F4EF] p-5 hover:bg-[#E7F3E7]"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">{study.name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {study.introduce}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#578246]">
                    {study.role}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 내 커뮤니티 작성 게시글 리스트 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">내 게시글</h2>

        <ul className="mt-6 space-y-3">
          {posts.map((post) => (
            <li key={post.postId}>
              <Link
                to={`/community/${post.postId}`}
                className="block rounded-2xl bg-[#F6F4EF] p-5 hover:bg-[#E7F3E7]"
              >
                <p className="font-bold text-gray-900">{post.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {post.content}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  좋아요 {post.likeCount} · 댓글 {post.commentCount}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 내 댓글 리스트 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">내 댓글</h2>

        <ul className="mt-6 space-y-3">
          {comments.map((comment) => {
            // 소속 타입 세션에 따라 동적 URL 설정
            const link =
              comment.type === "POST"
                ? `/community/${comment.target.postId}`
                : `/studies/${comment.target.studyId}`;

            return (
              <li key={comment.commentId}>
                <Link
                  to={link}
                  className="block rounded-2xl bg-[#F6F4EF] p-5 hover:bg-[#E7F3E7]"
                >
                  <p className="text-sm font-semibold text-[#578246]">
                    {comment.type === "POST" ? "게시글 댓글" : "스터디 댓글"}
                  </p>
                  <p className="mt-2 text-gray-700">{comment.content}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 내 집중 몰입 기록 타임라인 세션 리스트 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">내 집중 기록</h2>

        <ul className="mt-6 space-y-3">
          {focusSessions.map((session) => (
            <li
              key={session.focusSessionId}
              className="rounded-2xl bg-[#F6F4EF] p-5"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">
                    {session.study.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {secondsToMinutes(session.elapsedSeconds)}분 집중
                  </p>
                </div>

                <span className="font-bold text-[#578246]">
                  +{session.pointDelta}P
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}