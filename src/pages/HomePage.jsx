import { useEffect, useState } from "react";
import { getStudyList } from "../api/studyApi.js";
import StudyCard from "../components/study/StudyCard.jsx";

const PAGE_SIZE = 6;

export default function HomePage() {
  const [studies, setStudies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("recent");
  const [isLoading, setIsLoading] = useState(false);

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

      setStudies((prev) =>
        append ? [...prev, ...nextStudies] : nextStudies
      );
      setHasNextPage(pagination.hasNextPage);
      setPage(pageToLoad);
    } catch (error) {
      console.error(error);
      alert("스터디 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudies(1, false);
  }, [sort]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadStudies(1, false);
  };

  const handleLoadMore = () => {
    loadStudies(page + 1, true);
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#578246]">스터디 둘러보기</h1>
        <p className="mt-2 text-gray-600">
          함께 성장할 스터디를 찾아보세요.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="mb-6 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="검색"
          className="h-12 flex-1 rounded-2xl border border-[#D9D6CE] bg-white px-4 outline-none focus:border-[#99C08E]"
        />

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

        <button
          type="submit"
          className="h-12 rounded-2xl bg-[#99C08E] px-6 font-semibold text-white hover:bg-[#578246]"
        >
          검색
        </button>
      </form>

      {isLoading && studies.length === 0 ? (
        <p className="rounded-3xl bg-white p-8 text-center text-gray-500">
          스터디를 불러오는 중입니다...
        </p>
      ) : studies.length === 0 ? (
        <p className="rounded-3xl bg-white p-8 text-center text-gray-500">
          아직 둘러볼 스터디가 없어요.
        </p>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study) => (
              <StudyCard key={study.studyId} study={study} />
            ))}
          </div>

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