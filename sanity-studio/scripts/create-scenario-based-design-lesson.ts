/**
 * 「シナリオベースドデザイン」レッスン作成スクリプト
 * isHidden: true で作成するため /lessons 一覧には表示されません
 *
 * 使用方法:
 * SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/create-scenario-based-design-lesson.ts
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "cqszh4up",
  dataset: process.env.SANITY_STUDIO_DATASET || "development",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

let keyCounter = 0;
function key(): string {
  return `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

function block(style: string, text: string): any {
  return {
    _type: "block",
    _key: key(),
    style,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function bold(text: string): any {
  return { _type: "span", _key: key(), text, marks: ["strong"] };
}

function span(text: string): any {
  return { _type: "span", _key: key(), text, marks: [] };
}

function mixedBlock(style: string, parts: any[]): any {
  return {
    _type: "block",
    _key: key(),
    style,
    children: parts,
    markDefs: [],
  };
}

function listBlock(text: string, listItem: "bullet" | "number" = "bullet"): any {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem,
    level: 1,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

// ============================================================
// 記事1: シナリオベースドデザインとは何か（イントロ）
// ============================================================
const article1 = {
  _type: "article",
  articleNumber: 1,
  contentType: "text",
  articleType: "intro",
  isPremium: false,
  title: "シナリオベースドデザインとは何か",
  slug: { _type: "slug", current: "what-is-scenario-based-design" },
  excerpt:
    "「誰が・いつ・なぜ使うか」を具体化することで、UIデザインは劇的に変わります。シナリオベースドデザインの考え方と、なぜデザイナーに必要なのかを解説します。",
  author: "bono",
  tags: ["シナリオ", "UX", "UIデザイン", "思考法"],
  publishedAt: new Date().toISOString(),
  learningObjectives: [
    "シナリオベースドデザインが何かを説明できる",
    "シナリオがあるとUIがどう変わるかを理解できる",
    "「要件を満たしたUI」と「使いやすいUI」の違いがわかる",
  ],
  content: [
    block("normal", "「要件通りに作ったのに、なんか使いづらい」"),
    block("normal", "そういうUIを見たこと、作ったこと、ありませんか？"),
    block("normal", "項目は揃っている。動作もする。でも何かが足りない。その「何か」の正体が、シナリオです。"),

    block("h2", "シナリオベースドデザインとは"),
    block("normal", "シナリオベースドデザインとは、ユーザーが「誰で・いつ・どんな状況で・何のためにそのUIを使うか」を具体的なシナリオとして描き、そのシナリオに基づいてUIを設計する考え方です。"),
    block("normal", "1990年代にCarroll（キャロル）らが提唱したUXデザインの手法ですが、今のAI時代にもっとも重要性が増しています。AIがUIのたたき台を出せる時代、人間のデザイナーが加える価値は「ユーザーの文脈を想像すること」にあるからです。"),

    block("h2", "シナリオがあると何が変わるのか"),
    block("normal", "例として、「本のレビュー投稿画面」を考えてみましょう。"),
    block("h3", "シナリオなしで設計したUI"),
    listBlock("タイトル入力欄"),
    listBlock("著者名入力欄"),
    listBlock("星評価（5段階）"),
    listBlock("レビュー本文"),
    listBlock("投稿ボタン"),
    block("normal", "これで「要件は満たしている」UIができます。"),
    block("h3", "シナリオを加えて設計したUI"),
    block("normal", "シナリオ：「3週間前に読み終えた本のレビューを、初めて投稿しようとしているビジネスパーソン。内容はうっすら覚えているが、どのくらいの量を書けばいいかわからず、投稿後に何が起きるかも不安。」"),
    block("normal", "このシナリオを踏まえると、設計が変わります。"),
    listBlock("本の内容を思い出しやすくするためのヒント（「印象に残ったシーンは？」など）"),
    listBlock("文字数の目安や記入例"),
    listBlock("投稿後のイメージ（「レビューが公開されます」など）"),
    listBlock("下書き保存機能"),
    block("normal", "同じ要件でも、シナリオひとつで設計が変わります。"),

    block("h2", "シナリオベースドデザインの3つの要素"),
    mixedBlock("normal", [bold("1. ユーザー（Who）"), span("：誰がこのUIを使うのか。スキル・状況・気持ちを含めて具体化する")]),
    mixedBlock("normal", [bold("2. 文脈（When/Where）"), span("：いつ、どんな状況で使うのか。時間的プレッシャーや環境も含める")]),
    mixedBlock("normal", [bold("3. 目的（Why/What）"), span("：何を達成しようとしているのか。表面的なタスクだけでなく、その奥にある動機まで掘り下げる")]),

    block("h2", "AIと人間のデザイナーの役割分担"),
    block("normal", "AIは「要件から画面を生成する」ことが得意です。しかしシナリオを想像する力、つまり「この人の状況ならこうしたほうがいい」という判断は、まだ人間の強みです。"),
    block("normal", "シナリオベースドデザインを身につけることは、AI時代のデザイナーとしての核心的な武器になります。"),

    block("h2", "このレッスンで学ぶこと"),
    listBlock("ユーザーシナリオの正しい作り方"),
    listBlock("シナリオからUIの課題を発見する方法"),
    listBlock("シナリオに基づいてUIを改善するプロセス"),
    block("normal", "次のクエストで、シナリオを実際に作りながら体験していきましょう。"),
  ],
};

// ============================================================
// 記事2: ユーザーシナリオの作り方（知識）
// ============================================================
const article2 = {
  _type: "article",
  articleNumber: 2,
  contentType: "text",
  articleType: "explain",
  isPremium: false,
  title: "ユーザーシナリオの作り方：4つのステップ",
  slug: { _type: "slug", current: "how-to-write-user-scenario" },
  excerpt:
    "「ユーザーシナリオを書いて」と言われても、何を書けばいいかわからない。そんな人のための、実践的なシナリオ作成の4ステップを解説します。",
  author: "bono",
  tags: ["シナリオ", "UX", "ユーザー理解", "設計手法"],
  publishedAt: new Date().toISOString(),
  learningObjectives: [
    "ユーザーシナリオに必要な4要素を説明できる",
    "自分でシナリオを書けるようになる",
    "薄いシナリオと深いシナリオの違いを判断できる",
  ],
  content: [
    block("normal", "シナリオを書こうとすると、多くの人がこういうものを書いてしまいます。"),
    block("blockquote", "「ユーザーがアプリを開いてレビューを投稿する」"),
    block("normal", "これはシナリオではなく、機能の説明です。「何ができるか」は書いてありますが、「誰が・なぜ・どんな状況で」がありません。"),
    block("normal", "良いシナリオには、ユーザーの人間らしさが必要です。"),

    block("h2", "シナリオ作成の4ステップ"),

    block("h3", "Step 1：ユーザーを決める"),
    block("normal", "「ユーザー」ではなく、具体的な一人の人物を想定します。"),
    mixedBlock("normal", [bold("悪い例："), span("「20〜30代の社会人」")]),
    mixedBlock("normal", [bold("良い例："), span("「IT企業に勤める28歳の田中さん。読書が趣味で月2〜3冊読む。レビューを書いたことはない」")]),
    block("normal", "属性（年齢・職業）だけでなく、スキルレベルや経験（「レビューを書いたことがない」）を含めることが重要です。ここがUIの設計に直結します。"),

    block("h3", "Step 2：状況を決める"),
    block("normal", "「いつ・どこで・どんな気持ちで」を具体化します。"),
    mixedBlock("normal", [bold("悪い例："), span("「アプリを使うとき」")]),
    mixedBlock("normal", [bold("良い例："), span("「平日の夜、仕事から帰って夕食後にソファでスマホを見ているとき。3週間前に読んだ本のことを思い出し、ふとレビューを書いてみようと思った」")]),
    block("normal", "「3週間前」がポイントです。記憶が曖昧な状態でUIを使うという状況が、設計の判断に影響します。"),

    block("h3", "Step 3：目的を決める"),
    block("normal", "表面的なタスクの奥にある「本当の目的」を書きます。"),
    mixedBlock("normal", [bold("表面的な目的："), span("「レビューを投稿する」")]),
    mixedBlock("normal", [bold("本当の目的："), span("「自分の読書体験を言語化して残したい。できれば誰かの参考にもなってほしい」")]),
    block("normal", "本当の目的がわかると、「投稿後に誰かに読まれるイメージを見せる」という設計判断ができるようになります。"),

    block("h3", "Step 4：不安・障壁を書く"),
    block("normal", "ユーザーが感じる不安や、行動を妨げる障壁を書きます。これが設計課題の源泉になります。"),
    listBlock("「何をどのくらい書けばいいかわからない」"),
    listBlock("「内容が曖昧で、うまく言語化できるか自信がない」"),
    listBlock("「投稿したあと、何が起きるのか想像できない」"),
    block("normal", "この不安リストが、UIに何を加えるべきかのヒントになります。"),

    block("h2", "シナリオの良し悪しを判断する基準"),
    block("normal", "書いたシナリオを読んで、以下の問いに答えられるかチェックしましょう。"),
    listBlock("「この人の状況を考えると、このUIのここが問題だ」と言えるか？"),
    listBlock("「この人のために、ここを変えた方がいい」という設計判断が出てくるか？"),
    listBlock("「別のユーザーなら、この判断は変わる」と思えるか？"),
    block("normal", "3つすべてに「はい」と答えられれば、設計に使えるシナリオです。"),

    block("h2", "よくある失敗"),
    mixedBlock("h3", [bold("失敗1: 万能なユーザーを作る")]),
    block("normal", "「ITリテラシーが高く、UIに慣れていて、時間に余裕があるユーザー」を想定すると、あらゆる設計上の配慮が不要になり、シナリオが機能しません。"),
    mixedBlock("h3", [bold("失敗2: タスクをそのままシナリオにする")]),
    block("normal", "「ユーザーがログインしてフォームを入力して送信する」はシナリオではなく操作手順です。なぜ・どんな気持ちで、が抜けています。"),
    block("normal", "次の記事では、作成したシナリオを使ってUIを評価し、改善する実践を行います。"),
  ],
};

// ============================================================
// 記事3: シナリオを使ってUIを評価・改善する（実践）
// ============================================================
const article3 = {
  _type: "article",
  articleNumber: 3,
  contentType: "text",
  articleType: "practice",
  isPremium: false,
  title: "シナリオを使ってUIを評価・改善する",
  slug: { _type: "slug", current: "evaluate-and-improve-ui-with-scenario" },
  excerpt:
    "シナリオを作ったら、次はそれをUIの評価と改善に活かします。「シナリオウォークスルー」という手法で、UIの問題を発見して改善するプロセスを体験しましょう。",
  author: "bono",
  tags: ["シナリオ", "UIデザイン", "実践", "評価手法"],
  publishedAt: new Date().toISOString(),
  learningObjectives: [
    "シナリオウォークスルーの手順を説明できる",
    "シナリオを使ってUIの問題を発見できる",
    "発見した問題から改善案を提案できる",
  ],
  content: [
    block("normal", "シナリオが手元にある。UIもある。ではどうやってシナリオをUIの改善に活かすのでしょうか。"),
    block("normal", "ここでは「シナリオウォークスルー」という手法を使います。難しい名前ですが、やることはシンプルです。"),

    block("h2", "シナリオウォークスルーとは"),
    block("normal", "シナリオウォークスルーとは、シナリオのユーザーになりきってUIを頭の中で操作し、「この状況なら、ここで詰まる・迷う・不安になる」というポイントを見つける手法です。"),
    block("normal", "ユーザーテストの簡易版とも言えます。実際のユーザーを呼ばずに、シナリオを使って課題を発見します。"),

    block("h2", "実践：シナリオウォークスルーの手順"),

    block("h3", "準備するもの"),
    listBlock("評価したいUIの画面（スクリーンショットやFigmaのモックでOK）"),
    listBlock("前の記事で作成したユーザーシナリオ"),
    listBlock("付箋（デジタルでもアナログでも）"),

    block("h3", "Step 1：シナリオを音読する"),
    block("normal", "まずシナリオを声に出して読みます。「田中さんは仕事から帰って、夕食後にソファでスマホを見ている。3週間前に読んだ本のレビューを書こうとした...」"),
    block("normal", "このとき、田中さんの気持ちや状況を具体的にイメージしながら読むことが大切です。"),

    block("h3", "Step 2：画面ごとに「この人なら？」を問う"),
    block("normal", "各画面・各要素を見るたびに、以下の3つを問います。"),
    listBlock("この人はここで何をしようとするか？"),
    listBlock("この人はここで迷わないか？不安にならないか？"),
    listBlock("この人の状況では、ここに必要な情報が揃っているか？"),
    block("normal", "「この人なら」というフィルターを通すことが重要です。一般的なユーザーではなく、シナリオの具体的な人物として考えます。"),

    block("h3", "Step 3：問題を発見して記録する"),
    block("normal", "問題を発見したら、付箋に書いて画面の該当箇所に貼ります（デジタルならFigmaのコメントやMiroなどを使う）。"),
    block("normal", "記録のフォーマット："),
    block("blockquote", "【誰が】【どのシーンで】【何ができない・何に困る】"),
    block("normal", "例：「田中さんが（3週間ぶりにレビューを書こうとして）レビュー本文欄を見たとき、何をどのくらい書けばいいかわからず手が止まる」"),

    block("h3", "Step 4：問題を優先度でグループ分けする"),
    block("normal", "発見した問題を以下の観点で分類します。"),
    mixedBlock("normal", [bold("高："), span("シナリオのユーザーがタスクを完了できなくなる問題")]),
    mixedBlock("normal", [bold("中："), span("完了はできるが、迷いや不安が生まれる問題")]),
    mixedBlock("normal", [bold("低："), span("気になるが、大きな影響はない問題")]),

    block("h3", "Step 5：改善案を出す"),
    block("normal", "高・中の問題から順に改善案を考えます。このとき必ず「シナリオのユーザーのために」という視点で考えます。"),
    block("normal", "例：「レビュー本文欄に『印象に残ったシーンや言葉は？（例：100〜300文字程度）』というプレースホルダーとヒントを追加する」"),

    block("h2", "ウォークスルーをやってみよう"),
    block("normal", "以下のお題で、シナリオウォークスルーを実践してみましょう。"),
    block("h3", "お題：社内本レビュー投稿画面"),
    block("normal", "シナリオ：「IT企業に勤める28歳の田中さん。読書が趣味で月2〜3冊読む。レビューを書いたことはない。平日の夜、仕事から帰って夕食後にソファでスマホを見ているとき、3週間前に読んだ本のことを思い出し、ふとレビューを書いてみようと思った。内容はうっすら覚えているが、どのくらいの量を書けばいいかわからず、投稿後に何が起きるかも不安。」"),
    block("normal", "画面：タイトル・著者名・星評価・レビュー本文・投稿ボタンのシンプルなフォーム"),
    block("normal", "上記のStep 1〜5を実際にやってみてください。最低でも3つの問題を発見し、それぞれに改善案を出してみましょう。"),

    block("h2", "シナリオ思考を日常に"),
    block("normal", "シナリオウォークスルーは、一人でできるデザインレビューの方法です。チームでのレビュー前に自分でやることで、「なんとなく気になる」を「この人の状況では問題がある」という根拠のある指摘に変えられます。"),
    block("normal", "まずは今関わっているプロジェクトの画面を一枚選んで、シナリオを書いてウォークスルーしてみましょう。"),
  ],
};

// ============================================================
// Quest
// ============================================================
const questData = {
  _type: "quest",
  questNumber: 1,
  title: "ユーザーの理想体験を形に型を習得",
  slug: { _type: "slug", current: "scenario-based-design-quest-1" },
  goal: "シナリオベースドデザインの考え方と手順を習得し、自分でシナリオを作ってUIを評価できるようになる",
  estTimeMins: 45,
  articles: [],
};

// ============================================================
// Lesson
// ============================================================
const lessonData = {
  _type: "lesson",
  title: "シナリオベースドデザイン",
  slug: { _type: "slug", current: "scenario-based-design" },
  description:
    "「誰が・いつ・なぜ使うか」を具体化するシナリオの力で、UIデザインを変える。要件を満たしただけのUIから、ユーザーの状況に合ったUIへ。",
  isPremium: false,
  isHidden: true,
  purposes: [
    "シナリオベースドデザインの考え方を理解できる",
    "ユーザーシナリオを自分で作れるようになる",
    "シナリオウォークスルーでUIの問題を発見・改善できる",
  ],
  contentHeading: "シナリオ思考でデザインを変えよう",
  quests: [],
};

// ============================================================
// Main
// ============================================================
async function main() {
  console.log("🚀 「シナリオベースドデザイン」レッスン作成開始");
  console.log("Dataset:", client.config().dataset);

  if (!process.env.SANITY_API_TOKEN) {
    console.error("\n❌ SANITY_API_TOKEN が設定されていません。");
    console.log("SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/create-scenario-based-design-lesson.ts");
    return;
  }

  try {
    // 1. 3記事を作成
    console.log("\n📝 記事を作成中...");
    const a1 = await client.create(article1);
    console.log(`✅ 記事1: ${article1.title} (${a1._id})`);
    const a2 = await client.create(article2);
    console.log(`✅ 記事2: ${article2.title} (${a2._id})`);
    const a3 = await client.create(article3);
    console.log(`✅ 記事3: ${article3.title} (${a3._id})`);

    // 2. クエストを作成（3記事を参照）
    console.log("\n📋 クエストを作成中...");
    const quest = await client.create({
      ...questData,
      articles: [
        { _type: "reference", _ref: a1._id, _key: key() },
        { _type: "reference", _ref: a2._id, _key: key() },
        { _type: "reference", _ref: a3._id, _key: key() },
      ],
    });
    console.log(`✅ クエスト: ${questData.title} (${quest._id})`);

    // 3. レッスンを作成（クエストを参照）
    console.log("\n📚 レッスンを作成中...");
    const lesson = await client.create({
      ...lessonData,
      quests: [{ _type: "reference", _ref: quest._id, _key: key() }],
    });
    console.log(`✅ レッスン: ${lessonData.title} (${lesson._id})`);

    // 4. クエストのlesson参照を更新
    console.log("\n🔗 クエストのlesson参照を更新中...");
    await client.patch(quest._id).set({ lesson: { _type: "reference", _ref: lesson._id } }).commit();
    console.log("✅ 更新完了");

    console.log("\n🎉 全て作成完了！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📚 レッスン : /lessons/${lessonData.slug.current}  ※一覧非表示(isHidden:true)`);
    console.log(`   ID       : ${lesson._id}`);
    console.log(`📋 クエスト : ${questData.title}`);
    console.log(`   ID       : ${quest._id}`);
    console.log(`📝 記事1   : ${article1.title}  (${a1._id})`);
    console.log(`📝 記事2   : ${article2.title}  (${a2._id})`);
    console.log(`📝 記事3   : ${article3.title}  (${a3._id})`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

main();
