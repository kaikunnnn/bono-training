/**
 * トピック（コース）プロトタイプ用ダミーデータ
 */

export interface TopicCourse {
  slug: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  /** 到達状態 — 「このコースを終えたらこうなる」 */
  outcome: string;
  lessonCount: number;
  /** カテゴリカラー（パターンB/C用） */
  color: string;
  /** ダミー画像（パターンA用） */
  image: string;
  /** Sanityの実レッスンslug（参照用、なければダミー表示） */
  lessonSlugs: string[];
  /** 受講者事例（ダミー） */
  testimonials: {
    name: string;
    before: string;
    after: string;
    comment: string;
  }[];
  /** 関連ガイドテーマslug */
  relatedGuideTheme?: string;
  /** 次に学ぶべきトピックslug */
  nextTopicSlug?: string;
}

export const TOPIC_COURSES: TopicCourse[] = [
  {
    slug: "ui-styling",
    emoji: "🎨",
    title: "UIビジュアルデザイン",
    subtitle: "美しいインターフェースをつくる",
    description: "色、タイポグラフィ、レイアウトの基礎を身につけて、きれいなUIを作れるようになる",
    outcome: "デザインレビューで「なぜこの色・サイズにしたか」を論理的に説明できるレベル",
    lessonCount: 15,
    color: "#6366F1",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    lessonSlugs: [],
    testimonials: [
      { name: "Aさん（未経験）", before: "色の選び方がわからず毎回迷っていた", after: "配色の原則を理解し、自信を持ってデザインできるように", comment: "理論がわかると迷いがなくなりました" },
      { name: "Bさん（転職成功）", before: "独学でデザインしていたがプロっぽくならなかった", after: "ポートフォリオのクオリティが上がり内定獲得", comment: "基礎をやり直して本当によかった" },
    ],
    relatedGuideTheme: "career-change",
    nextTopicSlug: "ux-research",
  },
  {
    slug: "ux-research",
    emoji: "🔍",
    title: "UXリサーチ実践",
    subtitle: "ユーザーの本音を引き出す",
    description: "ユーザーの課題を正しく理解し、根拠のあるデザイン判断ができるようになる",
    outcome: "ユーザーインタビューを設計・実施し、インサイトをデザインに反映できるレベル",
    lessonCount: 12,
    color: "#0EA5E9",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=450&fit=crop",
    lessonSlugs: [],
    testimonials: [
      { name: "Cさん（現役デザイナー）", before: "なんとなくでUIを作っていた", after: "ユーザーの声をもとに改善提案できるように", comment: "リサーチができるとデザインの説得力が全然違う" },
    ],
    relatedGuideTheme: "design-process",
    nextTopicSlug: "information-architecture",
  },
  {
    slug: "figma-basics",
    emoji: "📐",
    title: "Figmaマスター",
    subtitle: "ゼロから実務レベルへ",
    description: "Figmaの基本操作からコンポーネント・オートレイアウトまでを体系的にマスター",
    outcome: "Figmaで中規模のUIデザインを効率的に作成・管理できるレベル",
    lessonCount: 10,
    color: "#F97316",
    image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=450&fit=crop",
    lessonSlugs: [],
    testimonials: [
      { name: "Dさん（エンジニア）", before: "デザイナーが作ったFigmaファイルの読み方がわからなかった", after: "デザインの意図を正確に読み取り実装に反映できるように", comment: "エンジニアにも超おすすめ" },
    ],
    relatedGuideTheme: "figma",
    nextTopicSlug: "ui-styling",
  },
  {
    slug: "information-architecture",
    emoji: "🗂️",
    title: "情報アーキテクチャ",
    subtitle: "迷わないUIを設計する",
    description: "ユーザーが迷わないUI構造を設計できるようになる",
    outcome: "画面遷移図・ナビゲーション設計を自信を持って提案できるレベル",
    lessonCount: 8,
    color: "#10B981",
    image: "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=800&h=450&fit=crop",
    lessonSlugs: [],
    testimonials: [
      { name: "Eさん（PM兼デザイナー）", before: "画面が増えるたびに構造がカオスになっていた", after: "情報の優先度を整理してシンプルなUIを設計できるように", comment: "PMとしても設計力が上がった" },
    ],
    relatedGuideTheme: "design-process",
    nextTopicSlug: "ux-research",
  },
  {
    slug: "career-portfolio",
    emoji: "💼",
    title: "デザイナー転職",
    subtitle: "内定を勝ち取るポートフォリオ戦略",
    description: "採用担当に刺さるポートフォリオの作り方と転職戦略",
    outcome: "書類通過率が上がるポートフォリオを完成させ、面接で自分のプロセスを語れるレベル",
    lessonCount: 8,
    color: "#EC4899",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop",
    lessonSlugs: [],
    testimonials: [
      { name: "Fさん（未経験→転職成功）", before: "何を載せればいいかわからなかった", after: "ケーススタディ中心のポートフォリオで3社内定", comment: "プロセスの見せ方が全てだと学んだ" },
    ],
    relatedGuideTheme: "portfolio",
    nextTopicSlug: "ui-styling",
  },
  {
    slug: "design-process",
    emoji: "⚙️",
    title: "プロダクトデザイン実践",
    subtitle: "リサーチからデリバリーまで",
    description: "リサーチからデリバリーまで、プロのデザインプロセスを実践できるようになる",
    outcome: "プロジェクトの各フェーズで適切な手法を選択し、チームをリードできるレベル",
    lessonCount: 10,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=450&fit=crop",
    lessonSlugs: [],
    testimonials: [
      { name: "Gさん（リードデザイナー）", before: "プロセスが属人化していてチームに展開できなかった", after: "標準プロセスを整備し、ジュニアの育成にも活用", comment: "自分のやり方を言語化するきっかけになった" },
    ],
    relatedGuideTheme: "design-process",
    nextTopicSlug: "ux-research",
  },
];

export function getTopicBySlug(slug: string): TopicCourse | undefined {
  return TOPIC_COURSES.find((t) => t.slug === slug);
}
