// src/components/account/MemberMailToggle.tsx
// 「BONOからのお知らせメール」のオン/オフ（#327-C）。楽観的更新＋失敗ロールバック＋二重送信ガード
"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { updateMemberMailSetting } from "@/app/account/notifications/mail-actions";

interface MemberMailToggleProps {
  /** 今の状態。null は読み込めなかった（切り替えられない） */
  initialEnabled: boolean | null;
}

const LABEL = "BONOからのお知らせメール";

export function MemberMailToggle({ initialEnabled }: MemberMailToggleProps) {
  const [enabled, setEnabled] = useState<boolean>(initialEnabled ?? true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unavailable = initialEnabled === null;

  const handleToggle = async (next: boolean) => {
    if (pending || unavailable) return;
    setError(null);
    setEnabled(next);
    setPending(true);
    try {
      const result = await updateMemberMailSetting(next);
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
          <label
            htmlFor="member-mail-enabled"
            className="block font-noto-sans-jp text-sm font-medium text-gray-800"
          >
            {LABEL}
          </label>
          <p className="mt-0.5 font-noto-sans-jp text-xs text-muted-foreground">
            {unavailable
              ? "いまは設定を読み込めません。時間をおいて開き直してください。"
              : "メルマガや、新しいコンテンツ・イベントなどのご案内"}
          </p>
        </div>
        <Switch
          id="member-mail-enabled"
          checked={unavailable ? false : enabled}
          disabled={pending || unavailable}
          onCheckedChange={handleToggle}
          aria-label={LABEL}
        />
      </div>
    </div>
  );
}
