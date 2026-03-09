/**
 * Guide Hub Pattern F
 * GUIDE-PAGE.md の構成をPattern Eスタイルで実装
 *
 * URL構造:
 * /dev/guide-pattern-f/ - ハブページ
 * /dev/guide-pattern-f/:slug - 詳細ページ
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  BookOpen,
  Telescope,
  Users,
  Compass,
  HelpCircle,
  Briefcase,
  Target,
  FileText,
  TrendingUp,
  Sparkles,
  Bot,
  Layers,
  Lightbulb,
  Clock
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
  // カテゴリカラー
  career: '#E8F5E9',
  perspectives: '#E3F2FD',
  stories: '#FFF3E0',
  starting: '#F3E8FF',
  faq: '#FCE4EC',
};

const fonts = {
  heading: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
  body: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
};

// ============================================
// カテゴリ定義
// ============================================
const categories = [
  {
    id: 'career',
    emoji: '📋',
    label: 'UIUX転職',
    description: 'UIUXデザイナーになるための基礎知識',
    color: colors.career,
    icon: <BookOpen size={20} />,
  },
  {
    id: 'perspectives',
    emoji: '🔭',
    label: 'デザイナーの視点',
    description: '業界の変化とBONOの見解',
    color: colors.perspectives,
    icon: <Telescope size={20} />,
  },
  {
    id: 'stories',
    emoji: '👤',
    label: '転職ストーリー',
    description: '転職成功者のインタビュー',
    color: colors.stories,
    icon: <Users size={20} />,
  },
  {
    id: 'starting',
    emoji: '🔀',
    label: 'あなたの出発点',
    description: '今の状況に合ったガイド',
    color: colors.starting,
    icon: <Compass size={20} />,
  },
  {
    id: 'faq',
    emoji: '❓',
    label: 'FAQ',
    description: 'よくある質問',
    color: colors.faq,
    icon: <HelpCircle size={20} />,
  },
];

// ============================================
// キャリアの基本 - 記事データ
// ============================================
const careerArticles = [
  {
    id: 'what-is-uiux',
    slug: 'what-is-uiux',
    title: 'UI/UXデザイナーとは',
    description: 'UI/UXデザインの定義、Webデザインとの違い、仕事内容の具体例、市場動向',
    icon: <Briefcase size={32} />,
    readTime: '10分',
    thumbnailColor: '#E8F5E9', // 薄い緑
  },
  {
    id: 'skills-requirements',
    slug: 'skills-requirements',
    title: '必要なスキルと条件',
    description: '3つの基礎（UIビジュアル/情報設計/UXデザイン）、スキルレベルの目安、学習期間',
    icon: <Target size={32} />,
    readTime: '15分',
    thumbnailColor: '#E0F2F1', // ティール系
  },
  {
    id: 'portfolio',
    slug: 'portfolio',
    title: 'ポートフォリオの作り方',
    description: 'ポートフォリオが必要な理由、掲載すべき内容、転職成功者の実例',
    icon: <FileText size={32} />,
    readTime: '12分',
    thumbnailColor: '#F3E5F5', // 紫系
  },
  {
    id: 'job-search',
    slug: 'job-search',
    title: '会社選び・面接対策',
    description: '事業会社vs制作会社、探し方ガイド、面接で見られるポイント',
    icon: <Briefcase size={32} />,
    readTime: '10分',
    thumbnailColor: '#FFF3E0', // オレンジ系
  },
  {
    id: 'career-path',
    slug: 'career-path',
    title: '年収・キャリアパス',
    description: '未経験入社の年収レンジ、キャリアステップ、フリーランスという選択肢',
    icon: <TrendingUp size={32} />,
    readTime: '8分',
    thumbnailColor: '#E3F2FD', // 青系
  },
];

// ============================================
// デザイナーの視点 - 記事データ
// ============================================
const perspectiveArticles = [
  {
    id: 'ai-and-designer',
    slug: 'perspectives/ai-and-designer',
    title: 'AI時代のUIUXデザイナーの本当の役割とは',
    description: '「AIで仕事なくなる？」という不安に対するBONOの見解',
    icon: <Bot size={32} />,
    readTime: '8分',
    tag: 'AI時代',
    thumbnailColor: '#E1F5FE',
  },
  {
    id: 'saas-ui-future',
    slug: 'perspectives/saas-ui-future',
    title: 'SaaSのUIは本当に無くなるのか？',
    description: '「SaaSがAIに置き換わる？」という疑問への回答',
    icon: <Layers size={32} />,
    readTime: '7分',
    tag: 'AI時代',
    thumbnailColor: '#F3E5F5',
  },
  {
    id: 'ux-in-ai-era',
    slug: 'perspectives/ux-in-ai-era',
    title: 'AIプロダクトにおけるUXデザインの重要性',
    description: '「AIの時代にUXって必要？」への答え',
    icon: <Sparkles size={32} />,
    readTime: '10分',
    tag: 'AI時代',
    thumbnailColor: '#FFF8E1',
  },
  {
    id: 'experience-design',
    slug: 'perspectives/experience-design',
    title: '「UIを作る」から「体験を設計する」へ',
    description: 'UIデザイナーの定義の変化と、これから求められること',
    icon: <Lightbulb size={32} />,
    readTime: '9分',
    tag: 'キャリア',
    thumbnailColor: '#E0F7FA',
  },
  {
    id: 'worth-starting-now',
    slug: 'perspectives/worth-starting-now',
    title: '未経験から目指す価値は今もあるのか',
    description: '「今からでも間に合う？」という不安への正直な回答',
    icon: <Clock size={32} />,
    readTime: '6分',
    tag: 'キャリア',
    thumbnailColor: '#FBE9E7',
  },
];

// ============================================
// 出発点別ガイド - データ
// ============================================
const startingPoints = [
  {
    id: 'from-zero',
    slug: 'from-zero',
    emoji: '🌱',
    title: '完全未経験から',
    headline: '何からはじめればいいかわからない',
    description: 'デザイン経験ゼロからUIUXデザイナーを目指す方へ。転職実績のあるロードマップで一歩ずつ進めます。',
    color: colors.career,
  },
  {
    id: 'from-webdesigner',
    slug: 'from-webdesigner',
    emoji: '🔀',
    title: 'Webデザイナーから',
    headline: 'WebとUIUXって何が違うの？',
    description: 'Webデザインの経験を活かしてUIUXへ転向。違いを理解して最短で転向できます。',
    color: colors.perspectives,
  },
  {
    id: 'for-junior',
    slug: 'for-junior',
    emoji: '🚀',
    title: 'ジュニアデザイナー',
    headline: '自己流でやってるのが不安',
    description: '現職でUIUXをしているけど、プロの根拠あるやり方を身につけたい方へ。',
    color: colors.starting,
  },
];


// ============================================
// コンポーネント
// ============================================

const GuideHubPatternF = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // カテゴリが選択されているかチェックする関数
  const shouldShow = (categoryId: string) => {
    return !activeCategory || activeCategory === categoryId;
  };

  return (
    <Layout>
      <div style={{ overflow: 'hidden' }}>
        {/* ===== セクション1: ヒーロー ===== */}
        <section
          style={{
            position: 'relative',
            padding: '80px 24px 60px',
            margin: '8px',
            overflow: 'hidden',
            borderRadius: '16px',
          }}
        >
          {/* 背景グラデーション */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #e0e5f8 0%, #faf4f0 50%, #F9F9F7 100%)',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
            {/* パンくず */}
            <div
              style={{
                fontSize: '14px',
                color: colors.textMuted,
                marginBottom: '24px',
              }}
            >
              <Link
                to={`${DEV_BASE}/top-pattern-f`}
                style={{ color: colors.textMuted, textDecoration: 'none' }}
              >
                トップ
              </Link>
              <span style={{ margin: '0 8px' }}>/</span>
              <span>転職ガイド</span>
            </div>

            {/* タイトル */}
            <h1
              style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: '16px',
                fontFamily: fonts.heading,
              }}
            >
              ガイド
            </h1>

            {/* サブコピー */}
            <p
              style={{
                fontSize: '18px',
                color: colors.textMuted,
                lineHeight: 1.8,
                marginBottom: '32px',
                maxWidth: '600px',
              }}
            >
              デザインスキルを身につけるための道標。
              <br />
              あなたの抱える悩みや目的に合わせて、最適な学習ガイドを見つけられます。
            </p>

            {/* 定義 */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                fontSize: '14px',
              }}
            >
              <BookOpen size={18} style={{ color: colors.accent }} />
              <span>
                <strong>ガイド</strong> = 読んで理解するもの（記事+図解+視点）
              </span>
            </div>
          </div>
        </section>

        {/* ===== セクション2: カテゴリナビゲーション（タブUI） ===== */}
        <section
          style={{
            padding: '0 24px 60px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '16px',
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  backgroundColor: activeCategory === cat.id ? cat.color : 'transparent',
                  border: `1px solid ${activeCategory === cat.id ? colors.accent : 'transparent'}`,
                  borderRadius: '100px',
                  fontSize: '14px',
                  fontWeight: activeCategory === cat.id ? 600 : 500,
                  cursor: 'pointer',
                  fontFamily: fonts.body,
                  color: colors.text,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ===== セクション3: キャリアの基本 ===== */}
        {shouldShow('career') && (
          <section
            style={{
              padding: '60px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>📋</span>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                }}
              >
                UIUX転職
              </h2>
            </div>
            <p
              style={{
                fontSize: '15px',
                color: colors.textMuted,
                marginBottom: '32px',
              }}
            >
              UIUXデザイナーになるための基礎知識。まずはここから読み始めよう。
            </p>

            {/* 記事カード */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {careerArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/dev/guide-pattern-f/${article.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: colors.bgCard,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    textDecoration: 'none',
                    color: colors.text,
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* サムネイル */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      backgroundColor: colors.bgPlaceholder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.textMuted,
                      opacity: 1,
                    }}
                  >
                    {article.icon}
                  </div>

                  {/* コンテンツ */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        marginBottom: '12px',
                        fontFamily: fonts.heading,
                        lineHeight: 1.4,
                      }}
                    >
                      {article.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.textMuted,
                        lineHeight: 1.6,
                        marginBottom: '16px',
                        flex: 1,
                      }}
                    >
                      {article.description}
                    </p>
                    
                    {/* メタ情報 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          color: colors.textLight,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={14} />
                        {article.readTime}
                      </span>
                      <span style={{ 
                        fontSize: '13px', 
                        color: colors.accent,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        読む
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== セクション4: デザイナーの視点 ===== */}
        {shouldShow('perspectives') && (
          <section
            style={{
              padding: '60px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>🔭</span>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                }}
              >
                デザイナーの視点
              </h2>
            </div>
            <p
              style={{
                fontSize: '15px',
                color: colors.textMuted,
                marginBottom: '32px',
              }}
            >
              業界の変化に対するBONOの見解。不安を解消し、今何を学ぶべきかを明確に。
            </p>

            {/* 記事カード */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {perspectiveArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/dev/guide-pattern-f/${article.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: colors.bgCard,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    textDecoration: 'none',
                    color: colors.text,
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    height: '100%',
                  }}
                >
                  {/* サムネイル */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      backgroundColor: colors.bgPlaceholder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      color: colors.textMuted,
                    }}
                  >
                    {/* タグ (画像内に配置) */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '4px 10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: colors.text,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      }}
                    >
                      {article.tag}
                    </span>
                    
                    {article.icon}
                  </div>

                  {/* コンテンツ */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        marginBottom: '12px',
                        fontFamily: fonts.heading,
                        lineHeight: 1.4,
                      }}
                    >
                      {article.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.textMuted,
                        lineHeight: 1.6,
                        marginBottom: '16px',
                        flex: 1,
                      }}
                    >
                      {article.description}
                    </p>

                    {/* フッター */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          color: colors.textLight,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Clock size={14} />
                        {article.readTime}
                      </span>
                      <span style={{ 
                        fontSize: '13px', 
                        color: colors.accent,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        読む
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== セクション5: あなたの出発点 ===== */}
        {shouldShow('starting') && (
          <section
            style={{
              padding: '60px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>🔀</span>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                }}
              >
                あなたの出発点
              </h2>
            </div>
            <p
              style={{
                fontSize: '15px',
                color: colors.textMuted,
                marginBottom: '32px',
              }}
            >
              今の状況に合ったガイドを選ぼう。あなたの悩みに答えます。
            </p>

            {/* 出発点カード */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}
            >
              {startingPoints.map((point) => (
                <Link
                  key={point.id}
                  to={`/dev/guide-pattern-f/${point.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '32px 24px',
                    backgroundColor: colors.bgCard,
                    borderRadius: '20px',
                    border: `1px solid ${colors.border}`,
                    textDecoration: 'none',
                    color: colors.text,
                    transition: 'all 0.2s',
                  }}
                >
                  {/* 絵文字 */}
                  <span style={{ fontSize: '40px', marginBottom: '16px' }}>
                    {point.emoji}
                  </span>

                  {/* タイトル */}
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontFamily: fonts.heading,
                    }}
                  >
                    {point.title}
                  </h3>

                  {/* ヘッドライン（悩み） */}
                  <p
                    style={{
                      fontSize: '14px',
                      color: colors.accent,
                      marginBottom: '12px',
                      fontWeight: 500,
                    }}
                  >
                    「{point.headline}」
                  </p>

                  {/* 説明 */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: colors.textMuted,
                      lineHeight: 1.6,
                      marginBottom: '20px',
                      flex: 1,
                    }}
                  >
                    {point.description}
                  </p>

                  {/* CTA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: colors.accent,
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    このガイドを読む
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ===== セクション6: 転職ストーリー ===== */}
        {shouldShow('stories') && (
          <section
            style={{
              padding: '60px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>👤</span>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                }}
              >
                転職ストーリー
              </h2>
            </div>
            <p
              style={{
                fontSize: '15px',
                color: colors.textMuted,
                marginBottom: '32px',
              }}
            >
              BONOを使って転職に成功したメンバーのインタビュー
            </p>

            {/* ストーリーカード（プレースホルダー） */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
              }}
            >
              {[1, 2, 3].map((i) => (
                <Link
                  key={i}
                  to={`/dev/guide-pattern-f/stories`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: colors.bgCard,
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    textDecoration: 'none',
                    color: colors.text,
                    overflow: 'hidden',
                  }}
                >
                  {/* サムネイル */}
                  <div
                    style={{
                      backgroundColor: colors.bgPlaceholder,
                      aspectRatio: '16/9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: colors.textMuted }}>
                      インタビュー画像
                    </span>
                  </div>

                  {/* コンテンツ */}
                  <div style={{ padding: '20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        backgroundColor: colors.stories,
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 600,
                        marginBottom: '12px',
                      }}
                    >
                      {i === 1 ? '未経験から' : i === 2 ? 'Webから' : '異業種から'}
                    </span>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        fontFamily: fonts.heading,
                        lineHeight: 1.4,
                      }}
                    >
                      {i === 1
                        ? '保育士からUI/UXデザイナーへ転職'
                        : i === 2
                        ? 'WebデザイナーからUIUXへキャリアアップ'
                        : 'グラフィックからUI/UXへ転向'}
                    </h3>
                    <p
                      style={{
                        fontSize: '13px',
                        color: colors.textMuted,
                      }}
                    >
                      {i === 1 ? 'Alisaさん' : i === 2 ? 'りんねるさん' : 'おがわさん'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* もっと見る */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link
                to="/dev/guide-pattern-f/stories"
                style={{
                  fontSize: '14px',
                  color: colors.accent,
                  textDecoration: 'underline',
                }}
              >
                転職ストーリーをもっと見る →
              </Link>
            </div>
          </section>
        )}

        {/* ===== セクション8: FAQ ===== */}
        {shouldShow('faq') && (
          <section
            style={{
              padding: '60px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '24px' }}>❓</span>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: fonts.heading,
                }}
              >
                よくある質問
              </h2>
            </div>
            <div style={{ backgroundColor: colors.bgCard, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
              <p style={{ textAlign: 'center', color: colors.textMuted }}>準備中...</p>
            </div>
          </section>
        )}

        {/* ===== セクション7: CTA（ロードマップへ） ===== */}
        {/* 常時表示 */}
        <section
          style={{
            padding: '80px 24px 120px',
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: colors.bgCard,
              borderRadius: '24px',
              padding: '48px 40px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '16px',
                fontFamily: fonts.heading,
              }}
            >
              実際に学び始めよう
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: colors.textMuted,
                marginBottom: '32px',
                lineHeight: 1.6,
              }}
            >
              ガイドで全体像を理解したら、ロードマップで実践的に学習を進めましょう。
              <br />
              転職実績のあるカリキュラムで、一歩ずつ進めます。
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
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
                  padding: '16px 32px',
                  backgroundColor: colors.text,
                  color: '#fff',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: fonts.body,
                }}
              >
                ロードマップを見る
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  backgroundColor: colors.bgMuted,
                  color: colors.text,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: fonts.body,
                }}
              >
                BONOをはじめる
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default GuideHubPatternF;
