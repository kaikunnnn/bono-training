"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { mulberry32 } from "@/lib/mulberry32";

export type Motif = "4" | "5" | "6" | "blossom" | "star" | "dot";

export interface FrostedBloomParams {
  motif: Motif;
  /** [色1, 色2, 色3, 色4] */
  colors: [string, string, string, string];
  flowerColor: string;
  textColor: string;
  dir: number;
  streak: number;
  flCount: number;
  flSize: number;
  flOp: number;
  flBlur: number;
  flRot: number;
  blur: number;
  grain: number;
  headlineText: string;
  seed: number;
}

export interface FrostedBloomHandle {
  exportPNG: () => string | null;
}

interface FrostedBloomStudioProps extends FrostedBloomParams {
  className?: string;
}

function petalFlower(c: CanvasRenderingContext2D, n: number, s: number, elong: number) {
  for (let i = 0; i < n; i++) {
    c.rotate((Math.PI * 2) / n);
    c.beginPath();
    c.ellipse(0, -s * 0.55, s * 0.42, s * 0.75 * elong, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.beginPath();
  c.arc(0, 0, s * 0.32, 0, Math.PI * 2);
  c.fill();
}

function starShape(c: CanvasRenderingContext2D, points: number, s: number) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? s : s * 0.42;
    const a = (Math.PI * i) / points - Math.PI / 2;
    const x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
  c.fill();
}

function drawMotif(
  c: CanvasRenderingContext2D,
  motif: Motif,
  x: number,
  y: number,
  s: number,
  r: number,
  color: string,
  alpha: number,
) {
  c.save();
  c.translate(x, y);
  c.rotate(r);
  c.globalAlpha = alpha;
  c.fillStyle = color;
  if (motif === "4") petalFlower(c, 4, s, 1.0);
  else if (motif === "5") petalFlower(c, 5, s, 0.9);
  else if (motif === "6") petalFlower(c, 6, s, 0.85);
  else if (motif === "blossom") petalFlower(c, 5, s, 0.7);
  else if (motif === "star") starShape(c, 5, s);
  else {
    c.beginPath();
    c.arc(0, 0, s * 0.8, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

const FrostedBloomStudio = forwardRef<FrostedBloomHandle, FrostedBloomStudioProps>(
  function FrostedBloomStudio(
    {
      motif,
      colors,
      flowerColor,
      textColor,
      dir,
      streak,
      flCount,
      flSize,
      flOp,
      flBlur,
      flRot,
      blur,
      grain,
      headlineText,
      seed,
      className,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const paramsRef = useRef<FrostedBloomParams>({
      motif,
      colors,
      flowerColor,
      textColor,
      dir,
      streak,
      flCount,
      flSize,
      flOp,
      flBlur,
      flRot,
      blur,
      grain,
      headlineText,
      seed,
    });
    useEffect(() => {
      paramsRef.current = {
        motif,
        colors,
        flowerColor,
        textColor,
        dir,
        streak,
        flCount,
        flSize,
        flOp,
        flBlur,
        flRot,
        blur,
        grain,
        headlineText,
        seed,
      };
    });

    const render = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const { w: W, h: H } = sizeRef.current;
      if (!canvas || !ctx || W <= 0 || H <= 0) return;
      const p = paramsRef.current;
      const [c1, c2, c3, c4] = p.colors;
      const cols = [c1, c2, c3, c4];
      const rnd = mulberry32(p.seed);

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d")!;

      o.fillStyle = c3;
      o.fillRect(0, 0, W, H);
      for (let i = 0; i < 7; i++) {
        const bx = rnd() * W,
          by = rnd() * H,
          br = (0.25 + rnd() * 0.4) * Math.max(W, H);
        const g = o.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, cols[i % cols.length]);
        g.addColorStop(1, "rgba(0,0,0,0)");
        o.globalAlpha = 0.6;
        o.fillStyle = g;
        o.beginPath();
        o.arc(bx, by, br, 0, Math.PI * 2);
        o.fill();
      }
      o.globalAlpha = 1;

      const fN = Math.round(p.flCount);
      const fS = (p.flSize / 100) * Math.min(W, H);
      const fA = p.flOp / 100;
      const rotAmt = p.flRot / 100;
      o.filter = `blur(${(p.flBlur / 100) * fS * 0.6}px)`;
      for (let i = 0; i < fN; i++) {
        drawMotif(
          o,
          p.motif,
          rnd() * W,
          rnd() * H,
          fS * (0.5 + rnd() * 0.9),
          rnd() * Math.PI * 2 * rotAmt,
          p.flowerColor,
          fA * (0.4 + rnd() * 0.6),
        );
      }
      o.filter = "none";

      ctx.clearRect(0, 0, W, H);
      const ang = (p.dir * Math.PI) / 180;
      const streakPx = (p.streak / 100) * Math.max(W, H) * 0.18;
      const steps = streakPx > 1 ? 18 : 1;
      ctx.globalAlpha = (1 / steps) * 1.6;
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1 || 1) - 0.5;
        ctx.drawImage(off, Math.cos(ang) * streakPx * t, Math.sin(ang) * streakPx * t);
      }
      ctx.globalAlpha = 1;

      if (p.blur > 0) {
        const tmp = document.createElement("canvas");
        tmp.width = W;
        tmp.height = H;
        tmp.getContext("2d")!.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.filter = `blur(${p.blur}px)`;
        ctx.drawImage(tmp, 0, 0);
        ctx.filter = "none";
      }

      const go = p.grain / 100;
      if (go > 0) {
        const id = ctx.getImageData(0, 0, W, H);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          const n = (Math.random() - 0.5) * go * 70;
          d[i] += n;
          d[i + 1] += n;
          d[i + 2] += n;
        }
        ctx.putImageData(id, 0, 0);
      }
    }, []);

    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w <= 0 || h <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = Math.floor(w * dpr);
      const H = Math.floor(h * dpr);
      sizeRef.current = { w: W, h: H };
      canvas.width = W;
      canvas.height = H;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      render();
    }, [render]);

    // コンテナのリサイズを監視して再描画する。render()はピクセル操作を伴い重いので、
    // 他のツールのようなrAF常時ポーリングではなく ResizeObserver で「実際に変わった時だけ」動かす。
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      resize();
      const observer = new ResizeObserver(() => resize());
      observer.observe(container);
      return () => observer.disconnect();
    }, [resize]);

    // パラメータが変わるたびに再描画する
    useEffect(() => {
      render();
    }, [
      render,
      motif,
      colors,
      flowerColor,
      textColor,
      dir,
      streak,
      flCount,
      flSize,
      flOp,
      flBlur,
      flRot,
      blur,
      grain,
      seed,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        exportPNG() {
          const canvas = canvasRef.current;
          const { w: W, h: H } = sizeRef.current;
          if (!canvas || W <= 0 || H <= 0) return null;

          const exp = document.createElement("canvas");
          exp.width = W;
          exp.height = H;
          const e = exp.getContext("2d");
          if (!e) return null;
          e.drawImage(canvas, 0, 0);

          const p = paramsRef.current;
          const parts = p.headlineText.split("|").map((s) => s.trim());
          e.fillStyle = p.textColor;
          e.textAlign = "center";
          e.textBaseline = "middle";
          const fs = Math.round(W * 0.072);
          e.font = `500 ${fs}px Georgia, serif`;
          e.shadowColor = "rgba(0,0,0,0.25)";
          e.shadowBlur = W * 0.018;
          e.shadowOffsetY = 4;
          const lh = fs * 1.12,
            sy = H / 2 - ((parts.length - 1) * lh) / 2;
          parts.forEach((part, i) => e.fillText(part, W / 2, sy + i * lh));

          return exp.toDataURL("image/png");
        },
      }),
      [],
    );

    const headlineParts = headlineText.split("|").map((s) => s.trim());

    return (
      <div ref={containerRef} className={className} style={{ overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none">
          <h1
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 500,
              fontSize: "clamp(26px, 6.5vw, 52px)",
              lineHeight: 1.12,
              margin: 0,
              color: textColor,
              textShadow: "0 2px 22px rgba(0,0,0,0.25)",
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

export default FrostedBloomStudio;
