/**
 * data ＝ 未経験から転職ロードマップ v3「区切りごとにポートフォリオが育つ」— #243
 *
 * 中身の根拠は rebono/issues/243-A_未経験転職ロードマップの中身.md（BONO の既存記事・Sanity データから組み立て）。
 * 文言はすべて仮（kari）。画像は WorkMockKind で描く仮の枠（実画像は outputs.png と記事サムネイルだけ）。
 *
 * 区切りごとに「ポートフォリオに足されるもの」を PORTFOLIO_PIECES の addedAt で持つ。
 * 地図・区切り・最後の完成イメージは、すべてこの1つの並びから描くので数が食い違わない。
 */

import type { Field } from "./types";

const k = (text: string): Field => ({ text, kari: true });

/** 仮の作品画像の種類（template 側の WorkMock が描く） */
export type WorkMockKind =
  | "todo-annotated"
  | "trace3"
  | "dailyui-before-after"
  | "dailyui-grid"
  | "flow-app"
  | "flow-saas"
  | "case-study"
  | "portfolio-top"
  | "apply-list"
  | "proposal";

/** ポートフォリオに入るもの（作品・記録）。addedAt = どの区切りで入るか（0 始まり） */
export interface PortfolioPiece {
  id: string;
  label: string;
  sub: Field;
  mock: WorkMockKind;
  addedAt: number;
  /** 代表作かどうか（完成時の「代表作3つ」を数える） */
  featured: boolean;
}

export interface V3Link {
  label: string;
  href: string;
  /** 実在の画像（記事のサムネイルなど）があれば */
  image?: string;
}

export interface V3Stage {
  /** 短い呼び名（地図用） */
  short: string;
  /** 見出し（コース名など） */
  title: string;
  kind: "course" | "outside";
  /** コースのとき: v2 コースページへの slug */
  courseSlug?: string;
  period: Field;
  /** なぜ今これか（2〜3行） */
  why: Field;
  goal: { line: Field; mock: WorkMockKind; caption: string };
  make: { items: Field[]; mock: WorkMockKind; caption: string };
  /** ポートフォリオに足されるもの（1行）と、記録しておくこと */
  adds: { line: Field; record: Field[] };
  checkpoint: Field;
  links: V3Link[];
}

export const PORTFOLIO_PIECES: PortfolioPiece[] = [
  { id: "log", label: "練習の記録", sub: k("トレース3サービス・作成日つき"), mock: "trace3", addedAt: 0, featured: false },
  { id: "visual", label: "代表作① ビジュアル", sub: k("Daily UI から3画面"), mock: "dailyui-grid", addedAt: 1, featured: true },
  { id: "app", label: "代表作② アプリ", sub: k("家計簿アプリの流れ"), mock: "flow-app", addedAt: 2, featured: true },
  { id: "saas", label: "代表作③ SaaS", sub: k("予約管理の流れ"), mock: "flow-saas", addedAt: 2, featured: true },
  { id: "proposal", label: "応募先への改善案", sub: k("いちばん入りたい1社に1枚"), mock: "proposal", addedAt: 4, featured: false },
];

/** 説明ページがつく区切り（ポートフォリオ） */
export const EXPLAIN_AT = 3;

const PORTFOLIO_LESSON_IMG =
  "https://cdn.prod.website-files.com/6029d01deccd0a2530d2d878/63eb78e3e05074781df053e1_thumnail_portfolio03.webp";
const PORTFOLIO_01_IMG =
  "https://cdn.prod.website-files.com/6029d01deccd0a2530d2d878/63eb75d1c831c656a2890e65_thumnail_portfolio.webp";

export const careerChangeV3 = {
  slug: "career-change",
  name: "未経験から転職",
  audience: k("デザインの仕事はしたことがなく、働きながらUIデザイナーを目指す人"),
  destination: k("代表作3つと練習の記録が入ったポートフォリオを持って、UIデザイナーの求人に応募している"),
  period: k("週12時間で約9ヶ月"),
  /** ?progress=1 のモック: 終えた区切りの数 */
  progressDone: 1,
  stages: [
    {
      short: "はじめて",
      title: "はじめてのUIデザイン入門コース",
      kind: "course",
      courseSlug: "ui-design-first",
      period: k("1〜2ヶ月"),
      why: k(
        "Figmaを開いても何から置けばいいか分からないうちは、見た目や流れを学んでも手が動きません。まず真似して1画面をつくりきり、画面を構造と部品に分けて見られるようにします。"
      ),
      goal: { line: k("見本を見ずに、ログイン画面を1枚つくれる"), mock: "todo-annotated", caption: "Todoアプリの一覧を、構造と部品に分けて組み立てる" },
      make: {
        items: [k("よく使うアプリ3つのトレースと、気づいた決まりのメモ"), k("Todoアプリなど、身近な題材の画面10個")],
        mock: "trace3",
        caption: "3つのアプリをトレースし、余白の数字を書き込む",
      },
      adds: {
        line: k("練習の記録（トレース3サービス）。うまくできていなくても、作成日をつけて残します"),
        record: [k("何を真似て、どんな決まりに気づいたか（1サービス3行）"), k("月に1回の学習ログ")],
      },
      checkpoint: k("見本を見ずに、ログイン画面を1枚Figmaでつくれる"),
      links: [],
    },
    {
      short: "基礎",
      title: "UIデザイン基礎コース",
      kind: "course",
      courseSlug: "ui-design-visual",
      period: k("1〜2ヶ月"),
      why: k(
        "画面は組めても、どこか素人っぽく見える段階です。余白・文字・色のどこが効いているかが分かると、自分で直せます。採用では見た目の基礎が書類選考の足切りになります。"
      ),
      goal: { line: k("お題から、見た目まで整った画面を1〜2時間でつくれる"), mock: "dailyui-before-after", caption: "同じお題の1日目と10日目" },
      make: {
        items: [k("Daily UI のお題10個（サインアップ、設定、料金表など）"), k("画面ごとの振り返りメモ")],
        mock: "dailyui-grid",
        caption: "10個のお題を1日1つずつ",
      },
      adds: {
        line: k("代表作① ビジュアル。10個から3画面を選んで1作品にします"),
        record: [k("各画面で気を配った要素と、直したところ"), k("1日目と10日目で何が変わったか")],
      },
      checkpoint: k("好きなアプリの画面を1枚選び、余白と文字の決まりを書き出せる"),
      links: [],
    },
    {
      short: "体験",
      title: "UI体験デザイン基礎コース",
      kind: "course",
      courseSlug: "ui-experience",
      period: k("1〜2ヶ月"),
      why: k(
        "1枚ずつはきれいでも、登録して、探して、直して、戻る流れをつなぐと手が止まります。採用で見られるのは1画面ではなく、複数の画面にまたがるUIです。"
      ),
      goal: { line: k("一覧→詳細→編集を遷移でつなぎ、触って確かめられる"), mock: "flow-app", caption: "家計簿アプリの一覧から編集まで" },
      make: {
        items: [
          k("アプリ1つ（例: 家計簿）とSaaS 1つ（例: 予約管理）の主要画面"),
          k("画面遷移図と、ナビゲーションを選んだ理由のメモ"),
        ],
        mock: "flow-saas",
        caption: "予約管理SaaSの一覧と詳細",
      },
      adds: {
        line: k("代表作② アプリ、代表作③ SaaS。どちらも触れるプロトタイプつき"),
        record: [k("画面遷移図、ラフと没案（あとで説明ページに使う）"), k("ナビゲーションをその形にした理由")],
      },
      checkpoint: k("一覧から詳細、編集までの流れをプロトタイプで動かせる"),
      links: [],
    },
    {
      short: "ポートフォリオ",
      title: "ポートフォリオにまとめる",
      kind: "outside",
      period: k("約1ヶ月"),
      why: k(
        "作品がそろっても、画像を並べるだけでは「自分の頭で考えたか」が伝わりません。採用する側が見たいのは、何をつくり、なぜその形にしたかです。"
      ),
      goal: {
        line: k("代表作3つが「概要→結論→プロセス→終わりに」の順で読める"),
        mock: "case-study",
        caption: "作品ごとの説明ページ",
      },
      make: {
        items: [
          k("作品ごとの説明ページ3つと、トップページ"),
          k("アプリの作品は、使いそうな人に1人話を聞いて直す"),
          k("仕上げる前に15分フィードバックで見てもらう"),
        ],
        mock: "portfolio-top",
        caption: "トップは 代表作 → 練習の記録 → 学習ログ → 自己紹介 の順",
      },
      adds: {
        line: k("3つの代表作に、説明ページがつきます"),
        record: [
          k("概要: タイトル、担当範囲、制作時期"),
          k("結論: 何をつくり、何を解決したか"),
          k("プロセス: ラフ、没案、話を聞いたメモ"),
          k("終わりに: 結果と反省"),
        ],
      },
      checkpoint: k("フィードバックの指摘を直し、代表作3つを人に見せられる形にしている"),
      links: [
        { label: "ポートフォリオの作り方", href: "/lessons/portfolio", image: PORTFOLIO_LESSON_IMG },
        { label: "メンバーのアウトプット", href: "/outputs" },
        { label: "15分フィードバック", href: "/how-to/feedback" },
      ],
    },
    {
      short: "転職活動",
      title: "転職活動",
      kind: "outside",
      period: k("1〜2ヶ月"),
      why: k(
        "入りたい会社によって、見たい作品は変わります。PCで使う業務サービスの会社なら、スマホの作品だけでは評価されにくくなります。1社で採用まで約1ヶ月かかります。"
      ),
      goal: { line: k("5社を選び、会社ごとに作品の並びを変えて書類を出している"), mock: "apply-list", caption: "応募先5社と、先頭に置く作品" },
      make: {
        items: [
          k("会社ごとの調べメモ（事業、使う人、どんな画面のサービスか）"),
          k("いちばん入りたい1社には、サービスの課題とUIの改善案を1枚"),
        ],
        mock: "proposal",
        caption: "応募先のサービスの改善案1枚",
      },
      adds: {
        line: k("応募先への改善案1枚と、会社ごとの並べ方"),
        record: [k("面接で聞かれたこと、答えに詰まったこと"), k("詰まったところは説明ページに戻して直す")],
      },
      checkpoint: k("5社に書類を出し、1作品を3分で説明できる"),
      links: [
        { label: "UIUXデザイナー転職ガイド", href: "https://kaikun.bo-no.design/career/beginner", image: PORTFOLIO_01_IMG },
        { label: "転職の相談ができるイベント", href: "/events" },
      ],
    },
  ] satisfies V3Stage[],
  faq: [
    {
      question: k("ポートフォリオはいつから作り始める？"),
      answer: k("最初のコースからです。区切りごとに1つずつ足していくので、最後にまとめて作る必要はありません。"),
    },
    {
      question: k("代表作は3つで足りる？"),
      answer: k("最低3つが目安です。1つだけだと「たまたまかも」と思われやすくなります。足りない分は練習の記録で補えます。"),
    },
    {
      question: k("順番を飛ばしてもいい？"),
      answer: k("前の区切りでつくったものを次で使うので、順に進めるのがおすすめです。区切りの目安ができていれば、先へ進んで構いません。"),
    },
  ],
};

export type CareerChangeV3 = typeof careerChangeV3;
