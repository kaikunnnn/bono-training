"use client";

import { useEffect, useState } from "react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import type { NotificationItem } from "@/types/notification";

/**
 * /dev/notifications — 通知一覧UIのスタイル調整用プレビュー（クリック不要で常時表示）。
 *
 * 本番の「お知らせ箱」（NotificationBell の PopoverContent）と同じ枠＋同じ
 * NotificationDropdown を使うので、ここで詰めた見た目がそのまま本番に反映される。
 * サンプルは 3 種の文言 / 既読・未読 / 各種相対時刻 / 名前フォールバック を網羅。
 *
 * ※ 相対時刻は現在時刻基準のため、ハイドレーション差異を避けてマウント後に生成する。
 */

/** 本番の PopoverContent と同じ枠でラップする（NotificationBell.tsx と一致させること） */
function NotifBox({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div className="w-[252px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-hairline)] bg-white shadow-[var(--shadow-popover)]">
        <div className="border-b px-4 py-3">
          <p className="text-xs font-medium text-[var(--text-primary)]">お知らせ</p>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function makeSampleItems(): NotificationItem[] {
  const now = Date.now();
  const MIN = 60_000;
  const HOUR = 60 * MIN;
  const DAY = 24 * HOUR;
  const ago = (ms: number) => new Date(now - ms).toISOString();
  const base = {
    actorAvatarUrl: null,
    entityType: "question",
    entityId: "q-sample",
    linkUrl: "#",
    payload: null,
  } as const;

  return [
    { ...base, id: "1", actorName: "たくみ", type: "question_comment", readAt: null, createdAt: ago(2 * MIN) },
    { ...base, id: "2", actorName: "さくら", type: "question_reaction", readAt: null, createdAt: ago(25 * MIN) },
    { ...base, id: "3", actorName: "たくみ", type: "comment_reaction", readAt: null, createdAt: ago(3 * HOUR) },
    { ...base, id: "4", actorName: null, type: "question_comment", readAt: null, createdAt: ago(50 * MIN) },
    { ...base, id: "5", actorName: "さくら", type: "question_comment", readAt: ago(20 * HOUR), createdAt: ago(DAY) },
    { ...base, id: "6", actorName: "たくみ", type: "question_reaction", readAt: ago(2 * DAY), createdAt: ago(3 * DAY) },
    { ...base, id: "7", actorName: "さくら", type: "comment_reaction", readAt: ago(9 * DAY), createdAt: ago(10 * DAY) },
    { ...base, id: "8", actorName: "とてもながいなまえのメンバーさん", type: "question_comment", readAt: null, createdAt: ago(6 * MIN) },
  ];
}

export default function DevNotificationsPreview() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    setItems(makeSampleItems());
  }, []);

  const noop = () => {};

  return (
    <div className="min-h-screen bg-base p-8">
      <h1 className="mb-1 text-lg font-bold text-[var(--text-primary)]">
        通知一覧プレビュー
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        /dev/notifications — 本番の「お知らせ箱」と同じ枠・同じ NotificationDropdown。
        スタイル調整は <code>src/components/notifications/NotificationDropdown.tsx</code> を編集すると即反映されます。
      </p>

      <div className="flex flex-wrap items-start gap-8">
        <NotifBox title="一覧（未読ドット・3種文言・相対時刻・名前フォールバック）">
          <NotificationDropdown
            items={items}
            isLoading={false}
            isError={false}
            onNavigate={noop}
            onRetry={noop}
          />
        </NotifBox>

        <NotifBox title="Empty（通知なし）">
          <NotificationDropdown
            items={[]}
            isLoading={false}
            isError={false}
            onNavigate={noop}
            onRetry={noop}
          />
        </NotifBox>

        <NotifBox title="Loading">
          <NotificationDropdown
            items={[]}
            isLoading={true}
            isError={false}
            onNavigate={noop}
            onRetry={noop}
          />
        </NotifBox>

        <NotifBox title="Error">
          <NotificationDropdown
            items={[]}
            isLoading={false}
            isError={true}
            onNavigate={noop}
            onRetry={noop}
          />
        </NotifBox>
      </div>
    </div>
  );
}
