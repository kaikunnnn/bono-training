"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { mulberry32 } from "@/lib/mulberry32";

export type MountainTimeOfDay = "morning" | "noon" | "evening";

export interface MountainSkyParams {
  timeOfDay: MountainTimeOfDay;
  skyTop: string;
  skyBottom: string;
  /** 奥から手前へ(手前ほど濃い) */
  layerColors: [string, string, string];
  ridgeJaggedness: number;
  ridgeHeight: number;
  haze: number;
  dir: number;
  streak: number;
  blur: number;
  grain: number;
  seed: number;
}

export interface MountainSkyHandle {
  exportPNG: () => string | null;
}

interface MountainSkyStudioProps extends MountainSkyParams {
  className?: string;
}

/** 山の稜線を1本描いて塗りつぶす(baselineFracより上の部分は空、下は山) */
function drawRidgeLayer(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  rnd: () => number,
  baselineFrac: number,
  amplitude: number,
  jag: number,
  color: string,
) {
  const segments = 28;
  const freq1 = 1 + rnd() * 2;
  const freq2 = 2 + rnd() * 3;
  const phase1 = rnd() * 10;
  const phase2 = rnd() * 10;

  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const smooth = Math.sin(t * Math.PI * freq1 + phase1) * 0.5 + Math.sin(t * Math.PI * freq2 + phase2) * 0.3;
    const jitter = (rnd() - 0.5) * jag;
    const y = baselineFrac * H - (smooth * amplitude + jitter);
    ctx.lineTo(t * W, y);
  }
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const MountainSkyStudio = forwardRef<MountainSkyHandle, MountainSkyStudioProps>(
  function MountainSkyStudio(
    { timeOfDay, skyTop, skyBottom, layerColors, ridgeJaggedness, ridgeHeight, haze, dir, streak, blur, grain, seed, className },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const paramsRef = useRef<MountainSkyParams>({
      timeOfDay,
      skyTop,
      skyBottom,
      layerColors,
      ridgeJaggedness,
      ridgeHeight,
      haze,
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
        layerColors,
        ridgeJaggedness,
        ridgeHeight,
        haze,
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

      const amplitude = (p.ridgeHeight / 100) * H * 0.3 + H * 0.05;
      const jag = (p.ridgeJaggedness / 100) * H * 0.06;
      const baselines = [0.52, 0.66, 0.82];
      const ampScale = [0.75, 0.9, 1.1];

      for (let layer = 0; layer < 3; layer++) {
        const blurPx = (p.haze / 100) * (2 - layer) * 5;
        o.filter = blurPx > 0.3 ? `blur(${blurPx}px)` : "none";
        drawRidgeLayer(o, W, H, rnd, baselines[layer], amplitude * ampScale[layer], jag, p.layerColors[layer]);
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
      layerColors,
      ridgeJaggedness,
      ridgeHeight,
      haze,
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

export default MountainSkyStudio;
