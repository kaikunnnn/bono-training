/**
 * Pattern F: 3つのニーズに訴求するトップページ
 * TOP-PAGE.md の構成を使って、コンテンツを訴求
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Layout as LayoutIcon, Users, MessageSquare, Sparkles } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useLessons } from '@/hooks/useLessons';
import { careerChangeRoadmap } from '@/data/roadmaps';

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
  // ニーズ別カラー
  needsA: '#E8F5E9', // 未経験（緑）
  needsB: '#E3F2FD', // Webから（青）
  needsC: '#FFF3E0', // 現職（オレンジ）
};

const fonts = {
  heading: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
  body: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
};

// ============================================
// セクション2: ニーズ別入口 設定
// ============================================
const needsBlocksConfig = [
  {
    id: 'beginner',
    title: '未経験からUIUXデザイナーへ',
    subtitle: '何からはじめればいいかわからない方へ',
    description: 'デザイン未経験でも、転職実績のある道を一歩ずつ進める。BONOで転職を実現したメンバーの学習コンテンツ。',
    moreLink: `${DEV_BASE}/guide-pattern-f/from-zero`,
    moreLinkText: 'はじめての方へ →',
    bgColor: colors.needsA,
    // 最初のカード: ロードマップ
    roadmap: {
      slug: 'career-change',
      title: careerChangeRoadmap.title,
      type: 'ロードマップ',
      description: careerChangeRoadmap.stats.duration + 'で転職を目指す学習ステップ',
      cta: '詳しく見る',
    },
    // 残りのカード: レッスン（slugで指定）
    lessonSlugs: ['figmabeginner', 'uidesignbeginner'],
  },
  {
    id: 'web-designer',
    title: 'WebデザイナーからUIUXへ',
    subtitle: 'WebとUIUXって何が違うの？',
    description: 'Webデザインの経験を活かして、最短でUIUXに転向。違いを理解して必要なスキルを身につける。',
    moreLink: `${DEV_BASE}/guide-pattern-f/from-webdesigner`,
    moreLinkText: 'Webからの転向ガイド →',
    bgColor: colors.needsB,
    roadmap: null,
    // 情報設計・UX系のレッスン
    lessonSlugs: ['ooui', 'ui-layout-basic', 'ux-beginner-2'],
  },
  {
    id: 'junior',
    title: '現場で使えるスキルを身につける',
    subtitle: '自己流でやってるのが不安',
    description: 'UIUXの仕事をしているけど、プロの根拠あるやり方を学びたい。実務で使える設計思考を身につける。',
    moreLink: `${DEV_BASE}/guide-pattern-f/for-junior`,
    moreLinkText: '現職デザイナー向け →',
    bgColor: colors.needsC,
    roadmap: null,
    // 実践系のレッスン
    lessonSlugs: ['ux-biginner', 'zerokara-userinterview', 'ui-architect-beginner'],
  },
];

// ============================================
// セクション3: 学べること カテゴリ定義
// ============================================
const skillCategoryConfig = [
  {
    id: 'ui-visual',
    icon: '🎨',
    title: 'UIビジュアル',
    description: '見た目の基本を作る',
    categoryFilter: 'UI',
  },
  {
    id: 'ia',
    icon: '📐',
    title: '情報設計',
    description: '使いやすさを設計する',
    categoryFilter: '情報設計',
  },
  {
    id: 'ux',
    icon: '🧠',
    title: 'UXデザイン',
    description: '顧客理解と課題解決',
    categoryFilter: 'UX',
  },
];

// ============================================
// セクション4: アウトプット データ
// ============================================
const outputs = [
  {
    id: 'output-1',
    title: '音声SNSのUIデザイン',
    category: 'UIデザイン',
    badge: '🌱 未経験',
    badgeColor: colors.needsA,
  },
  {
    id: 'output-2',
    title: 'SaaS管理画面の情報設計',
    category: '情報設計',
    badge: '🔀 Webから',
    badgeColor: colors.needsB,
  },
  {
    id: 'output-3',
    title: '出張申請サービスのUXリデザイン',
    category: 'UXデザイン',
    badge: '🚀 現職',
    badgeColor: colors.needsC,
  },
];

// ============================================
// セクション5: 特徴 データ
// ============================================
const features = [
  {
    id: 'feature-1',
    number: '01',
    title: '実務で使える「3つの基礎」を体系的に',
    description: 'スクールにはない、転職実績のあるUIUXデザイン特化のカリキュラム',
    icon: <LayoutIcon size={24} />,
  },
  {
    id: 'feature-2',
    number: '02',
    title: 'プロからのフィードバック',
    description: '作って終わりにしない。現役デザイナーが添削・相談に対応',
    icon: <MessageSquare size={24} />,
  },
  {
    id: 'feature-3',
    number: '03',
    title: '仲間がいるコミュニティ',
    description: '学習の孤独を解消。同じ目標を持つ人と一緒に学べる',
    icon: <Users size={24} />,
  },
];

// ============================================
// セクション6: 料金プラン データ
// ============================================
const plans = [
  {
    id: 'standard',
    name: 'スタンダード',
    price: '¥980',
    period: '/月',
    features: ['解説動画', 'コミュニティ', '質問/相談'],
    recommended: false,
  },
  {
    id: 'feedback',
    name: 'フィードバック',
    price: '¥2,980',
    period: '/月',
    features: ['解説動画', 'コミュニティ', '質問/相談', 'フィードバック', '添削', 'キャリア相談'],
    recommended: true,
  },
];

// ============================================
// コンポーネント
// ============================================

const TopPagePatternF = () => {
  const { data: lessons, isLoading } = useLessons();

  // セクション2: ニーズ別ブロックにレッスンデータを紐付け
  const needsBlocks = useMemo(() => {
    if (!lessons || lessons.length === 0) {
      return needsBlocksConfig.map((block) => ({
        ...block,
        lessonsData: [],
      }));
    }
    return needsBlocksConfig.map((block) => {
      const lessonsData = block.lessonSlugs
        .map((slug) => lessons.find((l) => l.slug.current === slug))
        .filter(Boolean);
      return {
        ...block,
        lessonsData,
      };
    });
  }, [lessons]);

  // カテゴリ別にレッスンをグループ化（各カテゴリ最大3件）
  const skillCategories = useMemo(() => {
    if (!lessons || lessons.length === 0) {
      return skillCategoryConfig.map((category) => ({
        ...category,
        lessons: [],
      }));
    }
    return skillCategoryConfig.map((category) => {
      const filteredLessons = lessons
        .filter((lesson) => lesson.categoryTitle === category.categoryFilter)
        .slice(0, 3);
      return {
        ...category,
        lessons: filteredLessons,
      };
    });
  }, [lessons]);

  return (
    <Layout>
      <div style={{ overflow: 'hidden' }}>
        {/* ===== セクション1: ヒーロー ===== */}
        <section
          style={{
            position: 'relative',
            padding: '100px 24px 120px',
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          {/* 背景グラデーション */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              right: '-100%',
              height: '100%',
              background: 'linear-gradient(180deg, #e0e5f8 0%, #faf4f0 50%, #F9F9F7 100%)',
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* メインコピー */}
            <h1
              style={{
                fontSize: 'clamp(36px, 6vw, 56px)',
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: '24px',
                fontFamily: fonts.heading,
              }}
            >
              UIUXデザインの力で、
              <br />
              作る人から、創る人へ。
            </h1>

            {/* サブコピー */}
            <p
              style={{
                fontSize: '18px',
                color: colors.textMuted,
                lineHeight: 1.8,
                marginBottom: '40px',
                maxWidth: '600px',
                margin: '0 auto 40px',
              }}
            >
              未経験からの転職、Webからのキャリアアップ、現場で使える実践力。
              <br />
              プロと学べるUIUXデザインのオンラインコース。
            </p>

            {/* CTA */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/signup"
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
                BONOをはじめる
                <ArrowRight size={18} />
              </Link>
              <Link
                to={`${DEV_BASE}/guide-pattern-f`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  backgroundColor: colors.bgCard,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: fonts.body,
                }}
              >
                まずはガイドを読む
              </Link>
            </div>
          </div>
        </section>

        {/* ===== セクション2: ニーズ別入口 ===== */}
        {needsBlocks.map((block) => (
          <section
            key={block.id}
            style={{
              padding: '80px 24px',
              maxWidth: '1200px',
              margin: '0 auto',
            }}
          >
            {/* ヘッダー */}
            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: '8px',
                  fontFamily: fonts.heading,
                }}
              >
                {block.title}
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.textMuted,
                  marginBottom: '12px',
                }}
              >
                {block.subtitle}
              </p>
              <p
                style={{
                  fontSize: '15px',
                  color: colors.textMuted,
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  maxWidth: '600px',
                }}
              >
                {block.description}
              </p>
              <Link
                to={block.moreLink}
                style={{
                  fontSize: '14px',
                  color: colors.accent,
                  textDecoration: 'underline',
                }}
              >
                {block.moreLinkText}
              </Link>
            </div>

            {/* 3列コンテンツカード */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}
            >
              {/* ロードマップカード（存在する場合） */}
              {block.roadmap && (
                <Link
                  to={`/roadmaps/${block.roadmap.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      backgroundColor: colors.bgCard,
                      borderRadius: '16px',
                      border: `1px solid ${colors.border}`,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* サムネイル */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                        aspectRatio: '16/10',
                        borderRadius: '12px',
                        margin: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: '32px' }}>🗺️</span>
                    </div>

                    {/* コンテンツ */}
                    <div
                      style={{
                        padding: '0 16px 16px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: colors.accent,
                          marginBottom: '8px',
                          fontWeight: 600,
                        }}
                      >
                        {block.roadmap.type}
                      </p>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          marginBottom: '8px',
                          fontFamily: fonts.heading,
                        }}
                      >
                        {block.roadmap.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: colors.textMuted,
                          lineHeight: 1.5,
                          marginBottom: '16px',
                          flex: 1,
                        }}
                      >
                        {block.roadmap.description}
                      </p>

                      {/* CTAボタン */}
                      <div
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: colors.text,
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontFamily: fonts.body,
                        }}
                      >
                        {block.roadmap.cta}
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* レッスンカード */}
              {block.lessonsData.map((lesson: any) => (
                <Link
                  key={lesson._id}
                  to={`/lessons/${lesson.slug.current}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      backgroundColor: colors.bgCard,
                      borderRadius: '16px',
                      border: `1px solid ${colors.border}`,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* サムネイル（iconImage中央配置） */}
                    <div
                      style={{
                        backgroundColor: colors.bgMuted,
                        aspectRatio: '16/10',
                        borderRadius: '12px',
                        margin: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {lesson.iconImageUrl ? (
                        <img
                          src={lesson.iconImageUrl}
                          alt={lesson.title}
                          style={{
                            maxWidth: '60%',
                            maxHeight: '70%',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: colors.bgPlaceholder,
                            borderRadius: '8px',
                          }}
                        />
                      )}
                    </div>

                    {/* コンテンツ */}
                    <div
                      style={{
                        padding: '0 16px 16px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: colors.textMuted,
                          marginBottom: '8px',
                        }}
                      >
                        {lesson.categoryTitle || 'コース'}
                      </p>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          marginBottom: '8px',
                          fontFamily: fonts.heading,
                        }}
                      >
                        {lesson.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '13px',
                          color: colors.textMuted,
                          lineHeight: 1.5,
                          marginBottom: '16px',
                          flex: 1,
                        }}
                      >
                        {lesson.description || ''}
                      </p>

                      {/* CTAボタン */}
                      <div
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: colors.text,
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontFamily: fonts.body,
                        }}
                      >
                        コースを見る
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* ===== セクション3: BONOで学べること ===== */}
        <section
          style={{
            padding: '80px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '16px',
              fontFamily: fonts.heading,
              textAlign: 'center',
            }}
          >
            BONOで身につく力
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: colors.textMuted,
              marginBottom: '48px',
              textAlign: 'center',
            }}
          >
            UIUXデザインに必要な3つの基礎を体系的に学べます
          </p>

          {/* カテゴリ別コース */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '48px',
            }}
          >
            {skillCategories.map((category) => (
              <div key={category.id}>
                {/* カテゴリヘッダー */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{category.icon}</span>
                  <div>
                    <h3
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        fontFamily: fonts.heading,
                      }}
                    >
                      {category.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: colors.textMuted,
                      }}
                    >
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* コースカード */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                  }}
                >
                  {category.lessons.length > 0 ? (
                    category.lessons.map((lesson) => (
                      <Link
                        key={lesson._id}
                        to={`/lessons/${lesson.slug.current}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div
                          style={{
                            backgroundColor: colors.bgCard,
                            borderRadius: '12px',
                            border: `1px solid ${colors.border}`,
                            overflow: 'hidden',
                            transition: 'box-shadow 0.2s, transform 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'none';
                          }}
                        >
                          {/* サムネイル（iconImage中央配置） */}
                          <div
                            style={{
                              backgroundColor: colors.bgMuted,
                              aspectRatio: '16/9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {lesson.iconImageUrl ? (
                              <img
                                src={lesson.iconImageUrl}
                                alt={lesson.title}
                                style={{
                                  maxWidth: '60%',
                                  maxHeight: '70%',
                                  objectFit: 'contain',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  backgroundColor: colors.bgPlaceholder,
                                  borderRadius: '8px',
                                }}
                              />
                            )}
                          </div>
                          {/* コンテンツ */}
                          <div style={{ padding: '16px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '11px',
                                  padding: '2px 8px',
                                  backgroundColor: colors.bgMuted,
                                  borderRadius: '4px',
                                  color: colors.textMuted,
                                }}
                              >
                                {lesson.categoryTitle}
                              </span>
                              {lesson.isPremium && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    backgroundColor: '#FEF3C7',
                                    borderRadius: '4px',
                                    color: '#92400E',
                                  }}
                                >
                                  Premium
                                </span>
                              )}
                            </div>
                            <h4
                              style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                fontFamily: fonts.heading,
                                lineHeight: 1.4,
                              }}
                            >
                              {lesson.title}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    // ローディング中のプレースホルダー
                    [...Array(3)].map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: colors.bgCard,
                          borderRadius: '12px',
                          border: `1px solid ${colors.border}`,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: colors.bgPlaceholder,
                            aspectRatio: '16/9',
                          }}
                        />
                        <div style={{ padding: '16px' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '16px',
                              backgroundColor: colors.bgPlaceholder,
                              borderRadius: '4px',
                              marginBottom: '8px',
                            }}
                          />
                          <div
                            style={{
                              width: '100%',
                              height: '20px',
                              backgroundColor: colors.bgPlaceholder,
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link
              to="/lessons"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: colors.accent,
                textDecoration: 'underline',
              }}
            >
              コース一覧を見る
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ===== セクション4: BONOメンバーのアウトプット ===== */}
        <section
          style={{
            padding: '80px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '16px',
              fontFamily: fonts.heading,
              textAlign: 'center',
            }}
          >
            BONOメンバーのデザイン
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: colors.textMuted,
              marginBottom: '48px',
              textAlign: 'center',
            }}
          >
            未経験の人も、現場のデザイナーも、根拠のあるUIUXデザインを身につけています
          </p>

          {/* アウトプットカード */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            {outputs.map((output) => (
              <div
                key={output.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* サムネイル */}
                <div
                  style={{
                    backgroundColor: colors.bgPlaceholder,
                    borderRadius: '16px',
                    aspectRatio: '4/3',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      color: colors.textMuted,
                      textAlign: 'center',
                    }}
                  >
                    作品画像
                  </span>
                </div>

                {/* カテゴリ */}
                <p
                  style={{
                    fontSize: '12px',
                    color: colors.accent,
                    marginBottom: '4px',
                  }}
                >
                  {output.category}
                </p>

                {/* タイトル */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    fontFamily: fonts.heading,
                  }}
                >
                  {output.title}
                </h3>

                {/* バッジ */}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    backgroundColor: output.badgeColor,
                    borderRadius: '100px',
                    fontSize: '12px',
                    fontWeight: 500,
                    alignSelf: 'flex-start',
                  }}
                >
                  {output.badge}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link
              to="/outputs"
              style={{
                fontSize: '14px',
                color: colors.accent,
                textDecoration: 'underline',
              }}
            >
              メンバーのアウトプットをもっと見る →
            </Link>
          </div>
        </section>

        {/* ===== セクション5: BONOの特徴 ===== */}
        <section
          style={{
            padding: '80px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '48px',
              fontFamily: fonts.heading,
              textAlign: 'center',
            }}
          >
            なぜBONOなのか
          </h2>

          {/* 特徴カード */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.id}
                style={{
                  backgroundColor: colors.bgCard,
                  borderRadius: '20px',
                  padding: '32px',
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '24px',
                }}
              >
                {/* 番号 */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: colors.bgMuted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: colors.accent,
                  }}
                >
                  {feature.icon}
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      fontFamily: fonts.heading,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: colors.textMuted,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== セクション6: 料金・CTA ===== */}
        <section
          style={{
            padding: '80px 24px 120px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '16px',
              fontFamily: fonts.heading,
              textAlign: 'center',
            }}
          >
            まずは始めてみよう
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: colors.textMuted,
              marginBottom: '48px',
              textAlign: 'center',
            }}
          >
            あなたに合ったプランを選んでください
          </p>

          {/* プランカード */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  backgroundColor: colors.bgCard,
                  borderRadius: '20px',
                  padding: '40px 32px',
                  border: plan.recommended
                    ? `2px solid ${colors.accent}`
                    : `1px solid ${colors.border}`,
                  position: 'relative',
                }}
              >
                {/* おすすめバッジ */}
                {plan.recommended && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      padding: '6px 16px',
                      backgroundColor: colors.accent,
                      color: '#fff',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    おすすめ
                  </div>
                )}

                {/* プラン名 */}
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '16px',
                    fontFamily: fonts.heading,
                    textAlign: 'center',
                  }}
                >
                  {plan.name}
                </h3>

                {/* 価格 */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <span
                    style={{
                      fontSize: '36px',
                      fontWeight: 700,
                      fontFamily: fonts.heading,
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: colors.textMuted,
                    }}
                  >
                    {plan.period}
                  </span>
                </div>

                {/* 機能リスト */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 32px 0',
                  }}
                >
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      style={{
                        fontSize: '14px',
                        color: colors.text,
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Check size={16} style={{ color: colors.accent }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTAボタン */}
                <Link
                  to="/signup"
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '14px',
                    backgroundColor: plan.recommended ? colors.text : colors.bgMuted,
                    color: plan.recommended ? '#fff' : colors.text,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontFamily: fonts.body,
                  }}
                >
                  はじめる
                </Link>
              </div>
            ))}
          </div>

          {/* 詳細リンク */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link
              to="/subscription"
              style={{
                fontSize: '14px',
                color: colors.accent,
                textDecoration: 'underline',
              }}
            >
              料金プランの詳細を見る →
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default TopPagePatternF;
