import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { getStudyDetail, updateStudy } from "../api/studyApi";

import workspace1 from "../assets/studyCard/workspace_1.svg";
import workspace2 from "../assets/studyCard/workspace_2.svg";
import patternImg from "../assets/studyCard/pattern.svg";
import leafImg from "../assets/studyCard/leaf.svg";

// =============================================================================
// 전역 설정 및 상수 구역
// =============================================================================
const BACKGROUND_OPTIONS = [
  { value: "green", label: "그린", className: "bg-[#E7F3E7]" },
  { value: "yellow", label: "옐로우", className: "bg-[#FFF3C4]" },
  { value: "blue", label: "블루", className: "bg-[#DDF0FF]" },
  { value: "pink", label: "핑크", className: "bg-[#FFE1EC]" },
  { value: "workspace_1", label: "워크스페이스 1", image: workspace1 },
  { value: "workspace_2", label: "워크스페이스 2", image: workspace2 },
  { value: "pattern", label: "패턴", image: patternImg },
  { value: "leaf", label: "리프", image: leafImg },
];

// =============================================================================
// 메인 컴포넌트
// =============================================================================
export default function EditStudyPage() {
  const { studyId } = useParams();
  const navigate = useNavigate();

  // 1. 폼 데이터 관련 상태 (기존 데이터 로드 후 초기화 예정)
  const [form, setForm] = useState({
    name: "",
    introduce: "",
    backgroundKey: "green",
    isPublic: true,
  });

  // 2. 초기 데이터 로딩 및 수정 제출 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // 내부 유틸리티 및 폼 핸들링 함수
  // =============================================================================
  
  // 지정된 필드의 값을 업데이트하는 공통 함수
  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // 실시간 필드별 에러 메시지 검증
  const errors = {
    name:
      form.name.length > 0 && form.name.trim().length < 2
        ? "스터디 이름은 최소 2글자 이상 입력해야 합니다."
        : form.name.trim().length > 30
          ? "스터디 이름은 최대 30글자 이하로 입력해야 합니다."
          : "",
    introduce:
      form.introduce.length > 0 && form.introduce.trim().length < 2
        ? "소개는 최소 2글자 이상 입력해야 합니다."
        : form.introduce.trim().length > 200
          ? "소개는 최대 200글자 이하로 입력해야 합니다."
          : "",
  };

  // 전체 폼 유효성 검증 (버튼 비활성화 여부)
  const isFormValid =
    form.name.trim().length >= 2 &&
    form.name.trim().length <= 30 &&
    form.introduce.trim().length >= 2 &&
    form.introduce.trim().length <= 200 &&
    form.backgroundKey;

  // =============================================================================
  // 비동기 백엔드 API 통신 함수 구역
  // =============================================================================
  
  // 기존 스터디 데이터 로드 및 폼 상태 동기화
  const loadStudy = async () => {
    try {
      setIsLoading(true);

      const response = await getStudyDetail(studyId);
      const study = response.data;

      setForm({
        name: study.name,
        introduce: study.introduce,
        backgroundKey: study.backgroundKey,
        isPublic: study.isPublic,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 정보를 불러오지 못했습니다.";

      toast.error(message, {
        toastId: `edit-study-load-error-${studyId}`,
      });

      // 불러오기 실패 시 해당 스터디 상세 페이지로 리다이렉트
      navigate(`/studies/${studyId}`);
    } finally {
      setIsLoading(false);
    }
  };

  // =============================================================================
  // 사용자 인터랙션 이벤트 핸들러 구역
  // =============================================================================
  
  // 스터디 정보 수정 제출 핸들러
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 유효하지 않은 폼이거나 이미 제출 중인 경우 차단
    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await updateStudy(studyId, {
        name: form.name.trim(),
        introduce: form.introduce.trim(),
        backgroundKey: form.backgroundKey,
        isPublic: form.isPublic,
      });

      toast.success("스터디 정보가 수정되었습니다!");
      // 수정 성공 후 변경된 스터디 상세 페이지로 이동
      navigate(`/studies/${studyId}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 수정 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================================================================
  // 라이프사이클 관리 (useEffect) 구역
  // =============================================================================
  
  // 컴포넌트 마운트 시 및 URL 파라미터(studyId)가 변경될 때마다 기존 데이터 로드
  useEffect(() => {
    loadStudy();
  }, [studyId]);

  // =============================================================================
  // 데이터 미도달 예외 차단용 Early Return 구역
  // =============================================================================
  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
        스터디 정보를 불러오는 중입니다...
      </section>
    );
  }

  // =============================================================================
  // 메인 레이아웃 리턴 구역
  // =============================================================================
  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">스터디 수정</h1>
      <p className="mt-2 text-sm text-gray-600">
        스터디 정보를 다시 정리해보세요.
      </p>

      <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
        {/* 스터디 이름 입력 필드 (공통 Input 컴포넌트 사용) */}
        <Input
          id="studyName"
          label="스터디 이름"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="스터디 이름을 입력해주세요"
          errorMessage={errors.name}
        />

        {/* 스터디 소개 입력 필드 */}
        <div>
          <label
            htmlFor="introduce"
            className="mb-2 block text-sm font-semibold text-gray-800"
          >
            소개
          </label>

          <textarea
            id="introduce"
            value={form.introduce}
            onChange={(event) => updateField("introduce", event.target.value)}
            placeholder="소개 멘트를 작성해주세요"
            className={[
              "min-h-32 w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition",
              "placeholder:text-gray-400",
              errors.introduce
                ? "border-[#D9534F] focus:border-[#D9534F]"
                : "border-[#D9D6CE] focus:border-[#99C08E]",
            ].join(" ")}
          />

          {/* 스터디 소개 에러 메시지 조건부 렌더링 */}
          {errors.introduce && (
            <p className="mt-2 text-sm text-[#D9534F]">{errors.introduce}</p>
          )}
        </div>

        {/* 카드 배경 이미지 및 단색 컬러 선택 구역 */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-800">배경 선택</p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BACKGROUND_OPTIONS.map((option) => {
              const isSelected = form.backgroundKey === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("backgroundKey", option.value)}
                  className={[
                    "relative h-24 overflow-hidden rounded-2xl border-2 text-left transition",
                    isSelected
                      ? "border-[#578246] ring-2 ring-[#99C08E]"
                      : "border-transparent hover:border-[#99C08E]",
                  ].join(" ")}
                >
                  {/* asset 이미지가 존재하면 img 태그, 없으면 단색 배경 블록 렌더링 */}
                  {option.image ? (
                    <>
                      <img
                        src={option.image}
                        alt={option.label}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 ${option.className}`} />
                  )}

                  <span className="relative z-10 block p-3 text-sm font-semibold text-white">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 공개 / 비공개 토글 선택 구역 */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-800">
            스터디 공개 여부
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateField("isPublic", true)}
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                form.isPublic
                  ? "border-[#578246] bg-[#E7F3E7] text-[#578246]"
                  : "border-[#D9D6CE] bg-white text-gray-600",
              ].join(" ")}
            >
              공개
            </button>

            <button
              type="button"
              onClick={() => updateField("isPublic", false)}
              className={[
                "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                !form.isPublic
                  ? "border-[#578246] bg-[#E7F3E7] text-[#578246]"
                  : "border-[#D9D6CE] bg-white text-gray-600",
              ].join(" ")}
            >
              비공개
            </button>
          </div>
        </div>

        {/* 수정 완료 제출 버튼 */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "수정 중..." : "수정 완료"}
        </Button>
      </form>
    </section>
  );
}