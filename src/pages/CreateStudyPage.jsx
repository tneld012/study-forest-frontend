import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { createStudy } from "../api/studyApi";
import workspace1 from "../assets/studyCard/workspace_1.svg";
import workspace2 from "../assets/studyCard/workspace_2.svg";
import patternImg from "../assets/studyCard/pattern.svg";
import leafImg from "../assets/studyCard/leaf.svg";

const BACKGROUND_OPTIONS = [
  {
    value: "green",
    label: "그린",
    className: "bg-[#E7F3E7]",
  },
  {
    value: "yellow",
    label: "옐로우",
    className: "bg-[#FFF3C4]",
  },
  {
    value: "blue",
    label: "블루",
    className: "bg-[#DDF0FF]",
  },
  {
    value: "pink",
    label: "핑크",
    className: "bg-[#FFE1EC]",
  },
  {
    value: "workspace_1",
    label: "워크스페이스 1",
    image: workspace1,
  },
  {
    value: "workspace_2",
    label: "워크스페이스 2",
    image: workspace2,
  },
  {
    value: "pattern",
    label: "패턴",
    image: patternImg,
  },
  {
    value: "leaf",
    label: "리프",
    image: leafImg,
  },
];

export default function CreateStudyPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    introduce: "",
    backgroundKey: "green",
    isPublic: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (fieldName, value) => {
    setForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

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

  const isFormValid =
    form.name.trim().length >= 2 &&
    form.name.trim().length <= 30 &&
    form.introduce.trim().length >= 2 &&
    form.introduce.trim().length <= 200 &&
    form.backgroundKey;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    try {
      setIsSubmitting(true);

      const response = await createStudy({
        name: form.name.trim(),
        introduce: form.introduce.trim(),
        backgroundKey: form.backgroundKey,
        isPublic: form.isPublic,
      });

      toast.success("스터디가 생성되었습니다!");
      navigate(`/studies/${response.data.studyId}`);
    } catch (error) {
      const message =
        error.response?.data?.message || "스터디 생성 중 오류가 발생했습니다.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-[#578246]">스터디 만들기</h1>
      <p className="mt-2 text-sm text-gray-600">
        함께 공부할 스터디를 만들어보세요.
      </p>

      <form className="mt-8 space-y-7" onSubmit={handleSubmit}>
        <Input
          id="studyName"
          label="스터디 이름"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="스터디 이름을 입력해주세요"
          errorMessage={errors.name}
        />

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

          {errors.introduce && (
            <p className="mt-2 text-sm text-[#D9534F]">{errors.introduce}</p>
          )}
        </div>

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
                    <div
                      className={`absolute inset-0 ${option.className}`}
                    />
                  )}

                  <span className="relative z-10 block p-3 text-sm font-semibold text-white">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? "만드는 중..." : "만들기"}
        </Button>
      </form>
    </section>
  );
}