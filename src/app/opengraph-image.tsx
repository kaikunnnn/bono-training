import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BONO - UIUXデザインを学ぶ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #102720 0%, #1a3a30 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* ロゴエリア */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            BONO
          </div>
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "rgba(255,255,255,0.9)",
            textAlign: "center",
            lineHeight: 1.5,
            maxWidth: 800,
          }}
        >
          UIUXデザインを体系的に学ぶ
        </div>

        {/* サブテキスト */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          ロードマップ・レッスン・記事で効率的にスキルアップ
        </div>

        {/* ドメイン */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          app.bo-no.design
        </div>
      </div>
    ),
    { ...size }
  );
}
