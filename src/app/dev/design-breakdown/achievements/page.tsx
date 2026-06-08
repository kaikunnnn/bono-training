/**
 * /dev/design-breakdown/achievements
 *
 * /achievements を トークン / コンポーネント / ブロック の3層に分解した分析用ダッシュボード。
 *
 * メインのパイロット: LAYER 2 — /achievements の構造解剖
 *   - InteractiveLayer2.tsx に Client Component で実装
 *   - ラボ: /achievements 全体プレビュー + 6変数トグル + プリセット + コンポーネント輪郭表示
 *   - フォーカス: StoryCardItem を実サイズで1枚拡大表示
 *   - 部位解説 + 階層チート + まとめ
 */

import { Metadata } from "next";
import Link from "next/link";
import InteractiveLayer2 from "./InteractiveLayer2";

export const metadata: Metadata = {
  title: "/achievements 分解ダッシュボード",
  robots: { index: false, follow: false },
};

/* ===========================================================================
 *  Header の Status バッジ
 * ===========================================================================*/

type StatusTone = "defined" | "local" | "adhoc";

function StatusBadge({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  const styles: Record<StatusTone, string> = {
    defined: "bg-green-100 text-green-800",
    local: "bg-red-100 text-red-800",
    adhoc: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold font-noto-sans-jp ${styles[tone]} whitespace-nowrap`}
    >
      {children}
    </span>
  );
}

/* ===========================================================================
 *  Page
 * ===========================================================================*/

export default function AchievementsBreakdownPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-12">
        {/* === Header === */}
        <header className="mb-12 pb-6 border-b-2 border-gray-300">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            INTERNAL — DESIGN BREAKDOWN
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            /achievements 分解ダッシュボード
          </h1>
          <p className="text-sm text-text-primary/70 mt-3 font-noto-sans-jp leading-relaxed max-w-[760px]">
            <Link href="/achievements" className="underline font-bold hover:opacity-70">
              /achievements
            </Link>
            {" "}
            を <strong>トークン / コンポーネント / ブロック</strong> の3層で分解し、
            <strong>各変数を動かしたら画面がどう変わるか</strong> と
            <strong>なぜこのバランスが成立しているか</strong> を見せる分析用ダッシュボード。
          </p>
          <div className="mt-5 bg-surface rounded-[16px] p-4 sm:p-5 border border-gray-200/60">
            <p className="text-[11px] font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-2">
              📍 ダッシュボードの構成
            </p>
            <ul className="text-sm text-text-primary font-noto-sans-jp leading-relaxed space-y-1.5">
              <li>・ <strong>🎛️ ラボ</strong> — /achievements 全体プレビューを 6変数で動かす（プリセット + コンポーネント輪郭ON対応）</li>
              <li>・ <strong>👁️ 拡大表示</strong> — StoryCardItem を実サイズで1枚拡大、トグルに連動</li>
              <li>・ <strong>① 部位別の解説 + ② 階層チート + 💡 まとめ</strong> — なぜこのバランスかを言語化</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <StatusBadge tone="defined">✅ 決まってる（design-system token）</StatusBadge>
            <StatusBadge tone="local">🚨 ローカル（コンポーネント内定数）</StatusBadge>
            <StatusBadge tone="adhoc">⚠️ ad-hoc（Tailwindデフォルト直）</StatusBadge>
          </div>
        </header>

        {/* === メイン === */}
        <InteractiveLayer2 />

        {/* === Next === */}
        <section id="next" className="mt-20 pt-8 border-t-2 border-gray-300 scroll-mt-6">
          <p className="text-xs font-bold text-text-primary/40 font-noto-sans-jp tracking-wider mb-3">
            NEXT — 型確定後に展開予定
          </p>
          <ul className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed space-y-2">
            <li>
              ・ <strong>ラボに「コードを見る」パネル追加</strong> — トグルの組み合わせに対応する className を表示してコピーできるように
            </li>
            <li>
              ・ <strong>OutputBannerCardItem / SectionHeading / DottedDivider も解剖</strong> — 部位別の解説を追加してコンポーネントごとの差を見える化
            </li>
            <li>
              ・ <strong>LAYER 3 — BLOCK</strong> — 3列グリッドの列数比較・順序入れ替え・DottedDivider 有無
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
