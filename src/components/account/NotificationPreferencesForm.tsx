// src/components/account/NotificationPreferencesForm.tsx
// 通知種別ごとのオン/オフトグル（楽観的更新＋失敗ロールバック＋二重送信ガード）
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { setNotificationPreference } from "@/lib/services/notification-preferences";
import type {
  NotificationPreferenceMap,
} from "@/lib/services/notification-preferences";
import type { NotificationType } from "@/types/notification";

/** 表示順とラベル（確定要件のラベルに一致させる） */
const PREFERENCE_ITEMS: {
  type: NotificationType;
  label: string;
  description: string;
}[] = [
  {
    type: "question_comment",
    label: "質問へのコメント",
    description: "自分の質問にコメントが付いたとき",
  },
  {
    type: "question_reaction",
    label: "質問へのリアクション",
    description: "自分の質問にリアクションが付いたとき",
  },
  {
    type: "comment_reaction",
    label: "自分のコメントへのリアクション",
    description: "自分のコメントにリアクションが付いたとき",
  },
];

interface NotificationPreferencesFormProps {
  initialPreferences: NotificationPreferenceMap;
}

export function NotificationPreferencesForm({
  initialPreferences,
}: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] =
    useState<NotificationPreferenceMap>(initialPreferences);
  // 切替中の種別（二重送信ガード用）
  const [pending, setPending] = useState<Set<NotificationType>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (type: NotificationType, next: boolean) => {
    // 二重送信ガード
    if (pending.has(type)) return;

    setError(null);
    // 楽観的更新
    setPreferences((prev) => ({ ...prev, [type]: next }));
    setPending((prev) => new Set(prev).add(type));

    try {
      const result = await setNotificationPreference(type, next);
      if (!result.success) {
        // ロールバック
        setPreferences((prev) => ({ ...prev, [type]: !next }));
        setError(result.error ?? "設定の保存に失敗しました。");
      }
    } catch {
      setPreferences((prev) => ({ ...prev, [type]: !next }));
      setError("設定の保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setPending((prev) => {
        const nextSet = new Set(prev);
        nextSet.delete(type);
        return nextSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <ul className="divide-y divide-border">
        {PREFERENCE_ITEMS.map((item) => {
          const checked = preferences[item.type];
          const isPending = pending.has(item.type);
          return (
            <li
              key={item.type}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <label
                  htmlFor={`notif-pref-${item.type}`}
                  className="block font-noto-sans-jp text-sm font-medium text-gray-800"
                >
                  {item.label}
                </label>
                <p className="mt-0.5 font-noto-sans-jp text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <Switch
                id={`notif-pref-${item.type}`}
                checked={checked}
                disabled={isPending}
                onCheckedChange={(value) => handleToggle(item.type, value)}
                aria-label={item.label}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
