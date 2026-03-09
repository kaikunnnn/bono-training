/**
 * Guide Detail Pattern F
 * ガイド詳細ページテンプレート
 *
 * 3種類のレイアウト:
 * 1. キャリアの基本 - 標準記事レイアウト
 * 2. デザイナーの視点 - 視点記事レイアウト（4セクション構造）
 * 3. 出発点別ガイド - ロードマップ接続型レイアウト
 */

import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Check,
  Telescope,
  Target,
  Lightbulb,
  Briefcase,
  FileText,
  TrendingUp,
  Bot,
  Layers,
  Sparkles,
  Compass
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

// dev環境用ベースパス
const DEV_BASE = '/dev';

// ============================================
// デザインシステム（Pattern E準拠）
// ============================================
const colors = {
  bg: '#F9F9F7',
  bgCard: '#FFFFFF',
  bgMuted: '#F5F5F5',
  bgPlaceholder: '#E8E8E8',
  text: '#1a1a1a',
  textMuted: '#666666',
  textLight: '#999999',
  accent: '#2563eb',
  border: 'rgba(0, 0, 0, 0.06)',
  career: '#E8F5E9',
  perspectives: '#E3F2FD',
  starting: '#F3E8FF',
};

const fonts = {
  heading: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
  body: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
};

// ============================================
// 記事データ（実際はCMSから取得）
// ============================================
type ArticleType = 'career' | 'perspective' | 'starting';

interface Article {
  slug: string;
  type: ArticleType;
  category: string;
  categoryEmoji: string;
  title: string;
  description: string;
  readTime: string;
  sections?: {
    title: string;
    content: string[];
  }[];
  // 視点記事用
  perspectiveSections?: {
    whatHappening: string[];
    bonoView: string[];
    whatToLearn: string[];
  };
  // 出発点記事用
  headline?: string;
  offers?: string[];
  nextSteps?: {
    title: string;
    link: string;
  }[];
}

const articles: Record<string, Article> = {
  // キャリアの基本
  'what-is-uiux': {
    slug: 'what-is-uiux',
    type: 'career',
    category: 'キャリアの基本',
    categoryEmoji: '📋',
    title: 'UI/UXデザイナーとは',
    description: 'UI/UXデザインの定義、Webデザインとの違い、仕事内容の具体例',
    readTime: '10分',
    sections: [
      {
        title: 'UI/UXデザインの定義',
        content: [
          'UIデザイン（User Interface Design）は、ユーザーがプロダクトと接する「見た目」の部分をデザインすること。ボタン、フォーム、ナビゲーションなどの視覚的要素を設計します。',
          'UXデザイン（User Experience Design）は、ユーザーがプロダクトを使う「体験」全体をデザインすること。使いやすさ、分かりやすさ、満足度を高める設計を行います。',
        ],
      },
      {
        title: 'Webデザインとの違い',
        content: [
          'Webデザインは主に「見た目の美しさ」にフォーカスしますが、UIUXデザインは「使う人の課題解決」にフォーカスします。',
          'ただ綺麗なデザインを作るのではなく、「なぜこのボタンはここにあるのか」「なぜこの色を使うのか」という根拠を持って設計します。',
        ],
      },
      {
        title: '仕事内容の具体例',
        content: [
          'ユーザーインタビューによる課題発見',
          'ワイヤーフレームの作成',
          'UIデザイン（Figma等での画面設計）',
          'プロトタイプの作成とユーザーテスト',
          'デザインシステムの構築・運用',
        ],
      },
      {
        title: '市場動向',
        content: [
          'UIUXデザイナーの求人は年々増加しています。特にSaaS企業、スタートアップでの需要が高まっています。',
          'AI時代においても、「体験を設計する」というUIUXデザイナーの本質的な役割はなくなりません。むしろ、AIをどう使いやすく設計するかという新しい課題が生まれています。',
        ],
      },
    ],
  },
  'skills-requirements': {
    slug: 'skills-requirements',
    type: 'career',
    category: 'キャリアの基本',
    categoryEmoji: '📋',
    title: '必要なスキルと条件',
    description: '3つの基礎（UIビジュアル/情報設計/UXデザイン）、スキルレベルの目安',
    readTime: '15分',
    sections: [
      {
        title: 'UIUXデザインの3つの基礎',
        content: [
          '🎨 UIビジュアル - 見た目の基本を作る力。タイポグラフィ、配色、レイアウトなど。',
          '📐 情報設計 - 使いやすさを設計する力。どこに何を置くか、ユーザーの動線設計。',
          '🧠 UXデザイン - 顧客理解と課題解決の力。誰のどんな課題を解決するかを考える。',
        ],
      },
      {
        title: '転職に必要なスキルレベル',
        content: [
          '「プロレベル」である必要はありません。「基礎を理解し、実践できる」レベルが目安です。',
          'ポートフォリオで「なぜそうデザインしたのか」を説明できることが重要です。',
        ],
      },
      {
        title: '学習期間の目安',
        content: [
          '本気で取り組めば、6ヶ月〜1年で転職可能なレベルに到達できます。',
          '週10時間以上の学習時間を確保することをおすすめします。',
        ],
      },
    ],
  },
  'portfolio': {
    slug: 'portfolio',
    type: 'career',
    category: 'キャリアの基本',
    categoryEmoji: '📋',
    title: 'ポートフォリオの作り方',
    description: 'ポートフォリオが必要な理由、掲載すべき内容、転職成功者の実例',
    readTime: '12分',
    sections: [
      {
        title: 'なぜポートフォリオが必要なのか',
        content: [
          'UIUXデザイナーは「スキルを見せる」仕事です。履歴書だけでは伝わりません。',
          'ポートフォリオは「この人と一緒に働きたいか」を判断する材料になります。',
        ],
      },
      {
        title: '掲載すべき内容',
        content: [
          '作品の完成画像（Before/Afterがあるとベター）',
          '課題と解決策の説明（なぜこのデザインにしたのか）',
          'プロセスの紹介（どのように進めたのか）',
          '自分の役割と学び',
        ],
      },
      {
        title: '自主制作でもOK',
        content: [
          '実務経験がなくても、架空のサービスをデザインして作品にできます。',
          '重要なのは「課題を設定し、それを解決するデザインを作る」というプロセスです。',
        ],
      },
    ],
  },
  'job-search': {
    slug: 'job-search',
    type: 'career',
    category: 'キャリアの基本',
    categoryEmoji: '📋',
    title: '会社選び・面接対策',
    description: '事業会社vs制作会社、探し方ガイド、面接で見られるポイント',
    readTime: '10分',
    sections: [
      {
        title: '会社の種類',
        content: [
          '事業会社: 自社プロダクトを持つ会社。1つのサービスに深く関われる。',
          '制作会社: クライアントの案件を受ける会社。様々なプロジェクトに関われる。',
          '未経験の場合、制作会社の方が入りやすい傾向があります。',
        ],
      },
      {
        title: '面接で見られるポイント',
        content: [
          'ポートフォリオの質（思考プロセスが見えるか）',
          'デザインに対する考え方（なぜUIUXをやりたいのか）',
          '学習への姿勢（どう成長してきたか、これからどう成長するか）',
        ],
      },
    ],
  },
  'career-path': {
    slug: 'career-path',
    type: 'career',
    category: 'キャリアの基本',
    categoryEmoji: '📋',
    title: '年収・キャリアパス',
    description: '未経験入社の年収レンジ、キャリアステップ、フリーランスという選択肢',
    readTime: '8分',
    sections: [
      {
        title: '未経験入社の年収レンジ',
        content: [
          '未経験からの転職: 300万〜400万円が目安',
          '経験1〜3年: 400万〜550万円',
          '経験3〜5年: 500万〜700万円',
          'シニア/リード: 700万〜1000万円以上',
        ],
      },
      {
        title: 'キャリアパス',
        content: [
          'スペシャリスト: UIデザイン、UXリサーチなど専門性を深める道',
          'マネジメント: デザインチームのリーダー、デザインマネージャー',
          'プロダクト: プロダクトマネージャー、プロダクトデザイナー',
        ],
      },
    ],
  },

  // デザイナーの視点
  'perspectives/ai-and-designer': {
    slug: 'perspectives/ai-and-designer',
    type: 'perspective',
    category: 'デザイナーの視点',
    categoryEmoji: '🔭',
    title: 'AI時代のUIUXデザイナーの本当の役割とは',
    description: '「AIで仕事なくなる？」という不安に対するBONOの見解',
    readTime: '8分',
    perspectiveSections: {
      whatHappening: [
        'ChatGPT、Claude、Midjourney...AIツールが急速に進化し、UIデザインの自動生成も可能になってきました。',
        '「AIがデザインを作れるなら、UIデザイナーは不要になるのでは？」という不安の声が増えています。',
        '実際、一部のタスク（バナー作成、パターン生成など）はAIで代替可能になりつつあります。',
      ],
      bonoView: [
        'デザイナーの仕事は「UIを作ること」ではありません。「ユーザーの課題を解決する体験を設計すること」です。',
        'AIは「作る」作業を効率化しますが、「何を作るべきか」「なぜ作るべきか」を考えるのは人間の仕事です。',
        'むしろ、AIを使いこなして「より良い体験」を設計できるデザイナーの価値は上がります。',
        '「AIに仕事を奪われる」のではなく、「AIを使って仕事の質を上げる」という視点が重要です。',
      ],
      whatToLearn: [
        '🧠 UXデザインの本質（顧客理解、課題設定、体験設計）',
        '📐 情報設計（AIが出力したものを評価・改善する力）',
        '🤖 AIツールの使い方（プロンプト設計、出力の評価と改善）',
      ],
    },
  },
  'perspectives/saas-ui-future': {
    slug: 'perspectives/saas-ui-future',
    type: 'perspective',
    category: 'デザイナーの視点',
    categoryEmoji: '🔭',
    title: 'SaaSのUIは本当に無くなるのか？',
    description: '「SaaSがAIに置き換わる？」という疑問への回答',
    readTime: '7分',
    perspectiveSections: {
      whatHappening: [
        '「AIエージェントがすべてを処理するから、UIは不要になる」という予測が出ています。',
        '一部のタスク（データ入力、レポート生成など）はAIが自動処理できるようになりつつあります。',
      ],
      bonoView: [
        'すべてのUIがなくなるわけではありません。「人間が判断したい」「確認したい」場面は必ず残ります。',
        'むしろ「AIの出力を人間が確認する」ための新しいUIが必要になります。',
        'SaaSのUIは「なくなる」のではなく「変化する」のです。',
      ],
      whatToLearn: [
        '情報設計の基礎（複雑な情報を整理する力）',
        'AIプロダクトのUI設計',
        'ユーザーテストと検証の方法',
      ],
    },
  },
  'perspectives/ux-in-ai-era': {
    slug: 'perspectives/ux-in-ai-era',
    type: 'perspective',
    category: 'デザイナーの視点',
    categoryEmoji: '🔭',
    title: 'AIプロダクトにおけるUXデザインの重要性',
    description: '「AIの時代にUXって必要？」への答え',
    readTime: '10分',
    perspectiveSections: {
      whatHappening: [
        'AIを搭載したプロダクトが急増しています。',
        '「AIが賢ければUXは不要」という誤解も広がっています。',
      ],
      bonoView: [
        'AIプロダクトこそ、UXデザインが重要です。なぜなら「AIとユーザーの橋渡し」が必要だからです。',
        'AIの出力は完璧ではありません。エラーを分かりやすく伝え、修正を促すUIが必要です。',
        'ユーザーがAIを「信頼」できるようにする体験設計が求められます。',
      ],
      whatToLearn: [
        'UXライティング（AIの出力を人間に分かりやすく伝える）',
        '信頼性のデザイン（AIの限界を正直に伝える）',
        'フィードバックループの設計',
      ],
    },
  },
  'perspectives/experience-design': {
    slug: 'perspectives/experience-design',
    type: 'perspective',
    category: 'デザイナーの視点',
    categoryEmoji: '🔭',
    title: '「UIを作る」から「体験を設計する」へ',
    description: 'UIデザイナーの定義の変化と、これから求められること',
    readTime: '9分',
    perspectiveSections: {
      whatHappening: [
        'UIデザイナーの仕事が「画面を作る」から「体験を設計する」へとシフトしています。',
        'Figmaでの画面作成だけでなく、ユーザーリサーチ、プロトタイプ、検証まで求められるようになっています。',
      ],
      bonoView: [
        '「UIを作れる」だけでは差別化できない時代になりました。',
        '「なぜこのデザインなのか」を説明できる根拠（ユーザー理解、課題設定）が重要です。',
        '「作業者」から「クリエイター」へ。これがBONOが伝えたいことです。',
      ],
      whatToLearn: [
        'ユーザーリサーチの方法',
        'プロトタイピングとユーザーテスト',
        '課題設定と仮説検証',
      ],
    },
  },
  'perspectives/worth-starting-now': {
    slug: 'perspectives/worth-starting-now',
    type: 'perspective',
    category: 'デザイナーの視点',
    categoryEmoji: '🔭',
    title: '未経験から目指す価値は今もあるのか',
    description: '「今からでも間に合う？」という不安への正直な回答',
    readTime: '6分',
    perspectiveSections: {
      whatHappening: [
        '「未経験からデザイナーになるのは難しくなった」という声があります。',
        '実際、求められるスキルレベルは年々上がっています。',
      ],
      bonoView: [
        '結論: 今からでも間に合います。ただし「ただ作れる」だけでは難しいです。',
        '「なぜそうデザインしたのか」という根拠を持ったポートフォリオがあれば、転職は可能です。',
        'BONOの転職実績がそれを証明しています。',
      ],
      whatToLearn: [
        '3つの基礎を体系的に学ぶ',
        'ポートフォリオで思考プロセスを見せる',
        'フィードバックを受けて改善するサイクルを回す',
      ],
    },
  },

  // 出発点別ガイド
  'from-zero': {
    slug: 'from-zero',
    type: 'starting',
    category: 'あなたの出発点',
    categoryEmoji: '🔀',
    title: '完全未経験から',
    description: 'デザイン経験ゼロからUIUXデザイナーを目指す方へ',
    readTime: '15分',
    headline: '何からはじめればいいかわからない',
    offers: [
      '転職実績のあるロードマップ',
      '3つの基礎（UIビジュアル/情報設計/UXデザイン）を体系的に',
      'ポートフォリオ作成のサポート',
      'プロからのフィードバック',
    ],
    nextSteps: [
      { title: 'ロードマップを見る', link: '/roadmaps/career-change' },
      { title: '必要なスキルを知る', link: '/dev/guide-pattern-f/skills-requirements' },
      { title: 'BONOをはじめる', link: '/signup' },
    ],
  },
  'from-webdesigner': {
    slug: 'from-webdesigner',
    type: 'starting',
    category: 'あなたの出発点',
    categoryEmoji: '🔀',
    title: 'Webデザイナーから',
    description: 'Webデザインの経験を活かしてUIUXへ転向',
    readTime: '12分',
    headline: 'WebとUIUXって何が違うの？',
    offers: [
      'WebデザインとUIUXの違いを明確に解説',
      '足りないスキルを特定',
      '転向に成功した人の実例',
      '最短で転向するためのロードマップ',
    ],
    nextSteps: [
      { title: 'UI/UXデザイナーとは', link: '/dev/guide-pattern-f/what-is-uiux' },
      { title: '必要なスキルと条件', link: '/dev/guide-pattern-f/skills-requirements' },
      { title: 'ロードマップを見る', link: '/roadmaps/career-change' },
    ],
  },
  'for-junior': {
    slug: 'for-junior',
    type: 'starting',
    category: 'あなたの出発点',
    categoryEmoji: '🔀',
    title: 'ジュニアデザイナー',
    description: '現職でUIUXをしているけど、プロの根拠あるやり方を身につけたい',
    readTime: '10分',
    headline: '自己流でやってるのが不安',
    offers: [
      '実務で使う設計思考',
      'プロからのフィードバック',
      '根拠のあるデザインプロセス',
      'プロダクトクリエイターへの道',
    ],
    nextSteps: [
      { title: 'AI時代のデザイナーの役割', link: '/dev/guide-pattern-f/perspectives/ai-and-designer' },
      { title: '体験設計とは', link: '/dev/guide-pattern-f/perspectives/experience-design' },
      { title: 'BONOをはじめる', link: '/signup' },
    ],
  },
  'stories': {
    slug: 'stories',
    type: 'career',
    category: '転職ストーリー',
    categoryEmoji: '👤',
    title: '転職ストーリー',
    description: 'BONOを使って転職に成功したメンバーのインタビュー',
    readTime: '20分',
    sections: [
      {
        title: 'インタビュー一覧',
        content: [
          'このページでは、BONOを使ってUIUXデザイナーへの転職に成功したメンバーのインタビューを紹介します。',
        ],
      },
    ],
  },
  'faq': {
    slug: 'faq',
    type: 'career',
    category: 'FAQ',
    categoryEmoji: '❓',
    title: 'よくある質問',
    description: 'UIUXデザイナーへの転職に関するよくある質問',
    readTime: '10分',
    sections: [
      {
        title: 'Q. デザインセンスがなくても大丈夫？',
        content: [
          'A. 大丈夫です。UIUXデザインは「センス」より「論理」です。なぜそうデザインするのかという根拠を持つことが重要です。',
        ],
      },
      {
        title: 'Q. どれくらいの期間で転職できる？',
        content: [
          'A. 本気で取り組めば、6ヶ月〜1年で転職可能なレベルに到達できます。週10時間以上の学習時間を確保することをおすすめします。',
        ],
      },
      {
        title: 'Q. 実務経験がなくてもポートフォリオは作れる？',
        content: [
          'A. はい、自主制作でも問題ありません。架空のサービスをデザインして作品にできます。重要なのは「課題を設定し、それを解決するデザインを作る」というプロセスです。',
        ],
      },
    ],
  },
};

// ============================================
// レイアウトコンポーネント
// ============================================

// 標準記事レイアウト（キャリアの基本）
const CareerArticleLayout: React.FC<{ article: Article }> = ({ article }) => (
  <>
    {/* コンテンツ */}
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {article.sections?.map((section, index) => (
        <div key={index} style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '20px',
              fontFamily: fonts.heading,
              color: colors.text,
            }}
          >
            {section.title}
          </h2>
          {section.content.map((paragraph, pIndex) => (
            <p
              key={pIndex}
              style={{
                fontSize: '15px',
                lineHeight: 1.8,
                color: colors.textMuted,
                marginBottom: '16px',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </div>
  </>
);

// 視点記事レイアウト（デザイナーの視点）
const PerspectiveArticleLayout: React.FC<{ article: Article }> = ({ article }) => (
  <>
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* セクション1: 何が起きているのか */}
      <div
        style={{
          marginBottom: '48px',
          padding: '32px',
          backgroundColor: colors.bgMuted,
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: colors.perspectives,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}
          >
            1
          </div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: fonts.heading,
            }}
          >
            何が起きているのか
          </h2>
        </div>
        {article.perspectiveSections?.whatHappening.map((text, i) => (
          <p
            key={i}
            style={{
              fontSize: '15px',
              lineHeight: 1.8,
              color: colors.textMuted,
              marginBottom: '12px',
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* セクション2: BONOの見解 */}
      <div
        style={{
          marginBottom: '48px',
          padding: '32px',
          backgroundColor: colors.bgCard,
          border: `2px solid ${colors.accent}`,
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: colors.accent,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            2
          </div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: fonts.heading,
            }}
          >
            BONOの見解
          </h2>
        </div>
        {article.perspectiveSections?.bonoView.map((text, i) => (
          <p
            key={i}
            style={{
              fontSize: '15px',
              lineHeight: 1.8,
              color: colors.text,
              marginBottom: '12px',
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* セクション3: だから今、何を身につけるべきか */}
      <div
        style={{
          marginBottom: '48px',
          padding: '32px',
          backgroundColor: colors.career,
          borderRadius: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: colors.text,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            3
          </div>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              fontFamily: fonts.heading,
            }}
          >
            だから今、何を身につけるべきか
          </h2>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {article.perspectiveSections?.whatToLearn.map((text, i) => (
            <li
              key={i}
              style={{
                fontSize: '15px',
                lineHeight: 1.8,
                color: colors.text,
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </>
);

// 出発点記事レイアウト
const StartingArticleLayout: React.FC<{ article: Article }> = ({ article }) => (
  <>
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* ヘッドライン */}
      <div
        style={{
          marginBottom: '48px',
          padding: '32px',
          backgroundColor: colors.starting,
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: fonts.heading,
            marginBottom: '8px',
          }}
        >
          「{article.headline}」
        </p>
        <p
          style={{
            fontSize: '15px',
            color: colors.textMuted,
          }}
        >
          あなたの悩みに、BONOが応えます
        </p>
      </div>

      {/* 提供するもの */}
      <div style={{ marginBottom: '48px' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '24px',
            fontFamily: fonts.heading,
          }}
        >
          BONOが提供すること
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {article.offers?.map((offer, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                marginBottom: '12px',
                fontSize: '15px',
              }}
            >
              <Check size={20} style={{ color: colors.accent }} />
              {offer}
            </li>
          ))}
        </ul>
      </div>

      {/* 次のステップ */}
      <div style={{ marginBottom: '48px' }}>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '24px',
            fontFamily: fonts.heading,
          }}
        >
          次のステップ
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {article.nextSteps?.map((step, i) => (
            <Link
              key={i}
              to={step.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px',
                backgroundColor: i === 0 ? colors.text : colors.bgCard,
                color: i === 0 ? '#fff' : colors.text,
                border: i === 0 ? 'none' : `1px solid ${colors.border}`,
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              {step.title}
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  </>
);

// ============================================
// メインコンポーネント
// ============================================

const GuideDetailPatternF = () => {
  const { slug, subslug } = useParams();
  const fullSlug = subslug ? `${slug}/${subslug}` : slug || '';
  const article = articles[fullSlug];

  if (!article) {
    return (
      <Layout>
        <div
          style={{
            minHeight: 'calc(100vh - 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              記事が見つかりません
            </h1>
            <p style={{ color: colors.textMuted, marginBottom: '24px' }}>
              slug: {fullSlug}
            </p>
            <Link
              to={`${DEV_BASE}/guide-pattern-f`}
              style={{
                color: colors.accent,
                textDecoration: 'underline',
              }}
            >
              ガイドトップに戻る
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ヘッダー */}
      <header
          style={{
            padding: '60px 24px 40px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* パンくず */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: colors.textMuted,
              marginBottom: '24px',
            }}
          >
            <Link
              to={`${DEV_BASE}/guide-pattern-f`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: colors.textMuted,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              ガイド
            </Link>
            <ChevronRight size={14} />
            <span>{article.category}</span>
          </div>

          {/* カテゴリタグ */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor:
                article.type === 'career'
                  ? colors.career
                  : article.type === 'perspective'
                  ? colors.perspectives
                  : colors.starting,
              borderRadius: '100px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <span>{article.categoryEmoji}</span>
            {article.category}
          </div>

          {/* タイトル */}
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '16px',
              fontFamily: fonts.heading,
              maxWidth: '720px',
            }}
          >
            {article.title}
          </h1>

          {/* メタ情報 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: colors.textMuted,
              fontSize: '14px',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={16} />
              {article.readTime}で読める
            </span>
          </div>
        </header>

        {/* コンテンツ */}
        <main
          style={{
            padding: '0 24px 80px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {article.type === 'career' && <CareerArticleLayout article={article} />}
          {article.type === 'perspective' && (
            <PerspectiveArticleLayout article={article} />
          )}
          {article.type === 'starting' && <StartingArticleLayout article={article} />}
        </main>

        {/* フッターCTA */}
        <footer
          style={{
            padding: '60px 24px 80px',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: '20px',
              padding: '40px',
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '12px',
                fontFamily: fonts.heading,
              }}
            >
              実際に学び始めよう
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: colors.textMuted,
                marginBottom: '24px',
              }}
            >
              ガイドで理解したら、ロードマップで実践的に学習を進めましょう
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/roadmaps"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  backgroundColor: colors.text,
                  color: '#fff',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                ロードマップを見る
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  backgroundColor: colors.bgMuted,
                  color: colors.text,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                BONOをはじめる
              </Link>
            </div>
          </div>
        </footer>
    </Layout>
  );
};

export default GuideDetailPatternF;
