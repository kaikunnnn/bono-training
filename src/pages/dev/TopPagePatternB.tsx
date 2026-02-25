/**
 * Pattern B: Notion Style
 * 白背景、カラフルなアクセント、Playful、Bentoグリッド
 */

import React, { useState } from 'react';
import { Play, CheckCircle, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

type Category = 'skill' | 'career' | 'tool';

const categoryColors = {
  skill: { bg: '#FEE2E2', text: '#DC2626', accent: '#EF4444' },
  career: { bg: '#DBEAFE', text: '#2563EB', accent: '#3B82F6' },
  tool: { bg: '#FEF3C7', text: '#D97706', accent: '#F59E0B' },
};

const categories = [
  { id: 'skill' as Category, label: 'スキル', emoji: '🎨' },
  { id: 'career' as Category, label: 'キャリア', emoji: '🚀' },
  { id: 'tool' as Category, label: 'ツール', emoji: '🔧' },
];

const problemsByCategory = {
  skill: [
    { problem: 'UIの見た目が垢抜けない', training: 'UIビジュアル基礎', videos: 36 },
    { problem: 'デザインのセンスがない', training: 'センスを盗む技術', videos: 36 },
    { problem: '情報の整理ができない', training: 'UI情報設計', videos: 36 },
    { problem: 'UXの考え方がわからない', training: 'UXデザイン基礎', videos: 36 },
  ],
  career: [
    { problem: 'UIデザイナーに転職したい', training: '転職ロードマップ', videos: 50 },
    { problem: 'ポートフォリオがない', training: '転職ロードマップ', videos: 50 },
    { problem: 'WebからUI/UXへ転向したい', training: 'キャリアチェンジガイド', videos: 30 },
  ],
  tool: [
    { problem: 'Figmaの使い方がわからない', training: 'UIデザイン入門', videos: 36 },
    { problem: 'コンポーネントが作れない', training: 'UIビジュアル基礎', videos: 36 },
  ],
};

const TopPagePatternB = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('skill');

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#1F2937', minHeight: '100vh' }}>

      {/* Hero Section */}
      <section style={{ padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#FEF3C7',
            borderRadius: '100px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#92400E',
          }}>
            <Sparkles size={16} />
            デザイントレーニング
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.2,
            marginBottom: '24px',
            color: '#111827',
          }}>
            悩みから始める、
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #EF4444, #F59E0B, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              デザイン学習
            </span>
          </h1>

          <p style={{
            fontSize: '20px',
            color: '#6B7280',
            marginBottom: '40px',
            lineHeight: 1.6,
          }}>
            動画で学んで、お題で実践、プロの添削で成長する
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button style={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              border: 'none',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              無料で始める
              <ArrowRight size={18} />
            </button>
            <button style={{
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '12px',
              cursor: 'pointer',
            }}>
              コース一覧を見る
            </button>
          </div>
        </div>
      </section>

      {/* Category Tabs + Problems */}
      <section style={{ padding: '80px 24px', backgroundColor: '#F9FAFB' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            どんな悩みがありますか？
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            カテゴリを選んで、あなたに合ったトレーニングを見つけよう
          </p>

          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '100px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeCategory === cat.id
                    ? categoryColors[cat.id].bg
                    : '#FFFFFF',
                  color: activeCategory === cat.id
                    ? categoryColors[cat.id].text
                    : '#6B7280',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === cat.id
                    ? 'none'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Problems Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {problemsByCategory[activeCategory].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '24px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = categoryColors[activeCategory].accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '12px',
                  color: '#111827',
                }}>
                  {item.problem}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: categoryColors[activeCategory].text,
                      marginBottom: '4px',
                    }}>
                      {item.training}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9CA3AF' }}>
                      {item.videos}本の動画
                    </div>
                  </div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: categoryColors[activeCategory].bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ArrowRight size={18} style={{ color: categoryColors[activeCategory].text }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '64px',
          }}>
            学び方
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
          }}>
            {[
              { icon: <Play size={28} />, title: '動画で学ぶ', desc: '36本以上の解説動画', color: '#FEE2E2', iconColor: '#DC2626' },
              { icon: <CheckCircle size={28} />, title: 'お題で実践', desc: '各コース4つ以上のお題', color: '#DBEAFE', iconColor: '#2563EB' },
              { icon: <MessageCircle size={28} />, title: '添削で上達', desc: 'プロの添削でスキルアップ', color: '#FEF3C7', iconColor: '#D97706' },
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '20px',
                  backgroundColor: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: item.iconColor,
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#6B7280' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '100px 24px', backgroundColor: '#F9FAFB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            料金プラン
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            飲み会1回分でデザイン力を向上
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }}>
            <div style={{
              padding: '40px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E5E7EB',
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                スタンダード
              </h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: 700 }}>¥5,800</span>
                <span style={{ fontSize: '16px', color: '#6B7280' }}>/月</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['全動画コンテンツ見放題', 'コミュニティ参加', '質問・相談 無制限'].map((item, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '15px',
                    color: '#374151',
                  }}>
                    <CheckCircle size={18} style={{ color: '#10B981' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              padding: '40px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              borderRadius: '24px',
              color: '#FFFFFF',
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                フィードバック
              </h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '40px', fontWeight: 700 }}>¥13,800</span>
                <span style={{ fontSize: '16px', opacity: 0.8 }}>/月</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['スタンダードの全機能', 'プロの添削 月2回', 'ポートフォリオ添削'].map((item, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    fontSize: '15px',
                  }}>
                    <CheckCircle size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '24px',
        }}>
          デザインを鍛えよう
        </h2>
        <button style={{
          backgroundColor: '#111827',
          color: '#FFFFFF',
          border: 'none',
          padding: '18px 40px',
          fontSize: '18px',
          fontWeight: 600,
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          無料で始める
          <ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
};

export default TopPagePatternB;
