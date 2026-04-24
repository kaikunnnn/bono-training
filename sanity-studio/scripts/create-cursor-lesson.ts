/**
 * 「デザイナーのためのCursor入門」レッスンを作成するスクリプト
 *
 * 使用方法:
 * SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/create-cursor-lesson.ts
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
function generateKey(): string {
  return `key${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

function block(style: string, text: string): any {
  return {
    _type: "block",
    _key: generateKey(),
    style,
    children: [{ _type: "span", _key: generateKey(), text, marks: [] }],
    markDefs: [],
  };
}

function listBlock(text: string, listItem: "bullet" | "number" = "bullet"): any {
  return {
    _type: "block",
    _key: generateKey(),
    style: "normal",
    listItem,
    level: 1,
    children: [{ _type: "span", _key: generateKey(), text, marks: [] }],
    markDefs: [],
  };
}

// --- Article ---
const articleData = {
  _type: "article",
  articleNumber: 1,
  contentType: "text",
  articleType: "intro",
  isPremium: false,
  title: "Cursorとは何か？デザイナーのための入門ガイド",
  slug: { _type: "slug", current: "cursor-intro-for-designers" },
  excerpt:
    "AIコードエディタ「Cursor」が話題ですが、デザイナーはどう使えばいいのでしょう？この記事では、Cursorの基本と、デザイナーが活用できる具体的なシーンを紹介します。",
  author: "bono",
  tags: ["Cursor", "AI", "ツール", "デザイナー向け"],
  publishedAt: new Date().toISOString(),
  learningObjectives: [
    "Cursorが何をするツールなのかを説明できる",
    "デザイナーがCursorを使えるシーンをイメージできる",
    "Cursorのインストール・起動ができる",
  ],
  content: [
    block("normal", "「Cursor使ってみたいけど、コード書けないデザイナーでも意味あるのかな？」"),
    block("normal", "そう思っている人は多いと思います。実はCursorは、コードが書けなくても使えるシーンがたくさんあります。この記事では、デザイナー目線でCursorを紹介します。"),

    block("h2", "Cursorとは？"),
    block("normal", "CursorはAIを組み込んだコードエディタです。見た目はVS Code（Visual Studio Code）にそっくりで、実際にVS Codeをベースに作られています。"),
    block("normal", "普通のエディタと大きく違うのは、AIチャットがエディタの中に組み込まれていること。「このファイルの中身を説明して」「このコードを日本語でコメントして」といった会話ができます。"),
    block("normal", "つまり、コードを自分で書かなくても、AIに話しかけてファイルを操作できるツールです。"),

    block("h2", "デザイナーが使えるシーン"),
    block("h3", "1. フロントエンドエンジニアと会話する前の下調べ"),
    block("normal", "エンジニアに「これ実装できますか？」と聞く前に、Cursorで実装ファイルを開いて「このコードは何をしていますか？」と聞くだけで、コードの概要がわかります。会話の解像度が上がります。"),

    block("h3", "2. CSSの調整を試す"),
    block("normal", "「このボタンの色を変えたい」「フォントサイズを大きくしたい」といった小さな変更なら、AIに頼めば正確な箇所を教えてくれます。エンジニアへの依頼が減り、スピードが上がります。"),

    block("h3", "3. コードレビューに参加する"),
    block("normal", "プルリクエストのdiffを読むのが難しいとき、Cursorで変更ファイルを開いて「この変更で何が変わりましたか？」と聞けば、AIがわかりやすく説明してくれます。"),

    block("h3", "4. デザインドキュメントやREADMEを書く"),
    block("normal", "Cursorはコードだけでなく、テキストファイルの編集も得意です。Markdownで設計書や仕様書を書くとき、AIに文章を整えてもらったり、英語を日本語に訳してもらうこともできます。"),

    block("h2", "Cursorのインストール方法"),
    listBlock("cursor.com にアクセスする", "number"),
    listBlock("「Download」ボタンをクリックしてインストーラーをダウンロード", "number"),
    listBlock("インストーラーを実行し、指示に従ってインストール", "number"),
    listBlock("起動後、GitHubアカウントでサインインすると無料プランで使い始められる", "number"),

    block("h2", "まずはここから始めよう"),
    block("normal", "インストールしたら、まず自分が普段関わっているプロジェクトのフォルダをCursorで開いてみましょう。"),
    block("normal", "右下のチャット欄（Cmd+LまたはCtrl+L）を開いて、「このプロジェクトはどんなファイル構成ですか？」と聞いてみてください。AIがプロジェクトの概要を教えてくれます。"),
    block("normal", "コードが読めなくても大丈夫。「読む」のではなく「聞く」ことから始めればOKです。"),

    block("h2", "まとめ"),
    listBlock("CursorはAI内蔵のコードエディタ。コードを書かなくても使える"),
    listBlock("デザイナーが使えるシーン：コードの理解・CSS調整の補助・コードレビュー・ドキュメント作成"),
    listBlock("まずはインストールして、プロジェクトに「聞く」ことから始めてみよう"),
  ],
};

// --- Quest ---
const questData = {
  _type: "quest",
  questNumber: 1,
  title: "クエスト1: Cursorを知ろう",
  slug: { _type: "slug", current: "cursor-lesson-quest-1" },
  goal: "Cursorの基本を理解し、デザイナーとして活用できるシーンをイメージできる",
  estTimeMins: 15,
  // lesson参照は後で追加
  articles: [], // 後で追加
};

// --- Lesson ---
const lessonData = {
  _type: "lesson",
  title: "デザイナーのためのCursor入門",
  slug: { _type: "slug", current: "cursor-for-designers" },
  description:
    "AIコードエディタ「Cursor」をデザイナー目線で学ぶレッスン。コードが書けなくても使えるCursorの活用法を、具体的なシーンを通じて習得します。",
  isPremium: false,
  purposes: [
    "CursorがどんなAIツールなのかを理解できる",
    "デザイナーとしてCursorを使えるシーンがわかる",
    "エンジニアとのコミュニケーションが改善する",
  ],
  contentHeading: "Cursorを使いこなそう",
  quests: [], // 後で追加
};

async function main() {
  console.log("🚀 「デザイナーのためのCursor入門」作成開始");
  console.log("Dataset:", client.config().dataset);

  if (!process.env.SANITY_API_TOKEN) {
    console.error("\n❌ SANITY_API_TOKEN が設定されていません。");
    console.log("\n以下のコマンドで実行してください:");
    console.log(
      "SANITY_API_TOKEN=xxx SANITY_STUDIO_DATASET=production npx tsx scripts/create-cursor-lesson.ts"
    );
    return;
  }

  try {
    // 1. 記事を作成
    console.log("\n📝 記事を作成中...");
    const article = await client.create(articleData);
    console.log(`✅ 記事作成完了: ${article._id}`);
    console.log(`   タイトル: ${articleData.title}`);

    // 2. クエストを作成（記事を参照）
    console.log("\n📋 クエストを作成中...");
    const questWithArticle = {
      ...questData,
      articles: [{ _type: "reference", _ref: article._id, _key: generateKey() }],
      // lessonは後で設定（lessonが先に作成されるとIDが必要になるため、後でpatchする）
    };
    const quest = await client.create(questWithArticle);
    console.log(`✅ クエスト作成完了: ${quest._id}`);
    console.log(`   タイトル: ${questData.title}`);

    // 3. レッスンを作成（クエストを参照）
    console.log("\n📚 レッスンを作成中...");
    const lessonWithQuest = {
      ...lessonData,
      quests: [{ _type: "reference", _ref: quest._id, _key: generateKey() }],
    };
    const lesson = await client.create(lessonWithQuest);
    console.log(`✅ レッスン作成完了: ${lesson._id}`);
    console.log(`   タイトル: ${lessonData.title}`);

    // 4. クエストのlesson参照を更新
    console.log("\n🔗 クエストのlesson参照を更新中...");
    await client
      .patch(quest._id)
      .set({ lesson: { _type: "reference", _ref: lesson._id } })
      .commit();
    console.log("✅ クエストのlesson参照を更新完了");

    console.log("\n🎉 全て作成完了！");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📚 レッスン: /lessons/${lessonData.slug.current}`);
    console.log(`   ID: ${lesson._id}`);
    console.log(`📋 クエスト: ${questData.title}`);
    console.log(`   ID: ${quest._id}`);
    console.log(`📝 記事: ${articleData.title}`);
    console.log(`   ID: ${article._id}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
  }
}

main();
