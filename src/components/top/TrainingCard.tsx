/**
 * トップ トレーニングカード
 * - 420×570px の固定サイズカード
 * - 3D回転アイキャッチ
 * - レスポンシブ対応
 */

import Link from 'next/link';
import type { TrainingCardData } from './types';
import InfoArchEyecatch from './eyecatch/InfoArchEyecatch';
import UIUXCareerEyecatch from './eyecatch/UIUXCareerEyecatch';
import UXDesignEyecatch from './eyecatch/UXDesignEyecatch';
import UIVisualEyecatch from './eyecatch/UIVisualEyecatch';

interface TrainingCardProps {
  data: TrainingCardData;
}

// アイキャッチコンポーネントマッピング
const EYECATCH_COMPONENTS = {
  'info-arch': InfoArchEyecatch,
  'uiux-career': UIUXCareerEyecatch,
  'ux-design': UXDesignEyecatch,
  'ui-visual': UIVisualEyecatch,
};

export default function TrainingCard({ data }: TrainingCardProps) {
  const EyecatchComponent = EYECATCH_COMPONENTS[data.eyecatchType];

  return (
    <Link
      href={`/roadmaps/${data.roadmapSlug}`}
      className="
        group
        relative
        block
        w-[300px] sm:w-[350px] lg:w-[420px]
        h-[407px] sm:h-[476px] lg:h-[570px]
        rounded-[28px] sm:rounded-[32px]
        shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)]
        flex-shrink-0
        overflow-hidden
        hover:scale-[1.05]
        hover:shadow-[0px_8px_24px_0px_rgba(0,0,0,0.16)]
      "
      style={{
        background: data.backgroundGradient || data.backgroundColor,
        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {/* 左上ラベル - カテゴリ */}
      <div className="absolute left-5 sm:left-7 top-5 sm:top-7 z-10">
        <p
          className="text-sm sm:text-base font-bold"
          style={{ color: data.categoryColor }}
        >
          {data.category}
        </p>
      </div>

      {/* 右上ラベル - トレーニング */}
      <div className="absolute left-[215px] sm:left-[252px] lg:left-[302px] top-5 sm:top-[23px] lg:top-7 z-10">
        <p
          className="text-sm font-bold whitespace-nowrap"
          style={{
            color: data.categoryColor,
            opacity: data.badgeOpacity || 0.62,
          }}
        >
          {data.badge}
        </p>
      </div>

      {/* 中央大タイトル（背景） */}
      <div
        className="
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          z-0 pointer-events-none
          w-full text-center
        "
      >
        <h2
          className="
            text-[54px] sm:text-[72px] lg:text-[96px]
            font-bold leading-[1.52]
            tracking-tight
            italic
            font-noto-sans-jp
            whitespace-nowrap
            transition-transform duration-[800ms] ease-out
            group-hover:-translate-x-5
          "
          style={{
            color: data.largeTitleColor,
            transform: 'skewX(-0.38deg)',
          }}
        >
          {data.largeTitle}
        </h2>
      </div>

      {/* 3D回転カード（アイキャッチ） - レスポンシブ対応 */}
      <div
        className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.714] sm:scale-[0.833] lg:scale-100"
        style={{
          width: `${data.eyecatchPosition.width}px`,
          height: `${data.eyecatchPosition.height}px`,
        }}
      >
        <EyecatchComponent />
      </div>

      {/* 下部説明文 */}
      <div
        className="absolute left-0 right-0 z-10"
        style={{
          bottom: 'clamp(16px, 4vw, 24px)',
        }}
      >
        <p
          className="text-[10px] sm:text-xs font-bold text-center"
          style={{
            color: data.categoryColor,
            opacity: data.descriptionOpacity || 0.64,
            lineHeight: '1.52',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            display: 'block',
            width: '100%',
          }}
        >
          {data.description}
        </p>
      </div>
    </Link>
  );
}

// 固定データ（4枚のカード）
export const TRAINING_CARDS_DATA: TrainingCardData[] = [
  {
    id: 'uiux-career',
    category: 'UIUX転職',
    categoryColor: '#5e6871',
    badge: 'トレーニング',
    badgeOpacity: 0.6,
    backgroundColor: '#e8e8e8',
    backgroundGradient: 'linear-gradient(180deg, rgba(232, 235, 251, 0.35) 0%, rgba(214, 189, 213, 0.35) 47.461%, rgba(234, 209, 189, 0.35) 76.635%, rgba(248, 245, 245, 0.35) 100%)',
    largeTitle: 'UIUX転職',
    largeTitleColor: '#b7b7b9',
    description: '情報設計でユーザー中心のUI設計をはじめるロードマップ',
    descriptionOpacity: 0.64,
    eyecatchType: 'uiux-career',
    badgeRotation: -2,
    roadmapSlug: 'uiux-career-change',
    eyecatchPosition: {
      left: 42,
      top: 140,
      width: 335.456,
      height: 290.266,
    },
  },
  {
    id: 'ux-design',
    category: '顧客の課題解決',
    categoryColor: '#525382',
    badge: 'トレーニング',
    badgeOpacity: 0.62,
    backgroundColor: '#ffc8d8',
    largeTitle: 'ユーザー価値',
    largeTitleColor: '#0015ff',
    description: 'ユーザー起点で課題解決をするロードマップ',
    descriptionOpacity: 0.64,
    eyecatchType: 'ux-design',
    badgeRotation: -3,
    roadmapSlug: 'ux-design-basic',
    eyecatchPosition: {
      left: 72.35,
      top: 145,
      width: 274.301,
      height: 274.301,
    },
  },
  {
    id: 'info-arch',
    category: '情報設計',
    categoryColor: '#774000',
    badge: 'トレーニング',
    badgeOpacity: 0.62,
    backgroundColor: '#cbdcca',
    largeTitle: '情報設計のきほん',
    largeTitleColor: '#ff8800',
    description: '情報設計でユーザー中心のUI設計をはじめるロードマップ',
    descriptionOpacity: 0.64,
    eyecatchType: 'info-arch',
    badgeRotation: 4,
    roadmapSlug: 'information-architecture',
    eyecatchPosition: {
      left: 73,
      top: 151,
      width: 274.301,
      height: 274.301,
    },
  },
  {
    id: 'ui-visual',
    category: 'UIデザイン',
    categoryColor: '#08381d',
    badge: 'トレーニング',
    badgeOpacity: 0.57,
    backgroundColor: '#c9d1ff',
    largeTitle: 'UIビジュアル',
    largeTitleColor: '#e2fc19',
    description: 'ユーザー起点で課題解決をするロードマップ',
    descriptionOpacity: 0.64,
    eyecatchType: 'ui-visual',
    badgeRotation: 2,
    roadmapSlug: 'ui-visual',
    eyecatchPosition: {
      left: 73.35,
      top: 148,
      width: 274.301,
      height: 274.301,
    },
  },
];
