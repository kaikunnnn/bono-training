"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Shuffle } from "lucide-react";
import FrostedBloomStudio, {
  type FrostedBloomHandle,
  type Motif,
} from "@/components/effects/FrostedBloomStudio";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import { ASPECT_RATIOS, findAspectRatio, type AspectRatioKey } from "@/components/studio/aspect-ratios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FROSTED_BLOOM_PRESETS } from "@/lib/effect-presets";

const MOTIF_LABELS: Record<Motif, string> = {
  "4": "四つ葉",
  "5": "五弁花",
  "6": "六弁花",
  blossom: "桜",
  star: "星",
  dot: "丸",
};

const MOTIF_NOTES: Record<Motif, string> = {
  "4": "四つ葉。90°ごとに花びらを4枚。元画像のモチーフ。",
  "5": "五弁花。72°ごとに5枚。梅や桔梗のような整った印象。",
  "6": "六弁花。60°ごとに6枚。雪の結晶や百合のような幾何的な花。",
  blossom: "桜。花びらを丸く5枚。やわらかく可憐な印象。",
  star: "星。尖った5点。シャープでモダンなアクセントに。",
  dot: "丸。最もシンプル。ぼかすと光の玉になる。",
};

export default function FrostedBloomPage() {
  const studioRef = useRef<FrostedBloomHandle>(null);

  const [motif, setMotif] = useState<Motif>("4");
  const [ratioKey, setRatioKey] = useState<AspectRatioKey>("16:9");
  const ratio = findAspectRatio(ratioKey);
  const [activePreset, setActivePreset] = useState<string>(Object.keys(FROSTED_BLOOM_PRESETS)[0]);
  const [c1, setC1] = useState("#1c6b52");
  const [c2, setC2] = useState("#2f9fb8");
  const [c3, setC3] = useState("#0d3b30");
  const [c4, setC4] = useState("#8fd4c4");
  const [flowerColor, setFlowerColor] = useState("#eaf3e0");
  const [textColor, setTextColor] = useState("#eef0dd");

  const [dir, setDir] = useState(225);
  const [streak, setStreak] = useState(55);

  const [flCount, setFlCount] = useState(12);
  const [flSize, setFlSize] = useState(15);
  const [flOp, setFlOp] = useState(40);
  const [flBlur, setFlBlur] = useState(45);
  const [flRot, setFlRot] = useState(100);

  const [blur, setBlur] = useState(16);
  const [grain, setGrain] = useState(45);

  const [headlineText, setHeadlineText] = useState("3 Traits of Modern | Ag-Tech Leaders.");
  const [seed, setSeed] = useState(1234);

  function applyPreset(name: string) {
    const preset = FROSTED_BLOOM_PRESETS[name];
    if (!preset) return;
    setActivePreset(name);
    setC1(preset[0]);
    setC2(preset[1]);
    setC3(preset[2]);
    setC4(preset[3]);
    setFlowerColor(preset[4]);
    setTextColor(preset[5]);
  }

  function handleSavePNG() {
    const url = studioRef.current?.exportPNG();
    if (!url) return;
    const a = document.createElement("a");
    a.download = `frosted-bloom-${ratio.key.replace(":", "x")}.png`;
    a.href = url;
    a.click();
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
            Frosted Bloom — Motif Studio
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            方向性ブラーの霧背景＋モチーフ(四つ葉/五弁/六弁/桜/星/丸)をCanvasで生成する。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div
            className="relative w-full mx-auto lg:sticky lg:top-8 overflow-hidden bg-surface"
            style={{ aspectRatio: `${ratio.w} / ${ratio.h}`, maxHeight: "78vh" }}
          >
            <FrostedBloomStudio
              ref={studioRef}
              className="absolute inset-0"
              motif={motif}
              colors={[c1, c2, c3, c4]}
              flowerColor={flowerColor}
              textColor={textColor}
              dir={dir}
              streak={streak}
              flCount={flCount}
              flSize={flSize}
              flOp={flOp}
              flBlur={flBlur}
              flRot={flRot}
              blur={blur}
              grain={grain}
              headlineText={headlineText}
              seed={seed}
            />
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <SectionLabel>モチーフ</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {(Object.keys(MOTIF_LABELS) as Motif[]).map((m) => (
                <ToggleButton key={m} active={motif === m} onClick={() => setMotif(m)}>
                  {MOTIF_LABELS[m]}
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

            <SectionLabel>プリセット</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {Object.keys(FROSTED_BLOOM_PRESETS).map((name) => (
                <ToggleButton key={name} active={activePreset === name} onClick={() => applyPreset(name)}>
                  {name}
                </ToggleButton>
              ))}
            </div>

            <SectionLabel>カラー</SectionLabel>
            <div className="grid grid-cols-1 gap-3 mb-5">
              <ColorField label="1" value={c1} onChange={setC1} />
              <ColorField label="2" value={c2} onChange={setC2} />
              <ColorField label="3" value={c3} onChange={setC3} />
              <ColorField label="4" value={c4} onChange={setC4} />
              <ColorField label="花" value={flowerColor} onChange={setFlowerColor} />
              <ColorField label="文字" value={textColor} onChange={setTextColor} />
            </div>

            <SectionLabel>流れ(方向性)</SectionLabel>
            <div className="mb-4">
              <SliderRow label="向き(角度)" value={dir} min={0} max={360} onChange={setDir} />
              <SliderRow label="流れの強さ" value={streak} min={0} max={100} onChange={setStreak} />
            </div>

            <SectionLabel>モチーフ配置</SectionLabel>
            <div className="mb-4">
              <SliderRow label="数" value={flCount} min={0} max={40} onChange={setFlCount} />
              <SliderRow label="大きさ" value={flSize} min={6} max={34} onChange={setFlSize} />
              <SliderRow label="濃さ" value={flOp} min={0} max={100} onChange={setFlOp} />
              <SliderRow label="ぼかし" value={flBlur} min={0} max={100} onChange={setFlBlur} />
              <SliderRow label="ばらつき回転" value={flRot} min={0} max={100} onChange={setFlRot} />
            </div>

            <SectionLabel>質感</SectionLabel>
            <div className="mb-4">
              <SliderRow label="全体ぼかし" value={blur} min={0} max={60} onChange={setBlur} />
              <SliderRow label="グレイン" value={grain} min={0} max={100} onChange={setGrain} />
            </div>

            <SectionLabel>見出し</SectionLabel>
            <div className="mb-5">
              <Input
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
                placeholder="見出しテキスト（|で改行）"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePNG} className="flex-1">
                <Download className="size-4" />
                PNGで保存
              </Button>
              <Button onClick={() => setSeed((Math.random() * 1e9) | 0)} variant="outline" className="flex-1">
                <Shuffle className="size-4" />
                配置をシャッフル
              </Button>
            </div>
            <p className="text-[11px] text-text-primary/50 font-noto-sans-jp mt-4 leading-relaxed">
              {MOTIF_NOTES[motif]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
