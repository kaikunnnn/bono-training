"use client";

/**
 * 最小ホバーテスト — Tailwindクラス一切不使用
 */
export default function HoverTestPage() {
  return (
    <div style={{ background: "#F9F9F7", minHeight: "100vh", padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>Hover Test (inline style only, no Tailwind)</h1>

      <style>{`
        .pure-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          width: 240px;
          cursor: pointer;
          box-shadow: 0px 1px 8px rgba(0,0,0,0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pure-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0px 12px 32px rgba(0,0,0,0.2);
        }
      `}</style>

      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: "bold", color: "#888", marginBottom: 8 }}>1. CSS :hover (no Tailwind class)</p>
          <div className="pure-card">
            <p style={{ fontWeight: "bold" }}>Pure CSS</p>
            <p style={{ fontSize: 14, color: "#666" }}>Should animate smoothly</p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: "bold", color: "#888", marginBottom: 8 }}>2. !important override</p>
          <style>{`
            .force-card {
              background: white;
              border-radius: 16px;
              padding: 24px;
              width: 240px;
              cursor: pointer;
              box-shadow: 0px 1px 8px rgba(0,0,0,0.08) !important;
              transition-property: transform, box-shadow !important;
              transition-duration: 0.3s !important;
              transition-timing-function: ease !important;
            }
            .force-card:hover {
              transform: translateY(-6px) scale(1.03) !important;
              box-shadow: 0px 12px 32px rgba(0,0,0,0.2) !important;
            }
          `}</style>
          <div className="force-card">
            <p style={{ fontWeight: "bold" }}>!important</p>
            <p style={{ fontSize: 14, color: "#666" }}>Force with !important</p>
          </div>
        </div>
      </div>
    </div>
  );
}
