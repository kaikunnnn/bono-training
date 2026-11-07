/**
 * #295「次の一歩のガイド」の試作データと純粋関数（server-only なし。テストと client copy から読める）
 *
 * 文言の出典: rebono/issues/279-E-A_解説記事_本文_正式版.md。書いていないことは足さない。
 * ページのステップ番号と記事のステップ番号は1つずれる（ページ3「UIの見た目」＝記事ステップ2、AI＝記事ステップ3）。
 */

import type { SanityReferenceContent, SanityRoadmapStep } from "@/types/sanity-roadmap";

/** Sanity の steps[]._key。AI は試作で足す */
export const AI_STEP_KEY = "dev-ai-step";
const AI_INSERT_AFTER_STEP_KEY = "step3";

/** 「最初の1本」の割り当て（仮）。キーはステップの _key */
export const FIRST_ONE_DEFS: Record<string, { kind: "guide" | "lesson"; slug: string }> = {
  step1: { kind: "guide", slug: "rdm-howtostart-roadmap" },
  step2: { kind: "lesson", slug: "figmabeginner" },
  step3: { kind: "lesson", slug: "tutorial-uivisual" },
  [AI_STEP_KEY]: { kind: "lesson", slug: "ai-ui-styling-beginner" },
  step4: { kind: "lesson", slug: "ui-architect-beginner" },
  step5: { kind: "lesson", slug: "ux-beginner-2" },
  step6: { kind: "lesson", slug: "portfolio" },
};

/** 記事ステップ3「BONOのレッスンで身につける」の順 */
export const AI_LESSON_SLUGS = [
  "ai-ui-styling-beginner",
  "aiui_beginner",
  "cursor-ui-ai-design",
  "claudecode-ui-ai-design",
] as const;

/** 記事ステップ1「BONOのレッスンで身につける」の4本。無料の本数の根拠 */
export const FIGMA_LESSON_SLUGS = ["figmabeginner", "figma-elementary", "uidesignbeginner", "uitrace"] as const;

/** ヒーローの「無料で始める」の行き先 */
export const FREE_START_LESSON_SLUG = "figmabeginner";

/** K の例示（固定データ。実ユーザーの進捗は読まない） */
export const MEMBER_EXAMPLE = {
  currentStepKey: "step3",
  lessonSlug: "tutorial-uivisual",
  completedArticles: 4,
  /** 記事ステップ2「出すアウトプット」そのまま */
  nextStepCriteria: [
    "1画面のUI：最低10画面。そのままポートフォリオに載せるものではなく、基礎を最低限身につけるための量です",
    "デザインが初めての人（おすすめ）：バナーとスライドを合わせて10個くらい、レスポンシブのLPかWebページを1枚",
    "外に出すもの：作った画面1枚ずつと、その狙い・直したところ",
  ],
} as const;

/** 画面に出す「最初の1本」 */
export interface FirstOneView {
  kind: "guide" | "lesson";
  title: string;
  href: string;
  imageUrl?: string;
  /** レッスンの本数と無料の本数（記事は持たない） */
  articleCount?: number;
  freeArticleCount?: number;
}

/**
 * ステップ3（UIの見た目）の次に AI のステップを差し込む。
 * ステップ番号・アンカー・ステップ数は配列の位置から決まるので、差し込むだけでずれる。
 * 差し込めないときは元の並びのまま返す（クラッシュしない。ログは出す）。
 */
export function withAiStep(steps: SanityRoadmapStep[], lessons: SanityReferenceContent[]): SanityRoadmapStep[] {
  const index = steps.findIndex((s) => s._key === AI_INSERT_AFTER_STEP_KEY);
  if (index === -1) {
    console.warn(`[dev/roadmap-career-patterns] ${AI_INSERT_AFTER_STEP_KEY} が無いため AI のステップを足しません`);
    return steps;
  }
  if (lessons.length === 0) {
    console.warn("[dev/roadmap-career-patterns] AI のレッスンが解決できないため AI のステップを足しません");
    return steps;
  }
  const aiStep: SanityRoadmapStep = {
    _key: AI_STEP_KEY,
    title: "AIデザインワークフローを習得",
    goals: ["コードで細かな操作まで再現し、UIの体験を検証して改善できる状態です。"],
    sections: [
      {
        _key: `${AI_STEP_KEY}-lessons`,
        title: "BONOのレッスンで身につける",
        description: "期間：約1.5ヶ月（試作で足したステップです）",
        contents: lessons,
      },
    ],
  };
  return [...steps.slice(0, index + 1), aiStep, ...steps.slice(index + 1)];
}
