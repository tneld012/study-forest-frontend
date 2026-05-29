import { Link } from "react-router-dom";
import { Emoji } from "emoji-picker-react";
import workspace1 from "../../assets/studyCard/workspace_1.svg";
import workspace2 from "../../assets/studyCard/workspace_2.svg";
import patternImg from "../../assets/studyCard/pattern.svg";
import leafImg from "../../assets/studyCard/leaf.svg";

const colorBackgroundClassMap = {
  green: "bg-[#E7F3E7]",
  yellow: "bg-[#FFF3C4]",
  blue: "bg-[#DDF0FF]",
  pink: "bg-[#FFE1EC]",
};

const imageBackgroundMap = {
  workspace_1: workspace1,
  workspace_2: workspace2,
  pattern: patternImg,
  leaf: leafImg,
};

function isImageBackground(backgroundKey) {
  return Boolean(imageBackgroundMap[backgroundKey]);
}

export default function StudyCard({ study }) {
  const hasImageBackground = isImageBackground(study.backgroundKey);
  const imageSrc = imageBackgroundMap[study.backgroundKey];
  const colorClass =
    colorBackgroundClassMap[study.backgroundKey] ?? colorBackgroundClassMap.green;

  return (
    <Link
      to={`/studies/${study.studyId}`}
      className={[
        "group relative block min-h-[210px] overflow-hidden rounded-3xl p-6 shadow-sm transition",
        "hover:-translate-y-1 hover:shadow-md",
        hasImageBackground ? "bg-gray-900 text-white" : `${colorClass} text-gray-900`,
      ].join(" ")}
    >
      {hasImageBackground && (
        <>
          <img
            src={imageSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}

      <article className="relative z-10 flex min-h-[162px] flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="line-clamp-2 text-lg font-extrabold leading-6">
              {study.name}
            </h2>

            <span
              className={[
                "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
                hasImageBackground
                  ? "bg-black/40 text-white"
                  : "bg-white/80 text-[#578246]",
              ].join(" ")}
            >
              {study.totalPoints}P 획득
            </span>
          </div>

          <p
            className={[
              "mt-3 text-sm",
              hasImageBackground ? "text-white/90" : "text-gray-600",
            ].join(" ")}
          >
            진행 중
          </p>

          <p
            className={[
              "mt-5 line-clamp-2 text-sm leading-6",
              hasImageBackground ? "text-white" : "text-gray-700",
            ].join(" ")}
          >
            {study.introduce}
          </p>
        </div>

        {study.topEmojis?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {study.topEmojis.map((emoji) => (
              <span
                key={emoji.emojiUnifiedCode}
                className={[
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold",
                  hasImageBackground
                    ? "bg-black/45 text-white"
                    : "bg-black/25 text-white",
                ].join(" ")}
              >
                <Emoji
                  unified={emoji.emojiUnifiedCode.toLowerCase()}
                  size={16}
                  emojiStyle="apple"
                />
                {emoji.count}
              </span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}