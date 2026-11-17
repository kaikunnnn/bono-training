/**
 * data v3: UI情報設計（元: ロードマップ information-architecture「情報設計でユーザー中心のUI設計をはじめるロードマップ」）— #300
 *
 * 章＝ロードマップのステップ。章タイトルと why（ステップの goals）は Sanity 本番の文言そのまま。
 * レッスンと順番もロードマップと同じ。それ以外の文言は推測で書いた仮の文（kari）。
 */

import type { NameVariant, CourseV3Entry } from "./types";
import { AUTHOR, NOT_FOR_QUESTION, PERIOD, careerChangeV3Path, fixed, k } from "./shared";

const names: Record<"a" | "b", NameVariant> = {
  a: {
    title: fixed("UI情報設計入門コース：使いやすい画面の組み立て方"),
    audienceLine: k("見た目は整えられるが、どこに何を置くかを理由をもって決められない人向け"),
    change: k(
      "目的とユーザーから画面を組み立てる型と、レイアウト・ナビゲーション・OOUIの基本が身につき、その結果、要件のある管理画面を使いやすい流れで設計できる"
    ),
    cardLine: k("目的とユーザーから、どこに何を置くかを決めて画面を組み立てられるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaで画面をまだつくったことがない人は、先に「Figma入門コース」から進めるのがおすすめです。ユーザーに話を聞いて課題を見つけるところから始めたい人には「UXデザイン入門コース」が合っています。"
      ),
    },
  },
  b: {
    title: fixed("非デザイナーのための使いやすいUIの設計"),
    audienceLine: k("デザインの仕事をしたことがなく、画面の配置をなんとなく決めてしまう人向け"),
    change: k(
      "感覚に頼らず、目的とユーザーから「どこに何をなぜ置くか」を決める方法が身につき、その結果、デザインの経験がなくても使いやすい画面の構成を理由つきでつくれる"
    ),
    cardLine: k("感覚に頼らず、どこに何をなぜ置くかを決めて画面をつくれるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaにまだ触ったことがない人は、先に「非デザイナーのためのFigma入門」から進めるのがおすすめです。見た目を整えるところから始めたい人には「非デザイナーのためのUIの見た目のきほん」が合っています。"
      ),
    },
  },
};

export const informationArchitectureV3: CourseV3Entry = {
  roadmapSlug: "information-architecture",
  names,
  base: {
    slug: "information-architecture",
    title: names.a.title,
    shortTitle: fixed("UI情報設計"),
    tagline: k(
      "「どこに何をなぜ置くか」を、目的とユーザーから決める情報設計の型をトレースで身につけます。レイアウト・ナビゲーション・OOUIの基本を押さえ、最後に出張申請ソフトの画面を要件に沿って設計します。"
    ),
    change: names.a.change,
    period: PERIOD,
    deliverable: k("要件を満たす出張申請ソフトの管理画面のデザイン"),

    changeRows: [
      {
        before: k("画面の配置を、見本に似せてなんとなく決めている"),
        after: k("目的とユーザーから、どこに何を置くかを理由つきで決められる"),
      },
      {
        before: k("画面が増えると、どこから何に移動するのかがごちゃつく"),
        after: k("ナビゲーションの基本パターンを使って、迷わない移動を設計できる"),
      },
      {
        before: k("機能ごとに画面を分けてしまい、操作の手順が長くなる"),
        after: k("扱うもの（オブジェクト）を中心に、画面と操作を整理できる"),
      },
    ],

    finalGoal: k("目的とユーザーに合わせて、要件のある画面を使いやすい流れで設計しきれる"),

    steps: [
      {
        kind: "goal",
        title: fixed("情報設計の\"進め方の型\"を習得"),
        why: fixed("目的とユーザーを起点に、UI体験を組み立てる基礎を身につけよう"),
        gain: k("目的とユーザーから、画面に置くものと置き方を決められる"),
        items: [{ type: "lesson", slug: "ui-architect-beginner" }],
      },
      {
        kind: "goal",
        title: fixed("UI操作デザインの必須要素を習得"),
        why: fixed("意味を体験に反映するために必須なUI概念の基礎を身につけよう"),
        gain: k("レイアウト・ナビゲーションの基本パターンと、オブジェクトを中心にした画面の組み立て方を使える"),
        items: [
          { type: "lesson", slug: "ui-layout-basic" },
          { type: "lesson", slug: "navigation-basics" },
          { type: "lesson", slug: "ooui" },
        ],
      },
      {
        kind: "challenge",
        title: fixed("実践お題で使いやすいUI体験をデザインしよう"),
        why: fixed("習得したことを使って目的とユーザーに合致するUI体験をつくりあげよう"),
        gain: k("要件を満たす管理画面を、情報設計の型を使って設計できる"),
        items: [{ type: "lesson", slug: "uiflowchallenge-businesstripsoftwear" }],
        brief: {
          description: k("出張申請ソフトの要件を読み、使う人の目的に合った管理画面を設計します。"),
          deliverables: [k("出張申請ソフトの管理画面（Figma）"), k("どこに何をなぜ置いたかの説明メモ")],
        },
      },
    ],

    output: {
      lead: k(
        "最後の章で、出張申請ソフトの管理画面を設計します。画面ごとに「どこに何をなぜ置いたか」を言葉にするので、ポートフォリオで設計の過程を説明する材料になります。"
      ),
      points: [
        k("出張申請ソフトの管理画面"),
        k("画面の構成と移動の流れ"),
        k("配置の理由を書いたメモ"),
      ],
      samples: ["一覧", "申請", "承認"],
    },

    audience: [
      {
        title: k("見た目は整えられるが、画面の構成に自信がない人"),
        body: k("目的とユーザーから、画面に置くものと順番を決める型を、トレースしながら身につけます。"),
      },
      {
        title: k("画面が増えると、ナビゲーションや移動がごちゃつく人"),
        body: k("レイアウトとナビゲーションの基本パターンを、悪いUIを直しながら覚えます。"),
      },
      {
        title: k("デザインの意図を、人に説明するのが苦手な人"),
        body: k("配置の理由を目的とユーザーから説明する型を身につけます。レビューやポートフォリオで話す材料になります。"),
      },
    ],

    author: AUTHOR,

    faq: [
      {
        question: k("見た目のコースを終えてからのほうがいいですか？"),
        answer: k(
          "Figmaで画面をつくれれば、こちらから始めても進められます。見た目の整え方にも不安があるなら、UIビジュアルのコースから進めるとスムーズです。"
        ),
      },
      {
        question: k("OOUIは難しくないですか？"),
        answer: k(
          "1章と2章の前半で、画面の構成とナビゲーションの基本を押さえてからOOUIに進みます。順番に進めれば手が止まりにくい並びにしています。"
        ),
      },
      {
        question: k("最後のお題はどれくらいの量ですか？"),
        answer: k("要件を読み、主要な管理画面を設計します。1〜2週間かけて取り組むのが目安です。"),
      },
    ],

    v2: {
      audienceLine: names.a.audienceLine,
      change: names.a.change,
      notFor: names.a.notFor,
      nextCourse: {
        slug: "ux-design-basic",
        reason: k(
          "画面を使いやすく組み立てられるようになったら、次は「そもそも何をつくるべきか」です。ユーザーインタビューから課題を見つける方法を身につけます。"
        ),
      },
      roadmap: {
        path: careerChangeV3Path,
        position: 3,
        note: k("このコースを終えると、転職ロードマップの3つ目の区切りまで完了します。次はユーザーの課題から考えるUXデザインのコースに進みます。"),
      },
    },
  },
};
