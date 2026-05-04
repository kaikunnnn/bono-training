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
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { stripLineBreakMarker } from '@/utils/textFormat';
import { type GradientPreset, GRADIENTS } from '@/styles/gradients';
import {
  type RoadmapCardV2Props,
  LabelBadge,
  StepCountDisplay,
  DurationDisplay,
  Divider,
  ArrowButton,
  buildGradientCSS,
  renderTitleWithLineBreaks,
} from './card';

// re-export for backward compatibility
export type { GradientPreset };
export type { RoadmapCardV2Props };

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
  basePath = '/roadmap/',
  label = 'ロードマップ',
  className,
}) => {
  // フォールバック: 未知のプリセットの場合はcareer-changeを使用
  const gradient = customGradient || GRADIENTS[gradientPreset] || GRADIENTS['career-change'];
  // 縦型: 下→上、横型: 左→右
  const gradientCSS = buildGradientCSS(gradient, orientation === 'horizontal' ? 'horizontal' : 'vertical');
  const linkPath = `${basePath}${slug}`;
  const textVariant = variant === 'gradient' ? 'light' : 'dark';
  const isWaveStyle = thumbnailStyle === 'wave';
  // バッジに表示するテキスト（shortTitleがあればそれを優先）
  const badgeText = shortTitle || label;

  // 縦型レイアウト
  if (orientation === 'vertical') {
    return (
      <Link href={linkPath} className={cn('block group', className)}>
        <div
          className={cn(
            'overflow-hidden shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] will-change-transform',
            'group-hover:shadow-lg group-hover:scale-[1.02]',
            // Figma仕様: waveスタイルは角丸24px + 白ボーダー4px
            isWaveStyle
              ? 'rounded-[32px] border-4 border-white'
              : 'rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-1.5 sm:p-2 lg:p-2.5',
            variant === 'white' ? 'bg-white' : ''
          )}
          style={{
            ...(variant === 'gradient' ? { background: gradientCSS } : {}),
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
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
    <Link href={linkPath} className={cn('block group', className)}>
      <div
        className={cn(
          'flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 overflow-hidden shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] will-change-transform',
          'group-hover:shadow-lg group-hover:scale-[1.01]',
          // Figma仕様: waveスタイルは角丸24px + 白ボーダー4px
          isWaveStyle
            ? 'rounded-[32px] border-4 border-white'
            : 'rounded-[32px] sm:rounded-[48px] lg:rounded-[64px] p-1.5 sm:p-2 lg:p-2.5',
          variant === 'white' ? 'bg-white' : ''
        )}
        style={{
          ...(variant === 'gradient' ? { background: gradientCSS } : {}),
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
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
