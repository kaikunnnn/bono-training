/**
 * Pattern G: ロードマップ＋ガイド記事を中心としたトップページ
 * 3つのニーズ別セクションで、ロードマップとガイド記事を訴求
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Map, BookOpen, FileText, Users, MessageSquare, Layout as LayoutIcon } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { careerChangeRoadmap } from '@/data/roadmaps';

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
  needsA: '#E8F5E9',
  needsB: '#E3F2FD',
  needsC: '#FFF3E0',
};

const fonts = {
  heading: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
  body: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
};

// ============================================
// セクション2: ニーズ別入口 データ
// ============================================
const needsBlocks = [
  {
    id: 'beginner',
    title: '未経験からUIUXデザイナーへ',
    subtitle: '何からはじめればいいかわからない方へ',
    description: 'デザイン未経験でも、転職実績のある道を一歩ずつ進める。',
    bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    contents: [
      {
        type: 'roadmap',
        slug: 'career-change',
        title: careerChangeRoadmap.title,
        description: `${careerChangeRoadmap.stats.stepsCount}ステップ・${careerChangeRoadmap.stats.duration}で転職を目指す`,
        icon: '🗺️',
        link: '/roadmaps/career-change',
        badge: 'ロードマップ',
        badgeColor: '#10B981',
      },
      {
        type: 'guide',
        slug: 'what-is-uiux',
        title: 'UI/UXデザイナーとは',
        description: 'UIUXの定義、Webデザインとの違い、仕事内容',
        icon: '📋',
        link: '/guide/what-is-uiux',
        badge: 'ガイド記事',
        badgeColor: '#6B7280',
      },
      {
        type: 'guide',
        slug: 'skills-requirements',
        title: '必要なスキルと条件',
        description: '3つの基礎スキル、学習期間の目安',
        icon: '🎯',
        link: '/guide/skills-requirements',
        badge: 'ガイド記事',
        badgeColor: '#6B7280',
      },
    ],
  },
  {
    id: 'web-designer',
    title: 'WebデザイナーからUIUXへ',
    subtitle: 'WebとUIUXって何が違うの？',
    description: 'Webデザインの経験を活かして、最短でUIUXに転向。',
    bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    contents: [
      {
        type: 'guide',
        slug: 'from-webdesigner',
        title: 'Webからの転向ガイド',
        description: '経験を活かして最短でUIUXへキャリアアップ',
        icon: '🔀',
        link: '/guide/from-webdesigner',
        badge: '出発点ガイド',
        badgeColor: '#3B82F6',
      },
      {
        type: 'guide',
        slug: 'what-is-uiux',
        title: 'WebとUIUXの違い',
        description: '仕事内容・スキル・キャリアパスの違い',
        icon: '📊',
        link: '/guide/what-is-uiux',
        badge: 'ガイド記事',
        badgeColor: '#6B7280',
      },
      {
        type: 'guide',
        slug: 'portfolio',
        title: 'ポートフォリオの作り方',
        description: '転職に必要なポートフォリオの構成と実例',
        icon: '🎨',
        link: '/guide/portfolio',
        badge: 'ガイド記事',
        badgeColor: '#6B7280',
      },
    ],
  },
  {
    id: 'junior',
    title: '現場で使えるスキルを身につける',
    subtitle: '自己流でやってるのが不安',
    description: 'プロの根拠あるやり方を学んで、実務力を高める。',
    bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    contents: [
      {
        type: 'guide',
        slug: 'for-junior',
        title: 'ジュニアデザイナー向けガイド',
        description: '現職での不安を解消し、次のステップへ',
        icon: '🚀',
        link: '/guide/for-junior',
        badge: '出発点ガイド',
        badgeColor: '#F59E0B',
      },
      {
        type: 'guide',
        slug: 'perspectives/experience-design',
        title: '「UIを作る」から「体験を設計する」へ',
        description: 'これから求められるデザイナーの役割',
        icon: '💡',
        link: '/guide/perspectives/experience-design',
        badge: 'デザイナーの視点',
        badgeColor: '#8B5CF6',
      },
      {
        type: 'guide',
        slug: 'case-study-writing',
        title: '採用担当に響くケーススタディ',
        description: 'プロセスの見せ方、思考の言語化',
        icon: '📝',
        link: '/guide/case-study-writing',
        badge: 'ガイド記事',
        badgeColor: '#6B7280',
      },
    ],
  },
];

// ============================================
// セクション5: 特徴 データ
// ============================================
const features = [
  {
    id: 'feature-1',
    title: '実務で使える「3つの基礎」を体系的に',
    description: 'スクールにはない、転職実績のあるUIUXデザイン特化のカリキュラム',
    icon: <LayoutIcon size={24} />,
  },
  {
    id: 'feature-2',
    title: 'プロからのフィードバック',
    description: '作って終わりにしない。現役デザイナーが添削・相談に対応',
    icon: <MessageSquare size={24} />,
  },
  {
    id: 'feature-3',
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

const TopPagePatternG = () => {
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
              あなたの状況に合わせて、最適な学習を始めよう。
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
                to="/guide"
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
                  marginBottom: '8px',
                }}
              >
                {block.subtitle}
              </p>
              <p
                style={{
                  fontSize: '15px',
                  color: colors.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {block.description}
              </p>
            </div>

            {/* コンテンツカード */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
              }}
            >
              {block.contents.map((content, idx) => (
                <Link
                  key={idx}
                  to={content.link}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      backgroundColor: colors.bgCard,
                      borderRadius: '16px',
                      border: `1px solid ${colors.border}`,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* サムネイル */}
                    <div
                      style={{
                        background: content.type === 'roadmap' ? block.bgGradient : colors.bgMuted,
                        aspectRatio: '16/10',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '48px' }}>{content.icon}</span>

                      {/* バッジ */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          padding: '4px 10px',
                          backgroundColor: content.type === 'roadmap' ? 'rgba(255,255,255,0.9)' : colors.bgCard,
                          borderRadius: '100px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: content.badgeColor,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        {content.badge}
                      </span>
                    </div>

                    {/* コンテンツ */}
                    <div
                      style={{
                        padding: '20px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          lineHeight: 1.4,
                          marginBottom: '8px',
                          fontFamily: fonts.heading,
                        }}
                      >
                        {content.title}
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
                        {content.description}
                      </p>

                      {/* CTA */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: colors.accent,
                          fontSize: '14px',
                          fontWeight: 600,
                        }}
                      >
                        {content.type === 'roadmap' ? 'ロードマップを見る' : '記事を読む'}
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* ===== セクション3: ガイド記事一覧へのリンク ===== */}
        <section
          style={{
            padding: '60px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              backgroundColor: colors.bgMuted,
              borderRadius: '24px',
              padding: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '32px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <BookOpen size={28} style={{ color: colors.accent }} />
                <h2
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    fontFamily: fonts.heading,
                  }}
                >
                  ガイド記事をもっと見る
                </h2>
              </div>
              <p
                style={{
                  fontSize: '15px',
                  color: colors.textMuted,
                  lineHeight: 1.6,
                }}
              >
                UIUX転職、勉強法、ポートフォリオ、デザイナーの視点など、
                <br />
                キャリアに役立つガイド記事を多数公開中。
              </p>
            </div>
            <Link
              to="/guide"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                backgroundColor: colors.text,
                color: '#fff',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              ガイド一覧へ
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* ===== セクション4: BONOの特徴 ===== */}
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

        {/* ===== セクション5: 料金・CTA ===== */}
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

export default TopPagePatternG;
