// src/components/account/SlackDmToggle.tsx
// 「SlackのDMでのお知らせ」のオン/オフ（#327-H）。MemberMailToggle と同じ作り（楽観的更新＋失敗ロールバック＋二重送信ガード）
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { updateSlackDmSetting } from "@/app/account/notifications/slack-actions";

interface SlackDmToggleProps {
  /** 今の状態 */
  initialEnabled: boolean;
}

const LABEL = "SlackのDMでのお知らせ";

export function SlackDmToggle({ initialEnabled }: SlackDmToggleProps) {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (next: boolean) => {
    if (pending) return;
    setError(null);
    setEnabled(next);
    setPending(true);
    try {
      const result = await updateSlackDmSetting(next);
      if (result.success) {
        setEnabled(result.enabled);
      } else {
        setEnabled(!next);
        setError(result.error);
      }
    } catch {
      setEnabled(!next);
      setError("設定の保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor="slack-dm-enabled" className="block font-noto-sans-jp text-sm font-medium text-gray-800">
            {LABEL}
          </label>
          <p className="mt-0.5 font-noto-sans-jp text-xs text-muted-foreground">
            メールと同じご案内を、BONOのSlackのDMでもお送りします
          </p>
        </div>
        <Switch
          id="slack-dm-enabled"
          checked={enabled}
          disabled={pending}
          onCheckedChange={handleToggle}
          aria-label={LABEL}
        />
      </div>
    </div>
  );
}
