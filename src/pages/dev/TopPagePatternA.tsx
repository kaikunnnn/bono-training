/**
 * Pattern A: Dreelio Style (Real)
 * With UI mockups, device images, visual content inside cards
 */

import React, { useState } from 'react';
import { Play, CheckCircle, MessageCircle, ArrowRight, ArrowUpRight, Moon, Sun, Settings, Palette, Layout, Type, Layers, PenTool, Monitor, Smartphone, Tablet } from 'lucide-react';

// Dreelio Color Palette
const colors = {
  bg: '#f4f1ee',
  bgLight: '#faf9f8',
  card: '#f9f7f5',
  text: '#1a1a1a',
  textMuted: '#666666',
  textLight: '#999999',
  accent: '#2563eb',
  border: 'rgba(0, 0, 0, 0.06)',
};

const TopPagePatternA = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>

      {/* ===== HERO with Sky Image ===== */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        overflow: 'hidden',
      }}>
        {/* Sky gradient background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(180deg, #e8f4fc 0%, #d4e9f7 30%, #c9dff0 50%, #f4f1ee 100%)',
          zIndex: 0,
        }} />

        {/* Cloud-like shapes */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '10%',
          width: '200px',
          height: '80px',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '100px',
          filter: 'blur(30px)',
        }} />
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '15%',
          width: '150px',
          height: '60px',
          background: 'rgba(255,255,255,0.7)',
          borderRadius: '100px',
          filter: 'blur(25px)',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px' }}>
          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 500,
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            悩みから始める、
            <br />
            デザイン学習
          </h1>

          <p style={{
            fontSize: '18px',
            color: colors.textMuted,
            lineHeight: 1.7,
            marginBottom: '40px',
            maxWidth: '500px',
            margin: '0 auto 40px',
          }}>
            動画で学んで、お題で実践、プロの添削で成長する。
            あなたの悩みに合わせたトレーニングを。
          </p>

          {/* Author-like element */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: '18px',
            }}>
              B
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>BONO</div>
              <div style={{ fontSize: '13px', color: colors.textLight }}>Design Training</div>
            </div>
          </div>

          {/* Device Mockup */}
          <div style={{
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 20px',
          }}>
            {/* Main Laptop */}
            <div style={{
              background: 'linear-gradient(145deg, #e8d5c4 0%, #b8c6d0 50%, #a5b5c0 100%)',
              borderRadius: '20px',
              padding: '20px 20px 0',
              boxShadow: '0 50px 100px rgba(0,0,0,0.15)',
            }}>
              {/* Screen */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '12px 12px 0 0',
                padding: '12px',
                minHeight: '300px',
              }}>
                {/* Browser chrome */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginBottom: '12px',
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
                </div>
                {/* App content */}
                <div style={{
                  background: colors.bgLight,
                  borderRadius: '8px',
                  padding: '20px',
                  minHeight: '240px',
                }}>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ width: '120px', height: '8px', background: colors.text, borderRadius: '4px' }} />
                    <div style={{ width: '80px', height: '8px', background: '#e5e5e5', borderRadius: '4px' }} />
                    <div style={{ width: '80px', height: '8px', background: '#e5e5e5', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{
                        background: i === 1 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                        borderRadius: '8px',
                        height: '80px',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Phone */}
            <div style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-40px',
              width: '100px',
              background: '#1a1a1a',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              transform: 'rotate(-5deg)',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                borderRadius: '10px',
                height: '160px',
              }} />
            </div>

            {/* Floating Tablet */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              right: '-30px',
              width: '140px',
              background: '#1a1a1a',
              borderRadius: '14px',
              padding: '8px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              transform: 'rotate(5deg)',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                borderRadius: '8px',
                height: '100px',
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES with UI Mockups ===== */}
      <section style={{
        padding: '120px 24px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        {/* Section Label */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: colors.textLight,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            FEATURES
          </span>
        </div>

        {/* Section Heading */}
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 500,
          textAlign: 'center',
          marginBottom: '64px',
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          悩みに合わせて学ぶ、
          <br />
          実践型トレーニング
        </h2>

        {/* Feature Cards with UI Mockups */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}>
          {/* Card 1: Course Selection */}
          <div
            onMouseEnter={() => setHoveredCard('courses')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: colors.card,
              borderRadius: '24px',
              padding: '32px',
              transition: 'transform 0.3s ease',
              transform: hoveredCard === 'courses' ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            <h3 style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '8px',
              lineHeight: 1.3,
            }}>
              悩みからコースを選ぶ、
              <br />
              迷わない学習設計
            </h3>

            {/* UI Mockup: Course selector */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              marginTop: '24px',
              marginBottom: '24px',
            }}>
              {/* Problem chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {['🎨 UIの見た目', '✨ センス', '📐 情報設計', '🧠 UX', '🔧 Figma', '🚀 転職'].map((item, i) => (
                  <div key={i} style={{
                    padding: '8px 14px',
                    borderRadius: '100px',
                    background: i === 0 ? colors.text : '#f5f5f5',
                    color: i === 0 ? '#fff' : colors.text,
                    fontSize: '13px',
                    fontWeight: 500,
                  }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#f9f9f9',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '22px',
                    borderRadius: '100px',
                    background: '#22c55e',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: '2px',
                      top: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#fff',
                    }} />
                  </div>
                  <span style={{ fontSize: '14px' }}>進捗を表示</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Moon size={18} style={{ color: colors.textLight }} />
                  <Settings size={18} style={{ color: colors.textLight }} />
                </div>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: 1.6 }}>
              <strong>悩みベースの学習設計。</strong>
              UIの見た目、センス、情報設計など、あなたの悩みに直結するコースを選べます。
            </p>
          </div>

          {/* Card 2: Tools/Skills */}
          <div
            onMouseEnter={() => setHoveredCard('tools')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              backgroundColor: colors.card,
              borderRadius: '24px',
              padding: '32px',
              transition: 'transform 0.3s ease',
              transform: hoveredCard === 'tools' ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            <h3 style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '8px',
              lineHeight: 1.3,
            }}>
              実践で使うスキルを、
              <br />
              体系的に習得
            </h3>

            {/* UI Mockup: Skill icons grid */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px',
              marginTop: '24px',
              marginBottom: '24px',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
              }}>
                {[
                  { icon: <Palette size={24} />, color: '#f43f5e' },
                  { icon: <Type size={24} />, color: '#8b5cf6' },
                  { icon: <Layout size={24} />, color: '#3b82f6' },
                  { icon: <Layers size={24} />, color: '#22c55e' },
                  { icon: <PenTool size={24} />, color: '#f97316' },
                ].map((item, i) => (
                  <div key={i} style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    background: '#f9f9f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                  }}>
                    {item.icon}
                  </div>
                ))}
              </div>

              {/* Second row with brand colors */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                marginTop: '12px',
              }}>
                {[
                  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                  { bg: '#1a1a1a' },
                  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                  { bg: '#0acf83' },
                  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                ].map((item, i) => (
                  <div key={i} style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    background: item.bg,
                  }} />
                ))}
              </div>
            </div>

            <p style={{ fontSize: '15px', color: colors.textMuted, lineHeight: 1.6 }}>
              <strong>スキルを体系的に。</strong>
              色、タイポグラフィ、レイアウトなど、UIデザインの基礎から応用まで網羅。
            </p>
          </div>
        </div>

        {/* Second Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          marginTop: '20px',
        }}>
          {[
            { icon: <Play size={24} />, title: '動画で学ぶ', desc: '36本以上の解説動画', color: '#3b82f6' },
            { icon: <CheckCircle size={24} />, title: 'お題で実践', desc: '各コース4つ以上', color: '#22c55e' },
            { icon: <MessageCircle size={24} />, title: '添削で上達', desc: 'プロの添削', color: '#f97316' },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: colors.card,
              borderRadius: '20px',
              padding: '28px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: `${item.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: item.color,
              }}>
                {item.icon}
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h4>
              <p style={{ fontSize: '14px', color: colors.textMuted }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section style={{
        padding: '120px 24px',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: colors.textLight,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            PRICING
          </span>
        </div>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 500,
          textAlign: 'center',
          marginBottom: '64px',
          letterSpacing: '-0.02em',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          料金プラン
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
        }}>
          {/* Standard */}
          <div style={{
            backgroundColor: colors.card,
            borderRadius: '24px',
            padding: '40px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: colors.textMuted }}>
              スタンダード
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: 500, fontFamily: 'Georgia, serif' }}>¥5,800</span>
              <span style={{ fontSize: '15px', color: colors.textLight }}>/月</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
              {['全動画コンテンツ見放題', 'コミュニティ参加', '質問・相談 無制限'].map((item, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  fontSize: '15px',
                  color: colors.textMuted,
                }}>
                  <CheckCircle size={18} style={{ color: '#22c55e' }} />
                  {item}
                </li>
              ))}
            </ul>
            <button style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#fff',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              このプランを選ぶ
            </button>
          </div>

          {/* Feedback */}
          <div style={{
            backgroundColor: colors.text,
            borderRadius: '24px',
            padding: '40px',
            color: '#fff',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '6px 14px',
              backgroundColor: '#f97316',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              人気
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', opacity: 0.7 }}>
              フィードバック
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '48px', fontWeight: 500, fontFamily: 'Georgia, serif' }}>¥13,800</span>
              <span style={{ fontSize: '15px', opacity: 0.6 }}>/月</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
              {['スタンダードの全機能', 'プロの添削 月2回', 'ポートフォリオ添削'].map((item, idx) => (
                <li key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '12px',
                  fontSize: '15px',
                  opacity: 0.9,
                }}>
                  <CheckCircle size={18} style={{ color: '#84b9ef' }} />
                  {item}
                </li>
              ))}
            </ul>
            <button style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#fff',
              color: colors.text,
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              このプランを選ぶ
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{
        padding: '120px 24px',
        textAlign: 'center',
        background: `linear-gradient(180deg, ${colors.bg} 0%, #e8d5c4 100%)`,
      }}>
        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 500,
          marginBottom: '24px',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}>
          デザインを鍛えよう
        </h2>
        <p style={{
          fontSize: '17px',
          color: colors.textMuted,
          marginBottom: '40px',
        }}>
          あなたの悩みに合わせたトレーニングで、実践的なスキルを
        </p>
        <button style={{
          padding: '18px 40px',
          backgroundColor: colors.text,
          color: '#fff',
          border: 'none',
          borderRadius: '14px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          無料で始める
          <ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
};

export default TopPagePatternA;
