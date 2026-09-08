/**
 * /dev/branch-review — chivalrous-appendix ブランチのレビューページ
 *
 * このブランチは本番ルート（/guide・/feedbacks）を一切変更せず、新UIを本番遮断プレビュー
 * （/notes・/community/feedback、いずれも dev/preview 環境でのみ表示）として同梱している。
 * ここを上から順にチェックすれば、新UIを採用するか捨てるかを判断できる。
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
    title: "フィードバック新UI（/community/feedback プレビュー）+ Figma準拠UI刷新",
    summary:
      "本番の /feedbacks は一切変更していない。新しい一覧・詳細UIを /community/feedback（本番遮断プレビュー）として同梱。詳細ページはFigma準拠（タグバッジ・32pxタイトル・メタ行・区切り線）、FeedbackCardは単色背景 + Fluent Emoji 3D。プレビュー専用のカードは src/components/dev-preview/feedback/ に隔離しており、本番 FeedbackCard には手を入れていない。MD→Sanity投入スクリプト（scripts/import-feedbacks.mjs）も同梱。",
    decision:
      "判断ポイント: プレビューを見て採用を決める。新しい一覧/詳細UIがFigmaの意図どおりで、/community/ 配下へ移設する方針でよければ採用 → 本番ルートへ昇格（/feedbacks の移設・旧URLの301リダイレクト追加）。不採用なら /community/feedback と dev-preview ごと削除する。",
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
        title: "本番 /feedbacks が変わっていないこと",
        checks: [
          {
            label: "/feedbacks が main と同じUIのまま表示されるか",
            detail: "リダイレクトは追加していない。旧UIの一覧・詳細（/feedbacks/[slug]）がそのまま生きていること",
          },
        ],
      },
    ],
  },
  {
    commit: "7b5055a",
    date: "2026-06-26",
    title: "ものづくりノート新UI（/notes プレビュー）+ type badge 追加",
    summary:
      "本番の /guide は一切変更していない。「ものづくりノート」リブランド案を /notes（本番遮断プレビュー）として同梱。ページタイトル「ものづくりノート」とサブコピー、Guide.type（guide / blog）バッジ、RelatedGuides の「同カテゴリ優先→全体最新で補完（最大4本）」改善を確認できる。プレビュー専用のカード/ヘッダー/関連は src/components/dev-preview/notes/ に隔離。Guide 型と GROQ の type 追加は additive（本番 /guide にも無害に入っている）。",
    decision:
      "判断ポイント: プレビューを見て採用を決める。「ものづくりノート」という名前・/notes というURL・type バッジ（ガイド/ブログ）の見た目でよければ採用 → 本番ルートへ昇格（/guide のリネーム等）。不採用なら /notes と dev-preview ごと削除する。",
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
            label: "カードのリンク先が /notes/[slug] になっているか",
            detail: "プレビュー専用カード（dev-preview/notes/GuideCard）は /notes を指す。本番 /guide のカードには影響しない",
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
        title: "サイドバー（全ページ共通）が変わっていないこと",
        checks: [
          {
            label: "サイドバーのリンクが main のまま（/guide・/feedbacks）か",
            detail: "本番ナビは変更していない。/notes・/community/feedback はサイドバーからは辿れない（プレビューのため直接URLで開く）",
          },
        ],
      },
      {
        href: "/sitemap.xml",
        title: "sitemap.xml が変わっていないこと",
        checks: [
          {
            label: "sitemap が main のまま（/guide・/feedbacks 系）か",
            detail: "プレビューの /notes・/community/feedback は sitemap に載せていない（noindex・本番遮断のため）",
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
            本番ルート（/guide・/feedbacks）は main と同一のまま。新UIは本番遮断プレビュー
            （/notes・/community/feedback）として同梱している。各「確認するページ」を開いて
            チェック項目を見て、新UIを採用するか捨てるかを判断する。
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
            判断後の操作メモ: 採用が決まった新UIは本番ルートへ昇格する（/notes → /guide のリネーム、
            /community/feedback → /feedbacks 移設 + 旧URLの301リダイレクト追加）。昇格時にこのプレビューの
            ゲート（notFound）を外す。不採用なら該当プレビュー（src/app/notes・src/app/community/feedback）と
            src/components/dev-preview 配下をまとめて削除する。本番ルートはこのブランチでは触っていないので、
            そのまま main にマージしても本番挙動は変わらない。
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
