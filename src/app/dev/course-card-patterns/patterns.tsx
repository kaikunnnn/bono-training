"use client";

/**
 * コースカード3案（A / B / C）を、同じ2コースで2列に並べて比べる。
 * 「仮タグを表示」トグルで、Figma に無く仮で作った文言の目印を出し分ける。
 */

import { useState } from "react";
import type { MockCourse } from "./mock";
import { MOCK_COURSES } from "./mock";
import { FieldText, LabeledBlock, MetaRow, Thumbnail } from "./parts";

export interface CardProps {
  course: MockCourse;
  showKari: boolean;
}

export type Surface = "none" | "white" | "border";

/**
 * カードの外枠。surface="white" のときは白背景のカードにする
 * （影・角丸は RoadmapCardV2 の white バリアントに合わせる）。
 * surface="border" のときは背景はページのまま、薄い枠線だけで囲む。
 */
function CardShell({
  surface,
  thumbLabel,
  children,
}: {
  surface: Surface;
  thumbLabel: string;
  children: React.ReactNode;
}) {
  if (surface === "white" || surface === "border") {
    const frame =
      surface === "white"
        ? "bg-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)]"
        : "border border-black/[0.08]";
    return (
      <div className={`group flex flex-col gap-4 rounded-[24px] p-2 pb-6 ${frame}`}>
        <Thumbnail label={thumbLabel} />
        <div className="flex flex-col gap-4 px-4">{children}</div>
      </div>
    );
  }
  return (
    <div className="group flex flex-col gap-4">
      <Thumbnail label={thumbLabel} />
      {children}
    </div>
  );
}

const TITLE_CLASS =
  "font-rounded-mplus text-xl font-medium leading-[1.76] tracking-[0.22px] text-text-primary";
const DIVIDER_CLASS = "border-t border-black/[0.08]";

/** A：説明文 → 区切り線 → 得られる変化 / 期間 / 制作物 */
export function CardA({ course, showKari, surface }: CardProps & { surface: Surface }) {
  return (
    <CardShell surface={surface} thumbLabel={course.thumbLabel}>
      <div className="flex flex-col gap-2">
        <h3 className={TITLE_CLASS}>
          <FieldText field={course.title} showKari={showKari} />
        </h3>
        <p className="font-noto-sans-jp text-base leading-[1.8] text-text-primary/80">
          <FieldText field={course.description} showKari={showKari} />
        </p>
      </div>
      <dl className={`flex flex-col gap-2 pt-4 ${DIVIDER_CLASS}`}>
        <MetaRow label="得られる変化" field={course.change} showKari={showKari} />
        <MetaRow label="期間" field={course.period} showKari={showKari} />
        <MetaRow label="制作物" field={course.deliverable} showKari={showKari} />
      </dl>
    </CardShell>
  );
}

/** B：1行の変化 → 期間 / 制作物 → 区切り線 → 制作者・価格 → 区切り線 */
export function CardB({ course, showKari, surface }: CardProps & { surface: Surface }) {
  return (
    <CardShell surface={surface} thumbLabel={course.thumbLabel}>
      <div className="flex flex-col gap-2">
        <h3 className={TITLE_CLASS}>
          <FieldText field={course.title} showKari={showKari} />
        </h3>
        <p className="font-noto-sans-jp text-base font-medium leading-[1.8] text-text-primary/80">
          <FieldText field={course.oneLiner} showKari={showKari} />
        </p>
      </div>
      <dl className="flex flex-col gap-2">
        <MetaRow label="期間" field={course.period} showKari={showKari} />
        <MetaRow label="制作物" field={course.deliverable} showKari={showKari} />
      </dl>
      <div className={`flex items-end justify-between border-b border-black/[0.08] py-4 ${DIVIDER_CLASS}`}>
        <div className="font-noto-sans-jp">
          <p className="text-xs text-text-primary/60">制作者</p>
          <p className="text-sm font-medium text-text-primary">
            <FieldText field={course.author} showKari={showKari} />
          </p>
        </div>
        <p className="font-noto-sans-jp text-base font-medium text-text-primary">
          <FieldText field={course.price} showKari={showKari} />
        </p>
      </div>
    </CardShell>
  );
}

/** C：タイトル → こんな人向け（対象者） → このコースで（得られる変化） → 区切り線 → 期間 / 制作物 */
export function CardC({ course, showKari, surface }: CardProps & { surface: Surface }) {
  return (
    <CardShell surface={surface} thumbLabel={course.thumbLabel}>
      <h3 className={TITLE_CLASS}>
        <FieldText field={course.title} showKari={showKari} />
      </h3>
      <div className="flex flex-col gap-3">
        <LabeledBlock label="こんな人向け" field={course.anxiety} showKari={showKari} />
        <LabeledBlock label="このコースで" field={course.change} showKari={showKari} />
      </div>
      <dl className={`flex flex-col gap-2 pt-4 ${DIVIDER_CLASS}`}>
        <MetaRow label="期間" field={course.period} showKari={showKari} />
        <MetaRow label="制作物" field={course.deliverable} showKari={showKari} />
      </dl>
    </CardShell>
  );
}

/** C2（B ベース）：タイトル → できること（ラベルなし） → 期間 / 制作物 → 区切り線 → こんな人向け */
export function CardC2({ course, showKari, surface }: CardProps & { surface: Surface }) {
  return (
    <CardShell surface={surface} thumbLabel={course.thumbLabel}>
      <div className="flex flex-col gap-2">
        <h3 className={TITLE_CLASS}>
          <FieldText field={course.title} showKari={showKari} />
        </h3>
        <p className="font-noto-sans-jp text-base font-medium leading-[1.8] text-text-primary/80">
          <FieldText field={course.change} showKari={showKari} />
        </p>
      </div>
      <dl className="flex flex-col gap-2">
        <MetaRow label="期間" field={course.period} showKari={showKari} />
        <MetaRow label="制作物" field={course.deliverable} showKari={showKari} />
      </dl>
      <div className={`pt-4 ${DIVIDER_CLASS}`}>
        <LabeledBlock label="こんな人向け" field={course.anxiety} showKari={showKari} />
      </div>
    </CardShell>
  );
}

const PATTERNS: {
  id: string;
  title: string;
  note: string;
  Card: (props: CardProps & { surface: Surface }) => React.JSX.Element;
}[] = [
  {
    id: "a",
    title: "A：説明文＋3項目（Figma案1）",
    note: "説明文でコースの中身を伝え、区切り線の下に「得られる変化・期間・制作物」を並べる。",
    Card: CardA,
  },
  {
    id: "b",
    title: "B：1行の変化＋期間・制作物＋制作者・価格（Figma案2）",
    note: "説明文の代わりに変化を1行で言い切り、下に制作者と価格を置く。",
    Card: CardB,
  },
  {
    id: "c",
    title: "C：対象者を見せる案",
    note: "タイトルの下に「こんな人向け」（ユーザーの不安・課題）と「このコースで」（得られる変化）を並べ、区切り線の下に期間・制作物。",
    Card: CardC,
  },
  {
    id: "c2",
    title: "C2：対象者を下に置く案（Bベース）",
    note: "タイトルの下にできること（ラベルなし）、期間・制作物の下の区切りエリアに「こんな人向け」。",
    Card: CardC2,
  },
];

export function CourseCardPatterns() {
  const [showKari, setShowKari] = useState(false);
  const [surface, setSurface] = useState<Surface>("none");

  return (
    <div className="flex flex-col gap-16">
      <label className="inline-flex w-fit cursor-pointer items-center gap-2 font-noto-sans-jp text-sm font-bold text-text-primary">
        <input
          type="checkbox"
          checked={showKari}
          onChange={(e) => setShowKari(e.target.checked)}
          className="h-4 w-4"
        />
        仮タグを表示
      </label>

      <div className="-mt-12 flex items-center gap-2 font-noto-sans-jp text-sm font-bold text-text-primary">
        <span>カードの背景</span>
        {(
          [
            ["none", "なし（背景に直置き）"],
            ["white", "白いカード"],
            ["border", "薄い枠線"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSurface(value)}
            className={`rounded-full border px-3 py-1 text-xs ${
              surface === value
                ? "border-text-primary bg-text-primary text-white"
                : "border-black/10 bg-white text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {PATTERNS.map(({ id, title, note, Card }) => (
        <section key={id} className="w-full max-w-[1100px]">
          <h2 className="font-rounded-mplus text-xl font-bold text-text-primary">{title}</h2>
          <p className="mt-1 font-noto-sans-jp text-sm leading-relaxed text-text-primary/60">{note}</p>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {MOCK_COURSES.map((course) => (
              <Card key={course.id} course={course} showKari={showKari} surface={surface} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
