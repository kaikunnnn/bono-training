/**
 * data ＝ 「進行中の会員」表示用の進捗モック — #241
 *
 * 記事数は Sanity の実データから計算する。ここでは「どこまで終えたか」だけを決める。
 * - ステップ1: cursor-for-designers は全記事完了（Claude Code は未制作）
 * - ステップ2: aiui_beginner は半分まで、ai-ui-styling-beginner は 0
 * - ステップ3以降: 未着手
 */

import type { ProgressMock } from "./types";

export const aiUiDesignProgressMock: ProgressMock = {
  "cursor-for-designers": "all",
  aiui_beginner: "half",
  "ai-ui-styling-beginner": 0,
};
