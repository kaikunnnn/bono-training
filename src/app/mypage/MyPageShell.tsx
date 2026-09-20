"use client";

import { IconButton } from "@/components/ui/button/IconButton";
import { IntentPrefetchLink } from "@/components/common/IntentPrefetchLink";

export type TabId = "all" | "progress" | "favorite" | "history";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "progress", label: "進捗" },
  { id: "favorite", label: "お気に入り" },
  { id: "history", label: "閲覧履歴" },
];

/**
 * マイページのヘッダー + タブナビ
 * タブ切替はURL paramsで行う。hover/focus時だけprefetchすることで、
 * 初期表示時に認証付きタブ3本を一括取得せずApp Router遷移を利用する。
 */
export function MyPageShell({
  activeTab,
  children,
}: {
  activeTab: TabId;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <div className="pt-10 pb-0 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold leading-6 font-rounded-mplus text-slate-950">
            マイページ
          </h1>
          <IntentPrefetchLink href="/profile">
            <IconButton icon={null} label="プロフィール" onClick={() => {}} />
          </IntentPrefetchLink>
        </div>

        {/* タブナビ */}
        <div
          className="p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex items-center gap-2"
          role="tablist"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const href = tab.id === "all" ? "/mypage" : `/mypage?tab=${tab.id}`;

            return (
              <IntentPrefetchLink
                key={tab.id}
                href={href}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                scroll={false}
                className={`px-2 py-1.5 rounded-md flex justify-center items-center text-xs font-bold leading-3 transition-all ${
                  isActive
                    ? "bg-white text-black shadow-[0px_2px_2px_0px_rgba(0,0,0,0.04)]"
                    : "text-black/50 hover:text-black/70"
                }`}
                style={{ fontFamily: "'Rounded Mplus 1c', sans-serif" }}
              >
                {tab.label}
              </IntentPrefetchLink>
            );
          })}
        </div>
      </div>

      {/* コンテンツ（Server Component を Suspense で受ける） */}
      <div className="px-4 py-8 max-w-3xl mx-auto space-y-6">{children}</div>
    </div>
  );
}
