interface AccentBadgeProps {
  text?: string;
  className?: string;
}

/**
 * 黄色いバースト（ギザギザ円）のアクセントバッジ。
 * デザイン差し替え時はこのコンポーネントだけ変更すればよい。
 */
export default function AccentBadge({
  text = "Let's\ndo it →",
  className = "",
}: AccentBadgeProps) {
  const lines = text.split("\n");
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full animate-none"
        aria-hidden="true"
      >
        <polygon
          fill="#FFDE00"
          points="60,2 74,14 92,10 98,27 116,33 112,51 124,60 112,69 116,87 98,93 92,110 74,106 60,118 46,106 28,110 22,93 4,87 8,69 -4,60 8,51 4,33 22,27 28,10 46,14"
          transform="translate(0,0) scale(0.97) translate(2,2)"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center -rotate-6 text-text-primary font-line-seed-jp font-bold text-[14px] leading-[1.3] text-center whitespace-pre-line">
        {lines.join("\n")}
      </span>
    </div>
  );
}
