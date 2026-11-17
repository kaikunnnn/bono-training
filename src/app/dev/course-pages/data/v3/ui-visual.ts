/**
 * data v3: UIビジュアル（元: ロードマップ ui-visual「UIデザイン見た目のきほん」）— #300
 *
 * 章＝ロードマップのステップ。章タイトルと why（ステップの goals）は Sanity 本番の文言そのまま
 * （章4の why だけ「ロードマップで学んだ〜」をコース向けに言い換えたので仮）。
 * レッスンと順番もロードマップと同じ。それ以外の文言は推測で書いた仮の文（kari）。
 */

import type { NameVariant, CourseV3Entry } from "./types";
import { AUTHOR, NOT_FOR_QUESTION, PERIOD, careerChangeV3Path, fixed, k } from "./shared";

const names: Record<"a" | "b", NameVariant> = {
  a: {
    title: fixed("UIビジュアル入門コース：画面の見た目のきほん"),
    audienceLine: k("Figmaで画面はつくれるが、見た目の整え方を根拠をもって決められない人向け"),
    change: k(
      "余白・文字・色など見た目の基本原則と、迷わず進めるデザインの進め方が身につき、その結果、音声SNSアプリの主要な画面を見た目まで整えてつくりきれる"
    ),
    cardLine: k("余白・文字・色の基本原則で、画面の見た目を整えられるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaの基本操作がまだあやふやな人は、先に「Figma入門コース」から進めるのがおすすめです。画面の構成や操作の流れを設計したい人には「UI情報設計入門コース」が合っています。"
      ),
    },
  },
  b: {
    title: fixed("非デザイナーのためのUIの見た目のきほん"),
    audienceLine: k("デザインの仕事をしたことがなく、自分でつくった画面がなんとなく素人っぽく見える人向け"),
    change: k(
      "センスに頼らず、余白・文字・色の決まりで見た目を整える方法が身につき、その結果、デザインの経験がなくても整って見える画面をつくれる"
    ),
    cardLine: k("センスに頼らず、余白・文字・色の決まりで画面を整えられるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaにまだ触ったことがない人は、先に「非デザイナーのためのFigma入門」から進めるのがおすすめです。すでにデザインの仕事で画面をつくっている人には、前半の内容がやさしく感じられます。"
      ),
    },
  },
};

export const uiVisualV3: CourseV3Entry = {
  roadmapSlug: "ui-visual",
  names,
  base: {
    slug: "ui-visual",
    title: names.a.title,
    shortTitle: fixed("UIビジュアル"),
    tagline: k(
      "ToDoアプリを真似してデザインするところから始め、デザインの進め方と、世の中のデザインから学ぶ方法を身につけます。そのうえで構造・文字・見た目の基本原則を押さえ、最後に音声SNSアプリの画面を自分でデザインします。"
    ),
    change: names.a.change,
    period: PERIOD,
    deliverable: k("音声SNSアプリの主要な画面のデザイン"),

    changeRows: [
      {
        before: k("画面をつくり始めても、手を動かしては直すを繰り返して時間が溶ける"),
        after: k("試す・比べる・直すの順で進めて、迷う時間を減らせる"),
      },
      {
        before: k("参考になる画面を見ても、「いいな」で終わってしまう"),
        after: k("世の中のデザインから“ふつう”を読み取り、自分の画面に取り入れられる"),
      },
      {
        before: k("見た目に違和感があっても、どこを直せばいいか分からない"),
        after: k("構造・文字・余白・色に分けて見直し、直す場所を自分で決められる"),
      },
    ],

    finalGoal: k("お題を受け取ってから、見た目まで整った画面を自分の進め方でつくりきれる"),

    steps: [
      {
        kind: "goal",
        title: fixed("UIデザインを体験しよう"),
        why: fixed("動画のデザインを真似して、UIを制作するイメージを身につけよう"),
        gain: k("ToDoアプリの主要な画面を、動画のやり方を真似してデザインできる"),
        items: [{ type: "lesson", slug: "tutorial-uivisual" }],
      },
      {
        kind: "goal",
        title: fixed("基礎力を付ける「デザインの進め方」を習得"),
        why: fixed("デザイン力の成長に必須な「デザインの進め方」を習得しよう"),
        gain: k("基本の進め方でデザインを試して直せる。世の中のデザインから“ふつう”を読み取れる"),
        items: [
          { type: "lesson", slug: "ui-design-flow-lv1" },
          { type: "lesson", slug: "steel-design-sense" },
        ],
      },
      {
        kind: "goal",
        title: fixed("UIデザインの基礎要素を習得"),
        why: fixed("UIの見た目を構成する\"きほん原則\"を実践して身につけよう"),
        gain: k("構造・文字・見た目の基本原則を使って、画面を整えられる"),
        items: [
          { type: "lesson", slug: "three-structures-ui-design" },
          { type: "lesson", slug: "ui-typography" },
          { type: "lesson", slug: "uivisual" },
        ],
      },
      {
        kind: "challenge",
        title: fixed("習得したことを使ってデザインしよう"),
        why: k("コースで身につけた進め方と基本原則を全部使って、デザインに挑戦しよう"),
        gain: k("音声SNSアプリの主要な画面を、自分の進め方で見た目まで整えてデザインできる"),
        items: [{ type: "lesson", slug: "dailyui-part01" }],
        brief: {
          description: k("音声SNSアプリの主要な画面を、コースで身につけた進め方と基本原則を使ってデザインします。"),
          deliverables: [k("音声SNSアプリの主要な画面（Figma）"), k("画面ごとに直したところのメモ")],
        },
      },
    ],

    output: {
      lead: k(
        "最後の章で、音声SNSアプリの主要な画面をデザインします。最初の章でつくったToDoアプリの画面と並べると、見た目の整え方の変化を自分で確かめられます。"
      ),
      points: [
        k("ToDoアプリの主要な画面（真似してつくる）"),
        k("音声SNSアプリの主要な画面（自分でつくる）"),
        k("画面ごとに、どの原則で直したかのメモ"),
      ],
      samples: ["ToDo", "音声SNS", "Typography"],
    },

    audience: [
      {
        title: k("Figmaで画面はつくれるが、見た目がどこか垢抜けない人"),
        body: k("構造・文字・余白・色に分けて見直す練習をして、違和感の原因を自分で見つけられるようにします。"),
      },
      {
        title: k("参考の画面を集めても、自分のデザインに活かせていない人"),
        body: k("世の中のデザインから“ふつう”を読み取り、自分の画面に取り入れる方法を身につけます。"),
      },
      {
        title: k("デザインのたびに迷走して、時間がかかりすぎる人"),
        body: k("試す・比べる・直すの進め方を、手を動かしながら体に入れます。"),
      },
    ],

    author: AUTHOR,

    faq: [
      {
        question: k("Figmaを使ったことがなくても始められますか？"),
        answer: k(
          "Figmaの基本操作（フレーム・テキスト・Auto Layout）が分かっていると進めやすいです。初めて触る場合は、Figma入門のコースから始めるのがおすすめです。"
        ),
      },
      {
        question: k("2章の2本は、どちらから進めてもいいですか？"),
        answer: k(
          "上から順に進めるのがおすすめです。「デザインサイクル」で進め方をつかんでから「センスを盗む技術」に進むと、集めたデザインを試す場面がすぐに来ます。"
        ),
      },
      {
        question: k("センスがなくても見た目は良くなりますか？"),
        answer: k(
          "見た目の多くは、余白や文字の決まりと、良いデザインを見た量で決まります。このコースではその両方を、手を動かしながら増やします。"
        ),
      },
    ],

    v2: {
      audienceLine: names.a.audienceLine,
      change: names.a.change,
      notFor: names.a.notFor,
      nextCourse: {
        slug: "information-architecture",
        reason: k(
          "見た目を整えられるようになったら、次は「どこに何をなぜ置くか」です。目的とユーザーから画面を組み立てる方法を身につけます。"
        ),
      },
      roadmap: {
        path: careerChangeV3Path,
        position: 2,
        note: k("このコースを終えると、転職ロードマップの2つ目の区切りまで完了します。次は画面の組み立て方（情報設計）のコースに進みます。"),
      },
    },
  },
};
