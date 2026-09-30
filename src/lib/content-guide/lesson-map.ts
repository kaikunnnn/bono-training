/**
 * コンテンツガイド（診断）: スキル状態ごとの該当レッスン。
 *
 * 出典: rebono `02_Projects/15_コンテンツガイド/07_スキル状態別_該当レッスン対応表_下書き.md`
 * 2026-09-29 時点のスナップショット（Sanity は読まない）。レッスン名・記事数・備考は 07 の表のまま。
 * 行の順番も 07 のまま（各状態の先頭 = 入口の候補）。
 *
 * 「何を作るか（課題の中身）」は持たない。
 * 07 のレッスン単位の備考「会員限定が多い」は、記事数から isMemberHeavy() で算出して表示するため、note には持たない。
 */

import type { SkillStateId } from "./skill-states";

/** 対応度: ◎近い教材がある／○一部当てはまる／△近いものだけ／×ない */
export type Coverage = "◎" | "○" | "△" | "×";

export interface GuideLesson {
  /** `/lessons/{slug}` */
  slug: string;
  title: string;
  /** 会員限定でない記事の数（未ログインでも見られる範囲） */
  freeCount: number;
  /** 全記事数 */
  totalCount: number;
  /** 07 の備考（どの章が当てはまるか等） */
  note?: string;
}

export interface StateLessons {
  coverage: Coverage;
  lessons: readonly GuideLesson[];
  /** 07 の状態ごとの備考 */
  note?: string;
}

// 複数の状態で使うレッスン（記事数は 07 の表で共通）
const L = {
  tutorialUivisual: { slug: "tutorial-uivisual", title: "ゼロからはじめるUIビジュアル", freeCount: 4, totalCount: 11 },
  uiTypography: { slug: "ui-typography", title: "UIタイポグラフィ入門", freeCount: 5, totalCount: 7 },
  uivisual: { slug: "uivisual", title: "UIビジュアル基礎", freeCount: 7, totalCount: 37 },
  steelDesignSense: { slug: "steel-design-sense", title: "センスを盗む技術", freeCount: 2, totalCount: 7 },
  threeStructures: { slug: "three-structures-ui-design", title: "「3構造」ではじめるUIデザイン入門", freeCount: 4, totalCount: 7 },
  graphicBeginner: { slug: "graphicbeginner", title: "グラフィック入門", freeCount: 3, totalCount: 9 },
  materialDesign: { slug: "materialdesign-for-funiordesigner", title: "今日から使える\"Material Design\"", freeCount: 4, totalCount: 8 },
  materialRindoku: { slug: "materialdesign-rindokukai", title: "UIの教科書 - マテリアルデザイン", freeCount: 2, totalCount: 9 },
  aiUiStyling: { slug: "ai-ui-styling-beginner", title: "AIでUIスタイリング入門", freeCount: 3, totalCount: 14 },
  figmaElementary: { slug: "figma-elementary", title: "Figmaの使い方初級", freeCount: 8, totalCount: 8 },
  figmaBeginner: { slug: "figmabeginner", title: "Figmaの使い方入門", freeCount: 20, totalCount: 21 },
  uiDesignBeginner: { slug: "uidesignbeginner", title: "はじめてのUIデザイン", freeCount: 11, totalCount: 11 },
  uiTrace: { slug: "uitrace", title: "UIトレース入門", freeCount: 1, totalCount: 1 },
  designCycle: { slug: "ui-design-flow-lv1", title: "UIが上手くなる人の“デザインサイクル” ─ 入門編β", freeCount: 11, totalCount: 23 },
  uxBiginner: { slug: "ux-biginner", title: "はじめてのUXデザイン", freeCount: 4, totalCount: 13 },
  cursor: { slug: "cursor-for-designers", title: "デザイナーのためのCursor入門", freeCount: 1, totalCount: 1 },
  aiuiBeginner: { slug: "aiui_beginner", title: "AI×UIリサーチ&プロトタイプ” ─ 入門編", freeCount: 7, totalCount: 7 },
  codeAndDesign: { slug: "codeanddesign", title: "実装とデザインの関係超入門", freeCount: 2, totalCount: 12 },
  uiLayoutBasic: { slug: "ui-layout-basic", title: "使いやすいUIの秘密", freeCount: 13, totalCount: 24 },
  navigationBasics: { slug: "navigation-basics", title: "ナビゲーションUIの基本", freeCount: 2, totalCount: 7 },
  uiDesignFlow: { slug: "uidesignflow", title: "UIデザインの基本", freeCount: 6, totalCount: 15 },
  uiIdea: { slug: "uiidea", title: "UIアイデア入門", freeCount: 5, totalCount: 12 },
  uiPattern: { slug: "ui-pattern", title: "UI PATTERN 入門", freeCount: 7, totalCount: 23 },
  chintai: { slug: "weeklyui-baseui-chintai", title: "賃貸アプリで基本UIトレーニング", freeCount: 4, totalCount: 4 },
  uiArchitectBeginner: { slug: "ui-architect-beginner", title: "ゼロからはじめるUI情報設計", freeCount: 11, totalCount: 27 },
  ooui: { slug: "ooui", title: "OOUI コンテンツ中心のUI設計", freeCount: 2, totalCount: 13 },
  businessTrip: { slug: "uiflowchallenge-businesstripsoftwear", title: "出張申請ソフトをデザインしよう", freeCount: 2, totalCount: 2 },
  cxBasic: { slug: "uxdezaintohahe-ka-copy", title: "顧客体験デザインの基本", freeCount: 1, totalCount: 8 },
  designYourOwnService: { slug: "designyourownservice", title: "ゼロからサービスをデザインしよう", freeCount: 2, totalCount: 14 },
  personaBased: { slug: "persona-based-design", title: "ペルソナ中心のUIデザイン", freeCount: 8, totalCount: 26 },
  inhousePlus: { slug: "inhouseplus-uikaizen", title: "顧客中心の商品ページ改善", freeCount: 1, totalCount: 5 },
  uxBeginner2: { slug: "ux-beginner-2", title: "UXデザインってなに？", freeCount: 5, totalCount: 5 },
  userInterview: { slug: "zerokara-userinterview", title: "ゼロからはじめるユーザーインタビュー", freeCount: 0, totalCount: 5 },
  failurePoint: { slug: "failurepoint", title: "FAILURE POINT 課題発見の方法", freeCount: 3, totalCount: 16 },
  portfolio: { slug: "portfolio", title: "ポートフォリオの作り方", freeCount: 2, totalCount: 7 },
  career: { slug: "dezainanokiyaria", title: "キャリア相談まとめ", freeCount: 4, totalCount: 32 },
  wayOfUiux: { slug: "wayofuiuxdesigner", title: "UIUXデザイナーになる条件", freeCount: 12, totalCount: 12 },
  dailyUi: { slug: "dailyui-part01", title: "DailyUI 音声SNS", freeCount: 9, totalCount: 15 },
  rookies: { slug: "rookiesaction", title: "UIデザイナー1年目の立ち回り", freeCount: 5, totalCount: 10 },
} satisfies Record<string, GuideLesson>;

export const LESSON_MAP: Record<SkillStateId, StateLessons> = {
  S1: {
    coverage: "◎",
    note: "入口は「ゼロからはじめるUIビジュアル」",
    lessons: [
      L.tutorialUivisual,
      L.uiTypography,
      L.uivisual,
      L.steelDesignSense,
      L.threeStructures,
      L.graphicBeginner,
    ],
  },
  S2: {
    coverage: "△",
    note: "専用の教材は見当たらない",
    lessons: [
      L.materialDesign,
      L.materialRindoku,
      { ...L.aiUiStyling, note: "「トークン抽出」「デザインシステムの土台」の章" },
      { ...L.figmaElementary, note: "コンポーネントの章" },
    ],
  },
  S3: {
    coverage: "◎",
    note: "ほぼ全て無料",
    lessons: [L.figmaBeginner, L.figmaElementary, L.uiDesignBeginner, L.uiTrace],
  },
  S4: {
    coverage: "○",
    note: "専用レッスンではなく、各レッスンの一部",
    lessons: [
      { ...L.figmaBeginner, note: "「プロトタイピング機能 解説」" },
      { ...L.designCycle, note: "「プロトタイピング」の章" },
      { ...L.uxBiginner, note: "「プロトタイピング作成のコツ」" },
    ],
  },
  S5: {
    coverage: "△",
    note: "実装まで通す教材は見当たらない",
    lessons: [L.cursor, L.aiuiBeginner, L.codeAndDesign],
  },
  S6: {
    coverage: "◎",
    lessons: [
      L.uiLayoutBasic,
      L.navigationBasics,
      L.uiDesignFlow,
      L.uiIdea,
      L.uiPattern,
      { ...L.chintai, note: "全て無料の実践お題" },
    ],
  },
  S7: {
    coverage: "◎",
    lessons: [
      { ...L.uiArchitectBeginner, note: "要件の把握・UIの要件定義の章" },
      L.ooui,
      { ...L.businessTrip, note: "全て無料の実践お題" },
      L.uiLayoutBasic,
    ],
  },
  S8: {
    coverage: "○",
    note: "会員限定が多い",
    lessons: [
      { ...L.cxBasic, note: "ゴールダイレクテッドデザイン" },
      L.uxBiginner,
      L.designYourOwnService,
      L.personaBased,
      L.inhousePlus,
    ],
  },
  S9: {
    coverage: "◎",
    lessons: [
      { ...L.uxBeginner2, note: "入口。全て無料" },
      { ...L.userInterview, note: "全て会員限定" },
      L.failurePoint,
      { ...L.uxBiginner, note: "「リアルな顧客の情報を知ろう」の章" },
    ],
  },
  S10: {
    coverage: "○",
    note: "会員限定が多い",
    lessons: [
      { ...L.uxBiginner, note: "インタビュー→反映→プロトタイプの流れ" },
      { ...L.designYourOwnService, note: "ゴール・行動・課題・解決策の各ステップ" },
      L.cxBasic,
    ],
  },
  S11: {
    coverage: "◎",
    lessons: [
      { ...L.designCycle, note: "「評価／計画」の章" },
      { ...L.tutorialUivisual, note: "「質上げ」の章" },
      { ...L.uiArchitectBeginner, note: "「1.0を壊して自分で改善」の章" },
    ],
  },
  S12: {
    coverage: "×",
    note: "見当たらない（BONOラジオでABテストの話がある程度）",
    lessons: [],
  },
  S13: {
    coverage: "×",
    note: "専用の教材は見当たらない。近いのは、理由を解説している記事のみ",
    lessons: [
      { ...L.designCycle, note: "「リサーチはなぜ〜」の理由の解説" },
      { ...L.uiLayoutBasic, note: "「NGなUIをふつうにする理由」" },
    ],
  },
  S14: {
    coverage: "○",
    note: "作る場はトレーニング（お題12本、全て無料）",
    lessons: [L.portfolio, { ...L.career, note: "事例" }, L.wayOfUiux, L.dailyUi],
  },
  S15: {
    coverage: "△",
    note: "専用の教材は見当たらない",
    lessons: [
      { ...L.failurePoint, note: "「なぜあなたの提案は却下されるのか？」" },
      { ...L.uxBiginner, note: "「提案できるデザイナーになるスキル」" },
      { ...L.ooui, note: "「プレゼン」の章" },
      L.rookies,
    ],
  },
  S16: {
    coverage: "○",
    lessons: [L.aiuiBeginner, L.aiUiStyling],
  },
  S17: {
    coverage: "○",
    lessons: [
      { ...L.uxBeginner2, note: "全て無料" },
      L.uiLayoutBasic,
      L.uiDesignFlow,
      L.threeStructures,
      L.codeAndDesign,
    ],
  },
  S18: {
    coverage: "△",
    note: "会員限定が多い",
    lessons: [L.designYourOwnService, L.cxBasic, L.inhousePlus],
  },
};

/**
 * 「会員限定が多い」の判定しきい値。無料記事の割合がこれ未満なら、
 * 未ログインでは続きが見られない部分が大きいレッスンとして注記する。
 * 11_UI改善仕様書 §2C / 独立レビュー 中1: 「無料が3分の1未満」に絞る（0.5 は入口レッスンにまで付き広すぎた）。
 * 07 で「会員限定が多い」と明記された UIビジュアル基礎 7/37・UI PATTERN 7/23・AIでUIスタイリング 3/14 は該当する。
 */
export const MEMBER_HEAVY_FREE_RATIO = 1 / 3;

export function isMemberHeavy(lesson: Pick<GuideLesson, "freeCount" | "totalCount">): boolean {
  if (lesson.totalCount <= 0) return false;
  return lesson.freeCount / lesson.totalCount < MEMBER_HEAVY_FREE_RATIO;
}

/** 無料記事が1本以上ある（未ログインでもすぐ始められる） */
export function canStartFree(lesson: Pick<GuideLesson, "freeCount">): boolean {
  return lesson.freeCount > 0;
}

/**
 * 結果画面での並び。07 の順（先頭=入口）を保ったまま、
 * 無料で始められないレッスン（無料0本）だけ後ろに回す（安定ソート）。
 */
export function orderLessonsForResult(lessons: readonly GuideLesson[]): GuideLesson[] {
  return [...lessons.filter(canStartFree), ...lessons.filter((l) => !canStartFree(l))];
}

/** 対応度が × の状態（ぴったりの教材が準備中） */
export function isCoverageMissing(stateId: SkillStateId): boolean {
  return LESSON_MAP[stateId].coverage === "×";
}
