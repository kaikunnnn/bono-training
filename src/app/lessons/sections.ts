/**
 * レッスン一覧のセクション・サブセクション定義
 *
 * mainブランチの Lessons.tsx (lines 16-234) からコピー
 * タブ順序: おすすめ → 進め方 → UIデザイン → 情報設計 → UXデザイン → キャリア → AI → ビジュアル → Figma → ラジオ
 */

// セクション定義
export interface SubSection {
  id: string;
  label: string;  // 補足（例: "実務・プロセス"）
  title: string;  // セクション名（例: "1本目立ち回り / デザインサイクル"）
  lessonTitles: string[];  // このセクションに属するレッスンタイトル（部分一致）
}

export interface Section {
  id: string;
  label: string;
  subSections: SubSection[];
  categories: string[];  // Sanityカテゴリとのマッチング用
}

export const SECTIONS: Section[] = [
  {
    id: 'process',
    label: '進め方',
    subSections: [
      {
        id: 'cycle',
        label: '実務・プロセス',
        title: '1本目立ち回り / デザインサイクル',
        // 順序: デザインサイクル → 1年目の立ち回り
        lessonTitles: ['デザインサイクル', '1年目の立ち回り']
      },
      {
        id: 'basics',
        label: '入門・基礎',
        title: 'ゼロから情報・デザインの基本の進め方を習得',
        // 順序: ゼロからUIビジュアル → ゼロからUI情報設計 → はじめてのUIデザイン
        lessonTitles: ['ゼロからはじめるUIビジュアル', 'ゼロからはじめるUI情報設計', 'はじめてのUIデザイン']
      }
    ],
    categories: ['進め方']
  },
  {
    id: 'ui',
    label: 'UIデザイン',
    subSections: [
      {
        id: 'style',
        label: 'スタイル',
        title: 'UIのつくり方をはじめよう',
        // 順序: UIビジュアル基礎 → センスを盗む → UIタイポグラフィ → UIデザインの基本 → UIトレース → 実装とデザイン
        lessonTitles: ['UIビジュアル基礎', 'センスを盗む', 'UIタイポグラフィ', 'UIデザインの基本', 'UIトレース', '実装とデザイン']
      },
      {
        id: 'structure',
        label: 'UIの仕組み',
        title: 'UIの詳細・UIの仕組みと構造',
        // 順序: 3構造 → マテリアルデザイン → Material Design → Material You
        // ※ 使いやすいUI・ナビゲーションUIは情報設計カテゴリへ移動
        lessonTitles: ['3構造', 'マテリアルデザイン', 'Material Design', 'Material You']
      },
      {
        id: 'practice',
        label: 'ハンズオン',
        title: '実践・課題',
        // 順序: DailyUI → 賃貸アプリ → UIデザインの基本-応用 → 出張申請
        lessonTitles: ['DailyUI', '賃貸アプリ', 'UIデザインの基本-応用', '出張申請']
      }
    ],
    categories: ['UI']
  },
  {
    id: 'ia',
    label: '情報設計',
    subSections: [
      {
        id: 'methodology',
        label: '方法論',
        title: '使いやすいUIの方法論',
        // 順序: OOUI → 使いやすいUI → ナビゲーションUI
        lessonTitles: ['OOUI', '使いやすいUI', 'ナビゲーションUI']
      },
      {
        id: 'organize',
        label: '情報整理',
        title: '情報を整理してデザインする方法',
        // 順序: ゼロからUI情報設計（優先）→ UIアイデア → UI PATTERN → 目的達成
        lessonTitles: ['ゼロからはじめるUI情報設計', 'UIアイデア', 'UI PATTERN', '目的達成']
      }
    ],
    categories: ['情報設計']
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    subSections: [
      {
        id: 'experience',
        label: '体験設計',
        title: 'UXデザイン・ユーザー価値デザインのきほん',
        // 順序: UXデザインってなに？ → 顧客体験デザイン
        lessonTitles: ['UXデザインってなに', '顧客体験デザイン']
      },
      {
        id: 'research',
        label: 'リサーチ・分析',
        title: 'UXリサーチ / 課題分析・ユーザー理解で問いを解こう',
        // 順序: ユーザーインタビュー → FAILURE POINT → 商品ページ改善
        lessonTitles: ['ユーザーインタビュー', 'FAILURE POINT', '商品ページ改善']
      }
    ],
    categories: ['UX']
  },
  {
    id: 'career',
    label: 'キャリア',
    subSections: [
      {
        id: 'job',
        label: '転職・キャリア',
        title: 'ポートフォリオ / 会社の選び方・転職に必要なヒント',
        // 順序: ポートフォリオ → キャリア相談 → BONOフィードバック集
        // ※ UIUXデザイナーになる条件・BONO勉強会アーカイブは除外
        lessonTitles: ['ポートフォリオ', 'キャリア相談', 'BONOフィードバック']
      }
    ],
    categories: ['キャリア']
  },
  {
    id: 'ai',
    label: 'AI',
    subSections: [
      {
        id: 'ai-design',
        label: 'AI関連',
        title: 'AI×デザイン',
        lessonTitles: ['AI×UIリサーチ']
      }
    ],
    categories: ['AI']
  },
  {
    id: 'visual',
    label: 'ビジュアル',
    subSections: [
      {
        id: 'graphic',
        label: 'グラフィック・訴求',
        title: 'バナー・すべてに通じる伝え方を磨く',
        // 順序: グラフィック入門 → バナーデザイン
        lessonTitles: ['グラフィック入門', 'バナーデザイン']
      }
    ],
    categories: ['ビジュアル']
  },
  {
    id: 'figma',
    label: 'Figma',
    subSections: [
      {
        id: 'figma-basics',
        label: 'ツール操作',
        title: 'Figmaの使い方',
        // 順序: Figmaの使い方入門 → Figmaの使い方初級
        lessonTitles: ['Figmaの使い方入門', 'Figmaの使い方初級']
      }
    ],
    categories: ['Figma']
  },
  {
    id: 'radio',
    label: 'ラジオ',
    subSections: [
      {
        id: 'radio-content',
        label: '',
        title: '',
        lessonTitles: ['BONOラジオ']
      }
    ],
    categories: ['ラジオ']
  },
  {
    id: 'others',
    label: 'その他',
    subSections: [],
    categories: ['その他']
  }
];

// おすすめタブ用のセクション定義
// ※ lessonTitlesは実際のSanityデータのタイトルに合わせる
export const RECOMMENDED_SECTIONS: SubSection[] = [
  {
    id: 'beginners',
    label: '入門・基礎',
    title: 'デザインの基礎をはじめよう',
    // 実際のタイトル: ゼロからはじめるUIビジュアル、ゼロからはじめるUI情報設計、UIデザインの基本、UIが上手くなる人の"デザインサイクル"
    lessonTitles: ['ゼロからはじめるUIビジュアル', 'ゼロからはじめるUI情報設計', 'UIデザインの基本', 'UIが上手くなる人の']
  },
  {
    id: 'popular',
    label: 'みんなが学んでる',
    title: 'よく見られているレッスン',
    // 実際のタイトル: UIビジュアル基礎、ゼロからはじめるUI情報設計、UXデザインってなに？、Figmaの使い方入門
    lessonTitles: ['UIビジュアル基礎', 'ゼロからはじめるUI情報設計', 'UXデザインってなに？', 'Figmaの使い方入門']
  },
  {
    id: 'ia',
    label: '情報設計',
    title: 'UIの使いやすさをデザインしよう',
    // 実際のタイトル: ゼロからはじめるUI情報設計、使いやすいUIの秘密、OOUI コンテンツ中心のUI設計、ナビゲーションUIの基本
    lessonTitles: ['ゼロからはじめるUI情報設計', '使いやすいUIの秘密', 'OOUI コンテンツ中心のUI設計', 'ナビゲーションUIの基本']
  },
  {
    id: 'ux',
    label: 'UXデザイン',
    title: 'ユーザーの課題を解決しよう',
    // 実際のタイトル: UXデザインってなに？、FAILURE POINT 課題発見の方法、顧客体験デザインの基本、ゼロからはじめるユーザーインタビュー
    lessonTitles: ['UXデザインってなに？', 'FAILURE POINT 課題発見の方法', '顧客体験デザインの基本', 'ゼロからはじめるユーザーインタビュー']
  }
];
