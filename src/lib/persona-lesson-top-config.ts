import { INTRO_VERSIONS } from "@/lib/analytics/lesson-intro";

export const PERSONA_LESSON_SLUG = "persona-based-design";
export const AI_RESEARCH_LESSON_SLUG = "ai-research-ui-design";

const PERSONA_ASSET_PATH = "/images/lesson-persona-ui";
const AI_RESEARCH_ASSET_PATH = "/images/lesson-ai-research";

type LessonTopItem = { emoji: string; title: string; body: string };

/**
 * 専用レッスントップ（PersonaLessonTopClient）の slug ごとの文言・画像。
 * Server Component から Client Component へ props で渡すため、
 * シリアライズ可能な値（文字列・配列・プレーンオブジェクト）だけで構成する。
 */
export interface LessonTopContent {
  /** LessonIntroAnalytics に渡す intro_version */
  introVersion: string;
  hero: {
    eyebrow: string;
    titleLines: readonly string[];
    question: string;
    lead: string;
    caption: string;
    footerCaption: string;
    footerLinkLabel: string;
    /** ヒーロー右のアーチ部分の aria-label */
    iconLabel: string;
    /** Sanity の iconImageUrl が無いときに使う画像 */
    iconFallbackSrc: string;
    iconAlt: string;
  };
  overview: {
    titleLines: readonly string[];
    paragraphs: readonly string[];
    slides: readonly {
      src: string;
      alt: string;
      /** 16:9 の枠に収まらない比率の画像は contain で全体を見せる */
      fit?: "contain";
    }[];
  };
  curriculum: {
    description: string;
  };
  /** 記事サムネが無いときの画像 */
  thumbnailFallback: {
    src: string;
    alt: string;
  };
  briefs: {
    heading: string;
    question: string;
    description: string;
    note: string;
    items: readonly {
      title: string;
      body: string;
      badge?: string;
      icon: "book" | "magicpen" | "briefcase";
    }[];
  };
  skills: {
    heading: string;
    items: readonly { title: string; body: string }[];
  };
  uses: readonly LessonTopItem[];
  recommendations: readonly LessonTopItem[];
  author: {
    name: string;
    role: string;
    bio: string;
    image: string;
  };
}

const kaikun: LessonTopContent["author"] = {
  name: "カイクン",
  role: "BONOファウンダー / デザイナー",
  bio: "UI・UXデザインを学ぶコミュニティ「BONO」を運営。ユーザーの体験から考えるデザインを、解説と手を動かすトレーニングで伝えています。",
  image: "/images/authors/kaikun.jpg",
};

export const personaLessonTopContent = {
  introVersion: INTRO_VERSIONS.persona,
  hero: {
    eyebrow: "トレーニング",
    titleLines: ["ペルソナ中心の", "UIデザイン"],
    question: "誰のどんな”理想状態”をデザインするのか?",
    lead:
      "2週間で機能をつくるデザインから卒業し、ペルソナの利用シーンにあった”UI体験”を実現するフローを身につけます。",
    caption: "A New Dawn for Your Creativity",
    footerCaption: "FROM USER INSIGHT TO UI EXPERIENCE",
    footerLinkLabel: "コースを知る",
    iconLabel: "ペルソナ中心のUIデザイントレーニングのアイコン",
    iconFallbackSrc: `${PERSONA_ASSET_PATH}/persona-icon.webp`,
    iconAlt: "ペルソナ中心のUIデザインのコースアイコン",
  },
  overview: {
    titleLines: [
      "ユーザーの”理想”を叶えるために",
      "「困った」を解決する体験をデザインする",
    ],
    paragraphs: [
      "1つのお題で、ユーザーの課題仮説からプロトタイプ、UI体験の提案まで取り組みます。",
      "題材は本レビューサービス「BookShelf」の投稿体験。画面も仕様もない企画段階から考えます。自分のポートフォリオや仕事の題材でも進められます。",
      "動画とテキストを参考に手を動かし、各セッションの最後に自分の制作物を見直します。途中のものでも、コミュニティで相談・質問できます。",
      "目安は合計12時間・2週間。制作物と考えた過程は、ポートフォリオにも使えます。",
    ],
    slides: [
      {
        src: `${PERSONA_ASSET_PATH}/slides/slide-01.jpg`,
        alt: "課題と配慮からペルソナの理想体験をデザインするトレーニングの完成イメージ",
      },
      {
        src: `${PERSONA_ASSET_PATH}/slides/slide-02.jpg`,
        alt: "課題を見つけ、理想体験をつくり、評価基準で確認する3ステップ",
      },
      {
        src: `${PERSONA_ASSET_PATH}/slides/slide-03.jpg`,
        alt: "利用シーンからユーザーの課題と配慮を抽出するプロセス",
      },
      {
        src: `${PERSONA_ASSET_PATH}/slides/slide-04.jpg`,
        alt: "ペルソナの課題と理想体験をUIデザインの指標にまとめる例",
      },
      {
        src: `${PERSONA_ASSET_PATH}/slides/slide-05.jpg`,
        alt: "プロトタイプで分かったことをデザイン検討ドキュメントにまとめる例",
      },
    ],
  },
  curriculum: {
    description:
      "実際のデザイン依頼に取り組みながら、ペルソナ中心のデザインフローを習得します。",
  },
  thumbnailFallback: {
    src: `${PERSONA_ASSET_PATH}/overview-slide.png`,
    alt: "ペルソナ中心UIデザインのコース画像",
  },
  briefs: {
    heading: "制作するもの",
    question: "あなたなら、どんな体験をデザインする？",
    description:
      "実際のデザイン依頼に取り組みながら、ペルソナ中心のデザインフローを習得します。題材は3つから選べます。",
    note: "お題の詳細は「準備」で説明します。",
    items: [
      {
        title: "社内で使う本シェアサービス",
        body: "解説しながら進めるお題です。初心者におすすめ。",
        badge: "おすすめ",
        icon: "book",
      },
      {
        title: "自分の作りたいもの",
        body: "ポートフォリオに載せたい題材でOK",
        icon: "magicpen",
      },
      {
        title: "仕事のプロジェクト",
        body: "今の仕事で担当しているプロジェクトでもOK",
        icon: "briefcase",
      },
    ],
  },
  skills: {
    heading: "目指す状態",
    items: [
      {
        title: "利用シーンからユーザー課題を仮説思考できる",
        body: "目的から考えるデザインは、苦しくも楽しいクリエイティブな作業です。",
      },
      {
        title: "機能ではなくUI体験をデザインできる",
        body: "AIに作業を任せ、人は誰かを前向きにする体験を考えましょう。",
      },
      {
        title: "自分のアウトプットを評価する「指標」を設計できる",
        body: "評価基準を目的と達成条件から考え、ユーザーを起点に組み立てる方法を身につけます。",
      },
      {
        title: "理想体験を探求する進め方を習得できる",
        body: "「ユーザーが変化した状態」をつくるデザインフローの基本を身につけます。",
      },
    ],
  },
  uses: [
    {
      emoji: "💎",
      title: "現場での価値貢献",
      body: "言われたことをやるのではなく、プロダクトやチームの目標に対して必要なユーザーの状態を定義して提案する1歩目になります",
    },
    {
      emoji: "✍️",
      title: "ポートフォリオのアウトプットに",
      body: "ユーザーの「課題と配慮」を踏まえた体験をデザインして、事業やクライアントへの貢献を伝えるアウトプットに繋がります。",
    },
    {
      emoji: "🙋",
      title: "UI改善の提案に",
      body: "現状を利用シーンで分析して、改善点の仮説を出す進め方が身につきます。",
    },
  ],
  recommendations: [
    {
      emoji: "🔰",
      title: "UIUXを最近はじめた方",
      body: "チームの目標とユーザーの状態を結び、企画段階から体験を提案する1歩目になります。",
    },
    {
      emoji: "❓",
      title: "AIでデザインの自信が落ちている方",
      body: "ユーザーの課題と配慮を踏まえ、デザイナーとして何を判断するかを整理できます。",
    },
    {
      emoji: "🧭",
      title: "デザイン判断の指標を持ちたい方",
      body: "基本になるデザインの進め方を身につけることで、判断の軸を持つことができます。",
    },
  ],
  author: kaikun,
} as const satisfies LessonTopContent;

/**
 * 11/20までの文言（#319 の試作 /dev/ai-research-lesson の「今の本番」などの比較用に残す）。
 * 本番のレッスントップは下の aiResearchLessonTopContent（11/21 決めた形）を使う。
 */
export const aiResearchLessonTopContentBefore1121 = {
  introVersion: INTRO_VERSIONS.aiResearch,
  hero: {
    eyebrow: "トレーニング",
    titleLines: ["AIリサーチではじめる", "UIデザイン"],
    question: "その新規登録画面、どのサービスに置いても同じになっていませんか？",
    lead:
      "語学交換SNSの新規登録を題材に、業種とUIの「ふつう」をAIで調べ、何を聞くか・どう見せるかを理由つきで決められるようになります。",
    caption: "Research first, then design",
    footerCaption: "RESEARCH FIRST, THEN DESIGN",
    footerLinkLabel: "レッスンを知る",
    iconLabel: "AIリサーチではじめるUIデザインのアイコン",
    iconFallbackSrc: `${AI_RESEARCH_ASSET_PATH}/hanaso-icon.webp`,
    iconAlt: "ハナソの新規登録。話す言語と学びたい言語を選ぶ画面",
  },
  overview: {
    titleLines: ["AIで速く作れる今、", "作る前に何を調べるか"],
    paragraphs: [
      "AIに「勤怠管理の画面を作って」と頼めば、それらしい画面はすぐ出てきます。でも、会社が勤怠管理を入れる理由（月末の締め、残業の上限は原則月45時間）を知ると、トップに何を一番大きく置くかが変わります。",
      "このレッスンでは、語学交換SNS「ハナソ」の新規登録を題材に、業種リサーチとUIリサーチをAIで進めます。AIのレポートは、HelloTalkやTandemなどの実物のアプリで確かめます。",
      "動画と記事を見て、自分のAIで同じことをやります。AIはClaude・ChatGPT・Geminiのどれでも進められます。途中のものでも、コミュニティで相談・質問できます。",
      "目安は動画が約90分（撮影済み8本）、手を動かす時間を入れて約5時間です。最後に、リサーチをもとにハナソの新規登録を自分で作り直します（チャレンジは制作中）。",
    ],
    slides: [
      {
        src: `${AI_RESEARCH_ASSET_PATH}/slides/slide-01-hanaso.jpg`,
        alt: "ハナソの今の新規登録4画面（登録方法・メールとパスワード・プロフィール・興味）と、リサーチ後に加わった「話す言語と、学びたい言語」の画面",
      },
      {
        src: `${AI_RESEARCH_ASSET_PATH}/slides/slide-02-kintai-before.jpg`,
        alt: "調べずに作った勤怠アプリの社員トップ。出勤と退勤の大きなボタンが主役",
        fit: "contain",
      },
      {
        src: `${AI_RESEARCH_ASSET_PATH}/slides/slide-03-kintai-after.jpg`,
        alt: "調べて作った社員トップ。一番上に締め前に直す日、中段に残業32/45時間",
        fit: "contain",
      },
    ],
  },
  curriculum: {
    description:
      "業種リサーチとUIリサーチをAIで進め、最後に新規登録を作り直します。",
  },
  thumbnailFallback: {
    src: `${AI_RESEARCH_ASSET_PATH}/slides/slide-01-hanaso.jpg`,
    alt: "AIリサーチではじめるUIデザインのコース画像",
  },
  briefs: {
    heading: "最後に残るもの",
    question: "調べたことで、画面の何が変わる？",
    description:
      "セッションごとに、次のデザインの材料になるものが手元に残ります。",
    note: "チャレンジの範囲は制作中です。",
    items: [
      {
        title: "語学交換SNSのリサーチレポート",
        body: "AIにまとめさせ、実物で確かめたレポートと、ハナソに足りないもののメモ",
        badge: "業種リサーチ",
        icon: "book",
      },
      {
        title: "仕様・挙動と部品のレポート",
        body: "新規登録の「ふつう」と、部品ごとのレポート（デザインシステムのリンクつき）",
        badge: "UIリサーチ",
        icon: "magicpen",
      },
      {
        title: "作り直した新規登録",
        body: "リサーチをもとに作り直した、ハナソの新規登録のデザイン",
        badge: "チャレンジ",
        icon: "briefcase",
      },
    ],
  },
  skills: {
    heading: "目指す状態",
    items: [
      {
        title: "知らない業種を、AIで調べてから作り始められる",
        body: "目的と背景、調べる順番を伝え、「足りないところは質問して」と頼みます。",
      },
      {
        title: "AIのレポートを、実物のアプリで確かめられる",
        body: "「生年月日はいらなくない？」と提案する前に、要る理由を知っている状態になります。",
      },
      {
        title: "仕様・挙動と部品の「ふつう」を、出典つきで調べられる",
        body: "入力欄の高さやエラーの出し方を、デザインシステムのリンクを添えて説明できます。",
      },
      {
        title: "調べたことを根拠に、新規登録に何を入れるかを決めて作れる",
        body: "リサーチをもとに、ハナソの新規登録を自分で作り直します。",
      },
    ],
  },
  uses: [
    {
      emoji: "💼",
      title: "知らない業種の案件で",
      body: "想像で描き始めず、業種の当たり前をAIで押さえてから作れます。",
    },
    {
      emoji: "✍️",
      title: "選考課題やポートフォリオに",
      body: "「なぜこの項目を入れたか」を、調べた根拠つきで説明できます。",
    },
    {
      emoji: "🔍",
      title: "AIで作った画面のチェックに",
      body: "AIが出した画面の抜けを、「ふつう」と照らして見つけられます。",
    },
  ],
  recommendations: [
    {
      emoji: "🧭",
      title: "Figmaで画面は作れるが、知らない業種で手が止まる方",
      body: "見た目より先に、業種と使い方から要るものを決める手順を一周します。",
    },
    {
      emoji: "❓",
      title: "AIの答えを使ってよいか判断できない方",
      body: "頼み方と、実物で確かめる方法をセットで学びます。",
    },
    {
      emoji: "🧩",
      title: "作った部品が合っているか不安な方",
      body: "デザインシステムで「ふつう」を調べてから作ります。",
    },
  ],
  author: kaikun,
} as const satisfies LessonTopContent;

/**
 * 11/21 決めた形（#319。オーナーと1つずつ決めた）。説明文・概要はオーナーの文のまま（Figma 56:30）。
 * 試作 /dev/ai-research-lesson?dir=q と同じ言葉。変えたのはヒーロー・概要・おすすめな人だけで、ほかは11/20までと同じ。
 */
export const aiResearchLessonTopContent = {
  ...aiResearchLessonTopContentBefore1121,
  hero: {
    ...aiResearchLessonTopContentBefore1121.hero,
    titleLines: ["デザイナーのためのAIリサーチ入門", "業種とUIの「ふつう」を知るだけで、デザインは変わる"],
    question:
      "サービスとUIの「ふつう」を知っているか知らないかでデザインの質は変わってしまいます。AIでリサーチして、その内容を新規登録フローのデザインに生かしながら、AIでのリサーチ方法を習得しましょう。",
    lead: "このレッスンでは、AIを使って関わるサービスやデザインに関する一般的知識をインプットして、すぐさまデザインに活かすワークフローを身につけます。",
    iconLabel: "デザイナーのためのAIリサーチ入門のアイコン",
  },
  overview: {
    ...aiResearchLessonTopContentBefore1121.overview,
    titleLines: ["”ふつう”の知識の把握が、", "課題解決のデザインの1歩目"],
    paragraphs: [
      "WebサービスをデザインするUIUXデザイナーは、デザインの制作知識だけではなく、関わる業種やサービスについて知ることが必要です。ディレクターやPdMが要件として教えてくれるのは待つだけではただの作業者になります。",
      "例えば難しいSaaSであれば、その業界の人・業務・利用ケース・通例などを知らないと使い手にあったサービスのデザインをするのは難しいでしょう。そして”ふつう”の情報であればAIでレポートを書いてもらうことで、詳細な把握が瞬時に可能な時代になりました。",
      "前提情報を把握することが新しいアイデアを生む課題解決につながります。またデザイン初心者が抑えるべき知識、疑問に思うことも、一般的な情報をAIでまとめてもらいインプットすることが容易です。",
      "このレッスンでは、AIを使って関わるサービスやデザインに関する一般的知識をインプットして、すぐさまデザインに活かすワークフローを身につけます。自分の能力を高めるAIリサーチを身につけて、課題解決のデザインに使える術を、UIデザインを実践して習得していきましょう。",
    ],
  },
  thumbnailFallback: {
    ...aiResearchLessonTopContentBefore1121.thumbnailFallback,
    alt: "デザイナーのためのAIリサーチ入門のコース画像",
  },
  recommendations: [
    {
      emoji: "🤔",
      title: "UIの見た目や挙動を、「なんとなく」で決めてしまっている人",
      body: "「ふつう」をAIで調べて、根拠を持って決められるようにします。",
    },
    {
      emoji: "🧭",
      title: "知らない業種の案件に関わったとき、調べずに自分の知っている範囲で考えようとする人",
      body: "作り始める前に、業種とサービスの前提をAIで調べます。",
    },
    {
      emoji: "💬",
      title: "要件を待つだけでなく、自分から質問や提案ができるデザイナーになりたい人",
      body: "調べた基礎の情報が、質問や提案の材料になります。",
    },
  ],
} as const satisfies LessonTopContent;

/** 専用トップを持つレッスンの slug → 文言・画像 */
export const lessonTopContents: Readonly<Record<string, LessonTopContent>> = {
  [PERSONA_LESSON_SLUG]: personaLessonTopContent,
  [AI_RESEARCH_LESSON_SLUG]: aiResearchLessonTopContent,
};

export function getLessonTopContent(slug: string): LessonTopContent | undefined {
  return Object.prototype.hasOwnProperty.call(lessonTopContents, slug)
    ? lessonTopContents[slug]
    : undefined;
}
