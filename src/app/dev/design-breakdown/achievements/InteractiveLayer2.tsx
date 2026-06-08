"use client";

/**
 * InteractiveLayer2 — LAYER 2 構造解剖セクション（Client Component）
 *
 * 6つの変数（フォントファミリー / フォントサイズ / 色濃度 / 余白 / 角丸 / 背景色）を
 * 独立トグルで動かせる「実演台」。プレビューは /achievements 全体をミニ再現。
 *
 * - 個別トグル = どの変数がどこを決めているかを切り分けて学ぶ
 * - プリセット = BONO / Business の両極端を1秒で見比べる
 * - 輪郭表示 = どのコンポーネントが画面のどこを担っているかを可視化
 *
 * 注: プレビューは本物の StoryCardItem / OutputBannerCardItem / SectionHeading / DottedDivider を
 * トグルに連動できる形に書き直したミニ版。本物のクラスをほぼ忠実に再現しつつ、6変数で書き換え可能に。
 */

import { useState } from "react";

type Mode = "bono" | "business";

interface StyleState {
  fontFamily: Mode;
  fontSize: Mode;
  colorIntensity: Mode;
  spacing: Mode;
  radius: Mode;
  background: Mode;
}

const ALL_BONO: StyleState = {
  fontFamily: "bono",
  fontSize: "bono",
  colorIntensity: "bono",
  spacing: "bono",
  radius: "bono",
  background: "bono",
};

const ALL_BUSINESS: StyleState = {
  fontFamily: "business",
  fontSize: "business",
  colorIntensity: "business",
  spacing: "business",
  radius: "business",
  background: "business",
};

/* ============ Utility components ============ */

type RoleTone = "primary" | "secondary" | "support" | "decoration" | "anchor";

function RoleBadge({ tone, children }: { tone: RoleTone; children: React.ReactNode }) {
  const styles: Record<RoleTone, string> = {
    primary: "bg-text-primary text-white",
    secondary: "bg-blue-100 text-blue-800",
    support: "bg-gray-200 text-gray-700",
    decoration: "bg-purple-100 text-purple-800",
    anchor: "bg-orange-100 text-orange-800",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-noto-sans-jp whitespace-nowrap ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-text-primary text-white text-[11px] font-bold flex-shrink-0">
      {n}
    </span>
  );
}

/* ============ Toggle controls ============ */

interface ToggleProps {
  label: string;
  bonoText: string;
  businessText: string;
  value: Mode;
  onChange: (v: Mode) => void;
}

function Toggle({ label, bonoText, businessText, value, onChange }: ToggleProps) {
  return (
    <div className="bg-base rounded-[12px] p-3 border border-gray-200/60">
      <p className="text-xs font-bold text-text-primary mb-2 font-noto-sans-jp">{label}</p>
      <div className="flex gap-1 rounded-[8px] bg-surface p-1 mb-2">
        <button
          onClick={() => onChange("bono")}
          className={`flex-1 text-[11px] font-bold py-1.5 rounded-[6px] transition-colors font-noto-sans-jp ${
            value === "bono"
              ? "bg-text-primary text-white"
              : "text-text-primary/60 hover:bg-base"
          }`}
        >
          BONO
        </button>
        <button
          onClick={() => onChange("business")}
          className={`flex-1 text-[11px] font-bold py-1.5 rounded-[6px] transition-colors font-noto-sans-jp ${
            value === "business"
              ? "bg-text-primary text-white"
              : "text-text-primary/60 hover:bg-base"
          }`}
        >
          Business
        </button>
      </div>
      <p className="text-[10px] font-mono text-text-primary/60 leading-snug">
        {value === "bono" ? bonoText : businessText}
      </p>
    </div>
  );
}

function PresetButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-bold py-2 px-3 rounded-[10px] bg-base hover:opacity-80 text-text-primary font-noto-sans-jp border border-gray-200/60 transition-opacity"
    >
      {children}
    </button>
  );
}

function OutlineSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`text-xs font-bold py-2 px-3 rounded-[10px] font-noto-sans-jp border transition-colors ${
        enabled
          ? "bg-blue-500 text-white border-blue-500"
          : "bg-base text-text-primary border-gray-200/60 hover:opacity-80"
      }`}
    >
      🔲 コンポーネント輪郭 {enabled ? "ON" : "OFF"}
    </button>
  );
}

/* ============ ComponentLabel — for outline mode ============ */

function ComponentLabel({
  name,
  outline,
  children,
  block = false,
}: {
  name: string;
  outline: boolean;
  children: React.ReactNode;
  block?: boolean;
}) {
  if (!outline) {
    return <>{children}</>;
  }
  return (
    <div
      className={`relative ${block ? "" : "inline-block"} w-full`}
      style={{ outline: "1.5px dashed rgba(59,130,246,0.7)", outlineOffset: "3px" }}
    >
      <span className="absolute -top-2.5 left-1 text-[9px] font-mono font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-sm leading-tight z-10 whitespace-nowrap">
        {name}
      </span>
      {children}
    </div>
  );
}

/* ============ Class derivation from style state ============ */

function deriveClasses(s: StyleState) {
  return {
    // Page outer
    pageBg: s.background === "bono" ? "bg-base" : "bg-gray-50",

    // Card / surface
    cardBg: s.background === "bono" ? "bg-surface" : "bg-white",
    thumbBg: s.background === "bono" ? "bg-muted-custom" : "bg-gray-100",
    tagBg: s.background === "bono" ? "bg-muted-custom" : "bg-gray-100",
    cardBorderStory: s.background === "bono" ? "border-4 border-white" : "border border-gray-200",
    cardBorderOutput: s.background === "bono" ? "border border-gray-200/60" : "border border-gray-200",

    // Radii
    storyOuterRadius: s.radius === "bono" ? "rounded-[20px] sm:rounded-[24px]" : "rounded-[6px]",
    storyInnerRadius: s.radius === "bono" ? "rounded-[16px] sm:rounded-[20px]" : "rounded-[4px]",
    outputRadius: s.radius === "bono" ? "rounded-[16px]" : "rounded-[6px]",
    avatarRadius: s.radius === "bono" ? "rounded-full" : "rounded-[4px]",
    pillRadius: s.radius === "bono" ? "rounded-full" : "rounded-[4px]",

    // Fonts
    headingFont: s.fontFamily === "bono" ? "font-rounded-mplus" : "font-noto-sans-jp",
    bodyFont: "font-noto-sans-jp",

    // Font sizes
    heroTitleSize: s.fontSize === "bono" ? "text-xl sm:text-2xl" : "text-lg sm:text-xl",
    sectionTitleSize: s.fontSize === "bono" ? "text-base sm:text-lg" : "text-sm sm:text-base",
    sectionLabelSize: s.fontSize === "bono" ? "text-[10px]" : "text-[11px]",
    storyTitleSize: s.fontSize === "bono" ? "text-sm sm:text-base" : "text-[13px] sm:text-sm",
    outputTitleSize: s.fontSize === "bono" ? "text-xs sm:text-sm" : "text-[12px] sm:text-[13px]",
    bodySize: s.fontSize === "bono" ? "text-xs" : "text-[13px]",
    microSize: s.fontSize === "bono" ? "text-[10px]" : "text-[11px]",
    nanoSize: "text-[10px]",

    // Colors
    mainColor: "text-text-primary",
    supportColor: s.colorIntensity === "bono" ? "text-text-primary/60" : "text-text-primary/50",
    halfColor: s.colorIntensity === "bono" ? "text-text-primary/70" : "text-text-primary",
    descColor: s.colorIntensity === "bono" ? "text-text-primary/70" : "text-text-primary/50",

    // Spacing
    heroPadding: s.spacing === "bono" ? "py-4 px-1" : "py-6 px-1",
    sectionGap: s.spacing === "bono" ? "space-y-2" : "space-y-3",
    sectionBlockGap: s.spacing === "bono" ? "mt-6 mb-6" : "mt-8 mb-8",
    cardPadding: s.spacing === "bono" ? "p-3 sm:p-4" : "p-4 sm:p-5",
    cardTitleMt: s.spacing === "bono" ? "mt-1" : "mt-2",
    cardProfileMt: s.spacing === "bono" ? "mt-2.5" : "mt-4",
    cardNameRoleMt: s.spacing === "bono" ? "mt-0.5" : "mt-1",
    cardTagsMt: s.spacing === "bono" ? "mt-2.5" : "mt-4",
    tagsGap: s.spacing === "bono" ? "gap-1.5" : "gap-2",
    gridGap: s.spacing === "bono" ? "gap-3" : "gap-4",
  };
}

/* ============ Mini components — /achievements の構成要素 ============ */

function MiniHero({ s }: { s: StyleState }) {
  const c = deriveClasses(s);
  return (
    <div className={c.heroPadding}>
      <h1 className={`${c.heroTitleSize} font-bold ${c.headingFont} ${c.mainColor}`}>
        みんなの成果
      </h1>
      <p className={`${c.bodySize} ${c.supportColor} ${c.bodyFont} ${c.cardTitleMt}`}>
        BONOで動き出した人たち
      </p>
    </div>
  );
}

function MiniSectionHeading({
  s,
  label,
  title,
  description,
}: {
  s: StyleState;
  label: string;
  title: string;
  description: string;
}) {
  const c = deriveClasses(s);
  return (
    <div className={c.sectionGap}>
      <p className={`${c.sectionLabelSize} font-bold ${c.supportColor} ${c.bodyFont} tracking-wider`}>
        {label}
      </p>
      <h2 className={`${c.sectionTitleSize} font-extrabold ${c.headingFont} ${c.mainColor}`}>
        {title}
      </h2>
      <p className={`${c.microSize} ${c.descColor} ${c.bodyFont}`}>{description}</p>
    </div>
  );
}

function MiniStoryCard({
  s,
  title,
  category,
  personName,
  personRole,
  tag,
}: {
  s: StyleState;
  title: string;
  category: string;
  personName: string;
  personRole: string;
  tag: string;
}) {
  const c = deriveClasses(s);
  return (
    <article
      className={`${c.cardBg} ${c.storyOuterRadius} overflow-hidden ${c.cardBorderStory} shadow-sm transition-all duration-200`}
    >
      <div
        className={`${c.thumbBg} ${c.storyInnerRadius} overflow-hidden w-full aspect-[16/9] relative transition-all duration-200`}
      >
        <div className={`absolute inset-0 flex items-center justify-center text-text-primary/30 ${c.nanoSize} ${c.bodyFont}`}>
          アイキャッチ
        </div>
      </div>
      <div className={`${c.cardPadding} transition-all duration-200`}>
        <span className={`inline-block ${c.microSize} font-bold ${c.supportColor} ${c.bodyFont}`}>
          {category}
        </span>
        <h3
          className={`${c.storyTitleSize} font-bold ${c.mainColor} ${c.headingFont} leading-snug ${c.cardTitleMt} line-clamp-2`}
        >
          {title}
        </h3>
        <div className={`flex items-center gap-2 ${c.cardProfileMt}`}>
          <div className={`relative w-7 h-7 ${c.avatarRadius} overflow-hidden flex-shrink-0 ${c.thumbBg}`} />
          <div className="min-w-0">
            <p className={`${c.bodySize} font-bold ${c.mainColor} leading-tight ${c.bodyFont}`}>
              {personName}
            </p>
            <p className={`${c.microSize} ${c.supportColor} truncate ${c.bodyFont} ${c.cardNameRoleMt}`}>
              {personRole}
            </p>
          </div>
        </div>
        <div className={`flex flex-wrap ${c.tagsGap} ${c.cardTagsMt}`}>
          <span
            className={`${c.microSize} px-2 py-0.5 ${c.pillRadius} ${c.tagBg} ${c.halfColor} ${c.bodyFont}`}
          >
            #{tag}
          </span>
        </div>
      </div>
    </article>
  );
}

function MiniOutputCard({
  s,
  title,
  authorName,
  usedLabel,
  date,
}: {
  s: StyleState;
  title: string;
  authorName: string;
  usedLabel: string;
  date: string;
}) {
  const c = deriveClasses(s);
  return (
    <article
      className={`${c.cardBg} ${c.outputRadius} ${c.cardBorderOutput} overflow-hidden shadow-sm transition-all duration-200`}
    >
      <div className={`${c.thumbBg} w-full aspect-[2/1] relative transition-all duration-200`}>
        <div className={`absolute inset-0 flex items-center justify-center text-text-primary/30 ${c.nanoSize} ${c.bodyFont}`}>
          サムネ
        </div>
      </div>
      <div className={`${c.cardPadding} transition-all duration-200`}>
        <h3
          className={`${c.outputTitleSize} font-bold ${c.mainColor} ${c.headingFont} leading-snug line-clamp-2`}
        >
          {title}
        </h3>
        <div className={`flex items-center gap-1.5 ${c.cardNameRoleMt} ${c.microSize} ${c.supportColor} ${c.bodyFont}`}>
          <span className={`inline-flex items-center justify-center w-4 h-4 ${c.avatarRadius} ${c.thumbBg} ${c.nanoSize} font-bold flex-shrink-0`} />
          <span className="truncate">{authorName}</span>
          <span>•</span>
          <span className="flex-shrink-0">{date}</span>
        </div>
        <div className={c.cardNameRoleMt}>
          <span
            className={`inline-block ${c.microSize} px-2 py-0.5 ${c.pillRadius} ${c.tagBg} ${c.halfColor} ${c.bodyFont}`}
          >
            📚 {usedLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

function MiniDottedDivider({ s }: { s: StyleState }) {
  const color = s.colorIntensity === "bono" ? "rgba(115,120,107,0.55)" : "rgba(50,50,50,0.6)";
  return (
    <div
      role="separator"
      aria-hidden="true"
      style={{
        height: 2,
        backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`,
        backgroundSize: "8px 2px",
        backgroundPosition: "center",
      }}
    />
  );
}

function MiniSeeAllLink({ s, label }: { s: StyleState; label: string }) {
  const c = deriveClasses(s);
  return (
    <p className={`text-right ${c.microSize} font-bold ${c.mainColor} ${c.bodyFont}`}>
      {label} →
    </p>
  );
}

/**
 * FocusStoryCard — StoryCardItem を「本物の実サイズ」で1枚だけ拡大表示するコンポーネント。
 *
 * MiniStoryCard は /achievements 3列グリッド内で並べるためのミニ版（小さめサイズ）。
 * FocusStoryCard は単体で見せる用で、本物の StoryCardItem.tsx と同じサイズトークンを使う
 * （text-base sm:text-lg / p-5 sm:p-6 / rounded-[24px] sm:rounded-[32px] 等）。
 * 「部位別の解説」と数値が一致するので、解剖図として使える。
 */
function FocusStoryCard({ s }: { s: StyleState }) {
  // background
  const outerBg = s.background === "bono" ? "bg-surface" : "bg-white";
  const innerBg = s.background === "bono" ? "bg-muted-custom" : "bg-gray-100";
  const tagBg = s.background === "bono" ? "bg-muted-custom" : "bg-gray-100";
  const outerBorder =
    s.background === "bono" ? "border-4 border-white" : "border border-gray-200";

  // radius (本物のサイズ)
  const outerRadius =
    s.radius === "bono" ? "rounded-[24px] sm:rounded-[32px]" : "rounded-[6px]";
  const innerRadius =
    s.radius === "bono" ? "rounded-[20px] sm:rounded-[28px]" : "rounded-[4px]";
  const avatarRadius = s.radius === "bono" ? "rounded-full" : "rounded-[4px]";
  const tagRadius = s.radius === "bono" ? "rounded-full" : "rounded-[4px]";

  // spacing (本物のサイズ)
  const padding = s.spacing === "bono" ? "p-5 sm:p-6" : "p-4 sm:p-6";
  const titleMargin = s.spacing === "bono" ? "mt-1" : "mt-2";
  const profileMargin = s.spacing === "bono" ? "mt-4" : "mt-6";
  const nameRoleMargin = s.spacing === "bono" ? "mt-0.5" : "mt-1";
  const tagsMargin = "mt-4";
  const tagsGap = s.spacing === "bono" ? "gap-1.5" : "gap-2";

  // fonts
  const titleFont =
    s.fontFamily === "bono" ? "font-rounded-mplus" : "font-noto-sans-jp";
  const bodyFont = "font-noto-sans-jp";

  // sizes (本物のサイズ)
  const titleSize = s.fontSize === "bono" ? "text-base sm:text-lg" : "text-base";
  const nameSize = "text-sm";
  const supportSize = s.fontSize === "bono" ? "text-xs" : "text-[13px]";
  const microSize = s.fontSize === "bono" ? "text-[10px] sm:text-xs" : "text-xs";

  // colors
  const mainColor = "text-text-primary";
  const supportColor =
    s.colorIntensity === "bono" ? "text-text-primary/60" : "text-text-primary/50";
  const tagColor =
    s.colorIntensity === "bono" ? "text-text-primary/70" : "text-text-primary";

  return (
    <article
      className={`${outerBg} ${outerRadius} overflow-hidden ${outerBorder} shadow-sm transition-all duration-200`}
    >
      <div
        className={`${innerBg} ${innerRadius} overflow-hidden w-full aspect-[16/9] relative transition-all duration-200`}
      >
        <div className="absolute inset-0 flex items-center justify-center text-text-primary/30 text-xs font-noto-sans-jp">
          アイキャッチ画像
        </div>
      </div>
      <div className={`${padding} transition-all duration-200`}>
        <span
          className={`inline-block ${microSize} font-bold ${supportColor} ${bodyFont}`}
        >
          UIUX転職
        </span>
        <h3
          className={`${titleSize} font-bold ${mainColor} ${titleFont} leading-[1.6] ${titleMargin} line-clamp-2`}
        >
          未経験から3ヶ月でUIデザイナーへ — 田中悠介さんの転職ストーリー
        </h3>
        <div className={`flex items-center gap-3 ${profileMargin}`}>
          <div
            className={`relative w-9 h-9 ${avatarRadius} overflow-hidden flex-shrink-0 ${innerBg} transition-all duration-200`}
          />
          <div className="min-w-0">
            <p
              className={`${nameSize} font-bold ${mainColor} leading-tight ${bodyFont}`}
            >
              田中 悠介
            </p>
            <p
              className={`${supportSize} ${supportColor} truncate ${bodyFont} ${nameRoleMargin}`}
            >
              UIデザイナー @ 株式会社サンプル
            </p>
          </div>
        </div>
        <div className={`flex flex-wrap ${tagsGap} ${tagsMargin}`}>
          <span
            className={`${supportSize} px-2.5 py-1 ${tagRadius} ${tagBg} ${tagColor} ${bodyFont} transition-all duration-200`}
          >
            #未経験
          </span>
        </div>
      </div>
    </article>
  );
}

function MiniAchievementsPreview({ s, outline }: { s: StyleState; outline: boolean }) {
  const c = deriveClasses(s);

  const STORIES = [
    { title: "未経験から3ヶ月でUIデザイナーへ — 田中悠介さんの転職ストーリー", category: "UIUX転職", personName: "田中 悠介", personRole: "UIデザイナー", tag: "未経験" },
    { title: "エンジニアからUIUXへ — 佐藤美咲さんのキャリアチェンジ", category: "UIUX転職", personName: "佐藤 美咲", personRole: "プロダクトデザイナー", tag: "業界経験あり" },
    { title: "デザイン未経験のママが、子育てしながら6ヶ月で転職", category: "UIUX転職", personName: "山本 綾乃", personRole: "UIデザイナー", tag: "未経験" },
  ];

  const OUTPUTS = [
    { title: "BONOのUIスタイリング課題でTwitterのプロフィール画面を作ってみた", authorName: "中村 大輔", usedLabel: "UIUX転職ロードマップ", date: "2026.05.20" },
    { title: "リサーチ課題：銀行アプリを30人にインタビューして気付いたこと", authorName: "鈴木 健太", usedLabel: "UIUX転職ロードマップ", date: "2026.05.18" },
    { title: "Figma で再現！スマホECサイトのカートUI設計プロセス", authorName: "高橋 舞", usedLabel: "Figma基礎レッスン", date: "2026.05.15" },
  ];

  return (
    <div className={`${c.pageBg} rounded-[8px] p-4 sm:p-5 transition-colors duration-200`}>
      {/* Hero */}
      <ComponentLabel name="<Hero />" outline={outline} block>
        <MiniHero s={s} />
      </ComponentLabel>

      {/* Stories Section */}
      <div className={c.sectionBlockGap}>
        <ComponentLabel name="<StoriesSection />" outline={outline} block>
          <div>
            <ComponentLabel name="<SectionHeading />" outline={outline} block>
              <MiniSectionHeading
                s={s}
                label="STORIES"
                title="ストーリー"
                description="受講者が人生を動かした転職ストーリー"
              />
            </ComponentLabel>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${c.gridGap} mt-4`}>
              {STORIES.map((story, i) => (
                <ComponentLabel
                  key={i}
                  name={i === 0 ? "<StoryCardItem />" : "（同上）"}
                  outline={outline}
                  block
                >
                  <MiniStoryCard s={s} {...story} />
                </ComponentLabel>
              ))}
            </div>
            <div className="mt-3">
              <MiniSeeAllLink s={s} label="ストーリーをすべて見る" />
            </div>
          </div>
        </ComponentLabel>
      </div>

      {/* DottedDivider */}
      <ComponentLabel name="<DottedDivider />" outline={outline} block>
        <MiniDottedDivider s={s} />
      </ComponentLabel>

      {/* Outputs Section */}
      <div className={c.sectionBlockGap}>
        <ComponentLabel name="<OutputsSection />" outline={outline} block>
          <div>
            <ComponentLabel name="<SectionHeading />" outline={outline} block>
              <MiniSectionHeading
                s={s}
                label="OUTPUTS"
                title="アウトプット"
                description="BONOのコンテンツを使って生まれた作品・記事たち"
              />
            </ComponentLabel>
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${c.gridGap} mt-4`}>
              {OUTPUTS.map((output, i) => (
                <ComponentLabel
                  key={i}
                  name={i === 0 ? "<OutputBannerCardItem />" : "（同上）"}
                  outline={outline}
                  block
                >
                  <MiniOutputCard s={s} {...output} />
                </ComponentLabel>
              ))}
            </div>
            <div className="mt-3">
              <MiniSeeAllLink s={s} label="アウトプットをすべて見る" />
            </div>
          </div>
        </ComponentLabel>
      </div>
    </div>
  );
}

/* ============ Data: 解剖の参考表 ============ */

interface PartInfo {
  n: number;
  name: string;
  role: string;
  roleTone: RoleTone;
  font: string;
  color: string;
  spacing: string;
  why: string;
}

const PARTS: PartInfo[] = [
  {
    n: 1,
    name: "アイキャッチ画像",
    role: "視覚フック",
    roleTone: "anchor",
    font: "—",
    color: "bg-muted-custom（地）",
    spacing: "aspect-[16/9]（横長）",
    why: "16:9 の横長で「物語のサムネ感」を演出。空でもカード全体の形が安定する。",
  },
  {
    n: 2,
    name: "カテゴリラベル",
    role: "補助",
    roleTone: "support",
    font: "text-[10px] sm:text-xs（10–12px）/ bold",
    color: "text-text-primary/60（60%）",
    spacing: "—（内枠の最上段）",
    why: "「これは何の話か」のメタ情報。主役より弱く・小さく・薄くして読み飛ばしを許容する。",
  },
  {
    n: 3,
    name: "タイトル",
    role: "主役",
    roleTone: "primary",
    font: "text-base sm:text-lg（16–18px）/ bold / font-rounded-mplus",
    color: "text-text-primary（100%）",
    spacing: "mt-1（カテゴリと密接 = 4px）",
    why: "丸ゴシック × 大 × 濃 = 感情的に主役を立てる三点セット。line-clamp-2 で長さを揃えてカードの高さを安定。",
  },
  {
    n: 4,
    name: "アバター",
    role: "信頼性の顔",
    roleTone: "anchor",
    font: "—",
    color: "rounded-full + bg-muted-custom（地）",
    spacing: "mt-4（タイトルと切れ目 = 16px）",
    why: "丸 = 人格の象徴。中身が写真でなくても「誰の話か」を瞬時に立てる。",
  },
  {
    n: 5,
    name: "人物名",
    role: "副情報",
    roleTone: "secondary",
    font: "text-sm（14px）/ bold / font-noto-sans-jp",
    color: "text-text-primary（100%）",
    spacing: "gap-3（アバターから = 12px）",
    why: "タイトル次の存在感。濃度はキープしつつ、丸ゴ→角ゴで性格を変えて主役と差別化。",
  },
  {
    n: 6,
    name: "職種",
    role: "補助（名前の続き）",
    roleTone: "support",
    font: "text-xs（12px）/ font-noto-sans-jp",
    color: "text-text-primary/60（60%）",
    spacing: "mt-0.5（名前と続き = 2px）",
    why: "ほぼゼロ余白で「名前の続き」と読ませる。サイズも濃度も一段落として階層化。",
  },
  {
    n: 7,
    name: "タグ",
    role: "装飾",
    roleTone: "decoration",
    font: "text-xs（12px）/ font-noto-sans-jp",
    color: "text-text-primary/70 + bg-muted-custom",
    spacing: "mt-4 + gap-1.5（タグ間 = 6px）",
    why: "rounded-full + 地色つき = 装飾要素の処理。読み飛ばしても OK な弱さに揃える。",
  },
];

const FONT_HIERARCHY = [
  { size: "18px", token: "text-lg", use: "主役", example: "タイトル（PC）" },
  { size: "16px", token: "text-base", use: "主役", example: "タイトル（モバイル）" },
  { size: "14px", token: "text-sm", use: "副情報", example: "人物名" },
  { size: "12px", token: "text-xs", use: "補助", example: "職種・タグ・カテゴリ(PC)" },
  { size: "10px", token: "text-[10px]", use: "ラベル", example: "カテゴリ（モバイル）" },
];

const COLOR_HIERARCHY = [
  { value: "100%", token: "text-text-primary", use: "主役 / 副情報", example: "タイトル・人物名" },
  { value: "70%", token: "text-text-primary/70", use: "半装飾", example: "タグ文字" },
  { value: "60%", token: "text-text-primary/60", use: "補助", example: "カテゴリ・職種" },
  { value: "30%", token: "text-text-primary/30", use: "極端な脇役", example: "プレースホルダ文字" },
];

const SPACING_HIERARCHY = [
  { value: "2px", token: "mt-0.5", relation: "同じ情報の続き", example: "人物名 → 職種" },
  { value: "4px", token: "mt-1", relation: "密接", example: "カテゴリ → タイトル" },
  { value: "6px", token: "gap-1.5", relation: "並列アイテム間", example: "タグ間" },
  { value: "12px", token: "gap-3", relation: "関連要素", example: "アバター ↔ テキスト" },
  { value: "16px", token: "mt-4", relation: "セクションの切れ目", example: "タイトル → 人物 / 人物 → タグ" },
  { value: "20–24px", token: "p-5 sm:p-6", relation: "内枠全体の呼吸", example: "カード内側の余白" },
];

const FONT_FAMILY_INFO = [
  { family: "font-rounded-mplus", source: "M PLUS Rounded 1c", use: "主役テキスト", character: "感情・親しみ", example: "タイトル" },
  { family: "font-noto-sans-jp", source: "Noto Sans JP", use: "本文・メタ情報", character: "端正・可読", example: "人物名・職種・カテゴリ・タグ" },
];

/* ============ Main component ============ */

export default function InteractiveLayer2() {
  const [s, setS] = useState<StyleState>(ALL_BONO);
  const [outline, setOutline] = useState(false);

  const setOne = (key: keyof StyleState, value: Mode) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const businessCount = Object.values(s).filter((v) => v === "business").length;
  const mode = businessCount === 0 ? "BONO" : businessCount === 6 ? "Business" : "Mixed";

  return (
    <section id="layer-2" className="mb-24 scroll-mt-6">
      {/* === Header === */}
      <p className="text-xs font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-2">
        LAYER 2 — COMPONENT ／ 🌟 メインパイロット
      </p>
      <h2 className="text-2xl font-bold text-text-primary font-rounded-mplus mb-3">
        Why この姿？— /achievements の構造解剖
      </h2>
      <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed max-w-[760px] mb-3">
        /achievements は <strong>Hero / SectionHeading / StoryCardItem / DottedDivider / OutputBannerCardItem</strong> の5種のコンポーネントから組み立てられている。
      </p>
      <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed max-w-[760px] mb-8">
        役割を決めると、自動的に「主役 / 副情報 / 補助」の階層が定まる。
        プロはその階層を <strong>フォントサイズ・色濃度・余白</strong> の3階層に対応させて表現する。
        <strong>下のラボで6変数を動かすと、トークンの変更がどのコンポーネントに伝播するかが一望できる。</strong>
        「コンポーネント輪郭ON」で各部品の境界も可視化できる。
      </p>

      {/* === 🎛️ Lab === */}
      <div className="bg-surface rounded-[20px] p-5 sm:p-6 border-2 border-text-primary/15 mb-12">
        {/* Top bar */}
        <div className="flex items-baseline justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-sm font-bold text-text-primary font-rounded-mplus">
              🎛️ 試せるラボ — /achievements 全体に6変数を適用
            </p>
            <p className="text-[11px] text-text-primary/60 font-noto-sans-jp mt-0.5">
              現在のモード: <strong>{mode}</strong>（Business 設定: {businessCount}/6）／
              1つの変数を動かすと、その変数を使っている <strong>全てのコンポーネント</strong> に同時に効く
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <PresetButton onClick={() => setS(ALL_BONO)}>🌸 BONO 一括</PresetButton>
            <PresetButton onClick={() => setS(ALL_BUSINESS)}>💼 Business 一括</PresetButton>
            <OutlineSwitch enabled={outline} onChange={setOutline} />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          <Toggle
            label="① フォントファミリー"
            bonoText="title=丸ゴ / 他=角ゴ（性格差あり）"
            businessText="全部 角ゴ統一（端正）"
            value={s.fontFamily}
            onChange={(v) => setOne("fontFamily", v)}
          />
          <Toggle
            label="② フォントサイズ"
            bonoText="18→14→12→10（差大・主役強い）"
            businessText="16→14→13→12（差小・整然）"
            value={s.fontSize}
            onChange={(v) => setOne("fontSize", v)}
          />
          <Toggle
            label="③ 色濃度"
            bonoText="100 / 70 / 60% 混在"
            businessText="100 / 60 / 50% 強コントラスト"
            value={s.colorIntensity}
            onChange={(v) => setOne("colorIntensity", v)}
          />
          <Toggle
            label="④ 余白"
            bonoText="2 / 4 / 6 / 12 / 16 / 24px（混在）"
            businessText="4 / 8 / 16 / 24px（4倍数のみ）"
            value={s.spacing}
            onChange={(v) => setOne("spacing", v)}
          />
          <Toggle
            label="⑤ 角丸"
            bonoText="24-32px / full（柔らかい）"
            businessText="6px / 4px（シャープ）"
            value={s.radius}
            onChange={(v) => setOne("radius", v)}
          />
          <Toggle
            label="⑥ 背景色 + 線"
            bonoText="bg-surface + 白い太枠"
            businessText="bg-white + 1px gray線"
            value={s.background}
            onChange={(v) => setOne("background", v)}
          />
        </div>

        {/* Stage with full-page preview */}
        <div
          className="rounded-[16px] p-4 sm:p-5 border border-text-primary/10"
          style={{
            backgroundColor: "#EFEAE0",
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        >
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <p className="text-[10px] font-bold text-text-primary/50 font-noto-sans-jp tracking-wider">
              PREVIEW — /achievements
            </p>
            {outline && (
              <p className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                🔲 コンポーネント輪郭表示中
              </p>
            )}
          </div>
          <MiniAchievementsPreview s={s} outline={outline} />
        </div>

        <p className="text-[11px] text-text-primary/50 font-noto-sans-jp mt-3 leading-relaxed">
          💡 1つの変数だけ動かすと、その変数が「どのコンポーネントの」「どの部位に」効いているかが分かる。
          例えば <strong>フォントファミリー</strong> をBusinessに → Hero / SectionHeading / StoryCard / OutputCard の見出しが同時に角ゴに変わる
          ＝ 4コンポーネントすべてが <code className="font-mono text-[10px] bg-base px-1 rounded">font-rounded-mplus</code> を共有していると分かる。
        </p>
      </div>

      {/* === Focus: StoryCardItem を実サイズで1枚拡大表示 === */}
      <div className="mb-12">
        <h3 className="text-sm font-bold text-text-primary/60 font-noto-sans-jp tracking-wider mb-2">
          👁️ StoryCardItem を拡大表示 — 単体での変化を確認
        </h3>
        <p className="text-xs text-text-primary/60 font-noto-sans-jp mb-4 max-w-[760px] leading-relaxed">
          ストーリーグリッドの3枚を1枚に絞って <strong>本物の実サイズ</strong>（<code className="font-mono text-[10px] bg-base px-1 rounded">text-base sm:text-lg</code> / <code className="font-mono text-[10px] bg-base px-1 rounded">p-5 sm:p-6</code> / <code className="font-mono text-[10px] bg-base px-1 rounded">rounded-[24px] sm:rounded-[32px]</code> 等）で表示。
          下の「部位別の解説」と数値が一致するので、変化を1部位ずつ突き合わせて確認できる。
          ラボのトグルがそのまま効く。
        </p>
        <div
          className="rounded-[16px] p-6 sm:p-10 border border-text-primary/10"
          style={{
            backgroundColor: "#EFEAE0",
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        >
          <div className="max-w-[420px] mx-auto">
            <FocusStoryCard s={s} />
          </div>
        </div>
      </div>

      {/* === Parts list (StoryCardItem 解剖) === */}
      <div className="mb-12">
        <h3 className="text-sm font-bold text-text-primary/60 font-noto-sans-jp tracking-wider mb-2">
          ① 部位別の解説 — StoryCardItem の7部品
        </h3>
        <p className="text-xs text-text-primary/60 font-noto-sans-jp mb-4 max-w-[760px] leading-relaxed">
          上の拡大表示カードの各部位を、本物の数値で1つずつ分解する。
          OutputBannerCardItem や SectionHeading の解剖は次のフェーズで追加予定。
        </p>
        <div className="space-y-3">
          {PARTS.map((p) => (
            <div
              key={p.n}
              className="bg-surface border border-gray-200/60 rounded-[16px] p-4 sm:p-5"
            >
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <NumberBadge n={p.n} />
                <h4 className="text-base font-bold text-text-primary font-rounded-mplus">
                  {p.name}
                </h4>
                <RoleBadge tone={p.roleTone}>{p.role}</RoleBadge>
              </div>
              <p className="text-sm text-text-primary/80 font-noto-sans-jp leading-relaxed mb-3">
                {p.why}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-noto-sans-jp pt-3 border-t border-gray-200/60">
                <div>
                  <p className="text-[10px] font-bold text-text-primary/50 tracking-wider mb-1">FONT</p>
                  <p className="text-text-primary/80 font-mono text-[11px] leading-relaxed">{p.font}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-primary/50 tracking-wider mb-1">COLOR</p>
                  <p className="text-text-primary/80 font-mono text-[11px] leading-relaxed">{p.color}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-primary/50 tracking-wider mb-1">SPACING</p>
                  <p className="text-text-primary/80 font-mono text-[11px] leading-relaxed">{p.spacing}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === Hierarchy charts === */}
      <div className="mb-12">
        <h3 className="text-sm font-bold text-text-primary/60 font-noto-sans-jp tracking-wider mb-4">
          ② 階層チート表 — 上の7部品から抽出した「使い分けの原理」
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-surface rounded-[16px] p-5 border border-gray-200/60">
            <h4 className="text-sm font-bold text-text-primary font-rounded-mplus mb-3">
              🔤 フォントサイズの階層
            </h4>
            <p className="text-xs text-text-primary/60 font-noto-sans-jp mb-3 leading-relaxed">
              「強い情報ほど大きく」のルール
            </p>
            <ul className="space-y-2 text-xs font-noto-sans-jp">
              {FONT_HIERARCHY.map((h) => (
                <li key={h.token} className="flex items-baseline gap-2 border-b border-gray-200/60 pb-1.5 last:border-b-0">
                  <span className="font-mono font-bold text-text-primary w-12 flex-shrink-0">{h.size}</span>
                  <div className="min-w-0">
                    <p className="text-text-primary font-bold">{h.use}</p>
                    <p className="text-text-primary/60 text-[11px]">{h.example}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface rounded-[16px] p-5 border border-gray-200/60">
            <h4 className="text-sm font-bold text-text-primary font-rounded-mplus mb-3">
              🎨 色濃度の階層
            </h4>
            <p className="text-xs text-text-primary/60 font-noto-sans-jp mb-3 leading-relaxed">
              「強い情報ほど濃く」のルール
            </p>
            <ul className="space-y-2 text-xs font-noto-sans-jp">
              {COLOR_HIERARCHY.map((h) => (
                <li key={h.token} className="flex items-baseline gap-2 border-b border-gray-200/60 pb-1.5 last:border-b-0">
                  <span className="font-mono font-bold text-text-primary w-10 flex-shrink-0">{h.value}</span>
                  <div className="min-w-0">
                    <p className="text-text-primary font-bold">{h.use}</p>
                    <p className="text-text-primary/60 text-[11px]">{h.example}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-surface rounded-[16px] p-5 border border-gray-200/60">
            <h4 className="text-sm font-bold text-text-primary font-rounded-mplus mb-3">
              ↔️ 余白の階層 = 情報の距離
            </h4>
            <p className="text-xs text-text-primary/60 font-noto-sans-jp mb-3 leading-relaxed">
              「関係が近いほど詰める」のルール
            </p>
            <ul className="space-y-2 text-xs font-noto-sans-jp">
              {SPACING_HIERARCHY.map((h) => (
                <li key={h.token} className="flex items-baseline gap-2 border-b border-gray-200/60 pb-1.5 last:border-b-0">
                  <span className="font-mono font-bold text-text-primary w-14 flex-shrink-0">{h.value}</span>
                  <div className="min-w-0">
                    <p className="text-text-primary font-bold">{h.relation}</p>
                    <p className="text-text-primary/60 text-[11px]">{h.example}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-surface rounded-[16px] p-5 border border-gray-200/60 mt-4">
          <h4 className="text-sm font-bold text-text-primary font-rounded-mplus mb-3">
            ✍️ フォントファミリーの使い分け = 性格の差
          </h4>
          <p className="text-xs text-text-primary/60 font-noto-sans-jp mb-3 leading-relaxed">
            「主役と副情報で性格を変える」ルール
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-noto-sans-jp">
            {FONT_FAMILY_INFO.map((f) => (
              <div key={f.family} className="bg-base rounded-[10px] p-3">
                <p className="font-mono font-bold text-text-primary mb-1">{f.family}</p>
                <p className="text-text-primary/60 text-[11px] mb-2">{f.source}</p>
                <p className="text-text-primary">
                  <strong>{f.use}</strong> — {f.character}
                </p>
                <p className="text-text-primary/60 text-[11px] mt-1">例: {f.example}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === Summary === */}
      <div className="bg-surface rounded-[20px] p-6 sm:p-8 border-2 border-text-primary/15">
        <p className="text-[11px] font-bold text-text-primary/50 font-noto-sans-jp tracking-wider mb-3">
          💡 まとめ — なぜこのバランスが取れているか
        </p>
        <ul className="text-sm text-text-primary font-noto-sans-jp leading-relaxed space-y-2.5 max-w-[860px]">
          <li>
            ・ 役割（主役 / 副情報 / 補助 / 装飾）を最初に決めると、自動的に「<strong>情報の階層</strong>」が定まる
          </li>
          <li>
            ・ その階層を <strong>フォントサイズ（18→14→12→10）</strong>・<strong>色濃度（100→70→60→30%）</strong>・<strong>余白（2→4→12→16→24px）</strong> の3つに「だいたい同じ順位で対応」させる
          </li>
          <li>
            ・ 主役だけ <strong>フォントファミリーで性格を変える</strong>（丸ゴ vs 角ゴ）= 主役感を立てる最後の一手
          </li>
          <li>
            ・ 余白は「情報の距離」の表現。<strong>関係が近いほど詰める / 切れ目は開ける</strong>
          </li>
          <li className="pt-3 border-t border-gray-200/60">
            → トークン1つを変えると <strong>そのトークンを使っている全コンポーネント</strong> に伝播する。
            だからトークンは「画面全体のトーン」を決める。
            コンポーネントは <strong>同じトークンの組み合わせ方</strong> で別々の役割を担う。
            それが「トークン × コンポーネント」の関係。
          </li>
        </ul>
      </div>
    </section>
  );
}
