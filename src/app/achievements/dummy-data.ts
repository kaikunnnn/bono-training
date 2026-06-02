/**
 * /achievements ハブページ用のダミーデータ
 *
 * Sanity スキーマ確定後、実データ取得関数（getStoriesList / getOutputsList）に置き換える。
 *
 * アバター: DiceBear lorelei (https://www.dicebear.com/styles/lorelei/) — イラスト風
 */

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ffd5dc,ffdfbf,c0aede,d1d4f9,b6e3f4`;

export interface DummyStory {
  slug: string;
  title: string;
  excerpt: string;
  heroImageUrl: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  person: {
    name: string;
    profileImageUrl?: string;
    currentRole: string;
    bio?: string;
    socialLinks?: { label: string; url: string }[];
  };
  publishedAt: string;
  usedRoadmap?: {
    title: string;
    description: string;
    href: string;
    imageUrl?: string;
  };
}

export interface DummyOutput {
  id: string;
  title: string;
  thumbnailUrl: string;
  authorName: string;
  usedContent: {
    label: string;
    href: string;
  };
  publishedAt: string;
  externalUrl: string;
}

export const dummyStories: DummyStory[] = [
  {
    slug: "tanaka-yusuke-3months",
    title: "未経験から3ヶ月でUIデザイナーへ — 田中悠介さんの転職ストーリー",
    excerpt:
      "営業職からBONOで学び、3ヶ月で未経験からUIデザイナーへ転職した道のり。",
    heroImageUrl: "https://placehold.co/800x450/E5E7EB/9CA3AF?text=Story",
    category: "uiux_career_change",
    categoryLabel: "UIUX転職",
    tags: ["未経験"],
    person: {
      name: "田中 悠介",
      profileImageUrl: avatar("tanaka-yusuke"),
      currentRole: "UIデザイナー @ 株式会社サンプル",
      bio: "BONOに出会う前は法人営業を5年ほどやっていました。手を動かしてものを作る仕事にずっと憧れがあって、副業で少しずつデザインを始めたのがきっかけです。",
      socialLinks: [
        { label: "X", url: "https://x.com/example" },
        { label: "note", url: "https://note.com/example" },
        { label: "ポートフォリオ", url: "https://example.com" },
      ],
    },
    publishedAt: "2026-04-12",
    usedRoadmap: {
      title: "UIUX転職ロードマップ",
      description: "未経験から UIデザイナーへの転職を目指すための、12週間の学習プラン",
      href: "/roadmap/uiux-career-change",
      imageUrl: "https://placehold.co/400x250/FED7AA/9A3412?text=Roadmap",
    },
  },
  {
    slug: "sato-misaki-engineer-to-designer",
    title: "エンジニアからUIUXへ — 佐藤美咲さんのキャリアチェンジ",
    excerpt:
      "Webエンジニアとして5年経験を積んだ後、UIUXデザイナーへ職種変更した記録。",
    heroImageUrl: "https://placehold.co/800x450/E5E7EB/9CA3AF?text=Story",
    category: "uiux_career_change",
    categoryLabel: "UIUX転職",
    tags: ["業界経験あり"],
    person: {
      name: "佐藤 美咲",
      profileImageUrl: avatar("sato-misaki"),
      currentRole: "プロダクトデザイナー @ 株式会社サンプル",
    },
    publishedAt: "2026-03-28",
  },
  {
    slug: "yamamoto-ayano-mom-designer",
    title: "デザイン未経験のママが、子育てしながら6ヶ月で転職した方法",
    excerpt:
      "デザイン経験ゼロ・ワーママの状況からBONOで学び、リモートのUIデザイナーへ。",
    heroImageUrl: "https://placehold.co/800x450/E5E7EB/9CA3AF?text=Story",
    category: "uiux_career_change",
    categoryLabel: "UIUX転職",
    tags: ["デザイン未経験"],
    person: {
      name: "山本 綾乃",
      profileImageUrl: avatar("yamamoto-ayano"),
      currentRole: "UIデザイナー（リモート）",
    },
    publishedAt: "2026-03-10",
  },
];

export const dummyOutputs: DummyOutput[] = [
  {
    id: "output-1",
    title: "BONOのUIスタイリング課題でTwitterのプロフィール画面を作ってみた",
    thumbnailUrl: "https://placehold.co/600x400/E5E7EB/9CA3AF?text=Output+1",
    authorName: "中村 大輔",
    usedContent: { label: "📚 UIUX転職ロードマップ", href: "#" },
    publishedAt: "2026-05-20",
    externalUrl: "https://note.com/example/n/sample1",
  },
  {
    id: "output-2",
    title: "リサーチ課題：銀行アプリを30人にインタビューして気付いたこと",
    thumbnailUrl: "https://placehold.co/600x400/E5E7EB/9CA3AF?text=Output+2",
    authorName: "鈴木 健太",
    usedContent: { label: "📚 UIUX転職ロードマップ", href: "#" },
    publishedAt: "2026-05-18",
    externalUrl: "https://note.com/example/n/sample2",
  },
  {
    id: "output-3",
    title: "Figma で再現！スマホECサイトのカートUI設計プロセス",
    thumbnailUrl: "https://placehold.co/600x400/E5E7EB/9CA3AF?text=Output+3",
    authorName: "高橋 舞",
    usedContent: { label: "🎨 Figma基礎レッスン", href: "#" },
    publishedAt: "2026-05-15",
    externalUrl: "https://note.com/example/n/sample3",
  },
  {
    id: "output-4",
    title: "情報設計の練習として、家計簿アプリをリデザインしてみた",
    thumbnailUrl: "https://placehold.co/600x400/E5E7EB/9CA3AF?text=Output+4",
    authorName: "伊藤 翔",
    usedContent: { label: "📚 情報設計ロードマップ", href: "#" },
    publishedAt: "2026-05-10",
    externalUrl: "https://note.com/example/n/sample4",
  },
  {
    id: "output-5",
    title: "ユーザーテストでわかった、UIの「分かりやすさ」の正体",
    thumbnailUrl: "https://placehold.co/600x400/E5E7EB/9CA3AF?text=Output+5",
    authorName: "渡辺 愛",
    usedContent: { label: "📚 UXデザイン基礎", href: "#" },
    publishedAt: "2026-05-05",
    externalUrl: "https://note.com/example/n/sample5",
  },
  {
    id: "output-6",
    title: "BONOのお題で副業ポートフォリオを3案作った話",
    thumbnailUrl: "https://placehold.co/600x400/E5E7EB/9CA3AF?text=Output+6",
    authorName: "松本 陸",
    usedContent: { label: "🎨 ポートフォリオ強化トピック", href: "#" },
    publishedAt: "2026-04-30",
    externalUrl: "https://note.com/example/n/sample6",
  },
];
