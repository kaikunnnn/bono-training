/**
 * Pattern E: D構成 + デザインシステムスタイル
 * Pattern Dの6セクション構成に、サービスのデザインシステムを適用
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';

// ============================================
// デザインシステム カラーパレット
// ============================================
const colors = {
  // 背景
  bg: '#F9F9F7',
  bgCard: '#FFFFFF',
  bgMuted: '#F5F5F5',
  bgPlaceholder: '#E8E8E8',

  // テキスト
  text: '#1a1a1a',
  textMuted: '#666666',
  textLight: '#999999',

  // アクセント
  accent: '#2563eb',
  training: '#FF9900',

  // ボーダー
  border: 'rgba(0, 0, 0, 0.06)',
};

// フォント
const fonts = {
  heading: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
  body: "'M PLUS Rounded 1c', 'Hiragino Kaku Gothic ProN', sans-serif",
};

// ============================================
// セクション1: アイキャッチ データ
// ============================================
const heroRoadmaps = [
  {
    id: 'career-change',
    label: 'UIデザイナー転職ロードマップ',
    title: 'UI/UXデザイナーになるロードマップ',
    titleEn: 'UI Designer Road Map',
    subtitle: '1年間でUIデザイナーになる勉強法',
    bullets: [
      '転職実績のある学習ロードマップ!',
      'UI/UXの3つの基礎を身につけます',
      'ポートフォリオ作成がゴールです',
    ],
    ctaText: '転職ロードマップへ',
    link: '/roadmaps/career-change',
  },
  {
    id: 'ux-design',
    label: 'UXデザイン基礎コース',
    title: 'UXデザイン基礎コース',
    titleEn: 'DEEP PEOPLE DIVE',
    subtitle: '顧客理解から課題解決まで',
    bullets: [
      '顧客理解から課題解決の基礎を身につけます',
      'プロダクトデザインに必須な価値デザインを習得',
    ],
    ctaText: 'コースを見る',
    link: '/roadmaps/ux-design',
  },
  {
    id: 'information-architecture',
    label: '情報設計基礎',
    title: 'WebデザイナーからUI/UXへ転職',
    titleEn: 'はじめよう UIUXデザイン',
    subtitle: 'スキル習得ロードマップ',
    bullets: [
      'WebとUIUXは何が違うのか？',
      '身につけるべきスキルべきスキル',
      'スキル習得ロードマップ',
    ],
    ctaText: '転職ロードマップへ',
    link: '/roadmaps/information-architecture',
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
  },
  {
    id: 'guide-2',
    title: '未経験からUIUXデザイナーになるには',
    link: '/guide/beginner-to-uiux',
  },
  {
    id: 'guide-3',
    title: 'ポートフォリオのつくり方',
    link: '/guide/portfolio',
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
  },
  {
    id: 'lesson-2',
    category: '使いやすいUIデザインの基本',
    title: '「3構造」ではじめるUIデザイン入門',
    description: 'UI設計がラクになる3つの役割を知ろう',
    link: '/lessons/three-structures-ui-design',
  },
  {
    id: 'lesson-3',
    category: 'UIデザインの基本の進め方',
    title: 'センスを盗む技術',
    description: 'デザイン上達に必須な「良いものを見る」を学ぶレッスン',
    link: '/lessons/steel-design-sense',
  },
  {
    id: 'lesson-4',
    category: 'UIデザインの基本の進め方',
    title: 'ゼロからはじめるUIビジュアル',
    description: 'ステップバイステップでUIデザインを一緒にしていくコンテンツ。',
    link: '/lessons/tutorial-uivisual',
  },
  {
    id: 'lesson-5',
    category: '顧客価値をUIで実現する',
    title: 'ゼロからはじめるUI情報設計',
    description: '「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。',
    link: '/lessons/ui-architect-beginner',
  },
  {
    id: 'lesson-6',
    category: 'UIデザインの基本の進め方',
    title: 'グラフィック入門',
    description: 'Webサイトデザインのプロセスをトレース。見た目を作るテクニックを身につけます。',
    link: '/lessons/graphicbeginner',
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
  },
  {
    id: 'new-2',
    category: '質問',
    title: '質問：Webデザインの経験はあるがUI経験が不安な状態。どうすればUIデザインの仕事を始められるのかを解説',
    date: '12/4/2025',
    link: '/questions/web-to-ui',
  },
  {
    id: 'new-3',
    category: 'UI配色',
    title: '【配色】プライマリーカラーのつかいかた。背景塗りつぶしの色の注意ポイント',
    date: '10/17/2025',
    link: '/knowledge/primary-color',
  },
  {
    id: 'new-4',
    category: '未経験からデザイナーになる',
    title: '完璧をやめる、記録を重ねる、焦る日も前に進めて掴んだUIUXデザイナー転職話｜ベベさん',
    date: '10/17/2025',
    link: '/interviews/bebe',
  },
];

// ============================================
// コンポーネント
// ============================================

const TopPagePatternE = () => {
  return (
    <Layout>
      <div
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          minHeight: '100vh',
          fontFamily: fonts.body,
        }}
      >
      {/* ===== セクション1: アイキャッチ ===== */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* 背景グラデーション */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(180deg, #e0e5f8 0%, #faf4f0 36.7%, #F9F9F7 100%)',
            zIndex: 0,
          }}
        />

        {/* コンテンツ */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* ヘッドライン */}
          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '16px',
              fontFamily: fonts.heading,
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
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: '100px',
              color: colors.text,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '48px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontFamily: fonts.body,
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
                {/* サムネイル（プレースホルダー） */}
                <div
                  style={{
                    backgroundColor: colors.bgPlaceholder,
                    borderRadius: '16px',
                    aspectRatio: '16/10',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    padding: '24px',
                  }}
                >
                  <div style={{ textAlign: 'center', color: colors.textMuted }}>
                    <span
                      style={{
                        fontSize: '11px',
                        opacity: 0.7,
                        display: 'block',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {roadmap.label}
                    </span>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        display: 'block',
                        fontFamily: fonts.heading,
                        color: colors.text,
                      }}
                    >
                      {roadmap.titleEn}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        opacity: 0.7,
                        display: 'block',
                        marginTop: '8px',
                      }}
                    >
                      {roadmap.subtitle}
                    </span>
                  </div>
                </div>

                {/* タイトル */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '12px',
                    fontFamily: fonts.heading,
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
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: fonts.body,
                  }}
                >
                  {roadmap.ctaText}
                </button>
              </Link>
            ))}
          </div>
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
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: fonts.heading,
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

        {/* ガイドカード */}
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
                padding: '16px',
                backgroundColor: colors.bgCard,
                borderRadius: '16px',
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* サムネイル（プレースホルダー） */}
              <div
                style={{
                  width: '180px',
                  height: '100px',
                  backgroundColor: colors.bgPlaceholder,
                  borderRadius: '12px',
                  flexShrink: 0,
                }}
              />
              {/* テキスト */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    fontFamily: fonts.heading,
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
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: fonts.heading,
            lineHeight: 1.4,
          }}
        >
          転職実績のある
          <br />
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
                backgroundColor: colors.bgCard,
                borderRadius: '20px',
                padding: '20px',
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* サムネイル（プレースホルダー） */}
              <div
                style={{
                  backgroundColor: colors.bgPlaceholder,
                  borderRadius: '12px',
                  aspectRatio: '16/10',
                  marginBottom: '16px',
                }}
              />

              {/* 名前 */}
              <p
                style={{
                  fontSize: '13px',
                  color: colors.textLight,
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
                  fontFamily: fonts.heading,
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
                  backgroundColor: colors.text,
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: fonts.body,
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
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: fonts.heading,
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
                    fontFamily: fonts.heading,
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
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: fonts.heading,
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
                fontWeight: idx === 0 ? 600 : 400,
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
              {/* サムネイル（プレースホルダー） */}
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
                    fontWeight: 600,
                    textAlign: 'center',
                    color: colors.textMuted,
                    fontFamily: fonts.heading,
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
                  fontFamily: fonts.heading,
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
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '8px',
            fontFamily: fonts.heading,
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
              {/* サムネイル（プレースホルダー） */}
              <div
                style={{
                  backgroundColor: colors.bgPlaceholder,
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
                  fontFamily: fonts.heading,
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

export default TopPagePatternE;
