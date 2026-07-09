/**
 * /dev — 内部用デザイン検討ポータル（上位）
 *
 * 過去・現在のデザイン検討プロセスをまとめる。
 * 個別の検討は `/dev/<issue-id>` 配下に配置。
 * 本番には出さない（noindex）。
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dev Portal (/dev)",
  robots: { index: false, follow: false },
};

interface DevProjectEntry {
  href: string;
  issue: string;
  title: string;
  summary: string;
  status: "in-progress" | "shipped" | "archived";
}

const projects: DevProjectEntry[] = [
  {
    href: "/dev/question-community",
    issue: "掲示板 #137",
    title: "みんなの掲示板：改善 Before/After ハブ",
    summary:
      "/questions の改善を実装前確認 + リリース後ログとして集約。ログイン訴求モーダルの整列案・アニメーション刷新など。",
    status: "in-progress",
  },
  {
    href: "/dev/design-breakdown/achievements",
    issue: "DESIGN",
    title: "/achievements 分解ダッシュボード",
    summary:
      "/achievements を トークン / コンポーネント / ブロック の3層に分解し、各ノブを動かすと画面の印象がどう変わるかを比較で示す分析用ダッシュボード。",
    status: "in-progress",
  },
  {
    href: "/dev/bon-327",
    issue: "BON-327",
    title: "受講者ストーリー & アウトプット まわり",
    summary:
      "/achievements ハブ・/stories 一覧&詳細・/outputs 一覧の検討プロセス。カード/詳細ページの複数パターン比較。",
    status: "shipped",
  },
];

function StatusBadge({ status }: { status: DevProjectEntry["status"] }) {
  if (status === "shipped") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-noto-sans-jp">
        Shipped
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-noto-sans-jp">
        In Progress
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-noto-sans-jp">
      Archived
    </span>
  );
}

export default function DevPortalPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-12 pb-6 border-b-2 border-gray-300">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            INTERNAL
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            Dev Portal
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            デザイン検討プロセスのアーカイブ。Issue ごとに検討ページをまとめている。
            本番には公開されない（noindex）。
          </p>
        </header>

        <section>
          <h2 className="text-xs font-bold text-text-primary/50 font-noto-sans-jp mb-4 tracking-wider">
            PROJECTS
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                className="group block bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-text-primary/40 font-noto-sans-jp tracking-wider flex-shrink-0">
                      {entry.issue}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus group-hover:underline truncate">
                      {entry.title}
                    </h3>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
                  {entry.summary}
                </p>
                <p className="text-xs text-text-primary/40 mt-3 font-noto-sans-jp">
                  {entry.href} →
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
