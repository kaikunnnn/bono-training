interface EllipseArcProps {
  /**
   * 弧の高さ（デフォルト: 40px）
   */
  height?: number;
  /**
   * 背景色（デフォルト: #F9F9F7 = bg-base）
   */
  bgColor?: string;
  /**
   * カスタムクラス
   */
  className?: string;
}

/**
 * EllipseArc コンポーネント
 * 楕円弧の装飾要素（セクション区切りなどに使用）
 *
 * 使用例:
 * - ヒーローセクションの下部
 * - グラデーションと背景の接続部分
 *
 * CSS定義は src/index.css の .arc-wrapper, .ellipse を参照
 */
export function EllipseArc({
  height = 40,
  bgColor = "#F9F9F7",
  className = "",
}: EllipseArcProps) {
  return (
    <div
      className={`arc-wrapper ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="ellipse" style={{ background: bgColor }} />
    </div>
  );
}

export default EllipseArc;
