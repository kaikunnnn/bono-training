"use client";

import { Slider as RangeSlider } from "@/components/ui/slider";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-2">
      {children}
    </div>
  );
}

export function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <label className="flex-none w-[84px] text-xs text-text-primary/70 font-noto-sans-jp">
        {label}
      </label>
      <RangeSlider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <span className="w-10 text-right text-xs tabular-nums text-text-primary/50 font-noto-sans-jp">
        {value}
      </span>
    </div>
  );
}

export function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[64px] py-2 px-2 rounded-[10px] text-xs font-noto-sans-jp cursor-pointer border transition-colors ${
        active
          ? "bg-cta-primary-bg text-white border-cta-primary-bg font-semibold"
          : "bg-base text-text-primary/60 border-border-default hover:bg-hover"
      }`}
    >
      {children}
    </button>
  );
}
