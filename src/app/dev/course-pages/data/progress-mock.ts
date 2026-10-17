/**
 * data ＝ 「進行中の会員」表示用の進捗モック — #241
 *
 * 記事数は Sanity の実データから計算する。ここでは「どこまで終えたか」だけを決める。
 * - ステップ1: cursor-for-designers は全記事完了（Claude Code は未制作）
 * - ステップ2: aiui_beginner は半分まで、ai-ui-styling-beginner は 0
 * - ステップ3以降: 未着手
 * ほかのコースは各モックのコメント参照。
 */

import type { ProgressMock } from "./types";

export const aiUiDesignProgressMock: ProgressMock = {
  "cursor-for-designers": "all",
  aiui_beginner: "half",
  "ai-ui-styling-beginner": 0,
};

/** はじめて: 1本目を完了、2本目の途中 */
export const uiDesignFirstProgressMock: ProgressMock = {
  "tutorial-uivisual": "all",
  "three-structures-ui-design": 3,
};

/** 基礎（見た目）: 1本目を完了、2本目の途中 */
export const uiDesignVisualProgressMock: ProgressMock = {
  "steel-design-sense": "all",
  "ui-design-flow-lv1": 9,
};

/** 体験: 唯一の既存レッスン（ナビゲーション）の途中 */
export const uiExperienceProgressMock: ProgressMock = {
  "navigation-basics": 3,
};
