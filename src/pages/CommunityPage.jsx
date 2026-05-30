import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button.jsx";
import { getPostList } from "../api/postApi.js";
import { useAuth } from "../contexts/AuthContext.jsx";

// =============================================================================
// 유틸리티 및 상수
// =============================================================================
const PAGE_SIZE = 10;

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function CommunityPage() {
  // 인증 및 권한 관련 상태
  const { isLoggedIn } = useAuth();

  // 1. 게시글 및 페이징 관련 상태
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // 2. 검색 및 필터링(정렬) 관련 상태
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("recent");

  // 3. 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 게시글 리스트 조회 (페이지네이션 및 추가 로드 대응)
  const loadPosts = async (pageToLoad = 1, append = false) => {
    try {
      setIsLoading(true);

      const response = await getPostList({
        page: pageToLoad,
        pageSize: PAGE_SIZE,
        keyword,
        sort,
      });

      const nextPosts = response.data.posts;
      const pagination = response.data.pagination;

      // append가 true면 기존 배열에 추가(더보기), false면 새로운 배열로 교체(검색/초기 로드)
      setPosts((prev) => (append ? [...prev, ...nextPosts] : nextPosts));
      setHasNextPage(pagination.hasNextPage);
      setPage(pageToLoad);
    } catch (error) {
      const message =
        error.response?.data?.message || "게시글 목록을 불러오지 못했습니다.";

      toast.error(message, {
        toastId: "post-list-error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 사용자 인터랙션 이벤트 핸들러 구역
  // =============================================================================
  
  // 검색 폼 제출 핸들러
  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadPosts(1, false); // 첫 페이지부터 새로운 검색 결과로 채움
  };

  // 게시글 더보기 클릭 핸들러
  const handleLoadMore = () => {
    loadPosts(page + 1, true); // 다음 페이지 데이터를 기존 목록 뒤에 붙임
  };

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 정렬 조건(sort)이 변경될 때마다 게시글 목록을 새로 불러옴
  useEffect(() => {
    loadPosts(1, false);
  }, [sort]);

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="space-y-8">
      {/* 상단 헤더 및 게시글 작성 버튼 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#578246]">커뮤니티</p>
            <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
              함께 나누는 공부 이야기
            </h1>
            <p className="mt-3 text-gray-600">
              공부 팁, 질문, 응원을 자유롭게 남겨보세요.
            </p>
          </div>

          <Link to={isLoggedIn ? "/community/new" : "/login"}>
            <Button>게시글 작성</Button>
          </Link>
        </div>
      </div>

      {/* 검색/필터 필드 및 게시글 리스트 구역 */}
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 md:flex-row"
        >
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="검색어를 입력해주세요"
            className="h-12 flex-1 rounded-2xl border border-[#D9D6CE] bg-white px-4 text-sm outline-none focus:border-[#99C08E]"
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 rounded-2xl border border-[#D9D6CE] bg-white px-4 text-sm outline-none focus:border-[#99C08E]"
          >
            <option value="recent">최근순</option>
            <option value="likes">좋아요순</option>
            <option value="comments">댓글순</option>
          </select>

          <Button type="submit">검색</Button>
        </form>

        {isLoading && posts.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-8 text-center text-gray-500">
            게시글을 불러오는 중입니다...
          </p>
        ) : posts.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-[#F6F4EF] p-8 text-center text-gray-500">
            아직 게시글이 없어요.
          </p>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-[#E5E2DA]">
              {posts.map((post) => (
                <li key={post.postId}>
                  <Link
                    to={`/community/${post.postId}`}
                    className="block py-5 transition hover:bg-[#F6F4EF]"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {post.title}
                        </h2>

                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {post.content}
                        </p>

                        <p className="mt-3 text-xs text-gray-400">
                          {post.author?.nickname ?? "알 수 없음"} ·{" "}
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-3 text-sm text-gray-500">
                        <span>좋아요 {post.likeCount}</span>
                        <span>댓글 {post.commentCount}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {hasNextPage && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "불러오는 중..." : "더보기"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}