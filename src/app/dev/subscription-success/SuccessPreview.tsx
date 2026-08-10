/**
 * /dev/subscription-success の状態切り替えプレビュー（Client）
 *
 * 本番 /subscription/success がレンダリングする SubscriptionSuccessContent を
 * DB / Stripe / Webhook なしで、各状態（成功・ローディング・エラー、
 * 新規/プラン変更、プラン種別、期間）に切り替えて確認できるようにする。
 */

"use client";

import { useState } from "react";
import { SubscriptionSuccessContent } from "@/components/subscription/SubscriptionSuccessContent";
import type { SuccessType } from "@/components/subscription/SubscriptionSuccessContent";
import type { PlanType } from "@/types/subscription";

type ViewState = "success" | "loading" | "error";
type Duration = 1 | 3;

const CONTROL_BTN_BASE =
  "text-sm px-3 py-1.5 rounded-full font-noto-sans-jp border transition-colors";

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs font-bold text-text-primary/50 font-noto-sans-jp w-20 flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`${CONTROL_BTN_BASE} ${
                active
                  ? "bg-text-primary text-white border-text-primary"
                  : "bg-surface text-text-primary/70 border-gray-300 hover:border-gray-400"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SuccessPreview() {
  const [state, setState] = useState<ViewState>("success");
  const [type, setType] = useState<SuccessType>("new");
  const [planType, setPlanType] = useState<PlanType>("standard");
  const [duration, setDuration] = useState<Duration>(1);

  const isLoading = state === "loading";
  const error =
    state === "error"
      ? "決済情報の確認中にエラーが発生しました。時間をおいて再度お試しください。"
      : null;

  return (
    <div>
      {/* コントロールパネル */}
      <div className="bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-5 mb-6 space-y-4 sticky top-4 z-10">
        <Segmented<ViewState>
          label="状態"
          value={state}
          onChange={setState}
          options={[
            { value: "success", label: "成功" },
            { value: "loading", label: "ローディング" },
            { value: "error", label: "エラー" },
          ]}
        />
        <Segmented<SuccessType>
          label="タイプ"
          value={type}
          onChange={setType}
          options={[
            { value: "new", label: "新規登録" },
            { value: "updated", label: "プラン変更" },
          ]}
        />
        <Segmented<PlanType>
          label="プラン"
          value={planType}
          onChange={setPlanType}
          options={[
            { value: "standard", label: "スタンダード" },
            { value: "feedback", label: "フィードバック" },
          ]}
        />
        <Segmented<Duration>
          label="期間"
          value={duration}
          onChange={setDuration}
          options={[
            { value: 1, label: "1ヶ月" },
            { value: 3, label: "3ヶ月" },
          ]}
        />
      </div>

      {/* 実プレビュー */}
      <div className="bg-base rounded-[20px] border border-dashed border-gray-300 overflow-hidden">
        <SubscriptionSuccessContent
          type={type}
          planType={planType}
          duration={duration}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}
