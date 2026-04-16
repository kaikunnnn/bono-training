/**
 * Sanityに新しいイベントを作成するスクリプト
 *
 * 使用方法:
 * SANITY_STUDIO_DATASET=production npx tsx scripts/create-event.ts
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "cqszh4up",
  dataset: process.env.SANITY_STUDIO_DATASET || "development",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

// ヘルパー関数: テキストブロックを生成
function createTextBlock(text: string, style: string = "normal", listItem?: string): any {
  const block: any = {
    _type: "block",
    _key: `block-${Math.random().toString(36).substr(2, 9)}`,
    style,
    children: [
      {
        _type: "span",
        _key: `span-${Math.random().toString(36).substr(2, 9)}`,
        text,
        marks: [],
      },
    ],
    markDefs: [],
  };

  if (listItem) {
    block.listItem = listItem;
  }

  return block;
}

// ヘルパー関数: 太字テキストを含むブロックを生成
function createTextBlockWithBold(parts: Array<{text: string, bold?: boolean}>, style: string = "normal"): any {
  const children = parts.map(part => ({
    _type: "span",
    _key: `span-${Math.random().toString(36).substr(2, 9)}`,
    text: part.text,
    marks: part.bold ? ["strong"] : [],
  }));

  return {
    _type: "block",
    _key: `block-${Math.random().toString(36).substr(2, 9)}`,
    style,
    children,
    markDefs: [],
  };
}

const eventData = {
  _type: "event",
  title: "AIが出した\"要件満たしただけ\"UIをユーザー視点で劇的にデザインしよう！ワークショップ",
  slug: {
    _type: "slug",
    current: "ai_userscenario",
  },
  summary: "AIが出した要件を満たしただけのUIを、ユーザーシナリオの考え方を使って劇的に改善する実践ワークショップ。誰が・いつ・なぜ使うかを具体化し、使う人の状況に合ったUIデザインに変える方法を120分で学びます。",
  eventMonth: 4,
  eventPeriod: "late",
  content: [
    // 1. つかみ
    createTextBlock("1. つかみ", "h2"),
    createTextBlock("まずこのUIを見てください。", "normal"),
    createTextBlock("[平凡なUIの画像]", "normal"),
    createTextBlock("AIに「本のレビュー投稿画面を作って」と頼んだら、こんな画面が出てきました。", "normal"),
    createTextBlock("タイトル、著者名、星評価、レビュー本文、投稿ボタン。\nレビューを投稿するための項目はちゃんと並んでいます。", "normal"),
    createTextBlock("でもこれ、本当にこれでいいんでしたっけ？", "normal"),
    createTextBlock("要件だけ満たしたUIをユーザー視点で変える方法を、このワークショップで学びます。", "normal"),

    // 2. でもそれ、デザインじゃなくない？
    createTextBlock("2. でもそれ、デザインじゃなくない？", "h2"),
    createTextBlock("さっきのUI、パッと見「普通にいいじゃん」って感じですよね。自分もそう思います。", "normal"),
    createTextBlock("ただ、実際に使う場面を想像してみると、ちょっと景色が変わってきます。", "normal"),
    createTextBlock("読み終わったのが3週間前だと内容はもう曖昧だし、初めての投稿だと何をどのくらい書けばいいのか迷うし、投稿したあと何が起きるのかもわからない。", "normal"),
    createTextBlock("項目が揃っていれば「動くUI」は作れます。AIでも十分です。", "normal"),
    createTextBlockWithBold([
      {text: "でも"},
      {text: "使う人がちゃんと目的を達成できるUI", bold: true},
      {text: "にするには、その人の状況や気持ちを具体的に想像するステップが必要になってきます。"},
    ]),
    createTextBlockWithBold([
      {text: "この考え方、UXデザインでは"},
      {text: "ユーザーシナリオ", bold: true},
      {text: "と呼ばれています。"},
    ]),
    createTextBlock("この筋トレ会では、ユーザーシナリオの考え方を使って、UIデザインを変える方法を学びます。", "normal"),

    // 3. このトレーニングWSのコンセプト
    createTextBlock("3. このトレーニングWSのコンセプト", "h2"),
    createTextBlock("UIデザインって、いきなり画面を作るわけじゃないですよね。", "normal"),
    createTextBlock("ざっくり言うと、こんな流れがあります。", "normal"),
    createTextBlockWithBold([
      {text: "要件定義", bold: true},
      {text: " → どんな機能がいるか決める"},
    ]),
    createTextBlockWithBold([
      {text: "ユーザーシナリオ", bold: true},
      {text: " → 誰が・いつ・なぜ・どんな状況で使うか具体化する"},
    ]),
    createTextBlockWithBold([
      {text: "情報設計", bold: true},
      {text: " → 画面に何を置くか、どんな順番にするか決める"},
    ]),
    createTextBlockWithBold([
      {text: "UIデザイン", bold: true},
      {text: " → 見た目や操作感を作る"},
    ]),
    createTextBlock("さっきの「平凡なUI」は、要件定義からいきなりUIを作ったものです。\nだから項目は揃っているのに、使う人の状況に合っていなかった。", "normal"),
    createTextBlock("間にあるユーザーシナリオのステップが抜けていたんですね。", "normal"),
    createTextBlockWithBold([
      {text: "この筋トレ会では、この抜けがちなステップ、つまり"},
      {text: "ユーザーシナリオを具体化して、UIデザインに反映させる", bold: true},
      {text: "考え方を、実際に手を動かしながら学びます。"},
    ]),

    // 4. 筋トレ会の流れ
    createTextBlock("4. 筋トレ会の流れ", "h2"),
    createTextBlockWithBold([
      {text: "Part 1: 導入", bold: true},
      {text: "（5分）"},
    ]),
    createTextBlock("今日のゴールと進め方を共有します。", "normal"),
    createTextBlockWithBold([
      {text: "Part 2: 体験", bold: true},
      {text: "（10分）"},
    ]),
    createTextBlock("まずはお題だけ見て「平凡なUI」を触ってみます。次に、ユーザーシナリオ（誰が・いつ・なぜ使うか）を読んでから、もう一度同じUIを触ってみます。シナリオがあるだけで、見え方が変わるのを体感します。", "normal"),
    createTextBlockWithBold([
      {text: "Part 3: 発見", bold: true},
      {text: "（15分）"},
    ]),
    createTextBlock("シナリオの状況と照らし合わせて、このUIでは何が足りなかったのかを整理します。", "normal"),
    createTextBlockWithBold([
      {text: "Part 4: フレーム解説", bold: true},
      {text: "（10分）"},
    ]),
    createTextBlock("ユーザーシナリオからUIを考える4ステップの思考法を学びます。", "normal"),
    createTextBlockWithBold([
      {text: "Part 5: 実践", bold: true},
      {text: "（60分）"},
    ]),
    createTextBlock("4ステップを使って、平凡なUIを実際に改善します。", "normal"),
    createTextBlockWithBold([
      {text: "Part 6: 振り返り", bold: true},
      {text: "（10分）"},
    ]),
    createTextBlock("改善したUIを共有して、気づきを持ち帰ります。", "normal"),

    // 5. この筋トレ会で変わること
    createTextBlock("5. この筋トレ会で変わること", "h2"),
    createTextBlock("「ユーザーのことがわかると、UIデザインってこんなに楽しいんだ」。この筋トレ会で一番持ち帰ってほしいのは、この感覚です。", "normal"),
    createTextBlock("ユーザーの状況を想像するだけで、「あ、ここはこうしたほうがいいな」とアイデアがどんどん出てくるようになる", "normal", "bullet"),
    createTextBlock("「何を置くか」「どんな順番にするか」に迷わなくなる。ユーザーシナリオが答えをくれるから", "normal", "bullet"),
    createTextBlock("AIが出したUIを見て「何が足りないか」をパッと言えるようになる", "normal", "bullet"),
    createTextBlock("「なんとなく」じゃなく根拠を持ってデザインできるから、自信がつく", "normal", "bullet"),
    createTextBlock("デザインが「要件をこなす作業」から「ユーザーの体験を考える面白い仕事」に変わる", "normal", "bullet"),

    // 6. こんな人におすすめ
    createTextBlock("6. こんな人におすすめ", "h2"),
    createTextBlock("AIと一緒に、もっと楽しくUIデザインをしたい人", "normal", "bullet"),
    createTextBlock("AIでUIを作ってみたけど「これでいいのかな？」とモヤモヤしている人", "normal", "bullet"),
    createTextBlock("ユーザー視点の考え方を具体的に知りたい人", "normal", "bullet"),
    createTextBlock("UIデザインの基礎を手を動かしながら学びたい人", "normal", "bullet"),

    // 7. 概要
    createTextBlock("7. 概要", "h2"),
    {
      _type: "tableBlock",
      _key: `table-${Math.random().toString(36).substr(2, 9)}`,
      table: {
        rows: [
          {
            _key: `row-1`,
            cells: ["項目", "内容"],
          },
          {
            _key: `row-2`,
            cells: ["日時", "アンケートで決定（参加できる日程を回答してください）"],
          },
          {
            _key: `row-3`,
            cells: ["時間", "120分"],
          },
          {
            _key: `row-4`,
            cells: ["形式", "オンライン / ハンズオン"],
          },
          {
            _key: `row-5`,
            cells: ["題材", "社内本レビュー投稿サービス"],
          },
        ],
      },
    },
  ],
};

async function createEvent() {
  console.log("Creating event in Sanity...");
  console.log("Project ID:", client.config().projectId);
  console.log("Dataset:", client.config().dataset);

  if (!process.env.SANITY_API_TOKEN) {
    console.error("\n❌ SANITY_API_TOKEN が設定されていません。");
    console.log("\n環境変数を設定してスクリプトを実行してください:");
    console.log("SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/create-event.ts");
    return;
  }

  try {
    const result = await client.create(eventData);
    console.log("✅ Event created successfully!");
    console.log("Document ID:", result._id);
    console.log("URL: /events/ai_userscenario");
  } catch (error) {
    console.error("❌ Error creating event:", error);
  }
}

createEvent();
