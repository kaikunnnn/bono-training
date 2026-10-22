/**
 * 仮の作品画像（#243 v3）
 *
 * 実際の作品画像がまだ無いので、トークンだけで「何をつくるか」が分かる画面の枠を描く。
 * 押せないので白は使わない（画面は --bg-base、枠は淡いグラデーション）。
 * compact: 地図・ポートフォリオの帯に入れる小さい版（文字を出さない）
 */

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkMockKind } from "../../../data/roadmap-career-change-v3";
import { EYECATCH_BG } from "../../../template/shared";

type P = { compact?: boolean };

/* ---------- 部品 ---------- */

function Bar({ w = "100%", className }: { w?: string; className?: string }) {
  return <span className={cn("block h-[5%] min-h-[3px] rounded-full bg-text-primary/15", className)} style={{ width: w }} />;
}

function Phone({ children, className, label, compact }: { children: React.ReactNode; className?: string; label?: string; compact?: boolean }) {
  return (
    <div className={cn("flex min-w-0 flex-col items-center gap-1", className)}>
      <div className="flex aspect-[9/17] w-full flex-col gap-[6%] overflow-hidden rounded-[10%/5%] border border-text-primary/15 bg-[var(--bg-base)] p-[8%] shadow-[var(--shadow-sm)]">
        {children}
      </div>
      {label && !compact ? <span className="truncate text-[10px] font-bold leading-none text-text-secondary">{label}</span> : null}
    </div>
  );
}

function Browser({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-[8px] border border-text-primary/15 bg-[var(--bg-base)] shadow-[var(--shadow-sm)]", className)}>
      <div className="flex items-center gap-1 border-b border-text-primary/10 px-2 py-1.5">
        <span className="size-1.5 rounded-full bg-text-primary/15" />
        <span className="size-1.5 rounded-full bg-text-primary/15" />
        <span className="size-1.5 rounded-full bg-text-primary/15" />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

/** 注釈のチップ（黄色） */
function Note({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  if (compact) return null;
  return (
    <span className="whitespace-nowrap rounded-[4px] bg-[var(--persona-recommendation)] px-1 py-px text-[9px] font-bold leading-tight text-text-primary">
      {children}
    </span>
  );
}

function Arrow({ compact }: { compact?: boolean }) {
  return <ArrowRight className={cn("shrink-0 text-text-primary/50", compact ? "size-2.5" : "size-4")} strokeWidth={2.5} />;
}

/** リストの1行（丸＋2本線） */
function Row({ accent }: { accent?: string }) {
  return (
    <div className="flex items-center gap-[8%]">
      <span className={cn("aspect-square w-[16%] shrink-0 rounded-full", accent ?? "bg-text-primary/15")} />
      <div className="flex flex-1 flex-col gap-[3px]">
        <Bar w="80%" />
        <Bar w="50%" className="bg-text-primary/10" />
      </div>
    </div>
  );
}

/* ---------- 画像の種類 ---------- */

function TodoAnnotated({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center gap-3">
      <Phone className="w-[34%]" compact={compact}>
        <div className="flex items-center justify-between">
          <Bar w="45%" className="h-[6px] bg-text-primary/40" />
          <span className="aspect-square w-[12%] rounded-full bg-text-primary/20" />
        </div>
        <Row />
        <Row />
        <Row accent="bg-[var(--cat-output)]" />
        <Row />
        <span className="mt-auto self-end rounded-full bg-[var(--text-link)] px-[14%] py-[6%]" />
      </Phone>
      {compact ? null : (
        <div className="flex flex-col gap-6">
          <Note>① ヘッダー</Note>
          <Note>② リスト（部品をくり返す）</Note>
          <Note>③ 追加ボタン</Note>
        </div>
      )}
    </div>
  );
}

function Trace3({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center gap-[4%] px-[4%]">
      <Phone className="w-[28%]" label="アプリA" compact={compact}>
        <Bar w="40%" className="bg-text-primary/40" />
        <span className="aspect-[16/10] w-full rounded-[6px] bg-[var(--cat-ux-design)]/30" />
        <Bar />
        <Bar w="70%" />
        <span className="aspect-[16/10] w-full rounded-[6px] bg-text-primary/10" />
      </Phone>
      <Phone className="w-[28%]" label="アプリB" compact={compact}>
        <span className="mx-auto aspect-square w-[34%] rounded-full bg-[var(--training-orange)]/40" />
        <Bar w="60%" className="mx-auto bg-text-primary/40" />
        <div className="grid grid-cols-3 gap-[6%]">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="aspect-square rounded-[3px] bg-text-primary/10" />
          ))}
        </div>
        {compact ? null : (
          <div className="mt-auto self-start">
            <Note>余白 16</Note>
          </div>
        )}
      </Phone>
      <Phone className="w-[28%]" label="アプリC" compact={compact}>
        <Bar w="40%" className="bg-text-primary/40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-text-primary/10 pb-[4%]">
            <Bar w="55%" />
            <span className="h-[8px] w-[18%] rounded-full bg-[var(--cat-output)]/50" />
          </div>
        ))}
        {compact ? null : (
          <div className="mt-auto self-end">
            <Note>文字 14</Note>
          </div>
        )}
      </Phone>
    </div>
  );
}

function BeforeAfter({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center gap-[6%]">
      <Phone className="w-[30%]" label="1日目" compact={compact}>
        <Bar w="70%" className="h-[8px] bg-text-primary/50" />
        <Bar w="90%" />
        <span className="h-[12%] w-full rounded-[2px] border border-text-primary/30" />
        <span className="h-[12%] w-[85%] rounded-[2px] border border-text-primary/30" />
        <span className="h-[10%] w-[60%] rounded-[2px] bg-text-primary/40" />
        <Bar w="40%" className="ml-[30%]" />
      </Phone>
      <Arrow compact={compact} />
      <Phone className="w-[30%]" label="10日目" compact={compact}>
        <span className="aspect-square w-[22%] rounded-[6px] bg-[image:var(--persona-cta-gradient)]" />
        <Bar w="65%" className="h-[8px] bg-text-primary/60" />
        <Bar w="85%" className="bg-text-primary/10" />
        <span className="mt-[4%] h-[11%] w-full rounded-[6px] bg-text-primary/[0.06]" />
        <span className="h-[11%] w-full rounded-[6px] bg-text-primary/[0.06]" />
        <span className="mt-auto h-[11%] w-full rounded-[6px] bg-cta-primary-bg" />
      </Phone>
    </div>
  );
}

const DAILY = ["サインアップ", "設定", "料金表", "プロフィール", "検索", "通知", "購入", "空の状態", "ログイン", "ホーム"];
const DAILY_ACCENT = [
  "bg-[var(--text-link)]",
  "bg-text-primary/30",
  "bg-[var(--training-orange)]",
  "bg-[var(--cat-ux-design)]",
  "bg-[var(--cat-output)]",
  "bg-[var(--accent-orange)]",
  "bg-[var(--cat-book)]",
  "bg-[var(--label-olive)]",
  "bg-cta-primary-bg",
  "bg-[var(--cat-ui-visual)]",
];

function DailyGrid({ compact }: P) {
  return (
    <div className="grid h-full grid-cols-5 content-center gap-[3%] px-[4%]">
      {DAILY.map((name, i) => (
        <div key={name} className="flex min-w-0 flex-col items-center gap-1">
          <div className="flex aspect-[9/16] w-full flex-col gap-[8%] rounded-[6px] border border-text-primary/15 bg-[var(--bg-base)] p-[10%]">
            <Bar w="70%" className="bg-text-primary/35" />
            <Bar w="90%" className="bg-text-primary/10" />
            <span className="h-[14%] w-full rounded-[3px] bg-text-primary/[0.07]" />
            <span className={cn("mt-auto h-[12%] w-full rounded-[3px]", DAILY_ACCENT[i])} />
          </div>
          {compact ? null : (
            <span className="w-full truncate text-center text-[9px] font-bold leading-none text-text-secondary">
              #{String(i + 1).padStart(2, "0")} {name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function FlowApp({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center gap-[2%] px-[3%]">
      <Phone className="w-[27%]" label="一覧" compact={compact}>
        <Bar w="50%" className="bg-text-primary/40" />
        <span className="h-[14%] w-full rounded-[6px] bg-[var(--cat-output)]/25" />
        <Row accent="bg-[var(--training-orange)]/60" />
        <Row accent="bg-[var(--cat-ux-design)]/50" />
        <Row accent="bg-[var(--cat-output)]/60" />
        <span className="mt-auto self-end rounded-full bg-cta-primary-bg px-[14%] py-[7%]" />
      </Phone>
      <Arrow compact={compact} />
      <Phone className="w-[27%]" label="詳細" compact={compact}>
        <Bar w="30%" className="bg-text-primary/25" />
        <Bar w="60%" className="h-[9px] bg-text-primary/50" />
        <span className="aspect-[4/3] w-full rounded-[6px] bg-[var(--training-orange)]/25" />
        <Bar />
        <Bar w="75%" />
        <span className="mt-auto h-[10%] w-full rounded-[6px] border border-text-primary/30" />
      </Phone>
      <Arrow compact={compact} />
      <Phone className="w-[27%]" label="編集" compact={compact}>
        <Bar w="40%" className="bg-text-primary/40" />
        {["金額", "カテゴリ", "メモ"].map((f) => (
          <div key={f} className="flex flex-col gap-[3px]">
            <Bar w="30%" className="bg-text-primary/25" />
            <span className="h-[18px] w-full rounded-[4px] border border-text-primary/20 max-[500px]:h-[10px]" />
          </div>
        ))}
        <span className="mt-auto h-[10%] w-full rounded-[6px] bg-cta-primary-bg" />
      </Phone>
    </div>
  );
}

function FlowSaas({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center px-[5%]">
      <Browser className="aspect-[16/10] w-full max-w-[92%]">
        <div className="flex h-full">
          <div className="flex w-[20%] flex-col gap-[8%] border-r border-text-primary/10 p-[3%]">
            <Bar w="70%" className="bg-text-primary/40" />
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className={cn("h-[6%] min-h-[4px] w-full rounded-[3px]", i === 1 ? "bg-[var(--cat-ux-design)]/40" : "bg-text-primary/10")} />
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-[5%] p-[3%]">
            <div className="flex items-center justify-between">
              <Bar w="30%" className="bg-text-primary/40" />
              <span className="h-[8px] w-[16%] rounded-[3px] bg-cta-primary-bg" />
            </div>
            <span className="h-[8%] w-full rounded-[4px] border border-text-primary/15" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-[4%] border-b border-text-primary/10 pb-[2%]">
                <Bar w="18%" />
                <Bar w="30%" className="bg-text-primary/10" />
                <span className={cn("ml-auto h-[7px] w-[12%] rounded-full", i % 2 ? "bg-[var(--cat-output)]/50" : "bg-[var(--training-orange)]/50")} />
              </div>
            ))}
            {compact ? null : (
              <div className="mt-auto flex gap-1">
                <Note>検索・絞り込み</Note>
                <Note>サイドバーで移動</Note>
              </div>
            )}
          </div>
        </div>
      </Browser>
    </div>
  );
}

function CaseStudy({ compact }: P) {
  const blocks = ["概要", "結論", "プロセス", "終わりに"];
  return (
    <div className="flex h-full items-center justify-center px-[6%]">
      <Browser className="aspect-[4/3] w-full max-w-[86%]">
        <div className="flex h-full flex-col gap-[3%] p-[4%]">
          <div className="flex items-center gap-[3%]">
            <span className="aspect-square w-[8%] rounded-[4px] bg-[var(--cat-output)]/40" />
            <Bar w="40%" className="h-[7px] bg-text-primary/50" />
          </div>
          {blocks.map((b, i) => (
            <div key={b} className="flex flex-1 gap-[3%] rounded-[4px] bg-text-primary/[0.04] p-[2%]">
              {compact ? null : <span className="w-[22%] shrink-0 text-[9px] font-bold leading-tight text-text-secondary">{b}</span>}
              <div className="flex flex-1 items-center gap-[3%]">
                {i === 1 ? (
                  <>
                    <span className="h-full w-[24%] rounded-[3px] bg-[var(--cat-output)]/30" />
                    <span className="h-full w-[24%] rounded-[3px] bg-[var(--cat-output)]/20" />
                  </>
                ) : null}
                {i === 2 ? (
                  <div className="flex w-full items-center gap-[2%]">
                    {["ラフ", "没案", "話を聞く", "完成"].map((s) => (
                      <span key={s} className="flex h-full flex-1 items-center justify-center rounded-[3px] bg-text-primary/10 text-[8px] text-text-muted">
                        {compact ? null : s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col gap-[4px]">
                    <Bar w="85%" />
                    <Bar w="60%" className="bg-text-primary/10" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Browser>
    </div>
  );
}

function PortfolioTop({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center px-[5%]">
      <Browser className="aspect-[16/11] w-full max-w-[90%]">
        <div className="flex h-full flex-col gap-[3%] p-[3.5%]">
          <div className="flex items-center justify-between">
            <Bar w="22%" className="h-[7px] bg-text-primary/50" />
            <div className="flex w-[30%] gap-[8%]">
              <Bar w="30%" />
              <Bar w="30%" />
            </div>
          </div>
          {compact ? null : <span className="text-[9px] font-bold leading-none text-text-secondary">代表作</span>}
          <div className="grid grid-cols-3 gap-[3%]">
            <div className="aspect-[4/3] rounded-[4px] bg-[var(--text-link)]/15 p-[8%]">
              <div className="grid h-full grid-cols-3 gap-[8%]">
                <span className="rounded-[2px] bg-[var(--text-link)]/40" />
                <span className="rounded-[2px] bg-[var(--training-orange)]/50" />
                <span className="rounded-[2px] bg-[var(--cat-output)]/50" />
              </div>
            </div>
            <div className="flex aspect-[4/3] items-center justify-center gap-[6%] rounded-[4px] bg-[var(--cat-output)]/20 p-[8%]">
              <span className="h-full w-[26%] rounded-[3px] bg-[var(--bg-base)]" />
              <span className="h-full w-[26%] rounded-[3px] bg-[var(--bg-base)]" />
            </div>
            <div className="aspect-[4/3] rounded-[4px] bg-[var(--cat-ux-design)]/20 p-[8%]">
              <span className="block h-full w-full rounded-[3px] bg-[var(--bg-base)]" />
            </div>
          </div>
          {compact ? null : <span className="text-[9px] font-bold leading-none text-text-secondary">練習の記録</span>}
          <div className="grid grid-cols-6 gap-[2%]">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="aspect-[3/4] rounded-[3px] bg-text-primary/10" />
            ))}
          </div>
          {compact ? null : <span className="text-[9px] font-bold leading-none text-text-secondary">学習ログ・自己紹介</span>}
          <Bar w="90%" className="bg-text-primary/10" />
          <Bar w="60%" className="bg-text-primary/10" />
        </div>
      </Browser>
    </div>
  );
}

const COMPANIES = [
  { name: "家計簿サービスの会社", who: "個人・スマホ", first: "代表作②" },
  { name: "予約SaaSの会社", who: "店舗スタッフ・PC", first: "代表作③" },
  { name: "旅行メディアの会社", who: "個人・スマホとPC", first: "代表作①" },
  { name: "人事SaaSの会社", who: "会社員・PC", first: "代表作③" },
  { name: "フィットネスアプリの会社", who: "個人・スマホ", first: "代表作②" },
];

function ApplyList({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center px-[5%]">
      <div className="w-full max-w-[92%] rounded-[8px] border border-text-primary/15 bg-[var(--bg-base)] p-[3%] shadow-[var(--shadow-sm)]">
        {compact ? null : (
          <div className="grid grid-cols-[1.6fr_1.2fr_0.8fr] gap-2 border-b border-text-primary/15 pb-1 text-[9px] font-bold text-text-muted">
            <span>応募先（仮）</span>
            <span>使う人</span>
            <span>先頭の作品</span>
          </div>
        )}
        {COMPANIES.map((c, i) => (
          <div key={c.name} className="grid grid-cols-[1.6fr_1.2fr_0.8fr] items-center gap-2 border-b border-text-primary/10 py-[2.2%] last:border-0">
            {compact ? (
              <>
                <Bar w="80%" />
                <Bar w="60%" className="bg-text-primary/10" />
                <span className={cn("h-[6px] w-full rounded-full", i % 2 ? "bg-[var(--cat-ux-design)]/50" : "bg-[var(--cat-output)]/50")} />
              </>
            ) : (
              <>
                <span className="truncate text-[10px] font-bold text-text-primary">{c.name}</span>
                <span className="truncate text-[10px] text-text-secondary">{c.who}</span>
                <span className="w-fit rounded-full bg-[var(--persona-recommendation)] px-1.5 text-[9px] font-bold text-text-primary">{c.first}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Proposal({ compact }: P) {
  return (
    <div className="flex h-full items-center justify-center px-[5%]">
      <div className="flex w-full max-w-[92%] flex-col gap-[4%] rounded-[8px] border border-text-primary/15 bg-[var(--bg-base)] p-[4%] shadow-[var(--shadow-sm)]">
        {compact ? (
          <Bar w="70%" className="bg-text-primary/40" />
        ) : (
          <p className="text-[10px] font-bold leading-snug text-text-primary">
            課題: 予約の変更が、電話でしかできない
          </p>
        )}
        <div className="flex items-center justify-center gap-[4%]">
          <Phone className="w-[30%]" label="いま" compact={compact}>
            <Bar w="60%" className="bg-text-primary/40" />
            <Bar />
            <Bar w="70%" />
            <span className="mt-auto h-[11%] w-full rounded-[4px] border border-[var(--text-error)]/50" />
          </Phone>
          <Arrow compact={compact} />
          <Phone className="w-[30%]" label="改善案" compact={compact}>
            <Bar w="60%" className="bg-text-primary/40" />
            <div className="grid grid-cols-3 gap-[6%]">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className={cn("aspect-square rounded-[3px]", i === 4 ? "bg-[var(--cat-output)]" : "bg-text-primary/10")} />
              ))}
            </div>
            <span className="mt-auto h-[11%] w-full rounded-[4px] bg-cta-primary-bg" />
          </Phone>
        </div>
      </div>
    </div>
  );
}

const MOCKS: Record<WorkMockKind, (p: P) => React.ReactElement> = {
  "todo-annotated": TodoAnnotated,
  trace3: Trace3,
  "dailyui-before-after": BeforeAfter,
  "dailyui-grid": DailyGrid,
  "flow-app": FlowApp,
  "flow-saas": FlowSaas,
  "case-study": CaseStudy,
  "portfolio-top": PortfolioTop,
  "apply-list": ApplyList,
  proposal: Proposal,
};

/**
 * 仮の作品画像。aspect は外から（既定 4/3）。
 * kari: 右上に「仮の画像」ラベル（compact では出さない）
 */
export default function WorkMock({
  kind,
  compact = false,
  className,
  rounded = "rounded-[20px]",
}: {
  kind: WorkMockKind;
  compact?: boolean;
  className?: string;
  rounded?: string;
}) {
  const Mock = MOCKS[kind];
  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden", rounded, EYECATCH_BG, className)} role="img" aria-label="仮の画像">
      <div className={cn("absolute inset-0", compact ? "p-[6%]" : "p-[5%] pt-[9%]")}>
        <Mock compact={compact} />
      </div>
      {compact ? null : (
        <span className="absolute right-2.5 top-2.5 rounded-full border border-text-primary/20 px-2 py-px text-[10px] font-bold text-text-secondary">
          仮の画像
        </span>
      )}
    </div>
  );
}
