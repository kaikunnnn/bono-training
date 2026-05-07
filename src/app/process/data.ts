/**
 * プロセス（プロダクトを作る）プロトタイプ用ダミーデータ
 */

export interface ProcessPhase {
  slug: string;
  number: string;
  emoji: string;
  titleEn: string;
  titleJa: string;
  description: string;
  color: string;
  /** 詳細ページ用 */
  overview: string;
  relatedArticles: { title: string; slug: string }[];
  relatedTopicSlugs: string[];
}

export const PROCESS_PHASES: ProcessPhase[] = [
  {
    slug: "discover",
    number: "01",
    emoji: "🔍",
    titleEn: "Discover",
    titleJa: "発見する",
    description: "ユーザーの課題と市場の機会を見つける。リサーチと課題発見のフェーズ。",
    color: "#0EA5E9",
    overview: "プロダクトデザインの最初のステップは「発見」です。ユーザーが本当に困っていることは何か、市場にどんな機会があるかを調査します。ユーザーインタビュー、競合分析、データ分析などの手法を使って、解くべき課題を正確に特定します。",
    relatedArticles: [
      { title: "ユーザーインタビューの進め方", slug: "user-interview" },
      { title: "競合分析の3つのフレームワーク", slug: "competitive-analysis" },
      { title: "課題仮説の立て方と検証方法", slug: "hypothesis-validation" },
    ],
    relatedTopicSlugs: ["ux-research"],
  },
  {
    slug: "define",
    number: "02",
    emoji: "📋",
    titleEn: "Define",
    titleJa: "定義する",
    description: "課題を明確にし、解決の方向性を決める。要件定義とコンセプト設計のフェーズ。",
    color: "#8B5CF6",
    overview: "発見した課題を「解くべき問い」として定義します。ペルソナの作成、ユーザージャーニーマップの描画、要件の優先順位付けを行い、チーム全体で同じ方向を向けるようにします。ここでの定義が後工程の全てに影響します。",
    relatedArticles: [
      { title: "ペルソナの作り方と活用法", slug: "persona-creation" },
      { title: "ユーザージャーニーマップ完全ガイド", slug: "journey-map" },
      { title: "PRDの書き方（プロダクト要件定義書）", slug: "prd-writing" },
    ],
    relatedTopicSlugs: ["ux-research", "information-architecture"],
  },
  {
    slug: "design",
    number: "03",
    emoji: "✏️",
    titleEn: "Design",
    titleJa: "設計する",
    description: "情報設計からUIデザインまで。ユーザー体験を形にするフェーズ。",
    color: "#F97316",
    overview: "定義した要件をUIとして具体化します。情報アーキテクチャの設計、ワイヤーフレームの作成、ビジュアルデザイン、プロトタイプの構築を行います。ユーザーが直感的に使えるインターフェースを目指します。",
    relatedArticles: [
      { title: "情報設計の基本と実践", slug: "information-architecture-basics" },
      { title: "ワイヤーフレームの書き方", slug: "wireframe-guide" },
      { title: "UIデザインの基本原則", slug: "ui-design-principles" },
    ],
    relatedTopicSlugs: ["ui-styling", "information-architecture", "figma-basics"],
  },
  {
    slug: "build",
    number: "04",
    emoji: "🔨",
    titleEn: "Build",
    titleJa: "作る",
    description: "デザインを実装に落とし込む。プロトタイプと開発連携のフェーズ。",
    color: "#10B981",
    overview: "デザインをエンジニアに正確に伝え、実装可能な形にします。デザインシステムの構築、エンジニアとのハンドオフ、実装品質の確認を行います。デザイナーとエンジニアの協業がプロダクトの品質を左右します。",
    relatedArticles: [
      { title: "デザインシステムの作り方", slug: "design-system" },
      { title: "エンジニアとのハンドオフ術", slug: "handoff-guide" },
      { title: "Figmaからコードへの橋渡し", slug: "figma-to-code" },
    ],
    relatedTopicSlugs: ["figma-basics", "design-process"],
  },
  {
    slug: "grow",
    number: "05",
    emoji: "🌱",
    titleEn: "Grow",
    titleJa: "育てる",
    description: "リリース後の検証と改善。データに基づいてプロダクトを成長させるフェーズ。",
    color: "#EC4899",
    overview: "プロダクトをリリースした後がデザイナーの真価が問われる場面です。ユーザーの行動データを分析し、A/Bテストで仮説を検証し、継続的に改善していきます。数字とユーザーの声の両方から次のアクションを導き出します。",
    relatedArticles: [
      { title: "A/Bテストの設計と分析", slug: "ab-testing" },
      { title: "ユーザビリティテストの実践", slug: "usability-testing" },
      { title: "データドリブンなデザイン改善", slug: "data-driven-design" },
    ],
    relatedTopicSlugs: ["ux-research", "design-process"],
  },
];

export function getPhaseBySlug(slug: string): ProcessPhase | undefined {
  return PROCESS_PHASES.find((p) => p.slug === slug);
}
