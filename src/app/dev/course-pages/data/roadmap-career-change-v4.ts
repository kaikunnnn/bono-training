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

export interface V4Stage {
  id: string;
  /** 全体図用の短い名前 */
  short: string;
  /** ステップの見出し */
  title: string;
  period: Field;
  /** できるようになること（動詞で1行） */
  can: Field;
  /** 転職にとってのなぜ */
  why: Field;
  /** 飛ばすとどうなるか */
  skip: Field;
  /** ポートフォリオに入るもの */
  portfolio: Field;
  /** 全体図で使う: このステップで手に入るものが次でどう使われるか */
  handoff: Field;
  courses: V4CourseRef[];
  /** コースがないときの一言 */
  courseNote?: Field;
  links: { label: string; href: string }[];
  ai: Field;
  senpai: { who: string; from: string; text: Field };
  /** 補足（面接の流れなど。あるステップだけ） */
  extra?: { label: string; items: Field[] };
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
    lead: s("採用で見られるのは3つ。まずはどれも60〜70点を目指します。"), // howtobe
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
    note: s("未経験のうちに完璧な提案までは求められません。"), // become-uiux-designer-beginner-guide
    worksLead: s("それを見せるのがポートフォリオ。作品は最低3つ、種類を変えてそろえます。"), // portfolio-02
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
    whyThree: s("1つだけだと「まぐれかも？」「何かを真似した？」と思われます。3つあると、同じようにつくれる人だと伝わります。"), // portfolio-02
  },

  /* ---------- 3. 全体図となぜこの順か ---------- */
  order: [
    s("学ぶ順は、仕事の順（顧客理解 → 情報設計 → 見た目）の逆です。仕事の順ではなく、つまずきにくい順に並べています。"), // ai-future, howtostart
    s("見た目が最初の大きなハードルです。ここを越えると、情報設計や顧客理解がぐっとラクになります。"), // howtostart
    s("3つの基礎は完璧にせず、まず一通り通ります。量をこなすうちに分かってきます。"), // 7tips, way-phase02
  ],

  /* ---------- 4. ステップ ---------- */
  stages: [
    {
      id: "prep",
      short: "準備",
      title: "Figmaに慣れて、ゴールを知る",
      period: k("2週間〜1ヶ月"), // 記事は「1-2ヶ月目」。6〜9ヶ月に収めるため縮めた
      can: s("Figmaで画面を真似してつくれる。採用で何を見られるかを知っている"), // howtostart, way-phase01
      why: s("見せるものを先に知ると、各ステップの意味が分かり、材料を貯めながら学べる"), // howtostart
      skip: s("いきなり理論から入ると手を動かす場がなく、後の学習の土台ができない"), // howtostart
      portfolio: s("作品はまだ入らない。真似した画面は作成日をつけて残すと、成長の記録になる"), // portfolio-02
      handoff: s("Figmaで手を動かした経験が、UIの基礎を学ぶ土台になる"), // howtostart
      courses: [],
      courseNote: s("コースはなし。無料の記事と動画で進めます"), // howtostart（Figma入門・転職ガイドはすべて無料）
      links: [CAREER_GUIDE],
      ai: k("Figmaの操作で詰まったら、AIに聞いて止まらずに進める"),
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
      can: s("SNSやTodoサービスの基本の画面を、自分でつくれる"), // howtostart
      why: s("UIの基礎は採用の足切り。ここがないと書類選考で落ちる"), // howtobe, portfolio-01
      skip: s("書類で落ち、面接に進めない。後の情報設計や顧客理解も重くなる"), // howtobe, howtostart
      portfolio: s("作品③ ビジュアル。Daily UI などでつくった画面から選ぶ"), // portfolio-02
      handoff: s("ふつうのUIをつくれる手が、情報設計で画面を組むときの土台になる"), // howtostart
      courses: [
        { type: "course", slug: "ui-design-first" },
        { type: "course", slug: "ui-design-visual" },
        { type: "course", slug: "ui-experience" },
      ],
      links: [],
      ai: s("画面は自分の手でつくる。AIが出した画面の良し悪しを見分ける目は、手でつくった経験からつく"), // ai-shift
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
      can: s("機能のアイデアだけの状態から、複数画面のUIを組み立てられる"), // howtostart
      why: s("採用で見られるのは1画面ではなく、複数画面にまたがるUI。実務にいちばん近い"), // portfolio-01, howtostart
      skip: s("見た目だけ作れても、要件を画面に落とせない。1画面ずつ作って流れがつながらない"), // howtostart, C_材料 Kさん
      portfolio: s("作品② 複数画面のUI。例: 求人サイトの検索と絞り込み"), // portfolio-02
      handoff: k("要件から画面の流れを組む型が、顧客理解でつくるサービスの骨組みになる"),
      courses: [{ type: "planned", title: "情報設計のコース" }],
      links: [],
      ai: k("画面パターンのたたき台はAIで出してよい。要件に合うかは自分で決める"),
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
      can: s("1人以上に話を聞き、その困りごとからサービスを考えられる"), // portfolio-01（一人でも十分）
      why: s("デザイナーには顧客目線が求められる。完璧でなくてよいので、一度この流れを体験しておく"), // portfolio-01, howtostart
      skip: s("面接で「自分の想像ではなく、実際のユーザーの課題を解決したものはある？」に答えられない"), // C_材料 Aさん
      portfolio: s("作品① 顧客理解からつくったもの。先輩の多くは、これを推し作品にしている"), // portfolio-02, C_材料 共通するパターン1
      handoff: s("話を聞いてつくったサービスが、ポートフォリオの中心の作品になる"), // C_材料 共通するパターン1
      courses: [{ type: "planned", title: "顧客理解のコース" }],
      links: [],
      ai: s("どのUIが良いかを決めるのはAIではなく、使う人。だから自分で話を聞く"), // ai-future
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
      can: s("3作品それぞれを「何をつくり、何のためで、なぜこの形か」から説明できる"), // portfolio-03
      why: s("ポートフォリオは足切りの判定材料。ない、またはずれていると1次面接にも進めない"), // goaloverview
      skip: s("画像を並べるだけだと見た目しか伝わらず、自分の頭で考えたかが分からない"), // portfolio-03
      portfolio: s("3作品の説明（概要 → 結論 → プロセス → 終わりに）と、自己紹介・学習ログ"), // portfolio-03, portfolio-02
      handoff: s("3作品の説明が、面接で作品について話す中身になる"), // uiux-interview-tips-and-checkpoints（デザイン面接）
      courses: [],
      courseNote: s("コースの外でやります。基礎でつくったものをベースに仕上げ、締め切りを決めて応募へ進みます"), // howtostart
      links: [
        { label: "ポートフォリオの作り方", href: "/lessons/portfolio" },
        { label: "15分フィードバック", href: "/how-to/feedback" },
        { label: "メンバーのアウトプット", href: "/outputs" },
      ],
      ai: s("AIと一緒にサービスをつくり、URLで公開してみると大きな武器になる"), // ai-shift
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
      can: s("会社ごとに作品の並びを変えて応募し、面接で作品のプロセスを説明できる"), // portfolio-01, uiux-interview-tips-and-checkpoints
      why: s("未経験OKの求人は表にほぼ出ない。数を受けて、受け入れてくれる会社かを自分の行動で確かめる"), // how-to-find-jobs-for-beginner-designers
      skip: s("受けたい会社だけに絞ると、全部落ちることもある"), // C_材料 Bさん
      portfolio: s("会社ごとに作品の並びを変える。入りたい会社には、サービスの課題とUIの改善案を添える"), // portfolio-01, B_材料 ポートフォリオFB記事
      handoff: s("内定。1社目は完璧を求めず、デザインの実務経験を1年積める会社を選ぶ"), // how-to-find-jobs-for-beginner-designers
      courses: [],
      courseNote: s("コースの外でやります。1社あたり採用まで約1ヶ月かかります"), // howtostart
      links: [CAREER_GUIDE, { label: "転職の相談ができるイベント", href: "/events" }],
      ai: s("会社研究や模擬面接の練習にChatGPTを使った先輩がいる"), // C_材料 Bさん・Dさん
      senpai: {
        who: "Bさん",
        from: "商品デザイナーから",
        text: s("本当に受けたい16社は全部不採用。幅広く47社にエントリーし、4社から内定"), // C_材料 Bさん
      },
      extra: {
        label: "面接はたいてい3段階",
        items: [
          s("1. スキル: ポートフォリオを元に、どんな課題にどう取り組んだか"), // uiux-interview-tips-and-checkpoints
          s("2. 働き方・チーム: どう働きたいか、なぜこの会社か"), // uiux-interview-tips-and-checkpoints
          s("3. 会社への貢献: 事業やビジョンに、自分がどう役立てるか"), // uiux-interview-tips-and-checkpoints
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
      style: s("子育てしながら"),
      period: s("本格的に始めてから内定まで 約7ヶ月"),
      apply: s("20社応募 → 面接10社 → 内定"),
      point: s("話を聞いて「投稿したくない」が本当の理由だと気づき、サービスに組み込んだ過程"),
    }, // C_材料 Gさん
    {
      who: "Hさん",
      from: "SE（システムエンジニア）",
      style: s("退職して専念（1日平均3〜4時間）"),
      period: s("約9ヶ月"),
      apply: s("約30社 → 面接・面談15社 → 内定"),
      point: s("「チケット取得が課題」という仮説が話を聞いて外れ、作り直した過程"),
    }, // C_材料 Hさん
    {
      who: "Eさん",
      from: "公務員（経理）→ カフェのバリスタ",
      style: s("働きながら（平日1時間・週末4〜5時間）"),
      period: s("BONO入会から内定まで 約1年2ヶ月"),
      apply: s("10社応募 → 面接2社 → 内定1社"),
      point: s("毎月の目標と振り返りをnoteで公開し、計画を立てて続けていると伝わった"),
    }, // C_材料 Eさん
    {
      who: "Iさん",
      from: "飲料メーカーの総合職",
      style: s("働きながら"),
      period: s("約1年4ヶ月"),
      apply: s("50社以上 → 面接4社 → 内定"),
      point: s("作品のやり直しの過程も載せた（インタビュアーの感想:「変化が見えると、何を考えたかが分かる」）"),
    }, // C_材料 Iさん
  ],

  /* ---------- 7. つまずき ---------- */
  pitfalls: [
    {
      title: "落ち続ける・実務経験の壁",
      problem: s("カジュアル面談止まり、返事が来ない、「即戦力が欲しい」と言われる"), // C_材料 共通するパターン5
      fix: s("数を受け、落ちたらポートフォリオを直して再応募する。期限を決めて続ける"), // C_材料 Dさん・Fさん, how-to-find-jobs-for-beginner-designers
      link: null as { label: string; href: string } | null,
    },
    {
      title: "一人だと正しいか分からない",
      problem: s("自分のデザインが良いのか悪いのか、一人では判断がつかない"), // C_材料 共通するパターン5
      fix: s("早めに現役デザイナーのフィードバックをもらう。Iさんは「最初からもらえばよかった」"), // C_材料 Iさん, portfolio-01
      link: { label: "15分フィードバック", href: "/how-to/feedback" },
    },
    {
      title: "情報設計で止まる",
      problem: s("トレースには正解があるが、情報設計は文字の情報から自分で整理する必要がある"), // C_材料 Bさん
      fix: s("完璧にせず一度最後まで通る。ポートフォリオで振り返ると分かることが多い"), // C_材料 Eさん, way-phase02
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
