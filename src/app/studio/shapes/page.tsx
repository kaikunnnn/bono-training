"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, Shuffle } from "lucide-react";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import {
  ASPECT_RATIOS,
  computeExportSize,
  findAspectRatio,
  type AspectRatioKey,
} from "@/components/studio/aspect-ratios";
import { Button } from "@/components/ui/button";
import {
  SHAPE_DEFS,
  SHAPE_CANVAS_SIZE,
  buildShapeSVG,
  type ShapeKey,
} from "@/components/effects/shape-generators";

const SHAPE_LABELS: Record<ShapeKey, string> = {
  helix: "らせん",
  burst: "放射ドット",
  scribble: "絡まる輪",
  concentric: "同心ズレ",
  wave: "波グリッド",
  spiral: "渦巻き",
};

const SHAPE_KEYS = Object.keys(SHAPE_DEFS) as ShapeKey[];

function defaultParams(shape: ShapeKey): Record<string, number> {
  const params: Record<string, number> = {};
  for (const def of SHAPE_DEFS[shape].params) {
    params[def.key] = def.defaultValue;
  }
  return params;
}

function initAllParams(): Record<ShapeKey, Record<string, number>> {
  const all = {} as Record<ShapeKey, Record<string, number>>;
  for (const key of SHAPE_KEYS) {
    all[key] = defaultParams(key);
  }
  return all;
}

export default function ShapePlaygroundPage() {
  const [shape, setShape] = useState<ShapeKey>("helix");
  const [ratioKey, setRatioKey] = useState<AspectRatioKey>("1:1");
  const ratio = findAspectRatio(ratioKey);
  const [allParams, setAllParams] = useState<Record<ShapeKey, Record<string, number>>>(initAllParams);
  const [lineCol, setLineCol] = useState("#141414");
  const [bgCol, setBgCol] = useState("#ffffff");
  const [seed, setSeed] = useState(777);
  const [copied, setCopied] = useState(false);

  const params = allParams[shape];
  const svg = useMemo(
    () => buildShapeSVG(shape, params, lineCol, bgCol, seed, ratio),
    [shape, params, lineCol, bgCol, seed, ratio],
  );

  function setParam(key: string, value: number) {
    setAllParams((prev) => ({ ...prev, [shape]: { ...prev[shape], [key]: value } }));
  }

  async function handleCopySVG() {
    setCopied(false);
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
    } catch {
      // クリップボードAPIが使えない環境では何もしない(コピー成功表示のみ出さない)
    }
  }

  function handleSavePNG() {
    const { width, height } = computeExportSize(ratio, SHAPE_CANVAS_SIZE * 2);
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    img.onload = () => {
      const cv = document.createElement("canvas");
      cv.width = width;
      cv.height = height;
      const c = cv.getContext("2d");
      c?.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `shape-${shape}-${ratio.key.replace(":", "x")}.png`;
      a.href = cv.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <Link href="/studio" className="inline-flex items-center gap-1 text-sm font-bold text-text-primary/50 font-noto-sans-jp hover:text-text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Studio
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            Shape Playground
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            幾何学図形をSVGで生成する。Figmaに直接ペーストできる。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div className="w-full lg:sticky lg:top-8 bg-surface p-8 flex flex-col items-center">
            <div className="w-full max-w-[560px]" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="text-xs text-text-primary/50 font-noto-sans-jp mt-4 text-center leading-relaxed">
              {SHAPE_DEFS[shape].desc}
            </p>
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <SectionLabel>図形</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {SHAPE_KEYS.map((key) => (
                <ToggleButton key={key} active={shape === key} onClick={() => setShape(key)}>
                  {SHAPE_LABELS[key]}
                </ToggleButton>
              ))}
            </div>

            <SectionLabel>出力比率</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {ASPECT_RATIOS.map((r) => (
                <ToggleButton key={r.key} active={ratioKey === r.key} onClick={() => setRatioKey(r.key)}>
                  {r.label}
                </ToggleButton>
              ))}
            </div>

            <SectionLabel>カラー</SectionLabel>
            <div className="grid grid-cols-1 gap-3 mb-5">
              <ColorField label="線" value={lineCol} onChange={setLineCol} />
              <ColorField label="背景" value={bgCol} onChange={setBgCol} />
            </div>

            <SectionLabel>パラメータ</SectionLabel>
            <div className="mb-5">
              {SHAPE_DEFS[shape].params.map((def) => (
                <SliderRow
                  key={def.key}
                  label={def.label}
                  value={params[def.key]}
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  onChange={(v) => setParam(def.key, v)}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopySVG} className="flex-1">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                SVGをコピー
              </Button>
              <Button onClick={handleSavePNG} variant="outline" className="flex-1">
                <Download className="size-4" />
                PNG保存
              </Button>
            </div>
            {SHAPE_DEFS[shape].usesSeed && (
              <Button onClick={() => setSeed((Math.random() * 1e9) | 0)} variant="ghost" className="w-full mt-2">
                <Shuffle className="size-4" />
                再生成
              </Button>
            )}
            <p className="text-[11px] text-text-primary/50 font-noto-sans-jp mt-4 leading-relaxed">
              SVGはFigmaに直接ペーストできます。「再生成」は乱数を使う図形(絡まる輪・同心ズレ)でのみ表示されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
