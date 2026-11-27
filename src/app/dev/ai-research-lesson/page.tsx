import Link from "next/link";
import { Button } from "@/components/ui/button";
import PersonaLessonTopClient, {
  type PersonaLessonTopLesson,
} from "@/app/lessons/[slug]/PersonaLessonTopClient";
import { EDIT_CARDS, PROMPTS } from "./p4";
import { KAI } from "./kai";
import LessonDetailClient from "@/app/lessons/[slug]/LessonDetailClient";
import { AI_RESEARCH_LESSON_SLUG } from "@/lib/persona-lesson-top-config";
import {
  DIRECTION_GROUPS,
  DIRECTION_KEYS,
  DIRECTIONS,
  ROWS,
  THUMBS,
  type DirectionKey,
} from "./directions";

/**
 * 「AIリサーチではじめるUIデザイン」レッスントップの試作（#304 → #319）。
 * Sanity には書き込まず、本物のレッスントップ部品（PersonaLessonTopClient）に直接渡す。
 * 11/16 決定の並び（4セクション・動画11本＋記事1本、無料はセクション01と02）。
 * ?dir=q（11/21 決めた形）・p1|p2|p4（11/20案）・a|b|c|now で言葉の方向性（#319・AIの案・未決定）、?member=1 で会員の見え方。
 * ?layout=standard で、ふつうの /lessons/[slug] の形（LessonDetailClient）に同じ言葉を流し込む。
 */

type LayoutKey = "persona" | "standard";

let keySeq = 0;
const key = () => `k${keySeq++}`;
const block = (text: string, extra: { style?: string; listItem?: "bullet"; level?: number } = {}) => ({
  _type: "block",
  _key: key(),
  style: extra.style ?? "normal",
  ...(extra.listItem ? { listItem: extra.listItem, level: extra.level ?? 1 } : {}),
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

/** ふつうのレッスンページ（Sanityの description / purposes / overview / quest.goal）に言葉を当てはめる */
function buildStandardLesson(dir: DirectionKey, isMember: boolean) {
  const direction = DIRECTIONS[dir];
  const { content } = direction;
  const persona = buildLesson(dir, isMember, "standard");
  const owner = direction.ownerCopy;
  if (owner) {
    // 11/21案: 説明文・目的・概要はオーナーの文のまま。変えるのはレッスン名とおすすめな人だけ
    return {
      ...persona,
      subtitle: direction.subtitle,
      seoTitle: direction.seoTitle,
      description: owner.description,
      iconImageUrl: content.hero.iconFallbackSrc,
      purposes: owner.purposes,
      overview: [
        block(owner.heading, { style: "h3" }),
        ...owner.paragraphs.flatMap((text) => text.split("\n").map((line) => block(line))),
        block("おすすめな人", { style: "h3" }),
        ...content.recommendations.map((item) => block(item.title, { listItem: "bullet" })),
        ...(owner.notFor
          ? [block("向いていない人", { style: "h3" }), block(owner.notFor, { listItem: "bullet" })]
          : []),
      ] as never,
      quests: persona.quests.map((quest, index) => ({
        ...quest,
        goal: direction.sectionGoals?.[index] || undefined,
      })),
    };
  }
  return {
    ...persona,
    // 11/20案: タイトルの下は「こういう状態になれる」の1文（オーナー 11/20）。説明は概要タブへ
    description: direction.lessonTitle ? content.hero.question : content.hero.lead,
    iconImageUrl: content.hero.iconFallbackSrc,
    purposes: content.skills.items.map((item) => item.title),
    overview: [
      ...(direction.lessonTitle
        ? [block(content.hero.lead)]
        : [block(content.hero.question, { style: "h3" })]),
      ...content.overview.paragraphs.map((text) => block(text)),
      block("おすすめな人", { style: "h3" }),
      ...content.recommendations.map((item) => block(item.title, { listItem: "bullet" })),
      ...(dir === "p4"
        ? PROMPTS.flatMap((prompt) => [
            block(`頼み方（${prompt.where}）：${prompt.title}`, { style: "h3" }),
            ...prompt.lines.map((line) => block(line)),
            ...(prompt.note ? [block(`※${prompt.note}`)] : []),
          ])
        : []),
    ] as never,
    quests: persona.quests.map((quest, index) => ({
      ...quest,
      goal: direction.sectionGoals?.[index] || undefined,
    })),
  };
}

function buildLesson(dir: DirectionKey, isMember: boolean, layout: LayoutKey = "persona"): PersonaLessonTopLesson {
  const direction = DIRECTIONS[dir];
  return {
    _id: "proto-ai-research-lesson",
    title: direction.lessonTitle ?? "AIリサーチではじめるUIデザイン",
    slug: { current: AI_RESEARCH_LESSON_SLUG },
    quests: direction.sectionTitles.map((title, sectionIndex) => ({
      _id: `proto-quest-${sectionIndex + 1}`,
      questNumber: sectionIndex + 1,
      title,
      articles: (direction.rows ?? ROWS).map((row, rowIndex) => ({ row, rowIndex }))
        .filter(({ row }) => row.section === sectionIndex)
        .map(({ row, rowIndex }, index) => ({
          _id: `proto-${row.number}`,
          articleNumber: index + 1,
          title: direction.articleTitles[rowIndex],
          // dir=r は回のページ（/dev/.../kai/N）、それ以外は下書きを出す記事ページ（/dev/.../a/番号）へ飛ばす。共通部品が "/contents/" + slug で組むので、".." で1段戻す（試作だけの回避）
          slug: {
            current:
              dir === "r" && row.number.startsWith("K")
                ? `../dev/ai-research-lesson/kai/${row.number.slice(1)}`
                : `../dev/ai-research-lesson/a/${row.number}?dir=${dir}&layout=${layout}`,
          },
          videoDuration: row.duration,
          thumbnailUrl: row.thumb ?? THUMBS[row.number],
          articleType: row.type,
          isPremium: !row.free,
          isLocked: !row.free && !isMember,
        })),
    })),
  };
}

function DirectionBar({
  dir,
  isMember,
  layout,
}: {
  dir: DirectionKey;
  isMember: boolean;
  layout: LayoutKey;
}) {
  const hrefOf = (next: { dir?: DirectionKey; member?: boolean; layout?: LayoutKey }) => {
    const d = next.dir ?? dir;
    const m = next.member ?? isMember;
    const l = next.layout ?? layout;
    return `/dev/ai-research-lesson?dir=${d}${l === "standard" ? "&layout=standard" : ""}${m ? "&member=1" : ""}`;
  };
  const item = (key: string, label: string, active: boolean, href: string) => (
    <Button
      key={key}
      asChild
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="h-7 rounded-[var(--radius-xs)] px-2 font-mono text-xs font-medium"
    >
      <Link href={href} prefetch={false} scroll={false} aria-current={active ? "true" : undefined}>
        {label}
      </Link>
    </Button>
  );
  return (
    <div
      data-proto-toolbar
      className="border-b border-dashed border-border-default bg-muted-custom px-4 py-2 font-mono text-xs text-text-secondary"
    >
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="text-text-muted">試作 #319（サイトのUIではありません）</span>
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-text-muted">ページの型</span>
            {item("persona", "ペルソナ中心UI", layout === "persona", hrefOf({ layout: "persona" }))}
            {item("standard", "ふつうの/lesson", layout === "standard", hrefOf({ layout: "standard" }))}
          </div>
          {DIRECTION_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-text-muted">{group.label}</span>
              {group.keys.map((key) =>
                item(key, DIRECTIONS[key].label, key === dir, hrefOf({ dir: key })),
              )}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-text-muted">見る人</span>
            {item("guest", "未課金", !isMember, hrefOf({ member: false }))}
            {item("member", "会員", isMember, hrefOf({ member: true }))}
          </div>
        </div>
        <p className="font-sans text-text-muted">
          {dir === "now" ? "" : "AIの案・未決定："}
          {DIRECTIONS[dir].promise}
          {DIRECTIONS[dir].seoTitle && `／検索結果・タブに出る名前（seoTitle）：${DIRECTIONS[dir].seoTitle}`}
        </p>
        {dir === "r" && (
          <div className="flex flex-wrap items-center gap-1 font-sans">
            <span className="mr-1 text-text-muted">回のページ（試作）</span>
            {KAI.map((k) => (
              <Button
                key={k.n}
                asChild
                size="sm"
                variant="ghost"
                className="h-7 rounded-[var(--radius-xs)] px-2 text-xs font-medium"
              >
                <Link href={`/dev/ai-research-lesson/kai/${k.n}`} prefetch={false}>
                  {k.n === 0 ? "はじめに" : `回${k.n}`}
                </Link>
              </Button>
            ))}
          </div>
        )}
        {dir === "p4" && (
          <details>
            <summary className="cursor-pointer text-text-muted hover:text-text-primary">
              編集で足すカード（各動画のイントロの後）と、頼み方の置き場所
            </summary>
            <ul className="mt-2 flex max-w-[860px] flex-col gap-1.5 pb-2 font-sans leading-relaxed">
              {EDIT_CARDS.map((c) => (
                <li key={c.number}>
                  <span className="font-bold">
                    {c.number}【{c.kind}】
                  </span>
                  {c.card}
                  {c.extra && <span className="text-text-muted">／途中・最後：{c.extra}</span>}
                </li>
              ))}
              <li className="text-text-muted">
                頼み方の文（{PROMPTS.map((p) => p.where).join("・")}）は、ふつうの/lessonの「概要・目的」タブの下に仮で並べています。本番では各回の記事に置く想定です
              </li>
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

export default async function AiResearchLessonProtoPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; dir?: string; layout?: string }>;
}) {
  const { member, dir: dirParam, layout: layoutParam } = await searchParams;
  const layout: LayoutKey = layoutParam === "standard" ? "standard" : "persona";
  const isMember = member === "1";
  const dir: DirectionKey = DIRECTION_KEYS.includes(dirParam as DirectionKey)
    ? (dirParam as DirectionKey)
    : "q";

  return (
    <>
      <DirectionBar dir={dir} isMember={isMember} layout={layout} />
      {layout === "standard" ? (
        <LessonDetailClient
          lesson={buildStandardLesson(dir, isMember)}
          progress={0}
          questProgressMap={{}}
        />
      ) : (
        <PersonaLessonTopClient
          lesson={buildLesson(dir, isMember)}
          hasFullAccess={isMember}
          content={DIRECTIONS[dir].content}
        />
      )}
    </>
  );
}
