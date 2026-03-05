# ロードマップページ実装仕様書

**作成日**: 2026-03-04
**ステータス**: 📋 レビュー待ち

---

## 概要

Pattern 11のデザインを使用し、4つのコースのロードマップページを実装する。
静的なコース設定データとSanityのレッスンデータを組み合わせたハイブリッドアプローチを採用。

---

## アーキテクチャ

### データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                    ロードマップページ                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐      ┌──────────────────────────┐    │
│  │  静的コース設定   │      │   Sanity CMS             │    │
│  │  (TypeScript)    │      │   (Lesson データ)        │    │
│  │                  │      │                          │    │
│  │  - タイトル      │      │  - title                 │    │
│  │  - 説明文        │      │  - description           │    │
│  │  - 対象者タグ    │      │  - thumbnail             │    │
│  │  - 得られるもの  │      │  - slug                  │    │
│  │  - ステップ構造  │      │  - isPremium             │    │
│  │  - レッスンslug  │◄────►│                          │    │
│  └──────────────────┘      └──────────────────────────┘    │
│            │                          │                     │
│            └──────────┬───────────────┘                     │
│                       ▼                                     │
│              ┌──────────────────┐                           │
│              │  Pattern 11      │                           │
│              │  コンポーネント   │                           │
│              └──────────────────┘                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ファイル構成

```
src/
├── data/
│   └── roadmaps/
│       ├── index.ts                 # エクスポート
│       ├── types.ts                 # 型定義
│       ├── uivisual-course.ts       # UIビジュアル入門
│       ├── infomationarchitect.ts   # 情報設計基礎
│       ├── ux-beginner.ts           # UXデザイン基礎
│       └── ui-beginner.ts           # UIデザイン入門
│
├── services/
│   └── roadmaps.ts                  # Sanity連携ロジック
│
└── pages/
    └── rdm/
        └── [slug].tsx               # 動的ルーティング
```

---

## 型定義

```typescript
// src/data/roadmaps/types.ts

/**
 * ステップ内のレッスン参照
 */
export interface StepLesson {
  /** Sanity Lesson の slug */
  slug: string;
  /** 表示順（オプション、指定しない場合はslug順） */
  order?: number;
}

/**
 * ロードマップのステップ
 */
export interface RoadmapStep {
  /** ステップ番号 (例: "01", "02") */
  number: string;
  /** ステップタイトル */
  title: string;
  /** ステップのゴール説明 */
  goal: string;
  /** 目安期間 */
  duration: string;
  /** このステップに含まれるレッスンのslug配列 */
  lessonSlugs: string[];
  /** セクションタイトル（オプション） */
  sectionTitle?: string;
}

/**
 * コース設定（静的データ）
 */
export interface RoadmapConfig {
  /** URL slug (例: "uivisual-course") */
  slug: string;
  /** コースタイトル */
  title: string;
  /** コース説明（短文） */
  subtitle: string;
  /** 対象者タグ */
  tags: string[];
  /** 料金テキスト */
  price: string;
  /** 完了目安期間 */
  estimatedDuration: string;
  /** 得られるもの（ベネフィット） */
  benefits: {
    description: string;
    items: string[];
  };
  /** ステップ構成 */
  steps: RoadmapStep[];
  /** ヘッダー画像設定 */
  headerImage: {
    gradientFrom: string;
    gradientTo: string;
    label: string;
    title: string;
    subtitle: string;
  };
  /** CTA設定 */
  cta: {
    subtitle: string;
    buttonText: string;
    buttonUrl: string;
  };
  /** 無料コースかどうか */
  isFree: boolean;
}

/**
 * Sanityから取得したレッスンデータ
 */
export interface SanityLesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  thumbnail?: {
    asset: { _ref: string };
  };
  thumbnailUrl?: string;
  isPremium: boolean;
}

/**
 * 表示用に結合されたレッスンデータ
 */
export interface DisplayLesson {
  number: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  url: string;
  isPremium: boolean;
}

/**
 * 表示用ステップデータ
 */
export interface DisplayStep {
  stepNumber: string;
  title: string;
  goal: string;
  duration: string;
  sectionTitle?: string;
  lessons: DisplayLesson[];
}
```

---

## 静的コース設定

### UIビジュアル入門コース

```typescript
// src/data/roadmaps/uivisual-course.ts

import { RoadmapConfig } from './types';

export const uivisualCourseConfig: RoadmapConfig = {
  slug: 'uivisual-course',
  title: 'UIビジュアル入門コース',
  subtitle: 'UIデザインの"見た目の基礎"を学べるコース。どうサイズを決めるのか？など現場でよく使われる考え方と視点を習得',
  tags: ['未経験', 'ジュニアデザイナー', 'UIづくりの基本', 'デザイン原則'],
  price: '¥5,800〜/月',
  estimatedDuration: '1〜2ヶ月',
  isFree: false,

  benefits: {
    description: 'UI初心者が、使いやすい操作体験を実現するために必須な表現の基本を習得し、世の中の"ふつう"を学びながらUIデザインを自分で進められるようになります。',
    items: [
      'UIの"ふつう"の知ることで自然な操作体験をつくれる',
      '"つくる"基本の進め方で、正しい制作を学べる',
      'つくることで正しいUIを考える思考力が身につく',
      'AIのアウトプットを判断するために基礎表現スキルが必要',
    ],
  },

  steps: [
    {
      number: '01',
      title: '上達するデザインの進め方',
      goal: '全てのデザインの基本の『進め方』を理解して、ここから先使っていきましょう',
      duration: '3〜7日',
      sectionTitle: 'デザインしよう',
      lessonSlugs: [
        'ui-design-cycle',      // UIデザインサイクル入門
        'sense-technique',       // センスを盗む技術
      ],
    },
    {
      number: '02',
      title: 'ToDoサービスをデザイン',
      goal: 'ToDoアプリをデザイン',
      duration: '1〜2週間',
      lessonSlugs: [
        '3structure-ui-design',  // 3構造ではじめるUIデザイン
        'uivisual-beginner',     // ゼロからはじめるUIビジュアル
      ],
    },
    {
      number: '03',
      title: 'UIの基礎要素を習得',
      goal: '見た目の基本6要素を習得',
      duration: '2週間',
      lessonSlugs: [
        'ui-typography',         // UIタイポグラフィ入門
        'uivisual-basics',       // UIビジュアルの入門基礎
        'graphic-basics',        // グラフィック入門
      ],
    },
    {
      number: '04',
      title: 'ゼロからデザインしてみよう',
      goal: '音声SNSアプリをデザイン',
      duration: '2週間',
      lessonSlugs: [
        'dailyui-voice-sns',     // DailyUI 音声SNS
      ],
    },
  ],

  headerImage: {
    gradientFrom: 'rgb(48, 72, 81)',
    gradientTo: 'rgb(135, 132, 164)',
    label: 'BONO 入門',
    title: 'UI VISUAL',
    subtitle: 'BEGINNER COURSE',
  },

  cta: {
    subtitle: '月額5,980円から、ロードマップを始められます',
    buttonText: 'BONOをはじめる',
    buttonUrl: '/subscription',
  },
};
```

### 情報設計基礎コース

```typescript
// src/data/roadmaps/infomationarchitect.ts

import { RoadmapConfig } from './types';

export const infomationArchitectConfig: RoadmapConfig = {
  slug: 'infomationarchitect-beginner',
  title: 'UIデザイン情報設計基礎コース',
  subtitle: '使いやすいUIをつくるための基本を習得するコース。顧客と目的に即したUIの検討と実現方法を学べる',
  tags: ['UIデザイナー志望者', '情報設計', '使いやすさ'],
  price: '¥5,800〜/月',
  estimatedDuration: '2ヶ月',
  isFree: false,

  benefits: {
    description: '使いやすいUIをつくるために必要な情報設計の基礎を習得し、顧客と目的に即したUI設計ができるようになります。',
    items: [
      'UIの使いやすさの原則を理解できる',
      '情報設計の基本アプローチを習得',
      '実践的なUI設計スキルが身につく',
      'ユーザー中心の設計思考が身につく',
    ],
  },

  steps: [
    {
      number: '01',
      title: 'UIデザイン基本を習得',
      goal: 'デザインの流れをトレース',
      duration: '1〜2週間',
      lessonSlugs: [
        'usable-ui-secret',      // つかいやすいUIの秘密
      ],
    },
    {
      number: '02',
      title: '基礎をインプット',
      goal: '基本概念を理解',
      duration: '2週間',
      lessonSlugs: [
        'navigation-ui-basics',   // ナビゲーションUIの基本
        'ooui-content-design',    // OOUIコンテンツ中心のUI設計
      ],
    },
    {
      number: '03',
      title: '実践課題',
      goal: '出張申請ソフトをデザイン',
      duration: '2週間',
      lessonSlugs: [
        'ui-ia-beginner',         // ゼロからはじめるUI情報設計
      ],
    },
  ],

  headerImage: {
    gradientFrom: 'rgb(72, 81, 48)',
    gradientTo: 'rgb(132, 164, 135)',
    label: 'BONO 基礎',
    title: 'INFO ARCH',
    subtitle: 'BEGINNER COURSE',
  },

  cta: {
    subtitle: '月額5,980円から、ロードマップを始められます',
    buttonText: 'BONOをはじめる',
    buttonUrl: '/subscription',
  },
};
```

### UXデザイン基礎コース

```typescript
// src/data/roadmaps/ux-beginner.ts

import { RoadmapConfig } from './types';

export const uxBeginnerConfig: RoadmapConfig = {
  slug: 'ux-beginner',
  title: 'UXデザイン基礎コース',
  subtitle: 'UI/UXデザインで必須の"顧客を中心"にした課題解決のデザイン手法を学びます',
  tags: ['UI/UX初心者', '顧客理解', '課題解決', 'デザイン手法'],
  price: '¥5,800〜/月',
  estimatedDuration: '2ヶ月',
  isFree: false,

  benefits: {
    description: '顧客を中心にした課題解決のデザイン手法を習得し、見た目だけではない本質的なUI/UXデザインができるようになります。',
    items: [
      '顧客理解に基づくデザインができる',
      'ユーザーインタビューのスキルを習得',
      '課題解決型のデザイン思考が身につく',
      '実践的なUXデザインプロセスを学べる',
    ],
  },

  steps: [
    {
      number: '01',
      title: 'ゴールと進め方の確認',
      goal: 'UXデザインとは何かを理解する',
      duration: '3日',
      lessonSlugs: [
        'ux-course-intro',        // コースについて
        'what-is-ux-design',      // UXデザインってなに？
      ],
    },
    {
      number: '02',
      title: '架空サービスの『価値定義』仮説をつくろう',
      goal: 'ゴールダイレクテッドデザインを習得',
      duration: '1週間',
      lessonSlugs: [
        'ux-basics',              // UX入門
        'first-ux-design',        // はじめてのUXデザイン
      ],
    },
    {
      number: '03',
      title: 'インタビューで"顧客理解"に挑戦',
      goal: 'ユーザーインタビューで課題要因を特定',
      duration: '2週間',
      lessonSlugs: [
        'user-interview-beginner', // ゼロからユーザーインタビュー
      ],
    },
    {
      number: '04',
      title: '架空サービスを完成させよう',
      goal: 'ユーザーの課題解決するサービスをデザイン',
      duration: '1ヶ月',
      lessonSlugs: [
        'ux-challenge',           // チャレンジ課題
      ],
    },
  ],

  headerImage: {
    gradientFrom: 'rgb(81, 48, 72)',
    gradientTo: 'rgb(164, 132, 156)',
    label: 'BONO 基礎',
    title: 'UX DESIGN',
    subtitle: 'BEGINNER COURSE',
  },

  cta: {
    subtitle: '月額5,980円から、ロードマップを始められます',
    buttonText: 'BONOをはじめる',
    buttonUrl: '/subscription',
  },
};
```

### UIデザイン入門コース（無料）

```typescript
// src/data/roadmaps/ui-beginner.ts

import { RoadmapConfig } from './types';

export const uiBeginnerConfig: RoadmapConfig = {
  slug: 'uidezainru-men',
  title: 'UIデザイン入門コース',
  subtitle: 'UIトレースを中心に未経験からでもUIデザインを行う土台を身につけるコース。Figmaの操作方法をUIを作りながら学ぶ',
  tags: ['未経験者', '転職希望者', 'Figma初心者', '無料'],
  price: '無料',
  estimatedDuration: '1〜2ヶ月',
  isFree: true,

  benefits: {
    description: '未経験からでもUIデザインの土台を身につけ、Figmaを使ったUIトレースができるようになります。',
    items: [
      'Figmaの基本操作をマスター',
      'UIトレースのスキルを習得',
      'UIデザインの基礎知識が身につく',
      '無料で始められる入門コース',
    ],
  },

  steps: [
    {
      number: '01',
      title: 'Figmaの使い方を覚えよう',
      goal: 'YouTubeアプリをトレース',
      duration: '1週間',
      lessonSlugs: [
        'figmabeginner',          // Figmaの使い方入門
      ],
    },
    {
      number: '02',
      title: 'Figmaの実践的なスキルを習得',
      goal: 'Twitter UIをトレース',
      duration: '1週間',
      lessonSlugs: [
        'figma-elementary',       // Figmaの使い方初級
      ],
    },
    {
      number: '03',
      title: '連絡帳をデザインしてUIの基本に触れる',
      goal: 'iOSの連絡帳アプリをデザイン',
      duration: '1週間',
      lessonSlugs: [
        'uidesignbeginner',       // はじめてのUIデザイン
      ],
    },
  ],

  headerImage: {
    gradientFrom: 'rgb(48, 81, 72)',
    gradientTo: 'rgb(132, 156, 164)',
    label: 'BONO 入門',
    title: 'UI DESIGN',
    subtitle: 'FREE COURSE',
  },

  cta: {
    subtitle: '無料で始められます',
    buttonText: '無料で始める',
    buttonUrl: '/signup',
  },
};
```

---

## Sanity連携

### GROQクエリ

```typescript
// src/services/roadmaps.ts

import { client } from '@/lib/sanity';
import { SanityLesson, DisplayLesson, DisplayStep } from '@/data/roadmaps/types';
import { RoadmapConfig } from '@/data/roadmaps/types';
import { urlFor } from '@/lib/sanity';

/**
 * 指定されたslugのレッスンを取得
 */
export async function getLessonsBySlugs(slugs: string[]): Promise<SanityLesson[]> {
  const query = `*[_type == "lesson" && slug.current in $slugs] {
    _id,
    title,
    "slug": slug.current,
    description,
    thumbnail,
    isPremium
  }`;

  return client.fetch(query, { slugs });
}

/**
 * ロードマップ設定とSanityデータを結合して表示用データを生成
 */
export async function getRoadmapDisplayData(config: RoadmapConfig): Promise<DisplayStep[]> {
  // 全ステップのレッスンslugを収集
  const allSlugs = config.steps.flatMap(step => step.lessonSlugs);

  // Sanityからレッスンデータを取得
  const lessons = await getLessonsBySlugs(allSlugs);

  // slugをキーにしたマップを作成
  const lessonMap = new Map(
    lessons.map(lesson => [lesson.slug, lesson])
  );

  // 表示用データを構築
  return config.steps.map((step, stepIndex) => {
    const displayLessons: DisplayLesson[] = step.lessonSlugs
      .map((slug, lessonIndex) => {
        const sanityLesson = lessonMap.get(slug);

        if (!sanityLesson) {
          console.warn(`Lesson not found: ${slug}`);
          return null;
        }

        return {
          number: String(lessonIndex + 1).padStart(2, '0'),
          title: sanityLesson.title,
          description: sanityLesson.description || '',
          thumbnailUrl: sanityLesson.thumbnail
            ? urlFor(sanityLesson.thumbnail).width(400).url()
            : undefined,
          url: `/lessons/${sanityLesson.slug}`,
          isPremium: sanityLesson.isPremium,
        };
      })
      .filter((lesson): lesson is DisplayLesson => lesson !== null);

    return {
      stepNumber: step.number,
      title: step.title,
      goal: step.goal,
      duration: step.duration,
      sectionTitle: step.sectionTitle,
      lessons: displayLessons,
    };
  });
}
```

---

## ルーティング

### 動的ルート

```typescript
// src/pages/rdm/[slug].tsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { roadmapConfigs } from '@/data/roadmaps';
import { getRoadmapDisplayData } from '@/services/roadmaps';
import { DisplayStep, RoadmapConfig } from '@/data/roadmaps/types';
import {
  RoadmapBadge,
  Tag,
  SectionHeader,
  LinkButton,
  BenefitCard,
  StepRow,
  StepDetailCard,
  CTAButton,
} from '@/pages/dev/roadmap-pattern-11/components';

export default function RoadmapPage() {
  const { slug } = useParams<{ slug: string }>();
  const [displaySteps, setDisplaySteps] = useState<DisplayStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 静的設定を取得
  const config = roadmapConfigs[slug || ''] as RoadmapConfig | undefined;

  useEffect(() => {
    if (!config) {
      setError('コースが見つかりません');
      setLoading(false);
      return;
    }

    getRoadmapDisplayData(config)
      .then(setDisplaySteps)
      .catch(err => {
        console.error('Failed to load roadmap data:', err);
        setError('データの読み込みに失敗しました');
      })
      .finally(() => setLoading(false));
  }, [config]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </Layout>
    );
  }

  if (error || !config) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'コースが見つかりません'}
          </h1>
          <Link to="/roadmap" className="text-blue-600 hover:underline">
            コース一覧に戻る
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Pattern 11のレイアウトを使用 */}
      {/* ... 実装は既存のPattern 11を参照 ... */}
    </Layout>
  );
}
```

---

## App.tsxへのルート追加

```typescript
// App.tsx に追加

import RoadmapPage from './pages/rdm/[slug]';

// Routes内に追加
<Route path="/rdm/:slug" element={<RoadmapPage />} />
```

---

## 実装タスク

### Phase 1: データ層の実装

| # | タスク | 優先度 | 状態 |
|---|--------|--------|------|
| 1.1 | `src/data/roadmaps/types.ts` 作成 | 高 | ⏳ |
| 1.2 | 4コースの静的設定ファイル作成 | 高 | ⏳ |
| 1.3 | `src/data/roadmaps/index.ts` 作成 | 高 | ⏳ |
| 1.4 | `src/services/roadmaps.ts` 作成 | 高 | ⏳ |

### Phase 2: コンポーネント修正

| # | タスク | 優先度 | 状態 |
|---|--------|--------|------|
| 2.1 | Pattern 11 コンポーネントをprops対応に修正 | 高 | ⏳ |
| 2.2 | StepDetailCardにサムネイル表示を追加 | 中 | ⏳ |
| 2.3 | CourseCardにリンク機能を追加 | 中 | ⏳ |

### Phase 3: ページ実装

| # | タスク | 優先度 | 状態 |
|---|--------|--------|------|
| 3.1 | `/rdm/[slug].tsx` 動的ルートページ作成 | 高 | ⏳ |
| 3.2 | App.tsxにルート追加 | 高 | ⏳ |
| 3.3 | ローディング・エラー状態のUI | 中 | ⏳ |

### Phase 4: 検証

| # | タスク | 優先度 | 状態 |
|---|--------|--------|------|
| 4.1 | 4コースの表示確認 | 高 | ⏳ |
| 4.2 | Sanityレッスンリンクの動作確認 | 高 | ⏳ |
| 4.3 | レスポンシブ確認（必要な場合） | 中 | ⏳ |

---

## 注意事項

### Sanityレッスンslugの確認

実装前に、以下のレッスンslugがSanityに存在するか確認が必要：

**UIビジュアル入門**:
- `ui-design-cycle`
- `sense-technique`
- `3structure-ui-design`
- `uivisual-beginner`
- `ui-typography`
- `uivisual-basics`
- `graphic-basics`
- `dailyui-voice-sns`

**UIデザイン入門（無料）**:
- `figmabeginner` ✅ 確認済み
- `figma-elementary` ✅ 確認済み
- `uidesignbeginner` ✅ 確認済み

### フォールバック処理

Sanityにレッスンが見つからない場合：
- コンソールに警告を出力
- そのレッスンはスキップ（表示しない）
- ユーザーには影響を与えない

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-04 | 仕様書初版作成 |

