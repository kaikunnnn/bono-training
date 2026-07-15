/**
 * /dev/question-community — みんなの掲示板 改善 Before/After ハブ
 *
 * 掲示板（/questions）の改善を、実装前の確認とリリース後のログを兼ねて
 * Before/After で比較できる形で集約するインデックス。
 * デザイン・挙動・体験が変わる改善はここに子ページ（or エントリ）を追加していく。
 *
 * 関連イシュー: rebono/issues/掲示板_テスト改善.md (#137)
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "掲示板 改善 Before/After (/dev/question-community)",
  robots: { index: false, follow: false },
};

type EntryStatus = "confirming" | "shipped" | "planned";

interface ImprovementEntry {
  /** #137 のサブタスク記号など */
  tag: string;
  title: string;
  summary: string;
  status: EntryStatus;
  /** Before/After を見られるページ（無ければ準備中） */
  href?: string;
}

interface VersionArchive {
  label: string;
  tag: string;
  url: string;
  note: string;
}

// 新しいバージョンを凍結したらここに追記する
// 手順: git tag questions-vYYYY-MM-DD → git branch archive/questions-vYYYY-MM-DD → 両方 push
const VERSION_ARCHIVES: VersionArchive[] = [
  {
    label: "v2026-07-09 の掲示板を触る",
    tag: "questions-v2026-07-09",
    url: "https://bono-training-git-archive-questions-58ece5-kaikunnnns-projects.vercel.app/questions",
    note: "初回実装 + ハードニング + モーダルアニメ刷新 + 投稿ボタン応答の時点",
  },
];

const entries: ImprovementEntry[] = [
  {
    tag: "#137-A",
    title: "投稿ボタンの応答フィードバック",
    summary:
      "「質問を投稿する」押下時に無反応で不安 → ①押した瞬間ボタンにスピナー ②即スケルトン画面（loading.tsx）の2段応答に。同じ待ち時間で旧新を体感比較できる。",
    status: "shipped",
    href: "/dev/question-post-feedback",
  },
  {
    tag: "#137-D",
    title: "ログイン訴求モーダルの整列",
    summary:
      "左揃えに統一 / アイコンをタイトルブロックへ / ボタン全幅フィル（2つは50%/50%）。現行と整列案を切替比較できる。",
    status: "confirming",
    href: "/dev/question-login-modal",
  },
  {
    tag: "modal-anim",
    title: "モーダルのフェードイン刷新",
    summary:
      "Tailwind v4 相性バグで「左上から流れる」動きだったのを「下から上にふわっと」へ。ui/modal.tsx + ui/alert-dialog.tsx で全モーダル共通化済み。上のモーダルページで再生確認できる。",
    status: "shipped",
    href: "/dev/question-login-modal",
  },
  {
    tag: "#137-B",
    title: "一覧 Empty 状態をアクション促しに",
    summary:
      "「まだ質問がありません」→「最初の質問を投稿してみよう」+ セカンダリーボタン。BONOのステート原則（空状態はアクションを促す）の適用第1号。原則は rules/03 に追記済み。",
    status: "shipped",
    href: "/dev/question-empty-state",
  },
  {
    tag: "#137-E",
    title: "Button のデザインシステム接続",
    summary:
      "Button default variant を --btn-primary-bg(#102720) / --radius-btn(14px) に接続。全画面に影響するため Before/After 必須。",
    status: "planned",
  },
];

function StatusBadge({ status }: { status: EntryStatus }) {
  if (status === "shipped") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-noto-sans-jp">
        反映済み
      </span>
    );
  }
  if (status === "confirming") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-noto-sans-jp">
        確認待ち
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-noto-sans-jp">
      予定
    </span>
  );
}

export default function QuestionCommunityDevHub() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-10 pb-6 border-b-2 border-gray-300">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            INTERNAL / みんなの掲示板
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            掲示板 改善 Before / After
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            /questions の改善を実装前の確認・リリース後のログとして集約する場所。
            デザイン・挙動・体験が変わる改善は、本体反映の前にここで Before/After
            を比較する（イシュー: 掲示板_テスト改善 #137）。
          </p>
          <p className="text-xs text-text-primary/40 mt-2 font-noto-sans-jp">
            対象ページ:{" "}
            <Link href="/questions" className="underline hover:text-text-primary">
              /questions（本体）
            </Link>
          </p>
        </header>

        {/* 触れるバージョンアーカイブ（git タグ + Vercel プレビューで当時の実物を保存） */}
        <section className="mb-10 rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
          <h2 className="text-sm font-bold text-text-primary font-rounded-mplus">
            🕰️ 触れるバージョンアーカイブ
          </h2>
          <p className="mt-1 text-xs text-text-primary/60 font-noto-sans-jp leading-relaxed">
            各時点のコミットを archive ブランチで凍結し、Vercel プレビューとしてデプロイ。
            クリックすると当時のアプリを実際に触れる（遷移・アニメ・フォーム操作OK）。
            ※プレビューは本番DBに接続するため、本番に掲示板テーブルを push
            するまでコメント・スタンプの操作は動かない。
          </p>
          <ul className="mt-3 space-y-2">
            {VERSION_ARCHIVES.map((v) => (
              <li key={v.tag} className="flex flex-wrap items-center gap-3 text-sm">
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-700 underline hover:text-blue-900 font-noto-sans-jp"
                >
                  {v.label}
                </a>
                <code className="text-xs text-text-primary/50">git tag: {v.tag}</code>
                <span className="text-xs text-text-primary/50 font-noto-sans-jp">
                  {v.note}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <ul className="space-y-4">
          {entries.map((entry) => {
            const card = (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-text-primary/40 font-noto-sans-jp">
                    {entry.tag}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
                <h2 className="mt-2 text-lg font-bold text-text-primary font-rounded-mplus">
                  {entry.title}
                </h2>
                <p className="mt-1 text-sm text-text-primary/60 font-noto-sans-jp leading-relaxed">
                  {entry.summary}
                </p>
                {!entry.href && (
                  <p className="mt-2 text-xs text-text-primary/40 font-noto-sans-jp">
                    比較ページ準備中
                  </p>
                )}
              </div>
            );
            return (
              <li key={entry.tag + entry.title}>
                {entry.href ? <Link href={entry.href}>{card}</Link> : card}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
