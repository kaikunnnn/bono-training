/**
 * オンボーディングレッスン（bono-onboarding）を、確定した 6記事・3クエスト構成に
 * 作り直す（既存ドキュメントを再利用=patch。余る1記事だけ削除）。
 *
 * 新構成:
 *   Q1「最初」      : ① コミュニティに入ろう / ② トレーニング内容を決めよう
 *   Q2「コミュニティ」: ③ 自己紹介しよう / ④ 相談・質問を投稿しよう / ⑤ Timesを使おう
 *   Q3「計画」      : ⑥ 計画を立てて進めよう
 *
 * 既存 _id を再利用（title/slug/content を上書き）:
 *   a1→①, a2→②, a3→③, a4→④, a5→⑤, a6→⑥, a7→削除
 *   q1→Q1, q2→Q2, q3→Q3（articles 参照を貼り替え）
 *
 *   npx tsx scripts/rebuild-onboarding-lesson.ts --dry-run
 *   npx tsx scripts/rebuild-onboarding-lesson.ts
 */
import { createClient } from "@sanity/client";
import { config } from "dotenv";
import crypto from "crypto";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });
const DRY_RUN = process.argv.includes("--dry-run");
if (!process.env.SANITY_WRITE_TOKEN && !DRY_RUN) {
  console.error("⚠️  SANITY_WRITE_TOKEN が必要です");
  process.exit(1);
}
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const TAGS = ["オンボーディング", "はじめかた"];

// 本文（承認済み。# タイトルは含めない＝タイトルは title フィールド）
const BODY_1 = `BONOをはじめたら、最初にやってほしいのがSlackコミュニティへの参加です。コンテンツを進めること以外の「相談・質問・イベントの連絡」は、基本的にこのSlackが中心になっています。まずは入っておきましょう。

## Slackコミュニティに入ると、できること

コミュニティに入ると、たとえばこんなことができるようになります。

- **他のメンバーの動きを見られる** — みんながどう学んでいるかが見えて、刺激になります
- **ワークショップやイベントの連絡を受け取りやすい** — お知らせはSlackが中心です
- **フィードバックや質問・相談に使える** — 学習でつまずいたときの頼り先になります

BONOでは、コンテンツを進めること以外（相談・質問・疑問、オフ会などの連絡）は、基本的にSlackコミュニティを中心に動いています。定期的にSlackをチェックして情報を入れておくと、サービスをより使い倒せます。

## コミュニティに参加する

参加は自動ではありません。**自分で参加の手続きをする必要があります。**

- このページにログインした状態であれば、Slackへの参加ボタンが表示されます
- そのボタンから参加してください
- このステップを踏まないと、コミュニティには入れません

### うまく入れないときは

Slackの仕様上、**以前入っていて一度抜けた場合**は、管理者側で設定を変更しないと再参加できないことがあります。もし入れない場合は、お問い合わせからご連絡ください。

## 補足：「完了」ボタンを使って進めよう

この記事は、BONOの「レッスン」という仕組みで作られています。

- タイトルの近くにある**「完了」ボタン**を押すと、この記事自体を完了できます
- コミュニティに入れたら、完了ボタンを押してみましょう
- こうして1つずつ完了していくと、レッスン全体を進めていけます

ぜひ活用してください。`;

const BODY_2 = `BONOは「レッスン」という小さな単位で、テーマごとにスキルアップを進められるようにコンテンツを用意しています。まずは、これから取り組む**最初の1つ**を決めましょう。次の3つの方向性から、自分に必要なものを考えて選ぶことができます。

## 1. ロードマップから選ぶ（目的別）

目的別のロードマップを用意しています。

- UI/UXデザイナーへの**転職**を目指すロードマップ
- **ユーザー中心のデザイン**を学ぶロードマップ
- **UIの基礎**を学ぶロードマップ　など

「自分は何のためにやるのか」という目的からコンテンツを絞り込んで、まず1つ決めていくのがおすすめです。

## 2. 学習ガイドを見て決める

学習ガイドには、次のような解説を用意しています。

- AI時代にどうデザインしていくといいのか
- UI/UXデザイナーに転職するための解説
- UXデザインについての解説　など

「自分のキャリアの方向がまだはっきりしない」という方は、ガイドを読みながら取り組むコンテンツを決める、という進め方もあります。

## 3. レッスンカテゴリから選ぶ

BONOには、最小単位のレッスンを集めた一覧ページがあります。

- カテゴリ別にさまざまなレッスンを見られます
- 気になるカテゴリから、最初の1つを選ぶ方法もあります

## 自信がないときは、相談しよう

上の3つの切り口を使っても、まだ「どれにしよう…」と曖昧なときは、遠慮なく相談してください。

- 質問・相談を使えば、運営の目線でおすすめを提示することもできます
- 相談するときは、**今の状況・目的・目標**をできるだけ詳しく共有してもらえると、より的確に答えられます。可能な範囲でぜひ`;

const BODY_3 = `コミュニティに入ったら、次は自己紹介です。ここで一言書き込んでおくと、他のメンバーとぐっと繋がりやすくなります。

## Slackの自己紹介チャンネルで自己紹介しよう

Slackコミュニティには**自己紹介チャンネル**があります。まずはここで自己紹介をしてみましょう。

- 書き込むことで、他の人とつながりやすくなります
- 少なくとも「コミュニティを使うハードル」が一つ減ります
- かしこまらなくてOK。気軽に投稿してみてください

## デザイン以外の共通項があると、関心が集まりやすい

自己紹介のフォーマットは特に決まっていません。過去に自己紹介している人の投稿が見られるので、その項目にならって書くと書きやすいです。

- つながりを作りたい人ほど、**真面目な話だけ**でつながるのは意外と難しいものです
- 自分の**趣味や気持ち**など、具体的に書いてみると、同じような人の関心が集まりやすくなります
- 人は、共通項がある相手のほうが親近感が湧くからです

## 知り合いや切磋琢磨する仲間を増やしたいなら

自己紹介に加えて、他の人へ**自分から反応していく**のがおすすめです。

- 他の人のTimesをチェックして、コメントやスタンプで少しずつ距離を縮めていきましょう
- 他の人のTimesは、カイクンのTimes（**#times_kaikun**）でよく引用されているので、そこを遡って探してみるのも良いです`;

const BODY_4 = `BONOは基本的に「自分で進める」スタイルです。だからこそ、相談・質問をうまく使うと、スキルアップのスピードが大きく変わります。

## 相談・質問を活用してスキルアップを加速しよう

動画を見るだけで完全に理解するのは、実はなかなか難しいものです。作成した本人にその場で確認することができないからです。

- 同じ動画を何度も見返すのは、ぜひやってほしい進め方です
- とはいえ、動画だけで100%理解できる設計を毎回できているわけではありません
- だからこそ、**質問・相談を定期的に使いながら**、自分のスキルアップの速度を高めていきましょう

## まずは最初の投稿をしてみよう

BONOには**掲示板**があります。そこでスレッドを立てて、最初の投稿をしてみましょう。内容は何でもOKですが、たとえば次のようなものが投稿しやすいです。

- コンテンツの進め方や、スキルアップの計画の相談
- コンテンツ内容の理解の確認（「この進め方で合っている？」など）
- ツールの使い方の相談（動画で紹介した使い方や、コンテンツには出てこない使い方）
- 現場やキャリアの理解についての質問

## 定期的に相談・質問して、自分のペースを作ろう

はじめての投稿ができたら、そこで終わりにせず、**定期的に**相談や質問を持つようにするのがおすすめです。

- 自己学習が中心のスタイルなので、外部からの刺激や確認をペース維持に活かせます
- 動画をただ受け身で見るのではなく、「**自分でデザインする**」という目的を持って、能動的に見ながらメモを取って進めましょう

## 「質問・相談」と「フィードバック」の違い

似ているようで役割が少し違います。

- **質問・相談**：「合っているか」「こうしたらいい？」という問いに答えるもの。やり方・進め方が合っているか、くらいの確認はここでOKです
- **フィードバック**：背景をしっかり聞いて一緒に計画を立てたり、ポイントやコツを詳しく伝えたり、「まずはここを目標に」といった、より詳細で具体的な返答。アウトプットをどう進めるといいか、も含みます

そのため、「このアウトプット、合っていますか？」のような問いは、質問・相談では答えきれないことが多いです（こうした内容はフィードバック向きです）。`;

const BODY_5 = `Slackコミュニティに入ったら、ぜひ使ってほしいのが**Timesチャンネル**です。交流のきっかけを作りやすい場所なので、気軽に活用しましょう。

## Timesチャンネルとは？──交流のきっかけになる場所

Timesチャンネルは、個人のメンバーが**自分のつぶやきをする専用のチャンネル**のことです。使い方は自由です。

- 自分の趣味について書いてもいい
- デザインの学習進捗を書いてもいい
- 自分のメモ代わりに使う人もいれば、心情などいろいろ書いて、つながりを作るために使う人もいます

## 仲良くなりやすい使い方

つながりを作りたい、切磋琢磨する相手を見つけたい──そんなときは、自分のTimesをやるのに加えて、**他の人のTimesに反応していく**のがおすすめです。

- 他の人のTimesを追って、コメントやスタンプをつけて、じわじわ交流していきましょう
- 結局、きっかけが生まれないと交流は進みません
- 自分だけ発信して待つより、誰かの投稿に反応してあげたほうが、距離は縮まりやすいです

## Timesを作ってみよう

自分のTimesチャンネルは、次の手順で作れます。

- BONOのSlackのチャンネル一覧のところにある「**3つの点（…）**」のアイコンをクリックします
- 「**チャンネルを新規作成**」を選びます
- チャンネル名は、先頭に「**times_**」（英字＋アンダーバー）を付けて、その後ろに自分のメンバー名を入れます（例：times_yourname）

新規チャンネルを作成すると、お知らせのチャンネルにその通知が入りますが、気にせず使って大丈夫です。`;

const BODY_6 = `学習を続けるコツは、「いつやるか」を自分で決めておくことです。なんとなく進めるより、時間を決めてしまうほうが、結果的にずっと続きます。

## 取り組む時間を決めよう

まずは、取り組む時間を自分で決めましょう。

- なんとなくで進めるのではなく、**自分で時間を決めて**進めるのがおすすめです
- 特に社会人の方は、まとまった時間を取るのが難しいものです
- だからこそ、やる期間を決めて「**この時間はとにかく開けて進める**」まで決めてしまうことを、強くおすすめします

## 短い期間に区切って進めよう

おすすめは、**2週間単位**でやる日と時間を決めて確保し、その時間は確実にやることです。

- 毎日できるなら、たとえば仕事のあとの8〜9時をカレンダーに入れる
- 定期的に取るのが難しいなら、予定をチェックして、時間のある日にまとめて入れる
- 難しいスケジュールを立てると、把握するのも大変です。「**とにかくこの時間にやる**」くらいでも十分です
- 転職などをガッツリ進めたい方は、その分時間も取れると思うので、もっと細かく計画しても、もちろんOKです

## 予定どおりに進めるのは難しい。期待しすぎずに進めよう

スケジュールを立てても、予定どおりに進むことは実はあまり多くありません。自分が思っていたよりできない、というのが普通だからです（人間なので、統計的にもそうです）。

- 「この時間にやる」と具体的に決めると、イメージはつきやすくなります
- でも、「**必ず守らないといけない**」というプレッシャーや期待を、自分にかけすぎないでください
- まずは、**決めた時間で進めてみる**のをコツコツ続ける／回数を増やしていく、を意識するくらいがちょうどいいです

## それでは、取り組む計画を作ってみよう

次の流れで、実際に計画を立ててみましょう。

1. まず、2週間単位で予定をチェックする
2. その中で、取り組めそうな時間をセットする
3. 可能であれば、リマインダーをセットする（必須ではありません）
4. 実際に、その時間に取り組む
5. 可能であれば、取り組んだ内容や感想をTimesに書き込む
6. このループを2週間単位で回して、進めていく

やっていきましょう！`;

interface NewArticle {
  oldSlug: string; // 再利用する既存記事の現slug
  questKey: "q1" | "q2" | "q3";
  articleNumber: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
}

const NEW_ARTICLES: NewArticle[] = [
  { oldSlug: "bono-onboarding-a1-complete-content", questKey: "q1", articleNumber: 1, title: "コミュニティに入ろう", slug: "bono-onboarding-community", excerpt: "Slackコミュニティに参加して、相談・質問・イベント情報の中心地とつながろう。", body: BODY_1 },
  { oldSlug: "bono-onboarding-a2-join-slack", questKey: "q1", articleNumber: 2, title: "トレーニング内容を決めよう", slug: "bono-onboarding-choose-training", excerpt: "ロードマップ・ガイド・カテゴリから、まず取り組む最初の1レッスンを決めよう。", body: BODY_2 },
  { oldSlug: "bono-onboarding-a3-choose-content", questKey: "q2", articleNumber: 1, title: "自己紹介しよう", slug: "bono-onboarding-self-intro", excerpt: "Slackの自己紹介チャンネルで自己紹介。共通項があるとつながりやすい。", body: BODY_3 },
  { oldSlug: "bono-onboarding-a4-set-time", questKey: "q2", articleNumber: 2, title: "相談・質問を投稿しよう", slug: "bono-onboarding-ask-question", excerpt: "掲示板で最初の相談・質問を投稿。定期的に使うとスキルアップが加速する。", body: BODY_4 },
  { oldSlug: "bono-onboarding-a5-self-intro", questKey: "q2", articleNumber: 3, title: "Timesを使おう", slug: "bono-onboarding-times", excerpt: "個人のつぶやきチャンネルTimesで、ゆるく交流のきっかけをつくろう。", body: BODY_5 },
  { oldSlug: "bono-onboarding-a6-ask-question", questKey: "q3", articleNumber: 1, title: "計画を立てて進めよう", slug: "bono-onboarding-plan", excerpt: "2週間単位で時間を決めて、続く学習計画をつくろう。", body: BODY_6 },
];

const DELETE_ARTICLE_SLUG = "bono-onboarding-a7-request-feedback";

interface NewQuest {
  oldSlug: string;
  key: "q1" | "q2" | "q3";
  questNumber: number;
  title: string;
  slug: string;
  goal: string;
}
const NEW_QUESTS: NewQuest[] = [
  { oldSlug: "bono-onboarding-q1-basics", key: "q1", questNumber: 1, title: "最初", slug: "bono-onboarding-q1-start", goal: "コミュニティに入って、まず取り組む最初のコンテンツを決める" },
  { oldSlug: "bono-onboarding-q2-plan", key: "q2", questNumber: 2, title: "コミュニティ", slug: "bono-onboarding-q2-community", goal: "自己紹介・相談・Timesで、コミュニティを使いこなす" },
  { oldSlug: "bono-onboarding-q3-action", key: "q3", questNumber: 3, title: "計画", slug: "bono-onboarding-q3-plan", goal: "自分の学習計画を立てて、続く仕組みをつくる" },
];

const LESSON_SLUG = "bono-onboarding";
const CONTENT_HEADING = "はじめかたの流れ";

// ---- Portable Text 変換（import script と同じ）----
function randKey(len = 12) { return crypto.randomBytes(len / 2).toString("hex"); }
type PtSpan = { _type: "span"; _key: string; marks: string[]; text: string };
type PtMarkDef = { _key: string; _type: string; href?: string };
type PtBlock = { _type: "block"; _key: string; style: string; markDefs: PtMarkDef[]; children: PtSpan[]; level?: number; listItem?: string };
function parseInline(text: string) {
  const markDefs: PtMarkDef[] = [];
  const tokens: Array<{ marks: string[]; text: string }> = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) tokens.push({ marks: [], text: text.slice(last, m.index) });
    if (m[1]) { const k = randKey(); markDefs.push({ _key: k, _type: "link", href: m[3] }); tokens.push({ marks: [k], text: m[2] }); }
    else if (m[4]) tokens.push({ marks: ["strong"], text: m[5] });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ marks: [], text: text.slice(last) });
  if (tokens.length === 0) tokens.push({ marks: [], text });
  const spans: PtSpan[] = tokens.filter((t) => t.text.length > 0).map((t) => ({ _type: "span", _key: randKey(), marks: t.marks, text: t.text }));
  return { spans, markDefs };
}
function buildBlock(text: string, style: string, opts: { level?: number; listItem?: string } = {}): PtBlock {
  const { spans, markDefs } = parseInline(text);
  const b: PtBlock = { _type: "block", _key: randKey(), style, markDefs, children: spans };
  if (opts.level) b.level = opts.level;
  if (opts.listItem) b.listItem = opts.listItem;
  return b;
}
function mdToPt(md: string): PtBlock[] {
  const lines = md.split("\n");
  const blocks: PtBlock[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { const t = para.join(" ").trim(); if (t) blocks.push(buildBlock(t, "normal")); para = []; } };
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flush(); continue; }
    const h = t.match(/^(#{1,6})\s+(.+)$/);
    if (h) { flush(); blocks.push(buildBlock(h[2], `h${Math.min(h[1].length, 4)}`)); continue; }
    const ul = t.match(/^[-*]\s+(.+)$/);
    if (ul) { flush(); blocks.push(buildBlock(ul[1], "normal", { level: 1, listItem: "bullet" })); continue; }
    const ol = t.match(/^\d+\.\s+(.+)$/);
    if (ol) { flush(); blocks.push(buildBlock(ol[1], "normal", { level: 1, listItem: "number" })); continue; }
    para.push(t);
  }
  flush();
  return blocks;
}

async function main() {
  console.log(`\n${DRY_RUN ? "🧪 DRY RUN" : "🚀 PRODUCTION"} モード\n`);

  // 既存 _id を slug から解決
  const slugs = [
    LESSON_SLUG,
    ...NEW_ARTICLES.map((a) => a.oldSlug),
    DELETE_ARTICLE_SLUG,
    ...NEW_QUESTS.map((q) => q.oldSlug),
  ];
  const docs = await client.fetch<Array<{ _id: string; _type: string; slug: { current: string } }>>(
    `*[slug.current in $slugs]{_id,_type,slug}`, { slugs }
  );
  const idBySlug = new Map(docs.map((d) => [d.slug.current, d._id]));
  const need = (s: string) => { const id = idBySlug.get(s); if (!id) { console.error(`⛔ 見つからない slug: ${s}`); process.exit(1); } return id!; };

  const lessonId = need(LESSON_SLUG);
  const articleIdByKey: Record<string, string> = {};
  for (const a of NEW_ARTICLES) articleIdByKey[a.oldSlug] = need(a.oldSlug);
  const delId = need(DELETE_ARTICLE_SLUG);
  for (const q of NEW_QUESTS) need(q.oldSlug);

  // ---- Articles を上書き ----
  console.log("=== Articles 上書き ===");
  for (const a of NEW_ARTICLES) {
    const id = articleIdByKey[a.oldSlug];
    const content = mdToPt(a.body);
    console.log(`  ${DRY_RUN ? "📝" : "✅"} ${a.title}  (_id=${id}, slug=${a.slug}, blocks=${content.length})`);
    if (!DRY_RUN) {
      await client.patch(id).set({
        title: a.title,
        slug: { _type: "slug", current: a.slug },
        articleNumber: a.articleNumber,
        articleType: "practice",
        excerpt: a.excerpt,
        content,
        tags: TAGS,
        isPremium: false,
      }).commit();
    }
  }

  // ---- Quests を上書き（articles 参照を貼り替え）----
  console.log("\n=== Quests 上書き ===");
  for (const q of NEW_QUESTS) {
    const qid = need(q.oldSlug);
    const articleRefs = NEW_ARTICLES.filter((a) => a.questKey === q.key)
      .sort((x, y) => x.articleNumber - y.articleNumber)
      .map((a) => ({ _key: randKey(), _type: "reference", _ref: articleIdByKey[a.oldSlug] }));
    console.log(`  ${DRY_RUN ? "📝" : "✅"} ${q.title}  (_id=${qid}, slug=${q.slug}, articles=${articleRefs.length})`);
    if (!DRY_RUN) {
      await client.patch(qid).set({
        title: q.title,
        slug: { _type: "slug", current: q.slug },
        questNumber: q.questNumber,
        goal: q.goal,
        articles: articleRefs,
      }).commit();
    }
  }

  // ---- Lesson の contentHeading 更新（quests 参照は既存のまま q1,q2,q3）----
  console.log("\n=== Lesson 更新 ===");
  console.log(`  ${DRY_RUN ? "📝" : "✅"} contentHeading="${CONTENT_HEADING}"`);
  if (!DRY_RUN) {
    await client.patch(lessonId).set({ contentHeading: CONTENT_HEADING }).commit();
  }

  // ---- 余る記事 a7 を削除（quest 参照を外した後なので消せる）----
  console.log("\n=== 余る記事の削除 ===");
  console.log(`  ${DRY_RUN ? "📝(削除予定)" : "🗑"} ${DELETE_ARTICLE_SLUG} (_id=${delId})`);
  if (!DRY_RUN) {
    await client.delete(delId);
  }

  console.log(`\n${DRY_RUN ? "ℹ️ DRY RUN: 書き込みなし" : "✨ 完了（isHidden は据え置き=非公開）"}`);
  console.log("先頭記事: /contents/bono-onboarding-community");
}

main().catch((e) => { console.error("💥", e); process.exit(1); });
