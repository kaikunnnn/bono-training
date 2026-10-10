"use client";

/**
 * トップに置くコースカードの横3枚ブロック＋切り替えバー（#235）
 *
 * パターン（A/B/C/C2）・カード背景（なし/白/枠線）・仮タグを画面下の固定バーで切り替える。
 * 状態は URL（?pattern=&surface=&kari=）にも書き戻すので、組み合わせをリンクで共有できる。
 * サーバー再描画を避けるため router ではなく history.replaceState で URL だけ更新する。
 */

import { useEffect, useState } from "react";
import { CardA, CardB, CardC, CardC2, type CardProps, type Surface } from "../patterns";
import { TOP_COURSES } from "../mock";
import { EmbedRow } from "./embed";

export type PatternId = "a" | "b" | "c" | "c2" | "d" | "e" | "f";

/** Figma 埋め込みテスト（node 9:6668）の再現。中身は Figma のダミーのまま、背景切替は効かない */
const EMBED_PATTERNS: { id: "d" | "e" | "f"; label: string }[] = [
  { id: "d", label: "D 写真＋割引" },
  { id: "e", label: "E ギャラリー" },
  { id: "f", label: "F 画面サムネ" },
];

const PATTERNS: { id: PatternId; label: string; Card: (props: CardProps & { surface: Surface }) => React.JSX.Element }[] = [
  { id: "a", label: "A 説明文＋3項目", Card: CardA },
  { id: "b", label: "B 1行＋制作者・価格", Card: CardB },
  { id: "c", label: "C 対象者を上", Card: CardC },
  { id: "c2", label: "C2 対象者を下", Card: CardC2 },
];

const SURFACES: { id: Surface; label: string }[] = [
  { id: "none", label: "直置き" },
  { id: "white", label: "白いカード" },
  { id: "border", label: "薄い枠線" },
];

export function CourseTopRow({
  initialPattern,
  initialSurface,
  initialKari,
}: {
  initialPattern: PatternId;
  initialSurface: Surface;
  initialKari: boolean;
}) {
  const [pattern, setPattern] = useState<PatternId>(initialPattern);
  const [surface, setSurface] = useState<Surface>(initialSurface);
  const [showKari, setShowKari] = useState(initialKari);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("pattern", pattern);
    params.set("surface", surface);
    if (showKari) params.set("kari", "1");
    else params.delete("kari");
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }, [pattern, surface, showKari]);

  const embed = EMBED_PATTERNS.find((p) => p.id === pattern);
  const { Card } = PATTERNS.find((p) => p.id === pattern) ?? PATTERNS[0];

  return (
    <>
      {/* 本番トップの PurposeNav / FeaturedSeries と同じ左右余白・下線 */}
      <section className="px-6 lg:px-12">
        <div className="border-b border-black/[0.12] py-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:gap-6">
            {embed ? (
              <EmbedRow variant={embed.id} />
            ) : (
              TOP_COURSES.map((course) => (
                <Card key={course.id} course={course} showKari={showKari} surface={surface} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 切り替えバー（確認用。画面下に固定） */}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-black/10 bg-white/95 px-4 py-2 font-noto-sans-jp text-xs font-bold text-text-primary shadow-[0px_4px_18px_0px_rgba(0,0,0,0.16)] backdrop-blur">
        <div className="flex items-center gap-1">
          {PATTERNS.map((p) => (
            <SegmentButton key={p.id} active={pattern === p.id} onClick={() => setPattern(p.id)}>
              {p.label}
            </SegmentButton>
          ))}
        </div>
        <span className="h-5 w-px bg-black/10" aria-hidden />
        <div className="flex items-center gap-1">
          <span className="px-1 text-[10px] text-text-primary/50">Figma参考</span>
          {EMBED_PATTERNS.map((p) => (
            <SegmentButton key={p.id} active={pattern === p.id} onClick={() => setPattern(p.id)}>
              {p.label}
            </SegmentButton>
          ))}
        </div>
        <span className="h-5 w-px bg-black/10" aria-hidden />
        <div className="flex items-center gap-1">
          {SURFACES.map((s) => (
            <SegmentButton key={s.id} active={surface === s.id} onClick={() => setSurface(s.id)}>
              {s.label}
            </SegmentButton>
          ))}
        </div>
        <span className="h-5 w-px bg-black/10" aria-hidden />
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={showKari}
            onChange={(e) => setShowKari(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          仮タグ
        </label>
      </div>
    </>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 transition-colors ${
        active ? "bg-text-primary text-white" : "text-text-primary hover:bg-black/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}
