/**
 * 数字改善チャレンジのドキュメント置き場（/docs/number-challenge）の構成定義。
 * 仕組みは /docs/workshop と共通（Markdown の frontmatter `step` / `order` で紐付く）。
 * 各記事は frontmatter の `number`（例: "1-1"）と `role`（例: "考え方"）で、タイトルの頭に番号と役割を付けて表示する。
 */

import type { WorkshopStep } from "@/lib/workshop/config";

export const NUMBER_CHALLENGE_BASE_PATH = "/docs/number-challenge";

export const NUMBER_CHALLENGE_BACK_LABEL = "チャレンジのトップに戻る";

export const NUMBER_CHALLENGE_META = {
  title: "数字改善チャレンジ",
  description:
    "BONOの数字をユーザーの体験として読み、体験を良くするUIの仮説とプロトタイプをつくるチャレンジ。参加者はいつでもこのページの資料を見ながら進めます。",
};

export const NUMBER_CHALLENGE_STEPS: WorkshopStep[] = [
  {
    id: "step0",
    label: "STEP 0",
    title: "はじめに",
  },
  {
    id: "step1",
    label: "STEP 1",
    title: "数字の改善仮説を立てる",
  },
  {
    id: "step2",
    label: "STEP 2",
    title: "実際の数字を見て、問題の仮説を立てる",
  },
  {
    id: "step3",
    label: "STEP 3",
    title: "問題点に対してプロトタイピングする",
  },
];
