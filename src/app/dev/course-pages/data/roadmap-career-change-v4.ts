/**
 * data ＝ 未経験から転職ロードマップ v4「記事ベースの中身」— #243
 *
 * 中身はすべて BONO の記事から（rebono/issues/243-B_材料/ の A〜D）。
 * - s(): 材料にある内容（引用か近い言い換え）。行末コメントに出典 slug
 * - k(): 材料にない推測（仮）。トグルで「仮」タグが出る
 * - 先輩の話（C_材料）は仮名（Aさん〜Wさん）だけを使う。C の slug には実名が入っているので、
 *   コメントにも slug は書かず「C_材料 ◯さん」と書く（このリポジトリは公開）
 * - 出典同士で食い違う数字（転職実績 約40人／約50人）は出さない
 *
 * 期間の組み立て（週12時間で6〜9ヶ月 に合わせる）:
 *   記事（howtostart）のフェーズ別は 1-2 ＋ 6 ＋ 1 ＋ 1-2 ＝ 9〜11ヶ月で、6〜9ヶ月に収まらない。
 *   ポートフォリオ（約1ヶ月）と転職活動（1〜2ヶ月）は記事どおり。
 *   準備と3つの基礎（記事では基礎全体で6ヶ月）を縮めて割り振った ＝ 推測（仮）。
 *   最短 0.5 ＋ 1.5 ＋ 1 ＋ 1 ＋ 1 ＋ 1 ＝ 6ヶ月 / 最長 1 ＋ 2.5 ＋ 1.5 ＋ 1 ＋ 1 ＋ 2 ＝ 9ヶ月
 */

import type { Field } from "./types";

/** 推測（仮） */
const k = (text: string): Field => ({ text, kari: true });
/** 材料にある内容 */
const s = (text: string): Field => ({ text });

export type V4CourseRef = { type: "course"; slug: string } | { type: "planned"; title: string };

/** 段落 ＝ 文のつながり。仮の文だけ「仮」タグが付くよう、文ごとに Field を分ける */
export type Para = Field[];

export interface V4Stage {
  id: string;
  /** 全体図用の短い名前 */
  short: string;
  /** ステップの見出し */
  title: string;
  period: Field;
  /**
   * 本文（ふつうの文章）
   * 段落1: できるようになること → 転職にとってのなぜ → 飛ばすとどうなるか
   * 段落2: ポートフォリオに入るもの → AIの使いどころ
   */
  body: Para[];
  /** 全体図で使う: このステップで手に入るものが次でどう使われるか */
  handoff: Field;
  courses: V4CourseRef[];
  /** コースがないときの一言 */
  courseNote?: Field;
  links: { label: string; href: string }[];
  senpai: { who: string; from: string; text: Field };
  /** 補足（面接の流れなど。あるステップだけ） */
  extra?: { lead: Field; items: Field[] };
  /** 経験がある人向け: これができるなら飛ばしてOK（早い段階だけ） */
  skipIf?: Field;
}

const CAREER_GUIDE = { label: "UIUXデザイナー転職ガイド", href: "https://kaikun.bo-no.design/career/beginner" };

export const careerChangeV4 = {
  slug: "career-change",
  name: "未経験から転職",
  /** 「未経験」の定義は how-to-find-jobs-for-beginner-designers */
  audience: s("デザインの仕事（グラフィックやWebも含む）をしたことがなく、UIデザイナーへの転職を目指す人"), // how-to-find-jobs-for-beginner-designers
  summary: {
    period: s("週12時間で6〜9ヶ月"), // howtostart（週12時間）・json（6-9）
    works: s("3つ"), // portfolio-02
    prerequisite: s("不要"), // オーナー決定（howtostart「才能は必要ありません」）
    senpai: s("学習開始から内定まで 7ヶ月〜1年半"), // C_材料 共通するパターン2
  },

  /* ---------- 2. ゴール ---------- */
  goal: {
    lead: s("採用で見られるのは、次の3つです。未経験のうちに完璧な提案までは求められないので、まずはどれも60〜70点を目指します。"), // howtobe, become-uiux-designer-beginner-guide
    points: [
      {
        title: "UIの基礎",
        tag: "足切り",
        body: s("ふつうに使えるUIをつくれるか。ないと書類選考で落ち、面接に進めない"), // howtobe, portfolio-01
      },
      {
        title: "課題解決の素養",
        tag: null,
        body: s("誰のどんな困りごとのためのUIかを考え、意図を説明できるか"), // howtobe, portfolio-01（1-3）
      },
      {
        title: "成長のポテンシャル",
        tag: null,
        body: s("自分から学び続けているか。学習ログや話す言葉から見られる"), // howtobe, portfolio-01（2-2）
      },
    ],
    worksLead: s("それを見せるのがポートフォリオです。作品は最低3つ、種類を変えてそろえます。"), // portfolio-02
    works: [
      {
        label: "作品①",
        title: "顧客理解からつくったもの",
        body: s("実際に人に話を聞き、その困りごとから考えたサービス"), // portfolio-02, portfolio-01
        stageId: "customer",
      },
      {
        label: "作品②",
        title: "複数画面にまたがるUI",
        body: s("1つの機能を複数画面で。例: 求人サイトの検索と絞り込み"), // portfolio-02
        stageId: "ia",
      },
      {
        label: "作品③",
        title: "ビジュアルが分かるもの",
        body: s("Daily UI やLPなど。要件はそこまで意識しなくてよい"), // portfolio-02
        stageId: "ui",
      },
    ],
    whyThree: s("作品が1つだけだと「まぐれかも？」「何かを真似した？」と思われます。3つあると、同じようにつくれる人だと伝わります。"), // portfolio-02
  },

  /* ---------- 3. 全体図となぜこの順か ---------- */
  order: [
    s("学ぶ順は、仕事の順（顧客理解 → 情報設計 → 見た目）の逆です。仕事の順ではなく、つまずきにくい順に並べています。"), // ai-future, howtostart
    s("最初の大きなハードルは見た目で、ここを越えると情報設計や顧客理解がぐっとラクになります。"), // howtostart
    s("3つの基礎は完璧にせず、まず一通り通ります。量をこなすうちに分かってきます。"), // 7tips, way-phase02
  ] as Para,

  /* ---------- 4. ステップ ---------- */
  stages: [
    {
      id: "prep",
      short: "準備",
      title: "Figmaに慣れて、ゴールを知る",
      period: k("2週間〜1ヶ月"), // 記事は「1-2ヶ月目」。6〜9ヶ月に収めるため縮めた
      body: [
        [
          s("最初は、Figmaで既存のアプリの画面を真似してつくりながら、採用で何を見られるのかを知るところから始めます。"), // howtostart, way-phase01
          s("見せるものを先に知っておくと、この先の各ステップが何のためにあるのかが分かり、ポートフォリオの材料を貯めながら学べます。"), // howtostart
          s("いきなり理論から入ると手を動かす場がなく、後の学習の土台ができません。"), // howtostart
        ],
        [
          s("この段階では、ポートフォリオに入る作品はまだありません。ただ、真似した画面に作成日をつけて残しておくと、あとで成長の記録として使えます。"), // portfolio-02
          k("Figmaの操作で詰まったときは、AIに聞いて止まらずに先へ進みます。"),
        ],
      ],
      handoff: s("Figmaで手を動かした経験が、UIの基礎を学ぶ土台になる"), // howtostart
      courses: [],
      courseNote: s("コースはなく、無料の記事と動画で進めます"), // howtostart（Figma入門・転職ガイドはすべて無料）
      links: [CAREER_GUIDE],
      senpai: {
        who: "Kさん",
        from: "ディレクション職から",
        text: s("早い時期から手を動かすことと、最初にゴールのイメージをはっきり持つこと。先にやればよかった"), // C_材料 Kさん
      },
      skipIf: k("Figmaのオートレイアウトとプロトタイプを使って、1画面をつくれる"), // 機能の範囲は howtostart、飛ばす条件にしたのは推測
    },
    {
      id: "ui",
      short: "UIの基礎",
      title: "UIの基礎：ふつうのUIをつくれるようになる",
      period: k("1.5〜2.5ヶ月"), // 記事は基礎3つで6ヶ月。割り振りは推測
      body: [
        [
          s("SNSやTodoサービスにある基本の画面を、見本を横に置かずに自分でつくれるところまで進めます。"), // howtostart
          s("UIの基礎は採用の足切りにあたり、ここが弱いと書類選考で落ちて面接に進めません。"), // howtobe, portfolio-01
          s("後の情報設計や顧客理解も重くなるので、最初に越えておきたいところです。"), // howtobe, howtostart
        ],
        [
          s("Daily UI などでつくった画面の中から、ポートフォリオの作品③（ビジュアルが分かるもの）を選びます。"), // portfolio-02
          s("画面は自分の手でつくります。AIが出した画面の良し悪しを見分ける目は、手でつくった経験からつくからです。"), // ai-shift
        ],
      ],
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
      skipIf: k("SNSやTodoサービスの基本の画面を、見本なしで一通りつくれる"), // 中身は howtostart、飛ばす条件にしたのは推測
    },
    {
      id: "ia",
      short: "情報設計",
      title: "情報設計：要件から画面の流れを組む",
      period: k("1〜1.5ヶ月"), // 割り振りは推測
      body: [
        [
          s("「こんな機能がほしい」というアイデアだけがある状態から、複数の画面にまたがるUIを組み立てられるようにします。"), // howtostart
          s("採用で見られるのは1枚の画面ではなく、画面から画面への流れで、ここが実務にいちばん近い部分です。"), // portfolio-01, howtostart
          s("飛ばしてしまうと、見た目は作れても要件を画面に落とせず、1画面ずつ作って流れがつながらないままになります。"), // howtostart, C_材料 Kさん
        ],
        [
          s("ここでつくったものが、作品②（複数画面のUI）になります。たとえば求人サイトの検索と絞り込みです。"), // portfolio-02
          k("画面パターンのたたき台はAIで出して構いませんが、要件に合っているかは自分で決めます。"),
        ],
      ],
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
      period: k("約1ヶ月"), // 割り振りは推測
      body: [
        [
          s("1人でもいいので実際に人に話を聞き、その困りごとからサービスを考えます。"), // portfolio-01（一人でも十分）
          s("デザイナーには顧客目線が求められます。完璧でなくてよいので、一度この流れを体験しておきます。"), // portfolio-01, howtostart
          s("ここを飛ばすと、面接で「自分の想像ではなく、実際のユーザーの課題を解決したものはある？」と聞かれたときに答えられません。"), // C_材料 Aさん
        ],
        [
          s("ここでつくるのが作品①（顧客理解からつくったもの）で、先輩の多くはこれを推し作品にしています。"), // portfolio-02, C_材料 共通するパターン1
          s("どのUIが良いかを決めるのはAIではなく使う人なので、話は自分で聞きに行きます。"), // ai-future
        ],
      ],
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
      body: [
        [
          s("3つの作品それぞれについて、「何をつくり、何のためで、なぜこの形か」から説明できる形にまとめます。"), // portfolio-03
          s("ポートフォリオは足切りの判定材料なので、ない、または求められているものとずれていると1次面接にも進めません。"), // goaloverview
          s("画像を並べるだけだと見た目しか伝わらず、自分の頭で考えたのかが読み手に分かりません。"), // portfolio-03
        ],
        [
          s("中身は、3作品の説明（概要 → 結論 → プロセス → 終わりに）と、自己紹介・学習ログです。"), // portfolio-03, portfolio-02
          s("余力があれば、AIと一緒にサービスをつくってURLで公開してみると、大きな武器になります。"), // ai-shift
        ],
      ],
      handoff: s("3作品の説明が、面接で作品について話す中身になる"), // uiux-interview-tips-and-checkpoints（デザイン面接）
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
      body: [
        [
          s("会社ごとに作品の並びを変えて応募し、面接では作品のプロセスを自分の言葉で説明します。"), // portfolio-01, uiux-interview-tips-and-checkpoints
          s("未経験OKの求人は表にほぼ出ないので、数を受けて、受け入れてくれる会社かどうかを自分の行動で確かめます。"), // how-to-find-jobs-for-beginner-designers
          s("受けたい会社だけに絞ると、全部落ちることもあります。"), // C_材料 Bさん
        ],
        [
          s("入りたい会社に応募するときは、そのサービスの課題とUIの改善案をポートフォリオに添えます。"), // portfolio-01, B_材料 ポートフォリオFB記事
          s("先輩の中には、会社研究や模擬面接の練習にChatGPTを使った人もいます。"), // C_材料 Bさん・Dさん
        ],
      ],
      handoff: s("内定。1社目は完璧を求めず、デザインの実務経験を1年積める会社を選ぶ"), // how-to-find-jobs-for-beginner-designers
      courses: [],
      courseNote: s("コースの外でやります。1社あたり採用まで約1ヶ月かかります"), // howtostart
      links: [CAREER_GUIDE, { label: "転職の相談ができるイベント", href: "/events" }],
      senpai: {
        who: "Bさん",
        from: "商品デザイナーから",
        text: s("本当に受けたい16社は全部不採用。幅広く47社にエントリーし、4社から内定"), // C_材料 Bさん
      },
      extra: {
        lead: s("面接はたいてい3段階で、それぞれ見られることが違います。"), // uiux-interview-tips-and-checkpoints
        items: [
          s("スキル：ポートフォリオを元に、どんな課題にどう取り組んだか"), // uiux-interview-tips-and-checkpoints
          s("働き方・チーム：どう働きたいか、なぜこの会社か"), // uiux-interview-tips-and-checkpoints
          s("会社への貢献：事業やビジョンに、自分がどう役立てるか"), // uiux-interview-tips-and-checkpoints
        ],
      },
    },
  ] satisfies V4Stage[],

  /* ---------- 5. 経験がある人 ---------- */
  experienced: {
    lead: s("飛ばすかどうかは「つくったものがあるか」で決めます。"), // D_外部の定石 5（Designlab の判定にならう）
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

  /* ---------- 7. つまずき ---------- */
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
  ],

  /* ---------- 8. よくある質問 ---------- */
  faq: [
    {
      question: s("働きながらでも転職できる？"),
      answer: s("できます。転職した先輩は、働きながらと辞めて専念がほぼ半々です。働きながらの人は、平日に1〜2時間と週末にまとめて、という進め方をしています。"), // C_材料 共通するパターン3
    },
    {
      question: s("何社くらい応募する？"),
      answer: s("40社以上が目安です。未経験OKと書かれた求人は少ないため、応募して確かめます。先輩は10〜50社ほど応募しています。"), // how-to-find-jobs-for-beginner-designers, C_材料 共通するパターン4
    },
    {
      question: s("作品は架空の題材でもいい？"),
      answer: s("構いません。ただ、顧客理解の作品は1人でもいいので実際に話を聞いたものにします。面接で「実際のユーザーの課題を解決したものはあるか」と聞かれることがあります。"), // portfolio-01, C_材料 Aさん
    },
    {
      question: s("順番どおりに進めないとだめ？"),
      answer: s("順番どおりがおすすめです。ただ、中身が分からず目標を立てにくいときは、先にコース全体をざっと見ても構いません。"), // howtostart, goalsetting
    },
    {
      question: s("AIがあるのに、基礎から学ぶ必要はある？"),
      answer: s("あります。土台のスキルがあるほどAIを使いこなせ、土台がないとAIに代わられてしまいます。"), // ai-shift
    },
  ],
};

export type CareerChangeV4 = typeof careerChangeV4;
