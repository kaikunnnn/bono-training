/**
 * #267 試作3 — ナビの出し分け（未ログイン／有料会員）
 *
 * 267-D 4章「消さずに足す」の形を、並べて見比べるための静的モック。
 * - サイドバー: トピックの軸は全員共通。会員だけ一番上に「続きから」とマイページを足す
 * - ホームの上の方: 未ログインは目的の入口3つ＋ハブ。会員は「続きから」と進み具合、その下は同じハブ
 * - ロードマップのステップ: 同じ並びに、会員だけ進み具合と「いまここ」を重ねる
 *
 * 本物の Sidebar / Layout は触らない。サイドバーの見た目は SidebarMenuGroup / SidebarMenuItem を借りる。
 * 進み具合・コース名の組み合わせは見せ方の例（仮）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Book, Calendar2, DocumentText, EmptyWallet, Lamp, Login, Map as MapIcon, Medal, MessageQuestion, PlayCircle, Setting2, User } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarMenuGroup } from "@/components/layout/Sidebar/SidebarMenuGroup";
import { SidebarMenuItem } from "@/components/layout/Sidebar/SidebarMenuItem";
import { ICON_SIZE } from "@/components/layout/Sidebar/icon-utils";
import { getCourse } from "../../course-pages/data";
import { v6Steps, type V6Step } from "../../course-pages/data/roadmap-career-change-v6";
import { Kari, ProtoBar, V6_BASE, courseHref, v6Step } from "../_parts/shared";

export const metadata: Metadata = {
  title: "ナビの出し分け（#267 試作）",
  robots: { index: false, follow: false },
};

const HUB_HREF = "/dev/site-structure/trouble-hub";
const COURSES_HREF = "/dev/course-pages";

/** 会員モックの現在地（例） */
const MEMBER = {
  doneSteps: [1, 2],
  currentStep: 3,
  courseSlug: "ui-experience",
  nextLesson: "ナビゲーションの基本",
  done: 3,
  total: 8,
};

type Mode = "guest" | "member";

const ICON = { size: ICON_SIZE, color: "currentColor", variant: "Outline" as const };

export default function NavProtoPage() {
  return (
    <div className="font-noto-sans-jp">
      <ProtoBar
        title="試作3 ナビの出し分け"
        note="同じURL・同じ並びのまま、ログインしている有料会員にだけ「続きから」と進み具合を足す。左右で見比べる静的モック（本物のサイドバーは変えていない）。"
      />
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-24 pt-8 sm:px-6">
        <h1 className="font-heading text-[26px] font-bold leading-[1.4] text-text-primary md:text-[30px]">
          未ログインと有料会員で、ナビをどう出し分けるか
        </h1>
        <p className="mt-3 max-w-[760px] text-sm leading-[1.8] text-text-secondary">
          ナビは利用者の種類で分けず、トピックの軸（ロードマップ・悩み・コース…）で全員共通にします。
          会員にだけ、一番上に「続きから」を足します。消さずに足すので、会員も公開の資料をそのまま読めます。
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Column mode="guest" />
          <Column mode="member" />
        </div>
      </div>
    </div>
  );
}

function Column({ mode }: { mode: Mode }) {
  const isMember = mode === "member";
  return (
    <section
      aria-labelledby={`col-${mode}`}
      className={cn(
        "flex flex-col gap-6 rounded-[24px] border p-4 md:p-5",
        isMember ? "border-text-primary/30 bg-surface" : "border-border-light bg-muted-custom"
      )}
    >
      <div>
        <h2 id={`col-${mode}`} className="font-heading text-xl font-bold text-text-primary">
          {isMember ? "有料会員（ログイン中）" : "未ログイン"}
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          {isMember ? "左と同じものに「続きから」と進み具合を足しただけ" : "検索や動画から初めて来た人"}
        </p>
      </div>

      <Block title="サイドバー" note={isMember ? "一番上に「続きから」とマイページが増える" : "トピックの軸で全員共通"}>
        <SidebarMock mode={mode} />
      </Block>

      <Block title="ホームの上の方" note={isMember ? "続きから → 進み具合 → 下は未ログインと同じハブ" : "目的の入口3つ → ハブ"}>
        <HomeMock mode={mode} />
      </Block>

      <Block title="ロードマップのステップ" note={isMember ? "同じ並びに、進み具合と「いまここ」を重ねる" : "全部無料で読める。各ステップにコース1つ"}>
        <StepRows mode={mode} />
      </Block>
    </section>
  );
}

function Block({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-heading text-base font-bold text-text-primary">{title}</h3>
      <p className="mt-0.5 text-xs text-text-muted">{note}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/* ---------- 続きからカード（サイドバー用・ホーム用） ---------- */

function ContinueCard({ size }: { size: "sm" | "lg" }) {
  const course = getCourse(MEMBER.courseSlug);
  const percent = Math.round((MEMBER.done / MEMBER.total) * 100);
  return (
    <Link
      href={courseHref(MEMBER.courseSlug)}
      className={cn(
        "group block rounded-[16px] border border-border-light bg-surface transition-colors hover:bg-hover",
        size === "sm" ? "p-3" : "p-4 md:p-5"
      )}
    >
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-text-muted">
        <PlayCircle size={14} color="currentColor" variant="Outline" aria-hidden="true" />
        続きから
        <Kari />
      </span>
      <span className={cn("mt-1 block font-bold text-text-primary", size === "sm" ? "text-xs" : "text-base")}>
        {course?.shortTitle.text}
      </span>
      <span className={cn("block text-text-secondary", size === "sm" ? "text-[11px]" : "text-sm")}>
        次: {MEMBER.nextLesson}
      </span>
      <span className="mt-2 flex items-center gap-2">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted-strong" aria-hidden="true">
          <span className="block h-full rounded-full bg-text-primary" style={{ width: `${percent}%` }} />
        </span>
        <span className="text-[11px] text-text-muted">
          {MEMBER.done}/{MEMBER.total}
        </span>
      </span>
      {size === "lg" ? (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-text-primary">
          レッスンを再開する
          <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      ) : null}
    </Link>
  );
}

/* ---------- サイドバー ---------- */

function SidebarMock({ mode }: { mode: Mode }) {
  const isMember = mode === "member";
  return (
    <div className="w-[220px] rounded-[16px] border border-border-light bg-surface py-3">
      {isMember ? (
        <div className="flex flex-col gap-1 px-[15px] pb-3">
          <ContinueCard size="sm" />
        </div>
      ) : null}
      <SidebarMenuGroup>
        {isMember ? (
          <SidebarMenuItem href="/mypage" icon={<User {...ICON} />}>
            マイページ
          </SidebarMenuItem>
        ) : null}
        <SidebarMenuItem href={V6_BASE} icon={<MapIcon {...ICON} />}>
          ロードマップ
        </SidebarMenuItem>
        <SidebarMenuItem href={HUB_HREF} icon={<Lamp {...ICON} />}>
          悩みから探す
        </SidebarMenuItem>
        <SidebarMenuItem href={COURSES_HREF} icon={<Book {...ICON} />}>
          コース
        </SidebarMenuItem>
        <SidebarMenuItem href="/guide" icon={<DocumentText {...ICON} />}>
          読みもの
        </SidebarMenuItem>
        <SidebarMenuItem href="/questions" icon={<MessageQuestion {...ICON} />}>
          掲示板
        </SidebarMenuItem>
      </SidebarMenuGroup>
      <SidebarMenuGroup label="サブ" className="mt-3">
        <SidebarMenuItem href="/achievements" icon={<Medal {...ICON} />}>
          みんなの実績
        </SidebarMenuItem>
        <SidebarMenuItem href="/events" icon={<Calendar2 {...ICON} />}>
          イベント
        </SidebarMenuItem>
      </SidebarMenuGroup>
      <SidebarMenuGroup label="その他" className="mt-3">
        <SidebarMenuItem href="/subscription" icon={<EmptyWallet {...ICON} />}>
          料金プラン
        </SidebarMenuItem>
        {isMember ? (
          <SidebarMenuItem href="/account" icon={<Setting2 {...ICON} />}>
            設定
          </SidebarMenuItem>
        ) : (
          <SidebarMenuItem href="/login" icon={<Login {...ICON} />}>
            ログイン
          </SidebarMenuItem>
        )}
      </SidebarMenuGroup>
    </div>
  );
}

/* ---------- ホームの上の方 ---------- */

const ENTRANCES = [
  { label: "UIUXデザイナーに転職したい", sub: "6つのステップで、全体の道のりを見る", href: V6_BASE },
  { label: "UIを作れるようになりたい", sub: "最初の1画面から、コースで順に練習する", href: COURSES_HREF },
  { label: "いま、作っていて困っている", sub: "余白・配色・画面の流れなど、困りごとから探す", href: HUB_HREF },
];

const HUBS = [
  { label: "ロードマップ", href: V6_BASE, icon: MapIcon },
  { label: "悩みから探す", href: HUB_HREF, icon: Lamp },
  { label: "コース", href: COURSES_HREF, icon: Book },
];

function HomeMock({ mode }: { mode: Mode }) {
  const isMember = mode === "member";
  const current = v6Steps.find((s) => s.n === MEMBER.currentStep);
  return (
    <div className="flex flex-col gap-4 rounded-[16px] border border-border-light bg-surface p-4">
      {isMember ? (
        <>
          <ContinueCard size="lg" />
          <div className="rounded-[16px] bg-muted-custom p-4">
            <p className="text-[11px] font-bold text-text-muted">
              転職ロードマップの進み具合
              <Kari />
            </p>
            <p className="mt-1 text-sm font-bold text-text-primary">
              ステップ{MEMBER.currentStep}/{v6Steps.length}「{current?.short}」
            </p>
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {v6Steps.map((s) => (
                <span
                  key={s.id}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    MEMBER.doneSteps.includes(s.n)
                      ? "bg-text-primary"
                      : s.n === MEMBER.currentStep
                        ? "bg-text-primary/40"
                        : "bg-muted-strong"
                  )}
                />
              ))}
            </div>
            <Link href={v6Step(MEMBER.currentStep)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-text-link hover:underline">
              いまのステップを見る
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          </div>
          <p className="border-t border-dashed border-border-light pt-3 text-[11px] text-text-muted">ここから下は未ログインと同じ</p>
        </>
      ) : (
        <>
          <p className="font-heading text-lg font-bold leading-[1.5] text-text-primary">
            何をしたくて来ましたか？
            <Kari />
          </p>
          <div className="flex flex-col gap-2">
            {ENTRANCES.map((e) => (
              <Link
                key={e.label}
                href={e.href}
                className="group flex items-center justify-between gap-3 rounded-[14px] border border-border-light bg-surface px-4 py-3 transition-colors hover:bg-hover"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-text-primary">{e.label}</span>
                  <span className="block text-xs text-text-muted">{e.sub}</span>
                </span>
                <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-text-muted" />
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {HUBS.map(({ label, href, icon: Icon }) => (
          <Button key={label} asChild variant="outline" size="sm">
            <Link href={href}>
              <Icon size={16} color="currentColor" variant="Outline" aria-hidden="true" />
              {label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

/* ---------- ロードマップのステップ ---------- */

function courseLabel(step: V6Step): string {
  if (step.course.type === "course") return getCourse(step.course.slug)?.shortTitle.text ?? step.course.slug;
  return `${step.course.title}（準備中）`;
}

function StepRows({ mode }: { mode: Mode }) {
  const isMember = mode === "member";
  return (
    <ol className="flex flex-col gap-2">
      {v6Steps.map((s) => {
        const done = isMember && MEMBER.doneSteps.includes(s.n);
        const here = isMember && s.n === MEMBER.currentStep;
        return (
          <li key={s.id}>
            <Link
              href={v6Step(s.n)}
              className={cn(
                "flex items-center gap-3 rounded-[14px] border bg-surface px-3 py-2.5 transition-colors hover:bg-hover",
                here ? "border-text-primary" : "border-border-light"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  done ? "bg-text-primary text-text-inverse" : "bg-muted-custom text-text-secondary"
                )}
              >
                {done ? <Check size={14} aria-label="完了" /> : s.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-text-primary">
                  {s.short}
                  {here ? (
                    <span className="rounded-full bg-text-primary px-2 py-0.5 text-[10px] text-text-inverse">いまここ</span>
                  ) : null}
                </span>
                <span className="block truncate text-xs text-text-muted">コース: {courseLabel(s)}</span>
                {here ? (
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted-strong" aria-hidden="true">
                      <span
                        className="block h-full rounded-full bg-text-primary"
                        style={{ width: `${Math.round((MEMBER.done / MEMBER.total) * 100)}%` }}
                      />
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {MEMBER.done}/{MEMBER.total}
                    </span>
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
