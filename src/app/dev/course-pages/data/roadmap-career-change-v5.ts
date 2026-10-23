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

/** 文章の段落＋その段落の出典 */
export interface SourcedPara {
  para: Para;
  sources?: Src[];
}

/** 入場券（基礎の画面＋Figma）／決め手（なぜその形かを説明できる） */
export type Proof = "ticket" | "decider";

export interface V5Stage {
  id: string;
  short: string;
  title: string;
  period: Field;
  /** このステップが証明するもの（2. 企業が見ているもの と対応） */
  proves: Proof[];
  /**
   * 本文
   * 段落1: できるようになること → なぜ（入場券／決め手のどちらに効くか）→ 飛ばすとどうなるか
   * 段落2: ポートフォリオに入るもの → AIの使いどころ
   */
  body: Para[];
  /** このステップの3行メモ（書く例。すべて仮） */
  memo: { about: Field; lines: Field[] };
  handoff: Field;
  courses: V5CourseRef[];
  courseNote?: Field;
  links: { label: string; href: string }[];
  senpai: { who: string; from: string; text: Field };
  extra?: { lead: Field; items: Field[] };
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
        para: [
          s("転職サイトで「UIデザイナー」と検索すると、「未経験歓迎」と書かれた求人がたくさん出てきます。"), // E 4（リクルートエージェント 249件中217件）
          s("ただ、2026年10月時点でリクルートエージェントの求人を確かめたところ、そのタグのほとんどは「業界未経験歓迎」で、「職種未経験歓迎」のタグは見た範囲で0件でした。"), // E 4（先頭約100件）
          s("別の業界から来るのは歓迎だけれど、デザインの実務経験は必要、という意味です。"), // E 4
        ],
        sources: [SRC.ragent],
      },
      {
        para: [
          s("求人の中身を読んでも同じです。要件まで読めたUI/UXデザイナーの求人23件のうち、21件が実務経験を必須にしていました。"), // E 1-2・主張1
          s("「ポテンシャル採用」「第二新卒歓迎」と書いてあっても、実務1〜3年を求めている求人があります。"), // E 1-2（③⑦⑯）
          s("Greenでも、一覧の先頭20件のうち職種未経験を歓迎していたのはインターン1件だけでした。"), // E 4
        ],
        sources: [SRC.jobs, SRC.green],
      },
      {
        para: [
          s("つまり、デザインの仕事をしたことがない人がそのまま応募できる求人は、ほとんどありません。"), // E 主張1
          s("それでも、実務経験の代わりに「この人なら現場で動けそうだ」と思わせる材料があれば、選考に進めます。"), // goalreason（採用されるのは現場で動けるイメージがある人）
          s("dodaの市場予測も、実務未経験でも学習の積み重ねが評価される可能性があるとして、自主制作のUIと設計の意図を書いたポートフォリオを勧めています。"), // E 4（doda 2026-07）
        ],
        sources: [SRC.dodaMarket],
      },
    ] satisfies SourcedPara[],
    /** ゴール宣言 */
    goal: s("その材料がポートフォリオです。実務経験の代わりに「現場で動ける」と思わせるポートフォリオをつくることが、このロードマップのゴールです。"), // E 主張1, howtostart（ゴールはポートフォリオ）
    /** 先輩が通った事実 */
    senpai: [
      s("実際に、BONOで学んだ先輩たちはこの入口を通っています。"), // C_材料
      s("学習を始めてから内定までは7ヶ月〜1年半ほどで、応募した数は15〜50社ほどの人が多くいます。"), // C_材料 共通するパターン2・4
      s("落ち続けた時期がある人も少なくありませんが、応募の仕方を変えて内定にたどり着いています。"), // C_材料 共通するパターン5, Bさん・Dさん
    ] as Para,
  },

  /* ---------- 2. 企業が見ているもの ---------- */
  wants: {
    lead: [
      s("求人票と、採用する側が書いた記事を読むと、見られているものは2つの段に分かれます。"), // E 1-2・2
      s("1つ目は書類で落とされないための入場券、2つ目は面接で選ばれるための決め手です。"), // howtobe（足切り）, E 主張2・4
    ] as Para,
    layers: [
      {
        key: "ticket" as Proof,
        name: "入場券",
        title: "基礎の画面がつくれて、Figmaが使える",
        body: s("文字・色・レイアウトの基本を押さえた、ふつうに使える画面をFigmaでつくれること。ここが弱いと書類で落ち、面接に進めません。"), // E 主張4, howtobe
        stat: s("Figmaを必須と明記した求人 23件中11件"), // E 1-2
        sources: [SRC.jobs, SRC.goodpatch, SRC.caGuide],
      },
      {
        key: "decider" as Proof,
        name: "決め手",
        title: "なぜその形にしたかを説明できる",
        body: s("誰のどんな困りごとのために、何を考えてその形にしたのか。完成した見た目より、そこに至ったプロセスと意図が見られます。"), // E 主張2・3
        stat: s("プロセスや意図を重視した採用側の記事 10件中6件／求人で意図の説明を求める 23件中8件"), // E 2 集計・1-2
        sources: [SRC.jobs, SRC.goodpatch, SRC.cybozuNote, SRC.mfDeck, SRC.pivot],
      },
    ],
    /** 入場券の理由 */
    ticketWhy: {
      para: [
        s("入場券のほうは、AIが広まった今も外れていません。"), // E 主張4
        s("サイバーエージェントはポートフォリオの評価項目の1つに「デザインの基礎力」を挙げていて、Goodpatchも新卒のポートフォリオで文字・色・レイアウトの基本を見ていると書いています。"), // E 2③・①
        s("デザイナーとして雇う以上、アイデアを画面に具体化できなければ任せられる仕事がない、というのが理由です。"), // howtobe
      ],
      sources: [SRC.caGuide, SRC.goodpatch],
    } satisfies SourcedPara,
    /** 決め手の理由（会社ごとの理由） */
    deciderWhy: [
      {
        para: [
          s("決め手のほうは、会社ごとに理由がはっきり書かれています。"),
          s("Goodpatchは、デザイナーの仕事は複雑なことを分かりやすい形にすることなので、最終的なアウトプットだけでなくプロセスを見ていると書いています。"), // E 2①
          s("ボツにした案があると、どう判断したかの筋道を追えるからです。"), // E 2①
        ],
        sources: [SRC.goodpatch],
      },
      {
        para: [
          s("サイボウズのデザインチームは、出した製品をテストして直し続ける会社なので、評価を受けて何を直したかを見たいと書いています。"), // E 2②
          s("改善できる素地があるかを、ポートフォリオのプロセスから見ているということです。"), // E 2②
        ],
        sources: [SRC.cybozuNote],
      },
      {
        para: [
          s("求人票でも、意図を言葉で説明できることは、Figmaの次によく出てくる要件でした。"), // E 1-2・主張3
          s("マネーフォワードは目的を持ってデザインし意図を分かりやすく説明できることを必須にしていて、サイボウズはPM・エンジニアとのチーム開発の経験と、意図を言語化して説明できることを並べて求めています。"), // E 1-1⑮⑯
          s("画面は1人で決めるものではなく、PMやエンジニアと話して決めるので、説明できないと合意がとれません。"), // E 主張3
        ],
        sources: [SRC.mfJob, SRC.cybozuJob],
      },
      {
        para: [
          s("PIVOTのデザイナーは、情報設計を学校で学んだ人は少ないので、組み立てた意図を説明できるかを見ていると話しています。"), // E 2⑩
          s("つまり、未経験でも説明できれば差がつくところです。"), // E 2⑩ からの言い換え
        ],
        sources: [SRC.pivot],
      },
    ] satisfies SourcedPara[],
    /** ポテンシャル枠 */
    potential: {
      title: "ポテンシャル枠で見られる、学び続ける習慣",
      para: [
        s("未経験に近い枠では、もう1つ、学び続ける習慣と意欲がはっきり見られます。"), // E 主張8
        s("株式会社26の未経験可の求人は技術より意欲を最重視すると書き、クーリエは継続的に学ぶ習慣を必須に入れています。"), // E 1-1①②
        s("LayerXは採用でAIに詳しいことより好奇心を重視するとしていて、サイバーエージェントも変化を楽しんで挑戦できるかを見ています。"), // E 2⑨④
        s("教える側からすると、自分で学び続けられる人なら任せられる仕事が増えていくからです。"), // howtobe（スキル3）
      ] as Para,
      sources: [SRC.co26, SRC.courier, SRC.layerx2026, SRC.caWay],
    },
    /** 3作品への橋渡し */
    worksLead: s("この入場券と決め手を見せる形が、ポートフォリオの3つの作品です。種類を変えてそろえます。"), // portfolio-02
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
    whyThree: s("作品が1つだけだと「まぐれかも？」と思われます。3つあると、同じようにつくれる人だと伝わります。"), // portfolio-02
  },

  /* ---------- 3. AIで変わったこと、変わらないこと ---------- */
  ai: {
    blocks: [
      {
        para: [
          s("いまは生成AIに頼めば、それらしい画面が誰でもすぐにつくれます。"), // E 主張5
          s("サイバーエージェントは、生成AIなどで誰でも作品をつくれるようになってポートフォリオが似てきたので、本人の視点を見たいとして評価項目を公開しました。"), // E 2③
          s("AIを使うこと自体は認めていて、本人の工夫や意図が入っていれば歓迎するという書き方です。"), // E 2③（言い換え）
        ],
        sources: [SRC.caGuide],
      },
      {
        para: [
          s("画面そのものでは差がつきにくくなったぶん、なぜその形が良いのかを説明できるかが、前より決め手になっています。"), // E 主張9・3-3
          s("ただ、これはAIで新しく求められるようになったことではありません。"), // E 3-3
          s("プロセスや意図を見るという話は、2021年ごろの採用側の記事にもすでに出てきます。もともと見られていた意図の説明が、画面の差が縮んだぶん決め手になった、と考えるのが実態に近いところです。"), // E 3-3・主張9
        ],
        sources: [SRC.dena, SRC.redesigner],
      },
      {
        para: [
          s("一部の会社では、AIや設計の経験が要件に入り始めています。"), // E 主張6
          s("SmartHRの新卒の要件には、AIを制作の工程に組み込んだ経験と、見た目だけでなく情報の構造からUIを設計した経験が並んでいて、コドモンは生成AIの活用に意欲的なことを必須にしています。"), // E 1-1⑤㉓
          s("ただ、2026年10月時点で読んだ求人23件のうち、要件にAIが入っていたのはこの2件だけで、残りの約8割はAIに触れていませんでした。"), // E 1-2
          s("AIの経験はあれば加点になりますが、入場券の中心は今も実務経験とFigmaです。"), // E 1-2 読み方・3-3
        ],
        sources: [SRC.smarthr, SRC.codmon, SRC.jobs],
      },
      {
        para: [
          s("もう1つ変わらないのは、AIが出した画面の良し悪しを決めるのは自分だ、ということです。"), // ai-shift, E 2⑦
          s("freeeとGoodpatchの対談では、AI時代のデザイナーに必要な力としてAIの出力を評価する力と、なぜ良いかを説明する力が挙がっています。"), // E 2⑦
          s("BONOの記事でも書いているとおり、AIの出力を正しく評価するには、自分の手で画面をつくった経験と、それを見分ける目が要ります。"), // ai-shift
          s("このロードマップで基礎の画面を手でつくるのは、そのためです。"), // ai-shift
        ],
        sources: [SRC.freee],
      },
    ] satisfies SourcedPara[],
  },

  /* ---------- 4. 全体図となぜこの順か ---------- */
  order: [
    s("学ぶ順は、仕事の順（顧客理解 → 情報設計 → 見た目）の逆です。仕事の順ではなく、つまずきにくい順に並べています。"), // ai-future, howtostart
    s("最初の大きなハードルは見た目で、ここを越えると情報設計や顧客理解がぐっとラクになります。"), // howtostart
    s("前半のステップで入場券をそろえ、後半のステップで決め手の材料をつくります。"), // E 主張4・2 と各ステップの対応（構成の説明）
  ] as Para,

  /* ---------- 4. 3行メモ ---------- */
  memoIntro: {
    para: [
      k("ステップ1から、つくったものには毎回「なぜこの形にしたか」を3行で書いて残します。"), // 3行という形はBONOの提案（仮）
      s("決め手になる説明は、最後のポートフォリオの段階でまとめて書こうとしても、そのときに何を考えていたかを思い出せません。"), // C_材料 Rさん（ログをもっと残すべきだった）・Cさん
      s("先輩の作品が評価された理由でいちばん多かったのは、話を聞いて仮説が崩れ、つくり直した過程でした。その過程は、その場でメモしていないと書けません。"), // C_材料 共通するパターン6
      s("面接でも、何を考えて学んできたかを聞かれます。"), // C_材料 Cさん, uiux-interview-tips-and-checkpoints
    ] as Para,
  },

  /* ---------- 4. ステップ ---------- */
  stages: [
    {
      id: "prep",
      short: "準備",
      title: "Figmaに慣れて、ゴールを知る",
      period: k("2週間〜1ヶ月"), // 記事は「1-2ヶ月目」。6〜9ヶ月に収めるため縮めた
      proves: ["ticket"],
      body: [
        [
          s("最初は、Figmaで既存のアプリの画面を真似してつくりながら、採用で何を見られるのかを知るところから始めます。"), // howtostart, way-phase01
          s("Figmaは求人の約半分が必須に明記している入場券の一部で、ここで手を慣らしておくと次のステップで画面づくりに集中できます。"), // E 1-2（23件中11件）, howtostart
          s("見せるものを先に知っておくと、この先の各ステップが何のためにあるのかが分かり、ポートフォリオの材料を貯めながら学べます。"), // howtostart
        ],
        [
          s("この段階では、ポートフォリオに入る作品はまだありません。ただ、真似した画面に作成日をつけて残しておくと、あとで成長の記録として使えます。"), // portfolio-02
          k("Figmaの操作で詰まったときは、AIに聞いて止まらずに先へ進みます。"),
        ],
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
      body: [
        [
          s("SNSやTodoサービスにある基本の画面を、見本を横に置かずに自分でつくれるところまで進めます。"), // howtostart
          s("これが入場券の中心です。採用側は文字・色・レイアウトの基本を見ていて、ここが弱いと書類選考で落ちて面接に進めません。"), // E 主張4, howtobe, portfolio-01
          s("後の情報設計や顧客理解も重くなるので、最初に越えておきたいところです。"), // howtobe, howtostart
        ],
        [
          s("Daily UI などでつくった画面の中から、ポートフォリオの作品③（ビジュアルが分かるもの）を選びます。"), // portfolio-02
          s("画面は自分の手でつくります。AIが出した画面の良し悪しを見分ける目は、手でつくった経験からつくからです。"), // ai-shift
        ],
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
      body: [
        [
          s("「こんな機能がほしい」というアイデアだけがある状態から、複数の画面にまたがるUIを組み立てられるようにします。"), // howtostart
          s("画面から画面への流れは実務にいちばん近い部分で、入場券の仕上げであると同時に、決め手の材料にもなります。"), // portfolio-01, howtostart, E 主張7
          s("PIVOTは情報設計を学んだ人は少ないので説明できるかを見ていると話していて、SmartHRの新卒要件にも情報の構造から設計した経験が入っています。"), // E 2⑩, E 1-1⑤
        ],
        [
          s("ここでつくったものが、作品②（複数画面のUI）になります。たとえば求人サイトの検索と絞り込みです。"), // portfolio-02
          k("画面パターンのたたき台はAIで出して構いませんが、要件に合っているかは自分で決めます。"),
        ],
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
      body: [
        [
          s("1人でもいいので実際に人に話を聞き、その困りごとからサービスを考えます。"), // portfolio-01
          s("ここが決め手の中心です。Goodpatchは誰のどんな課題か、ユーザーからどんな反応があったかを見ていて、サイボウズはユーザーをどう理解してアイデアに至ったかを見ています。"), // E 2①②
          s("ここを飛ばすと、面接で「自分の想像ではなく、実際のユーザーの課題を解決したものはある？」と聞かれたときに答えられません。"), // C_材料 Aさん
        ],
        [
          s("ここでつくるのが作品①（顧客理解からつくったもの）で、先輩の多くはこれを推し作品にしています。"), // portfolio-02, C_材料 共通するパターン1
          s("どのUIが良いかを決めるのはAIではなく使う人なので、話は自分で聞きに行きます。"), // ai-future
        ],
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
      body: [
        [
          s("3つの作品それぞれについて、「何をつくり、何のためで、なぜこの形か」から説明できる形にまとめます。"), // portfolio-03
          s("ポートフォリオは入場券の判定材料でもあり、ない、または求められているものとずれていると1次面接にも進めません。"), // goaloverview
          s("画像を並べるだけだと見た目しか伝わらず、決め手になるプロセスと意図が読み手に届きません。"), // portfolio-03, E 主張2
        ],
        [
          s("中身は、3作品の説明（概要 → 結論 → プロセス → 終わりに）と、自己紹介・学習ログです。ボツにした案や話を聞いたときのメモも載せます。"), // portfolio-03, portfolio-02, E 2①
          s("余力があれば、AIと一緒にサービスをつくってURLで公開してみると、大きな武器になります。"), // ai-shift
        ],
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
      body: [
        [
          s("会社ごとに作品の並びを変えて応募し、面接では作品のプロセスを自分の言葉で説明します。"), // portfolio-01, uiux-interview-tips-and-checkpoints
          s("面接は決め手を直接見られる場で、よく聞かれるのは「なぜこの設計にしたのか」です。"), // C_材料 Hさん, uiux-interview-tips-and-checkpoints
          s("職種未経験の求人はほとんど表に出ないので、数を受けて、受け入れてくれる会社かどうかを自分の行動で確かめます。"), // how-to-find-jobs-for-beginner-designers, E 主張1
        ],
        [
          s("入りたい会社に応募するときは、そのサービスの課題とUIの改善案をポートフォリオに添えます。"), // portfolio-01, B_材料 ポートフォリオFB記事
          s("先輩の中には、会社研究や模擬面接の練習にChatGPTを使った人もいます。"), // C_材料 Bさん・Dさん
        ],
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
      s("職種未経験の求人がほとんどない以上、求人票の「未経験歓迎」だけを探していても応募先は見つかりません。"), // E 主張1, howtostart
      s("先輩たちがやっていたのは、次のような入り方です。"), // C_材料
    ] as Para,
    items: [
      {
        title: "前職の業界を知っている会社を狙う",
        body: [
          s("採用では、受ける会社の業界の経験や知識が加点になります。"), // howtobe（加点：業界の理解・経験）, portfolio-02
          s("金融の経験者がFintechのサービスを、広告代理店の出身者が広告ツールを設計する、という形です。"), // howtobe
          s("先輩にも、前職の人材業界に近い会社を選んで面接でサービスの提案をした人や、カスタマーサポートで培った顧客理解を強みにした人がいます。"), // C_材料 Lさん・Mさん
        ] as Para,
        sources: [] as Src[],
      },
      {
        title: "制作会社か事業会社かで、見せる作品を変える",
        body: [
          s("UIデザイナーの行き先は、主に、ほかの会社のサービスをつくる制作会社と、自社のサービスをつくる事業会社に分かれます。"), // howtostart（会社の種類）
          s("制作会社には幅のある作品を、事業会社にはそのサービスの課題とUIの改善案を添えると、相手が見たいものに合わせられます。"), // portfolio-01, B_材料 ポートフォリオFB記事
          s("1つのサービスにじっくり関わりたくて事業会社を選んだ先輩もいます。"), // C_材料 Bさん
        ] as Para,
        sources: [] as Src[],
      },
      {
        title: "正社員以外の入り方も考える",
        body: [
          s("最初から正社員にこだわらず、業務委託から始めた先輩もいます。"), // C_材料 Aさん・Eさん・Wさん
          s("いまの会社でUI改善の会議に自分から加わったり、社内の異動でデザイナーになったりした人もいます。"), // C_材料 Mさん・Nさん
          s("インターンなら職種未経験を歓迎している求人もあり、2026年10月時点でGreenの一覧の先頭20件で職種未経験を歓迎していたのはインターンの1件でした。"), // E 1-1⑥・4
          s("業務委託は報酬が少なめなので、生活費の見通しを立ててから選びます。"), // C_材料 Aさん
        ] as Para,
        sources: [SRC.alche, SRC.green] as Src[],
      },
      {
        title: "40社以上に応募し、3段階の面接に備える",
        body: [
          s("目安は40社以上です。未経験を受け入れるかは求人票に書かれないことが多く、応募して確かめるしかありません。"), // how-to-find-jobs-for-beginner-designers
          s("1社あたり採用まで約1ヶ月かかるので、転職活動には1〜2ヶ月をみておきます。"), // howtostart
          s("面接はたいてい3段階で、ポートフォリオを元にしたスキルの確認、働き方とチームとの相性、会社への貢献の順に見られます。"), // uiux-interview-tips-and-checkpoints
          s("落ちたらポートフォリオを直して再応募し、期限を決めて続けます。"), // C_材料 Dさん・Fさん
        ] as Para,
        sources: [SRC.senpai] as Src[],
      },
    ],
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
        s("子育てをしながら学び、本格的に始めてから約7ヶ月で内定しました。"),
        s("応募は20社で、そのうち10社で面接を受けています。"),
        s("評価されたのは、話を聞いて「投稿したくない」が本当の理由だと気づき、それをサービスに組み込んだ過程です。"),
      ] as Para,
    }, // C_材料 Gさん
    {
      who: "Hさん",
      from: "SE（システムエンジニア）から",
      body: [
        s("会社を辞めて学習に専念し、1日平均3〜4時間のペースで約9ヶ月かけて内定しました。"),
        s("約30社に応募し、面接・面談まで進んだのは15社です。"),
        s("「チケット取得が課題」という仮説が話を聞いて外れ、そこから作り直した過程が評価されました。"),
      ] as Para,
    }, // C_材料 Hさん
    {
      who: "Eさん",
      from: "公務員（経理）→ カフェのバリスタから",
      body: [
        s("働きながら、平日は1時間、週末は4〜5時間を学習にあてました。"),
        s("BONOに入ってから内定まで約1年2ヶ月で、10社に応募し、面接は2社、内定は1社です。"),
        s("毎月の目標と振り返りをnoteで公開していたことで、計画を立てて続けられる人だと伝わりました。"),
      ] as Para,
    }, // C_材料 Eさん
    {
      who: "Iさん",
      from: "飲料メーカーの総合職から",
      body: [
        s("働きながら学び、約1年4ヶ月で内定しました。"),
        s("50社以上に応募し、面接まで進んだのは4社です。"),
        s("作品をやり直した過程もポートフォリオに載せていて、インタビュアーは「変化が見えると、何を考えたかが分かる」と話しています。"),
      ] as Para,
    }, // C_材料 Iさん
  ],

  /* ---------- 6. つまずき ---------- */
  pitfalls: [
    {
      title: "落ち続ける・実務経験の壁",
      body: [
        s("先輩の多くが、カジュアル面談で止まったり、返事が来なかったり、「即戦力が欲しい」と言われたりしています。"), // C_材料 共通するパターン5
        s("数を受け、落ちたらポートフォリオを直して再応募します。期限を決めて続けるのが大事です。"), // C_材料 Dさん・Fさん, how-to-find-jobs-for-beginner-designers
      ] as Para,
      link: null as { label: string; href: string } | null,
    },
    {
      title: "一人だと正しいか分からない",
      body: [
        s("自分のデザインが良いのか悪いのか、一人では判断がつきません。"), // C_材料 共通するパターン5
        s("早めに現役デザイナーのフィードバックをもらいます。Iさんも「最初からもらえばよかった」と振り返っています。"), // C_材料 Iさん, portfolio-01
      ] as Para,
      link: { label: "15分フィードバック", href: "/how-to/feedback" },
    },
    {
      title: "情報設計で止まる",
      body: [
        s("トレースには正解がありますが、情報設計は文字の情報から自分で整理する必要があり、ここで手が止まりがちです。"), // C_材料 Bさん
        s("完璧にせず一度最後まで通ると、ポートフォリオで振り返ったときに分かることが多くあります。"), // C_材料 Eさん, way-phase02
      ] as Para,
      link: null,
    },
    {
      title: "作品の説明が書けない",
      body: [
        s("ポートフォリオの段階になって、なぜその形にしたのかを思い出せず、画像を並べるだけになってしまうことがあります。"), // portfolio-03, C_材料 Rさん
        k("各ステップの3行メモを残しておけば、説明の材料はもう手元にあります。"),
      ] as Para,
      link: null,
    },
  ],

  /* ---------- 6. よくある質問 ---------- */
  faq: [
    {
      question: s("「未経験歓迎」の求人に出せばいい？"),
      answer: s("それだけだと応募先が足りません。2026年10月時点で確かめた範囲では、「未経験歓迎」の多くは業界未経験の意味で、デザインの実務経験は求められていました。未経験を受け入れるかは書かれていないことが多いので、40社以上に応募して確かめます。"), // E 4・主張1, how-to-find-jobs-for-beginner-designers
    },
    {
      question: s("AIがあるのに、学ぶ意味は？"),
      answer: s("あります。それらしい画面はAIでつくれるようになったぶん、採用側はなぜその形にしたのかを前より見るようになっています。AIの出した画面の良し悪しを判断するにも、自分の手でつくった経験と目が要ります。"), // E 主張5・9, ai-shift
    },
    {
      question: s("働きながらでも転職できる？"),
      answer: s("できます。転職した先輩は、働きながらと辞めて専念がほぼ半々です。働きながらの人は、平日に1〜2時間と週末にまとめて、という進め方をしています。"), // C_材料 共通するパターン3
    },
    {
      question: s("何社くらい応募する？"),
      answer: s("40社以上が目安です。先輩は15〜50社ほど応募している人が多く、面接に進むのはその一部です。"), // how-to-find-jobs-for-beginner-designers, C_材料 共通するパターン4
    },
    {
      question: s("作品は架空の題材でもいい？"),
      answer: s("構いません。ただ、顧客理解の作品は1人でもいいので実際に話を聞いたものにします。面接で「実際のユーザーの課題を解決したものはあるか」と聞かれることがあります。"), // portfolio-01, C_材料 Aさん
    },
    {
      question: s("順番どおりに進めないとだめ？"),
      answer: s("順番どおりがおすすめです。ただ、中身が分からず目標を立てにくいときは、先にコース全体をざっと見ても構いません。"), // howtostart, goalsetting
    },
  ],

  /* ---------- 7. このロードマップの根拠 ---------- */
  sources: {
    jobs: {
      title: "求人票",
      body: s("doda・リクルートエージェント・Green・Wantedly・ビズリーチ・企業の採用ページから、UI/UXデザイナーの求人24件を2026年10月23日に開き、必須・歓迎・人物像を抜き出しました。件数は、要件まで読めた23件で数えています。掲載は2022〜2026年で、いずれもその日時点のものです。"), // E 1・調査日
      links: [SRC.smarthr, SRC.cybozuJob, SRC.mfJob, SRC.codmon, SRC.co26, SRC.courier, SRC.labol, SRC.alche],
    },
    market: {
      title: "求人数と市場",
      body: s("リクルートエージェントとGreenの検索結果（2026年10月23日時点）、dodaの転職求人倍率と市場予測を使いました。"), // E 3-1・3-2・4
      links: [SRC.ragent, SRC.green, SRC.dodaRatio, SRC.dodaMarket],
    },
    companies: {
      title: "採用する側の記事",
      body: s("採用やポートフォリオの評価について、各社のデザイナーや採用担当が書いた記事です（2021〜2026年）。"), // E 2
      links: [SRC.goodpatch, SRC.cybozuNote, SRC.caGuide, SRC.caWay, SRC.mfDeck, SRC.freee, SRC.layerx2025, SRC.layerx2026, SRC.pivot, SRC.dena, SRC.redesigner],
    },
    bono: {
      title: "BONOの記事",
      body: s("ロードマップの進め方、採用で見られること、ポートフォリオの作り方、未経験からの会社の探し方、面接のポイント、AIとデザインの仕事についての記事です。"), // A・B 材料の slug 一覧
      links: [CAREER_GUIDE],
    },
    senpai: {
      title: "先輩の話",
      body: s("BONOで学んで転職した人へのインタビューから。名前は伏せ、Aさん〜Wさんの仮名にしています。"), // C_材料
      links: [] as Src[],
    },
    note: s("海外の調査は使っていません。日本で働く人に向けて、日本の求人と会社の資料だけを根拠にしています。"), // オーナー判断
  },
};

export type CareerChangeV5 = typeof careerChangeV5;
