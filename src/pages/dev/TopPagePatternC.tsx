/**
 * Pattern C: Linear Style
 * ダークモード、ミニマルUI、階層的タイポグラフィ、ステップフロー
 */

import React, { useState } from 'react';
import { Play, CheckCircle, MessageCircle, ArrowRight, ArrowLeft, Clock, Zap, ChevronRight } from 'lucide-react';

// Linear風カラーパレット
const colors = {
  bg: '#0A0A0B',
  bgElevated: '#141415',
  bgHover: '#1D1D1F',
  border: '#2A2A2C',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8B8D',
  textTertiary: '#5C5C5E',
  accent: '#5E6AD2', // Linear purple/blue
  accentHover: '#7C85E0',
  success: '#3FB950',
  warning: '#E3B341',
};

type Step = 'select' | 'training' | 'practice';

interface Training {
  name: string;
  description: string;
  duration: string;
  videos: number;
  practices: string[];
}

interface Problem {
  id: string;
  problem: string;
  training: Training;
}

const problems: Problem[] = [
  {
    id: 'ui-visual',
    problem: 'UIの見た目が垢抜けない',
    training: {
      name: 'UIビジュアル基礎',
      description: '色・タイポグラフィ・レイアウトの基本を習得し、見た目の質を上げる',
      duration: '1ヶ月',
      videos: 36,
      practices: [
        'カラーパレットを作成する',
        'タイポグラフィルールを設計する',
        'カードUIを3パターン作る',
        '既存アプリのUIを改善する',
      ],
    },
  },
  {
    id: 'information',
    problem: '情報の整理ができない',
    training: {
      name: 'ゼロからはじめるUI情報設計',
      description: '画面構成・ナビゲーション・情報の階層を論理的に設計する力を養う',
      duration: '1ヶ月',
      videos: 36,
      practices: [
        'サイトマップを作成する',
        'ワイヤーフレームを設計する',
        'ナビゲーションを設計する',
        'アプリの画面構成を設計する',
      ],
    },
  },
  {
    id: 'ux',
    problem: 'UXの考え方がわからない',
    training: {
      name: 'UXデザイン基礎コース',
      description: '顧客理解・課題定義・価値設計の流れを実践的に学ぶ',
      duration: '1ヶ月',
      videos: 36,
      practices: [
        'ユーザーインタビューを設計する',
        'ペルソナを作成する',
        'カスタマージャーニーを描く',
        '課題を特定し解決策を提案する',
      ],
    },
  },
  {
    id: 'figma',
    problem: 'Figmaの使い方がわからない',
    training: {
      name: 'UIデザイン入門',
      description: 'Figmaの基本操作から実践的なUIデザインの作り方まで',
      duration: '1ヶ月',
      videos: 36,
      practices: [
        'Figmaの基本操作をマスターする',
        'コンポーネントを作成する',
        'オートレイアウトを使いこなす',
        '実際のアプリUIを作成する',
      ],
    },
  },
  {
    id: 'sense',
    problem: 'デザインのセンスがない',
    training: {
      name: 'センスを盗む技術',
      description: '良いデザインを分析・言語化し、自分のデザインに取り入れる',
      duration: '1ヶ月',
      videos: 36,
      practices: [
        '優れたUIを分析・言語化する',
        'デザインパターンを収集する',
        '分析結果を自分の作品に適用する',
        'ビフォー/アフターで改善を示す',
      ],
    },
  },
  {
    id: 'career',
    problem: 'UIデザイナーに転職したい',
    training: {
      name: 'UIデザイナー転職ロードマップ',
      description: '未経験からポートフォリオ作成・転職成功までの学習計画',
      duration: '3ヶ月',
      videos: 50,
      practices: [
        'UI基礎スキルを習得する',
        'UX基礎スキルを習得する',
        'ポートフォリオを作成する',
        '面接対策を行う',
      ],
    },
  },
];

const TopPagePatternC = () => {
  const [step, setStep] = useState<Step>('select');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setStep('training');
  };

  const handleBack = () => {
    if (step === 'training') {
      setStep('select');
      setSelectedProblem(null);
    } else if (step === 'practice') {
      setStep('training');
    }
  };

  const handleNext = () => {
    if (step === 'training') {
      setStep('practice');
    }
  };

  const steps = [
    { id: 'select', label: '悩みを選ぶ', number: 1 },
    { id: 'training', label: 'トレーニング', number: 2 },
    { id: 'practice', label: '実践', number: 3 },
  ];

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.textPrimary, minHeight: '100vh' }}>

      {/* Hero Section */}
      <section style={{
        padding: '100px 24px 60px',
        textAlign: 'center',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.2,
            marginBottom: '20px',
            letterSpacing: '-0.02em',
          }}>
            デザインを、ステップで鍛える
          </h1>
          <p style={{
            fontSize: '18px',
            color: colors.textSecondary,
            lineHeight: 1.6,
          }}>
            悩みを選んで、トレーニングを確認、実践でスキルアップ
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section style={{
        padding: '24px',
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: step === s.id ? colors.bgElevated : 'transparent',
                border: step === s.id ? `1px solid ${colors.border}` : '1px solid transparent',
              }}>
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: step === s.id ? colors.accent : colors.bgHover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: step === s.id ? colors.textPrimary : colors.textSecondary,
                }}>
                  {s.number}
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: step === s.id ? colors.textPrimary : colors.textTertiary,
                }}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight size={14} style={{ color: colors.textTertiary }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Step 1: 悩み選択 */}
          {step === 'select' && (
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 500,
                marginBottom: '32px',
                color: colors.textSecondary,
              }}>
                どんな悩みがありますか？
              </h2>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}>
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => handleSelectProblem(problem)}
                    onMouseEnter={() => setHoveredId(problem.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      padding: '20px 24px',
                      backgroundColor: hoveredId === problem.id ? colors.bgHover : colors.bgElevated,
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: colors.textPrimary,
                    }}>
                      {problem.problem}
                    </span>
                    <ArrowRight
                      size={16}
                      style={{
                        color: hoveredId === problem.id ? colors.accent : colors.textTertiary,
                        transition: 'color 0.15s ease',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: トレーニング詳細 */}
          {step === 'training' && selectedProblem && (
            <div>
              <button
                onClick={handleBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '32px',
                  padding: '4px 0',
                }}
              >
                <ArrowLeft size={14} />
                戻る
              </button>

              <div style={{
                padding: '32px',
                backgroundColor: colors.bgElevated,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
              }}>
                {/* 選択した悩み */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor: colors.bgHover,
                  borderRadius: '6px',
                  marginBottom: '24px',
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: colors.textTertiary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    悩み
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: colors.textPrimary,
                  }}>
                    {selectedProblem.problem}
                  </span>
                </div>

                {/* トレーニング情報 */}
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 500,
                  marginBottom: '12px',
                  letterSpacing: '-0.01em',
                }}>
                  {selectedProblem.training.name}
                </h3>
                <p style={{
                  fontSize: '15px',
                  color: colors.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: '32px',
                }}>
                  {selectedProblem.training.description}
                </p>

                {/* メタ情報 */}
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  paddingTop: '24px',
                  borderTop: `1px solid ${colors.border}`,
                  marginBottom: '32px',
                }}>
                  {[
                    { icon: <Clock size={16} />, label: '期間', value: selectedProblem.training.duration },
                    { icon: <Play size={16} />, label: '動画', value: `${selectedProblem.training.videos}本` },
                    { icon: <CheckCircle size={16} />, label: 'お題', value: `${selectedProblem.training.practices.length}つ` },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: colors.textTertiary }}>{item.icon}</span>
                      <span style={{ fontSize: '13px', color: colors.textTertiary }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: colors.textPrimary }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* 次へボタン */}
                <button
                  onClick={handleNext}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    backgroundColor: colors.accent,
                    color: colors.textPrimary,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  実践内容を見る
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 実践内容 */}
          {step === 'practice' && selectedProblem && (
            <div>
              <button
                onClick={handleBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '32px',
                  padding: '4px 0',
                }}
              >
                <ArrowLeft size={14} />
                戻る
              </button>

              <div style={{ marginBottom: '40px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  letterSpacing: '-0.01em',
                }}>
                  実践お題
                </h2>
                <p style={{
                  fontSize: '15px',
                  color: colors.textSecondary,
                }}>
                  {selectedProblem.training.name}で取り組むお題
                </p>
              </div>

              {/* お題リスト */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '48px',
              }}>
                {selectedProblem.training.practices.map((practice, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      padding: '20px',
                      backgroundColor: colors.bgElevated,
                      borderRadius: '10px',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: colors.bgHover,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: colors.textSecondary,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        marginBottom: '4px',
                        color: colors.textPrimary,
                      }}>
                        {practice}
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: colors.textTertiary,
                      }}>
                        動画で学んだ内容を実践
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{
                padding: '40px',
                backgroundColor: colors.bgElevated,
                borderRadius: '12px',
                border: `1px solid ${colors.border}`,
                textAlign: 'center',
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  marginBottom: '12px',
                }}>
                  このトレーニングを始める
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: '24px',
                }}>
                  動画学習 + 実践お題 + プロの添削
                </p>
                <button style={{
                  padding: '14px 32px',
                  backgroundColor: colors.accent,
                  color: colors.textPrimary,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}>
                  BONOをはじめる
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '80px 24px',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 500,
            textAlign: 'center',
            marginBottom: '12px',
          }}>
            料金プラン
          </h2>
          <p style={{
            fontSize: '15px',
            color: colors.textSecondary,
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            飲み会1回分でデザイン力を向上
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            {/* Standard */}
            <div style={{
              padding: '32px',
              backgroundColor: colors.bgElevated,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 500,
                marginBottom: '16px',
                color: colors.textSecondary,
              }}>
                スタンダード
              </h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 500 }}>¥5,800</span>
                <span style={{ fontSize: '14px', color: colors.textTertiary, marginLeft: '4px' }}>/月</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['全動画コンテンツ見放題', 'コミュニティ参加', '質問・相談 無制限'].map((item, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    color: colors.textSecondary,
                  }}>
                    <CheckCircle size={16} style={{ color: colors.success }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Feedback */}
            <div style={{
              padding: '32px',
              backgroundColor: colors.accent,
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 500,
              }}>
                おすすめ
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 500,
                marginBottom: '16px',
                opacity: 0.9,
              }}>
                フィードバック
              </h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 500 }}>¥13,800</span>
                <span style={{ fontSize: '14px', opacity: 0.7, marginLeft: '4px' }}>/月</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['スタンダードの全機能', 'プロの添削 月2回', 'ポートフォリオ添削'].map((item, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    opacity: 0.9,
                  }}>
                    <CheckCircle size={16} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 500,
          marginBottom: '16px',
        }}>
          デザインを鍛えよう
        </h2>
        <p style={{
          fontSize: '15px',
          color: colors.textSecondary,
          marginBottom: '32px',
        }}>
          あなたの悩みに合わせたトレーニングで、実践的なスキルを
        </p>
        <button style={{
          padding: '16px 40px',
          backgroundColor: colors.textPrimary,
          color: colors.bg,
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          無料で始める
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};

export default TopPagePatternC;
