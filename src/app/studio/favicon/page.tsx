"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download } from "lucide-react";
import BrandGradient, { type BrandGradientHandle } from "@/components/gradient/BrandGradient";
import {
  FAVICON_LINE_PRESETS,
  buildFaviconSVG,
  type FaviconPattern,
} from "@/components/effects/favicon-generator";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import { Button } from "@/components/ui/button";
import { BRAND_PRESETS } from "@/lib/gradient-presets";

const PATTERN_LABELS: Record<FaviconPattern, string> = {
  blueprint: "ブループリント",
  solidBeta: "ソリッド + βドット",
  gradient: "グラデーション背景",
};

const PATTERN_NOTES: Record<FaviconPattern, string> = {
  blueprint: "薄い方眼(グラフ用紙)を背景のグラデーションに重ね、「設計途中」の見た目にする。",
  solidBeta: "「B」を実線のアウトラインで描き、右下に小さなβドットを添えてベータ版であることを示す。",
  gradient: "Brand Gradient Studioと同じグラデーションを背景にして、その上に「B」の線画を重ねる。",
};

const SIZES = [16, 32, 48, 180, 512] as const;

// Brand Gradient Studio のデフォルト値をそのまま踏襲する
const GRADIENT_DEFAULTS = { blend: 55, grain: 35, grainScale: 60, angle: 115 };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = src;
  });
}

function svgToObjectUrl(svg: string): string {
  return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
}

export default function FaviconStudioPage() {
  const gradRef = useRef<BrandGradientHandle>(null);

  const [pattern, setPattern] = useState<FaviconPattern>("blueprint");
  const [size, setSize] = useState<(typeof SIZES)[number]>(512);
  const [copied, setCopied] = useState(false);

  const [blueprintPresetName, setBlueprintPresetName] = useState<string>("モノ");
  const [blueprintBgC1, setBlueprintBgC1] = useState(BRAND_PRESETS["モノ"][0]);
  const [blueprintBgC2, setBlueprintBgC2] = useState(BRAND_PRESETS["モノ"][1]);
  const [blueprintBgC3, setBlueprintBgC3] = useState(BRAND_PRESETS["モノ"][2]);
  const [blueprintLineColor, setBlueprintLineColor] = useState(FAVICON_LINE_PRESETS.blueprint.lineColor);
  const [blueprintGuideColor, setBlueprintGuideColor] = useState(FAVICON_LINE_PRESETS.blueprint.guideColor);
  const [blueprintStroke, setBlueprintStroke] = useState(FAVICON_LINE_PRESETS.blueprint.strokeWidth);

  const [solidLineColor, setSolidLineColor] = useState(FAVICON_LINE_PRESETS.solidBeta.lineColor);
  const [solidBgColor, setSolidBgColor] = useState(FAVICON_LINE_PRESETS.solidBeta.bgColor);
  const [solidStroke, setSolidStroke] = useState(FAVICON_LINE_PRESETS.solidBeta.strokeWidth);
  const [solidBetaDotColor, setSolidBetaDotColor] = useState(FAVICON_LINE_PRESETS.solidBeta.betaDotColor);

  const firstPresetName = Object.keys(BRAND_PRESETS)[0];
  const [gradientPresetName, setGradientPresetName] = useState<string>(firstPresetName);
  const [gradientBgC1, setGradientBgC1] = useState(BRAND_PRESETS[firstPresetName][0]);
  const [gradientBgC2, setGradientBgC2] = useState(BRAND_PRESETS[firstPresetName][1]);
  const [gradientBgC3, setGradientBgC3] = useState(BRAND_PRESETS[firstPresetName][2]);
  const [gradientLineColor, setGradientLineColor] = useState("#FAFBFB");
  const [gradientStroke, setGradientStroke] = useState(2.6);

  const [previewSmall, setPreviewSmall] = useState<{ p32: string | null; p16: string | null }>({
    p32: null,
    p16: null,
  });

  const usesGradientBg = pattern === "gradient" || pattern === "blueprint";
  const [bgC1, bgC2, bgC3] =
    pattern === "blueprint"
      ? [blueprintBgC1, blueprintBgC2, blueprintBgC3]
      : [gradientBgC1, gradientBgC2, gradientBgC3];

  function applyBlueprintPreset(name: string) {
    const preset = BRAND_PRESETS[name];
    if (!preset) return;
    setBlueprintPresetName(name);
    setBlueprintBgC1(preset[0]);
    setBlueprintBgC2(preset[1]);
    setBlueprintBgC3(preset[2]);
  }

  function applyGradientPreset(name: string) {
    const preset = BRAND_PRESETS[name];
    if (!preset) return;
    setGradientPresetName(name);
    setGradientBgC1(preset[0]);
    setGradientBgC2(preset[1]);
    setGradientBgC3(preset[2]);
  }

  const currentLineStyle = useCallback(() => {
    if (pattern === "blueprint") {
      return {
        ...FAVICON_LINE_PRESETS.blueprint,
        lineColor: blueprintLineColor,
        guideColor: blueprintGuideColor,
        strokeWidth: blueprintStroke,
      };
    }
    if (pattern === "solidBeta") {
      return {
        ...FAVICON_LINE_PRESETS.solidBeta,
        lineColor: solidLineColor,
        bgColor: solidBgColor,
        strokeWidth: solidStroke,
        betaDotColor: solidBetaDotColor,
      };
    }
    // gradient: 背景はBrandGradientが担当するので、ここは透明背景の線画のみ
    return {
      background: "none" as const,
      bgColor: "#ffffff",
      showGrid: false,
      guideColor: "#ffffff",
      lineColor: gradientLineColor,
      strokeWidth: gradientStroke,
      betaDot: false,
      betaDotColor: "#FF9900",
    };
  }, [
    pattern,
    blueprintLineColor,
    blueprintGuideColor,
    blueprintStroke,
    solidLineColor,
    solidBgColor,
    solidStroke,
    solidBetaDotColor,
    gradientLineColor,
    gradientStroke,
  ]);

  const generatePNG = useCallback(
    (targetSize: number): Promise<string | null> => {
      const style = currentLineStyle();
      const lineSVG = buildFaviconSVG(style);

      if (!usesGradientBg) {
        const url = svgToObjectUrl(lineSVG);
        return loadImage(url).then((img) => {
          URL.revokeObjectURL(url);
          const cv = document.createElement("canvas");
          cv.width = targetSize;
          cv.height = targetSize;
          const ctx = cv.getContext("2d");
          ctx?.drawImage(img, 0, 0, targetSize, targetSize);
          return cv.toDataURL("image/png");
        });
      }

      const bgUrl = gradRef.current?.exportPNG(targetSize, targetSize);
      if (!bgUrl) return Promise.resolve(null);
      const lineUrl = svgToObjectUrl(lineSVG);
      return Promise.all([loadImage(bgUrl), loadImage(lineUrl)]).then(([bgImg, lineImg]) => {
        URL.revokeObjectURL(lineUrl);
        const cv = document.createElement("canvas");
        cv.width = targetSize;
        cv.height = targetSize;
        const ctx = cv.getContext("2d");
        if (!ctx) return null;
        ctx.drawImage(bgImg, 0, 0, targetSize, targetSize);
        ctx.drawImage(lineImg, 0, 0, targetSize, targetSize);
        return cv.toDataURL("image/png");
      });
    },
    [usesGradientBg, currentLineStyle],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all([generatePNG(32), generatePNG(16)])
      .then(([p32, p16]) => {
        if (!cancelled) setPreviewSmall({ p32, p16 });
      })
      .catch(() => {
        if (!cancelled) setPreviewSmall({ p32: null, p16: null });
      });
    return () => {
      cancelled = true;
    };
  }, [generatePNG]);

  function handleSavePNG() {
    generatePNG(size)
      .then((url) => {
        if (!url) return;
        const a = document.createElement("a");
        a.download = `bono-favicon-${pattern}-${size}.png`;
        a.href = url;
        a.click();
      })
      .catch(() => {
        // 画像化に失敗した場合は何もしない(ボタンは再度押せる)
      });
  }

  async function handleCopySVG() {
    const svg = buildFaviconSVG(currentLineStyle());
    setCopied(false);
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
    } catch {
      // クリップボードAPIが使えない環境では何もしない
    }
  }

  const overlaySVG = usesGradientBg ? buildFaviconSVG(currentLineStyle()) : null;
  const flatSVG = !usesGradientBg ? buildFaviconSVG(currentLineStyle()) : null;

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <Link href="/studio" className="inline-flex items-center gap-1 text-sm font-bold text-text-primary/50 font-noto-sans-jp hover:text-text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Studio
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            Favicon Studio
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            BONOロゴの「B」をモチーフに、ベータ版だとひと目でわかる線画ベースのfaviconを生成する。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div className="w-full lg:sticky lg:top-8 bg-surface p-8 flex flex-col items-center">
            <div className="relative w-full max-w-[260px] aspect-square overflow-hidden">
              {usesGradientBg && (
                <BrandGradient
                  key={pattern}
                  ref={gradRef}
                  className="absolute inset-0"
                  mode={0}
                  colors={[bgC1, bgC2, bgC3, "#ffffff"]}
                  blend={GRADIENT_DEFAULTS.blend}
                  grain={GRADIENT_DEFAULTS.grain}
                  grainScale={GRADIENT_DEFAULTS.grainScale}
                  angle={GRADIENT_DEFAULTS.angle}
                  turns={9}
                  radius={46}
                  thick={16}
                />
              )}
              {flatSVG && (
                <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: flatSVG }} />
              )}
              {overlaySVG && (
                <div className="absolute inset-0" dangerouslySetInnerHTML={{ __html: overlaySVG }} />
              )}
            </div>

            <div className="flex items-end gap-6 mt-8">
              <div className="flex flex-col items-center gap-2">
                {previewSmall.p32 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSmall.p32} width={32} height={32} alt="32pxプレビュー" className="rounded-[4px]" />
                )}
                <span className="text-[11px] text-text-primary/50 font-noto-sans-jp">32px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                {previewSmall.p16 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSmall.p16} width={16} height={16} alt="16pxプレビュー" className="rounded-[3px]" />
                )}
                <span className="text-[11px] text-text-primary/50 font-noto-sans-jp">16px</span>
              </div>
            </div>
            <p className="text-xs text-text-primary/50 font-noto-sans-jp mt-4 text-center leading-relaxed">
              {PATTERN_NOTES[pattern]}
            </p>
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <SectionLabel>パターン</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {(Object.keys(PATTERN_LABELS) as FaviconPattern[]).map((p) => (
                <ToggleButton key={p} active={pattern === p} onClick={() => setPattern(p)}>
                  {PATTERN_LABELS[p]}
                </ToggleButton>
              ))}
            </div>

            {pattern === "blueprint" && (
              <>
                <SectionLabel>ブランドプリセット</SectionLabel>
                <div className="flex gap-1.5 flex-wrap mb-5">
                  {Object.keys(BRAND_PRESETS).map((name) => (
                    <ToggleButton
                      key={name}
                      active={blueprintPresetName === name}
                      onClick={() => applyBlueprintPreset(name)}
                    >
                      {name}
                    </ToggleButton>
                  ))}
                </div>
                <SectionLabel>背景カラー</SectionLabel>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  <ColorField label="色1" value={blueprintBgC1} onChange={setBlueprintBgC1} />
                  <ColorField label="色2" value={blueprintBgC2} onChange={setBlueprintBgC2} />
                  <ColorField label="色3" value={blueprintBgC3} onChange={setBlueprintBgC3} />
                </div>
                <SectionLabel>線カラー</SectionLabel>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  <ColorField label="線" value={blueprintLineColor} onChange={setBlueprintLineColor} />
                  <ColorField label="グリッド" value={blueprintGuideColor} onChange={setBlueprintGuideColor} />
                </div>
                <SectionLabel>線の太さ</SectionLabel>
                <div className="mb-5">
                  <SliderRow label="太さ" value={blueprintStroke} min={1} max={6} step={0.2} onChange={setBlueprintStroke} />
                </div>
              </>
            )}

            {pattern === "solidBeta" && (
              <>
                <SectionLabel>カラー</SectionLabel>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  <ColorField label="線" value={solidLineColor} onChange={setSolidLineColor} />
                  <ColorField label="背景" value={solidBgColor} onChange={setSolidBgColor} />
                  <ColorField label="βドット" value={solidBetaDotColor} onChange={setSolidBetaDotColor} />
                </div>
                <SectionLabel>線の太さ</SectionLabel>
                <div className="mb-5">
                  <SliderRow label="太さ" value={solidStroke} min={1} max={6} step={0.2} onChange={setSolidStroke} />
                </div>
              </>
            )}

            {pattern === "gradient" && (
              <>
                <SectionLabel>ブランドプリセット</SectionLabel>
                <div className="flex gap-1.5 flex-wrap mb-5">
                  {Object.keys(BRAND_PRESETS).map((name) => (
                    <ToggleButton
                      key={name}
                      active={gradientPresetName === name}
                      onClick={() => applyGradientPreset(name)}
                    >
                      {name}
                    </ToggleButton>
                  ))}
                </div>
                <SectionLabel>背景カラー</SectionLabel>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  <ColorField label="色1" value={gradientBgC1} onChange={setGradientBgC1} />
                  <ColorField label="色2" value={gradientBgC2} onChange={setGradientBgC2} />
                  <ColorField label="色3" value={gradientBgC3} onChange={setGradientBgC3} />
                </div>
                <SectionLabel>線カラー</SectionLabel>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  <ColorField label="線" value={gradientLineColor} onChange={setGradientLineColor} />
                </div>
                <SectionLabel>線の太さ</SectionLabel>
                <div className="mb-5">
                  <SliderRow label="太さ" value={gradientStroke} min={1} max={6} step={0.2} onChange={setGradientStroke} />
                </div>
              </>
            )}

            <SectionLabel>書き出しサイズ</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {SIZES.map((s) => (
                <ToggleButton key={s} active={size === s} onClick={() => setSize(s)}>
                  {s}px
                </ToggleButton>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePNG} className="flex-1">
                <Download className="size-4" />
                PNG保存
              </Button>
              {!usesGradientBg && (
                <Button onClick={handleCopySVG} variant="outline" className="flex-1">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  SVGをコピー
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
