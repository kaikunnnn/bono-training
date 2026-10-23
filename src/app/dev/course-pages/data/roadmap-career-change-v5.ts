/**
 * data ＝ 未経験から転職ロードマップ v5「採用側の根拠と入口の現実」— #243
 *
 * v4（BONOの記事ベース）に、日本の採用側の根拠（E_採用側の根拠_日本.md）を足した版。
 * 材料は rebono/issues/243-B_材料/ の A・B・C・E。海外の資料（F と E の海外データ）は使わない（オーナー判断）。
 * - s(): 材料にある内容（引用か近い言い換え）。行末コメントに出典
 *   - 「E 主張N」「E 1-2」などは E_採用側の根拠_日本.md の主張番号・節番号
 *   - howtostart などは A/B 材料の slug（BONOの記事）
 * - k(): 材料にない推測（仮）。トグルで「仮」タグが出る
 * - 先輩の話（C_材料）は仮名（Aさん〜Wさん）だけを使う。C の slug には実名が入っているので、
 *   コメントにも slug は書かず「C_材料 ◯さん」と書く（このリポジトリは公開）
 * - 採用側の記事は会社名だけを出す。記事の話し手の個人名は出さない
 * - E の求人・記事の文言は要約ツール経由なので、「」付きの直接引用はしない（言い換えだけ）
 * - 求人の件数は 2026-10-23 時点のスナップショット。必ず「2026年10月時点」と添える
 *
 * 文章は「小見出し＋3文まで」の Block で持つ（オーナーFB 2026-10-23：長い・見出しを細かく・3文まで）。
 *
 * 期間は v4 と同じ（週12時間で6〜9ヶ月。ステップの割り振りは推測）。
 */

import type { Field } from "./types";
import type { Para, V4CourseRef } from "./roadmap-career-change-v4";

/** 推測（仮） */
const k = (text: string): Field => ({ text, kari: true });
/** 材料にある内容 */
const s = (text: string): Field => ({ text });

export type { Para };
export type V5CourseRef = V4CourseRef;

/** 出典リンク。件数の集計など URL がないものは #sources（このページの根拠一覧）へ */
export interface Src {
  label: string;
  href: string;
}

/** 小見出し＋本文（3文まで）＋出典 */
export interface Block {
  /** 結論を言う見出し */
  h: string;
  para: Para;
  sources?: Src[];
}

/** 入場券（基礎の画面＋Figma）／決め手（なぜその形かを説明できる） */
export type Proof = "ticket" | "decider";

/** ステップ内の小見出し */
export type StageSectionKey = "can" | "why" | "portfolio" | "ai";

export interface V5Stage {
  id: string;
  short: string;
  title: string;
  period: Field;
  /** このステップが証明するもの（2. 企業が見ているもの と対応） */
  proves: Proof[];
  /** 本文。小見出しごとに3文まで（見出しは h があればそれ、なければ key の既定） */
  sections: { key: StageSectionKey; h?: string; para: Para }[];
  /** このステップの3行メモ（書く例。すべて仮） */
  memo: { about: Field; lines: Field[] };
  handoff: Field;
  courses: V5CourseRef[];
  courseNote?: Field;
  links: { label: string; href: string }[];
  senpai: { who: string; from: string; text: Field };
  skipIf?: Field;
}

const CAREER_GUIDE = { label: "UIUXデザイナー転職ガイド", href: "https://kaikun.bo-no.design/career/beginner" };

/** このページの根拠一覧（集計値の出典はここを指す） */
const SOURCES_ANCHOR = "#sources";

/* ---------- 出典（E の URL） ---------- */
const SRC = {
  jobs: { label: "求人24件の集計", href: SOURCES_ANCHOR },
  ragent: { label: "リクルートエージェント", href: "https://www.r-agent.com/job_search/oc-design/omc-1128/osc-10371/prf-001/" },
  green: { label: "Green", href: "https://www.green-japan.com/jobtype-l/160111" },
  dodaRatio: { label: "doda 転職求人倍率", href: "https://doda.jp/guide/kyujin_bairitsu/data/" },
  dodaMarket: { label: "doda 転職市場予測", href: "https://doda.jp/guide/market/011.html" },
  goodpatch: { label: "Goodpatch", href: "https://goodpatch.com/blog/2024-04-portfolio3" },
  cybozuNote: { label: "サイボウズ", href: "https://note.com/ka3zu1ma10/n/n4a64679a08af" },
  cybozuJob: { label: "サイボウズ 募集要項", href: "https://cybozu.co.jp/recruit/entry/career/product-designer.html" },
  mfDeck: { label: "マネーフォワード", href: "https://speakerdeck.com/mf_recruitment_pr/8-key-points-and-6-tips-for-portfolios" },
  mfJob: { label: "マネーフォワード 求人", href: "https://www.r-agent.com/viewjob/jk323ce3794685a2ad/" },
  pivot: { label: "PIVOT", href: "https://pivot.jp/column/interview_designer/" },
  caGuide: { label: "サイバーエージェント 評価項目", href: "https://creators.cyberagent.co.jp/information/designer-portfolio-guidelines/" },
  caWay: { label: "サイバーエージェント", href: "https://www.cyberagent.co.jp/way/list/detail/id=31112" },
  freee: { label: "freee × Goodpatch", href: "https://goodpatch.com/blog/2025-03-ai-freee" },
  layerx2025: { label: "LayerX（2025）", href: "https://note.layerx.co.jp/n/n177ce83d6129" },
  layerx2026: { label: "LayerX（2026）", href: "https://note.layerx.co.jp/n/n7bf52bc335c7" },
  smarthr: { label: "SmartHR 新卒要件", href: "https://recruit.smarthr.co.jp/newgrads/product-designer/" },
  codmon: { label: "コドモン 求人", href: "https://www.r-agent.com/viewjob/jk253a11fc327df4ba/" },
  co26: { label: "株式会社26 求人", href: "https://www.r-agent.com/viewjob/jkb44dca417e096cd1/" },
  courier: { label: "クーリエ 求人", href: "https://www.r-agent.com/viewjob/jk13f10e3cca33bf98/" },
  alche: { label: "alche 求人", href: "https://www.green-japan.com/company/11343/job/330531" },
  labol: { label: "ラボル 求人", href: "https://doda.jp/DodaFront/View/JobSearchDetail/j_jid__3015797464/" },
  redesigner: { label: "ReDesigner（2021）", href: "https://magazine.redesigner.jp/post/recomend-portfolio" },
  dena: { label: "DeNA（2021）", href: "https://note.com/denadesign/n/n3321fdb41f64" },
  senpai: { label: "先輩の話", href: "#stories" },
} satisfies Record<string, Src>;

export const careerChangeV5 = {
  slug: "career-change",
  name: "未経験から転職",
  audience: s("デザインの仕事（グラフィックやWebも含む）をしたことがなく、UIデザイナーへの転職を目指す人"), // how-to-find-jobs-for-beginner-designers
  summary: {
    period: s("週12時間で6〜9ヶ月"), // howtostart（週12時間）・json（6-9）
    works: s("3つ"), // portfolio-02
    prerequisite: s("不要"), // オーナー決定（howtostart「才能は必要ありません」）
    senpai: s("学習開始から内定まで 7ヶ月〜1年半"), // C_材料 共通するパターン2
  },

  /* ---------- 0. 書いた人 ---------- */
  author: {
    who: k("BONO運営・UIデザイナー（事業会社でプロダクトデザインと採用面接を担当）"), // オーナー了承済み・中身は後で正しくする
    surveyedAt: s("2026年10月"), // E 調査日 2026-10-23
  },

  /* ---------- 1. 入口の現実 ---------- */
  reality: {
    blocks: [
      {
        h: "「未経験歓迎」の多くは業界未経験のこと",
        para: [
          s("転職サイトでUIデザイナーの求人を探すと、「未経験歓迎」がたくさん出てきます。"), // E 4（リクルートエージェント 249件中217件）
          s("ただ2026年10月時点のリクルートエージェントでは、ほとんどが「業界未経験歓迎」で、「職種未経験歓迎」は見た範囲で0件でした。"), // E 4（先頭約100件）
          s("デザインの実務経験は必要、という意味です。"), // E 4
        ],
        sources: [SRC.ragent],
      },
      {
        h: "求人23件のうち21件が実務経験を必須にしている",
        para: [
          s("要件まで読めた求人23件のうち、21件が実務経験を必須にしていました。"), // E 1-2・主張1
          s("「ポテンシャル採用」と書いた求人でも、実務1〜3年を求めることがあります。"), // E 1-2（③⑦⑯）
        ],
        sources: [SRC.jobs],
      },
      {
        h: "実務経験の代わりになるのがポートフォリオ",
        para: [
          s("それでも「この人なら現場で動けそうだ」と思わせる材料があれば、選考に進めます。"), // goalreason（採用されるのは現場で動けるイメージがある人）
          s("dodaの市場予測も、自主制作のUIと設計の意図を書いたポートフォリオを勧めています。"), // E 4（doda 2026-07）
        ],
        sources: [SRC.dodaMarket],
      },
    ] satisfies Block[],
    /** ゴール宣言 */
    goal: s("実務経験の代わりに「現場で動ける」と思わせるポートフォリオをつくる。それがこのロードマップのゴールです。"), // E 主張1, howtostart（ゴールはポートフォリオ）
    /** 先輩が通った事実 */
    senpai: {
      h: "先輩たちは7ヶ月〜1年半でこの入口を通っている",
      para: [
        s("BONOで学んだ先輩たちは、学習を始めてから7ヶ月〜1年半ほどで内定しています。"), // C_材料 共通するパターン2
        s("応募した数は15〜50社ほどの人が多くいます。"), // C_材料 共通するパターン4
        s("落ち続けた時期があっても、応募の仕方を変えて内定にたどり着いています。"), // C_材料 共通するパターン5, Bさん・Dさん
      ] as Para,
    },
  },

  /* ---------- 2. 企業が見ているもの ---------- */
  wants: {
    lead: [
      s("求人票と採用側の記事を読むと、見られているものは2段に分かれます。"), // E 1-2・2
      s("書類で落とされないための入場券と、面接で選ばれるための決め手です。"), // howtobe（足切り）, E 主張2・4
    ] as Para,
    layers: [
      {
        key: "ticket" as Proof,
        name: "入場券",
        title: "基礎の画面がつくれて、Figmaが使える",
        body: s("文字・色・レイアウトの基本を押さえた画面を、Figmaでつくれること。ここが弱いと書類で落ちます。"), // E 主張4, howtobe
        stat: s("Figmaを必須と明記した求人 23件中11件"), // E 1-2
        sources: [SRC.jobs, SRC.goodpatch, SRC.caGuide],
      },
      {
        key: "decider" as Proof,
        name: "決め手",
        title: "なぜその形にしたかを説明できる",
        body: s("誰のどんな困りごとのために、なぜその形にしたのか。見た目より、そこに至ったプロセスと意図が見られます。"), // E 主張2・3
        stat: s("プロセスや意図を重視した採用側の記事 10件中6件／求人で意図の説明を求める 23件中8件"), // E 2 集計・1-2
        sources: [SRC.jobs, SRC.goodpatch, SRC.cybozuNote, SRC.mfDeck, SRC.pivot],
      },
    ],
    /** 入場券の理由 */
    ticketWhy: {
      h: "基礎の画面は、AIが広まった今も見られている",
      para: [
        s("サイバーエージェントは評価項目に「デザインの基礎力」を挙げ、Goodpatchも文字・色・レイアウトの基本を見ています。"), // E 2③・①, E 主張4
        s("アイデアを画面にできなければ、任せられる仕事がないからです。"), // howtobe
      ],
      sources: [SRC.caGuide, SRC.goodpatch],
    } satisfies Block,
    /** 決め手の理由（会社ごとの理由） */
    deciderWhy: [
      {
        h: "Goodpatchはボツ案から判断の筋道を見る",
        para: [
          s("Goodpatchは、完成品だけでなくプロセスを見ています。"), // E 2①
          s("ボツにした案から、どう判断したかを追えるからです。"), // E 2①
        ],
        sources: [SRC.goodpatch],
      },
      {
        h: "サイボウズは評価を受けて直せるかを見る",
        para: [
          s("サイボウズは製品をテストして直し続ける会社なので、評価を受けて何を直したかを見ています。"), // E 2②
        ],
        sources: [SRC.cybozuNote],
      },
      {
        h: "求人票でもFigmaの次に多い要件",
        para: [
          s("意図を言葉で説明できることは、求人票でFigmaの次によく出てくる要件でした。"), // E 1-2・主張3
          s("マネーフォワードとサイボウズも、これを要件に入れています。"), // E 1-1⑮⑯
          s("画面はPMやエンジニアと話して決めるので、説明できないと合意がとれません。"), // E 主張3
        ],
        sources: [SRC.mfJob, SRC.cybozuJob],
      },
      {
        h: "説明できれば未経験でも差がつく",
        para: [
          s("PIVOTのデザイナーは、情報設計を学んだ人は少ないので、意図を説明できるかを見ていると話しています。"), // E 2⑩
        ],
        sources: [SRC.pivot],
      },
    ] satisfies Block[],
    /** ポテンシャル枠 */
    potential: {
      h: "ポテンシャル枠では学び続ける習慣が見られる",
      para: [
        s("未経験に近い枠では、学び続ける習慣と意欲も見られます。"), // E 主張8
        s("株式会社26は技術より意欲を最重視し、クーリエは継続的に学ぶ習慣を必須にしています。"), // E 1-1①②
        s("LayerXやサイバーエージェントも、好奇心や挑戦する姿勢を見ています。"), // E 2⑨④
      ],
      sources: [SRC.co26, SRC.courier, SRC.layerx2026, SRC.caWay],
    } satisfies Block,
    /** 3作品への橋渡し */
    worksTitle: "3つの作品で入場券と決め手を見せる",
    worksLead: s("ポートフォリオには、種類の違う作品を3つそろえます。"), // portfolio-02
    works: [
      {
        label: "作品①",
        title: "顧客理解からつくったもの",
        body: s("実際に人に話を聞き、その困りごとから考えたサービス"), // portfolio-02, portfolio-01
        stageId: "customer",
        proves: ["decider"] as Proof[],
      },
      {
        label: "作品②",
        title: "複数画面にまたがるUI",
        body: s("1つの機能を複数画面で。例: 求人サイトの検索と絞り込み"), // portfolio-02
        stageId: "ia",
        proves: ["ticket", "decider"] as Proof[],
      },
      {
        label: "作品③",
        title: "ビジュアルが分かるもの",
        body: s("Daily UI やLPなど。要件はそこまで意識しなくてよい"), // portfolio-02
        stageId: "ui",
        proves: ["ticket"] as Proof[],
      },
    ],
    whyThree: s("1つだけだと「まぐれかも？」と思われます。3つあると、同じようにつくれる人だと伝わります。"), // portfolio-02
  },

  /* ---------- 3. AIで変わったこと、変わらないこと ---------- */
  ai: {
    blocks: [
      {
        h: "それらしい画面は、AIで誰でもつくれる",
        para: [
          s("いまは生成AIで、それらしい画面が誰でもすぐにつくれます。"), // E 主張5
          s("サイバーエージェントは、作品が似てきたとして本人の視点を見る評価項目を公開しました。"), // E 2③
          s("AIを使うこと自体は、本人の工夫や意図が入っていれば歓迎しています。"), // E 2③（言い換え）
        ],
        sources: [SRC.caGuide],
      },
      {
        h: "意図の説明が、前より決め手になった",
        para: [
          s("画面で差がつきにくくなったぶん、なぜその形かの説明が前より決め手になっています。"), // E 主張9・3-3
          s("ただ、意図を見る話は2021年ごろの採用側の記事にもあり、AIで生まれた要件ではありません。"), // E 3-3
        ],
        sources: [SRC.dena, SRC.redesigner],
      },
      {
        h: "AIの経験を求める求人はまだ一部",
        para: [
          s("SmartHRの新卒要件とコドモンの求人には、AIを使った経験や活用への意欲が入っています。"), // E 1-1⑤㉓, E 主張6
          s("ただ2026年10月時点で読んだ求人23件のうち、要件にAIが入っていたのはこの2件だけでした。"), // E 1-2
          s("AIの経験は加点で、入場券の中心は今も実務経験とFigmaです。"), // E 1-2 読み方・3-3
        ],
        sources: [SRC.smarthr, SRC.codmon, SRC.jobs],
      },
      {
        h: "AIが出した画面の良し悪しを決めるのは自分",
        para: [
          s("freeeとGoodpatchの対談では、AIの出力を評価し、なぜ良いかを説明する力が挙がっています。"), // E 2⑦
          s("その目は、自分の手で画面をつくった経験から育ちます。"), // ai-shift
          s("このロードマップで基礎の画面を手でつくるのは、そのためです。"), // ai-shift
        ],
        sources: [SRC.freee],
      },
    ] satisfies Block[],
  },

  /* ---------- 4. 全体図となぜこの順か ---------- */
  order: [
    {
      h: "仕事の順ではなく、つまずきにくい順",
      para: [
        s("学ぶ順は、仕事の順（顧客理解 → 情報設計 → 見た目）の逆です。"), // ai-future, howtostart
        s("最初のハードルの見た目を越えると、情報設計や顧客理解がぐっとラクになります。"), // howtostart
      ],
    },
    {
      h: "前半で入場券、後半で決め手をつくる",
      para: [
        s("前半のステップで入場券をそろえ、後半で決め手の材料をつくります。"), // E 主張4・2 と各ステップの対応（構成の説明）
      ],
    },
  ] satisfies Block[],

  /* ---------- 4. 3行メモ ---------- */
  memoIntro: {
    title: "全ステップ共通：つくったら「なぜこの形か」を3行で書く",
    blocks: [
      {
        h: "あとからでは思い出せない",
        para: [
          k("ステップ1から、つくったものには毎回「なぜこの形にしたか」を3行で残します。"), // 3行という形はBONOの提案（仮）
          s("ポートフォリオの段階でまとめて書こうとしても、そのとき何を考えていたかは思い出せません。"), // C_材料 Rさん（ログをもっと残すべきだった）・Cさん
        ],
      },
      {
        h: "評価されるのは、つくり直した過程",
        para: [
          s("先輩の作品が評価された理由で多かったのは、話を聞いて仮説が崩れ、つくり直した過程でした。"), // C_材料 共通するパターン6
          s("面接でも、何を考えて学んできたかを聞かれます。"), // C_材料 Cさん, uiux-interview-tips-and-checkpoints
        ],
      },
    ] satisfies Block[],
  },

  /* ---------- 4. ステップ ---------- */
  stages: [
    {
      id: "prep",
      short: "準備",
      title: "Figmaに慣れて、ゴールを知る",
      period: k("2週間〜1ヶ月"), // 記事は「1-2ヶ月目」。6〜9ヶ月に収めるため縮めた
      proves: ["ticket"],
      sections: [
        { key: "can", para: [s("Figmaで既存アプリの画面を真似してつくりながら、採用で何を見られるかを知ります。")] }, // howtostart, way-phase01
        {
          key: "why",
          para: [
            s("Figmaは、求人の約半分が必須にしている入場券の一部です。"), // E 1-2（23件中11件）
            s("見せるものを先に知ると、各ステップが何のためにあるかが分かります。"), // howtostart
          ],
        },
        { key: "portfolio", para: [s("作品はまだありません。真似した画面に作成日をつけて残すと、成長の記録になります。")] }, // portfolio-02
        { key: "ai", para: [k("Figmaの操作で詰まったら、AIに聞いて先へ進みます。")] },
      ],
      memo: {
        about: k("真似した画面1つについて"),
        lines: [
          k("この画面でいちばん目立たせているのは「投稿する」ボタン"),
          k("ほかのボタンより色が強く、親指が届く右下に置かれている"),
          k("このアプリは見るより投稿してほしいから、だと思う"),
        ],
      },
      handoff: s("Figmaで手を動かした経験が、UIの基礎を学ぶ土台になる"), // howtostart
      courses: [],
      courseNote: s("コースはなく、無料の記事と動画で進めます"), // howtostart
      links: [CAREER_GUIDE],
      senpai: {
        who: "Kさん",
        from: "ディレクション職から",
        text: s("早い時期から手を動かすことと、最初にゴールのイメージをはっきり持つこと。先にやればよかった"), // C_材料 Kさん
      },
      skipIf: k("Figmaのオートレイアウトとプロトタイプを使って、1画面をつくれる"),
    },
    {
      id: "ui",
      short: "UIの基礎",
      title: "UIの基礎：ふつうのUIをつくれるようになる",
      period: k("1.5〜2.5ヶ月"),
      proves: ["ticket"],
      sections: [
        { key: "can", para: [s("SNSやTodoサービスの基本の画面を、見本なしでつくれるところまで進めます。")] }, // howtostart
        {
          key: "why",
          para: [
            s("ここが入場券の中心です。"), // E 主張4
            s("文字・色・レイアウトの基本が弱いと、書類選考で落ちます。"), // howtobe, portfolio-01
          ],
        },
        { key: "portfolio", para: [s("Daily UI などでつくった画面から、作品③（ビジュアルが分かるもの）を選びます。")] }, // portfolio-02
        {
          key: "ai",
          para: [
            s("画面は自分の手でつくります。"), // ai-shift
            s("AIの画面の良し悪しを見分ける目は、手でつくった経験から育つからです。"), // ai-shift
          ],
        },
      ],
      memo: {
        about: k("Daily UI の1画面について"),
        lines: [
          k("誰が何をする画面か：買い物の途中で、カートの中身を確かめる人"),
          k("いちばん目立たせたもの：合計金額と「購入へ進む」ボタン"),
          k("なぜ：商品の写真より、いくらになるかを先に知りたいはずだから"),
        ],
      },
      handoff: s("ふつうのUIをつくれる手が、情報設計で画面を組むときの土台になる"), // howtostart
      courses: [
        { type: "course", slug: "ui-design-first" },
        { type: "course", slug: "ui-design-visual" },
        { type: "course", slug: "ui-experience" },
      ],
      links: [],
      senpai: {
        who: "Fさん",
        from: "海外営業から",
        text: s("完璧主義で手が止まった。Daily UI で「1日1お題、時間を決めて作り切る」を続けて抜け出した"), // C_材料 Fさん
      },
      skipIf: k("SNSやTodoサービスの基本の画面を、見本なしで一通りつくれる"),
    },
    {
      id: "ia",
      short: "情報設計",
      title: "情報設計：要件から画面の流れを組む",
      period: k("1〜1.5ヶ月"),
      proves: ["ticket", "decider"],
      sections: [
        { key: "can", para: [s("機能のアイデアだけがある状態から、複数の画面にまたがるUIを組み立てます。")] }, // howtostart
        {
          key: "why",
          para: [
            s("画面の流れは実務にいちばん近く、入場券の仕上げと決め手の材料を兼ねます。"), // portfolio-01, howtostart, E 主張7
            s("SmartHRの新卒要件にも、情報の構造から設計した経験が入っています。"), // E 1-1⑤
          ],
        },
        { key: "portfolio", para: [s("作品②（複数画面のUI）になります。たとえば求人サイトの検索と絞り込みです。")] }, // portfolio-02
        { key: "ai", para: [k("画面パターンのたたき台はAIで出して構いませんが、要件に合うかは自分で決めます。")] },
      ],
      memo: {
        about: k("画面の流れ1つについて"),
        lines: [
          k("できるようにすること：条件を変えながら求人を絞り込む"),
          k("画面の分け方：絞り込みは別画面にせず、一覧の上に置いた"),
          k("なぜ：結果の件数を見ながら条件を何度も変えるから"),
        ],
      },
      handoff: k("要件から画面の流れを組む型が、顧客理解でつくるサービスの骨組みになる"),
      courses: [{ type: "planned", title: "情報設計のコース" }],
      links: [],
      senpai: {
        who: "Eさん",
        from: "公務員から",
        text: s("情報設計は最初むずかしかった。一度最後まで学び切り、ポートフォリオで振り返ったときに分かった"), // C_材料 Eさん
      },
      skipIf: k("機能のアイデアから、複数画面のUIをつくった作品がある"),
    },
    {
      id: "customer",
      short: "顧客理解",
      title: "顧客理解：人の困りごとからつくる",
      period: k("約1ヶ月"),
      proves: ["decider"],
      sections: [
        { key: "can", para: [s("1人でもいいので実際に人に話を聞き、その困りごとからサービスを考えます。")] }, // portfolio-01
        {
          key: "why",
          para: [
            s("ここが決め手の中心です。"), // E 2①②
            s("飛ばすと、面接で「実際のユーザーの課題を解決したものはある？」と聞かれて答えられません。"), // C_材料 Aさん
          ],
        },
        { key: "portfolio", para: [s("作品①（顧客理解からつくったもの）になります。先輩の多くは、これを推し作品にしています。")] }, // portfolio-02, C_材料 共通するパターン1
        { key: "ai", para: [s("UIの良し悪しを決めるのはAIではなく使う人なので、話は自分で聞きに行きます。")] }, // ai-future
      ],
      memo: {
        about: k("話を聞いた1回について"),
        lines: [
          k("聞く前の仮説：家族の写真を共有するのが面倒なのだと思っていた"),
          k("聞いて分かったこと：面倒なのではなく、見られたくない写真が混ざるのが嫌だった"),
          k("変えたこと：共有する前に選ぶ画面を足し、一括共有をやめた"),
        ],
      },
      handoff: s("話を聞いてつくったサービスが、ポートフォリオの中心の作品になる"), // C_材料 共通するパターン1
      courses: [{ type: "planned", title: "顧客理解のコース" }],
      links: [],
      senpai: {
        who: "Gさん",
        from: "デザイン未経験・子育て中",
        text: s("本当の理由は「投稿が面倒」ではなく「投稿したくない」だと話を聞いて分かった。面接ではその過程を詳しく聞かれた"), // C_材料 Gさん
      },
      skipIf: k("実際に人に話を聞いて、その困りごとからつくった作品がある"),
    },
    {
      id: "portfolio",
      short: "ポートフォリオ",
      title: "ポートフォリオ：3作品を説明できる形にまとめる",
      period: s("約1ヶ月"), // howtostart
      proves: ["ticket", "decider"],
      sections: [
        { key: "can", para: [s("3作品それぞれを、「何をつくり、何のためで、なぜこの形か」から説明できる形にまとめます。")] }, // portfolio-03
        {
          key: "why",
          para: [
            s("ポートフォリオがない、または求められているものとずれていると、1次面接にも進めません。"), // goaloverview
            s("画像を並べるだけでは、決め手になるプロセスと意図が届きません。"), // portfolio-03, E 主張2
          ],
        },
        {
          key: "portfolio",
          h: "ポートフォリオに載せるもの",
          para: [
            s("3作品の説明（概要 → 結論 → プロセス → 終わりに）と、自己紹介・学習ログです。"), // portfolio-03, portfolio-02
            s("ボツにした案や、話を聞いたときのメモも載せます。"), // E 2①
          ],
        },
        { key: "ai", para: [s("余力があれば、AIと一緒にサービスをつくってURLで公開すると、大きな武器になります。")] }, // ai-shift
      ],
      memo: {
        about: k("ここでは新しく書かず、これまでの3行メモを読み返す"),
        lines: [
          k("作品ごとに、いちばん判断が変わったメモを1つ選ぶ"),
          k("それを「なぜこの形か」の結論として、作品説明の最初に置く"),
          k("ほかのメモは、プロセスの段落の材料に使う"),
        ],
      },
      handoff: s("3作品の説明が、面接で作品について話す中身になる"), // uiux-interview-tips-and-checkpoints
      courses: [],
      courseNote: s("コースの外でやります。基礎でつくったものをベースに仕上げ、締め切りを決めて応募へ進みます"), // howtostart
      links: [
        { label: "ポートフォリオの作り方", href: "/lessons/portfolio" },
        { label: "15分フィードバック", href: "/how-to/feedback" },
        { label: "メンバーのアウトプット", href: "/outputs" },
      ],
      senpai: {
        who: "Aさん",
        from: "営業から",
        text: s("最初は情報量が多すぎて「読み手を意識した方がいい」と言われた。人に見てもらって直した"), // C_材料 Aさん
      },
    },
    {
      id: "job",
      short: "転職活動",
      title: "転職活動：40社以上に応募し、面接で作品を話す",
      period: s("1〜2ヶ月"), // howtostart
      proves: ["decider"],
      sections: [
        { key: "can", para: [s("会社ごとに作品の並びを変えて応募し、面接では作品のプロセスを自分の言葉で話します。")] }, // portfolio-01, uiux-interview-tips-and-checkpoints
        {
          key: "why",
          para: [
            s("面接は決め手を直接見られる場で、よく聞かれるのは「なぜこの設計にしたのか」です。"), // C_材料 Hさん, uiux-interview-tips-and-checkpoints
            s("職種未経験の求人は表に出にくいので、数を受けて確かめます。"), // how-to-find-jobs-for-beginner-designers, E 主張1
          ],
        },
        { key: "portfolio", h: "応募に添えるもの", para: [s("入りたい会社には、そのサービスの課題とUIの改善案を添えます。")] }, // portfolio-01, B_材料 ポートフォリオFB記事
        { key: "ai", para: [s("会社研究や模擬面接の練習に、ChatGPTを使った先輩もいます。")] }, // C_材料 Bさん・Dさん
      ],
      memo: {
        about: k("応募する会社1社について"),
        lines: [
          k("この会社のサービスで気になった課題：初めての人が料金を見つけにくい"),
          k("前に出す作品：情報設計でつくった絞り込みの作品"),
          k("なぜ：迷わせない導線をつくる力がいちばん伝わるから"),
        ],
      },
      handoff: s("内定。1社目は完璧を求めず、デザインの実務経験を1年積める会社を選ぶ"), // how-to-find-jobs-for-beginner-designers
      courses: [],
      courseNote: s("コースの外でやります。応募の進め方は「狭い入口の通り方」にまとめました"), // 構成の説明
      links: [CAREER_GUIDE, { label: "転職の相談ができるイベント", href: "/events" }],
      senpai: {
        who: "Bさん",
        from: "商品デザイナーから",
        text: s("本当に受けたい16社は全部不採用。幅広く47社にエントリーし、4社から内定"), // C_材料 Bさん
      },
    },
  ] satisfies V5Stage[],

  /* ---------- 5. 狭い入口の通り方 ---------- */
  gate: {
    lead: [
      s("職種未経験の求人はほとんどないので、「未経験歓迎」だけを探しても応募先は足りません。"), // E 主張1, howtostart
      s("先輩たちは、次のように入っています。"), // C_材料
    ] as Para,
    items: [
      {
        h: "前職の業界を知っている会社を狙う",
        para: [
          s("受ける会社の業界の経験は、採用で加点になります。"), // howtobe（加点：業界の理解・経験）, portfolio-02
          s("金融の経験者がFintechを、広告代理店の出身者が広告ツールを設計する、という形です。"), // howtobe
          s("前職の業界に近い会社を選び、面接でサービスを提案した先輩もいます。"), // C_材料 Lさん
        ],
      },
      {
        h: "制作会社か事業会社かで、見せる作品を変える",
        para: [
          s("行き先は主に、他社のサービスをつくる制作会社と、自社のサービスをつくる事業会社です。"), // howtostart（会社の種類）
          s("制作会社には幅のある作品を、事業会社にはそのサービスの課題とUIの改善案を添えます。"), // portfolio-01, B_材料 ポートフォリオFB記事
        ],
      },
      {
        h: "正社員以外の入り方も考える",
        para: [
          s("業務委託から始めた先輩や、社内の異動でデザイナーになった人もいます。"), // C_材料 Aさん・Eさん・Wさん・Nさん
          s("インターンなら、職種未経験を歓迎する求人もあります（2026年10月時点のGreenで1件）。"), // E 1-1⑥・4
          s("業務委託は報酬が少なめなので、生活費の見通しを立ててから選びます。"), // C_材料 Aさん
        ],
        sources: [SRC.alche, SRC.green],
      },
      {
        h: "40社以上に応募して、受け入れてくれるかを確かめる",
        para: [
          s("未経験を受け入れるかは求人票に書かれないことが多く、応募して確かめるしかありません。"), // how-to-find-jobs-for-beginner-designers
          s("1社あたり採用まで約1ヶ月かかるので、1〜2ヶ月をみておきます。"), // howtostart
          s("落ちたらポートフォリオを直して再応募します。"), // C_材料 Dさん・Fさん
        ],
        sources: [SRC.senpai],
      },
      {
        h: "面接は3段階で、見られるものが変わる",
        para: [
          s("面接はたいてい3段階で、ポートフォリオを元にしたスキルの確認、チームとの相性、会社への貢献の順に見られます。"), // uiux-interview-tips-and-checkpoints
        ],
      },
    ] satisfies Block[],
  },

  /* ---------- 6. 経験がある人 ---------- */
  experienced: {
    lead: s("飛ばすかどうかは「つくったものがあるか」で決めます。"), // D_外部の定石 5
    caution: s("デザインの経験が長くても、応募では「即戦力が欲しい」と言われることがあります（Dさん・グラフィック18年）。"), // C_材料 Dさん
    otherRoadmap: { label: "Web・グラフィックの経験がある人向けの行き先", slug: "web-graphic-to-ui" },
  },

  /* ---------- 6. 先輩の道のり ---------- */
  stories: [
    {
      who: "Gさん",
      from: "デザイン未経験・子育て中",
      body: [
        s("子育てをしながら学び、約7ヶ月で内定しました。応募は20社です。"),
        s("話を聞いて「投稿したくない」が本当の理由だと気づき、サービスに組み込んだ過程が評価されました。"),
      ] as Para,
    }, // C_材料 Gさん
    {
      who: "Hさん",
      from: "SE（システムエンジニア）から",
      body: [
        s("会社を辞めて1日3〜4時間学び、約9ヶ月で内定しました。応募は約30社です。"),
        s("「チケット取得が課題」という仮説が話を聞いて外れ、作り直した過程が評価されました。"),
      ] as Para,
    }, // C_材料 Hさん
    {
      who: "Eさん",
      from: "公務員（経理）→ カフェのバリスタから",
      body: [
        s("平日1時間、週末4〜5時間のペースで学び、約1年2ヶ月で内定しました。"),
        s("毎月の目標と振り返りをnoteで公開し、計画を立てて続けられる人だと伝わりました。"),
      ] as Para,
    }, // C_材料 Eさん
    {
      who: "Iさん",
      from: "飲料メーカーの総合職から",
      body: [
        s("働きながら学び、約1年4ヶ月で内定しました。応募は50社以上です。"),
        s("作品をやり直した過程もポートフォリオに載せ、考えの変化が見えるようにしていました。"),
      ] as Para,
    }, // C_材料 Iさん
  ],

  /* ---------- 6. つまずき ---------- */
  pitfalls: [
    {
      title: "落ち続けるのは、多くの先輩が通った道",
      body: [
        s("面談で止まる、返事が来ない、「即戦力が欲しい」と言われる。多くの先輩が経験しています。"), // C_材料 共通するパターン5
        s("期限を決めて、数を受け続けます。"), // C_材料 Dさん・Fさん, how-to-find-jobs-for-beginner-designers
      ] as Para,
      link: null as { label: string; href: string } | null,
    },
    {
      title: "一人で迷ったら、早めにフィードバックをもらう",
      body: [
        s("自分のデザインの良し悪しは、一人では判断がつきません。"), // C_材料 共通するパターン5
        s("Iさんも「最初からもらえばよかった」と振り返っています。"), // C_材料 Iさん, portfolio-01
      ] as Para,
      link: { label: "15分フィードバック", href: "/how-to/feedback" },
    },
    {
      title: "情報設計で止まったら、まず最後まで通す",
      body: [
        s("情報設計は文字の情報から自分で整理するので、手が止まりがちです。"), // C_材料 Bさん
        s("一度最後まで通すと、ポートフォリオで振り返ったときに分かることが多くあります。"), // C_材料 Eさん, way-phase02
      ] as Para,
      link: null,
    },
    {
      title: "作品の説明は3行メモから書く",
      body: [
        s("ポートフォリオの段階で、なぜその形にしたかを思い出せないことがあります。"), // portfolio-03, C_材料 Rさん
        k("3行メモを残しておけば、説明の材料はもう手元にあります。"),
      ] as Para,
      link: null,
    },
  ],

  /* ---------- 6. よくある質問 ---------- */
  faq: [
    {
      question: s("「未経験歓迎」の求人に出せばいい？"),
      answer: s("それだけだと応募先が足りません。「未経験歓迎」の多くは業界未経験の意味です（2026年10月時点）。40社以上に応募して確かめます。"), // E 4・主張1, how-to-find-jobs-for-beginner-designers
    },
    {
      question: s("AIがあるのに、学ぶ意味は？"),
      answer: s("あります。画面はAIでつくれるぶん、なぜその形かが前より見られます。AIの画面の良し悪しを判断するにも、手でつくった経験が要ります。"), // E 主張5・9, ai-shift
    },
    {
      question: s("働きながらでも転職できる？"),
      answer: s("できます。先輩は、働きながらと辞めて専念がほぼ半々です。働きながらの人は、平日1〜2時間と週末にまとめて進めています。"), // C_材料 共通するパターン3
    },
    {
      question: s("何社くらい応募する？"),
      answer: s("40社以上が目安です。先輩は15〜50社ほど応募している人が多くいます。"), // how-to-find-jobs-for-beginner-designers, C_材料 共通するパターン4
    },
    {
      question: s("作品は架空の題材でもいい？"),
      answer: s("構いません。ただ、顧客理解の作品は実際に話を聞いたものにします。面接で実際のユーザーの課題を聞かれることがあるからです。"), // portfolio-01, C_材料 Aさん
    },
    {
      question: s("順番どおりに進めないとだめ？"),
      answer: s("順番どおりがおすすめです。目標を立てにくいときは、先にコース全体をざっと見ても構いません。"), // howtostart, goalsetting
    },
  ],

  /* ---------- 7. このロードマップの根拠 ---------- */
  sources: {
    jobs: {
      title: "求人票",
      body: s("doda・リクルートエージェント・Green・Wantedly・ビズリーチ・企業の採用ページから、UI/UXデザイナーの求人24件を2026年10月23日に読みました。件数は、要件まで読めた23件で数えています。"), // E 1・調査日
      links: [SRC.smarthr, SRC.cybozuJob, SRC.mfJob, SRC.codmon, SRC.co26, SRC.courier, SRC.labol, SRC.alche],
    },
    market: {
      title: "求人数と市場",
      body: s("リクルートエージェントとGreenの検索結果（2026年10月23日時点）と、dodaの転職求人倍率・市場予測です。"), // E 3-1・3-2・4
      links: [SRC.ragent, SRC.green, SRC.dodaRatio, SRC.dodaMarket],
    },
    companies: {
      title: "採用する側の記事",
      body: s("各社のデザイナーや採用担当が、採用やポートフォリオの評価について書いた記事です（2021〜2026年）。"), // E 2
      links: [SRC.goodpatch, SRC.cybozuNote, SRC.caGuide, SRC.caWay, SRC.mfDeck, SRC.freee, SRC.layerx2025, SRC.layerx2026, SRC.pivot, SRC.dena, SRC.redesigner],
    },
    bono: {
      title: "BONOの記事",
      body: s("進め方、採用で見られること、ポートフォリオ、会社の探し方、面接、AIとデザインの仕事についての記事です。"), // A・B 材料の slug 一覧
      links: [CAREER_GUIDE],
    },
    senpai: {
      title: "先輩の話",
      body: s("BONOで学んで転職した人へのインタビューから。名前は伏せ、Aさん〜Wさんの仮名にしています。"), // C_材料
      links: [] as Src[],
    },
    note: s("海外の調査は使っていません。日本の求人と会社の資料だけを根拠にしています。"), // オーナー判断
  },
};

export type CareerChangeV5 = typeof careerChangeV5;
