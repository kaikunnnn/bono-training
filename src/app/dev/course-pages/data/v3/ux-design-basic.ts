/**
 * data v3: UXデザイン入門（元: ロードマップ ux-design-basic「UXデザインで顧客の課題解決をはじめるロードマップ」）— #300
 *
 * 章＝ロードマップのステップ。章タイトルと why（ステップの goals）は Sanity 本番の文言そのまま
 * （章3の goals は箇条の羅列なので、why は言い換えて仮。羅列は gain の元にした）。
 * レッスンと順番もロードマップと同じ。それ以外の文言は推測で書いた仮の文（kari）。
 * 4本の最後なので、次のおすすめのコースは無し（nextCourse.slug は v3 に無い slug → カードを出さない）。
 */

import type { NameVariant, CourseV3Entry } from "./types";
import { AUTHOR, NOT_FOR_QUESTION, PERIOD, careerChangeV3Path, fixed, k } from "./shared";

const names: Record<"a" | "b", NameVariant> = {
  a: {
    title: fixed("UXデザイン入門コース：インタビューで課題を見つける"),
    audienceLine: k("画面はつくれるが、ユーザーの課題から何をつくるかを決めたことがない人向け"),
    change: k(
      "UXデザインの全体像と、ゴールダイレクテッドデザイン・ユーザーインタビューの手法が身につき、その結果、聞いた話から課題を見つけて、それを解決するサービスを設計できる"
    ),
    cardLine: k("ユーザーインタビューで課題を見つけ、解決するサービスを設計できるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaで画面をまだつくったことがない人は、先に「Figma入門コース」から進めるのがおすすめです。画面の配置や操作の流れを整えたい人には「UI情報設計入門コース」が合っています。"
      ),
    },
  },
  b: {
    title: fixed("非デザイナーのためのUXデザイン入門"),
    audienceLine: k("デザインの仕事をしたことがなく、UXデザインで何をするのかをつかみたい人向け"),
    change: k(
      "広い意味で使われるUXデザインを3つに分けて捉え、インタビューで課題を見つける手順が身につき、その結果、デザインの経験がなくてもユーザーの課題から考えたサービスを形にできる"
    ),
    cardLine: k("ユーザーの話を聞いて課題を見つけ、サービスの形にできるようになる"),
    notFor: {
      question: NOT_FOR_QUESTION,
      answer: k(
        "Figmaにまだ触ったことがない人は、先に「非デザイナーのためのFigma入門」から進めるのがおすすめです。すでにUXリサーチを仕事でしている人には、内容が基本寄りに感じられます。"
      ),
    },
  },
};

export const uxDesignBasicV3: CourseV3Entry = {
  roadmapSlug: "ux-design-basic",
  names,
  base: {
    slug: "ux-design-basic",
    title: names.a.title,
    shortTitle: fixed("UXデザイン入門"),
    tagline: k(
      "広い意味で使われるUXデザインを3つの側面で捉えるところから始め、ゴールダイレクテッドデザインで課題を定義する型と、ユーザーインタビューで課題を見つける方法を身につけます。最後に、ユーザーの課題を解決するサービスをゼロからデザインします。"
    ),
    change: names.a.change,
    period: PERIOD,
    deliverable: k("ユーザーの課題から考えたサービスのデザイン"),

    changeRows: [
      {
        before: k("UXデザインと聞いても、何をすることなのかが人によってばらばらに聞こえる"),
        after: k("UXデザインを3つの側面に分けて、自分がどこを扱っているかを説明できる"),
      },
      {
        before: k("つくる画面を、思いつきや見本から決めている"),
        after: k("ユーザーのゴールから課題を定義して、つくるものを決められる"),
      },
      {
        before: k("インタビューをしても、聞いた話をどう使えばいいか分からない"),
        after: k("質問を組み立てて話を聞き、発言から課題と原因を取り出せる"),
      },
    ],

    finalGoal: k("ユーザーの課題を見つけ、それを解決するサービスを自分で設計しきれる"),

    steps: [
      {
        kind: "goal",
        title: fixed("そもそもUXデザインとは何かを理解しよう"),
        why: fixed("定義の広いUXデザインを3つに分類する解像度を持とう"),
        gain: k("UXデザインを3つの側面に分けて、何をすることかを自分の言葉で説明できる"),
        items: [{ type: "lesson", slug: "ux-beginner-2" }],
      },
      {
        kind: "goal",
        title: fixed("課題解決をするデザインの型を身につけよう"),
        why: fixed(
          "ゴールダイレクテッドデザインの手法で課題の定義方法、ユーザー価値を生み出すデザインを習得しよう"
        ),
        gain: k("ゴールダイレクテッドデザインで、ユーザーのゴールから課題を定義し、体験を設計できる"),
        items: [
          { type: "lesson", slug: "uxdezaintohahe-ka-copy" },
          { type: "lesson", slug: "ux-biginner" },
        ],
      },
      {
        kind: "goal",
        title: fixed("UXリサーチで「顧客課題」の見つけ方を身につける"),
        why: k("課題を思い込みで決めないために、ユーザーに話を聞いて確かめる方法を押さえます。"),
        gain: k("インタビューを設計して進め、発言から課題と原因を取り出せる"),
        items: [{ type: "lesson", slug: "zerokara-userinterview" }],
      },
      {
        kind: "challenge",
        title: fixed("ユーザーの課題を解決するサービスをデザインしよう"),
        why: fixed("ゴールダイレクテッドとUXリサーチの手法を使って、顧客の課題解決に挑戦"),
        gain: k("見つけた課題から、それを解決するサービスをゼロからデザインできる"),
        items: [{ type: "lesson", slug: "designyourownservice" }],
        brief: {
          description: k("身近な人にインタビューして課題を見つけ、それを解決するサービスをゼロからデザインします。"),
          deliverables: [k("インタビューのまとめと、見つけた課題"), k("課題を解決するサービスの画面（Figma）")],
        },
      },
    ],

    output: {
      lead: k(
        "最後の章で、インタビューで見つけた課題を解決するサービスをゼロからデザインします。課題を見つけた過程から画面までがつながるので、ポートフォリオで考えた過程を説明する材料になります。"
      ),
      points: [
        k("インタビューのまとめと課題の定義"),
        k("課題を解決するサービスの体験の流れ"),
        k("主要な画面のデザイン"),
      ],
      samples: ["Interview", "Goal", "Service"],
    },

    audience: [
      {
        title: k("画面はつくれるが、何をつくるかを自分で決めたことがない人"),
        body: k("ユーザーのゴールから課題を定義して、つくるものを決める型を身につけます。"),
      },
      {
        title: k("UXデザインの範囲が広すぎて、どこから始めればいいか分からない人"),
        body: k("最初の章で、UXデザインを3つの側面に分けて整理します。自分が今どこを扱っているかが分かります。"),
      },
      {
        title: k("ユーザーインタビューをやってみたいが、聞き方や使い方が分からない人"),
        body: k("質問の組み立て方から、発言から課題を取り出すところまでを順番に進めます。"),
      },
    ],

    author: AUTHOR,

    faq: [
      {
        question: k("UIのコースを終えてからのほうがいいですか？"),
        answer: k(
          "最後の章で画面をデザインするので、Figmaで画面をつくれると進めやすいです。インタビューと課題の定義までは、Figmaを使わずに進められます。"
        ),
      },
      {
        question: k("インタビューの相手は誰にすればいいですか？"),
        answer: k(
          "最初は家族や友人など、身近な人で構いません。聞きたいテーマに近い経験をしている人を選ぶと、課題が見つかりやすくなります。"
        ),
      },
      {
        question: k("2章の2本は、どちらから進めてもいいですか？"),
        answer: k(
          "上から順に進めるのがおすすめです。「顧客体験デザインの基本」で考え方を押さえてから、「はじめてのUXデザイン」でサブスク管理サービスをつくりながら手法を試します。"
        ),
      },
    ],

    v2: {
      audienceLine: names.a.audienceLine,
      change: names.a.change,
      notFor: names.a.notFor,
      nextCourse: {
        // 4本の最後。v3 に無い slug なので「次のおすすめのコース」のカードは出ない
        slug: "",
        reason: k(""),
      },
      roadmap: {
        path: careerChangeV3Path,
        position: 4,
        note: k("このコースを終えると、転職ロードマップの4つのコースがそろいます。次はコースでつくったものをポートフォリオにまとめます。"),
      },
    },
  },
};
