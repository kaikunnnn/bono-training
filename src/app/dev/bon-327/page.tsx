/**
 * /dev — デザインパターン確認ポータル
 *
 * 各カテゴリの検証ページへのインデックス。
 * 本番には出さない、開発中の検討用。
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Design Pattern Portal (/dev)",
  robots: { index: false, follow: false },
};

interface PatternEntry {
  href: string;
  category: string;
  title: string;
  description: string;
  status: "ready" | "wip";
}

const entries: PatternEntry[] = [
  // === /stories まわり ===
  {
    href: "/dev/stories-list",
    category: "📖 /stories（ストーリー）",
    title: "一覧ページ 叩き（カードB版）",
    description:
      "PageHeader + タグフィルタ + カードグリッド（カードB: 画像+タイトル+名前+職種）+ /outputs への回遊CTA。",
    status: "ready",
  },
  {
    href: "/dev/stories-list-a",
    category: "📖 /stories（ストーリー）",
    title: "一覧ページ（カードA + 概要なし版）",
    description:
      "同じレイアウトでカードを最小化版（画像+タイトル+名前のみ）に。最もシンプルな一覧体験。",
    status: "ready",
  },
  {
    href: "/dev/story-card",
    category: "📖 /stories（ストーリー）",
    title: "カード パターン比較（現状版 / A / B / C）",
    description: "一覧カードの要素削減方針を決めるための4種比較。",
    status: "ready",
  },
  {
    href: "/dev/story-detail-a",
    category: "📖 /stories（ストーリー）",
    title: "詳細ページ パターン1（/blog 完全踏襲）",
    description:
      "/blog レイアウト完全踏襲。人物・bio・SNS・ロードマップは本文中に埋め込む。統一感MAX、実装最小。",
    status: "ready",
  },
  {
    href: "/dev/story-detail",
    category: "📖 /stories（ストーリー）",
    title: "詳細ページ パターン2（プロフカード強化）★推し",
    description:
      "/blog ベース + 人物プロフィールカードを独立ブロック化。使ったロードマップも独立カード。",
    status: "ready",
  },
  {
    href: "/dev/story-detail-c",
    category: "📖 /stories（ストーリー）",
    title: "詳細ページ パターン3（物語性強化）",
    description:
      "Heroオーバーレイで人物名・ビフォー/アフター強調。Pull Quote で物語性最大化。",
    status: "ready",
  },
  {
    href: "/dev/story-detail-d",
    category: "📖 /stories（ストーリー）",
    title: "詳細ページ パターン4（Figma Blog風タイポ）★Figma参照",
    description:
      "余白たっぷり・本文 16px/lh 1.85・H1 56px・本文幅 700px。背景 #f9f9f7、本文色 #354540。Figma の PROD-Guide-Blog_2026 のスタイル踏襲。",
    status: "ready",
  },

  // === /outputs まわり ===
  {
    href: "/dev/outputs-list",
    category: "✏️ /outputs（アウトプット）",
    title: "一覧ページ 叩き（グリッド版）",
    description:
      "現状版：縦長カードのグリッド。/stories と形が似ている。",
    status: "ready",
  },
  {
    href: "/dev/outputs-list-list",
    category: "✏️ /outputs（アウトプット）",
    title: "一覧ページ（リスト型バリアント）★リサーチ推し",
    description:
      "Zapier/Intercom/Substack list view 風の横長カード。流し読みに最適。/stories との形状差で一目区別。",
    status: "ready",
  },
  {
    href: "/dev/output-card",
    category: "✏️ /outputs（アウトプット）",
    title: "カード パターン比較（現状版 / リスト型）",
    description:
      "縦長カード（現状）と横長リスト型を並べて比較。",
    status: "ready",
  },

  // === ハブ ===
  {
    href: "/dev/achievements-mixed",
    category: "🏠 /achievements（ハブ）",
    title: "ストーリー=グリッド × アウトプット=リスト型（Mixed）",
    description:
      "Magazine Layout 風。リスト型は流し読み最適化。/stories との形状差で一目区別。",
    status: "ready",
  },
  {
    href: "/dev/achievements-mixed-banner",
    category: "🏠 /achievements（ハブ）",
    title: "ストーリー=グリッド × アウトプット=バナー型 ★ユーザー提案",
    description:
      "アウトプットを横長バナー型（aspect 2:1）で配置。サムネを大きく見せて note 記事のキャッチー感を保ちつつ、/stories と形状で差別化。",
    status: "ready",
  },
];

function StatusBadge({ status }: { status: PatternEntry["status"] }) {
  if (status === "ready") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-noto-sans-jp">
        Ready
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-noto-sans-jp">
      WIP
    </span>
  );
}

export default function DevPortalPage() {
  // カテゴリごとにグルーピング
  const grouped = entries.reduce<Record<string, PatternEntry[]>>((acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        <header className="mb-12 pb-6 border-b-2 border-gray-300">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            INTERNAL
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            Design Pattern Portal
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            デザインパターン・プロトタイプの検証用ページ。本番には公開されない。
            <br />
            BON-327 / BON-345 のスタイル選定で使用。
          </p>
        </header>

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-12">
            <h2 className="text-xs font-bold text-text-primary/50 font-noto-sans-jp mb-4 tracking-wider">
              {category.toUpperCase()}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((entry) => (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group block bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus group-hover:underline">
                      {entry.title}
                    </h3>
                    <StatusBadge status={entry.status} />
                  </div>
                  <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
                    {entry.description}
                  </p>
                  <p className="text-xs text-text-primary/40 mt-3 font-noto-sans-jp">
                    {entry.href} →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* 参考リンク */}
        <section className="mt-16 pt-6 border-t border-gray-200">
          <h2 className="text-xs font-bold text-text-primary/50 font-noto-sans-jp mb-4 tracking-wider">
            REFERENCE
          </h2>
          <ul className="space-y-2 text-sm font-noto-sans-jp">
            <li>
              <Link
                href="/achievements"
                className="text-text-primary hover:underline"
              >
                /achievements
              </Link>
              <span className="text-text-primary/50 ml-2">
                ハブページ（現状版）
              </span>
            </li>
            <li>
              <Link href="/lessons" className="text-text-primary hover:underline">
                /lessons
              </Link>
              <span className="text-text-primary/50 ml-2">
                参照: 一覧ページ・幅・PageHeader
              </span>
            </li>
            <li>
              <Link href="/blog" className="text-text-primary hover:underline">
                /blog
              </Link>
              <span className="text-text-primary/50 ml-2">
                参照: 記事詳細レイアウト
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
