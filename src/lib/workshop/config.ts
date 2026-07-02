/**
 * ワークショップページの構成定義。
 * ページタイトル・ステップ構成はここを編集する（Markdown側は step ID で紐付く）。
 */

export interface WorkshopStep {
  /** Markdown frontmatter の `step` と一致させるID */
  id: string;
  /** "STEP 1" のような小ラベル。null なら非表示 */
  label: string | null;
  title: string;
  description?: string;
}

export const WORKSHOP_META = {
  title: "AI×UIワークショップ",
  description:
    "AIを使ってユーザー理解するためのプロトタイピングを実践しよう。このページの資料に沿ってワークショップを進めます。",
  eyecatch: "/images/workshop/hero-eyecatch.svg",
};

export const WORKSHOP_STEPS: WorkshopStep[] = [
  {
    id: "intro",
    label: null,
    title: "得られること",
    description: "“探究フェーズ”でプロトタイピングを回す",
  },
  {
    id: "goal",
    label: null,
    title: "ワークショップのゴール",
  },
  {
    id: "step0",
    label: "STEP 0",
    title: "コーディングツールのセットアップ",
  },
  {
    id: "step1",
    label: "STEP 1",
    title: "ユーザーの仮説を立てる",
  },
  {
    id: "step2",
    label: "STEP 2",
    title: "アイデアの仮説をつくる",
  },
  {
    id: "step3",
    label: "STEP 3",
    title: "プロトタイピングでパターンを出す",
  },
  {
    id: "step4",
    label: "STEP 4",
    title: "プロトタイプを叩いて学習する",
  },
];
