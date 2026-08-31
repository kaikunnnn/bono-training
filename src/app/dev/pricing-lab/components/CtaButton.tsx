"use client";

import type { PlanType, PlanDuration } from "@/types/subscription";
import { getCtaView, type CtaState } from "../data";

/**
 * CTAボタン（4状態）。
 *
 * ルール03（押せる要素は共通Buttonを使う）とは異なるが、共通Buttonは
 * 色/角丸/影を持ち本ラボの「装飾禁止」指示と矛盾するため、ユーザーの
 * 装飾禁止指示を優先して素の <button> で実装する。
 *
 * onClick は console.log のみのダミー（実際のCheckout/updateは呼ばない）。
 */
export function CtaButton({
  plan,
  duration,
  ctaState,
}: {
  plan: PlanType;
  duration: PlanDuration;
  ctaState: CtaState;
}) {
  const { label, disabled } = getCtaView(ctaState, plan);

  return (
    <button
      type="button"
      disabled={disabled}
      className="border px-4 py-2 text-base"
      onClick={() =>
        // eslint-disable-next-line no-console
        console.log("[pricing-lab] CTA", { plan, duration, ctaState })
      }
    >
      {label}
    </button>
  );
}
