/**
 * ガイドページ プロトタイプ用ダミーデータ
 * テーマ5つ × サブトピック5件
 */

export interface GuideTheme {
  slug: string;
  title: string;
  description: string;
  forWho: string;
  topics: GuideTopic[];
}

export interface GuideTopic {
  slug: string;
  title: string;
  description: string;
  themeSlug: string;
}

export const GUIDE_THEMES: GuideTheme[] = [
  {
    slug: "career-change",
    title: "UIUXデザイナー転職",
    description: "未経験からUIUXデザイナーへのキャリアチェンジに必要な知識を体系的に解説",
    forWho: "デザイナーになりたい・転職したい人へ",
    topics: [
      {
        slug: "what-is-uiux-designer",
        title: "UIUXデザイナーとは？仕事内容と年収",
        description: "UIUXデザイナーの役割、具体的な仕事内容、2026年の年収相場について解説します。",
        themeSlug: "career-change",
      },
      {
        slug: "how-to-become-uiux-designer",
        title: "未経験からUIUXデザイナーになる方法",
        description: "未経験からの転職ロードマップ。学習期間、必要なステップ、実際の転職事例を紹介。",
        themeSlug: "career-change",
      },
      {
        slug: "required-skills",
        title: "転職に必要なスキル3つ",
        description: "UI設計、情報設計、プロトタイピング。採用担当が見る3つのスキルを深掘り。",
        themeSlug: "career-change",
      },
      {
        slug: "interview-questions",
        title: "転職面接でよく聞かれる質問と対策",
        description: "デザイナー面接で頻出の質問とその回答のコツ。ポートフォリオプレゼンの方法も。",
        themeSlug: "career-change",
      },
      {
        slug: "job-search-services",
        title: "おすすめ転職エージェント・サービス",
        description: "デザイナー転職に強いエージェントとサービスの比較。未経験に優しいものを厳選。",
        themeSlug: "career-change",
      },
    ],
  },
  {
    slug: "portfolio",
    title: "ポートフォリオのつくりかた",
    description: "受かるポートフォリオの構成、事例、ケーススタディの書き方を解説",
    forWho: "ポートフォリオを作りたい・改善したい人へ",
    topics: [
      {
        slug: "portfolio-essentials",
        title: "ポートフォリオに必要な要素と構成",
        description: "採用担当が見るポイントと、それに応える構成の作り方。",
        themeSlug: "portfolio",
      },
      {
        slug: "portfolio-examples",
        title: "受かるポートフォリオの事例5選",
        description: "実際に転職に成功したポートフォリオを分析。何が評価されたかを解説。",
        themeSlug: "portfolio",
      },
      {
        slug: "case-study-writing",
        title: "ケーススタディの書き方",
        description: "問題→リサーチ→解決→成果の流れで、デザインプロセスを伝える方法。",
        themeSlug: "portfolio",
      },
      {
        slug: "portfolio-for-beginners",
        title: "未経験でもポートフォリオを作る方法",
        description: "実務経験がなくても作れるポートフォリオの題材と進め方。",
        themeSlug: "portfolio",
      },
      {
        slug: "portfolio-mistakes",
        title: "ポートフォリオで避けるべきNG集",
        description: "よくある失敗パターンと、それを回避するためのチェックリスト。",
        themeSlug: "portfolio",
      },
    ],
  },
  {
    slug: "learning",
    title: "最強のデザイン学習法",
    description: "独学でUIデザインを習得するためのロードマップとコツ",
    forWho: "デザインの勉強を始めたい・学習法に悩む人へ",
    topics: [
      {
        slug: "learning-tips",
        title: "UIデザイン学習の7つのコツ",
        description: "効率的にスキルを身につけるための学習習慣と考え方。",
        themeSlug: "learning",
      },
      {
        slug: "learning-roadmap",
        title: "独学ロードマップ（3ヶ月で基礎マスター）",
        description: "何をどの順番でやるか。3ヶ月間のステップバイステップガイド。",
        themeSlug: "learning",
      },
      {
        slug: "design-principles",
        title: "デザインの4大原則を理解する",
        description: "近接・整列・反復・コントラスト。全てのデザインの基礎となる原則。",
        themeSlug: "learning",
      },
      {
        slug: "design-references",
        title: "手本となるUIデザインに触れる方法",
        description: "良いUIを見る目を養うための方法。参考サイト・アプリの選び方。",
        themeSlug: "learning",
      },
      {
        slug: "motivation",
        title: "学習のモチベーションを維持する方法",
        description: "挫折しないためのマインドセットとコミュニティ活用法。",
        themeSlug: "learning",
      },
    ],
  },
  {
    slug: "design-process",
    title: "デザインの進め方",
    description: "UIデザインプロセスの全体像と各ステップの実践方法",
    forWho: "デザインのプロセスを体系的に学びたい人へ",
    topics: [
      {
        slug: "design-process-overview",
        title: "UIデザインプロセスの全体像（7ステップ）",
        description: "リサーチからデリバリーまで。プロが実践するデザインプロセスの全体像。",
        themeSlug: "design-process",
      },
      {
        slug: "user-research",
        title: "リサーチの進め方",
        description: "ユーザーインタビュー、アンケート、競合分析の具体的な方法。",
        themeSlug: "design-process",
      },
      {
        slug: "persona-journey",
        title: "ペルソナとユーザージャーニーの作り方",
        description: "リサーチ結果をデザインに活かすためのフレームワーク。",
        themeSlug: "design-process",
      },
      {
        slug: "wireframe-prototype",
        title: "ワイヤーフレームからプロトタイプへ",
        description: "情報設計からUIに落とし込む方法。低忠実度から高忠実度への進め方。",
        themeSlug: "design-process",
      },
      {
        slug: "user-testing",
        title: "ユーザーテストの実践方法",
        description: "プロトタイプを使ったテストの設計、実施、分析の方法。",
        themeSlug: "design-process",
      },
    ],
  },
  {
    slug: "figma",
    title: "Figmaの使い方",
    description: "Figmaの基本操作から実践的な活用法まで",
    forWho: "Figmaを使い始めたい・もっと使いこなしたい人へ",
    topics: [
      {
        slug: "figma-basics",
        title: "Figmaとは？基本の画面構成",
        description: "ツールバー、レイヤーパネル、プロパティパネルの基本操作。",
        themeSlug: "figma",
      },
      {
        slug: "figma-tools",
        title: "基本ツールと図形の操作",
        description: "フレーム、シェイプ、テキスト、画像配置の基本操作。",
        themeSlug: "figma",
      },
      {
        slug: "figma-auto-layout",
        title: "オートレイアウトの使い方",
        description: "レスポンシブなUIを効率的に作るためのオートレイアウト完全ガイド。",
        themeSlug: "figma",
      },
      {
        slug: "figma-components",
        title: "コンポーネントとバリアント",
        description: "再利用可能なコンポーネントの作成と、バリアントによる状態管理。",
        themeSlug: "figma",
      },
      {
        slug: "figma-team",
        title: "チームで使うFigmaの活用法",
        description: "チームライブラリ、デザインシステム、ハンドオフの方法。",
        themeSlug: "figma",
      },
    ],
  },
];

/** 全サブトピックをフラットに取得 */
export function getAllTopics(): GuideTopic[] {
  return GUIDE_THEMES.flatMap((theme) => theme.topics);
}

/** slugからサブトピックを取得 */
export function getTopicBySlug(slug: string): GuideTopic | undefined {
  return getAllTopics().find((t) => t.slug === slug);
}

/** slugからテーマを取得 */
export function getThemeBySlug(slug: string): GuideTheme | undefined {
  return GUIDE_THEMES.find((t) => t.slug === slug);
}

/** テーマslugからそのテーマのサブトピックを取得 */
export function getTopicsByTheme(themeSlug: string): GuideTopic[] {
  return GUIDE_THEMES.find((t) => t.slug === themeSlug)?.topics || [];
}
