"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type TintBlend = "soft-light" | "overlay" | "color" | "multiply";

export interface PhotoFrostedGrainParams {
  /** FileReader.readAsDataURL() で読み込んだ data URL。未選択時は null */
  imageDataUrl: string | null;
  headlineText: string;
  textColor: string;
  blur: number;
  grainOp: number;
  grainFreq: number;
  bright: number;
  sat: number;
  tintColor: string;
  tintOp: number;
  tintBlend: TintBlend;
}

export interface PhotoFrostedGrainHandle {
  /** 画像未選択なら null を返す */
  exportPNG: () => string | null;
}

interface PhotoFrostedGrainProps extends PhotoFrostedGrainParams {
  className?: string;
}

function grainDataUri(freq: number): string {
  const f = (freq / 100).toFixed(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${f}" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const PhotoFrostedGrain = forwardRef<PhotoFrostedGrainHandle, PhotoFrostedGrainProps>(
  function PhotoFrostedGrain(
    {
      imageDataUrl,
      headlineText,
      textColor,
      blur,
      grainOp,
      grainFreq,
      bright,
      sat,
      tintColor,
      tintOp,
      tintBlend,
      className,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgElRef = useRef<HTMLImageElement | null>(null);

    // data URL が変わるたびに、実寸(naturalWidth/Height)を読むための素のImageを読み込んでおく
    useEffect(() => {
      if (!imageDataUrl) {
        imgElRef.current = null;
        return;
      }
      const img = new Image();
      img.onload = () => {
        imgElRef.current = img;
      };
      img.src = imageDataUrl;
      return () => {
        img.onload = null;
      };
    }, [imageDataUrl]);

    useImperativeHandle(
      ref,
      () => ({
        exportPNG() {
          const container = containerRef.current;
          const img = imgElRef.current;
          if (!container || !img) return null;
          const rect = container.getBoundingClientRect();
          const W = Math.round(rect.width * 2);
          const H = Math.round(rect.height * 2);
          if (W <= 0 || H <= 0) return null;

          const cv = document.createElement("canvas");
          cv.width = W;
          cv.height = H;
          const ctx = cv.getContext("2d");
          if (!ctx) return null;

          const ir = img.naturalWidth / img.naturalHeight;
          const sr = W / H;
          let dw: number, dh: number;
          if (ir > sr) {
            dh = H * 1.15;
            dw = dh * ir;
          } else {
            dw = W * 1.15;
            dh = dw / ir;
          }
          const dx = (W - dw) / 2;
          const dy = (H - dh) / 2;
          ctx.filter = `blur(${blur * 2}px) brightness(${bright / 100}) saturate(${sat / 100})`;
          ctx.drawImage(img, dx, dy, dw, dh);
          ctx.filter = "none";

          const to = tintOp / 100;
          if (to > 0) {
            ctx.globalAlpha = to;
            ctx.globalCompositeOperation =
              tintBlend === "multiply"
                ? "multiply"
                : tintBlend === "overlay"
                  ? "overlay"
                  : tintBlend === "color"
                    ? "color"
                    : "soft-light";
            ctx.fillStyle = tintColor;
            ctx.fillRect(0, 0, W, H);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
          }

          const go = grainOp / 100;
          if (go > 0) {
            const gc = document.createElement("canvas");
            gc.width = W;
            gc.height = H;
            const gx = gc.getContext("2d")!;
            const id = gx.createImageData(W, H);
            for (let i = 0; i < id.data.length; i += 4) {
              const n = (Math.random() * 255) | 0;
              id.data[i] = id.data[i + 1] = id.data[i + 2] = n;
              id.data[i + 3] = 255;
            }
            gx.putImageData(id, 0, 0);
            ctx.globalAlpha = go;
            ctx.globalCompositeOperation = "overlay";
            ctx.drawImage(gc, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
          }

          const parts = headlineText.split("|").map((s) => s.trim());
          ctx.fillStyle = textColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const fs = Math.round(W * 0.075);
          ctx.font = `500 ${fs}px Georgia, serif`;
          ctx.shadowColor = "rgba(0,0,0,0.28)";
          ctx.shadowBlur = W * 0.02;
          ctx.shadowOffsetY = 4;
          const lh = fs * 1.12;
          const startY = H / 2 - ((parts.length - 1) * lh) / 2;
          parts.forEach((p, i) => ctx.fillText(p, W / 2, startY + i * lh));

          return cv.toDataURL("image/png");
        },
      }),
      [blur, bright, sat, tintColor, tintOp, tintBlend, grainOp, headlineText, textColor],
    );

    const headlineParts = headlineText.split("|").map((s) => s.trim());

    return (
      <div ref={containerRef} className={className} style={{ position: "relative", overflow: "hidden", background: "#111" }}>
        {imageDataUrl ? (
          <div
            style={{
              position: "absolute",
              inset: "-80px",
              backgroundImage: `url(${imageDataUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: "scale(1.15)",
              filter: `blur(${blur}px) brightness(${bright / 100}) saturate(${sat / 100})`,
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center p-8 text-sm text-white/40 font-noto-sans-jp">
            上の「写真を選ぶ」から画像をアップロードしてください
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: tintBlend,
            background: tintColor,
            opacity: tintOp / 100,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: "overlay",
            opacity: grainOp / 100,
            backgroundImage: grainDataUri(grainFreq),
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none">
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 500,
              fontSize: "clamp(26px, 6.5vw, 50px)",
              lineHeight: 1.12,
              margin: 0,
              color: textColor,
              textShadow: "0 2px 24px rgba(0,0,0,0.28)",
            }}
          >
            {headlineParts.map((part, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {part}
              </span>
            ))}
          </h1>
        </div>
      </div>
    );
  },
);

export default PhotoFrostedGrain;
