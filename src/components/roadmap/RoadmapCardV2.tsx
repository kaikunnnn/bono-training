/**
 * RoadmapCardV2 コンポーネント
 *
 * Figmaデザイン準拠のロードマップカード
 * PRD🏠_topUI_newBONO2026 node-id: 69-16224
 *
 * パターン:
 * - variant="gradient": 全面グラデーション背景
 * - variant="white": 白背景（サムネイルのみグラデーション）
 *
 * レイアウト:
 * - orientation="vertical": 縦型（デフォルト）
 * - orientation="horizontal": 横型
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// グラデーション定義
// ============================================

export type GradientPreset =
  | 'galaxy'      // 転職ロードマップ用（紫系）
  | 'infoarch'    // 情報設計用（グレー/茶系）
  | 'sunset'      // UXデザイン用（オレンジ/ピンク系）
  | 'ocean'       // Figma基礎用（ブルー系）
  | 'teal'        // UIビジュアル用（ティール系）
  | 'rose';       // その他（ローズ系）

interface GradientDef {
  from: string;
  to: string;
  mid?: string;
  /** オーバーレイ（暗くする用） */
  overlay?: string;
}

const GRADIENTS: Record<GradientPreset, GradientDef> = {
  galaxy: {
    from: '#211f38',
    mid: '#66465f',
    to: '#2e2734',
    overlay: 'rgba(0, 0, 0, 0.2)',
  },
  infoarch: {
    from: '#3d494e',
    to: '#696356',
    overlay: 'rgba(0, 0, 0, 0.1)',
  },
  sunset: {
    from: '#3d3035',
    mid: '#453540',
    to: '#352a30',
  },
  ocean: {
    from: '#2d3540',
    mid: '#384550',
    to: '#353d48',
  },
  teal: {
    from: '#304750',
    to: '#5d5b65',
  },
  rose: {
    from: '#3a3238',
    mid: '#453840',
    to: '#322a30',
  },
};

// ============================================
// 型定義
// ============================================

export interface RoadmapCardV2Props {
  /** ロードマップのスラッグ（URLに使用） */
  slug: string;
  /** ロードマップのタイトル */
  title: string;
  /** ロードマップの説明文 */
  description: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** 目安期間（例: "1-2", "6~"） */
  estimatedDuration: string;
  /** グラデーションプリセット */
  gradientPreset?: GradientPreset;
  /** カスタムグラデーション（プリセットより優先） */
  customGradient?: GradientDef;
  /** カードのバリアント */
  variant?: 'gradient' | 'white';
  /** レイアウト方向 */
  orientation?: 'vertical' | 'horizontal';
  /** リンク先のベースパス */
  basePath?: string;
  /** ラベルテキスト */
  label?: string;
  /** 追加のクラス名 */
  className?: string;
}

// ============================================
// ヘルパー関数
// ============================================

/**
 * グラデーションCSSを生成
 */
function getGradientCSS(gradient: GradientDef): string {
  const { from, to, mid, overlay } = gradient;
  const gradientPart = mid
    ? `linear-gradient(180deg, ${from} 7.8%, ${mid} 24.2%, ${to} 100%)`
    : `linear-gradient(180deg, ${from} 0%, ${to} 100%)`;

  if (overlay) {
    return `linear-gradient(90deg, ${overlay} 0%, ${overlay} 100%), ${gradientPart}`;
  }
  return gradientPart;
}

// ============================================
// サブコンポーネント
// ============================================

/** ラベルバッジ */
const LabelBadge: React.FC<{
  children: React.ReactNode;
  variant: 'light' | 'dark';
}> = ({ children, variant }) => (
  <div
    className={cn(
      'inline-flex items-center justify-center px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 rounded-full border text-[10px] sm:text-[11px] font-bold leading-none whitespace-nowrap',
      variant === 'light'
        ? 'border-white text-white'
        : 'border-[#293525] text-[#293525]'
    )}
  >
    {children}
  </div>
);

/** 期間表示 */
const DurationDisplay: React.FC<{
  duration: string;
  variant: 'light' | 'dark';
}> = ({ duration, variant }) => (
  <div
    className={cn(
      'flex items-center gap-1 sm:gap-1.5',
      variant === 'light' ? 'text-white' : 'text-[#293525]'
    )}
  >
    {/* 時計アイコン */}
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={cn('w-5 h-5 sm:w-6 sm:h-6 opacity-72', variant === 'light' ? 'text-white' : 'text-[#293525]')}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div className="flex items-center gap-0.5">
      <span className="text-[9px] sm:text-[10px] font-medium opacity-72">目安</span>
      <span className="text-sm sm:text-base font-bold">{duration}</span>
      <span className="text-[11px] sm:text-[13px] font-normal opacity-72">ヶ月</span>
    </div>
  </div>
);

/** 矢印ボタン */
const ArrowButton: React.FC<{
  variant: 'light' | 'dark';
}> = ({ variant }) => (
  <div
    className={cn(
      'flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border',
      variant === 'light'
        ? 'border-white/30 text-white'
        : 'border-[#293525]/30 text-[#293525]'
    )}
  >
    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
  </div>
);

// ============================================
// メインコンポーネント
// ============================================

const RoadmapCardV2: React.FC<RoadmapCardV2Props> = ({
  slug,
  title,
  description,
  thumbnailUrl,
  estimatedDuration,
  gradientPreset = 'galaxy',
  customGradient,
  variant = 'gradient',
  orientation = 'vertical',
  basePath = '/roadmaps/',
  label = 'ロードマップ',
  className,
}) => {
  const gradient = customGradient || GRADIENTS[gradientPreset];
  const gradientCSS = getGradientCSS(gradient);
  const linkPath = `${basePath}${slug}`;
  const textVariant = variant === 'gradient' ? 'light' : 'dark';

  // 縦型レイアウト
  if (orientation === 'vertical') {
    return (
      <Link to={linkPath} className={cn('block group', className)}>
        <div
          className={cn(
            'overflow-hidden rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-1.5 sm:p-2 lg:p-2.5 shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300',
            'group-hover:shadow-lg group-hover:scale-[1.02]',
            variant === 'white' ? 'bg-white' : ''
          )}
          style={variant === 'gradient' ? { background: gradientCSS } : undefined}
        >
          {/* サムネイルエリア */}
          <div
            className="relative w-full h-[180px] sm:h-[220px] lg:h-[280px] rounded-[24px] sm:rounded-[36px] lg:rounded-[52px] overflow-hidden shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] border border-white/10"
            style={{ background: gradientCSS }}
          >
            {thumbnailUrl && (
              <img
                src={thumbnailUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover rounded-[16px] sm:rounded-[22px] lg:rounded-[30px] m-1.5 sm:m-2 lg:m-2.5"
                style={{ width: 'calc(100% - 12px)', height: 'calc(100% - 12px)' }}
              />
            )}
          </div>

          {/* コンテンツエリア */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 p-4 sm:p-5 lg:p-6">
            {/* ヘッダー */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <div className="flex flex-col items-start gap-1.5 sm:gap-2 lg:gap-2.5">
                <LabelBadge variant={textVariant}>{label}</LabelBadge>
                <h3
                  className={cn(
                    'text-base sm:text-lg lg:text-xl font-bold leading-[1.65]',
                    textVariant === 'light' ? 'text-white' : 'text-[#293525]'
                  )}
                >
                  {title}
                </h3>
              </div>
              <p
                className={cn(
                  'text-sm sm:text-base lg:text-lg font-normal leading-[1.8]',
                  textVariant === 'light' ? 'text-white/80' : 'text-[#293525]/80'
                )}
              >
                {description}
              </p>
            </div>

            {/* フッター */}
            <div className="flex items-center justify-between">
              <DurationDisplay duration={estimatedDuration} variant={textVariant} />
              <ArrowButton variant={textVariant} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // 横型レイアウト（モバイルでは縦型にフォールバック）
  return (
    <Link to={linkPath} className={cn('block group', className)}>
      <div
        className={cn(
          'flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 overflow-hidden rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-1.5 sm:p-2 lg:p-2.5 shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300',
          'group-hover:shadow-lg group-hover:scale-[1.01]',
          variant === 'white' ? 'bg-white' : ''
        )}
        style={variant === 'gradient' ? { background: gradientCSS } : undefined}
      >
        {/* サムネイルエリア */}
        <div
          className="relative w-full lg:flex-shrink-0 lg:w-[320px] xl:w-[435px] h-[180px] sm:h-[220px] lg:h-[280px] rounded-[24px] sm:rounded-[36px] lg:rounded-[52px] overflow-hidden shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] border border-white/10"
          style={{ background: gradientCSS }}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="absolute inset-2 sm:inset-3 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] h-[calc(100%-16px)] sm:h-[calc(100%-24px)] object-cover rounded-[16px] sm:rounded-[22px] lg:rounded-[30px]"
            />
          )}
        </div>

        {/* コンテンツエリア */}
        <div className="flex flex-col flex-1 gap-3 sm:gap-4 lg:gap-5 p-4 sm:p-5 lg:p-6 min-w-0">
          {/* ヘッダー */}
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <div className="flex flex-col items-start gap-1.5 sm:gap-2 lg:gap-2.5">
              <LabelBadge variant={textVariant}>{label}</LabelBadge>
              <h3
                className={cn(
                  'text-base sm:text-lg lg:text-xl font-bold leading-[1.65]',
                  textVariant === 'light' ? 'text-white' : 'text-[#293525]'
                )}
              >
                {title}
              </h3>
            </div>
            <p
              className={cn(
                'text-sm sm:text-base lg:text-lg font-normal leading-[1.8]',
                textVariant === 'light' ? 'text-white/80' : 'text-[#293525]/80'
              )}
            >
              {description}
            </p>
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between">
            <DurationDisplay duration={estimatedDuration} variant={textVariant} />
            <ArrowButton variant={textVariant} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoadmapCardV2;
