/**
 * RoadmapCard コンポーネント
 *
 * ロードマップ一覧で使用するカードコンポーネント
 * - グラデーション背景（ロードマップタイプによって色が変わる）
 * - 特殊形状のサムネイルエリア
 * - ステップ数・目安期間の表示
 * - 全体がクリッカブル（リンク）
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

// グラデーションカラータイプ
export type GradientType =
  // === Classic (オリジナルベース) ===
  | 'teal'           // UIビジュアル基礎 (デフォルト)
  | 'uivisual'       // UIビジュアル (tealのエイリアス)
  | 'blue'           // UXデザイン系
  | 'purple'         // 上級・応用系
  | 'orange'         // 実践・アウトプット系
  | 'green'          // 初心者・入門系
  | 'pink'           // キャリア系
  // === Modern 2025-2026 Trends ===
  | 'cyber'          // Cyber Pink: ネオンピンク×ダークスペース
  | 'galaxy'         // Galaxy Purple: 宇宙的な深いパープル
  | 'neon'           // Neon Tech: シアン×バイオレット
  | 'sunset'         // Sunset Glow: オレンジ×ピンク×パープル
  | 'aurora'         // Aurora: グリーン×ブルー×パープル
  | 'thermal'        // Thermal Glow: 熱画像風の赤×オレンジ
  | 'midnight'       // Midnight Blue: 深い夜空
  | 'emerald'        // Emerald Tech: エメラルド×ダーク
  | 'rose'           // Rose Gold: ローズゴールド×ダーク
  | 'ocean'          // Ocean Deep: 深海ブルー
  | 'lavender'       // Lavender Dream: ラベンダー×パープル
  | 'coral'          // Coral Reef: コーラル×ピーチ
  | 'infoarch';      // Information Architecture: 構造的なブルー

// グラデーション定義
// 2025-2026 トレンド: Soft Gradients 2.0, Cinematic/Sci-Fi, Thermal Glow
const GRADIENTS: Record<GradientType, { from: string; to: string; mid?: string }> = {
  // === Classic (低彩度・洗練) ===
  teal: { from: '#304750', to: '#5d5b65' },
  uivisual: { from: '#304750', to: '#5d5b65' },  // tealのエイリアス
  blue: { from: '#354a5f', to: '#565a65' },
  purple: { from: '#4a4058', to: '#5d5b65' },
  orange: { from: '#5a4235', to: '#5d5960' },
  green: { from: '#3a4d42', to: '#585d5a' },
  pink: { from: '#504050', to: '#605a62' },

  // === Modern Cinematic/Sci-Fi (低彩度・落ち着き) ===
  cyber: { from: '#2a2535', to: '#363040', mid: '#302a3a' },      // ダークスペース
  galaxy: { from: '#35303f', to: '#2d2a35', mid: '#3a3545' },     // コズミックパープル
  neon: { from: '#2a3038', to: '#353a42', mid: '#303540' },       // テックブルー
  midnight: { from: '#282535', to: '#35324a', mid: '#302d40' },   // ミッドナイト

  // === Modern Warm (低彩度・落ち着き) ===
  sunset: { from: '#3d3035', to: '#352a30', mid: '#453540' },     // サンセット
  thermal: { from: '#3a3032', to: '#302a30', mid: '#453538' },    // サーマルレッド
  coral: { from: '#403535', to: '#352d32', mid: '#4a3a3d' },      // コーラル
  rose: { from: '#3a3238', to: '#322a30', mid: '#453840' },       // ローズゴールド

  // === Modern Cool/Fresh (低彩度・落ち着き) ===
  aurora: { from: '#2a3538', to: '#303a3d', mid: '#354042' },     // オーロラグリーン
  emerald: { from: '#2d3835', to: '#303538', mid: '#354038' },    // エメラルド
  ocean: { from: '#2d3540', to: '#353d48', mid: '#384550' },      // オーシャンブルー
  lavender: { from: '#353040', to: '#302a38', mid: '#3a3545' },   // ラベンダー
  infoarch: { from: '#2a3545', to: '#3d4555', mid: '#354050' },   // 情報設計ブルー
};

export interface RoadmapCardProps {
  /** ロードマップのスラッグ（URLに使用） */
  slug: string;
  /** ロードマップのタイトル */
  title: string;
  /** ロードマップの説明文 */
  description: string;
  /** サムネイル画像URL */
  thumbnailUrl?: string;
  /** ステップ数 */
  stepCount: number;
  /** ステップの単位（デフォルト: "ヶ月"） */
  stepUnit?: string;
  /** 目安期間（例: "1-2"） */
  estimatedDuration: string;
  /** 目安期間の単位（デフォルト: "ヶ月"） */
  durationUnit?: string;
  /** グラデーションタイプ */
  gradientType?: GradientType;
  /** リンク先のベースパス（デフォルト: "/roadmaps/"） */
  basePath?: string;
}

/**
 * サムネイルエリアの特殊形状クリップパス
 * 下部が内側にカーブした形状
 */
const ThumbnailShape: React.FC<{
  children: React.ReactNode;
  gradient: { from: string; to: string; mid?: string };
}> = ({ children, gradient }) => {
  const bgStyle = gradient.mid
    ? `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.mid} 50%, ${gradient.to} 100%)`
    : `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`;

  return (
    <div className="relative w-full">
      {/* SVG定義 */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="thumbnail-clip" clipPathUnits="objectBoundingBox">
            {/* 特殊形状: 下部が内側にカーブ */}
            <path d="M0,0 L1,0 L1,0.85 C0.85,0.95 0.65,1 0.5,1 C0.35,1 0.15,0.95 0,0.85 L0,0 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* サムネイルコンテナ */}
      <div
        className="relative w-full aspect-[503/240] overflow-hidden"
        style={{
          clipPath: 'url(#thumbnail-clip)',
          background: bgStyle
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 統計情報アイテム
 */
const StatItem: React.FC<{
  label: string;
  value: string | number;
  unit: string;
  showBorder?: boolean;
}> = ({ label, value, unit, showBorder = true }) => (
  <div
    className={`flex flex-col gap-0.5 px-5 ${
      showBorder ? 'border-r border-white/10' : ''
    }`}
  >
    <span className="text-xs font-bold text-white/70 font-noto-sans">
      {label}
    </span>
    <div className="flex items-end gap-1 text-white">
      <span className="text-base font-bold font-inter leading-none">
        {value}
      </span>
      <span className="text-[13px] font-normal font-noto-sans leading-tight">
        {unit}
      </span>
    </div>
  </div>
);

/**
 * グラデーションスタイルを生成
 */
const getGradientStyle = (gradient: { from: string; to: string; mid?: string }) => {
  if (gradient.mid) {
    return `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.mid} 50%, ${gradient.to} 100%)`;
  }
  return `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`;
};

const RoadmapCard: React.FC<RoadmapCardProps> = ({
  slug,
  title,
  description,
  thumbnailUrl,
  stepCount,
  stepUnit = 'ヶ月',
  estimatedDuration,
  durationUnit = 'ヶ月',
  gradientType = 'teal',
  basePath = '/roadmaps/',
}) => {
  // フォールバック: 未定義のgradientTypeの場合はtealを使用
  const gradient = GRADIENTS[gradientType] || GRADIENTS.teal;
  const linkPath = `${basePath}${slug}`;
  const gradientStyle = getGradientStyle(gradient);

  return (
    <Link
      to={linkPath}
      className="block w-full max-w-[512px] group"
    >
      <div
        className="relative overflow-hidden rounded-3xl border-4 border-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:shadow-lg group-hover:scale-[1.02]"
        style={{ background: gradientStyle }}
      >
        {/* サムネイルエリア */}
        <div className="px-4 pt-3">
          <ThumbnailShape gradient={gradient}>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/40 text-sm">No Image</span>
              </div>
            )}
          </ThumbnailShape>
        </div>

        {/* タイトル */}
        <h3 className="px-7 mt-4 text-xl font-bold text-white font-noto-sans leading-relaxed">
          {title}
        </h3>

        {/* 統計情報 */}
        <div className="flex items-center mt-3 px-2">
          <StatItem
            label="ステップ"
            value={stepCount}
            unit={stepUnit}
            showBorder={true}
          />
          <StatItem
            label="目安"
            value={estimatedDuration}
            unit={durationUnit}
            showBorder={false}
          />
        </div>

        {/* 説明文 */}
        <p className="px-7 mt-4 text-base text-white/80 font-noto-sans leading-[1.8]">
          {description}
        </p>

        {/* CTAボタン */}
        <div className="px-7 pb-6 mt-4">
          <div className="flex items-center justify-between px-6 py-3 bg-black rounded-[14px] border border-white/10">
            <span className="flex-1 text-sm font-bold text-white text-center font-inter tracking-wide">
              詳細を見る
            </span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoadmapCard;
