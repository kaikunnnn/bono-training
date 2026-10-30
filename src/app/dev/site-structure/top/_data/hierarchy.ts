/**
 * #267 各階層のページのデータ（267-Q 3章: 1つのファイルに全部の項目を持つ）
 *
 * - 名前の正: 267-P 7章（検索の言葉）。「こんなとき」は本人の言葉（同 7章の ← の右）
 * - 悩みの4つの分け方: 267-P 2章（見た目／組み立て／進め方／確かめる・伝える）
 * - 悩み → 主役（コースの章・単発のレッスン）: 267-J 4章。新しく足した項目は近いものを仮で当てた
 * - 入口（01〜03）: 267-L 4章を土台に、初心者が自然に当たるものを 01 に足した（仮）
 * - 親は1つだけ（267-O 1章）。悩み → 悩みの一覧、勉強法 → 勉強法、キャリア → キャリア
 * - 勉強法・キャリアの項目は S3 のハブで使う。リンクは 2026-10-29 に localhost で実在を確かめた（/stories は名前の無い題で載せる）
 *
 * kari: true / nameKari: true は推測で書いた文言（画面では「仮」の印を付ける）。
 * 本番のページ（/lessons・/contents・/guide・/training・/questions・/how-to）はそのままの URL。
 * /guide は Sanity の公開記事だけを使う（content/guide の Markdown は /guide では出ない）。2026-10-29 に localhost で確認。
 */

import { courses } from "../../../course-pages/data";
import { LESSON_MAP, type GuideLesson } from "@/lib/content-guide/lesson-map";
import { TOP_BASE } from "../_parts/top-parts";

// ------------------------------------------------------------
// 型
// ------------------------------------------------------------

export type Parent = "troubles" | "study" | "career";
export type EntryNo = "01" | "02" | "03";
export type Kind = "記事" | "レッスン" | "お題" | "コース" | "体験談";
export type TroubleGroupId = "visual" | "structure" | "process" | "check";

export interface TroubleGroup {
  id: TroubleGroupId;
  label: string;
  /** 一覧の見出しの下の1行（仮） */
  lead: string;
}

/** 主役のカード（1枚）の行き先 */
export type MainRef =
  | { type: "course"; courseSlug: string; chapterTitle: string; reason: string }
  | { type: "lesson"; slug: string; reason: string }
  | { type: "people"; reason: string };

export interface LinkRef {
  kind: Kind;
  label: string;
  href: string;
  /** まとめ記事の「詳しくは」に添える一行の理由（仮） */
  reason?: string;
}

export interface RelatedRef {
  id: string;
  /** 一行の理由（仮） */
  reason: string;
}

export interface HubItem {
  id: string;
  parent: Parent;
  /** 名前（検索の言葉） */
  name: string;
  /** 名前が「推定」のとき（267-P 7章の〔推定〕） */
  nameKari?: boolean;
  /** こんなとき（本人の言葉） */
  when: string;
  /** 読むとできること（1行・仮） */
  canDo: string;
  group?: TroubleGroupId;
  /** 01〜03 の入口（悩みだけ） */
  entries?: EntryNo[];
  /** カードのサムネイルに使う実在のレッスン（Sanity の slug） */
  thumb?: string;
  main?: MainRef;
  /** 記事・お題などのリンク（勉強法・キャリアは /guide の記事を最大3本） */
  links: LinkRef[];
  related: RelatedRef[];
  /** 項目ページの要点（2〜3文・仮）。まとめ記事では節の「短い答え」 */
  summary?: string[];
  /** まとめ記事の節の番号つきの手順（1〜3・仮） */
  steps?: string[];
  /** 小さく置く項目（勉強法の本・Figma） */
  small?: boolean;
}

// ------------------------------------------------------------
// URL
// ------------------------------------------------------------

export const TROUBLES_BASE = `${TOP_BASE}/troubles`;
export const troubleHref = (id: string) => `${TROUBLES_BASE}/${id}`;
export const lessonHref = (slug: string) => `/lessons/${slug}`;
export const courseHref = (slug: string) => `/dev/course-pages/v2/${slug}`;
export const BOARD_HREF = "/questions";
export const FEEDBACK_HREF = "/how-to/feedback";

// ------------------------------------------------------------
// 悩みの4つの分け方・入口
// ------------------------------------------------------------

export const TROUBLE_GROUPS: TroubleGroup[] = [
  { id: "visual", label: "見た目", lead: "画面はできたのに、どこか垢抜けないとき" },
  { id: "structure", label: "組み立て", lead: "何をどこに置くか、画面をどうつなぐかで止まったとき" },
  { id: "process", label: "進め方", lead: "手の付け方や、何を作るかで止まったとき" },
  { id: "check", label: "確かめる・伝える", lead: "作ったあと、自信を持って見せたいとき" },
];

export const ENTRIES: { no: EntryNo; label: string }[] = [
  { no: "01", label: "転職を目指している" },
  { no: "02", label: "スキルを伸ばしたい" },
  { no: "03", label: "仕事でデザインしている" },
];

// ------------------------------------------------------------
// 悩み（14）
// ------------------------------------------------------------

const TROUBLES: HubItem[] = [
  // ---- 見た目 ----
  {
    id: "ui-color",
    parent: "troubles",
    name: "UIの配色・色の決め方",
    when: "見た目がなんとなく素人っぽい。色をどう決めればいいか分からない",
    canDo: "ベース・文字・アクセントの3役で、色を迷わず決められる",
    group: "visual",
    entries: ["01", "02"],
    thumb: "uivisual",
    main: {
      type: "course",
      courseSlug: "ui-design-visual",
      chapterTitle: "UI見た目の6要素をマスターしよう",
      reason: "色・余白・文字を要素ごとに見直す型を、お題で身につけられるから",
    },
    links: [
      { kind: "記事", label: "配色の基本をマスター！理論から実践まで", href: "/contents/bannerbeginner-04-1" },
      { kind: "記事", label: "デザインしたチャットUIを解説【なぜチャットの色は1色じゃないのか？】", href: "/contents/uidesignbeginner-06" },
    ],
    related: [
      { id: "ui-spacing-type", reason: "色を減らしても散らかるなら、余白と文字の順番を見直す" },
      { id: "ui-reference", reason: "決め方の型は、参考のUIから借りると早い" },
    ],
    summary: [
      "UIの色は、飾りより先に「意味」で決めます。",
      "ベースの色と文字の色を決め、押してほしい場所にだけアクセントの色を使います。",
      "色の数を減らすほうが、画面はまとまりやすくなります。",
    ],
  },
  {
    id: "ui-spacing-type",
    parent: "troubles",
    name: "UIの余白と文字の整え方",
    nameKari: true,
    when: "お手本を真似しても、同じ形にならない",
    canDo: "余白と文字の大きさを、ルールで決めてそろえられる",
    group: "visual",
    entries: ["01", "02"],
    thumb: "three-structures-ui-design",
    main: {
      type: "course",
      courseSlug: "ui-design-first",
      chapterTitle: "UI構造の2要素をマスターしよう",
      reason: "お手本の画面を、余白と並びの決まりに分けて読めるようになるから",
    },
    links: [
      { kind: "記事", label: "メッセージリストUIをデザイン【余白のサイズはルールで決める】", href: "/contents/uidesignbeginner-03" },
      { kind: "記事", label: "【練習】ニュースアプリで学ぶ文字のサイズと階層のデザイン術", href: "/contents/ui-typography-2-2" },
    ],
    related: [
      { id: "ui-color", reason: "余白がそろったら、次は色の役割を決める" },
      { id: "wireframe", reason: "形が崩れるなら、1画面の骨組みから組み直す" },
    ],
    summary: [
      "余白は、その場の見た目で決めるとすぐにバラバラになります。",
      "「8の倍数だけ使う」のようなルールを先に決め、関係の近い要素ほど余白を狭くします。",
    ],
  },
  {
    id: "ui-reference",
    parent: "troubles",
    name: "UIの参考サイトと集め方",
    when: "参考のUIを集めているのに、自分のデザインに活かせない",
    canDo: "参考のUIから、真似していい決まりだけを抜き出せる",
    group: "visual",
    entries: ["02"],
    thumb: "steel-design-sense",
    main: {
      type: "course",
      courseSlug: "ui-design-visual",
      chapterTitle: "世の中からデザインを学ぶ発想法をマスターしよう",
      reason: "集めた参考を、なぜそうなっているかまで読む練習ができるから",
    },
    links: [
      { kind: "記事", label: "参考UIの調べ方", href: "/contents/ui-pattern-5" },
      { kind: "記事", label: "参考デザインをかんたんに整理して「自分だけの引き出し」をつくれる神アプリ", href: "/guide/design-reference-eagle" },
    ],
    related: [
      { id: "ui-color", reason: "参考から色の決まりを借りるときに" },
      { id: "wireframe", reason: "参考を見ても手が止まるなら、骨組みから始める" },
    ],
    summary: [
      "参考は、見た目をまるごと写すより「なぜそうなっているか」を読むほうが活きます。",
      "同じ種類の画面を3つ並べて、共通しているところを自分の決まりにします。",
    ],
  },

  // ---- 組み立て ----
  {
    id: "information-architecture",
    parent: "troubles",
    name: "情報設計のやり方",
    when: "考えたことを、画面に落とし込めない",
    canDo: "1画面に何を、どの順で置くかを自分で決められる",
    group: "structure",
    entries: ["01", "02"],
    thumb: "ui-architect-beginner",
    main: {
      type: "lesson",
      slug: "ui-architect-beginner",
      reason: "要件から画面の中身を決める流れを、実際の画面で練習できるから",
    },
    links: [
      { kind: "記事", label: "要件をUIに反映するデザインの流れ", href: "/contents/ui-architect-beginner-13" },
      { kind: "記事", label: "UI情報設計をブラッシュアップするには？", href: "/contents/ui-architect-beginner-61" },
      { kind: "お題", label: "社内本貸し出しシステムをデザインしよう", href: "/training/book-lending-system" },
    ],
    related: [
      { id: "screen-flow", reason: "1画面が決まったら、次は画面同士のつながり" },
      { id: "feature-scope", reason: "置きたいものが多すぎるなら、先に機能を絞る" },
      { id: "wireframe", reason: "決めた順番を、骨組みの形にするとき" },
    ],
    summary: [
      "画面に落とし込めないときは、見た目より先に「誰が・何をしに来たか」が決まっていないことが多いです。",
      "それが1文で書けたら、いちばん先に見せるものを1つ決め、残りを並べる順番を決めます。",
    ],
  },
  {
    id: "screen-flow",
    parent: "troubles",
    name: "画面遷移図の作り方",
    when: "画面同士がつながらない。押すと思っていない画面に行く",
    canDo: "ユーザーの動きに沿って、画面のつながりを1枚の図にできる",
    group: "structure",
    entries: ["02"],
    thumb: "navigation-basics",
    main: {
      type: "course",
      courseSlug: "ui-experience",
      chapterTitle: "ナビゲーションの基本",
      reason: "いまどこにいて次にどこへ行けるかを、画面の上で設計できるから",
    },
    links: [
      { kind: "記事", label: "使いやすいUIをデザインしたいなら『ナビゲーション』を理解しよう", href: "/contents/uinavi01" },
      { kind: "記事", label: "UIで道案内！ナビゲーションの基本", href: "/contents/ui-layout-basic05-1" },
    ],
    related: [
      { id: "ui-states", reason: "つながりの途中にある「押したあと」も描く" },
      { id: "information-architecture", reason: "1画面の中身が決まっていないと、つながりも決まらない" },
    ],
    summary: [
      "画面遷移図は、画面の一覧ではなく「ユーザーが何をしたら、どこへ行くか」の図です。",
      "始まりとゴールを先に置き、その間の操作を矢印でつなぐと、足りない画面が見えてきます。",
    ],
  },
  {
    id: "ui-states",
    parent: "troubles",
    name: "UIの状態とインタラクションの設計",
    nameKari: true,
    when: "「ボタンを押したら…」の先を作っていない",
    canDo: "押したとき・待つとき・失敗したときの画面まで描ける",
    group: "structure",
    entries: ["02"],
    thumb: "uidesignflow",
    main: {
      type: "course",
      courseSlug: "ui-experience",
      chapterTitle: "インタラクションの基本",
      reason: "状態の変化とフィードバックの見せ方を、まとめて学べるから",
    },
    links: [{ kind: "レッスン", label: "UIデザインの基本", href: lessonHref("uidesignflow") }],
    related: [
      { id: "screen-flow", reason: "状態が増えたら、遷移図に書き足す" },
      { id: "usability", reason: "反応のない画面は、使いにくさの入り口" },
    ],
    summary: [
      "1枚の画面には、空のとき・読み込み中・エラー・完了などの「状態」があります。",
      "ボタンを1つ置いたら、押したあとに何が起きるかを書き出して、画面を足します。",
    ],
  },
  {
    id: "feature-scope",
    parent: "troubles",
    name: "機能の絞り方・ユースケースの決め方",
    nameKari: true,
    when: "機能を全部入れたくなって、まとまらない",
    canDo: "いちばん大事な使われ方を1つ決め、機能を絞れる",
    group: "structure",
    entries: ["03"],
    thumb: "ooui",
    main: {
      type: "lesson",
      slug: "ui-architect-beginner",
      reason: "要件の中から、画面に出すものを選ぶ考え方を練習できるから",
    },
    links: [{ kind: "レッスン", label: "OOUI コンテンツ中心のUI設計", href: lessonHref("ooui") }],
    related: [
      { id: "problem-definition", reason: "絞れないのは、解く課題が決まっていないから" },
      { id: "information-architecture", reason: "絞ったあと、1画面に置く順番を決める" },
    ],
    summary: [
      "機能が増えるのは、誰の・どんな場面のための画面かが広すぎるときです。",
      "いちばん大事な使われ方を1つ選び、その流れに要らない機能は次の版に回します。",
    ],
  },
  {
    id: "usability",
    parent: "troubles",
    name: "使いやすいUIの基本（ユーザビリティ）",
    nameKari: true,
    when: "見た目はいいのに、使いにくいと言われる",
    canDo: "使いにくさの原因を、決まった観点で見つけられる",
    group: "structure",
    entries: ["02"],
    thumb: "ui-layout-basic",
    main: {
      type: "course",
      courseSlug: "ui-experience",
      chapterTitle: "UIデザインの機能の基本をデザインできる",
      reason: "作る・見る・直す・探す、の基本の型を押さえられるから",
    },
    links: [
      { kind: "レッスン", label: "使いやすいUIの秘密", href: lessonHref("ui-layout-basic") },
      { kind: "記事", label: "NGなUIで理解する『UI3構造』", href: "/contents/ui-layout-basic02-1" },
    ],
    related: [
      { id: "ui-states", reason: "押したあとの反応が無いと、使いにくく感じる" },
      { id: "self-check", reason: "決まった観点で、自分の画面を見直す" },
    ],
    summary: [
      "使いにくさの多くは、見た目ではなく「次に何をすればいいか分からない」ことから来ます。",
      "押せるものが押せそうに見えるか、いまどこにいるか分かるか、を順に確かめます。",
    ],
  },

  // ---- 進め方 ----
  {
    id: "wireframe",
    parent: "troubles",
    name: "ワイヤーフレームの作り方",
    when: "最初の1画面が作れない。Figmaで作り切れない",
    canDo: "色を付ける前に、1画面の骨組みを作れる",
    group: "process",
    entries: ["01", "02"],
    thumb: "tutorial-uivisual",
    main: {
      type: "course",
      courseSlug: "ui-design-first",
      chapterTitle: "UIデザインの見た目づくりを経験しよう",
      reason: "お手本に沿って、最初の1画面を最後まで作り切れるから",
    },
    links: [
      { kind: "レッスン", label: "はじめてのUIデザイン", href: lessonHref("uidesignbeginner") },
      { kind: "お題", label: "UIデザイン入門DailyUI", href: "/training/ui_starter_dailyui" },
    ],
    related: [
      { id: "information-architecture", reason: "骨組みに何を置くかは、情報設計で決める" },
      { id: "ui-spacing-type", reason: "骨組みができたら、余白と文字を整える" },
    ],
    summary: [
      "最初の1画面は、色や飾りを付けずに灰色の箱だけで作ります。",
      "見出し・中身・ボタンの3つを置けたら、それがワイヤーフレームです。",
    ],
  },
  {
    id: "problem-definition",
    parent: "troubles",
    name: "課題の決め方",
    nameKari: true,
    when: "何を解決するのか決められない。「使いにくい」を課題にしてしまう",
    canDo: "誰が・どこで・何に困っているかを1文の課題にできる",
    group: "process",
    entries: ["03"],
    thumb: "persona-based-design",
    main: {
      type: "lesson",
      slug: "persona-based-design",
      reason: "ペルソナから課題を立て、画面まで落とす流れを通しで学べるから",
    },
    links: [{ kind: "レッスン", label: "FAILURE POINT 課題発見の方法", href: lessonHref("failurepoint") }],
    related: [
      { id: "interview-analysis", reason: "課題の材料は、ユーザーの話の中にある" },
      { id: "feature-scope", reason: "課題が決まると、入れる機能も絞れる" },
    ],
    summary: [
      "「使いにくい」は感想で、課題ではありません。",
      "誰が・どの場面で・何に困っているかまで書くと、画面で解ける大きさになります。",
    ],
  },
  {
    id: "interview-analysis",
    parent: "troubles",
    name: "ユーザーインタビューの分析方法",
    nameKari: true,
    when: "インタビューしたけど、まとめ方が分からない",
    canDo: "聞いた話を、行動と気持ちに分けて整理できる",
    group: "process",
    entries: ["03"],
    // 一覧の中で同じ表紙が並ばないよう、主役とは別の実在レッスンの表紙にする（S1 のスクショへの指摘）
    thumb: "zerokara-userinterview",
    main: {
      type: "lesson",
      slug: "persona-based-design",
      reason: "聞いた話からペルソナをつくり、課題につなげる手順があるから",
    },
    links: [{ kind: "レッスン", label: "ゼロからはじめるユーザーインタビュー", href: lessonHref("zerokara-userinterview") }],
    related: [
      { id: "problem-definition", reason: "整理した話から、解く課題を1つ選ぶ" },
      { id: "design-rationale", reason: "聞いた話は、デザインの理由として使える" },
    ],
    summary: [
      "話をそのまま並べると、まとまりません。",
      "「何をしたか（行動）」と「どう感じたか（気持ち）」に分けて付箋にすると、くり返し出てくる困りごとが見えてきます。",
    ],
  },
  {
    id: "ai-workflow",
    parent: "troubles",
    name: "AIでUIデザインするときの進め方",
    nameKari: true,
    when: "AIに任せたら、自分で判断できなくなった",
    canDo: "AIに任せる作業と、自分で決める作業を分けられる",
    group: "process",
    entries: ["03"],
    thumb: "aiui_beginner",
    main: {
      type: "course",
      courseSlug: "ai-ui-design",
      chapterTitle: "デザインのワークフローにAIを取り込もう【プロトタイピング】",
      reason: "AIで案を広げ、どれを選ぶかは自分で決める流れを練習できるから",
    },
    links: [{ kind: "レッスン", label: "AIでUIスタイリング入門", href: lessonHref("ai-ui-styling-beginner") }],
    related: [
      { id: "self-check", reason: "AIの案を選ぶときの、自分の基準をつくる" },
      { id: "design-rationale", reason: "選んだ理由を、自分の言葉で説明する" },
    ],
    summary: [
      "AIは案を広げるのが得意で、どれを選ぶかは決めてくれません。",
      "先に「誰の・何のための画面か」を自分で書いてから頼むと、選ぶ基準を手放さずにすみます。",
    ],
  },

  // ---- 確かめる・伝える ----
  {
    id: "self-check",
    parent: "troubles",
    name: "UIデザインのセルフチェック",
    nameKari: true,
    when: "作ったけど、これで合っているのか分からない",
    canDo: "自分の画面を、決まった観点で見直せる",
    group: "check",
    entries: ["01", "03"],
    thumb: "ui-design-flow-lv1",
    main: {
      type: "people",
      reason: "自分で確かめきれないところは、人に見てもらうのがいちばん早いから",
    },
    links: [{ kind: "レッスン", label: "UIが上手くなる人の“デザインサイクル”", href: lessonHref("ui-design-flow-lv1") }],
    related: [
      { id: "usability", reason: "見直す観点のいちばん目は、使いやすさ" },
      { id: "design-rationale", reason: "合っているかは、理由を説明できるかで分かる" },
    ],
    summary: [
      "「合っているか」は、何のための画面かが決まっていないと確かめられません。",
      "まず目的を1文で書き、それに沿っているかを見て、それでも迷うところは人に見てもらいます。",
    ],
  },
  {
    id: "design-rationale",
    parent: "troubles",
    name: "デザインの意図の伝え方",
    nameKari: true,
    when: "なぜこのデザインにしたか、説明できない",
    canDo: "「誰の・何のために・だからこの形」の順で話せる",
    group: "check",
    entries: ["01", "03"],
    thumb: "purposeuidesign",
    main: {
      type: "lesson",
      slug: "persona-based-design",
      reason: "ペルソナから画面までを一本の理由でつなぐ流れがあるから",
    },
    links: [
      { kind: "記事", label: "UIUXデザイナー転職 面接質問集｜企業が見るポイントを学習に取り入れよう", href: "/guide/uiux-interview-tips-and-checkpoints" },
      { kind: "記事", label: "プロダクトデザイナーの提案がPMに通らないときの考え方", href: "/guide/designer-proposal-after-mvp-marketing" },
    ],
    related: [
      { id: "problem-definition", reason: "理由の出発点は、解いている課題" },
      { id: "self-check", reason: "説明できないところは、見直すところ" },
    ],
    summary: [
      "説明できないのは、話すのが苦手だからではなく、決めた順番を覚えていないことが多いです。",
      "「誰の・何のために・だからこの形」の3つをメモしながら作ると、そのまま説明になります。",
    ],
  },
];

// ------------------------------------------------------------
// 勉強法（7。最後の1つは小さく置く）
// ------------------------------------------------------------

const STUDY: HubItem[] = [
  {
    id: "how-to-study",
    parent: "study",
    name: "UIデザインの勉強方法",
    when: "何から、どの順で学べばいいか分からない",
    canDo: "学ぶ順番の全体を知り、今週やることを決められる",
    summary: [
      "UIデザインは「基本を知る → まねして作る → 自分で考えて作る → 見てもらって直す」の順で進めると迷いにくくなります。",
      "読む時間より、手を動かす時間を多めにとるのが続けるコツです。",
    ],
    steps: [
      "学ぶ順番の全体を見て、今どこにいるかを確かめる",
      "今週やるレッスンかお題を1つに絞る",
      "作ったら見返して、次の週の1つを決める",
    ],
    links: [
      { kind: "記事", label: "現場10年目が教える、未経験からUIUXデザインを勉強する7つのコツ", href: "/guide/rdm-7-tips-for-learning-design", reason: "続けるためのコツを、現場の目線でまとめた記事" },
      { kind: "記事", label: "未経験からUIUXデザイナーへ転職するロードマップ。プロが考えるスキル習得の流れ", href: "/guide/rdm-howtostart-roadmap", reason: "学ぶ順番の全体を、スキルごとに確かめる" },
      { kind: "レッスン", label: "デザインの学習環境", href: lessonHref("howtostudy"), reason: "始める前に、道具と学ぶ環境をそろえる" },
    ],
    related: [
      { id: "beginner-start", reason: "まったくの初めてなら、最初の1本から" },
      { id: "while-working", reason: "順番が分かったら、続けられる進め方に" },
    ],
  },
  {
    id: "self-study",
    parent: "study",
    name: "UIデザインは独学できる？",
    when: "一人だと限界を感じる。誰かに見てもらいたい",
    canDo: "独学で行けるところと、人に見てもらう学び方の違いが分かる",
    summary: [
      "基本の知識と、画面を作るところまでは独学で十分に進められます。むずかしいのは、自分の画面のどこが良くて、どこが足りないかを自分で見分けることです。",
      "一人で進める部分と、人に見てもらう部分を分けておくと、独学でも遠回りしにくくなります。",
    ],
    steps: [
      "何を、いつまでに作るかを決める",
      "レッスンとお題で、1画面ずつ作る",
      "迷ったところだけ、人に見てもらう",
    ],
    links: [
      { kind: "記事", label: "デザイン学習の成功率UP「目標設定」のつくり方", href: "/guide/rdm-goalsetting", reason: "一人だと決めにくい「何のために、いつまでに」を先に決める" },
      { kind: "レッスン", label: "UIが上手くなる人の“デザインサイクル”", href: lessonHref("ui-design-flow-lv1"), reason: "作って見直す流れを、一人でも回せるようにする" },
      { kind: "記事", label: "フィードバックの使い方", href: FEEDBACK_HREF, reason: "自分では見分けにくいところを、現役のデザイナーに見てもらう" },
    ],
    related: [
      { id: "get-feedback", reason: "見てもらう方法を、具体的に知る" },
      { id: "how-to-study", reason: "独学の順番を整えるとき" },
    ],
  },
  {
    id: "beginner-start",
    parent: "study",
    name: "UIデザイン初心者は何から始める",
    when: "右も左も分からない。最初の1本を知りたい",
    canDo: "最初に開くレッスンを1本に決められる",
    summary: [
      "最初の1本は「はじめてのUIデザイン」で十分です。道具の使い方を先に全部覚えようとせず、1画面を最後まで作りきることを優先します。",
      "Figmaの操作は、作りながら分からないところだけ調べれば追いつきます。",
    ],
    steps: [
      "Figmaを開いて、基本の操作だけ触っておく",
      "「はじめてのUIデザイン」を通して、1画面を作りきる",
      "作った画面を見返し、次に練習したいところを1つ決める",
    ],
    links: [
      { kind: "レッスン", label: "はじめてのUIデザイン", href: lessonHref("uidesignbeginner"), reason: "最初の1本。1画面を作りきるまでを一緒に進める" },
      { kind: "記事", label: "UI/UXデザイナーは未経験から転職できるのか？", href: "/guide/become-uiux-designer-beginner-guide", reason: "仕事にすることまで考えているなら、先に全体を知っておく" },
      { kind: "レッスン", label: "Figmaの使い方入門", href: lessonHref("figmabeginner"), reason: "操作で手が止まったときに開く" },
    ],
    related: [
      { id: "practice", reason: "最初の1本のあとは、手を動かす練習へ" },
      { id: "how-to-study", reason: "全体の順番も知っておく" },
    ],
  },
  {
    id: "while-working",
    parent: "study",
    name: "働きながらUIデザインを学ぶ",
    when: "仕事と両立したい。始めても続かない",
    canDo: "平日と休日で、無理なく続く進め方を決められる",
    summary: [
      "働きながら学ぶなら、平日は短い時間でできることだけ、休日にまとまった作業をする、と分けると続きやすくなります。",
      "続かなくなる原因の多くは、その日にやることが決まっていないことです。",
    ],
    steps: [
      "平日の15〜30分でやること（記事を1本読む・トレースを1枚）を決める",
      "休日に、1画面を作る時間をまとめてとる",
      "月に1回、作ったものを見てもらう日を決める",
    ],
    links: [
      { kind: "体験談", label: "働きながらデザインを独学する方法（先輩の転職体験談）", href: "/stories/youhadouyatedezainanitara", reason: "仕事を続けながら学んだ人が、どう時間をつくったか" },
      { kind: "記事", label: "デザイン学習の成功率UP「目標設定」のつくり方", href: "/guide/rdm-goalsetting", reason: "無理のない目標と期限の決め方" },
      { kind: "レッスン", label: "BONOのはじめかた", href: lessonHref("bono-onboarding"), reason: "BONOを使い始めるときの、最初の1週間の進め方" },
    ],
    related: [
      { id: "practice", reason: "短い時間でも進む練習を選ぶ" },
      { id: "get-feedback", reason: "一人で続かないなら、見てもらう約束をつくる" },
    ],
  },
  {
    id: "practice",
    parent: "study",
    name: "UIデザインの練習方法（UIトレース・お題）",
    when: "見るだけで、手が止まってしまう",
    canDo: "トレースとお題で、毎日少しずつ手を動かせる",
    summary: [
      "見るだけで手が止まるときは、UIトレースでよくできた画面を自分の手で作り直すところから始めます。",
      "慣れてきたら、お題で条件だけ決まった画面を自分で考えて作ります。",
    ],
    steps: [
      "よく使うアプリの画面を1枚選び、UIトレースする",
      "トレースで気づいた余白や文字の大きさをメモする",
      "お題で、その気づきを使って1画面を作る",
    ],
    links: [
      { kind: "記事", label: "【初心者】最短で基礎を得るUIデザイン勉強法、それは定番UIのマネです", href: "/contents/howtostudydesign-steal", reason: "定番のUIをまねして作るときの、見た目・機能・構造の3つの見方" },
      { kind: "お題", label: "UIデザイン入門DailyUI", href: "/training/ui_starter_dailyui", reason: "短い時間で作れる、毎日のお題" },
      { kind: "レッスン", label: "賃貸アプリで基本UIトレーニング", href: lessonHref("weeklyui-baseui-chintai"), reason: "基本のUIを、実際のアプリの形で練習する" },
    ],
    related: [
      { id: "get-feedback", reason: "作ったものを見てもらうと、次の練習が決まる" },
      { id: "beginner-start", reason: "練習の前に、最初の1本を通す" },
    ],
  },
  {
    id: "get-feedback",
    parent: "study",
    name: "デザインのフィードバックのもらい方",
    nameKari: true,
    when: "今の自分のレベルが分からない。質問しづらい",
    canDo: "何を見てほしいかを添えて、気軽に見てもらえる",
    summary: [
      "フィードバックは「どこを見てほしいか」を1つ添えるだけで、ずっともらいやすくなります。",
      "完成してからではなく、迷っている途中で見せる方が直しやすくなります。",
    ],
    steps: [
      "見てほしいところを1つ決める（例: 余白、情報の順番）",
      "画面と一緒に、作った目的と迷っているところを書く",
      "もらった意見から1つ選んで直し、もう一度見せる",
    ],
    links: [
      { kind: "記事", label: "フィードバックの使い方", href: FEEDBACK_HREF, reason: "現役のデザイナーに見てもらうときの流れ" },
      { kind: "記事", label: "掲示板", href: BOARD_HREF, reason: "ちょっとした疑問を、メンバーに気軽に聞く" },
      { kind: "記事", label: "相談・質問を投稿しよう", href: "/contents/bono-onboarding-ask-question", reason: "掲示板に、画面と迷っているところを書いて投稿する手順" },
    ],
    related: [
      { id: "self-study", reason: "独学と、見てもらう学び方を比べる" },
      { id: "practice", reason: "見てもらう前に、練習で1つ作る" },
    ],
  },
  {
    id: "books-and-figma",
    parent: "study",
    name: "UIデザインのおすすめ本・Figmaの学び方",
    when: "本や道具の学び方も知りたい",
    canDo: "手元に置く1冊と、Figmaの覚え方が分かる",
    small: true,
    summary: [
      "Figmaは入門で基本の操作を覚え、初級でコンポーネントやオートレイアウトまで進めば、練習には十分です。",
      "本は通して読むより、作っていて迷ったときに引く1冊として手元に置くと続きます。",
    ],
    links: [
      { kind: "レッスン", label: "Figmaの使い方入門", href: lessonHref("figmabeginner"), reason: "Figmaを初めて開く人向け。基本の操作をひととおり" },
      { kind: "レッスン", label: "Figmaの使い方初級", href: lessonHref("figma-elementary"), reason: "入門のあと、作業を速くする機能を覚える" },
    ],
    related: [{ id: "beginner-start", reason: "道具を覚えたら、最初の1画面へ" }],
  },
];

/**
 * 勉強法のまとめ記事（267-R 4章の形・5章の節）。文言は上の STUDY から読む（二重に持たない）。
 * ここにあるのは、記事の頭の文と、どの項目をどの節・小見出しにするかだけ。
 */
export interface ArticleSectionRef {
  /** 節（h2）にする項目 */
  id: string;
  /** 節の中の小見出し（h3）にする項目 */
  subIds?: string[];
}

export interface GuideArticle {
  /** h1（検索の言葉） */
  title: string;
  /** h1 の下の小さな一言 */
  sub: string;
  /** 前置き（どんな人に、何が分かるか） */
  intro: string;
  sections: ArticleSectionRef[];
  /** 書いた人（個人名は出さない） */
  author: string;
  /** 確認日（YYYY-MM-DD） */
  checkedAt: string;
}

export const studyArticle: GuideArticle = {
  title: "UIデザインの勉強法",
  sub: "何から始めて、どう続けるか",
  intro:
    "これからUIデザインを学ぶ人と、学んでいるけれど進め方に迷っている人に向けたページです。最初の1本の選び方から、一人で進めるときのコツ、毎日の練習、仕事と両立する続け方までを順にまとめました。",
  sections: [
    { id: "beginner-start" },
    { id: "self-study" },
    { id: "how-to-study", subIds: ["practice", "books-and-figma"] },
    { id: "while-working", subIds: ["get-feedback"] },
  ],
  author: "BONO 運営",
  checkedAt: "2026-10-30",
};

// ------------------------------------------------------------
// キャリア（7）
// ------------------------------------------------------------

const CAREER: HubItem[] = [
  {
    id: "become-designer",
    parent: "career",
    name: "UI/UXデザイナーになるには（未経験からの転職）",
    when: "転職の進め方が分からない。年齢や経歴が不安。向いているか知りたい",
    canDo: "転職までの段取りと、今の自分の位置が分かる",
    links: [
      { kind: "記事", label: "UIUXデザイナー転職で必要なスキルと要素は何？書類落ちしない条件をプロが解説", href: "/guide/rdm-howtobeadesigner" },
      { kind: "記事", label: "未経験からUI/UXデザイナーに転職した4つの事例", href: "/guide/beginner-to-uiux-designer-examples" },
      { kind: "記事", label: "UI/UXデザイナー転職を成功させる！“会社の調べ方”ガイド", href: "/guide/how-to-find-jobs-for-beginner-designers" },
    ],
    related: [
      { id: "portfolio", reason: "書類で見られるのはポートフォリオ" },
      { id: "required-skills", reason: "向いているかは、必要なスキルから考える" },
    ],
  },
  {
    id: "portfolio",
    parent: "career",
    name: "UIデザイナーのポートフォリオの作り方",
    when: "ポートフォリオに何を載せればいいか分からない",
    canDo: "載せるケーススタディを選び、見せる順番を決められる",
    links: [
      { kind: "記事", label: "【徹底解説】実物アリ!UI/UXデザイナーに転職するためのポートフォリオ解説", href: "/guide/portfolio-01" },
      { kind: "レッスン", label: "ポートフォリオの作り方", href: lessonHref("portfolio") },
    ],
    related: [
      { id: "interview", reason: "載せたものは、面接で話すことになる" },
      { id: "become-designer", reason: "転職全体の中での位置を確かめる" },
    ],
  },
  {
    id: "interview",
    parent: "career",
    name: "UI/UXデザイナーの面接対策",
    when: "面接で、ポートフォリオをうまく話せない",
    canDo: "よく聞かれる質問に、ケーススタディで答えられる",
    links: [
      { kind: "記事", label: "UIUXデザイナー転職 面接質問集｜企業が見るポイントを学習に取り入れよう", href: "/guide/uiux-interview-tips-and-checkpoints" },
      { kind: "体験談", label: "面接で気をつけること・受ける会社の選び方（先輩の転職体験談）", href: "/stories/youhadouyatedezainani-mos" },
    ],
    related: [
      { id: "portfolio", reason: "話す中身は、ポートフォリオで決まる" },
      { id: "presentation", reason: "デザインの理由を話す練習" },
    ],
  },
  {
    id: "required-skills",
    parent: "career",
    name: "UIデザイナーに必要なスキル",
    nameKari: true,
    when: "自分に向いているか、UI/UXでいいのか確かめたい",
    canDo: "必要なスキルと、今の自分との差が分かる",
    links: [
      { kind: "記事", label: "ジュニアUI/UXデザイナーのためのスキルマップ", href: "/guide/uiuxdesigner-skillmap" },
      { kind: "記事", label: "ユーザー理解がUIデザインを変える — 初心者が身につけるべきUXスキルの全体像", href: "/guide/uxresearch_and_uidesign" },
      { kind: "レッスン", label: "UIUXデザイナーになる条件", href: lessonHref("wayofuiuxdesigner") },
    ],
    related: [
      { id: "become-designer", reason: "スキルが分かったら、転職の段取りへ" },
      { id: "ai-era", reason: "これから求められるスキルも知っておく" },
    ],
  },
  {
    id: "presentation",
    parent: "career",
    name: "デザインの説明・プレゼンのしかた",
    when: "職場でデザインを通せない。作業者で終わりたくない",
    canDo: "デザインの理由を、相手の関心に合わせて話せる",
    links: [
      { kind: "記事", label: "プロダクトデザイナーの提案がPMに通らないときの考え方", href: "/guide/designer-proposal-after-mvp-marketing" },
      { kind: "レッスン", label: "UIデザイナー1年目の立ち回り", href: lessonHref("rookiesaction") },
    ],
    related: [
      { id: "interview", reason: "面接でも、同じ話し方が使える" },
      { id: "ai-era", reason: "これからのデザイナーの役割を知る" },
    ],
  },
  {
    id: "ai-era",
    parent: "career",
    name: "AI時代のUI/UXデザイナー",
    when: "AIでデザイナーの仕事がなくなるのが不安",
    canDo: "AIで変わる仕事と、伸ばすスキルが分かる",
    links: [
      { kind: "記事", label: "AIでUIデザインは不要になる？UIUXデザイナーの将来性と学ぶべきスキル", href: "/guide/ai-uiuxdesign-future" },
      { kind: "記事", label: "AIとデザイナーの新しい仕事のかたち", href: "/guide/ai-design-experience-shift" },
    ],
    related: [
      { id: "required-skills", reason: "伸ばすスキルを具体的にする" },
      { id: "presentation", reason: "判断して伝える力は、AIで置き換わりにくい" },
    ],
  },
  {
    id: "side-job",
    parent: "career",
    name: "UIデザインの副業の始め方",
    nameKari: true,
    when: "UIの案件を取りたい",
    canDo: "最初の案件までに準備することが分かる",
    links: [
      { kind: "体験談", label: "副業・業務委託から始めたデザイナーへの道（先輩の転職体験談）", href: "/stories/howareyoubecomethedesigner-genta" },
      { kind: "レッスン", label: "キャリア相談まとめ", href: lessonHref("dezainanokiyaria") },
    ],
    related: [
      { id: "portfolio", reason: "案件でも、まず見られるのはポートフォリオ" },
      { id: "presentation", reason: "相手に提案を通す話し方" },
    ],
  },
];

// ------------------------------------------------------------
// まとめ・引き方
// ------------------------------------------------------------

export const HUB_ITEMS: HubItem[] = [...TROUBLES, ...STUDY, ...CAREER];

export const troubles = TROUBLES;
export const studyItems = STUDY;
export const careerItems = CAREER;

const BY_ID = new Map(HUB_ITEMS.map((it) => [`${it.parent}:${it.id}`, it]));

export function getItem(parent: Parent, id: string): HubItem | null {
  return BY_ID.get(`${parent}:${id}`) ?? null;
}

/** lesson-map（2026-09-29 のスナップショット）から、レッスンの記事数・無料の記事数を引く */
const LESSON_COUNTS = new Map<string, GuideLesson>(
  Object.values(LESSON_MAP).flatMap((s) => s.lessons.map((l) => [l.slug, l] as const))
);

export function lessonInfo(slug: string): GuideLesson | null {
  return LESSON_COUNTS.get(slug) ?? null;
}

/** 主役のカードの中身（表示用に解決したもの） */
export interface ResolvedMain {
  type: MainRef["type"];
  /** 例: 「はじめてのUIデザイン入門コース」 */
  title: string;
  /** コースの章（第◯章） */
  chapter?: { no: number; title: string };
  href: string;
  reason: string;
  /** 主役の入口になるレッスン（無料の数を数えるため） */
  lessonSlug?: string;
  free: number | null;
  total: number | null;
}

function courseChapter(courseSlug: string, chapterTitle: string) {
  const course = courses[courseSlug];
  if (!course) throw new Error(`[hierarchy] コースが見つからない: ${courseSlug}`);
  const index = course.steps.findIndex((s) => s.title.text === chapterTitle);
  if (index === -1) throw new Error(`[hierarchy] 章が見つからない: ${courseSlug} / ${chapterTitle}`);
  const firstLesson = course.steps[index].items.find((it) => it.type === "lesson");
  const courseFirst = course.steps.flatMap((s) => s.items).find((it) => it.type === "lesson");
  const title = course.title.text.split("：")[0];
  return {
    title,
    no: index + 1,
    href: `${courseHref(courseSlug)}#curriculum-step-${index + 1}`,
    // 章の中にレッスンがなければ、コースの最初のレッスンで「無料で始められるか」を見る
    lessonSlug: firstLesson?.type === "lesson" ? firstLesson.slug : courseFirst?.type === "lesson" ? courseFirst.slug : undefined,
  };
}

export function resolveMain(main: MainRef): ResolvedMain {
  if (main.type === "course") {
    const ch = courseChapter(main.courseSlug, main.chapterTitle);
    const info = ch.lessonSlug ? lessonInfo(ch.lessonSlug) : null;
    return {
      type: "course",
      title: ch.title,
      chapter: { no: ch.no, title: main.chapterTitle },
      href: ch.href,
      reason: main.reason,
      lessonSlug: ch.lessonSlug,
      free: info?.freeCount ?? null,
      total: info?.totalCount ?? null,
    };
  }
  if (main.type === "lesson") {
    const info = lessonInfo(main.slug);
    return {
      type: "lesson",
      title: info?.title ?? main.slug,
      href: lessonHref(main.slug),
      reason: main.reason,
      lessonSlug: main.slug,
      free: info?.freeCount ?? null,
      total: info?.totalCount ?? null,
    };
  }
  return { type: "people", title: "人に見てもらう", href: FEEDBACK_HREF, reason: main.reason, free: null, total: null };
}

/** 形の印（主役＋リンクから。重複なし・決まった順） */
const KIND_ORDER: Kind[] = ["コース", "レッスン", "記事", "お題", "体験談"];
export function kindsOf(item: HubItem): Kind[] {
  const set = new Set<Kind>(item.links.map((l) => l.kind));
  if (item.main?.type === "course") set.add("コース");
  if (item.main?.type === "lesson") set.add("レッスン");
  return KIND_ORDER.filter((k) => set.has(k));
}

/** 無料で読める記事があるか（主役のレッスンの無料の記事数から。手で書かない） */
export function isFree(item: HubItem): boolean {
  if (!item.main) return false;
  const m = resolveMain(item.main);
  return (m.free ?? 0) > 0;
}

/** ハブの頭に出す数（データから数える） */
export function troubleCounts() {
  const lessons = new Set<string>();
  for (const it of TROUBLES) {
    if (it.main?.type === "lesson") lessons.add(it.main.slug);
    if (it.main?.type === "course") {
      const slug = resolveMain(it.main).lessonSlug;
      if (slug) lessons.add(slug);
    }
    for (const l of it.links) {
      if (l.kind === "レッスン") lessons.add(l.href.replace("/lessons/", ""));
    }
  }
  return {
    troubles: TROUBLES.length,
    lessons: lessons.size,
    free: TROUBLES.filter(isFree).length,
  };
}

/** サムネイルに使うレッスンの slug（Sanity からまとめて引く） */
export function thumbSlugs(items: HubItem[]): string[] {
  return [...new Set(items.map((it) => it.thumb).filter((s): s is string => Boolean(s)))];
}

// ------------------------------------------------------------
// 読み込み時の確かめ（数と、関係する項目の行き先）
// ------------------------------------------------------------

const groupCounts = TROUBLE_GROUPS.map((g) => TROUBLES.filter((t) => t.group === g.id).length);
if (TROUBLES.length !== 14 || groupCounts.join(",") !== "3,5,4,2") {
  throw new Error(`[hierarchy] 悩みの数が 267-P とずれている: ${TROUBLES.length} / ${groupCounts.join(",")}`);
}
if (STUDY.length !== 7 || CAREER.length !== 7) {
  throw new Error(`[hierarchy] 勉強法・キャリアの数が 267-P とずれている: ${STUDY.length} / ${CAREER.length}`);
}
for (const sec of studyArticle.sections) {
  for (const id of [sec.id, ...(sec.subIds ?? [])]) {
    if (!getItem("study", id)) throw new Error(`[hierarchy] 勉強法のまとめ記事の項目が無い: ${id}`);
  }
}
for (const it of HUB_ITEMS) {
  for (const r of it.related) {
    if (!getItem(it.parent, r.id)) throw new Error(`[hierarchy] 関係する項目が無い: ${it.id} → ${r.id}`);
  }
  if (it.main) resolveMain(it.main); // 章が見つからなければここで止まる
}
