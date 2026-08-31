"use client";

/**
 * プランCTAボタン（共通化・S1b）。
 *
 * 価格カード（PlanCards）とプラン説明（PlanDetail）で共有する状態別CTA。
 * 元は PlanCards 内の PlanCta サブコンポーネントにあったロジックをそのまま移植し、
 * 独立コンポーネントとして PlanDetail からも同じ課金フローに配線できるようにした。
 *
 * 状態別の挙動（PlanCta から不変）:
 *  - ダミーモード（isLoggedIn 未指定 = stateAware=false）: console.log CTA + href="#" 再開リンク。
 *  - 未ログイン: 「{プラン名}で始める」→ /signup?redirectTo=<intent付きURL> へ遷移（S1b/S2）。
 *      intent（plan/duration）を redirectTo に内包し、登録完了後に料金ページへ戻す。
 *      戻り先は現在パス（usePathname）基準。/subscription からは /subscription、
 *      /dev/pricing-final からは /dev/pricing-final に戻る。
 *  - ログイン済・未課金: 「{プラン名}で始める」→ createCheckoutSession → Stripe Checkout へ。
 *  - 課金中・現行プラン（type+duration一致）: 「現在のプラン」disabled。
 *  - 課金中・現行プランかつキャンセル予約中: 「プランを管理（再開/解約）」→ カスタマーポータル。
 *  - 課金中・他プラン/他期間: 「{プラン名}に変更」→ PlanChangeConfirmModal → updateSubscription。
 *
 * 二重送信ガード（isLoading）・失敗時エラー表示は元ロジックのまま維持。
 * 価格の数値/price_id はこのファイルに書かない（GA金額は getPlanPriceView 由来）。
 *
 * レイアウト方針: このコンポーネントは Button + エラー文 + 再開リンク を縦に並べた
 * fragment を返すのみ（外側の余白・並び・幅は呼び出し側が制御する）。呼び出し側で
 * flex-col 等に包むことで、再開リンクの self-start / エラー文の mt-2 が意図通り効く。
 */

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanType, PlanDuration } from "@/types/subscription";
import { getCtaLabel } from "@/lib/pricing/content";
import { getPlanPriceView } from "@/lib/pricing/price";
import {
  createCheckoutSession,
  updateSubscription,
  getCustomerPortalUrl,
} from "@/lib/services/stripe";
import {
  PlanChangeConfirmModal,
  type ModalState,
} from "@/components/subscription/PlanChangeConfirmModal";
import { trackSelectPlan, trackBeginCheckout } from "@/lib/analytics";

export interface PlanCtaButtonProps {
  /** プランタイプ（standard / feedback） */
  planType: PlanType;
  /** 表示中の期間（1 / 3） */
  duration: PlanDuration;
  // ---- 状態認識: いずれか渡された場合のみ実CTA配線に切り替わる。 ----
  // isLoggedIn 未指定なら現行のダミー表示（console.log / href="#"）を維持（後方互換）。
  /** ログイン済みか（undefined=ダミーモード / boolean=状態認識モード） */
  isLoggedIn?: boolean;
  /** 課金中か */
  isSubscribed?: boolean;
  /** 既存サブスクのプランタイプ（現在のプラン判定・変更モーダル用） */
  currentPlanType?: PlanType | null;
  /** 既存サブスクの期間（現在のプラン判定・変更モーダル用） */
  currentDuration?: PlanDuration | null;
  /** 既存サブスクの期間終了日（変更モーダルのプロレーション表示用） */
  currentPeriodEnd?: string | null;
  /** キャンセル予約中か（現行プランに「プランを管理」導線を出す） */
  cancelAtPeriodEnd?: boolean;
  // ---- 見た目（呼び出し側で調整） ----
  /** ボタンの基本 variant（現行プラン時は自動で outline に降格）。既定 "default"。 */
  variant?: ButtonProps["variant"];
  /** Button に付与する追加クラス（サイズ・min-width 等）。 */
  className?: string;
  /** true で w-full を付与（価格カードの全幅ボタン用）。 */
  fullWidth?: boolean;
  /**
   * true で小サイズ（h-8 / px-3.5 / text-[13px] / rounded-xl）＋濃色（bg-foreground）にする。
   * プラン説明ブロック（PlanDetail・Figma 43:4460）の小さめ CTA 用。未指定＝従来サイズ（カードCTA）。
   * 現行プラン時の outline 降格は維持するため、濃色は「現行プランでない」時のみ適用する。
   */
  compact?: boolean;
}

export function PlanCtaButton({
  planType,
  duration,
  isLoggedIn,
  isSubscribed = false,
  currentPlanType = null,
  currentDuration = null,
  currentPeriodEnd = null,
  cancelAtPeriodEnd = false,
  variant = "default",
  className,
  fullWidth = false,
  compact = false,
}: PlanCtaButtonProps) {
  const router = useRouter();
  // 現在のパス（料金ページは /subscription と /dev/pricing-final の両方でホストされる）。
  // signup 後の戻り先・ポータルの戻り先を現在パス基準にし、遷移元へ正しく戻す。
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("confirm");
  const [modalError, setModalError] = useState<string | undefined>();

  // isLoggedIn が渡された場合のみ実CTA配線（状態認識モード）。未指定＝ダミー。
  const stateAware = isLoggedIn !== undefined;

  // compact = 小サイズ寸法（濃色は下で状態に応じて付与）。
  const buttonClassName = cn(
    fullWidth && "w-full",
    compact && "h-8 px-3.5 text-[13px] rounded-xl",
    className
  );
  // 小サイズCTAの濃色（bg-foreground/text-background）。
  const compactSolidClass = compact
    ? "bg-foreground text-background hover:bg-foreground/90"
    : "";

  // ---- ダミーモード（後方互換）: 既存 /dev ページの見た目・挙動を維持 ----
  // 再開リンクは Figma(186) で撤去。再開導線はキャンセル予約中の実CTA=ポータルで担保。
  if (!stateAware) {
    return (
      <Button
        type="button"
        className={cn(buttonClassName, compactSolidClass)}
        variant={variant}
        onClick={() => console.log("[pricing] CTA", { plan: planType })}
      >
        {getCtaLabel(planType)}
      </Button>
    );
  }

  // 価格 view-model（表示名・GA金額の唯一の真実。価格リテラルは書かない）。
  const view = getPlanPriceView(planType, duration);

  // 現在のプラン判定（PlanSelector と同じ: プランタイプ AND 期間の両方一致）
  const isCurrentPlan =
    isSubscribed &&
    currentPlanType === planType &&
    currentDuration === duration;
  // GA 用の金額（PlanSelector の plan.prices[duration] と同義: 期間合計）
  const totalForDuration = duration === 3 ? view.total3m : view.monthly1m;

  // ---- チェックアウト（ログイン済・未課金） ----
  const startCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      trackBeginCheckout(planType, totalForDuration, duration);
      const returnUrl = `${window.location.origin}/subscription/success?plan=${planType}&duration=${duration}`;
      const { url, error: checkoutError } = await createCheckoutSession(
        returnUrl,
        planType,
        duration
      );
      if (checkoutError) {
        setError(checkoutError.message);
        return;
      }
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError("決済処理の開始に失敗しました。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- カスタマーポータル（キャンセル予約の再開/解約管理） ----
  const openPortal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // getCustomerPortalUrl は例外を投げる（createCheckoutSession と異なる）ため try/catch
      const returnUrl = `${window.location.origin}${pathname}`;
      const url = await getCustomerPortalUrl(returnUrl);
      window.location.href = url;
    } catch (err) {
      setError("プラン管理ページの表示に失敗しました。");
      console.error(err);
      setIsLoading(false);
    }
  };

  // ---- CTA クリック（状態で分岐） ----
  const handleClick = () => {
    trackSelectPlan(planType, totalForDuration, duration);

    if (!isLoggedIn) {
      // 未ログイン: intent（plan/duration）を redirectTo に内包して /signup へ。
      // 登録完了後に redirectTo（料金ページ + intent_*）へ戻り、S2 の useEffect が
      // 自動 checkout を起動する。
      const redirectTo = `${pathname}?intent_plan=${planType}&intent_duration=${duration}`;
      router.push(`/signup?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }

    // 既存サブスクライバーが他プラン/他期間を選択 → 変更モーダル
    if (isSubscribed && !isCurrentPlan && currentPlanType && currentDuration) {
      setShowChangeModal(true);
      setModalState("confirm");
      setModalError(undefined);
      return;
    }

    // ログイン済・未課金 → チェックアウト
    void startCheckout();
  };

  // ---- プラン変更確定 ----
  const handleConfirmChange = async () => {
    setModalState("processing");
    try {
      const { success, error: updateError } = await updateSubscription(
        planType,
        duration
      );
      if (!success || updateError) {
        setModalState("error");
        setModalError(updateError?.message || "プラン変更に失敗しました。");
        return;
      }
      router.push(
        `/subscription/success?type=updated&plan=${planType}&duration=${duration}`
      );
    } catch (err) {
      console.error("プラン変更エラー:", err);
      setModalState("error");
      setModalError("プラン変更に失敗しました。もう一度お試しください。");
    }
  };

  // ---- ボタン文言 ----
  const getButtonText = () => {
    if (isLoading) return "処理中...";
    if (isCurrentPlan) {
      return cancelAtPeriodEnd ? "プランを管理（再開/解約）" : "現在のプラン";
    }
    if (isSubscribed) return `${view.displayName}に変更`;
    return getCtaLabel(planType);
  };

  // 現行プラン（キャンセル予約なし）は disabled。それ以外は押下可能。
  const isDisabled = isLoading || (isCurrentPlan && !cancelAtPeriodEnd);
  // キャンセル予約中の現行プランはポータルへ、それ以外は状態分岐ハンドラへ。
  const onClick = isCurrentPlan && cancelAtPeriodEnd ? openPortal : handleClick;
  // 現行プラン時は base variant を outline に降格（元 PlanCta の分岐と同義）。
  const effectiveVariant = isCurrentPlan ? "outline" : variant;

  return (
    <>
      <Button
        type="button"
        className={cn(buttonClassName, !isCurrentPlan && compactSolidClass)}
        variant={effectiveVariant}
        disabled={isDisabled}
        onClick={onClick}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {getButtonText()}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {/* 再開の独立リンクは Figma(186) で撤去。キャンセル予約中の再開は上の CTA
          「プランを管理（再開/解約）」→ openPortal で担保する（挙動不変）。 */}

      {/* プラン変更確認モーダル */}
      {showChangeModal && currentPlanType && currentDuration && (
        <PlanChangeConfirmModal
          currentPlan={{ type: currentPlanType, duration: currentDuration }}
          newPlan={{ type: planType, duration }}
          currentPeriodEnd={
            currentPeriodEnd ? new Date(currentPeriodEnd) : new Date()
          }
          onConfirm={handleConfirmChange}
          onCancel={() => setShowChangeModal(false)}
          modalState={modalState}
          errorMessage={modalError}
        />
      )}
    </>
  );
}
