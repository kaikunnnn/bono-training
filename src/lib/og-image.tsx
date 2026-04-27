import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * 汎用OGP画像生成
 * セクション一覧ページや、コンテンツがない場合のフォールバックに使用
 */
export function generateOgImage({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #102720 0%, #1a3a30 100%)",
          fontFamily: "sans-serif",
          padding: "60px 80px",
        }}
      >
        {/* ラベル */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 100,
              padding: "4px 14px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        </div>

        {/* タイトル */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.3,
            marginBottom: description ? 16 : 0,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* 説明文 */}
        {description && (
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.6,
              maxWidth: 800,
            }}
          >
            {description}
          </div>
        )}

        {/* BONO ロゴ（右上） */}
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 80,
            fontSize: 28,
            fontWeight: 900,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-1px",
          }}
        >
          BONO
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
