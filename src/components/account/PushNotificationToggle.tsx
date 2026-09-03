// src/components/account/PushNotificationToggle.tsx
// プッシュ通知（ベータ）のトグル + テスト送信 + iOS導線。
//
// 権限要求(Notification.requestPermission)は必ずこのトグルのクリック起点で行う
// （ページロード時には呼ばない）。iOS Safari は「ホーム画面に追加」して standalone
// PWA として起動したときのみ購読できるため、未インストール時は案内文を出す。
"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  savePushSubscription,
  deletePushSubscription,
  sendTestPush,
} from "@/lib/services/push-subscriptions";

/** base64url(VAPID公開鍵) → applicationServerKey 用 Uint8Array（ArrayBuffer 裏付け） */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** この端末が push に対応しているか（SW + PushManager + Notification） */
function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** iOS/iPadOS Safari か（PWA未起動時の案内判定に使う） */
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS はデスクトップUAを偽装するため、タッチ可能なMacも iPad とみなす
  const iPadOS =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

/** standalone（ホーム画面から起動したPWA）で動いているか */
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

export function PushNotificationToggle() {
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // iOS Safari だがまだPWA未インストール → 購読不可、案内を出す
  const [needsIosInstall, setNeedsIosInstall] = useState(false);
  // ブラウザで通知がブロック済み（再プロンプト不可 → サイト設定から許可し直す案内を出す）
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false);
      // iOS Safari は未インストールだと PushManager が無い＝ここに来る。案内を出す。
      if (isIOS() && !isStandalone()) {
        setNeedsIosInstall(true);
      }
      return;
    }

    // ブラウザで通知がブロック済みか（再プロンプト不可なので案内表示に使う）
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "denied"
    ) {
      setPermissionDenied(true);
    }

    // 既存の購読状態を反映する
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEnabled(!!sub))
      .catch(() => {
        /* 取得失敗時はOFF表示のまま */
      });
  }, []);

  const handleToggle = async (next: boolean) => {
    if (pending) return;
    setError(null);
    setMessage(null);

    if (!supported) {
      if (needsIosInstall) {
        setError(
          "iPhone/iPad はホーム画面に追加してから、そのアイコンで開いてONにしてください。",
        );
      } else {
        setError("このブラウザはプッシュ通知に対応していません。");
      }
      return;
    }

    if (next) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  const subscribe = async () => {
    if (!VAPID_PUBLIC_KEY) {
      setError("プッシュ通知の設定が未完了です（管理者にお問い合わせください）。");
      return;
    }
    setPending(true);
    try {
      // 権限要求はこのクリック起点でのみ呼ぶ
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        if (permission === "denied") setPermissionDenied(true);
        setError(
          "通知が許可されていません。ブラウザの設定で通知を許可してください。",
        );
        return;
      }
      setPermissionDenied(false);

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const result = await savePushSubscription(
        subscription.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } },
        navigator.userAgent,
      );

      if (!result.success) {
        // 保存に失敗したらローカル購読も戻す（不整合を残さない）
        await subscription.unsubscribe().catch(() => {});
        setError(result.error ?? "購読の保存に失敗しました。");
        return;
      }

      setEnabled(true);
      setMessage("プッシュ通知をオンにしました。");
    } catch (e) {
      console.error("[PushNotificationToggle] subscribe failed:", e);
      setError("プッシュ通知の登録に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setPending(false);
    }
  };

  const unsubscribe = async () => {
    setPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe().catch(() => {});
      }
      setEnabled(false);
      setMessage("プッシュ通知をオフにしました。");
    } catch (e) {
      console.error("[PushNotificationToggle] unsubscribe failed:", e);
      setError("プッシュ通知の解除に失敗しました。");
    } finally {
      setPending(false);
    }
  };

  const handleTest = async () => {
    if (testing) return;
    setError(null);
    setMessage(null);
    setTesting(true);
    try {
      const result = await sendTestPush();
      if (result.success) {
        setMessage("テスト通知を送信しました。数秒以内に届きます。");
      } else {
        setError(result.error ?? "テスト送信に失敗しました。");
      }
    } catch {
      setError("テスト送信に失敗しました。");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="block font-noto-sans-jp text-sm font-medium text-gray-800">
            プッシュ通知（ベータ）
          </span>
          <p className="mt-0.5 font-noto-sans-jp text-xs text-muted-foreground">
            サイトを開いていないときでも、端末に通知が届きます。
          </p>
        </div>
        <Switch
          checked={enabled}
          disabled={pending || (!supported && !needsIosInstall)}
          onCheckedChange={handleToggle}
          aria-label="プッシュ通知"
        />
      </div>

      {needsIosInstall && (
        <p className="font-noto-sans-jp text-xs text-muted-foreground">
          iPhone / iPad の場合は、SafariでBONOを開き「共有 →
          ホーム画面に追加」した後、追加したアイコンから開いてこのトグルをONにしてください。
        </p>
      )}

      {enabled && (
        <div className="space-y-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? "送信中…" : "テスト送信"}
          </Button>
          <p className="font-noto-sans-jp text-xs text-muted-foreground">
            まず「テスト送信」で端末に通知が実際に表示されるか確認してください。表示されない場合は下の「通知が届かないとき」をご覧ください。
          </p>
        </div>
      )}

      {permissionDenied && (
        <p className="font-noto-sans-jp text-xs text-destructive" role="alert">
          このブラウザで通知がブロックされています。アドレスバーの鍵／サイト情報アイコン →
          「通知」を「許可」に変更してから、もう一度ONにしてください。
        </p>
      )}

      {message && (
        <p className="font-noto-sans-jp text-xs text-text-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="font-noto-sans-jp text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <details className="rounded-lg border border-border bg-muted/30 px-3 py-2">
        <summary className="cursor-pointer font-noto-sans-jp text-xs font-medium text-gray-800">
          🔔 通知が届かないとき
        </summary>
        <div className="mt-2 space-y-2 font-noto-sans-jp text-xs text-muted-foreground">
          <p>
            ONにして「テスト送信」しても表示されない場合、ブラウザ本体にOS側の通知許可が必要です。
          </p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <span className="font-medium text-gray-800">Mac</span>：システム設定 → 通知 →
              お使いのブラウザ（Chrome等）を選び「通知を許可」ON・スタイルを「バナー」に
            </li>
            <li>
              <span className="font-medium text-gray-800">Windows</span>：設定 → システム →
              通知 → お使いのブラウザをON
            </li>
            <li>
              <span className="font-medium text-gray-800">iPhone / iPad</span>：Safariで開き
              「共有 → ホーム画面に追加」→ 追加したアイコンから開いてON
            </li>
            <li>
              <span className="font-medium text-gray-800">共通</span>：集中モード /
              おやすみモードをOFFにする
            </li>
          </ul>
        </div>
      </details>
    </div>
  );
}
