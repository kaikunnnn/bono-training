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
 *
 * サムネイルスタイル:
 * - thumbnailStyle="default": 角丸長方形（デフォルト）
 * - thumbnailStyle="wave": 波形マスク（詳細ページHeroと同様）
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stripLineBreakMarker } from '@/utils/textFormat';

// ============================================
// グラデーション定義
// ============================================

export type GradientPreset =
  | 'career-change'  // UIUXデザイナー転職
  | 'ui-beginner'    // UIデザイン入門（Figma基礎）
  | 'ui-visual'      // UIビジュアル入門
  | 'info-arch'      // 情報設計基礎
  | 'ux-design';     // UXデザイン基礎

interface GradientDef {
  from: string;
  to: string;
  mid?: string;
  /** オーバーレイ（暗くする用） */
  overlay?: string;
  /** 4点以上のカスタムグラデーション */
  customGradient?: string;
}

const GRADIENTS: Record<GradientPreset, GradientDef> = {
  'career-change': {
    from: '#482B4B',
    mid: '#2A2C42',
    to: '#141520',
    // 3点グラデーション + 12%黒オーバーレイ
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), linear-gradient(0deg, #482B4B 0%, #2A2C42 27%, #141520 100%)',
  },
  'ui-beginner': {
    from: '#684B4B',
    to: '#231C26',
    // 2点グラデーション + 12%黒オーバーレイ
    customGradient:
      'linear-gradient(0deg, rgba(0,0,0,0.12), rgba(0,0,0,0.12)), linear-gradient(0deg, rgba(104, 75, 75, 1) 0%, rgba(35, 28, 38, 1) 100%)',
  },
  'ui-visual': {
    from: '#304750',
    to: '#5D5B65',
    // 既存0.2 + 追加0.12 = 0.32
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.32), rgba(0,0,0,0.32)), linear-gradient(0deg, #304750 0%, #5D5B65 100%)',
  },
  'info-arch': {
    from: '#214234',
    to: '#8D7746',
    // 既存0.3 + 追加0.12 = 0.42
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.42), rgba(0,0,0,0.42)), linear-gradient(0deg, #214234 0%, #8D7746 100%)',
  },
  'ux-design': {
    from: '#F1BAC1',
    to: '#2F3F6D',
    // 既存0.4 + 追加0.12 = 0.52、4点グラデーション（反転）
    customGradient: 'linear-gradient(0deg, rgba(0,0,0,0.52), rgba(0,0,0,0.52)), linear-gradient(0deg, #F1BAC1 0%, #E27979 12%, #764749 54%, #2F3F6D 100%)',
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
  /** ステップ数 */
  stepCount?: number;
  /** 短縮タイトル（バッジ表示用、例: "UXデザイン"） */
  shortTitle?: string;
  /** グラデーションプリセット */
  gradientPreset?: GradientPreset;
  /** カスタムグラデーション（プリセットより優先） */
  customGradient?: GradientDef;
  /** カードのバリアント */
  variant?: 'gradient' | 'white';
  /** レイアウト方向 */
  orientation?: 'vertical' | 'horizontal';
  /** サムネイルスタイル */
  thumbnailStyle?: 'default' | 'wave';
  /** リンク先のベースパス */
  basePath?: string;
  /** ラベルテキスト（shortTitleがない場合のフォールバック） */
  label?: string;
  /** 追加のクラス名 */
  className?: string;
}

// ============================================
// ヘルパー関数
// ============================================

/**
 * グラデーションCSSを生成
 * @param gradient グラデーション定義
 * @param direction 方向 - 'vertical'(0deg: 下→上) または 'horizontal'(270deg: 右→左)
 */
function getGradientCSS(gradient: GradientDef, direction: 'vertical' | 'horizontal' = 'vertical'): string {
  const { from, to, mid, overlay, customGradient } = gradient;
  const deg = direction === 'horizontal' ? '270deg' : '0deg';

  // カスタムグラデーションがある場合は方向を差し替えて使用
  let gradientPart: string;
  if (customGradient) {
    // customGradientの0degを指定方向に置換
    gradientPart = customGradient.replace(/0deg/g, deg);
  } else if (mid) {
    // 3点グラデーション (career-change用)
    gradientPart = `linear-gradient(${deg}, ${from} 0%, ${mid} 19%, ${to} 100%)`;
  } else {
    gradientPart = `linear-gradient(${deg}, ${from} 0%, ${to} 100%)`;
  }

  if (overlay) {
    return `linear-gradient(${deg}, ${overlay} 0%, ${overlay} 100%), ${gradientPart}`;
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
      'inline-flex items-center justify-center px-[6px] py-1 rounded-[70px] border text-xs font-normal leading-[1] whitespace-nowrap',
      variant === 'light'
        ? 'border-white text-white'
        : 'border-[#293525] text-[#293525]'
    )}
  >
    {children}
  </div>
);

/** ステップ数表示 */
const StepCountDisplay: React.FC<{
  count: number;
  variant: 'light' | 'dark';
}> = ({ count, variant }) => (
  <div
    className={cn(
      'flex flex-col gap-0.5',
      variant === 'light' ? 'text-white' : 'text-[#293525]'
    )}
  >
    <span
      className={cn(
        'text-[10px] font-bold opacity-72 leading-[1.3]',
        variant === 'dark' ? 'text-[color:var(--text-disabled)]' : undefined
      )}
    >
      ステップ
    </span>
    <div className="flex items-center gap-[5px]">
      <span className="text-base font-bold leading-none">{count}</span>
      <span className="text-[13px] font-normal leading-[1.5]">つ</span>
    </div>
  </div>
);

/** 期間表示 */
const DurationDisplay: React.FC<{
  duration: string;
  variant: 'light' | 'dark';
}> = ({ duration, variant }) => (
  <div
    className={cn(
      'flex flex-col gap-0.5',
      variant === 'light' ? 'text-white' : 'text-[#293525]'
    )}
  >
    <span
      className={cn(
        'text-[10px] font-bold opacity-72 leading-[1.3]',
        variant === 'dark' ? 'text-[color:var(--text-disabled)]' : undefined
      )}
    >
      目安
    </span>
    <div className="flex items-center gap-[5px]">
      <span className="text-base font-bold leading-none">{duration}</span>
      <span className="text-[13px] font-normal leading-[1.5]">ヶ月</span>
    </div>
  </div>
);

/** 区切り線 */
const Divider: React.FC<{ variant: 'light' | 'dark' }> = ({ variant }) => (
  <div
    className={cn(
      'w-px h-[43px]',
      variant === 'light' ? 'bg-white/10' : 'bg-[#293525]/10'
    )}
  />
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

/**
 * タイトルを「｜」または「|」で分割してspan要素の配列として返す
 */
function renderTitleWithLineBreaks(title: string): React.ReactNode {
  // 全角「｜」または半角「|」で分割
  const parts = title.split(/[｜|]/);
  if (parts.length === 1) {
    return title;
  }
  return parts.map((part, index) => (
    <span key={index} className="block">
      {part}
    </span>
  ));
}

const RoadmapCardV2: React.FC<RoadmapCardV2Props> = ({
  slug,
  title,
  description,
  thumbnailUrl,
  estimatedDuration,
  stepCount,
  shortTitle,
  gradientPreset = 'career-change',
  customGradient,
  variant = 'gradient',
  orientation = 'vertical',
  thumbnailStyle = 'default',
  basePath = '/roadmaps/',
  label = 'ロードマップ',
  className,
}) => {
  // フォールバック: 未知のプリセットの場合はcareer-changeを使用
  const gradient = customGradient || GRADIENTS[gradientPreset] || GRADIENTS['career-change'];
  // 縦型: 下→上、横型: 左→右
  const gradientCSS = getGradientCSS(gradient, orientation === 'horizontal' ? 'horizontal' : 'vertical');
  const linkPath = `${basePath}${slug}`;
  const textVariant = variant === 'gradient' ? 'light' : 'dark';
  const isWaveStyle = thumbnailStyle === 'wave';
  // バッジに表示するテキスト（shortTitleがあればそれを優先）
  const badgeText = shortTitle || label;

  // 縦型レイアウト
  if (orientation === 'vertical') {
    return (
      <Link to={linkPath} className={cn('block group', className)}>
        <div
          className={cn(
            'overflow-hidden shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300',
            'group-hover:shadow-lg group-hover:scale-[1.02]',
            // Figma仕様: waveスタイルは角丸24px + 白ボーダー4px
            isWaveStyle
              ? 'rounded-[32px] border-4 border-white'
              : 'rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-1.5 sm:p-2 lg:p-2.5',
            variant === 'white' ? 'bg-white' : ''
          )}
          style={variant === 'gradient' ? { background: gradientCSS } : undefined}
        >
          {/* サムネイルエリア */}
          {isWaveStyle ? (
            // Wave スタイル: Figma仕様 - 内側コンテナは padding 16px、角丸はマスク形状に任せる
            // アスペクト比 800/433 ≈ 1.85:1
            // drop-shadowは親要素に適用してマスク形状に沿ったシャドウを実現
            <div className="p-4 overflow-hidden roadmap-card-wave-shadow">
              <div
                className="relative w-full aspect-[800/433] overflow-hidden roadmap-card-wave-mask"
                style={{ background: gradientCSS }}
              >
                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          ) : (
            // Default スタイル: 従来通り
            <div
              className="relative w-full h-[180px] sm:h-[220px] lg:h-[280px] overflow-hidden shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] border border-white/10 rounded-[24px] sm:rounded-[36px] lg:rounded-[52px]"
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
          )}

          {/* コンテンツエリア */}
          <div
            className={cn(
              'flex flex-col',
              isWaveStyle
                ? 'px-4 sm:px-6 lg:px-10 pb-5 sm:pb-6 lg:pb-8 gap-2.5'
                : 'p-4 sm:p-5 lg:p-6 gap-3 sm:gap-4 lg:gap-5'
            )}
          >
            {/* ヘッダー */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col items-start gap-2">
                <LabelBadge variant={textVariant}>{badgeText}</LabelBadge>
                <h3
                  className={cn(
                    'text-base sm:text-lg lg:text-xl font-bold leading-[1.65]',
                    textVariant === 'light' ? 'text-white' : 'text-[#293525]'
                  )}
                >
                  {renderTitleWithLineBreaks(title)}
                </h3>
              </div>
              <p
                className={cn(
                  'text-sm sm:text-base font-normal leading-[1.8]',
                  textVariant === 'light' ? 'text-white/80' : 'text-[#293525]/80'
                )}
              >
                {stripLineBreakMarker(description)}
              </p>
            </div>

            {/* フッター */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[18px]">
                {stepCount !== undefined && stepCount > 0 && (
                  <>
                    <StepCountDisplay count={stepCount} variant={textVariant} />
                    <Divider variant={textVariant} />
                  </>
                )}
                <DurationDisplay duration={estimatedDuration} variant={textVariant} />
              </div>
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
          'flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 overflow-hidden shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300',
          'group-hover:shadow-lg group-hover:scale-[1.01]',
          // Figma仕様: waveスタイルは角丸24px + 白ボーダー4px
          isWaveStyle
            ? 'rounded-[32px] border-4 border-white'
            : 'rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-1.5 sm:p-2 lg:p-2.5',
          variant === 'white' ? 'bg-white' : ''
        )}
        style={variant === 'gradient' ? { background: gradientCSS } : undefined}
      >
        {/* サムネイルエリア */}
        {isWaveStyle ? (
          // Wave スタイル: Figma仕様 - 内側コンテナは角丸16px + padding 16px
          // 横型: デスクトップでは固定幅、モバイルではアスペクト比維持
          // drop-shadowは親要素に適用してマスク形状に沿ったシャドウを実現
          <div className="w-full lg:flex-shrink-0 lg:w-[320px] xl:w-[435px] p-4 lg:pr-0 overflow-hidden roadmap-card-wave-shadow">
            <div
              className="relative w-full aspect-[800/433] lg:h-[300px] lg:aspect-auto overflow-hidden rounded-[16px] roadmap-card-wave-mask"
              style={{ background: gradientCSS }}
            >
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        ) : (
          // Default スタイル: 従来通り
          <div
            className="relative w-full lg:flex-shrink-0 lg:w-[320px] xl:w-[435px] h-[180px] sm:h-[220px] lg:h-[280px] overflow-hidden shadow-[0px_1px_24px_0px_rgba(0,0,0,0.16)] border border-white/10 rounded-[24px] sm:rounded-[36px] lg:rounded-[52px]"
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
        )}

        {/* コンテンツエリア */}
        <div
          className={cn(
            'flex flex-col flex-1 min-w-0',
            isWaveStyle
              ? 'px-4 sm:px-6 lg:px-10 pb-5 sm:pb-6 lg:pb-8 gap-2.5'
              : 'p-4 sm:p-5 lg:p-6 gap-3 sm:gap-4 lg:gap-5'
          )}
        >
          {/* ヘッダー */}
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col items-start gap-2">
              <LabelBadge variant={textVariant}>{badgeText}</LabelBadge>
              <h3
                className={cn(
                  'text-base sm:text-lg lg:text-xl font-bold leading-[1.65]',
                  textVariant === 'light' ? 'text-white' : 'text-[#293525]'
                )}
              >
                {renderTitleWithLineBreaks(title)}
              </h3>
            </div>
            <p
              className={cn(
                'text-sm sm:text-base font-normal leading-[1.8]',
                textVariant === 'light' ? 'text-white/80' : 'text-[#293525]/80'
              )}
            >
              {stripLineBreakMarker(description)}
            </p>
          </div>

          {/* フッター */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[18px]">
              {stepCount !== undefined && stepCount > 0 && (
                <>
                  <StepCountDisplay count={stepCount} variant={textVariant} />
                  <Divider variant={textVariant} />
                </>
              )}
              <DurationDisplay duration={estimatedDuration} variant={textVariant} />
            </div>
            <ArrowButton variant={textVariant} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoadmapCardV2;
