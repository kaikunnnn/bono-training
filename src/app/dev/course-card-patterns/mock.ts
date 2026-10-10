/**
 * コースカード比較用のモック（#235）
 *
 * kari: true の項目は Figma に無く、比較のために仮で作った文言。
 * 画面上では「仮」タグを付けて区別する。
 */

export interface MockField {
  text: string;
  kari?: boolean;
}

export interface MockCourse {
  id: string;
  /** サムネ左上のラベル */
  thumbLabel: string;
  title: MockField;
  /** A: 説明文 */
  description: MockField;
  /** A のメタ「得られる変化」/ C の「このコースで」 */
  change: MockField;
  /** B: 1行の変化 */
  oneLiner: MockField;
  /** C: 不安 */
  anxiety: MockField;
  period: MockField;
  deliverable: MockField;
  author: MockField;
  price: MockField;
}

export const MOCK_COURSES: MockCourse[] = [
  {
    id: "ai",
    thumbLabel: "AIコース",
    title: { text: "AI×UIデザインプロトタイピングコース" },
    description: {
      text: "Claude Code などのコーディングエージェントを使った UI デザインのプロセスを習得するコースです。課題解決のデザインフローに沿って、AI の使い方を習得することができます。",
    },
    change: { text: "AIを用いたUIデザインのワークフローの習得" },
    oneLiner: { text: "AIを用いたUIデザインのワークフローを習得するトレーニング" },
    anxiety: {
      text: "AIで画面は作れても、それが良いUIなのか自分で判断できない",
      kari: true,
    },
    period: { text: "2-3ヶ月" },
    deliverable: { text: "ブラウザで動く「出勤管理」SaaS" },
    author: { text: "カイクン" },
    price: { text: "¥5,980〜/月" },
  },
  {
    id: "styling",
    thumbLabel: "段階1",
    title: { text: "UIスタイリング基礎コース", kari: true },
    description: {
      text: "配置・余白・文字・色・パーツの5つの要素を、お手本のUIを分解して作り直しながら1つずつ押さえるコースです。見た目の基本と、コンテンツとボタンの関係（構造）を手を動かして身につけます。",
      kari: true,
    },
    change: { text: "見た目を作る5つの要素で、1画面のUIを迷わず整えられるようになる", kari: true },
    oneLiner: {
      text: "見た目を作る5つの要素で、1画面のUIを整えられるようになるトレーニング",
      kari: true,
    },
    anxiety: { text: "UIを作る時の「全体像」がわからず、なんとなくの理解のままで不安" },
    period: { text: "約1ヶ月", kari: true },
    deliverable: { text: "お手本トレース5画面＋自分で作る1画面", kari: true },
    author: { text: "カイクン", kari: true },
    price: { text: "¥5,980〜/月" },
  },
];

/** トップ（横3枚）確認用の3つ目のコース。中身はすべて推測（価格のみ共通） */
export const THIRD_COURSE: MockCourse = {
  id: "ia",
  thumbLabel: "段階2",
  title: { text: "UI情報設計の基礎コース", kari: true },
  description: {
    text: "画面に載せる情報を洗い出し、優先順位をつけて、一覧と詳細にどう分けるかを決めるコースです。見た目を作る前の「何をどこに置くか」を、実際のサービスを題材に組み立てます。",
    kari: true,
  },
  change: { text: "ユーザーの目的から、画面に載せる情報と並び順を自分で決められるようになる", kari: true },
  oneLiner: {
    text: "画面に載せる情報と並び順を、ユーザーの目的から決められるようになるトレーニング",
    kari: true,
  },
  anxiety: { text: "見た目は整えられるようになったのに、画面の構成を一から考えると手が止まる", kari: true },
  period: { text: "約1.5ヶ月", kari: true },
  deliverable: { text: "予約アプリの一覧・詳細・登録の3画面", kari: true },
  author: { text: "カイクン", kari: true },
  price: { text: "¥5,980〜/月" },
};

/** トップに並べる3コース */
export const TOP_COURSES: MockCourse[] = [...MOCK_COURSES, THIRD_COURSE];
