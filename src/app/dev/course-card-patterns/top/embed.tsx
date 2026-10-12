/**
 * Figma「他サイトの埋め込みテスト」（Courser2026 node 9:6668）の3パターンをざっくり再現（#235）
 *
 * 検証用ではなく「このスタイリングでトップに出したときの情報量・サムネの雰囲気」を見るだけのもの。
 * 文言は Figma のダミーデータそのまま。
 *
 * サムネ画像は他サイトの素材なので public/_local/course-embed/ に手元だけ置き、
 * .git/info/exclude で Git から外している（コミットしない・今後も使わない）。
 * 画像が無い環境ではグレーの背景だけになる。
 */

import Image from "next/image";
import { ArrowRight, Atom, Flame, Sparkles, Triangle } from "lucide-react";

const IMG = "/_local/course-embed";

interface MarketCourse {
  image: string;
  title: string;
  teacher: string;
  rating: string;
}

const D_COURSES: MarketCourse[] = [
  { image: `${IMG}/d1.png`, title: "Figmaでゼロから学ぶUIデザイン", teacher: "Daniele Buffa", rating: "4.9/5" },
  { image: `${IMG}/d2.png`, title: "北欧デザイン集中講座：ブランディングを総合的に学ぶ", teacher: "Hmmm Creative Studio", rating: "5/5" },
  { image: `${IMG}/d3.png`, title: "Figmaで革新的なウェブデザイン：ステップごとに学ぶ制作プロセス", teacher: "Louis Paquet", rating: "5/5" },
];

const F_COURSES: MarketCourse[] = D_COURSES.map((c, i) => ({ ...c, image: `${IMG}/f${i + 1}.png` }));

const E_COURSES = [
  {
    image: `${IMG}/e1.png`,
    title: "SaaS UIデザイン基礎コース",
    desc: "AIチャットでデータの分析・加工ができる表計算エディター。会話を通じて表を編集できます。",
    tags: ["ai", "表"],
    more: 7,
  },
  {
    image: `${IMG}/e2.png`,
    title: "デザインシステム基礎コース",
    desc: "Firecrawlであらゆるウェブサイトからブランドのデザインシステムを抽出。AIでトークンの出力、配色の生成、アクセシビリティチェックまで行えます。",
    tags: ["ai", "エージェント"],
    more: 8,
  },
  {
    image: `${IMG}/e3.png`,
    title: "UI情報設計基礎コース",
    desc: "AIチャットでバーンレートのグラフや財務分析を作成。会話からインタラクティブな可視化を生成します。",
    tags: ["ai", "アーティファクト"],
    more: 5,
  },
];

function Thumb({ src, aspect }: { src: string; aspect: string }) {
  return (
    <div className={`relative w-full overflow-hidden bg-muted-custom ${aspect}`}>
      <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
    </div>
  );
}

/** D / F：マーケット型（写真 or 画面サムネ → タイトル＋特価 → 講師・価格 → 評価） */
function MarketCard({ course, discount }: { course: MarketCourse; discount: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] border border-black/[0.08] bg-white font-noto-sans-jp text-text-primary">
      <Thumb src={course.image} aspect="aspect-[438/246]" />
      <div className="flex min-h-[104px] items-start justify-between gap-3 px-6 pt-6">
        <h3 className="text-lg font-medium leading-[1.4]">{course.title}</h3>
        <span className="mt-0.5 shrink-0 rounded border border-black/10 px-1 text-[11px] font-bold">特価</span>
      </div>
      <div className="flex items-center justify-between border-y border-black/[0.08] px-6 py-5">
        <p className="text-sm font-medium">講師：{course.teacher}</p>
        <p className="flex items-start gap-1">
          {discount && (
            <span className="flex flex-col items-end text-[10px] leading-tight">
              <span>91%OFF</span>
              <span className="text-red-500 line-through">$100</span>
            </span>
          )}
          <span className="text-[28px] leading-none">9.99</span>
          <span className="text-[10px]">{discount ? "米ドル" : "USD"}</span>
        </p>
      </div>
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <p className="text-sm text-text-primary/60">評価 {course.rating}</p>
          <div className="mt-1 h-1 w-[88px] rounded-full bg-yellow-300" />
        </div>
        <ArrowRight className="h-6 w-6" strokeWidth={1.5} />
      </div>
    </div>
  );
}

/** E：ギャラリー型（画面サムネ → タイトル → 説明2行 → タグ → ツールアイコン・見る） */
function GalleryCard({ course }: { course: (typeof E_COURSES)[number] }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[12px] border border-black/[0.08] bg-white font-noto-sans-jp text-text-primary">
      <Thumb src={course.image} aspect="aspect-[455/223]" />
      <div className="flex flex-1 flex-col px-4 pt-4">
        <h3 className="text-lg font-medium leading-[1.5]">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-[1.6] text-text-primary/60">{course.desc}</p>
        <div className="mt-4 flex items-center gap-1.5">
          {course.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-black/10 px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
          <span className="text-xs text-text-primary/40">+{course.more}</span>
        </div>
      </div>
      <div className="mx-4 mt-5 flex items-center justify-between border-t border-black/[0.08] py-3">
        <div className="flex items-center gap-2 text-text-primary/80">
          <Sparkles className="h-4 w-4" />
          <Triangle className="h-4 w-4" />
          <Atom className="h-4 w-4" />
          <Flame className="h-4 w-4" />
        </div>
        <span className="flex items-center gap-1 text-xs">
          見る <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

export function EmbedRow({ variant }: { variant: "d" | "e" | "f" }) {
  if (variant === "e") {
    return (
      <>
        {E_COURSES.map((c) => (
          <GalleryCard key={c.title} course={c} />
        ))}
      </>
    );
  }
  const courses = variant === "d" ? D_COURSES : F_COURSES;
  return (
    <>
      {courses.map((c) => (
        <MarketCard key={c.title} course={c} discount={variant === "d"} />
      ))}
    </>
  );
}
