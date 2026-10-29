/**
 * #267 試作2 — 悩みのハブ「UIの作り方で困った」のデータ
 *
 * - 困りごとは、学ぶ人が手を動かしながら頭に浮かべる言い方で書く（検索キーワードではない）
 * - 「詳しい記事」は本番で公開・sitemap 掲載中の実在の slug だけ（2026-10-29 に sitemap.xml と Sanity で確認）
 *   /guide に正規URLがある記事は /guide/<slug> にする
 * - 答え・確かめる順番の文言は試作用に書いたもの（kari: true は推測が強いもの）
 * - コースは /dev のコース試作（v2）へ。ステップは転職ロードマップ v6
 */

export type Situation = "before" | "during" | "after";
export type TroubleKind = "visual" | "structure" | "process" | "career";

export const SITUATIONS: { value: Situation; label: string }[] = [
  { value: "before", label: "まだ作り始めていない" },
  { value: "during", label: "作っている途中" },
  { value: "after", label: "作ったけど評価されない" },
];

export const KINDS: { value: TroubleKind; label: string; lead: string }[] = [
  { value: "visual", label: "見た目（余白・色・文字）", lead: "画面はできたのに、どこか垢抜けないとき" },
  { value: "structure", label: "画面の組み立て", lead: "何をどこに置くか、画面をどうつなぐかで止まったとき" },
  { value: "process", label: "進め方・Figma", lead: "手の付け方や、道具の使い方で止まったとき" },
  { value: "career", label: "ポートフォリオ・転職", lead: "作ったものを、人に見せる形にするとき" },
];

export interface HubLink {
  label: string;
  href: string;
}

export interface TroubleItem {
  id: string;
  /** 学ぶ人の言葉 */
  title: string;
  kind: TroubleKind;
  situations: Situation[];
  /** 2〜3文の答え */
  answer: string;
  /** 確かめる順番（短く） */
  checks: string[];
  articles: HubLink[];
  course: { slug: string; reason: string };
  /** 転職ロードマップ v6 のステップ番号 */
  step: number;
  kari?: boolean;
}

export const TROUBLES: TroubleItem[] = [
  {
    id: "spacing",
    title: "余白がなんとなくで決まってしまう",
    kind: "visual",
    situations: ["during", "after"],
    answer:
      "余白は、その場の見た目で決めるとすぐにバラバラになります。先に「8の倍数だけ使う」のようなルールを決め、関係の近い要素ほど余白を狭くします。数字が決まれば、迷う回数が減ります。",
    checks: [
      "使っている余白の数字を全部書き出す",
      "8の倍数（8・16・24・32）に寄せる",
      "グループの中は狭く、グループの間は広くなっているか見る",
    ],
    articles: [
      { label: "メッセージリストUIをデザイン【余白のサイズはルールで決める】", href: "/contents/uidesignbeginner-03" },
      { label: "UI見た目の基本原則 #1：“美しさ”と“使いやすさ”が両立するUIのコツ", href: "/contents/tutorial-uivisual-01" },
    ],
    course: { slug: "ui-design-visual", reason: "余白・文字・色を要素ごとに見直す型を、毎日のお題で身につけられるからです。" },
    step: 2,
  },
  {
    id: "color",
    title: "配色に自信がない。色を足すほどまとまらない",
    kind: "visual",
    situations: ["during", "after"],
    answer:
      "UIの色は、飾りより「意味」を先に決めます。ベースの色とテキストの色を決め、目立たせたい操作にだけアクセントの色を使います。色の数を減らすほうが、まとまりやすくなります。",
    checks: [
      "画面で使っている色を全部並べる",
      "ベース・テキスト・アクセントの3役に分ける",
      "アクセントの色が、押してほしい場所にだけ付いているか見る",
    ],
    articles: [
      { label: "配色の基本をマスター！理論から実践まで", href: "/contents/bannerbeginner-04-1" },
      { label: "デザインしたチャットUIを解説【なぜチャットの色は1色じゃないのか？】", href: "/contents/uidesignbeginner-06" },
    ],
    course: { slug: "ui-design-visual", reason: "色を含む見た目の6要素を、リデザインしながら確かめられるからです。" },
    step: 2,
  },
  {
    id: "typography",
    title: "文字の大きさや太さが、画面ごとにバラバラになる",
    kind: "visual",
    situations: ["during"],
    answer:
      "文字の大きさは、画面ごとに決めずに「階層」として先に用意します。見出し・本文・補足のように役割を決め、Figmaのテキストスタイルに登録してから使います。",
    checks: [
      "画面の中の文字を、役割（見出し・本文・補足）で分ける",
      "役割ごとに大きさと太さを1つに絞る",
      "Figmaのテキストスタイルに登録して、全画面で使い回す",
    ],
    articles: [
      { label: "【Figma】“タイポグラフィ階層”を設定して、使えるようにしよう", href: "/contents/ui-typography-2-1" },
      { label: "【練習】ニュースアプリで学ぶ文字のサイズと階層のデザイン術", href: "/contents/ui-typography-2-2" },
    ],
    course: { slug: "ui-design-visual", reason: "文字の階層を、お題を通して何度も決める練習ができるからです。" },
    step: 2,
  },
  {
    id: "cluttered",
    title: "情報が多くて、画面がごちゃつく",
    kind: "structure",
    situations: ["during", "after"],
    answer:
      "ごちゃつく原因は、見た目より「構造」にあることが多いです。画面にある情報を、まとまり（グループ）と並び方で整理し直すと、余白や色を触る前にかなり整います。",
    checks: [
      "画面の情報を付箋のように全部書き出す",
      "同じ目的の情報をグループにまとめる",
      "グループの並び順を、使う人が見る順に並べ替える",
    ],
    articles: [
      { label: "【初心者】UIデザインはこの3つで決まる！『3構造』を徹底解説", href: "/contents/three-structures-11" },
      { label: "NGなUIで理解する『UI3構造』", href: "/contents/ui-layout-basic02-1" },
    ],
    course: { slug: "ui-design-first", reason: "UIの構造の2要素を、トレースしながら手で覚えられるからです。" },
    step: 1,
  },
  {
    id: "placement",
    title: "どこに何を置けばいいか、決められない",
    kind: "structure",
    situations: ["before", "during"],
    answer:
      "置き場所に迷うのは、その画面で「使う人が何をしたいか」がまだ決まっていないからです。先に要件とやりたいことを書き出し、それに必要な情報だけを画面に置きます。",
    checks: [
      "この画面で、使う人がやりたいことを1文で書く",
      "そのために必要な情報と操作を書き出す",
      "いちばん使うものを、いちばん見える位置に置く",
    ],
    articles: [
      { label: "【シリーズ紹介】UIのどこに何を配置するか迷う？UIの基本概念で解決しよう", href: "/contents/ui-layout-basic00" },
      { label: "要件をUIに反映するデザインの流れ", href: "/contents/ui-architect-beginner-13" },
    ],
    course: { slug: "ui-experience", reason: "一覧から詳細、編集へと、何をどの画面に置くかを決める型を学べるからです。" },
    step: 3,
  },
  {
    id: "flow",
    title: "1画面は作れるのに、画面同士のつながりが作れない",
    kind: "structure",
    situations: ["during"],
    answer:
      "画面のつながりは、ナビゲーションで決まります。使う人がどこから入り、どこへ戻るのかを先に図にしてから、ボトムナビやヘッダーの形を決めます。",
    checks: [
      "画面の一覧を書き出す",
      "画面同士を線でつなぎ、行き来の流れを図にする",
      "どの画面からでも戻れる場所（起点）があるか見る",
    ],
    articles: [
      { label: "使いやすいUIをデザインしたいなら『ナビゲーション』を理解しよう", href: "/contents/uinavi01" },
      { label: "UIで道案内！ナビゲーションの基本", href: "/contents/ui-layout-basic05-1" },
    ],
    course: { slug: "ui-experience", reason: "画面遷移とナビゲーションを、サービス単位で設計する練習があるからです。" },
    step: 3,
  },
  {
    id: "no-reference",
    title: "見本がないと、画面が組めない",
    kind: "process",
    situations: ["before"],
    answer:
      "最初は見本があってかまいません。実在のアプリを真似して作る（トレースする）と、よく使われる形が手に残ります。慣れてきたら、見本の「構造」だけを借りて自分の画面を組みます。",
    checks: [
      "よく使うアプリの画面を1つ選んでトレースする",
      "トレースした画面の構造（並び・グループ）を書き出す",
      "同じ構造で、別のお題の画面を組んでみる",
    ],
    articles: [
      { label: "【初級】UIをトレースしてUIに慣れよう", href: "/contents/uitrasebeginner" },
      { label: "参考UIの調べ方", href: "/contents/ui-pattern-5" },
    ],
    course: { slug: "ui-design-first", reason: "真似しながら1画面をつくりきる流れを、手順どおりに体験できるからです。" },
    step: 1,
  },
  {
    id: "reference",
    title: "参考を集めても、自分のデザインに活かせない",
    kind: "visual",
    situations: ["before", "during"],
    answer:
      "参考は「なんとなく良い」で集めると使えません。集めるときに、どこが良いのか（余白・色・並び）を一言メモしておくと、自分の画面に持ち込めるようになります。",
    checks: [
      "参考にした画面に、良いと思った理由を一言ずつ書く",
      "理由を余白・色・文字・並びに分ける",
      "自分の画面で、1つだけ取り入れて比べる",
    ],
    articles: [
      { label: "【センスは知識から】デザイン前に参考デザインを集めるの上達を加速する3つの理由", href: "/contents/bannerbeginner-02-1" },
      { label: "参考デザインをかんたんに整理して「自分だけの引き出し」をつくれる神アプリ", href: "/guide/design-reference-eagle" },
    ],
    course: { slug: "ui-design-visual", reason: "世の中のデザインから学ぶ発想法を、最初のレッスンで扱っているからです。" },
    step: 2,
  },
  {
    id: "where-to-start",
    title: "何から手をつければいいか分からない",
    kind: "process",
    situations: ["before"],
    answer:
      "いきなり画面を描き始めると、途中で止まりやすくなります。お題を読む → アイデアを出す → 情報を整理する → 画面にする、という進め方を1回通してみるのが近道です。",
    checks: [
      "お題を読んで、誰が何をしたいのかを書く",
      "アイデアを出し、必要な情報を書き出す",
      "粗くてよいので、最後まで1回通す",
    ],
    articles: [
      { label: "「デザインの進め方」の基本を知ろう", href: "/contents/uidesigncycle_overview_00" },
      { label: "はじめに：なぜ“正しいデザインの進め方”が爆速成長につながるのか", href: "/contents/introduction" },
    ],
    course: { slug: "ui-design-first", reason: "最初の1画面を、決まった手順で最後までつくれるからです。" },
    step: 1,
  },
  {
    id: "figma-components",
    title: "Figmaで、部品（コンポーネント）の作り方が分からない",
    kind: "process",
    situations: ["before", "during"],
    answer:
      "コンポーネントは、同じ形を何度も使うときのための機能です。まずオートレイアウトでリストの1行を作り、それをコンポーネントにして並べるところから始めると、仕組みが分かります。",
    checks: [
      "オートレイアウトで、リストの1行を作る",
      "その1行をコンポーネントにする",
      "並べて、元を直すと全部が変わることを確かめる",
    ],
    articles: [
      { label: "UIトレースで学ぶFigmaの使い方！オートレイアウトとコンポーネント", href: "/contents/figma-elementary01" },
      { label: "コンポーネント機能の使い方 / ネスト状態にしてアイコンを切り替えよう", href: "/contents/figma-elementary03" },
      { label: "Figma：オートレイアウト機能 徹底解説", href: "/contents/figmaru-men-21" },
    ],
    course: { slug: "ui-design-first", reason: "UIデザインとコンポーネントの基本を、画面をつくりながら学べるからです。" },
    step: 1,
  },
  {
    id: "portfolio",
    title: "ポートフォリオに、何を載せればいいか分からない",
    kind: "career",
    situations: ["after"],
    answer:
      "ポートフォリオで見られるのは、完成した画面より「どう考えて作ったか」です。ケーススタディを3つほど選び、課題・考えたこと・結果の順でまとめます。",
    checks: [
      "作ったものから、考えた過程を説明できるものを3つ選ぶ",
      "それぞれ、課題・考えたこと・結果を3行で書く",
      "3行を元に、画像と説明を並べる",
    ],
    articles: [
      { label: "【徹底解説】実物アリ！UI/UXデザイナーに転職するためのポートフォリオ解説", href: "/guide/portfolio-01" },
      { label: "ポートフォリオで評価される。UIのアイデアとビジュアル作成のコツ", href: "/contents/portfolio-ui-ideavisual-feedback" },
      { label: "UIUXデザイン学習ゴール：スキルとポートフォリオの具体イメージ", href: "/contents/rdm-goaloverview" },
    ],
    course: { slug: "ai-ui-design", reason: "ケーススタディの1つを動くプロトタイプにすると、触って確かめてもらえるからです。" },
    step: 5,
  },
  {
    id: "explain",
    title: "作ったのに「なぜこのデザイン？」に答えられない",
    kind: "career",
    situations: ["after"],
    answer:
      "答えられないのは、作るときに理由を残していないからです。画面の分け方や置き場所を決めるたびに、「使う人が〜だから」と1行メモを残すと、面接でもそのまま話せます。",
    checks: [
      "画面ごとに、いちばん大きな判断を1つ選ぶ",
      "その判断の理由を「使う人が〜だから」で書く",
      "別の案と比べて、選ばなかった理由も書く",
    ],
    articles: [
      { label: "UIUXデザイナー転職 面接質問集｜企業が見るポイントを学習に取り入れよう", href: "/guide/uiux-interview-tips-and-checkpoints" },
      { label: "UI情報設計をブラッシュアップするには？", href: "/contents/ui-architect-beginner-61" },
    ],
    course: { slug: "ui-experience", reason: "画面の分け方の理由を、使う人の行動から説明する練習があるからです。" },
    step: 6,
    kari: true,
  },
];
