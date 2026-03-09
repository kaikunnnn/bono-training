/**
 * Pattern D: BONO Top Page Prototype
 * ダーク背景ベースのトップページプロトタイプ
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// カラーパレット
// ============================================
const colors = {
  bg: '#0a0a0a',
  bgCard: '#141414',
  bgCardHover: '#1a1a1a',
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textLight: 'rgba(255, 255, 255, 0.5)',
  accent: '#3b82f6',
  border: 'rgba(255, 255, 255, 0.1)',
};

// ============================================
// セクション1: アイキャッチ データ
// ============================================
const heroRoadmaps = [
  {
    id: 'career-change',
    label: 'UIデザイナー転職ロードマップ',
    title: 'UI/UXデザイナーになるロードマップ',
    bullets: [
      '転職実績のある学習ロードマップ!',
      'UI/UXの3つの基礎を身につけます',
      'ポートフォリオ作成がゴールです',
    ],
    ctaText: '転職ロードマップへ',
    link: '/roadmaps/career-change',
    bgColor: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)',
  },
  {
    id: 'ux-design',
    label: 'UXデザイン基礎コース',
    title: 'UXデザイン基礎コース',
    bullets: [
      '顧客理解から課題解決の基礎を身につけます',
      'プロダクトデザインに必須な価値デザインを習得',
    ],
    ctaText: 'コースを見る',
    link: '/roadmaps/ux-design',
    bgColor: 'linear-gradient(135deg, #2d1b4e 0%, #1a0a2e 100%)',
  },
  {
    id: 'information-architecture',
    label: '情報設計基礎',
    title: '情報設計基礎',
    bullets: [
      '使いやすいUIの設計力を身につける',
      '論理的な設計思考を習得',
      'OOUIとナビゲーション設計の基本',
    ],
    ctaText: 'コースを見る',
    link: '/roadmaps/information-architecture',
    bgColor: 'linear-gradient(135deg, #1e3a5f 0%, #0d2818 100%)',
  },
];

// ============================================
// セクション2: ガイドコンテンツ データ
// ============================================
const guideContents = [
  {
    id: 'guide-1',
    title: 'WebデザイナーからUIUXデザイナーに転向するには',
    link: '/guide/web-to-uiux',
    bgColor: '#2563eb',
  },
  {
    id: 'guide-2',
    title: '未経験からUIUXデザイナーになるには',
    link: '/guide/beginner-to-uiux',
    bgColor: '#7c3aed',
  },
  {
    id: 'guide-3',
    title: 'ポートフォリオのつくり方',
    link: '/guide/portfolio',
    bgColor: '#059669',
  },
];

// ============================================
// セクション3: 転職事例 データ
// ============================================
const careerCases = [
  {
    id: 'case-1',
    name: 'Alisa',
    title: '「逃げられない環境」で保育士からUI/UXデザイナーに',
    result: '未経験でUI/UX職へ転職',
    company: '制作会社',
    previousJob: '保育士・海外',
    link: 'https://youtube.com',
    ctaText: 'YouTubeで見る',
    bgColor: '#dc2626',
  },
  {
    id: 'case-2',
    name: 'りんねる',
    title: 'PR企業からUI/UXデザイナーへ未経験転職した話',
    result: '未経験でUI/UX職へ転職',
    company: '制作会社',
    previousJob: 'PR系の企業',
    link: 'https://youtube.com',
    ctaText: 'YouTubeで見る',
    bgColor: '#2563eb',
  },
  {
    id: 'case-3',
    name: 'おがわ',
    title: '「作った後が見えない」が転職の理由だった。グラフィックからUI/UXに転職した話',
    result: 'UI/UX職へ転職',
    company: '事業会社',
    previousJob: 'グラフィックデザイナー',
    link: '/interviews/ogawa',
    ctaText: 'インタビューを見る',
    bgColor: '#eab308',
  },
];

// ============================================
// セクション4: 転職ガイド データ
// ============================================
const careerGuides = [
  {
    id: 'career-guide-1',
    icon: '🚀',
    title: 'ポートフォリオの作り方',
    description: '学習目的であるポートフォリオについて解説します',
    link: '/guide/portfolio',
  },
  {
    id: 'career-guide-2',
    icon: '👩',
    title: '面接で何が見られるのか',
    description: '採用から逆算して必要なスキルを知ろう',
    link: '/guide/interview',
  },
  {
    id: 'career-guide-3',
    icon: '🏢',
    title: '会社の探し方・選び方',
    description: 'UI/UX系の会社の探し方',
    link: '/guide/company',
  },
];

// ============================================
// セクション5: 人気のレッスン データ
// ============================================
const popularLessons = [
  {
    id: 'lesson-1',
    category: 'UIデザインの基本の進め方',
    title: 'UIタイポグラフィ入門',
    description: 'UIデザインの基本になるフォント選び・サイズ・選択の法則',
    link: '/lessons/ui-typography',
    bgColor: '#1e40af',
  },
  {
    id: 'lesson-2',
    category: '使いやすいUIデザインの基本',
    title: '「3構造」ではじめるUIデザイン入門',
    description: 'UI設計がラクになる3つの役割を知ろう',
    link: '/lessons/three-structures-ui-design',
    bgColor: '#047857',
  },
  {
    id: 'lesson-3',
    category: 'UIデザインの基本の進め方',
    title: 'センスを盗む技術',
    description: 'デザイン上達に必須な「良いものを見る」を学ぶレッスン',
    link: '/lessons/steel-design-sense',
    bgColor: '#7c3aed',
  },
  {
    id: 'lesson-4',
    category: 'UIデザインの基本の進め方',
    title: 'ゼロからはじめるUIビジュアル',
    description: 'ステップバイステップでUIデザインを一緒にしていくコンテンツ。',
    link: '/lessons/tutorial-uivisual',
    bgColor: '#0891b2',
  },
  {
    id: 'lesson-5',
    category: '顧客価値をUIで実現する',
    title: 'ゼロからはじめるUI情報設計',
    description: '「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。',
    link: '/lessons/ui-architect-beginner',
    bgColor: '#2563eb',
  },
  {
    id: 'lesson-6',
    category: 'UIデザインの基本の進め方',
    title: 'グラフィック入門',
    description: 'Webサイトデザインのプロセスをトレース。見た目を作るテクニックを身につけます。',
    link: '/lessons/graphicbeginner',
    bgColor: '#059669',
  },
];

// ============================================
// セクション6: 新着コンテンツ データ
// ============================================
const newContents = [
  {
    id: 'new-1',
    category: '質問',
    title: '【質問】UI/UXデザイナーのMacの選び方2025。AI時代の作業に必要なPCスペックは？',
    date: '12/4/2025',
    link: '/questions/mac-spec-2025',
    bgColor: '#1e3a8a',
  },
  {
    id: 'new-2',
    category: '質問',
    title: '質問：Webデザインの経験はあるがUI経験が不安な状態。どうすればUIデザインの仕事を始められるのかを解説',
    date: '12/4/2025',
    link: '/questions/web-to-ui',
    bgColor: '#065f46',
  },
  {
    id: 'new-3',
    category: 'UI配色',
    title: '【配色】プライマリーカラーのつかいかた。背景塗りつぶしの色の注意ポイント',
    date: '10/17/2025',
    link: '/knowledge/primary-color',
    bgColor: '#7c2d12',
  },
  {
    id: 'new-4',
    category: '未経験からデザイナーになる',
    title: '完璧をやめる、記録を重ねる、焦る日も前に進めて掴んだUIUXデザイナー転職話｜ベベさん',
    date: '10/17/2025',
    link: '/interviews/bebe',
    bgColor: '#831843',
  },
];

// ============================================
// コンポーネント
// ============================================

const TopPagePatternD = () => {
  return (
    <Layout>
      <div
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          minHeight: '100vh',
          fontFamily: "'Rounded Mplus 1c', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
      {/* ===== セクション1: アイキャッチ ===== */}
      <section
        style={{
          padding: '80px 24px 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* ヘッドライン */}
        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: '16px',
          }}
        >
          すべての人に創造性の夜明けを。
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: colors.textMuted,
            lineHeight: 1.8,
            marginBottom: '24px',
            maxWidth: '700px',
          }}
        >
          ボノは転職実績のある実践的なコースカリキュラムを提供する
          デザインでより良い社会を実現したい人のための学習サービスです
        </p>

        {/* 目的別コンテンツガイドボタン */}
        <button
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '100px',
            color: colors.text,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '48px',
          }}
        >
          目的別コンテンツガイド
          <ArrowRight size={16} />
        </button>

        {/* ロードマップカード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {heroRoadmaps.map((roadmap) => (
            <Link
              key={roadmap.id}
              to={roadmap.link}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: colors.text,
              }}
            >
              {/* サムネイル */}
              <div
                style={{
                  background: roadmap.bgColor,
                  borderRadius: '16px',
                  aspectRatio: '16/10',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  padding: '24px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.7)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    {roadmap.label}
                  </span>
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                    }}
                  >
                    {roadmap.title}
                  </span>
                </div>
              </div>

              {/* タイトル */}
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                {roadmap.title}
              </h3>

              {/* 箇条書き */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 16px 0',
                  flex: 1,
                }}
              >
                {roadmap.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '13px',
                      color: colors.textMuted,
                      marginBottom: '6px',
                      paddingLeft: '16px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                      }}
                    >
                      •
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>

              {/* CTAボタン */}
              <button
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: colors.text,
                  color: colors.bg,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {roadmap.ctaText}
              </button>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== セクション2: ガイドコンテンツ ===== */}
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
            marginBottom: '8px',
          }}
        >
          ガイドコンテンツ
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: colors.textMuted,
            marginBottom: '16px',
          }}
        >
          キャリアに役立つ実践的なガイド記事
        </p>
        <Link
          to="/guide"
          style={{
            fontSize: '14px',
            color: colors.accent,
            textDecoration: 'underline',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          ガイド一覧をみる
        </Link>

        {/* ガイドカード 2x2グリッド */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }}
        >
          {guideContents.map((guide) => (
            <Link
              key={guide.id}
              to={guide.link}
              style={{
                display: 'flex',
                gap: '20px',
                textDecoration: 'none',
                color: colors.text,
              }}
            >
              {/* サムネイル */}
              <div
                style={{
                  width: '200px',
                  height: '120px',
                  backgroundColor: guide.bgColor,
                  borderRadius: '12px',
                  flexShrink: 0,
                }}
              />
              {/* テキスト */}
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {guide.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== セクション3: 転職事例 ===== */}
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
            marginBottom: '4px',
          }}
        >
          転職実績のある
        </h2>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
          }}
        >
          実践的な学習サービスです
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: colors.textMuted,
            marginBottom: '16px',
          }}
        >
          転職実績について
        </p>
        <p
          style={{
            fontSize: '15px',
            color: colors.textMuted,
            marginBottom: '8px',
          }}
        >
          BONOを使って成果を出したメンバーのインタビュー集
        </p>
        <Link
          to="/interviews"
          style={{
            fontSize: '14px',
            color: colors.accent,
            textDecoration: 'underline',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          インタビューをもっとみる
        </Link>

        {/* 転職事例カード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {careerCases.map((caseItem) => (
            <div
              key={caseItem.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* サムネイル */}
              <div
                style={{
                  backgroundColor: caseItem.bgColor,
                  borderRadius: '16px',
                  aspectRatio: '16/10',
                  marginBottom: '16px',
                }}
              />

              {/* 名前 */}
              <p
                style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  marginBottom: '4px',
                }}
              >
                {caseItem.name}
              </p>

              {/* タイトル */}
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  lineHeight: 1.5,
                  marginBottom: '12px',
                  flex: 1,
                }}
              >
                {caseItem.title}
              </h3>

              {/* メタ情報 */}
              <div
                style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  marginBottom: '16px',
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: colors.textLight }}>成果</span>{' '}{caseItem.result}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ color: colors.textLight }}>会社</span>{' '}{caseItem.company}
                </div>
                <div>
                  <span style={{ color: colors.textLight }}>前職</span>{' '}{caseItem.previousJob}
                </div>
              </div>

              {/* CTAボタン */}
              <a
                href={caseItem.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                {caseItem.ctaText}
                <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ===== セクション4: 転職ガイド ===== */}
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
            marginBottom: '8px',
          }}
        >
          転職サポート
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: colors.textMuted,
            marginBottom: '16px',
          }}
        >
          企業は何を見ているの？
        </p>
        <p
          style={{
            fontSize: '15px',
            color: colors.textMuted,
            marginBottom: '8px',
          }}
        >
          UIUXデザイナーになるために何が必要か？を逆算してカリキュラムを作成しています
        </p>
        <Link
          to="/guide"
          style={{
            fontSize: '14px',
            color: colors.accent,
            textDecoration: 'underline',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          UI/UX転職ガイドをみる
        </Link>

        {/* 転職ガイドカード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {careerGuides.map((guide) => (
            <Link
              key={guide.id}
              to={guide.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                backgroundColor: colors.bgCard,
                borderRadius: '16px',
                textDecoration: 'none',
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{guide.icon}</span>
                  {guide.title}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: colors.textMuted,
                  }}
                >
                  {guide.description}
                </p>
              </div>
              <ChevronRight size={20} style={{ color: colors.textLight, flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== セクション5: 人気のレッスン ===== */}
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
            marginBottom: '8px',
          }}
        >
          レッスン
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: colors.textMuted,
            marginBottom: '16px',
          }}
        >
          テーマ別コンテンツ
        </p>
        <p
          style={{
            fontSize: '15px',
            color: colors.textMuted,
            marginBottom: '24px',
          }}
        >
          スキルアップしたい単位で学習できます
        </p>

        {/* カテゴリタブ */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          {['UIデザイン', 'UXデザイン', 'Figma', 'キャリア'].map((tab, idx) => (
            <span
              key={tab}
              style={{
                fontSize: '14px',
                color: idx === 0 ? colors.text : colors.textMuted,
                textDecoration: idx === 0 ? 'underline' : 'none',
                cursor: 'pointer',
              }}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* レッスンカード 3x2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}
        >
          {popularLessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={lesson.link}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: colors.text,
              }}
            >
              {/* サムネイル */}
              <div
                style={{
                  backgroundColor: lesson.bgColor,
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
                    fontSize: '18px',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  {lesson.title}
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
                {lesson.category}
              </p>

              {/* タイトル */}
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  lineHeight: 1.4,
                }}
              >
                {lesson.title}
              </h3>

              {/* 説明 */}
              <p
                style={{
                  fontSize: '13px',
                  color: colors.textMuted,
                  lineHeight: 1.6,
                }}
              >
                {lesson.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== セクション6: 新着コンテンツ ===== */}
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
            marginBottom: '8px',
          }}
        >
          新着のコンテンツ
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: colors.textMuted,
            marginBottom: '16px',
          }}
        >
          更新するぞい
        </p>
        <Link
          to="/knowledge"
          style={{
            fontSize: '14px',
            color: colors.accent,
            textDecoration: 'underline',
            display: 'inline-block',
            marginBottom: '32px',
          }}
        >
          「新しいコンテンツ」の一覧へ
        </Link>

        {/* 新着カード */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
        >
          {newContents.map((content) => (
            <Link
              key={content.id}
              to={content.link}
              style={{
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: colors.text,
              }}
            >
              {/* サムネイル */}
              <div
                style={{
                  backgroundColor: content.bgColor,
                  borderRadius: '16px',
                  aspectRatio: '4/3',
                  marginBottom: '16px',
                }}
              />

              {/* カテゴリ */}
              <p
                style={{
                  fontSize: '12px',
                  color: colors.accent,
                  marginBottom: '4px',
                }}
              >
                {content.category}
              </p>

              {/* タイトル */}
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {content.title}
              </h3>

              {/* 日付 */}
              <p
                style={{
                  fontSize: '12px',
                  color: colors.textLight,
                }}
              >
                {content.date}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
    </Layout>
  );
};

export default TopPagePatternD;
