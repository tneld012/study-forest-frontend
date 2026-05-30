import { useEffect, useState } from "react";
import { getStudyList } from "../api/studyApi.js";
import StudyCard from "../components/study/StudyCard.jsx";

// =============================================================================
// 전역 상수 및 유틸리티 설정 구역
// =============================================================================
const PAGE_SIZE = 6; // 한 페이지에 노출할 스터디 카드 개수

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function HomePage() {
  // 1. 스터디 목록 데이터 및 페이지네이션 상태 관리
  const [studies, setStudies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // 2. 검색 필터 및 정렬 조건 상태 관리
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("recent");

  // 3. 데이터 로딩 동기 상태 관리
  const [isLoading, setIsLoading] = useState(false);

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  /**
   * 백엔드로부터 스터디 목록 데이터를 가져오는 함수
   * @param {number} pageToLoad - 불러올 페이지 번호 (기본값: 1)
   * @param {boolean} append - 기존 목록 뒤에 붙일지(더보기), 새로 덮어쓸지(검색/정렬) 여부
   */
  const loadStudies = async (pageToLoad = 1, append = false) => {
    try {
      setIsLoading(true);

      const response = await getStudyList({
        page: pageToLoad,
        pageSize: PAGE_SIZE,
        keyword,
        sort,
      });

      const nextStudies = response.data.studies;
      const pagination = response.data.pagination;

      // append가 true이면 기존 데이터에 누적(더보기), false이면 새로운 데이터로 교체(검색/정렬)
      setStudies((prev) =>
        append ? [...prev, ...nextStudies] : nextStudies
      );
      setHasNextPage(pagination.hasNextPage); // 다음 페이지 존재 여부 동기화
      setPage(pageToLoad); // 현재 성공적으로 불러온 페이지 번호 저장
    } catch (error) {
      console.error(error);
      alert("스터디 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 라이프사이클 및 필터 변경 감지 (useEffect) 구역
  // =============================================================================
  
  // 정렬 조건(sort)이 변경될 때마다 언제나 첫 페이지(1)부터 데이터를 새로 리로드
  useEffect(() => {
    loadStudies(1, false);
  }, [sort]);

  // =============================================================================
  // 사용자 이벤트를 처리하는 핸들러 함수 구역
  // =============================================================================

  // 검색 폼 제출(Submit) 핸들러
  const handleSearchSubmit = (event) => {
    event.preventDefault(); // submit으로 인한 페이지 새로고침 방지
    loadStudies(1, false); // 입력된 키워드로 1페이지부터 새 목록 조회
  };

  // 목록 최하단 '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    loadStudies(page + 1, true); // 다음 페이지 데이터를 기존 목록 뒤에 누적해서 추가
  };

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section>
      {/* 상단 타이틀 및 인트로 구역 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#578246]">스터디 둘러보기</h1>
        <p className="mt-2 text-gray-600">
          함께 성장할 스터디를 찾아보세요.
        </p>
      </div>

      {/* 검색창 및 정렬 필터 조건 컨트롤 폼 구역 */}
      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex flex-col gap-3 sm:flex-row"
      >
        {/* 키워드 검색 인풋 */}
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="검색"
          className="h-12 flex-1 rounded-2xl border border-[#D9D6CE] bg-white px-4 outline-none focus:border-[#99C08E]"
        />

        {/* 정렬 셀렉트 박스 */}
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="h-12 rounded-2xl border border-[#D9D6CE] bg-white px-4 outline-none focus:border-[#99C08E]"
        >
          <option value="recent">최근순</option>
          <option value="oldest">오래된순</option>
          <option value="pointsHigh">많은 포인트순</option>
          <option value="pointsLow">적은 포인트순</option>
        </select>

        {/* 검색 실행 버튼 */}
        <button
          type="submit"
          className="h-12 rounded-2xl bg-[#99C08E] px-6 font-semibold text-white hover:bg-[#578246]"
        >
          검색
        </button>
      </form>

      {/* 데이터 로딩 및 목록 구역 */}
      {isLoading && studies.length === 0 ? (
        // 첫 페이지 로딩 중일 때 표시할 화면
        <p className="rounded-3xl bg-white p-8 text-center text-gray-500">
          스터디를 불러오는 중입니다...
        </p>
      ) : studies.length === 0 ? (
        // 조회된 데이터 리스트가 0건일 때의 Empty State 화면
        <p className="rounded-3xl bg-white p-8 text-center text-gray-500">
          아직 둘러볼 스터디가 없어요.
        </p>
      ) : (
        // 스터디 목록 데이터가 정상적으로 존재할 때 표현할 카드 그리드 UI
        <>
          {/* 스터디 카드 배치 레이아웃 구역 */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <StudyCard key={study.studyId} study={study} />
            ))}
          </div>

          {/* 다음 페이지 존재 여부에 따른 페이지네이션 '더보기' 버튼 구역 */}
          {hasNextPage && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="rounded-full border border-[#99C08E] px-6 py-3 font-semibold text-[#578246] hover:bg-white disabled:opacity-50"
              >
                {isLoading ? "불러오는 중..." : "더보기"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}