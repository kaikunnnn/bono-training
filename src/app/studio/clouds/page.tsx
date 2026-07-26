"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Shuffle } from "lucide-react";
import CloudSkyStudio, {
  type CloudSkyHandle,
  type CloudTimeOfDay,
} from "@/components/effects/CloudSkyStudio";
import ColorField from "@/components/studio/ColorField";
import { SectionLabel, SliderRow, ToggleButton } from "@/components/studio/StudioControls";
import { ASPECT_RATIOS, findAspectRatio, type AspectRatioKey } from "@/components/studio/aspect-ratios";
import { Button } from "@/components/ui/button";
import { CLOUD_TIME_PRESETS } from "@/lib/sky-presets";

const TIME_KEYS = Object.keys(CLOUD_TIME_PRESETS) as CloudTimeOfDay[];

export default function CloudSkyPage() {
  const studioRef = useRef<CloudSkyHandle>(null);

  const [ratioKey, setRatioKey] = useState<AspectRatioKey>("16:9");
  const ratio = findAspectRatio(ratioKey);

  const [timeOfDay, setTimeOfDay] = useState<CloudTimeOfDay>("morning");
  const preset = CLOUD_TIME_PRESETS[timeOfDay];
  const [skyTop, setSkyTop] = useState(preset.skyTop);
  const [skyBottom, setSkyBottom] = useState(preset.skyBottom);
  const [cloudColor, setCloudColor] = useState(preset.cloudColor);

  const [cloudCount, setCloudCount] = useState(14);
  const [cloudSize, setCloudSize] = useState(28);
  const [cloudSoftness, setCloudSoftness] = useState(55);
  const [cloudOpacity, setCloudOpacity] = useState(80);
  const [dir, setDir] = useState(225);
  const [streak, setStreak] = useState(0);
  const [blur, setBlur] = useState(0);
  const [grain, setGrain] = useState(15);
  const [seed, setSeed] = useState(2024);

  function applyTimeOfDay(t: CloudTimeOfDay) {
    setTimeOfDay(t);
    const p = CLOUD_TIME_PRESETS[t];
    setSkyTop(p.skyTop);
    setSkyBottom(p.skyBottom);
    setCloudColor(p.cloudColor);
  }

  function handleSavePNG() {
    const url = studioRef.current?.exportPNG();
    if (!url) return;
    const a = document.createElement("a");
    a.download = `cloud-sky-${timeOfDay}-${ratio.key.replace(":", "x")}.png`;
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
            Cloud Sky Studio
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            雲＋空を背景素材として生成する。朝・昼・夜で色味が変わる。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          <div
            className="relative w-full mx-auto lg:sticky lg:top-8 overflow-hidden bg-surface"
            style={{ aspectRatio: `${ratio.w} / ${ratio.h}`, maxHeight: "78vh" }}
          >
            <CloudSkyStudio
              ref={studioRef}
              className="absolute inset-0"
              timeOfDay={timeOfDay}
              skyTop={skyTop}
              skyBottom={skyBottom}
              cloudColor={cloudColor}
              cloudCount={cloudCount}
              cloudSize={cloudSize}
              cloudSoftness={cloudSoftness}
              cloudOpacity={cloudOpacity}
              dir={dir}
              streak={streak}
              blur={blur}
              grain={grain}
              seed={seed}
            />
          </div>

          <div className="bg-surface rounded-[20px] p-5">
            <SectionLabel>時間帯</SectionLabel>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {TIME_KEYS.map((t) => (
                <ToggleButton key={t} active={timeOfDay === t} onClick={() => applyTimeOfDay(t)}>
                  {CLOUD_TIME_PRESETS[t].label}
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
              <ColorField label="空(上)" value={skyTop} onChange={setSkyTop} />
              <ColorField label="空(下)" value={skyBottom} onChange={setSkyBottom} />
              <ColorField label="雲" value={cloudColor} onChange={setCloudColor} />
            </div>

            <SectionLabel>雲</SectionLabel>
            <div className="mb-5">
              <SliderRow label="数" value={cloudCount} min={2} max={40} onChange={setCloudCount} />
              <SliderRow label="大きさ" value={cloudSize} min={8} max={60} onChange={setCloudSize} />
              <SliderRow label="ふわふわ感" value={cloudSoftness} min={0} max={100} onChange={setCloudSoftness} />
              <SliderRow label="濃さ" value={cloudOpacity} min={10} max={100} onChange={setCloudOpacity} />
            </div>

            <SectionLabel>流れ(方向性)</SectionLabel>
            <div className="mb-5">
              <SliderRow label="向き(角度)" value={dir} min={0} max={360} onChange={setDir} />
              <SliderRow label="流れの強さ" value={streak} min={0} max={100} onChange={setStreak} />
            </div>

            <SectionLabel>質感</SectionLabel>
            <div className="mb-5">
              <SliderRow label="全体ぼかし" value={blur} min={0} max={60} onChange={setBlur} />
              <SliderRow label="グレイン" value={grain} min={0} max={100} onChange={setGrain} />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSavePNG} className="flex-1">
                <Download className="size-4" />
                PNG保存
              </Button>
              <Button onClick={() => setSeed((Math.random() * 1e9) | 0)} variant="outline" className="flex-1">
                <Shuffle className="size-4" />
                配置をシャッフル
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
