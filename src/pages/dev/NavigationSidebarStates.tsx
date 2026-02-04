import React from "react";
import { MenuIcons } from "@/components/layout/Sidebar/icons";
import { cn } from "@/lib/utils";

type NavItemState = "default" | "hover" | "pressed" | "focus" | "active" | "disabled";
type Variant = "figma" | "a11y" | "hybrid";

const PREVIEW_ICON_SIZE = 20;

const NAV_ITEM_BASE =
  "w-full rounded-[20px] px-[14px] py-[9px] flex items-center gap-[10px] text-[13px] font-medium leading-none";

const NAV_ITEM_TEXT = "text-[#2F3037]";
const NAV_ITEM_TEXT_DISABLED = "text-[#9AA0AE]";

const FIGMA_STATE_CLASSES: Record<NavItemState, string> = {
  default: "bg-transparent",
  hover: "bg-[rgba(47,48,55,0.04)]",
  pressed: "bg-[rgba(47,48,55,0.08)]",
  focus: "ring-1 ring-[rgba(47,48,55,0.35)] ring-offset-2 ring-offset-white",
  active:
    "border border-[rgba(47,48,55,0.08)] bg-[linear-gradient(109.265deg,rgba(47,48,55,0.08)_9.1965%,rgba(47,48,55,0.03)_79.127%)]",
  disabled: "bg-transparent",
};

const A11Y_STATE_CLASSES: Record<NavItemState, string> = {
  default: "bg-transparent",
  hover: "bg-[rgba(47,48,55,0.08)]",
  pressed: "bg-[rgba(47,48,55,0.12)]",
  focus: "ring-2 ring-blue-500 ring-offset-2 ring-offset-white",
  active:
    "border border-[rgba(47,48,55,0.16)] bg-[linear-gradient(109.265deg,rgba(47,48,55,0.12)_9.1965%,rgba(47,48,55,0.06)_79.127%)]",
  disabled: "bg-transparent",
};

const STATE_LABELS: { state: NavItemState; label: string }[] = [
  { state: "default", label: "Default" },
  { state: "hover", label: "Hover" },
  { state: "pressed", label: "Pressed" },
  { state: "focus", label: "Focus" },
  { state: "active", label: "Active (Current URL)" },
  { state: "disabled", label: "Disabled" },
];

const CURRENT_IA_SECTIONS = [
  {
    title: "探す",
    items: [
      { label: "ロードマップ", icon: MenuIcons.roadmap },
      { label: "レッスン", icon: MenuIcons.lesson },
      { label: "ガイド", icon: MenuIcons.guide },
      { label: "トレーニング", icon: MenuIcons.training },
    ],
  },
  {
    title: "アカウント",
    items: [
      { label: "ログイン", icon: MenuIcons.login },
      { label: "設定", icon: MenuIcons.settings },
      { label: "ログアウト", icon: MenuIcons.logout },
    ],
  },
];

const getStateClasses = (variant: Variant, state: NavItemState) => {
  if (variant === "a11y") return A11Y_STATE_CLASSES[state];
  if (variant === "hybrid") return state === "focus" ? A11Y_STATE_CLASSES[state] : FIGMA_STATE_CLASSES[state];
  return FIGMA_STATE_CLASSES[state];
};

const NavItemPreview = ({
  label,
  Icon,
  variant,
  state,
}: {
  label: string;
  Icon: React.ElementType;
  variant: Variant;
  state: NavItemState;
}) => {
  const isDisabled = state === "disabled";
  const textClass = isDisabled ? NAV_ITEM_TEXT_DISABLED : NAV_ITEM_TEXT;
  const baseClasses = cn(
    NAV_ITEM_BASE,
    getStateClasses(variant, state),
    textClass,
    isDisabled && "cursor-not-allowed opacity-70"
  );

  return (
    <div className={baseClasses} aria-disabled={isDisabled}>
      <span className={cn("inline-flex items-center justify-center w-5 h-5", textClass)}>
        <Icon size={PREVIEW_ICON_SIZE} variant="Outline" />
      </span>
      <span className={cn("pb-[2px] whitespace-nowrap", textClass)}>{label}</span>
    </div>
  );
};

const StateColumn = ({ title, variant }: { title: string; variant: Variant }) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="flex flex-col gap-3">
        {STATE_LABELS.map(({ state, label }) => (
          <div key={state} className="flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400">
              {label}
            </div>
            <div className="w-[200px]">
              <NavItemPreview
                label="マイページ"
                Icon={MenuIcons.mypage}
                variant={variant}
                state={state}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const IAPreview = ({
  title,
  sections,
}: {
  title: string;
  sections: { title: string; items: { label: string; icon: React.ElementType }[] }[];
}) => {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div className="flex flex-col gap-6 w-[240px]">
        {sections.map((section, sectionIndex) => (
          <div key={`${section.title}-${sectionIndex}`} className="flex flex-col gap-3">
            <div className="text-[16px] font-semibold text-gray-500">
              {section.title}
            </div>
            <div className="flex flex-col gap-2">
              {section.items.map((item, index) => (
                <NavItemPreview
                  key={`${section.title}-${item.label}-${index}`}
                  label={item.label}
                  Icon={item.icon}
                  variant="figma"
                  state={sectionIndex === 0 && index === 1 ? "active" : "default"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NavigationSidebarStates = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-gray-900">
            Desktop Navigation – State Ideas
          </h1>
          <p className="text-sm text-gray-600">
            Figma準拠のベース案に、フォーカス状態だけアクセシビリティ重視の表現を採用しています。
            状態は固定表示です（実際のホバー/フォーカス動作ではありません）。
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2">
          <StateColumn title="Figma Baseline + A11y Focus (Draft)" variant="hybrid" />
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <IAPreview title="現行IA（案）" sections={CURRENT_IA_SECTIONS} />
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Typography 13px</h3>
            <div className={cn(NAV_ITEM_BASE, NAV_ITEM_TEXT, "w-[200px]")}>
              <span className="inline-flex items-center justify-center w-5 h-5">
                <MenuIcons.lesson size={PREVIEW_ICON_SIZE} variant="Outline" />
              </span>
              <span className="pb-[2px] whitespace-nowrap">発見 / Discover</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-700">Typography 14px (tracking -0.35)</h3>
            <div
              className={cn(
                NAV_ITEM_BASE,
                NAV_ITEM_TEXT,
                "w-[200px] text-[14px] tracking-[-0.35px]"
              )}
            >
              <span className="inline-flex items-center justify-center w-5 h-5">
                <MenuIcons.lesson size={PREVIEW_ICON_SIZE} variant="Outline" />
              </span>
              <span className="pb-[2px] whitespace-nowrap">発見 / Discover</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NavigationSidebarStates;
