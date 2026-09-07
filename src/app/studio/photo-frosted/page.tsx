"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload } from "lucide-react";
import PhotoFrostedGrain, {
  type PhotoFrostedGrainHandle,
  type TintBlend,
} from "@/components/effects/PhotoFrostedGrain";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import { ASPECT_RATIOS, findAspectRatio, type AspectRatioKey } from "@/components/studio/aspect-ratios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TINT_BLEND_LABELS: Record<TintBlend, string> = {
  "soft-light": "soft-light",
  overlay: "overlay",
  color: "color(色を置換)",
  multiply: "multiply",
};

export default function PhotoFrostedGrainPage() {
  const studioRef = useRef<PhotoFrostedGrainHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ratioKey, setRatioKey] = useState<AspectRatioKey>("16:9");
  const ratio = findAspectRatio(ratioKey);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [headlineText, setHeadlineText] = useState("3 Traits of Modern | Ag-Tech Leaders.");
  const [textColor, setTextColor] = useState("#f4f3e6");

  const [blur, setBlur] = useState(55);
  const [grainOp, setGrainOp] = useState(55);
  const [grainFreq, setGrainFreq] = useState(80);
  const [bright, setBright] = useState(95);
  const [sat, setSat] = useState(105);

  const [tintColor, setTintColor] = useState("#2e8b6f");
  const [tintOp, setTintOp] = useState(30);
  const [tintBlend, setTintBlend] = useState<TintBlend>("soft-light");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSavePNG() {
    const url = studioRef.current?.exportPNG();
    if (!url) return;
    const a = document.createElement("a");
    a.download = `frosted-photo-${ratio.key.replace(":", "x")}.png`;
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
            Photo Frosted Grain
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            アップした写真に ①ぼかし ②明るさ/彩度 ③ブランド色のかぶせ ④グレイン を重ねる。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div
            className="relative w-full mx-auto lg:sticky lg:top-8 overflow-hidden bg-surface"
            style={{ aspectRatio: `${ratio.w} / ${ratio.h}`, maxHeight: "78vh" }}
          >
            <PhotoFrostedGrain
              ref={studioRef}
              className="absolute inset-0"
              imageDataUrl={imageDataUrl}
              headlineText={headlineText}
              textColor={textColor}
              blur={blur}
              grainOp={grainOp}
              grainFreq={grainFreq}
              bright={bright}
              sat={sat}
              tintColor={tintColor}
              tintOp={tintOp}
              tintBlend={tintBlend}
            />
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} className="w-full mb-5">
              <Upload className="size-4" />
              写真を選ぶ
            </Button>

            <SectionLabel>出力比率</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {ASPECT_RATIOS.map((r) => (
                <ToggleButton key={r.key} active={ratioKey === r.key} onClick={() => setRatioKey(r.key)}>
                  {r.label}
                </ToggleButton>
              ))}
            </div>

            <SectionLabel>見出し</SectionLabel>
            <div className="mb-3">
              <Input
                value={headlineText}
                onChange={(e) => setHeadlineText(e.target.value)}
                placeholder="見出しテキスト（|で改行）"
              />
            </div>
            <div className="mb-5">
              <ColorField label="文字色" value={textColor} onChange={setTextColor} />
            </div>

            <SectionLabel>質感</SectionLabel>
            <div className="mb-5">
              <SliderRow label="ぼかし" value={blur} min={0} max={120} onChange={setBlur} />
              <SliderRow label="グレインの濃さ" value={grainOp} min={0} max={100} onChange={setGrainOp} />
              <SliderRow label="グレインの細かさ" value={grainFreq} min={20} max={120} onChange={setGrainFreq} />
              <SliderRow label="明るさ" value={bright} min={40} max={140} onChange={setBright} />
              <SliderRow label="彩度" value={sat} min={0} max={200} onChange={setSat} />
            </div>

            <SectionLabel>色かぶせ(ブランド色)</SectionLabel>
            <div className="mb-3">
              <ColorField label="色" value={tintColor} onChange={setTintColor} />
            </div>
            <div className="mb-3">
              <SliderRow label="かぶせる強さ" value={tintOp} min={0} max={100} onChange={setTintOp} />
            </div>
            <div className="flex items-center gap-3 mb-5">
              <label className="flex-none w-[84px] text-xs text-text-primary/70 font-noto-sans-jp">
                かぶせ方
              </label>
              <Select value={tintBlend} onValueChange={(v) => setTintBlend(v as TintBlend)}>
                <SelectTrigger className="flex-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TINT_BLEND_LABELS) as TintBlend[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {TINT_BLEND_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSavePNG} className="w-full" disabled={!imageDataUrl}>
              <Download className="size-4" />
              PNGで保存
            </Button>
            <p className="text-[11px] text-text-primary/50 font-noto-sans-jp mt-4 leading-relaxed">
              「色かぶせ」を使うと、どんな写真でもブランドのトーンに寄せられます。PNGは見出しごと書き出されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
