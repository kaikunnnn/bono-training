"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import BrandGradient, {
  type BrandGradientHandle,
  type GradientMode,
} from "@/components/gradient/BrandGradient";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import {
  ASPECT_RATIOS,
  computeExportSize,
  findAspectRatio,
  type AspectRatioKey,
} from "@/components/studio/aspect-ratios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_PRESETS } from "@/lib/gradient-presets";

const MODE_LABELS: Record<GradientMode, string> = {
  0: "背景",
  1: "線に適用",
  2: "背景＋線",
};

// 書き出しPNGの長辺解像度。プレビューのボックスサイズに関係なく常にこの品質で書き出す。
const EXPORT_LONG_EDGE = 1600;

export default function GradientStudioPage() {
  const gradientRef = useRef<BrandGradientHandle>(null);

  const [mode, setMode] = useState<GradientMode>(0);
  const [ratioKey, setRatioKey] = useState<AspectRatioKey>("1:1");
  const ratio = findAspectRatio(ratioKey);
  const [activePreset, setActivePreset] = useState<string>(Object.keys(BRAND_PRESETS)[0]);
  const [c1, setC1] = useState("#3a6fb0");
  const [c2, setC2] = useState("#e88a5a");
  const [c3, setC3] = useState("#c94f3d");
  const [c4, setC4] = useState("#ffffff");

  const [blend, setBlend] = useState(55);
  const [grain, setGrain] = useState(35);
  const [grainScale, setGrainScale] = useState(60);
  const [angle, setAngle] = useState(115);

  const [turns, setTurns] = useState(9);
  const [radius, setRadius] = useState(46);
  const [thick, setThick] = useState(16);

  const [snippet, setSnippet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function applyPreset(name: string) {
    const preset = BRAND_PRESETS[name];
    if (!preset) return;
    setActivePreset(name);
    setC1(preset[0]);
    setC2(preset[1]);
    setC3(preset[2]);
  }

  function handleSavePNG() {
    const { width, height } = computeExportSize(ratio, EXPORT_LONG_EDGE);
    const url = gradientRef.current?.exportPNG(width, height);
    if (!url) return;
    const a = document.createElement("a");
    a.download = `brand-gradient-${ratio.key.replace(":", "x")}.png`;
    a.href = url;
    a.click();
  }

  async function handleCopyPreset() {
    const line = `'新プリセット': ['${c1}','${c2}','${c3}'],`;
    setSnippet(line);
    setCopied(false);
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
    } catch {
      // クリップボードAPIが使えない環境ではテキストエリア表示のみで妥協する
    }
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
            Brand Gradient Studio
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            ブランドカラーのグラデーション＋グレイン＋らせん模様を生成する社内ツール。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div
            className="relative w-full mx-auto lg:sticky lg:top-8 overflow-hidden bg-surface"
            style={{ aspectRatio: `${ratio.w} / ${ratio.h}`, maxHeight: "78vh" }}
          >
            <BrandGradient
              ref={gradientRef}
              className="absolute inset-0"
              colors={[c1, c2, c3, c4]}
              blend={blend}
              grain={grain}
              grainScale={grainScale}
              angle={angle}
              mode={mode}
              turns={turns}
              radius={radius}
              thick={thick}
            />
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <SectionLabel>表示モード</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {([0, 1, 2] as GradientMode[]).map((m) => (
                <ToggleButton key={m} active={mode === m} onClick={() => setMode(m)}>
                  {MODE_LABELS[m]}
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

            <SectionLabel>ブランドプリセット</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {Object.keys(BRAND_PRESETS).map((name) => (
                <ToggleButton
                  key={name}
                  active={activePreset === name}
                  onClick={() => applyPreset(name)}
                >
                  {name}
                </ToggleButton>
              ))}
            </div>

            <SectionLabel>カラー</SectionLabel>
            <div className="grid grid-cols-1 gap-3 mb-5">
              <ColorField label="色1" description="グラデーションの起点" value={c1} onChange={setC1} />
              <ColorField label="色2" description="グラデーションの中間" value={c2} onChange={setC2} />
              <ColorField label="色3" description="グラデーションの終点" value={c3} onChange={setC3} />
              <ColorField label="他色" description="らせんの線 / 背景色" value={c4} onChange={setC4} />
            </div>

            <SectionLabel>グラデーション</SectionLabel>
            <div className="mb-4">
              <SliderRow label="混ざり方" value={blend} min={0} max={100} onChange={setBlend} />
              <SliderRow label="ざらつき" value={grain} min={0} max={100} onChange={setGrain} />
              <SliderRow label="粒の細かさ" value={grainScale} min={0} max={100} onChange={setGrainScale} />
              <SliderRow label="向き" value={angle} min={0} max={360} onChange={setAngle} />
            </div>

            <SectionLabel>図形(らせん)</SectionLabel>
            <div className="mb-5">
              <SliderRow label="巻き数" value={turns} min={3} max={16} onChange={setTurns} />
              <SliderRow label="半径" value={radius} min={20} max={70} onChange={setRadius} />
              <SliderRow label="線の太さ" value={thick} min={4} max={40} onChange={setThick} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePNG} className="flex-1">
                <Download className="size-4" />
                PNG保存
              </Button>
              <Button onClick={handleCopyPreset} variant="outline" className="flex-1">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                この設定をコピー
              </Button>
            </div>
            {snippet && (
              <Textarea readOnly value={snippet} className="w-full h-14 mt-3 font-mono text-xs" />
            )}
            <p className="text-[11px] text-text-primary/50 font-noto-sans-jp mt-4 leading-relaxed">
              「線に適用」= らせんの線を、生成したグラデ＋グレインで塗ります。「背景＋線」= グラデ背景に、線を「他色」で描きます。
              プリセットを増やすには <code className="font-mono bg-base px-1 rounded">src/lib/gradient-presets.ts</code> の BRAND_PRESETS を編集してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
