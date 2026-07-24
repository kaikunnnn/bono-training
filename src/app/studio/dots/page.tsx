"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import DotEffectsPlayground, {
  type DotEffectsPlaygroundHandle,
  type DotFx,
  type SunStyle,
} from "@/components/effects/DotEffectsPlayground";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import {
  ASPECT_RATIOS,
  computeExportSize,
  findAspectRatio,
  type AspectRatioKey,
} from "@/components/studio/aspect-ratios";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DOT_EFFECT_PRESETS } from "@/lib/effect-presets";

const FX_LABELS: Record<DotFx, string> = {
  0: "まばら",
  1: "ハーフトーン",
  2: "朝日",
  3: "グラデ線",
};

const FX_NOTES: Record<DotFx, string> = {
  0: "各セルに乱数を振り、しきい値を超えたセルだけ小さな点を置く。密度スライダーが割合。",
  1: "全セルに点を置き、背景グラデの値で点の大きさを変える。暗い側ほど大きい。",
  2: "下辺中央の明るさの場で点の大きさを決める。中心=塊、外=拡散で半円の太陽に。",
  3: "らせんの線だけを、生成したグラデ＋グレインで塗る。背景は色1。",
};

const SUN_STYLE_LABELS: Record<SunStyle, string> = {
  0: "サイズで表現",
  1: "色だけ(同サイズ)",
  2: "2値(あり/なし)",
};

// 書き出しPNGの長辺解像度。プレビューのボックスサイズに関係なく常にこの品質で書き出す。
const EXPORT_LONG_EDGE = 1600;

export default function DotEffectsPage() {
  const gradientRef = useRef<DotEffectsPlaygroundHandle>(null);

  const [fx, setFx] = useState<DotFx>(0);
  const [ratioKey, setRatioKey] = useState<AspectRatioKey>("1:1");
  const ratio = findAspectRatio(ratioKey);
  const [activePreset, setActivePreset] = useState<string>(Object.keys(DOT_EFFECT_PRESETS)[0]);
  const [c1, setC1] = useState("#eef0dd");
  const [c2, setC2] = useState("#d4e0b0");
  const [c3, setC3] = useState("#7a9b52");
  const [c4, setC4] = useState("#5f7d3a");

  const [spacing, setSpacing] = useState(46);
  const [grain, setGrain] = useState(26);
  const [angle, setAngle] = useState(70);

  const [size0, setSize0] = useState(26);
  const [density, setDensity] = useState(38);

  const [size1, setSize1] = useState(90);

  const [sunStyle, setSunStyle] = useState<SunStyle>(0);
  const [sunR, setSunR] = useState(34);
  const [glow, setGlow] = useState(45);
  const [sunDot, setSunDot] = useState(42);
  const [rays, setRays] = useState(false);
  const [rayCount, setRayCount] = useState(20);

  const [turns, setTurns] = useState(9);
  const [radius, setRadius] = useState(46);
  const [thick, setThick] = useState(16);

  const [snippet, setSnippet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function applyPreset(name: string) {
    const preset = DOT_EFFECT_PRESETS[name];
    if (!preset) return;
    setActivePreset(name);
    setC1(preset[0]);
    setC2(preset[1]);
    setC3(preset[2]);
    setC4(preset[3]);
  }

  function handleSavePNG() {
    const { width, height } = computeExportSize(ratio, EXPORT_LONG_EDGE);
    const url = gradientRef.current?.exportPNG(width, height);
    if (!url) return;
    const a = document.createElement("a");
    a.download = `dot-effect-${ratio.key.replace(":", "x")}.png`;
    a.href = url;
    a.click();
  }

  async function handleCopyPreset() {
    const line = `'新プリセット': ['${c1}','${c2}','${c3}','${c4}'],`;
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
            Dot Effects Playground
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            ドット表現4種(まばら / ハーフトーン / 朝日 / グラデ線)をWebGLで生成する。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div
            className="relative w-full mx-auto lg:sticky lg:top-8 overflow-hidden bg-surface"
            style={{ aspectRatio: `${ratio.w} / ${ratio.h}`, maxHeight: "78vh" }}
          >
            <DotEffectsPlayground
              ref={gradientRef}
              className="absolute inset-0"
              colors={[c1, c2, c3, c4]}
              fx={fx}
              spacing={spacing}
              grain={grain}
              angle={angle}
              size0={size0}
              density={density}
              size1={size1}
              sunR={sunR}
              glow={glow}
              rayCount={rayCount}
              rays={rays}
              sunDot={sunDot}
              sunStyle={sunStyle}
              turns={turns}
              radius={radius}
              thick={thick}
            />
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <SectionLabel>エフェクト</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {([0, 1, 2, 3] as DotFx[]).map((f) => (
                <ToggleButton key={f} active={fx === f} onClick={() => setFx(f)}>
                  {FX_LABELS[f]}
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
              {Object.keys(DOT_EFFECT_PRESETS).map((name) => (
                <ToggleButton key={name} active={activePreset === name} onClick={() => applyPreset(name)}>
                  {name}
                </ToggleButton>
              ))}
            </div>

            <SectionLabel>カラー</SectionLabel>
            <div className="grid grid-cols-1 gap-3 mb-5">
              <ColorField label="色1" value={c1} onChange={setC1} />
              <ColorField label="色2" value={c2} onChange={setC2} />
              <ColorField label="色3" value={c3} onChange={setC3} />
              <ColorField label="点/他" value={c4} onChange={setC4} />
            </div>

            <SectionLabel>共通</SectionLabel>
            <div className="mb-4">
              <SliderRow label="点の間隔" value={spacing} min={14} max={120} onChange={setSpacing} />
              <SliderRow label="ざらつき" value={grain} min={0} max={100} onChange={setGrain} />
              <SliderRow label="グラデ向き" value={angle} min={0} max={360} onChange={setAngle} />
            </div>

            {fx === 0 && (
              <>
                <SectionLabel>まばら</SectionLabel>
                <div className="mb-5">
                  <SliderRow label="点の大きさ" value={size0} min={5} max={60} onChange={setSize0} />
                  <SliderRow label="密度" value={density} min={10} max={90} onChange={setDensity} />
                </div>
              </>
            )}

            {fx === 1 && (
              <>
                <SectionLabel>ハーフトーン</SectionLabel>
                <div className="mb-5">
                  <SliderRow label="最大サイズ" value={size1} min={10} max={100} onChange={setSize1} />
                </div>
              </>
            )}

            {fx === 2 && (
              <>
                <SectionLabel>朝日</SectionLabel>
                <div className="mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex-none w-[84px] text-xs text-text-primary/70 font-noto-sans-jp">
                      表現
                    </label>
                    <Select
                      value={String(sunStyle)}
                      onValueChange={(v) => setSunStyle(Number(v) as SunStyle)}
                    >
                      <SelectTrigger className="flex-1 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {([0, 1, 2] as SunStyle[]).map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            {SUN_STYLE_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <SliderRow label="太陽の大きさ" value={sunR} min={10} max={70} onChange={setSunR} />
                  <SliderRow label="光の広がり" value={glow} min={5} max={100} onChange={setGlow} />
                  <SliderRow label="点のサイズ" value={sunDot} min={10} max={80} onChange={setSunDot} />
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox id="rays" checked={rays} onCheckedChange={(v) => setRays(v === true)} />
                    <label htmlFor="rays" className="text-xs text-text-primary/70 font-noto-sans-jp">
                      光線を出す
                    </label>
                  </div>
                  <SliderRow label="光線の数" value={rayCount} min={6} max={48} onChange={setRayCount} />
                </div>
              </>
            )}

            {fx === 3 && (
              <>
                <SectionLabel>グラデ線</SectionLabel>
                <div className="mb-5">
                  <SliderRow label="巻き数" value={turns} min={3} max={16} onChange={setTurns} />
                  <SliderRow label="半径" value={radius} min={20} max={70} onChange={setRadius} />
                  <SliderRow label="線の太さ" value={thick} min={4} max={40} onChange={setThick} />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSavePNG} className="flex-1">
                <Download className="size-4" />
                PNG保存
              </Button>
              <Button onClick={handleCopyPreset} variant="outline" className="flex-1">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                設定をコピー
              </Button>
            </div>
            {snippet && <Textarea readOnly value={snippet} className="w-full h-14 mt-3 font-mono text-xs" />}
            <p className="text-[11px] text-text-primary/50 font-noto-sans-jp mt-4 leading-relaxed">
              {FX_NOTES[fx]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
