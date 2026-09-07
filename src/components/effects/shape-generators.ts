import { mulberry32 } from "@/lib/mulberry32";

export const SHAPE_CANVAS_SIZE = 400;

export type ShapeKey = "helix" | "burst" | "scribble" | "concentric" | "wave" | "spiral";

export interface ShapeParamDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ShapeDef {
  desc: string;
  params: ShapeParamDef[];
  /** ランダムシードに依存する(「再生成」ボタンが効く)図形かどうか */
  usesSeed: boolean;
}

function paramDef(key: string, label: string, min: number, max: number, step: number, defaultValue: number): ShapeParamDef {
  return { key, label, min, max, step, defaultValue };
}

export const SHAPE_DEFS: Record<ShapeKey, ShapeDef> = {
  helix: {
    desc: "円を描きながら下げるだけ。線を複数本ずらすとリボン状に。",
    usesSeed: false,
    params: [
      paramDef("turns", "巻き数", 3, 16, 1, 9),
      paramDef("radius", "半径", 60, 170, 1, 120),
      paramDef("flatten", "つぶし", 8, 60, 1, 26),
      paramDef("height", "高さ", 70, 280, 1, 190),
      paramDef("weight", "線の太さ", 2, 20, 1, 7),
      paramDef("taper", "奥を薄く", 0, 100, 5, 50),
    ],
  },
  burst: {
    desc: "中心からの放射線上に点を置き、内側の空白を cos(2θ) で星型に。",
    usesSeed: false,
    params: [
      paramDef("rays", "放射の数", 24, 160, 4, 88),
      paramDef("radius", "外径", 90, 190, 1, 160),
      paramDef("inner", "内側の空白", 10, 90, 1, 52),
      paramDef("sharp", "星の鋭さ", 5, 40, 1, 18),
      paramDef("spacing", "点の間隔", 3, 14, 1, 5),
      paramDef("dot", "点の大きさ", 3, 16, 1, 8),
    ],
  },
  scribble: {
    desc: "ランダムに傾けた楕円の重ね。半径にサイン波を足して手描き感を出す。",
    usesSeed: true,
    params: [
      paramDef("loops", "輪の数", 4, 40, 1, 16),
      paramDef("radius", "半径", 50, 150, 1, 95),
      paramDef("flatten", "つぶし", 15, 70, 1, 34),
      paramDef("height", "高さ", 40, 220, 1, 130),
      paramDef("tilt", "傾き", 0, 60, 1, 22),
      paramDef("jitter", "歪み", 0, 60, 1, 22),
      paramDef("weight", "線の太さ", 2, 12, 1, 5),
    ],
  },
  concentric: {
    desc: "中心を少しずつずらした円を重ねる。ズレが波紋のような干渉を生む。",
    usesSeed: true,
    params: [
      paramDef("rings", "円の数", 6, 50, 1, 24),
      paramDef("rMin", "最小半径", 10, 80, 1, 20),
      paramDef("rStep", "半径の増分", 3, 16, 1, 7),
      paramDef("offset", "中心ズレ", 0, 60, 1, 20),
      paramDef("weight", "線の太さ", 1, 8, 1, 3),
    ],
  },
  wave: {
    desc: "格子の各点を、位置に応じたサイン波で上下させて線でつなぐ。",
    usesSeed: false,
    params: [
      paramDef("cols", "横の数", 6, 40, 1, 18),
      paramDef("rows", "縦の数", 4, 30, 1, 12),
      paramDef("amp", "波の高さ", 0, 40, 1, 16),
      paramDef("freq", "波の細かさ", 1, 10, 1, 3),
      paramDef("weight", "線の太さ", 1, 6, 1, 2),
    ],
  },
  spiral: {
    desc: "角度を増やしながら半径も増やす。等角螺旋(自然界の渦)。",
    usesSeed: false,
    params: [
      paramDef("turns", "巻き数", 2, 12, 1, 6),
      paramDef("growth", "開き方", 5, 40, 1, 18),
      paramDef("points", "密度", 60, 400, 10, 200),
      paramDef("weight", "線の太さ", 1, 10, 1, 3),
      paramDef("dots", "点で描く", 0, 1, 1, 0),
    ],
  },
};

type Params = Record<string, number>;

function gHelix(p: Params, lineCol: string): string {
  const S = SHAPE_CANVAS_SIZE;
  const cx = S / 2,
    cy = S / 2,
    rx = p.radius / 2,
    ry = p.flatten / 2,
    H = p.height,
    w = p.weight / 10,
    taper = p.taper / 100;
  const steps = p.turns * 72;
  let px: number | null = null;
  let py = 0;
  let pd = 0;
  let out = "";
  for (let i = 0; i <= steps; i++) {
    const pr = i / steps;
    const t = pr * p.turns * Math.PI * 2;
    const x = cx + rx * Math.cos(t);
    const y = cy - H / 2 + pr * H + ry * Math.sin(t);
    const depth = (Math.sin(t) + 1) / 2;
    if (px !== null) {
      const op = 1 - taper + taper * ((depth + pd) / 2);
      out += `<path d="M${px.toFixed(2)} ${py.toFixed(2)} L${x.toFixed(2)} ${y.toFixed(2)}" fill="none" stroke="${lineCol}" stroke-width="${w}" stroke-linecap="round" opacity="${op.toFixed(3)}"/>`;
    }
    px = x;
    py = y;
    pd = depth;
  }
  for (const yy of [cy - H / 2, cy + H / 2]) {
    out += `<ellipse cx="${cx}" cy="${yy.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="none" stroke="${lineCol}" stroke-width="${w}"/>`;
  }
  return out;
}

function gBurst(p: Params, lineCol: string): string {
  const S = SHAPE_CANVAS_SIZE;
  const cx = S / 2,
    cy = S / 2,
    R = p.radius,
    A = p.inner,
    sharp = p.sharp / 10,
    gap = p.spacing,
    br = p.dot / 10;
  let out = "";
  for (let i = 0; i < p.rays; i++) {
    const th = (i / p.rays) * Math.PI * 2;
    const rIn = A * (0.18 + 0.82 * Math.pow(Math.abs(Math.cos(2 * th)), sharp));
    if (rIn >= R) continue;
    for (let r = rIn; r <= R; r += gap) {
      const t = (r - rIn) / Math.max(1, R - rIn);
      const rad = br * (1 - 0.55 * t);
      if (rad < 0.15) continue;
      out += `<circle cx="${(cx + Math.cos(th) * r).toFixed(2)}" cy="${(cy + Math.sin(th) * r).toFixed(2)}" r="${rad.toFixed(2)}" fill="${lineCol}"/>`;
    }
  }
  return out;
}

function gScribble(p: Params, lineCol: string, seed: number): string {
  const S = SHAPE_CANVAS_SIZE;
  const rnd = mulberry32(seed);
  const cx = S / 2,
    cy = S / 2,
    rx = p.radius / 2,
    ry = p.flatten / 2,
    H = p.height,
    w = p.weight / 10,
    tilt = (p.tilt / 100) * 0.9,
    jit = p.jitter / 100;
  let out = "";
  for (let k = 0; k < p.loops; k++) {
    const pr = p.loops === 1 ? 0.5 : k / (p.loops - 1);
    const yc = cy - H / 2 + pr * H;
    const rot = (rnd() * 2 - 1) * tilt;
    const p1 = rnd() * 6.28,
      p2 = rnd() * 6.28,
      p3 = rnd() * 6.28,
      drift = (rnd() * 2 - 1) * H * 0.12;
    let d = "";
    for (let i = 0; i <= 180; i++) {
      const t = (i / 180) * Math.PI * 2;
      const wob = 1 + jit * 0.5 * Math.sin(3 * t + p1) + jit * 0.3 * Math.sin(5 * t + p2) + jit * 0.2 * Math.sin(7 * t + p3);
      const x = Math.cos(t) * rx * wob;
      const y = Math.sin(t) * ry * wob + drift * (i / 180);
      const xr = x * Math.cos(rot) - y * Math.sin(rot);
      const yr = x * Math.sin(rot) + y * Math.cos(rot);
      d += (i === 0 ? "M" : "L") + (cx + xr).toFixed(2) + " " + (yc + yr).toFixed(2) + " ";
    }
    out += `<path d="${d}Z" fill="none" stroke="${lineCol}" stroke-width="${w}" stroke-linejoin="round"/>`;
  }
  return out;
}

function gConcentric(p: Params, lineCol: string, seed: number): string {
  const S = SHAPE_CANVAS_SIZE;
  const rnd = mulberry32(seed);
  const cx = S / 2,
    cy = S / 2,
    w = p.weight / 10;
  let out = "";
  for (let i = 0; i < p.rings; i++) {
    const r = p.rMin + i * p.rStep;
    const ox = (rnd() * 2 - 1) * p.offset;
    const oy = (rnd() * 2 - 1) * p.offset;
    out += `<circle cx="${(cx + ox).toFixed(2)}" cy="${(cy + oy).toFixed(2)}" r="${r.toFixed(2)}" fill="none" stroke="${lineCol}" stroke-width="${w}"/>`;
  }
  return out;
}

function gWave(p: Params, lineCol: string): string {
  const S = SHAPE_CANVAS_SIZE;
  const w = p.weight / 10,
    mx = 40,
    my = 40,
    gw = (S - mx * 2) / (p.cols - 1),
    gh = (S - my * 2) / (p.rows - 1);
  let out = "";
  for (let r = 0; r < p.rows; r++) {
    let d = "";
    for (let c = 0; c < p.cols; c++) {
      const x = mx + c * gw;
      const y = my + r * gh + Math.sin((c / p.cols) * Math.PI * 2 * p.freq + r * 0.5) * p.amp;
      d += (c === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
    out += `<path d="${d}" fill="none" stroke="${lineCol}" stroke-width="${w}" stroke-linecap="round"/>`;
  }
  return out;
}

function gSpiral(p: Params, lineCol: string): string {
  const S = SHAPE_CANVAS_SIZE;
  const cx = S / 2,
    cy = S / 2,
    w = p.weight / 10;
  let out = "",
    d = "";
  const maxT = p.turns * Math.PI * 2;
  for (let i = 0; i <= p.points; i++) {
    const t = (i / p.points) * maxT;
    const r = (p.growth * t) / (Math.PI * 2);
    const x = cx + Math.cos(t) * r,
      y = cy + Math.sin(t) * r;
    if (p.dots >= 1) {
      out += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(w * 1.5).toFixed(2)}" fill="${lineCol}"/>`;
    } else {
      d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
  }
  if (p.dots < 1) out = `<path d="${d}" fill="none" stroke="${lineCol}" stroke-width="${w}" stroke-linecap="round"/>`;
  return out;
}

const GENERATORS: Record<ShapeKey, (p: Params, lineCol: string, seed: number) => string> = {
  helix: gHelix,
  burst: gBurst,
  scribble: gScribble,
  concentric: gConcentric,
  wave: gWave,
  spiral: gSpiral,
};

/**
 * 生成ロジックは常に 400x400 の正方形座標で描く(比率を変えても図形の比率が崩れないように)。
 * 出力比率が正方形以外のときは、その正方形を選んだ比率のviewBoxの中央に配置する(レターボックス)。
 */
export function buildShapeSVG(
  shape: ShapeKey,
  params: Params,
  lineCol: string,
  bgCol: string,
  seed: number,
  ratio: { w: number; h: number } = { w: 1, h: 1 },
): string {
  const S = SHAPE_CANVAS_SIZE;
  const inner = GENERATORS[shape](params, lineCol, seed);

  const isWide = ratio.w >= ratio.h;
  const vbW = isWide ? Math.round((S * ratio.w) / ratio.h) : S;
  const vbH = isWide ? S : Math.round((S * ratio.h) / ratio.w);
  const dx = (vbW - S) / 2;
  const dy = (vbH - S) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" width="${vbW}" height="${vbH}"><rect width="${vbW}" height="${vbH}" fill="${bgCol}"/><g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})">${inner}</g></svg>`;
}
