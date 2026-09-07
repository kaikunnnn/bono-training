/**
 * /dev/branch-review — chivalrous-appendix ブランチのレビューページ
 *
 * このブランチで未マージの変更を「確認するページ」と「確認内容」の一覧にまとめる。
 * ここを上から順にチェックすれば、各コミットをマージするか捨てるかを判断できる。
 * 本番には出さない（/dev layout でゲート済み + noindex）。
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Branch Review: chivalrous-appendix (/dev/branch-review)",
  robots: { index: false, follow: false },
};

interface CheckItem {
  label: string;
  detail?: string;
}

interface CheckPage {
  href: string;
  title: string;
  note?: string;
  checks: CheckItem[];
}

interface CommitSection {
  commit: string;
  date: string;
  title: string;
  summary: string;
  decision: string;
  pages: CheckPage[];
}

const sections: CommitSection[] = [
  {
    commit: "75a5290",
    date: "2026-06-21",
    title: "フィードバックを /community/feedback に移設 + Figma準拠UI刷新",
    summary:
      "一覧・詳細を /feedbacks から /community/feedback へ移設。旧URLは301リダイレクト。詳細ページをFigma準拠に刷新（タグバッジ・32pxタイトル・メタ行・区切り線）。FeedbackCardを単色背景 + Fluent Emoji 3Dに刷新し、CategoryTabsとframer-motion依存を削除。MD→Sanity投入スクリプト（scripts/import-feedbacks.mjs）を追加。",
    decision:
      "判断ポイント: 新しい一覧/詳細のUIがFigmaの意図どおりか。URL移設（/community/ 配下に置く方針）を確定してよいか。OKならマージ、UIの方向性ごと見直すなら捨てる。",
    pages: [
      {
        href: "/community/feedback",
        title: "フィードバック一覧",
        checks: [
          {
            label: "ヘッダーが /guide スタイルで統一されているか",
            detail: "font-heading・左揃え・CategoryNav",
          },
          {
            label: "FeedbackCard の新デザイン",
            detail: "控えめな単色背景 + カテゴリ別 Fluent Emoji 3D。旧グラデ/アニメ（framer-motion）が消えていること",
          },
          {
            label: "カテゴリ絞り込みが機能するか",
            detail: "旧 CategoryTabs は削除済み。CategoryNav 経由で動くこと",
          },
        ],
      },
      {
        href: "/community/feedback",
        title: "フィードバック詳細（一覧から任意の記事へ）",
        note: "一覧からカードをクリックして /community/feedback/[slug] を開く",
        checks: [
          {
            label: "Figma準拠のレイアウト",
            detail: "タグバッジ / 32pxタイトル / メタ行 / 区切り線 / 動画下メタ",
          },
          {
            label: "本文が feedbackContent に統合されて表示されるか",
            detail: "旧 requestContent / reviewPoints のセクションが出ないこと",
          },
          {
            label: "本文に白カードの枠が付いていないか",
            detail: "RichTextSection の bare prop でwrapperを外している",
          },
          {
            label: "パンくずが記事タイトルで終わっていないか",
            detail: "末尾はカテゴリで止める方針",
          },
        ],
      },
      {
        href: "/feedbacks",
        title: "旧URL /feedbacks（リダイレクト確認）",
        checks: [
          {
            label: "/community/feedback へ301リダイレクトされるか",
            detail: "詳細の旧URL /feedbacks/[slug] → /community/feedback/[slug] も同様",
          },
        ],
      },
    ],
  },
  {
    commit: "7b5055a",
    date: "2026-06-26",
    title: "/guide を /notes (ものづくりノート) にリブランド + type badge 追加",
    summary:
      "/guide を /notes へリネーム（非公開のためリダイレクト無し）。ページタイトル「ものづくりノート」とサブコピー追加。Guide.type（guide / blog）を追加し、GuideCard にバッジ表示。RelatedGuides を「同カテゴリ優先→全体最新で補完（最大4本）」に改善。Sidebar / sitemap / パンくずの参照を更新。",
    decision:
      "判断ポイント: 「ものづくりノート」という名前と /notes というURLで確定してよいか。type バッジ（ガイド/ブログ）の見た目が意図どおりか。ネーミングごと再検討するなら捨てる。",
    pages: [
      {
        href: "/notes",
        title: "ものづくりノート一覧",
        checks: [
          {
            label: "タイトルが「ものづくりノート」+ サブコピーが表示されるか",
          },
          {
            label: "GuideCard に type バッジ（ガイド / ブログ）が出るか",
            detail: "type 未設定の既存記事は「ガイド」にフォールバック（GROQ coalesce）",
          },
          {
            label: "旧 /guide がリンク切れになっていないか",
            detail: "リダイレクトは意図的に無し（未公開のため）。サイト内に /guide への残リンクが無いことを確認",
          },
        ],
      },
      {
        href: "/notes",
        title: "ノート詳細（一覧から任意の記事へ）",
        note: "一覧からカードをクリックして /notes/[slug] を開く",
        checks: [
          {
            label: "パンくずが記事タイトルで終わっていないか",
            detail: "カテゴリで止める（feedback と同方針）",
          },
          {
            label: "「もっと読む」の関連記事が最大4本出るか",
            detail: "同カテゴリ優先 → 不足分は全体の最新記事で補完",
          },
          {
            label: "関連記事0件時に「一覧をみる」ボタンが出るか",
          },
        ],
      },
      {
        href: "/",
        title: "サイドバー（全ページ共通）",
        checks: [
          {
            label: "サイドバーのリンクが /notes / /community/feedback を指しているか",
            detail: "旧 /guide・/feedbacks への参照が残っていないこと",
          },
        ],
      },
      {
        href: "/sitemap.xml",
        title: "sitemap.xml",
        checks: [
          {
            label: "/notes・/community/feedback 系のURLに更新されているか",
            detail: "/guide・/feedbacks が sitemap に残っていないこと",
          },
        ],
      },
    ],
  },
];

export default function BranchReviewPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-12 pb-6 border-b-2 border-gray-300">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            INTERNAL / BRANCH REVIEW
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading mt-1">
            chivalrous-appendix レビュー
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            このブランチで main 未マージのコミットは2つ。それぞれ「確認するページ」を開いて
            チェック項目を見て、コミット単位でマージするか捨てるかを判断する。
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {sections.map((section) => (
            <section key={section.commit}>
              <div className="mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono font-bold text-text-primary/40 bg-gray-100 px-2 py-0.5 rounded">
                    {section.commit}
                  </span>
                  <span className="text-xs text-text-primary/40 font-noto-sans-jp">
                    {section.date}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-text-primary font-heading mt-2">
                  {section.title}
                </h2>
                <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed mt-2">
                  {section.summary}
                </p>
                <p className="text-sm font-bold text-text-primary font-noto-sans-jp leading-relaxed mt-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  {section.decision}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {section.pages.map((page, i) => (
                  <div
                    key={`${section.commit}-${i}`}
                    className="bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-6"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-text-primary font-heading">
                        {page.title}
                      </h3>
                      <Link
                        href={page.href}
                        target="_blank"
                        className="text-sm font-bold text-text-primary underline hover:no-underline font-noto-sans-jp flex-shrink-0"
                      >
                        {page.href} を開く →
                      </Link>
                    </div>
                    {page.note && (
                      <p className="text-xs text-text-primary/50 font-noto-sans-jp mb-2">
                        {page.note}
                      </p>
                    )}
                    <ul className="mt-3 flex flex-col gap-2">
                      {page.checks.map((check, j) => (
                        <li
                          key={j}
                          className="text-sm text-text-primary/80 font-noto-sans-jp leading-relaxed pl-6 relative"
                        >
                          <span className="absolute left-0 top-0.5 inline-block w-4 h-4 rounded border border-gray-400" />
                          {check.label}
                          {check.detail && (
                            <span className="block text-xs text-text-primary/50 mt-0.5">
                              {check.detail}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs text-text-primary/50 font-noto-sans-jp leading-relaxed">
            判断後の操作メモ: 両方OKならこのブランチをそのままPRへ（mainが先行しているためリベース推奨）。
            片方だけ捨てる場合はコミット単位で cherry-pick / revert を検討。
            未追跡の scripts/import-feedbacks.preview.json はインポートスクリプトのプレビュー出力（コミット不要）。
          </p>
          <p className="text-xs text-text-primary/40 font-noto-sans-jp mt-2">
            <Link href="/dev" className="underline hover:no-underline">
              ← Dev Portal に戻る
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
