"use client";

import {
  FRAME_OPTIONS,
  PLANS_OPTIONS,
  PERIOD_OPTIONS,
  CTA_STATES,
  OPTION_LABELS,
  type FrameOption,
  type PlansOption,
  type PeriodOption,
  type CtaState,
} from "../data";

/**
 * 3軸(A/B/C) + CTA状態の4グループのボタン切替UI。
 * 選択中は "▶" テキスト印で示す（装飾禁止のため色は使わない）。
 */
export function ControlBar({
  frame,
  plans,
  period,
  cta,
  onFrame,
  onPlans,
  onPeriod,
  onCta,
}: {
  frame: FrameOption;
  plans: PlansOption;
  period: PeriodOption;
  cta: CtaState;
  onFrame: (v: FrameOption) => void;
  onPlans: (v: PlansOption) => void;
  onPeriod: (v: PeriodOption) => void;
  onCta: (v: CtaState) => void;
}) {
  return (
    <div className="border p-4 text-sm">
      <Group label="軸A ページの枠">
        {FRAME_OPTIONS.map((v) => (
          <OptBtn
            key={v}
            active={frame === v}
            label={OPTION_LABELS.frame[v]}
            onClick={() => onFrame(v)}
          />
        ))}
      </Group>

      <Group label="軸B プランの見せ方">
        {PLANS_OPTIONS.map((v) => (
          <OptBtn
            key={v}
            active={plans === v}
            label={OPTION_LABELS.plans[v]}
            onClick={() => onPlans(v)}
          />
        ))}
      </Group>

      <Group label="軸C 期間の切替">
        {PERIOD_OPTIONS.map((v) => (
          <OptBtn
            key={v}
            active={period === v}
            label={OPTION_LABELS.period[v]}
            onClick={() => onPeriod(v)}
          />
        ))}
      </Group>

      <Group label="CTA状態（擬似）">
        {CTA_STATES.map((v) => (
          <OptBtn
            key={v}
            active={cta === v}
            label={OPTION_LABELS.cta[v]}
            onClick={() => onCta(v)}
          />
        ))}
      </Group>
    </div>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 border-t pt-2 first:border-t-0 first:pt-0">
      <p className="text-sm">{label}</p>
      <div className="mt-1 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function OptBtn({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="border px-3 py-1 text-sm"
    >
      {active ? `▶ ${label}` : label}
    </button>
  );
}
