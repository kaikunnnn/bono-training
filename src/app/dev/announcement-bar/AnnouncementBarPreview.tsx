"use client";

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Button } from "@/components/ui/button";
import {
  CURRENT_ANNOUNCEMENT,
  resetAnnouncementDismissal,
} from "@/lib/announcement";

export function AnnouncementBarPreview() {
  const announcement = CURRENT_ANNOUNCEMENT;
  const afterDeadline = announcement
    ? Date.parse(announcement.endsAt) + 1000
    : 0;

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-xl font-bold text-text-primary">
          お知らせバー（#220）
        </h1>
        <p className="text-sm text-text-secondary">
          本番では /top と /mypage の上部にだけ出る。❌ で閉じると、このブラウザでは
          以後表示しない（localStorage）。下の2つは同じキーを共有しているので、
          片方を閉じると両方消える。
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-text-muted">
          <dt>id</dt>
          <dd>{announcement?.id ?? "（なし）"}</dd>
          <dt>表示期限</dt>
          <dd>{announcement?.endsAt ?? "-"}</dd>
          <dt>リンク</dt>
          <dd>{announcement?.href ?? "-"}</dd>
        </dl>
        {announcement && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resetAnnouncementDismissal(announcement.id)}
          >
            閉じた記録をリセット
          </Button>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary">
          モバイル幅（375px の枠）
        </h2>
        <p className="text-xs text-text-muted">
          文字サイズの切り替えは画面幅（sm=640px）基準。実機相当の見た目はウィンドウ幅を
          375px にして確認する。
        </p>
        <div className="w-[375px] max-w-full overflow-hidden border border-border-light bg-base">
          <AnnouncementBar />
          <div className="h-24 p-4 text-xs text-text-muted">（ページ本文）</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary">
          デスクトップ幅（メインブロック全幅）
        </h2>
        <div className="w-full overflow-hidden border border-border-light bg-base">
          <AnnouncementBar />
          <div className="h-24 p-4 text-xs text-text-muted">（ページ本文）</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-text-primary">
          期限切れ（締切の1秒後を指定）
        </h2>
        <div className="w-full overflow-hidden border border-border-light bg-base">
          <AnnouncementBar now={afterDeadline} />
          <div className="h-12 p-4 text-xs text-text-muted">
            （バーが出ていなければ OK）
          </div>
        </div>
      </section>
    </div>
  );
}
