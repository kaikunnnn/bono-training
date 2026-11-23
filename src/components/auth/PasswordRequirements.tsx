"use client";

import { Check, Circle } from "lucide-react";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_LABEL,
  isPasswordLongEnough,
} from "@/lib/auth-password";

type Props = {
  password: string;
  /** 確認欄の値。渡したときだけ「一致しています」の行を出す */
  confirmPassword?: string;
};

function Row({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 text-xs font-noto-sans-jp ${
        ok ? "text-text-success" : "text-muted-foreground"
      }`}
    >
      {ok ? (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={3} />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{label}</span>
      <span className="sr-only">{ok ? "（OK）" : "（まだです）"}</span>
    </li>
  );
}

/**
 * パスワード欄の下に出す条件の一覧。満たしたら緑のチェックに変わる（#321）。
 */
export function PasswordRequirements({ password, confirmPassword }: Props) {
  const longEnough = isPasswordLongEnough(password);
  const remaining = Math.max(PASSWORD_MIN_LENGTH - password.length, 0);
  const lengthLabel =
    password.length > 0 && !longEnough
      ? `${PASSWORD_MIN_LENGTH_LABEL}（あと${remaining}文字）`
      : PASSWORD_MIN_LENGTH_LABEL;
  const showMatch = confirmPassword !== undefined && confirmPassword.length > 0;
  const matches = showMatch && password === confirmPassword;

  return (
    <ul className="space-y-1 pt-1" aria-live="polite">
      <Row ok={longEnough} label={lengthLabel} />
      {showMatch && (
        <Row ok={matches} label={matches ? "パスワードが一致しています" : "パスワードが一致していません"} />
      )}
    </ul>
  );
}
