/**
 * data v3: Figma入門（元: ロードマップ ui-design-beginner「Figmaからデザインをはじめるロードマップ」）— #300
 *
 * 章＝ロードマップのステップ。章タイトルと why（ステップの goals）は Sanity 本番の文言そのまま。
 * レッスンと順番もロードマップと同じ（figmabeginner → figma-elementary → uidesignbeginner）。
 * それ以外の文言は推測で書いた仮の文（kari）。
 */

import type { NameVariant, CourseV3Entry } from "./types";
import { AUTHOR, NOT_FOR_QUESTION, PERIOD, careerChangeV3Path, fixed, k } from "./shared";

const names: Record<"a" | "b", NameVariant> = {
  a: {
    title: fixed("Figma入門コース：トレースでUIデザインをはじめる"),
    audienceLine: k("Figmaをこれから使い始める人向け。デザインの経験は問いません"),
    change: k(
      "Figmaの基本操作とAuto Layout・コンポーネントが使えるようになり、その結果、見本のアプリ画面をトレースしたあと、自分でも1画面をつくりきれる"
    ),
    cardLine: k("YouTubeやTwitterの画面をトレースして、Figmaで画面をつくれるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaでアプリの画面を1枚つくりきれる人には、内容がやさしすぎます。その場合は「UIビジュアル入門コース」から始めて、見た目を整える練習に進めます。"
      ),
    },
  },
  b: {
    title: fixed("非デザイナーのためのFigma入門：トレースで画面をつくれるようになる"),
    audienceLine: k("デザインの仕事をしたことがなく、Figmaもこれから始める人向け"),
    change: k(
      "デザインの経験がなくても、見本の画面をなぞりながらFigmaの基本操作が身につき、その結果、アプリの画面を1枚、自分の手でつくりきれる"
    ),
    cardLine: k("デザインの経験がなくても、見本をなぞってFigmaで画面をつくれるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "すでにデザインの仕事でFigmaを使っている人には、内容がやさしすぎます。見た目を整える練習から始めたい場合は「非デザイナーのためのUIの見た目のきほん」に進めます。"
      ),
    },
  },
};

export const figmaBeginnerV3: CourseV3Entry = {
  roadmapSlug: "ui-design-beginner",
  names,
  base: {
    slug: "figma-beginner",
    title: names.a.title,
    shortTitle: fixed("Figma入門"),
    tagline: k(
      "Figmaの画面の見方から、Auto Layout・コンポーネントまでを、実在するアプリの画面をトレースしながら覚えます。最後は連絡帳アプリを自分でデザインして、UIをつくる流れをひと通り体験します。"
    ),
    change: names.a.change,
    period: PERIOD,
    deliverable: k("トレースした2つのアプリ画面と、自分でデザインした連絡帳アプリの画面"),

    changeRows: [
      {
        before: k("Figmaを開いても、どこから触ればいいか分からない"),
        after: k("フレーム・図形・テキストを使って、見本どおりに画面を組み立てられる"),
      },
      {
        before: k("ボタンやカードを1つずつ手で並べていて、直すたびに全部を動かしている"),
        after: k("Auto Layoutとコンポーネントで、並びや部品をまとめて直せる"),
      },
      {
        before: k("見本をなぞることはできても、自分で1からつくろうとすると手が止まる"),
        after: k("お題のアプリを、見本のつくり方にならって最後までデザインできる"),
      },
    ],

    finalGoal: k("Figmaの基本操作を使って、アプリの画面を1から最後までつくりきれる"),

    steps: [
      {
        kind: "goal",
        title: fixed("Figmaの使い方をゼロから習得"),
        why: fixed("UIをつくるならFigmaの使い方を実践ベースで身につけよう"),
        gain: k("YouTubeアプリの画面をトレースして、Figmaの基本操作で1画面を組み立てられる"),
        items: [{ type: "lesson", slug: "figmabeginner" }],
      },
      {
        kind: "goal",
        title: fixed("Auto Layoutとコンポーネント機能の習得"),
        why: fixed("UI制作に必須のFigmaの基本機能を身につけよう"),
        gain: k("Twitterの画面をトレースしながら、Auto Layoutとコンポーネントで崩れにくい画面をつくれる"),
        items: [{ type: "lesson", slug: "figma-elementary" }],
      },
      {
        kind: "challenge",
        title: fixed("連絡帳をデザインしてUIの基本に触れる"),
        why: fixed("つくり方を真似して、UI制作の基本概念を体験"),
        gain: k("見本のつくり方にならって、アプリの画面を自分でデザインできる"),
        items: [{ type: "lesson", slug: "uidesignbeginner" }],
        brief: {
          description: k("連絡帳アプリの画面を、レッスンのつくり方にならって自分でデザインします。"),
          deliverables: [k("連絡帳アプリの主要な画面（Figma）"), k("つくりながら気づいたUIの基本のメモ")],
        },
      },
    ],

    output: {
      lead: k(
        "トレースで覚えた操作を使って、最後に連絡帳アプリの画面を自分でデザインします。見本をなぞった画面と、自分でつくった画面を並べて見返せます。"
      ),
      points: [
        k("YouTubeアプリのトレース画面"),
        k("Twitterのトレース画面（Auto Layout・コンポーネントつき）"),
        k("自分でデザインした連絡帳アプリの画面"),
      ],
      samples: ["YouTube", "Twitter", "連絡帳"],
    },

    audience: [
      {
        title: k("Figmaをこれから使い始める人"),
        body: k("画面の見方と基本操作から順番に進めます。デザインの経験は問いません。"),
      },
      {
        title: k("Figmaを独学で触ったが、操作があやふやな人"),
        body: k(
          "Auto Layoutやコンポーネントなど、画面をつくるたびに使う機能を、実在するアプリの画面をなぞって固めます。"
        ),
      },
      {
        title: k("UIデザインを始めてみたいが、何をつくればいいか決められない人"),
        body: k("なぞる画面とお題が決まっているので、迷わず手を動かし始められます。"),
      },
    ],

    author: AUTHOR,

    faq: [
      {
        question: k("パソコンは何を用意すればいいですか？"),
        answer: k("Figmaはブラウザでも動くので、MacでもWindowsでも進められます。Figmaの無料プランで最後まで進められます。"),
      },
      {
        question: k("トレースだけで、自分でデザインできるようになりますか？"),
        answer: k(
          "トレースで操作と画面の組み立て方を覚えたあと、最後の章で連絡帳アプリを自分でデザインします。なぞる→自分でつくる、の順に進めます。"
        ),
      },
      {
        question: k("1日にどれくらい時間をかければいいですか？"),
        answer: k("1回30分〜1時間で、記事を1〜2本ずつ進めるのが目安です。"),
      },
    ],

    v2: {
      audienceLine: names.a.audienceLine,
      change: names.a.change,
      notFor: names.a.notFor,
      nextCourse: {
        slug: "ui-visual",
        reason: k(
          "Figmaで画面をつくれるようになったら、次は見た目を整える番です。余白・文字・色の基本原則を、画面をつくりながら身につけます。"
        ),
      },
      roadmap: {
        path: careerChangeV3Path,
        position: 1,
        note: k("このコースを終えると、転職ロードマップの1つ目の区切りが完了します。次は画面の見た目を整えるコースに進みます。"),
      },
    },
  },
};
