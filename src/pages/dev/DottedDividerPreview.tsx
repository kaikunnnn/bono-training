import Layout from "@/components/layout/Layout";
import { cn } from "@/lib/utils";

/**
 * DottedDivider プレビューページ
 *
 * 確認用: http://localhost:5173/dev/dotted-divider
 */

// ============================================
// パターン1: CSS border-style: dotted（参考：角ばったドット）
// ============================================
function CssDottedDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("border-t-2 border-dotted border-gray-300", className)}
    />
  );
}

// ============================================
// パターン2: radial-gradient で丸ドット
// ============================================
interface GradientDotDividerProps {
  dotSize?: number;
  gap?: number;
  color?: string;
  className?: string;
}

function GradientDotDivider({
  dotSize = 4,
  gap = 8,
  color = "#D1D5DB",
  className,
}: GradientDotDividerProps) {
  const spacing = dotSize + gap;
  return (
    <div
      className={cn("w-full", className)}
      style={{
        height: dotSize,
        backgroundImage: `radial-gradient(circle, ${color} ${dotSize / 2}px, transparent ${dotSize / 2}px)`,
        backgroundSize: `${spacing}px ${dotSize}px`,
        backgroundPosition: "center",
      }}
    />
  );
}

// ============================================
// パターン3: Flexbox で丸要素を繰り返し
// ============================================
interface FlexDotDividerProps {
  dotSize?: number;
  gap?: number;
  color?: string;
  className?: string;
}

function FlexDotDivider({
  dotSize = 4,
  gap = 8,
  color = "bg-gray-300",
  className,
}: FlexDotDividerProps) {
  // 画面幅に応じて十分な数のドットを生成
  const dotCount = 100;
  return (
    <div className={cn("flex items-center justify-center overflow-hidden", className)}>
      <div className="flex items-center" style={{ gap }}>
        {Array.from({ length: dotCount }).map((_, i) => (
          <div
            key={i}
            className={cn("rounded-full flex-shrink-0", color)}
            style={{ width: dotSize, height: dotSize }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// パターン4: SVG パターン
// ============================================
interface SvgDotDividerProps {
  dotSize?: number;
  gap?: number;
  color?: string;
  className?: string;
}

function SvgDotDivider({
  dotSize = 4,
  gap = 8,
  color = "#D1D5DB",
  className,
}: SvgDotDividerProps) {
  const spacing = dotSize + gap;
  const patternId = `dot-pattern-${dotSize}-${gap}`;

  return (
    <div className={cn("w-full", className)} style={{ height: dotSize }}>
      <svg width="100%" height={dotSize}>
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={spacing}
            height={dotSize}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={dotSize / 2}
              cy={dotSize / 2}
              r={dotSize / 2}
              fill={color}
            />
          </pattern>
        </defs>
        <rect width="100%" height={dotSize} fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}

// ============================================
// メインプレビュー
// ============================================
export default function DottedDividerPreview() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16 h-fit">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dotted Divider Preview</h1>
          <p className="text-gray-600">
            セクション間の丸ドットボーダーのパターン比較
          </p>
        </div>

        {/* パターン1: CSS dotted（参考） */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-400">
            参考: CSS border-dotted（角ばったドット）
          </h2>
          <div className="bg-white rounded-lg border p-8">
            <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
            <CssDottedDivider />
            <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
          </div>
          <p className="text-sm text-gray-500">※ CSSのdottedは角ばるので不採用</p>
        </section>

        {/* パターン2: Gradient（推奨） */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-green-600">
            🎯 パターンA: radial-gradient（推奨・軽量）
          </h2>

          {/* A-1: 小さいドット */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-1: 小ドット（3px / gap 6px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={3} gap={6} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          {/* A-2: 中サイズドット */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-2: 中ドット（4px / gap 8px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={4} gap={8} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          {/* A-3: 大きいドット */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-3: 大ドット（6px / gap 12px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={6} gap={12} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          {/* A-4: 密なドット */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-4: 密ドット（2px / gap 4px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={2} gap={4} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          {/* A-4b: 小ドット gap 6 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-4b: 小ドット（2px / gap 6px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={2} gap={6} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          {/* A-4c: 小ドット gap 8 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-4c: 小ドット（2px / gap 8px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={2} gap={8} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          {/* A-5: 薄い色 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">A-5: 薄い色（4px / gap 8px / #E5E7EB）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <GradientDotDivider dotSize={4} gap={8} color="#E5E7EB" />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>
        </section>

        {/* パターン3: Flexbox */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-blue-600">
            パターンB: Flexbox繰り返し
          </h2>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">B-1: 中ドット（4px / gap 8px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <FlexDotDivider dotSize={4} gap={8} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">B-2: 大ドット（6px / gap 10px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <FlexDotDivider dotSize={6} gap={10} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>
        </section>

        {/* パターン4: SVG */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-purple-600">
            パターンC: SVGパターン
          </h2>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">C-1: 中ドット（4px / gap 8px）</p>
            <div className="bg-white rounded-lg border p-8">
              <div className="text-center text-sm text-gray-500 mb-4">セクション1</div>
              <SvgDotDivider dotSize={4} gap={8} />
              <div className="text-center text-sm text-gray-500 mt-4">セクション2</div>
            </div>
          </div>
        </section>

        {/* 実際の使用イメージ */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">実際の使用イメージ（bg-base上）</h2>

          <div className="rounded-lg p-8" style={{ backgroundColor: '#F9F9F7' }}>
            <div className="space-y-8">
              {/* セクション1 */}
              <div>
                <h3 className="font-bold text-lg mb-2">転職・キャリアチェンジしたい</h3>
                <p className="text-sm text-gray-600">カードがここに表示される...</p>
              </div>

              {/* ドット区切り */}
              <GradientDotDivider dotSize={4} gap={8} color="#D1D5DB" />

              {/* セクション2 */}
              <div>
                <h3 className="font-bold text-lg mb-2">ユーザー中心デザインを身につけたい</h3>
                <p className="text-sm text-gray-600">カードがここに表示される...</p>
              </div>

              {/* ドット区切り */}
              <GradientDotDivider dotSize={4} gap={8} color="#D1D5DB" />

              {/* セクション3 */}
              <div>
                <h3 className="font-bold text-lg mb-2">基礎スキルを体系的に身につけたい</h3>
                <p className="text-sm text-gray-600">カードがここに表示される...</p>
              </div>
            </div>
          </div>
        </section>

        {/* 色バリエーション */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">色バリエーション</h2>

          <div className="grid grid-cols-1 gap-4">
            {[
              { name: "gray-300", color: "#D1D5DB" },
              { name: "gray-200", color: "#E5E7EB" },
              { name: "gray-400", color: "#9CA3AF" },
              { name: "text-disabled", color: "#9AA29F" },
              { name: "bg-active", color: "#E0E1DC" },
            ].map(({ name, color }) => (
              <div key={name} className="bg-white rounded-lg border p-6">
                <p className="text-xs text-gray-500 mb-3">{name}: {color}</p>
                <GradientDotDivider dotSize={4} gap={8} color={color} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
