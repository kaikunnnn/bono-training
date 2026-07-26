"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { mulberry32 } from "@/lib/mulberry32";

export type StarTimeOfDay = "dusk" | "night" | "deepNight";

export interface StarSkyParams {
  timeOfDay: StarTimeOfDay;
  skyTop: string;
  skyBottom: string;
  starColor: string;
  starCount: number;
  starSize: number;
  twinkle: number;
  dir: number;
  streak: number;
  blur: number;
  grain: number;
  seed: number;
}

export interface StarSkyHandle {
  exportPNG: () => string | null;
}

interface StarSkyStudioProps extends StarSkyParams {
  className?: string;
}

function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

const StarSkyStudio = forwardRef<StarSkyHandle, StarSkyStudioProps>(
  function StarSkyStudio(
    { timeOfDay, skyTop, skyBottom, starColor, starCount, starSize, twinkle, dir, streak, blur, grain, seed, className },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const paramsRef = useRef<StarSkyParams>({
      timeOfDay,
      skyTop,
      skyBottom,
      starColor,
      starCount,
      starSize,
      twinkle,
      dir,
      streak,
      blur,
      grain,
      seed,
    });
    useEffect(() => {
      paramsRef.current = {
        timeOfDay,
        skyTop,
        skyBottom,
        starColor,
        starCount,
        starSize,
        twinkle,
        dir,
        streak,
        blur,
        grain,
        seed,
      };
    });

    const render = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const { w: W, h: H } = sizeRef.current;
      if (!canvas || !ctx || W <= 0 || H <= 0) return;
      const p = paramsRef.current;
      const rnd = mulberry32(p.seed);

      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const o = off.getContext("2d")!;

      const sky = o.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, p.skyTop);
      sky.addColorStop(1, p.skyBottom);
      o.fillStyle = sky;
      o.fillRect(0, 0, W, H);

      const count = Math.round(p.starCount);
      const maxR = (p.starSize / 100) * Math.min(W, H) * 0.02;
      const glowStrength = p.twinkle / 100;

      for (let i = 0; i < count; i++) {
        const x = rnd() * W;
        const y = rnd() * H;
        const t = rnd();
        const isBig = t > 0.88;
        const r = isBig ? maxR * (0.6 + rnd() * 0.4) : maxR * (0.15 + rnd() * 0.35);
        const alpha = 0.5 + rnd() * 0.5;

        if (isBig && glowStrength > 0) {
          const glowR = r * 5 * (0.4 + glowStrength);
          const glow = o.createRadialGradient(x, y, 0, x, y, glowR);
          glow.addColorStop(0, hexToRgba(p.starColor, 0.5 * glowStrength));
          glow.addColorStop(1, hexToRgba(p.starColor, 0));
          o.fillStyle = glow;
          o.beginPath();
          o.arc(x, y, glowR, 0, Math.PI * 2);
          o.fill();
        }

        o.globalAlpha = alpha;
        o.fillStyle = p.starColor;
        o.beginPath();
        o.arc(x, y, r, 0, Math.PI * 2);
        o.fill();
        o.globalAlpha = 1;
      }

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

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      resize();
      const observer = new ResizeObserver(() => resize());
      observer.observe(container);
      return () => observer.disconnect();
    }, [resize]);

    useEffect(() => {
      render();
    }, [
      render,
      timeOfDay,
      skyTop,
      skyBottom,
      starColor,
      starCount,
      starSize,
      twinkle,
      dir,
      streak,
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
          return exp.toDataURL("image/png");
        },
      }),
      [],
    );

    return (
      <div ref={containerRef} className={className} style={{ overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>
    );
  },
);

export default StarSkyStudio;
