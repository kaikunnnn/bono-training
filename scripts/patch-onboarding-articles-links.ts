/**
 * オンボーディング記事①②③④の本文を、ユーザーFB反映版に更新する。
 * - 指定リンクは linkCard ブロック（OGPカード風）で挿入（RichTextSection が描画）
 * - 内部リンクはルート相対（/roadmap 等）、bo-no.design のみ絶対URL
 * - ⑤Times / ⑥計画 は変更しない
 *
 * 本文中の `::linkcard url="..." title="..." desc="..."` を linkCard ブロックへ変換。
 *
 *   npx tsx scripts/patch-onboarding-articles-links.ts --dry-run
 *   npx tsx scripts/patch-onboarding-articles-links.ts
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

// ============ 本文（# タイトル抜き。::linkcard でカード挿入）============

const BODY_COMMUNITY = `BONOをはじめたら、最初にやってほしいのがSlackコミュニティへの参加です。コンテンツを進めること以外の「相談・質問・イベントの連絡」は、基本的にこのSlackが中心になっています。まずは入っておきましょう。

## Slackコミュニティに入ると、できること

コミュニティに入ると、たとえばこんなことができるようになります。

- **他のメンバーの動きを見られる** — みんながどう学んでいるかが見えて、刺激になります
- **ワークショップやイベントの連絡を受け取りやすい** — お知らせはSlackが中心です
- **フィードバックや質問・相談に使える** — 学習でつまずいたときの頼り先になります

BONOでは、コンテンツを進めること以外（相談・質問・疑問、オフ会などの連絡）は、基本的にSlackコミュニティを中心に動いています。定期的にSlackをチェックして情報を入れておくと、サービスをより使い倒せます。

## コミュニティに参加する

参加は自動ではありません。**自分で参加の手続きをする必要があります。**

コミュニティへは、下の「コミュニティの歩き方」ページに移動して、ページ上部のボタンから参加しましょう！（ログインした状態だと参加ボタンが表示されます。このステップを踏まないと参加できません。）

::linkcard url="/how-to/community" title="コミュニティの歩き方" desc="参加はこのページ上部のボタンから。使い方もまとめています"

### うまく入れないときは

Slackの仕様上、**以前入っていて一度抜けた場合**は、管理者側で設定を変更しないと再参加できないことがあります。もし入れない場合は、お問い合わせからご連絡ください。

## 補足：「完了」ボタンを使って進めよう

この記事は、BONOの「レッスン」という仕組みで作られています。

- タイトルの近くにある**「完了」ボタン**を押すと、この記事自体を完了できます
- コミュニティに入れたら、完了ボタンを押してみましょう
- こうして1つずつ完了していくと、レッスン全体を進めていけます

ぜひ活用してください。`;

const BODY_TRAINING = `BONOは「レッスン」という小さな単位で、テーマごとにスキルアップを進められるようにコンテンツを用意しています。まずは、これから取り組む**最初の1つ**を決めましょう。次の3つの方向性から、自分に必要なものを考えて選ぶことができます。

## 1. ロードマップから選ぶ（目的別）

目的別のロードマップを用意しています。

- UI/UXデザイナーへの**転職**を目指すロードマップ
- **ユーザー中心のデザイン**を学ぶロードマップ
- **UIの基礎**を学ぶロードマップ　など

「自分は何のためにやるのか」という目的からコンテンツを絞り込んで、まず1つ決めていくのがおすすめです。

::linkcard url="/roadmap" title="ロードマップから探す" desc="目的別の学習パスからコンテンツを選べます"

## 2. 学習ガイドを見て決める

「自分のキャリアの方向がまだはっきりしない」という方は、学習ガイドを読みながら取り組むコンテンツを決める進め方もあります。テーマ別に、こんな解説を用意しています。

**AI時代にどうデザインしていくといいのか**

::linkcard url="/guide/ai-design-experience-shift" title="AIとデザイナーの新しい仕事のかたち | 起きている変化と身につける6つのスキル"

**UI/UXデザイナーへの転職**

::linkcard url="https://www.bo-no.design/contents/become-uiux-designer-beginner-guide" title="UI/UXデザイナーは未経験から転職できるのか？年収と将来についても"

::linkcard url="/guide/rdm-howtobeadesigner" title="UIUXデザイナー転職で必要なスキルと要素は何？書類落ちしない条件をプロが解説"

**UXデザインについて**

::linkcard url="/guide/uxresearch_and_uidesign" title="ユーザー理解がUIデザインを変える — 初心者が身につけるべきUXスキルの全体像"

## 3. レッスンカテゴリから選ぶ

BONOには、最小単位のレッスンを集めた一覧ページがあります。カテゴリ別にさまざまなレッスンを見られるので、気になるものから最初の1つを選ぶ方法もあります。

::linkcard url="/lessons" title="レッスン一覧から探す" desc="カテゴリ別にさまざまなレッスンを見られます"

## 自信がないときは、相談しよう

上の3つの切り口を使っても、まだ「どれにしよう…」と曖昧なときは、遠慮なく相談してください。運営の目線でおすすめを提示することもできます。相談するときは、今の状況・目的・目標をできるだけ詳しく共有してもらえると、より的確に答えられます。

::linkcard url="/questions" title="みんなの掲示板で相談する" desc="どれにするか迷ったら、気軽に相談してください"

## まず1つ、コンテンツを決めることから始めましょう

あれこれ迷うより、まず1つ決めて動き出すのが一番の近道です。上のどれかから、最初のレッスンを選んでみましょう。`;

const BODY_SELF_INTRO = `コミュニティに入ったら、次は自己紹介です。ここで一言書き込んでおくと、他のメンバーとぐっと繋がりやすくなります。

## Slackの自己紹介チャンネルで自己紹介しよう

Slackコミュニティには**自己紹介チャンネル**があります。まずはここで自己紹介をしてみましょう。

- 書き込むことで、他の人とつながりやすくなります
- 少なくとも「コミュニティを使うハードル」が一つ減ります
- かしこまらなくてOK。気軽に投稿してみてください

::linkcard url="https://bonoco.slack.com/archives/C01E9V01LH3" title="Slack｜自己紹介チャンネル" desc="まずはここで自己紹介を投稿しよう"

## デザイン以外の共通項があると、関心が集まりやすい

自己紹介のフォーマットは特に決まっていません。過去に自己紹介している人の投稿が見られるので、その項目にならって書くと書きやすいです。

- つながりを作りたい人ほど、**真面目な話だけ**でつながるのは意外と難しいものです
- 自分の**趣味や気持ち**など、具体的に書いてみると、同じような人の関心が集まりやすくなります
- 人は、共通項がある相手のほうが親近感が湧くからです

## 知り合いや切磋琢磨する仲間を増やしたいなら

自己紹介に加えて、他の人へ**自分から反応していく**のがおすすめです。

- 他の人のTimesをチェックして、コメントやスタンプで少しずつ距離を縮めていきましょう
- 他の人のTimesは、カイクンのTimes（**#times_kaikun**）でよく引用されているので、そこを遡って探してみるのも良いです

## さっそく自己紹介してみよう

最初の一歩は自己紹介から。かんたんな内容でOKなので、下のチャンネルから一言投稿してみましょう。

::linkcard url="https://bonoco.slack.com/archives/C01E9V01LH3" title="Slack｜自己紹介チャンネル" desc="かんたんな内容でOK。まずは一言から"`;

const BODY_ASK = `BONOは基本的に「自分で進める」スタイルです。だからこそ、相談・質問をうまく使うと、スキルアップのスピードが大きく変わります。

## 相談・質問を活用してスキルアップを加速しよう

動画を見るだけで完全に理解するのは、実はなかなか難しいものです。作成した本人にその場で確認することができないからです。

- 同じ動画を何度も見返すのは、ぜひやってほしい進め方です
- とはいえ、動画だけで100%理解できる設計を毎回できているわけではありません
- だからこそ、**質問・相談を定期的に使いながら**、自分のスキルアップの速度を高めていきましょう

## まずは最初の投稿をしてみよう

BONOには**掲示板**があります。そこでスレッドを立てて、最初の投稿をしてみましょう。内容は何でもOKです。

::linkcard url="/questions" title="みんなの掲示板で投稿する" desc="スレッドを立てて、最初の相談・質問をしてみよう"

## こんな相談・質問ができます

「何を書けばいいかわからない」ときのために、BONOメンバーがよく使うパターンを挙げます。こんな内容が投稿しやすいです。

- **進め方の相談**：「◯◯を終えたら、次は何に取り組むといい？」
- **学習計画の相談**：「働きながらだと時間が取りづらい。2週間でどこまで進めるのが現実的？」
- **理解の確認**：「この動画のこの部分、こういう解釈で合っていますか？」
- **やり方が合っているかの確認**：「この情報設計の進め方で合ってる？」（※アウトプットの良し悪しはフィードバックへ）
- **ツールの使い方**：「Figmaのオートレイアウトでこのパーツを組むには？」「AIを使ったプロトタイピングの進め方」
- **用語・概念の疑問**：「UXリサーチとユーザビリティテストの違いが曖昧」
- **キャリア・転職の疑問**：「ポートフォリオには何をどれくらい載せる？」「未経験からの転職、まず何から？」
- **詰まったときの相談**：「手が止まってしまった。どう立て直すといい？」

## 定期的に相談・質問して、自分のペースを作ろう

はじめての投稿ができたら、そこで終わりにせず、**定期的に**相談や質問を持つようにするのがおすすめです。

- 自己学習が中心のスタイルなので、外部からの刺激や確認をペース維持に活かせます
- 動画をただ受け身で見るのではなく、「**自分でデザインする**」という目的を持って、能動的に見ながらメモを取って進めましょう

## 「質問・相談」と「フィードバック」の違い

似ているようで役割が少し違います。

- **質問・相談**：「合っているか」「こうしたらいい？」という問いに答えるもの。やり方・進め方が合っているか、くらいの確認はここでOKです
- **フィードバック**：背景をしっかり聞いて一緒に計画を立てたり、ポイントやコツを詳しく伝えたり、「まずはここを目標に」といった、より詳細で具体的な返答。アウトプットをどう進めるといいか、も含みます

そのため、「このアウトプット、合っていますか？」のような問いは、質問・相談では答えきれないことが多いです（こうした内容はフィードバック向きです）。

## 気軽に相談・質問してみよう

小さな疑問でOKです。1回やってみると、聞くことに慣れて学習が一気に進みます。まずは1つ、投稿してみましょう。

::linkcard url="/questions" title="みんなの掲示板で相談する" desc="小さな疑問でOK。1回やってみると学習が加速します"`;

const ARTICLES: { slug: string; body: string; label: string }[] = [
  { slug: "bono-onboarding-community", body: BODY_COMMUNITY, label: "①コミュニティに入ろう" },
  { slug: "bono-onboarding-choose-training", body: BODY_TRAINING, label: "②トレーニング内容を決めよう" },
  { slug: "bono-onboarding-self-intro", body: BODY_SELF_INTRO, label: "③自己紹介しよう" },
  { slug: "bono-onboarding-ask-question", body: BODY_ASK, label: "④相談・質問を投稿しよう" },
];

// ============ Portable Text 変換（::linkcard 対応）============
function randKey(len = 12) { return crypto.randomBytes(len / 2).toString("hex"); }
type PtSpan = { _type: "span"; _key: string; marks: string[]; text: string };
type PtMarkDef = { _key: string; _type: string; href?: string };
type PtBlock = { _type: "block"; _key: string; style: string; markDefs: PtMarkDef[]; children: PtSpan[]; level?: number; listItem?: string };
type LinkCard = { _type: "linkCard"; _key: string; url: string; title: string; description?: string };
type Block = PtBlock | LinkCard;

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
function parseLinkCard(attrs: string): LinkCard | null {
  const url = (attrs.match(/url="([^"]*)"/) || [])[1];
  const title = (attrs.match(/title="([^"]*)"/) || [])[1];
  const desc = (attrs.match(/desc="([^"]*)"/) || [])[1];
  if (!url || !title) return null;
  const card: LinkCard = { _type: "linkCard", _key: randKey(), url, title };
  if (desc) card.description = desc;
  return card;
}
function mdToPt(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { const t = para.join(" ").trim(); if (t) blocks.push(buildBlock(t, "normal")); para = []; } };
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { flush(); continue; }
    const lc = t.match(/^::linkcard\s+(.+)$/);
    if (lc) { flush(); const card = parseLinkCard(lc[1]); if (card) blocks.push(card); continue; }
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
  const slugs = ARTICLES.map((a) => a.slug);
  const docs = await client.fetch<Array<{ _id: string; slug: { current: string } }>>(
    `*[_type=="article" && slug.current in $slugs]{_id,slug}`, { slugs }
  );
  const idBySlug = new Map(docs.map((d) => [d.slug.current, d._id]));

  for (const a of ARTICLES) {
    const id = idBySlug.get(a.slug);
    if (!id) { console.error(`⛔ 見つからない: ${a.slug}`); process.exit(1); }
    const content = mdToPt(a.body);
    const cards = content.filter((b) => b._type === "linkCard").length;
    console.log(`  ${DRY_RUN ? "📝" : "✅"} ${a.label}  (_id=${id}, blocks=${content.length}, linkCards=${cards})`);
    if (!DRY_RUN) {
      await client.patch(id).set({ content }).commit();
    }
  }
  console.log(`\n${DRY_RUN ? "ℹ️ DRY RUN: 書き込みなし" : "✨ 完了（⑤Times/⑥計画 は変更なし）"}`);
}
main().catch((e) => { console.error("💥", e); process.exit(1); });
