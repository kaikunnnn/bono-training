/**
 * data ＝ 未経験から転職ロードマップ v6「全体・ステップ詳細・ゴール解説の3ページ」— #243
 *
 * A（全体）・B（ステップ詳細×6）・C（ゴールと道のりの解説）がこの1ファイルだけを読む（真実を1か所に）。
 * 計画: rebono/issues/243-C_試作計画_v6.md
 * - s(): 材料（243-B_材料 の A・B・C・E・G・H）にある内容。行末コメントに出典
 * - k(): 材料にない推測（仮）。トグルで「仮」タグが出る。スキル項目・アウトプット量・文章はオーナーが後で差し替える
 * - 先輩の話は名前もアルファベットも出さず、元の仕事などの匿名の書き方だけ（このリポジトリは公開）。
 *   C_材料の slug には実名が入っているので、コメントにも slug は書かない
 * - 採用側の記事は会社名だけを出す。話し手の個人名は出さない。要約ツール経由なので「」付きの直接引用はしない
 * - 求人の件数は 2026-10-23 時点のスナップショット。必ず「2026年10月時点」と添える
 * - 海外の資料（F）は使わない（オーナー判断）
 * - 呼び方は「ケーススタディ」「アウトプット」（別の呼び方はしない）
 * - 段落は3文まで
 */

import type { Field } from "./types";

/** 推測（仮） */
const k = (text: string): Field => ({ text, kari: true });
/** 材料にある内容 */
const s = (text: string): Field => ({ text });

/** 段落（文ごとに Field を分ける。仮の文だけ「仮」タグが付く） */
export type Para = Field[];

/** スキルのタグ: 足切り（無いと書類で落ちる）／差がつく（決め手）／ポテンシャル（伸びしろ） */
export type SkillTag = "cut" | "edge" | "potential";

export const SKILL_TAG_LABEL: Record<SkillTag, string> = {
  cut: "足切り",
  edge: "差がつく",
  potential: "ポテンシャル",
};

/** アイコンの名前（描画側で iconsax に対応づける） */
export type V6Icon =
  | "figma"
  | "layout"
  | "hierarchy"
  | "people"
  | "message"
  | "magic"
  | "repeat"
  | "brush"
  | "routing";

export interface V6Skill {
  id: string;
  name: string;
  tag: SkillTag;
  icon: V6Icon;
  /** A のチップに添える一言の理由 */
  oneLine: Field;
  /** このスキルを主に身につけるステップ */
  stepIds: string[];
}

export interface V6Src {
  label: string;
  href: string;
}

/** 小見出し＋本文（3文まで） */
export interface V6Block {
  h: string;
  para: Para;
}

export type V6CourseRef =
  | { type: "course"; slug: string; reason: Field }
  | { type: "planned"; title: string; summary: Field; reason: Field };

export interface V6Step {
  id: string;
  n: number;
  /** 全体図・ステップの横並びに出す短いラベル（できる形） */
  short: string;
  /** できる形の見出し */
  canDo: string;
  lead: Field;
  period: Field;
  tag: SkillTag;
  skillIds: string[];
  output: {
    /** 大きく出す数字 */
    amount: string;
    unit: string;
    label: Field;
    note: Field;
  };
  course: V6CourseRef;
  /* ---- ここから B（ステップ詳細）用 ---- */
  /** なぜ転職にこのステップが必要か（小見出し＋3文まで） */
  why: V6Block[];
  /** スキルごとのカード（何か／なぜ要るか／できたと言える目安） */
  skillCards: { skillId: string; what: Field; why: Field; done: Field }[];
  /** 欲しいアウトプットの詳しい形 */
  outputDetail: {
    samples: string[];
    checklist: Field[];
    memo: { about: Field; lines: Field[] };
  };
  stumbles: { q: Field; a: Para }[];
}

export interface V6CaseStudy {
  id: string;
  title: string;
  icon: V6Icon;
  what: Field;
  stepId: string;
}

export interface V6Evidence {
  org: string;
  text: Field;
  href: string;
}

export interface V6ArticleBlock {
  id: string;
  h: string;
  tag?: SkillTag;
  paras: Para[];
  evidence?: V6Evidence;
}

export interface V6ArticleSection {
  id: string;
  kicker: string;
  h: string;
  lead: Field;
  blocks: V6ArticleBlock[];
}

/* ---------- 出典（E・G・H の URL。日本の資料だけ） ---------- */
const SRC = {
  goodpatch: { label: "Goodpatch", href: "https://goodpatch.com/blog/2024-04-portfolio3" },
  cybozuNote: { label: "サイボウズ", href: "https://note.com/ka3zu1ma10/n/n4a64679a08af" },
  cybozuJob: { label: "サイボウズ 募集要項", href: "https://cybozu.co.jp/recruit/entry/career/product-designer.html" },
  mfDeck: { label: "マネーフォワード", href: "https://speakerdeck.com/mf_recruitment_pr/8-key-points-and-6-tips-for-portfolios" },
  pivot: { label: "PIVOT", href: "https://pivot.jp/column/interview_designer/" },
  caGuide: { label: "サイバーエージェント 評価項目", href: "https://creators.cyberagent.co.jp/information/designer-portfolio-guidelines/" },
  caWay: { label: "サイバーエージェント", href: "https://www.cyberagent.co.jp/way/list/detail/id=31112" },
  freee: { label: "freee × Goodpatch", href: "https://goodpatch.com/blog/2025-03-ai-freee" },
  smarthr: { label: "SmartHR 新卒要件", href: "https://recruit.smarthr.co.jp/newgrads/product-designer/" },
  courier: { label: "クーリエ 求人", href: "https://www.r-agent.com/viewjob/jk13f10e3cca33bf98/" },
  co26: { label: "株式会社26 求人", href: "https://www.r-agent.com/viewjob/jkb44dca417e096cd1/" },
  ragent: { label: "リクルートエージェント", href: "https://www.r-agent.com/job_search/oc-design/omc-1128/osc-10371/prf-001/" },
  mynaviUi: { label: "マイナビ転職 UI/UX", href: "https://tenshoku.mynavi.jp/list/o1G120/" },
  mynaviWeb: { label: "マイナビ転職 Webデザイナー", href: "https://tenshoku.mynavi.jp/list/o1G140/" },
  dodaRatio: { label: "doda 転職求人倍率", href: "https://doda.jp/guide/kyujin_bairitsu/data/" },
  dodaMarket: { label: "doda 転職市場予測", href: "https://doda.jp/guide/market/011.html" },
} satisfies Record<string, V6Src>;

const BASE = "/dev/course-pages/prototyping/roadmap/career-change-v6";

export const careerChangeV6 = {
  base: BASE,
  name: "未経験からUIデザイナーへ",
  audience: s("デザインの仕事をしたことがなく、UIデザイナーへの転職を目指す人へ"), // how-to-find-jobs-for-beginner-designers
  summary: {
    hoursPerWeek: s("週12時間"), // howtostart
    months: s("6〜9ヶ月"), // howtostart・json
    caseStudies: s("3つ"), // portfolio-02
    prerequisite: s("不要"), // オーナー決定
  },

  /* ---------- スキル（A のチップ・B のカード・C の解説が同じものを読む） ---------- */
  skills: [
    {
      id: "figma",
      name: "Figmaの操作",
      tag: "cut",
      icon: "figma",
      oneLine: s("求人の約半分が必須に明記している道具"), // E 1-2（23件中11件）
      stepIds: ["trace", "basics"],
    },
    {
      id: "ui-basics",
      name: "UIの基本（レイアウト・文字・色・UIパターン）",
      tag: "cut",
      icon: "layout",
      oneLine: s("弱いと書類の段階で落ちる土台"), // howtobe, portfolio-01, E 主張4
      stepIds: ["trace", "basics"],
    },
    {
      id: "ia",
      name: "情報設計",
      tag: "cut",
      icon: "hierarchy",
      oneLine: k("何をどの画面に置くかを決める、実務にいちばん近い力"),
      stepIds: ["flow"],
    },
    {
      id: "customer",
      name: "顧客理解と課題の決め方",
      tag: "edge",
      icon: "people",
      oneLine: s("面接で「誰のどんな課題か」を聞かれる"), // E 2①・C_材料
      stepIds: ["customer"],
    },
    {
      id: "explain",
      name: "意図を言葉にする",
      tag: "edge",
      icon: "message",
      oneLine: s("Figmaの次によく求人に書かれている要件"), // E 1-2・主張3
      stepIds: ["basics", "flow", "customer", "portfolio"],
    },
    {
      id: "ai",
      name: "AIでつくり、良し悪しを判断する",
      tag: "edge",
      icon: "magic",
      oneLine: s("画面の差が縮んだぶん、選ぶ目が見られる"), // E 主張5
      stepIds: ["flow", "portfolio"],
    },
    {
      id: "learning",
      name: "学び続ける習慣",
      tag: "potential",
      icon: "repeat",
      oneLine: s("未経験の枠では、意欲と続ける力が見られる"), // E 主張8
      stepIds: ["trace", "job"],
    },
  ] satisfies V6Skill[],

  /* ---------- ゴール: ポートフォリオに必要な3つのケーススタディ ---------- */
  caseStudies: [
    {
      id: "visual",
      title: "ビジュアルのケーススタディ",
      icon: "brush",
      what: k("1つのサービスの画面を、見た目を整えた理由と一緒に見せるもの"),
      stepId: "basics",
    },
    {
      id: "flow",
      title: "情報設計のケーススタディ",
      icon: "routing",
      what: k("要件から5〜8画面の流れを組み、なぜこの分け方にしたかを見せるもの"),
      stepId: "flow",
    },
    {
      id: "customer",
      title: "顧客理解のケーススタディ",
      icon: "people",
      what: s("人の話から課題を決め、UIで解決するまでの過程を見せるもの"), // portfolio-01・E 主張2
      stepId: "customer",
    },
  ] satisfies V6CaseStudy[],

  /* ---------- 全体図の「なぜこの順番か」 ---------- */
  orderLead: [
    k("仕事の順番ではなく、つまずきにくい順番に並べています。"),
    s("手を動かす基本から始め、画面の流れ、人の課題へと考える範囲を広げていきます。"), // howtostart
    k("最後に3つのケーススタディをまとめて、応募に進みます。"),
  ] as Para,

  /* ---------- ステップ ---------- */
  steps: [
    {
      id: "trace",
      n: 1,
      short: "真似してつくる",
      canDo: "Figmaで、アプリの画面を真似してつくれる",
      lead: k("ふだん使うアプリの画面を10画面トレースして、Figmaの操作と、画面が部品でできていることに慣れます。"),
      period: k("2〜4週"),
      tag: "cut",
      skillIds: ["figma", "ui-basics", "learning"],
      output: {
        amount: "10",
        unit: "画面",
        label: k("トレース"),
        note: k("見本と重ねて、ずれを直したもの"),
      },
      course: {
        type: "course",
        slug: "ui-design-first",
        reason: k("真似しながら1画面をつくりきる流れを、手順どおりに体験できるからです。"),
      },
      why: [
        {
          h: "道具が使えることは、応募の前提になる",
          para: [
            s("2026年10月時点で読んだUI/UXの求人23件のうち、11件がFigmaを必須に明記していました。"), // E 1-2
            s("残りの多くも、UIの実務経験の中にFigmaを当然の前提として含めています。"), // E 1-2
            k("まずは道具で迷わない状態をつくります。"),
          ],
        },
        {
          h: "真似すると、画面の見方が変わる",
          para: [
            s("画面を真似してつくると、余白や文字の大きさがどう決まっているかに気づけます。"), // howtostart
            k("「なんとなく良い」と感じていた画面が、部品と並びの組み合わせに見えてきます。"),
            k("この見方が、次のステップで見本なしに組むときの手がかりになります。"),
          ],
        },
        {
          h: "続ける形を、最初につくっておく",
          para: [
            s("未経験の枠では、意欲や学び続ける習慣が要件に書かれることがあります。"), // E 主張8（株式会社26・クーリエ）
            k("1日1画面のように小さく決めて、つくった日付と一緒に残していきます。"),
            k("この記録が、そのまま学習ログとしてポートフォリオに使えます。"),
          ],
        },
      ],
      skillCards: [
        {
          skillId: "figma",
          what: k("フレーム、オートレイアウト、コンポーネントを使って、画面を組み立てる操作です。"),
          why: k("操作に気を取られると、どう見せるかを考える余裕がなくなるからです。"),
          done: k("見本の1画面を、操作を調べずに30分ほどでつくれる。"),
        },
        {
          skillId: "ui-basics",
          what: k("画面を、余白・文字・色・よく使う部品（UIパターン）に分けて見ることです。"),
          why: k("分けて見られると、次のステップで自分で組むときの手がかりになるからです。"),
          done: k("トレースした画面の余白と文字の大きさを、数字で説明できる。"),
        },
        {
          skillId: "learning",
          what: k("小さな目標を決めて毎日手を動かし、つくったものを日付つきで残す習慣です。"),
          why: s("未経験の枠では、学び続ける習慣そのものが見られることがあるからです。"), // E 主張8
          done: k("2週間、1日1画面のペースを崩さずに続けられた。"),
        },
      ],
      outputDetail: {
        samples: ["見本の画面", "トレースした画面", "重ねてずれを確かめたところ"],
        checklist: [
          k("ふだん使うアプリから、種類の違う画面を10画面選んだ"),
          k("見本と重ねて、余白と文字の大きさのずれを直した"),
          k("オートレイアウトで組み、文字を変えても崩れない"),
          k("1画面ごとに、つくった日付と「なぜこの形か」のメモを残した"),
        ],
        memo: {
          about: k("トレースした画面1つにつき、3行だけ書きます。"),
          lines: [
            k("この画面でいちばん目立たせているのは「投稿する」ボタン"),
            k("ほかのボタンより色が強く、親指が届く右下に置かれている"),
            k("このアプリは、見るより投稿してほしいからだと思う"),
          ],
        },
      },
      stumbles: [
        {
          q: k("どのアプリを選べばいいか迷う"),
          a: [
            k("ふだん自分がよく使うアプリから選びます。"),
            k("使い慣れていると、なぜこの形なのかを想像しやすいからです。"),
          ],
        },
        {
          q: k("見本とぴったり同じにならない"),
          a: [
            k("数ピクセルのずれは気にしすぎなくて大丈夫です。"),
            k("余白の大きさの関係（どこが広く、どこが狭いか）が合っていれば十分です。"),
          ],
        },
        {
          q: s("完璧にしようとして手が止まる"), // C_材料（完璧主義で手が止まった先輩）
          a: [
            s("1日1画面、時間を決めて作り切る形で抜け出した先輩がいます。"), // C_材料
            k("終わらなかった画面も、その日の分として残して次へ進みます。"),
          ],
        },
      ],
    },
    {
      id: "basics",
      n: 2,
      short: "基本の画面を組む",
      canDo: "見本なしで、基本の画面を組み立てられる",
      lead: k("ログインや一覧など、どのサービスにもある画面を見本なしで組み、見た目を整えた理由を言えるようにします。"),
      period: k("1.5〜2.5ヶ月"),
      tag: "cut",
      skillIds: ["ui-basics", "figma", "explain"],
      output: {
        amount: "5",
        unit: "種類",
        label: k("見本なしの基本画面"),
        note: k("＋ビジュアルのケーススタディ1つ"),
      },
      course: {
        type: "course",
        slug: "ui-design-visual",
        reason: k("余白・文字・色を要素ごとに見直す型を、毎日のお題で身につけられるからです。"),
      },
      why: [
        {
          h: "基本が弱いと、書類で落ちる",
          para: [
            s("採用側は、文字・色・レイアウトの基本をまず見ています。"), // E 2①・主張4
            k("ここでつまずくと、考えた過程まで読んでもらえません。"),
          ],
        },
        {
          h: "整えた理由が、最初のケーススタディになる",
          para: [
            k("5種類の画面から1つのサービスを選び、ビジュアルのケーススタディにまとめます。"),
            k("見た目を整えた理由を書くことが、意図を言葉にする最初の練習になります。"),
          ],
        },
      ],
      skillCards: [
        {
          skillId: "ui-basics",
          what: k("余白・文字・色・UIパターンを、見本なしで自分で決めることです。"),
          why: k("どのサービスの画面も、この組み合わせでできているからです。"),
          done: k("ログイン・一覧・詳細・入力・設定の5種類を、見本なしでつくれる。"),
        },
        {
          skillId: "figma",
          what: k("色と文字のスタイル、コンポーネントを決めて使い回すことです。"),
          why: k("画面が増えても、見た目がばらばらにならないからです。"),
          done: k("色を1か所変えると、5種類の画面すべてに反映される。"),
        },
        {
          skillId: "explain",
          what: k("なぜこの余白・この色にしたかを、短い文で書くことです。"),
          why: s("意図の説明は、Figmaの次によく求人に書かれている要件だからです。"), // E 主張3
          done: k("1画面につき、整えた理由を3行で書ける。"),
        },
      ],
      outputDetail: {
        samples: ["5種類の基本画面", "ビジュアルのケーススタディ"],
        checklist: [
          k("ログイン・一覧・詳細・入力・設定の5種類を見本なしでつくった"),
          k("色と文字のスタイルを決めて、全画面で使い回した"),
          k("1つのサービスを選び、ビジュアルのケーススタディにまとめた"),
        ],
        memo: {
          about: k("基本画面1つにつき、3行だけ書きます。"),
          lines: [
            k("誰が何をする画面か：買い物の途中で、カートの中身を確かめる人"),
            k("いちばん目立たせたもの：合計金額と「購入へ進む」ボタン"),
            k("なぜ：商品の写真より、いくらになるかを先に知りたいはずだから"),
          ],
        },
      },
      stumbles: [
        {
          q: k("見本がないと、何から置けばいいか分からない"),
          a: [k("まず画面に必要な情報を文字だけで書き出し、大事な順に上から並べます。"), k("見た目はそのあとで整えます。")],
        },
        {
          q: k("どこか素人っぽく見える"),
          a: [k("余白・文字・色のどれが原因かを1つずつ切り分けます。"), k("多くの場合、余白をそろえるだけでかなり整います。")],
        },
      ],
    },
    {
      id: "flow",
      n: 3,
      short: "画面の流れを設計する",
      canDo: "要件から、複数画面の流れを設計できる",
      lead: k("機能のアイデアだけがある状態から、5〜8画面の流れを組みます。何をどの画面に置くかを決めるのが情報設計です。"),
      period: k("1〜1.5ヶ月"),
      tag: "cut",
      skillIds: ["ia", "explain", "ai"],
      output: {
        amount: "1",
        unit: "本",
        label: k("複数画面の流れ（5〜8画面）"),
        note: k("情報設計のケーススタディになる"),
      },
      course: {
        type: "course",
        slug: "ui-experience",
        reason: k("一覧から詳細、編集へと、画面のつながりを設計する型を学べるからです。"),
      },
      why: [
        {
          h: "画面の流れは、実務にいちばん近い",
          para: [
            k("実際の仕事では、1枚の画面より、画面と画面のつながりを考える時間が長くなります。"),
            s("新卒の要件に、情報の構造から設計した経験を入れている会社もあります。"), // E 1-1⑤ SmartHR
          ],
        },
        {
          h: "たたき台はAIで、決めるのは自分",
          para: [
            k("画面パターンのたたき台はAIで出して構いません。"),
            s("ただし、なぜその案が良いかを説明できないと、採用ではむしろ不利になります。"), // E 主張5
          ],
        },
      ],
      skillCards: [
        {
          skillId: "ia",
          what: k("機能と情報を整理し、どの画面に何を置くかを決めることです。"),
          why: k("画面の数が増えるほど、迷わせない流れが使いやすさを左右するからです。"),
          done: k("要件から、5〜8画面の流れを図にして説明できる。"),
        },
        {
          skillId: "explain",
          what: k("画面の分け方の理由を、使う人の行動から説明することです。"),
          why: k("面接で「なぜこの分け方か」を聞かれるからです。"),
          done: k("分け方を変えた案と比べて、選んだ理由を言える。"),
        },
        {
          skillId: "ai",
          what: k("AIに画面のたたき台を複数出させ、要件に合うものを選んで直すことです。"),
          why: s("AIの出力を評価し、なぜ良いかを説明する力が求められているからです。"), // E 2⑦
          done: k("AIの案を3つ比べ、採用しなかった理由を書ける。"),
        },
      ],
      outputDetail: {
        samples: ["画面の流れの図", "5〜8画面のUI"],
        checklist: [
          k("機能のアイデアから、画面の一覧と流れの図をつくった"),
          k("5〜8画面を、行き来できるプロトタイプにした"),
          k("分け方を決めた理由を、ケーススタディに書いた"),
        ],
        memo: {
          about: k("画面の流れ1本につき、3行だけ書きます。"),
          lines: [
            k("できるようにすること：条件を変えながら求人を絞り込む"),
            k("画面の分け方：絞り込みは別画面にせず、一覧の上に置いた"),
            k("なぜ：結果の件数を見ながら条件を何度も変えるから"),
          ],
        },
      },
      stumbles: [
        {
          q: s("文字の情報だけから組み立てられない"), // C_材料（情報設計で手が止まった先輩）
          a: [s("一度最後まで通すと、あとで振り返ったときに分かることが多くあります。"), k("最初は粗くてよいので、流れの図を先に描き切ります。")], // C_材料
        },
        {
          q: k("画面がどんどん増えてしまう"),
          a: [k("使う人が最初にやりたいこと1つに絞り、その流れだけを設計します。")],
        },
      ],
    },
    {
      id: "customer",
      n: 4,
      short: "人の課題から考える",
      canDo: "人の話から課題を決め、UIで解決できる",
      lead: s("実際に人へ話を聞き、その困りごとから課題を決めて、サービスの画面に落とします。"), // portfolio-01
      period: k("約1ヶ月"),
      tag: "edge",
      skillIds: ["customer", "explain"],
      output: {
        amount: "3",
        unit: "人",
        label: k("ヒアリング"),
        note: k("＋顧客理解のケーススタディ1つ"),
      },
      course: {
        type: "planned",
        title: "顧客理解のコース",
        summary: k("話の聞き方から、課題の決め方、画面への落とし方までを通しで学ぶコースです。"),
        reason: k("話を聞くところから画面に落とすまでを、一人でも進められる手順にしたコースを準備しています。"),
      },
      why: [
        {
          h: "採用側がいちばん見ているのは、考えた過程",
          para: [
            s("採用側の記事10件のうち6件が、完成した見た目よりプロセスや判断の理由を重視していました。"), // E 2 集計
            s("誰のどんな課題かを、自分で確かめた経験が決め手になります。"), // E 2①②
          ],
        },
        {
          h: "面接で聞かれて、答えられるようにする",
          para: [
            s("面接で、実際のユーザーの課題を解決したものはあるかと聞かれた先輩がいます。"), // C_材料
            k("架空の題材だけだと、この質問に答えられません。"),
          ],
        },
      ],
      skillCards: [
        {
          skillId: "customer",
          what: k("人に話を聞き、困りごとの本当の理由を見つけて課題を決めることです。"),
          why: s("ユーザーをどう理解してアイデアに至ったかが、選考で見られるからです。"), // E 2②
          done: k("聞く前の仮説と、聞いて変わったことを並べて説明できる。"),
        },
        {
          skillId: "explain",
          what: k("課題から画面の形までを、1本の筋道として書くことです。"),
          why: k("筋道が見えると、判断の確かさが伝わるからです。"),
          done: k("ケーススタディを、課題・仮説・変えたこと・結果の順で書ける。"),
        },
      ],
      outputDetail: {
        samples: ["ヒアリングのメモ", "顧客理解のケーススタディ"],
        checklist: [
          k("3人に、同じ質問の型で話を聞いた"),
          k("聞く前の仮説と、聞いて分かったことを分けて書いた"),
          k("分かったことから課題を1つに決め、画面に落とした"),
        ],
        memo: {
          about: k("話を聞いた1回につき、3行だけ書きます。"),
          lines: [
            k("聞く前の仮説：家族の写真を共有するのが面倒なのだと思っていた"),
            k("聞いて分かったこと：面倒なのではなく、見られたくない写真が混ざるのが嫌だった"),
            k("変えたこと：共有する前に選ぶ画面を足し、一括共有をやめた"),
          ],
        },
      },
      stumbles: [
        {
          q: k("話を聞ける人が見つからない"),
          a: [k("家族や友人、前の職場の同僚でも構いません。"), k("サービスを使いそうな人に近い人を選びます。")],
        },
        {
          q: s("聞いたら、仮説が外れてしまった"), // C_材料
          a: [s("外れたこと自体が、ケーススタディのいちばんの材料になります。"), s("仮説が外れて作り直した過程が評価された先輩もいます。")], // C_材料
        },
      ],
    },
    {
      id: "portfolio",
      n: 5,
      short: "ポートフォリオにまとめる",
      canDo: "3つのケーススタディを、説明できる形にまとめられる",
      lead: k("これまでの3つを、何のために・なぜこの形にしたかから読めるポートフォリオサイトにまとめます。"),
      period: s("約1ヶ月"), // howtostart
      tag: "edge",
      skillIds: ["explain", "ai", "learning"],
      output: {
        amount: "1",
        unit: "サイト",
        label: k("ポートフォリオサイト"),
        note: k("ケーススタディ3つと学習ログを載せる"),
      },
      course: {
        type: "course",
        slug: "ai-ui-design",
        reason: k("ケーススタディの1つを動くプロトタイプにすると、触って確かめてもらえるからです。"),
      },
      why: [
        {
          h: "ないと、面接に進めない",
          para: [
            s("ポートフォリオがない、または求められているものとずれていると、1次面接にも進めません。"), // goaloverview
            s("画像を並べるだけでは、決め手になる過程と意図が届きません。"), // portfolio-03・E 主張2
          ],
        },
        {
          h: "触れるものは、強い材料になる",
          para: [
            s("使いやすさは触らないと判断できないので、動くプロトタイプを見る採用側もあります。"), // E 2① Goodpatch
            k("3つのうち1つだけでも、触れる形にしておくと伝わり方が変わります。"),
          ],
        },
      ],
      skillCards: [
        {
          skillId: "explain",
          what: k("ケーススタディを、概要・結論・過程・振り返りの順で書くことです。"),
          why: k("読み手は限られた時間で、結論から判断するからです。"),
          done: k("1つのケーススタディを、3分で口頭説明できる。"),
        },
        {
          skillId: "ai",
          what: k("AIと一緒に、ケーススタディの1つを動くプロトタイプにすることです。"),
          why: k("AIを実際の制作工程で使った経験を見る会社が出てきているからです。"),
          done: k("URLを開くだけで、主な操作を試してもらえる。"),
        },
        {
          skillId: "learning",
          what: k("人に見てもらい、もらった意見で直すことです。"),
          why: s("評価を受けて何を直したかも、選考で見られるからです。"), // E 2②
          done: k("2人以上から意見をもらい、直した点を書き残した。"),
        },
      ],
      outputDetail: {
        samples: ["トップページ", "ケーススタディのページ"],
        checklist: [
          k("3つのケーススタディを、概要・結論・過程・振り返りの順で書いた"),
          k("ボツにした案や、話を聞いたときのメモも載せた"),
          k("2人以上に見てもらい、意見をもとに直した"),
        ],
        memo: {
          about: k("新しくは書かず、これまでの3行メモを読み返します。"),
          lines: [
            k("ケーススタディごとに、いちばん判断が変わったメモを1つ選ぶ"),
            k("それを「なぜこの形か」の結論として、最初に置く"),
            k("ほかのメモは、過程の段落の材料に使う"),
          ],
        },
      },
      stumbles: [
        {
          q: s("情報を詰め込みすぎてしまう"), // C_材料
          a: [s("読み手を意識した方がいいと言われ、人に見てもらって直した先輩がいます。"), k("1ページに伝えたいことは1つに絞ります。")], // C_材料
        },
        {
          q: k("いつまでも完成しない"),
          a: [s("締め切りを決めて、応募へ進みます。"), k("応募しながら直していく人がほとんどです。")], // howtostart
        },
      ],
    },
    {
      id: "job",
      n: 6,
      short: "応募して面接で話す",
      canDo: "応募を続け、面接でケーススタディを話せる",
      lead: s("40社を目安に応募し、面接のたびに振り返って、話し方と見せ方を直していきます。"), // how-to-find-jobs-for-beginner-designers
      period: s("1〜2ヶ月"), // howtostart
      tag: "potential",
      skillIds: ["explain", "learning"],
      output: {
        amount: "40",
        unit: "社",
        label: s("応募"), // how-to-find-jobs-for-beginner-designers
        note: k("面接ごとに振り返りを残す"),
      },
      course: {
        type: "planned",
        title: "転職活動のコース",
        summary: k("応募先の選び方、書類の整え方、面接の振り返り方をまとめるコースです。"),
        reason: k("一人で続けると止まりやすいところを、手順にして支えるコースを準備しています。"),
      },
      why: [
        {
          h: "職種未経験の入口は、数を受けて見つける",
          para: [
            s("2026年10月時点で読んだ求人23件のうち、21件がデザインの実務経験を必須にしていました。"), // E 1-2
            k("表に出ていない入口は、応募して確かめるしかありません。"),
          ],
        },
        {
          h: "面接は、考えた過程を直接見られる場",
          para: [s("よく聞かれるのは、なぜこの設計にしたのかです。"), k("面接のたびに答えにくかった質問を残し、次までに準備します。")], // C_材料
        },
      ],
      skillCards: [
        {
          skillId: "explain",
          what: k("ケーススタディを、相手の会社に合わせて話す順番を変えることです。"),
          why: k("会社ごとに、知りたいことが違うからです。"),
          done: k("応募先ごとに、前に出すケーススタディを決めている。"),
        },
        {
          skillId: "learning",
          what: k("落ちた理由を振り返り、次の応募までに直すことです。"),
          why: s("変化を楽しんで挑戦できるかを見ている会社もあるからです。"), // E 2④
          done: k("面接ごとに、聞かれたことと答えを1行ずつ残している。"),
        },
      ],
      outputDetail: {
        samples: ["応募先の一覧", "面接の振り返り"],
        checklist: [
          k("40社を目安に、応募先の一覧をつくった"),
          k("入りたい会社には、そのサービスの課題とUIの改善案を添えた"),
          k("面接ごとに、聞かれたことと直すことを書き残した"),
        ],
        memo: {
          about: k("応募する会社1社につき、3行だけ書きます。"),
          lines: [
            k("この会社のサービスで気になった課題：初めての人が料金を見つけにくい"),
            k("前に出すケーススタディ：情報設計でつくった絞り込みの流れ"),
            k("なぜ：迷わせない導線をつくる力がいちばん伝わるから"),
          ],
        },
      },
      stumbles: [
        {
          q: s("書類で落ち続ける"), // C_材料 共通するパターン5
          a: [s("多くの先輩が通った道です。"), s("期限を決めて、数を受け続けます。")], // C_材料
        },
        {
          q: s("受けたい会社に全部落ちた"), // C_材料
          a: [s("本当に受けたい会社に落ち続けたあと、幅を広げて応募し内定した先輩がいます。"), k("1社目は、デザインの実務を1年積める会社を選ぶのも手です。")], // C_材料
        },
      ],
    },
  ] satisfies V6Step[],

  /* ---------- 先輩の道のり（匿名。すべて仮の書き方） ---------- */
  seniors: [
    { who: k("子育て中・デザイン未経験"), period: s("約7ヶ月"), applications: s("20社"), note: k("話を聞いて見つけた本当の理由を、サービスに組み込んだ過程が評価された") }, // C_材料
    { who: k("元・システムエンジニア"), period: s("約9ヶ月"), applications: s("約30社"), note: k("仮説が外れて作り直した過程を、面接で詳しく聞かれた") }, // C_材料
    { who: k("元・公務員（経理）"), period: s("約1年2ヶ月"), applications: s("—"), note: k("毎月の目標と振り返りを公開し、続けられる人だと伝わった") }, // C_材料
    { who: k("元・メーカーの総合職"), period: s("約1年4ヶ月"), applications: s("50社以上"), note: k("やり直した過程も載せて、考えの変化が見えるようにした") }, // C_材料
  ],

  /* ---------- よくある質問（入口の現実はここだけ） ---------- */
  faq: [
    {
      q: k("未経験でも本当に転職できる？"),
      a: [
        [
          s("できますが、入口は狭いと考えておきます。"), // E 主張1
          s("2026年10月時点のマイナビ転職では、UI/UXデザイナーの求人27件のうち、職種未経験OKは0件でした。"), // G 1-1
          s("「未経験歓迎」と書かれていても、多くは業界未経験の意味です。"), // E 4
        ],
        [
          s("それでも、BONOで学んだ先輩たちは7ヶ月〜1年半ほどで内定しています。"), // C_材料 共通するパターン2
          s("実務経験の代わりに、ケーススタディで考えた過程を見せて入っています。"), // E 主張1
        ],
        [
          s("なお、Webデザイナーやグラフィックの求人には職種未経験の枠がはっきりあります。"), // G 1-2・H 0
          s("そこで実務を積んでからUIへ移った人もいますが、入る会社の種類で現実味が大きく変わります。"), // G 分かったこと7・8
        ],
      ] as Para[],
      sources: [SRC.mynaviUi, SRC.mynaviWeb, SRC.ragent],
    },
    {
      q: s("働きながらでも転職できる？"),
      a: [[s("できます。先輩は、働きながらと辞めて専念がほぼ半々です。"), s("働きながらの人は、平日1〜2時間と週末にまとめて進めています。")]] as Para[], // C_材料 共通するパターン3
      sources: [] as V6Src[],
    },
    {
      q: s("AIがあるのに、学ぶ意味は？"),
      a: [[s("あります。画面はAIでつくれるぶん、なぜその形かが前より見られます。"), s("AIの画面の良し悪しを判断するにも、手でつくった経験が要ります。")]] as Para[], // E 主張5・9, ai-shift
      sources: [SRC.caGuide, SRC.freee],
    },
    {
      q: s("何社くらい応募する？"),
      a: [[s("40社以上が目安です。"), s("先輩は15〜50社ほど応募している人が多くいます。")]] as Para[], // how-to-find-jobs-for-beginner-designers, C_材料
      sources: [] as V6Src[],
    },
    {
      q: s("ケーススタディは架空の題材でもいい？"),
      a: [[s("構いません。"), s("ただ、顧客理解のケーススタディは、実際に話を聞いたものにします。"), s("面接で実際のユーザーの課題を聞かれることがあるからです。")]] as Para[], // portfolio-01, C_材料
      sources: [] as V6Src[],
    },
    {
      q: s("順番どおりに進めないとだめ？"),
      a: [[s("順番どおりがおすすめです。"), s("目標を立てにくいときは、先に全体をざっと見ても構いません。")]] as Para[], // howtostart, goalsetting
      sources: [] as V6Src[],
    },
  ],

  /* ---------- 根拠（A の最後に小さく） ---------- */
  sources: {
    note: s("求人と採用側の資料は、2026年10月23日に調べたものです。求人の件数はその日の時点の数です。"),
    groups: [
      { title: "求人票と求人の件数", links: [SRC.mynaviUi, SRC.mynaviWeb, SRC.ragent, SRC.smarthr, SRC.cybozuJob, SRC.courier, SRC.co26, SRC.dodaRatio, SRC.dodaMarket] },
      { title: "採用する側の記事", links: [SRC.goodpatch, SRC.cybozuNote, SRC.mfDeck, SRC.pivot, SRC.caGuide, SRC.caWay, SRC.freee] },
      { title: "BONOの記事と先輩の話", links: [{ label: "UIUXデザイナー転職ガイド", href: "https://kaikun.bo-no.design/career/beginner" }] },
    ],
  },

  /* ---------- C ゴールと道のりの解説（1本の読み物） ---------- */
  goalArticle: {
    title: "ゴールと道のりの解説",
    lead: [
      k("このロードマップが、なぜこのゴールと順番になっているのかを説明します。"),
      s("根拠には、日本の求人票と採用する側の記事を使っています。"), // E
    ] as Para,
    sections: [
      {
        id: "hiring",
        kicker: "HIRING",
        h: "採用で見られること",
        lead: k("採用で見られるスキルを、足切り・差がつく・ポテンシャルの3つに分けています。"),
        blocks: [
          {
            id: "figma",
            h: "Figmaの操作",
            tag: "cut",
            paras: [
              [
                s("2026年10月時点で読んだUI/UXの求人23件のうち、11件がFigmaを必須に明記していました。"), // E 1-2
                s("残りの多くも、UIの実務経験の中に当然の前提として含めています。"), // E 1-2
              ],
            ],
            evidence: { org: "求人票23件の集計", text: s("Figma以外のスキルでは、意図の説明が最も多く出てくる要件でした。"), href: "#sources" }, // E 1-2
          },
          {
            id: "ui-basics",
            h: "UIの基本（レイアウト・文字・色・UIパターン）",
            tag: "cut",
            paras: [
              [
                s("文字・色・レイアウトの基本は、AIの時代になっても入場券のままです。"), // E 主張4
                k("ここが弱いと、考えた過程まで読んでもらえません。"),
              ],
            ],
            evidence: { org: "Goodpatch", text: s("新卒の面接では、文字・色・レイアウトの基本を見ていると話しています。"), href: SRC.goodpatch.href }, // E 2①
          },
          {
            id: "ia",
            h: "情報設計",
            tag: "cut",
            paras: [
              [
                s("情報設計は、中堅以上の求人では必須に、若手の求人でも業務内容によく出てきます。"), // E 1-2・主張7
                k("実務では画面1枚より画面のつながりを考える時間が長いので、入る前に一度通しておきます。"),
              ],
            ],
            evidence: { org: "SmartHR", text: s("新卒の要件に、対象・操作・情報の構造からUIを設計した経験を入れています。"), href: SRC.smarthr.href }, // E 1-1⑤
          },
          {
            id: "customer",
            h: "顧客理解と課題の決め方",
            tag: "edge",
            paras: [
              [
                s("採用側の記事10件のうち6件が、完成した見た目よりプロセスや判断の理由を重視していました。"), // E 2 集計
                s("中でも、誰のどんな課題かを自分で確かめたかが見られます。"), // E 2①②
              ],
            ],
            evidence: { org: "サイボウズ", text: s("見た目以上に、ユーザーをどう理解してアイデアに至ったかを見たいと書いています。"), href: SRC.cybozuNote.href }, // E 2②
          },
          {
            id: "explain",
            h: "意図を言葉にする",
            tag: "edge",
            paras: [
              [
                s("デザインの意図を言葉で説明できることは、Figmaの次によく求人に書かれている要件です。"), // E 主張3
                s("PMやエンジニアとチームでつくるので、説明できないと合意が取れません。"), // E 主張3
              ],
            ],
            evidence: { org: "PIVOT", text: s("センスより、意図して組み立てる力を見ていると話しています。"), href: SRC.pivot.href }, // E 2⑩
          },
          {
            id: "ai",
            h: "AIでつくり、良し悪しを判断する",
            tag: "edge",
            paras: [
              [
                s("生成AIで、それらしい画面は誰でもつくれるようになりました。"), // E 主張5
                s("そのぶん採用側は、本人の意図や工夫、なぜ良いかの判断をより見るようになっています。"), // E 主張5
              ],
              [
                s("ただし、求人の要件にAIを入れている会社は、2026年10月時点で23件中2件だけでした。"), // E 1-2
                k("AIは独立した科目ではなく、つくって選ぶ道具として各ステップで使います。"),
              ],
            ],
            evidence: { org: "サイバーエージェント", text: s("AIの利用は可としたうえで、本人の工夫や意図が反映されているかを見ると書いています。"), href: SRC.caGuide.href }, // E 2③
          },
          {
            id: "learning",
            h: "学び続ける習慣",
            tag: "potential",
            paras: [
              [
                s("未経験に近い枠では、意欲や学び続ける習慣が要件に書かれることがあります。"), // E 主張8
                k("毎日の記録や振り返りを残しておくと、それ自体が伝える材料になります。"),
              ],
            ],
            evidence: { org: "クーリエ", text: s("継続的に学ぶ習慣を、必須の要件に入れています。"), href: SRC.courier.href }, // E 1-1②
          },
        ],
      },
      {
        id: "portfolio",
        kicker: "PORTFOLIO",
        h: "ポートフォリオに必要なもの",
        lead: k("ゴールは、3つのケーススタディを載せたポートフォリオです。"),
        blocks: [
          {
            id: "three",
            h: "なぜ3つなのか",
            paras: [
              [
                k("ビジュアル・情報設計・顧客理解の3つで、足切りと差がつくスキルをひととおり見せられます。"),
                s("採用側は、数と幅も見ています。"), // E 2⑤ マネーフォワード
              ],
            ],
            evidence: { org: "マネーフォワード", text: s("課題設定、制作プロセス、フィードバックの反映など8つの観点を挙げています。"), href: SRC.mfDeck.href }, // E 2⑤
          },
          {
            id: "process",
            h: "見せるのは、どう考えたか",
            paras: [
              [
                s("ポートフォリオは、完成した画面を並べる場所ではなく、解決した事例をまとめる場所です。"), // E 2 補足 ReDesigner
                s("ボツにした案があると、判断の筋道を追えます。"), // E 2①
              ],
            ],
          },
          {
            id: "how",
            h: "つくり方はステップ5で",
            paras: [[k("ケーススタディの書き方と、サイトへのまとめ方は、ステップ5の詳しいページにまとめています。")]],
          },
        ],
      },
      {
        id: "order",
        kicker: "ORDER",
        h: "なぜこの順番で身につけるのか",
        lead: k("仕事の順番ではなく、つまずきにくい順番に並べています。"),
        blocks: [
          {
            id: "hands",
            h: "手を動かすことから始める",
            paras: [
              [
                s("最初に道具と基本を身につけておくと、あとで考えることに集中できます。"), // howtostart
                s("AIの画面の良し悪しを見分ける目も、手でつくった経験から育ちます。"), // ai-shift
              ],
            ],
          },
          {
            id: "widen",
            h: "考える範囲を、1画面から人へ広げる",
            paras: [
              [
                k("1画面、画面の流れ、人の課題と、考える範囲を少しずつ広げます。"),
                k("いきなり人の課題から始めると、解決策を形にする手が追いつかないからです。"),
              ],
            ],
          },
          {
            id: "last",
            h: "まとめるのは最後",
            paras: [
              [
                s("ポートフォリオは、基礎でつくったものをベースに仕上げます。"), // howtostart
                s("締め切りを決めて、応募へ進みます。"), // howtostart
              ],
            ],
          },
        ],
      },
    ] satisfies V6ArticleSection[],
  },
};

export type CareerChangeV6 = typeof careerChangeV6;

export const v6Steps = careerChangeV6.steps as V6Step[];
export const v6Skills = careerChangeV6.skills as V6Skill[];

export function getV6Step(n: number): V6Step | null {
  return v6Steps.find((st) => st.n === n) ?? null;
}

export function getV6StepById(id: string): V6Step | null {
  return v6Steps.find((st) => st.id === id) ?? null;
}

export function getV6Skill(id: string): V6Skill | null {
  return v6Skills.find((sk) => sk.id === id) ?? null;
}

export const v6StepHref = (n: number) => `${BASE}/step/${n}`;
export const V6_GOAL_HREF = `${BASE}/goal`;
