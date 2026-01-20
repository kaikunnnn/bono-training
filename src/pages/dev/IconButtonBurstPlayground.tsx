import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck } from "@/components/ui/icon-check";
import { IconButton } from "@/components/ui/button/IconButton";
import styles from "./IconButtonBurstPlayground.module.css";

type BurstPatternId = "prod" | "pop";
type DemoId = "prod" | "following" | "candy" | "stars" | "bubbles" | "pop";

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function useCompleteBurstKey(isCompleted: boolean) {
  const [burstKey, setBurstKey] = useState(0);
  const prevRef = useRef(isCompleted);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = isCompleted;

    if (!prev && isCompleted) {
      setBurstKey((k) => k + 1);
    }
  }, [isCompleted]);

  return burstKey;
}

function useBurstOverlay(burstKey: number) {
  const [isOn, setIsOn] = useState(false);
  const prevKeyRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prev = prevKeyRef.current;
    prevKeyRef.current = burstKey;

    if (prev === undefined) return;
    if (prev === burstKey) return;

    setIsOn(true);
    const t = window.setTimeout(() => setIsOn(false), 1600);
    return () => window.clearTimeout(t);
  }, [burstKey]);

  return isOn;
}

const confettiPalette = [
  "#4CC9F0", // cyan
  "#4895EF", // blue
  "#FF7AB6", // dawn pink
  "#FFC2DD", // soft pink
  "#F9C74F", // yellow
  "#43AA8B", // green
];

function BurstOverlayCandy({ burstKey, spread }: { burstKey: number; spread: number }) {
  const isOn = useBurstOverlay(burstKey);
  const seed = burstKey * 10007 + 123;

  const nodes = useMemo(() => {
    const rand = mulberry32(seed);
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const a = (360 / count) * i + (rand() * 2 - 1) * 14;
      const r0 = 12 + rand() * 10;
      const r1 = (70 + rand() * 70) * spread;
      const dly = Math.floor(rand() * 180);
      const dur = 820 + Math.floor(rand() * 520);
      const s = 4 + Math.floor(rand() * 4); // 4..7
      const rot = Math.floor(rand() * 180) - 90;
      const bg = confettiPalette[Math.floor(rand() * confettiPalette.length)];
      const isPill = rand() > 0.45;
      const cls = isPill ? styles.pill : styles.dot;
      return {
        key: i,
        cls,
        style: {
          ["--a" as never]: `${a}deg`,
          ["--r0" as never]: `${r0}px`,
          ["--r1" as never]: `${r1}px`,
          ["--s" as never]: `${s}px`,
          ["--dly" as never]: `${dly}ms`,
          ["--dur" as never]: `${dur}ms`,
          ["--rot" as never]: `${rot}deg`,
          ["--bg" as never]: bg,
        } as React.CSSProperties,
      };
    });
  }, [seed, spread]);

  if (!isOn) return null;
  return (
    <span className={styles.overlayRoot} style={{ ["--spread" as never]: `${spread}` }} aria-hidden="true">
      {nodes.map((n) => (
        <span key={n.key} className={n.cls} style={n.style} />
      ))}
    </span>
  );
}

function BurstOverlaySparkles({ burstKey, spread }: { burstKey: number; spread: number }) {
  const isOn = useBurstOverlay(burstKey);
  const seed = burstKey * 10007 + 777;

  const nodes = useMemo(() => {
    const rand = mulberry32(seed);
    const count = 14;
    return Array.from({ length: count }).map((_, i) => {
      const a = (360 / count) * i + (rand() * 2 - 1) * 20;
      const r0 = 10 + rand() * 10;
      const r1 = (76 + rand() * 84) * spread;
      const dly = Math.floor(rand() * 220);
      const dur = 900 + Math.floor(rand() * 600);
      const s = 6 + Math.floor(rand() * 4); // 6..9
      const bg = confettiPalette[Math.floor(rand() * confettiPalette.length)];
      return {
        key: i,
        style: {
          ["--a" as never]: `${a}deg`,
          ["--r0" as never]: `${r0}px`,
          ["--r1" as never]: `${r1}px`,
          ["--s" as never]: `${s}px`,
          ["--dly" as never]: `${dly}ms`,
          ["--dur" as never]: `${dur}ms`,
          ["--bg" as never]: bg,
        } as React.CSSProperties,
      };
    });
  }, [seed, spread]);

  if (!isOn) return null;
  return (
    <span className={styles.overlayRoot} style={{ ["--spread" as never]: `${spread}` }} aria-hidden="true">
      {nodes.map((n) => (
        <span key={n.key} className={styles.star} style={n.style} />
      ))}
    </span>
  );
}

function BurstOverlayBubbles({ burstKey, spread }: { burstKey: number; spread: number }) {
  const isOn = useBurstOverlay(burstKey);
  const seed = burstKey * 10007 + 2029;

  const nodes = useMemo(() => {
    const rand = mulberry32(seed);
    const count = 12;
    return Array.from({ length: count }).map((_, i) => {
      const a = (360 / count) * i + (rand() * 2 - 1) * 22;
      const r0 = 10 + rand() * 10;
      const r1 = (86 + rand() * 110) * spread;
      const dly = Math.floor(rand() * 260);
      const dur = 1100 + Math.floor(rand() * 800);
      const s = 9 + Math.floor(rand() * 5); // 9..13
      const bg = confettiPalette[Math.floor(rand() * confettiPalette.length)];
      return {
        key: i,
        style: {
          ["--a" as never]: `${a}deg`,
          ["--r0" as never]: `${r0}px`,
          ["--r1" as never]: `${r1}px`,
          ["--s" as never]: `${s}px`,
          ["--dly" as never]: `${dly}ms`,
          ["--dur" as never]: `${dur}ms`,
          ["--bg" as never]: bg,
        } as React.CSSProperties,
      };
    });
  }, [seed, spread]);

  if (!isOn) return null;
  return (
    <span className={styles.overlayRoot} style={{ ["--spread" as never]: `${spread}` }} aria-hidden="true">
      {nodes.map((n) => (
        <span key={n.key} className={styles.bubble} style={n.style} />
      ))}
    </span>
  );
}

function ExperimentalPopBurst({ burstKey }: { burstKey: number }) {
  const [isBursting, setIsBursting] = useState(false);
  const prevKeyRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const prev = prevKeyRef.current;
    prevKeyRef.current = burstKey;

    if (prev === undefined) return;
    if (prev === burstKey) return;

    setIsBursting(false);
    requestAnimationFrame(() => setIsBursting(true));
  }, [burstKey]);

  const particles = useMemo(() => {
    // 画像の「パーン」に寄せて、大小混ぜて周囲に散らす
    const base: Array<{ a: number; d: number; s: number; o: number }> = [
      { a: 10, d: 54, s: 9, o: 0.95 },
      { a: 35, d: 60, s: 7, o: 0.85 },
      { a: 70, d: 52, s: 8, o: 0.92 },
      { a: 110, d: 58, s: 7, o: 0.80 },
      { a: 150, d: 56, s: 9, o: 0.88 },
      { a: 190, d: 62, s: 7, o: 0.82 },
      { a: 230, d: 54, s: 8, o: 0.90 },
      { a: 265, d: 60, s: 7, o: 0.78 },
      { a: 300, d: 55, s: 8, o: 0.86 },
      { a: 330, d: 62, s: 7, o: 0.82 },
      // 小粒
      { a: 55, d: 44, s: 5, o: 0.60 },
      { a: 125, d: 46, s: 5, o: 0.58 },
      { a: 205, d: 44, s: 5, o: 0.62 },
      { a: 285, d: 46, s: 5, o: 0.56 },
    ];
    return base;
  }, []);

  if (!isBursting) return null;

  return (
    <span className={styles.burstRoot} aria-hidden="true">
      <span className={styles.popRing} onAnimationEnd={() => setIsBursting(false)} />
      {particles.map((p, i) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={styles.popParticle}
          style={{
            // CSS variables
            ["--a" as never]: `${p.a}deg`,
            ["--d" as never]: `${p.d}px`,
            ["--s" as never]: `${p.s}px`,
            ["--c" as never]: `rgba(84, 174, 255, ${p.o})`,
          }}
        />
      ))}
    </span>
  );
}

function DemoCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="mb-4">
        <div className="text-lg font-bold">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <div className="flex items-center gap-4">{children}</div>
    </div>
  );
}

export default function IconButtonBurstPlayground() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [pattern, setPattern] = useState<BurstPatternId>("pop");
  const [scheme, setScheme] = useState<"confetti" | "ocean" | "aurora">("confetti");
  const [distanceScale, setDistanceScale] = useState(1.25);
  // ユーザーが「良い」と言ったパラメータをデフォルトに設定
  const [pressDownMs, setPressDownMs] = useState(520);
  const [pressUpMs, setPressUpMs] = useState(1600);
  const [pressDownScale, setPressDownScale] = useState(0.92);
  const [pressUpScale, setPressUpScale] = useState(1.06);
  const [activeDemo, setActiveDemo] = useState<DemoId>("following");
  const [viewMode, setViewMode] = useState<"single" | "all">("single");
  const [checkAnimEnabled, setCheckAnimEnabled] = useState(true);
  const [checkPopMs, setCheckPopMs] = useState(360);
  const [checkDrawMs, setCheckDrawMs] = useState(260);

  const burstKey = useCompleteBurstKey(isCompleted);

  const demoTabs: Array<{ id: DemoId; label: string }> = [
    { id: "prod", label: "現行（本番）" },
    { id: "following", label: "Following" },
    { id: "candy", label: "Candy" },
    { id: "stars", label: "Stars" },
    { id: "bubbles", label: "Bubbles" },
    { id: "pop", label: "POP" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link to="/dev" className="text-blue-600 hover:underline text-sm">
            ← Dev Home
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl font-bold">IconButton Burst Playground</h1>
          <p className="text-gray-600 mt-2">
            「完了にする → 完了済み」に切り替わった瞬間だけ burst を出すパターンを比較します（完了解除では出さない）。
          </p>
        </header>

        {/* 表示モード / タブ */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">表示:</span>
            <button
              type="button"
              onClick={() => setViewMode("single")}
              className={`px-3 py-2 rounded-md border text-sm bg-white ${
                viewMode === "single" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
              }`}
            >
              1つずつ
            </button>
            <button
              type="button"
              onClick={() => setViewMode("all")}
              className={`px-3 py-2 rounded-md border text-sm bg-white ${
                viewMode === "all" ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-600"
              }`}
            >
              全表示（比較）
            </button>
          </div>

          {viewMode === "single" && (
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {demoTabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveDemo(t.id)}
                  className={`px-3 py-2 rounded-full border text-sm bg-white transition-colors ${
                    activeDemo === t.id
                      ? "border-gray-900 text-gray-900"
                      : "border-gray-200 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
            onClick={() => setIsCompleted(false)}
          >
            状態を未完了に戻す
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50"
            onClick={() => setIsCompleted(true)}
          >
            状態を完了にする（burst発火）
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-600">表示パターン:</span>
            <select
              className="px-3 py-2 rounded-md border bg-white"
              value={pattern}
              onChange={(e) => setPattern(e.target.value as BurstPatternId)}
            >
              <option value="pop">POP（粒が飛ぶ/リングあり）</option>
              <option value="prod">現行（本番）</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">配色:</span>
            <select
              className="px-3 py-2 rounded-md border bg-white"
              value={scheme}
              onChange={(e) => setScheme(e.target.value as typeof scheme)}
            >
              <option value="confetti">Confetti（カラフル）</option>
              <option value="ocean">Ocean（青寄りネオン）</option>
              <option value="aurora">Aurora（オーロラ）</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">飛距離:</span>
            <input
              type="range"
              min={1}
              max={2.2}
              step={0.05}
              value={distanceScale}
              onChange={(e) => setDistanceScale(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 w-12 tabular-nums">{distanceScale.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">凹み:</span>
            <input
              type="range"
              min={80}
              max={520}
              step={10}
              value={pressDownMs}
              onChange={(e) => setPressDownMs(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 w-14 tabular-nums">{pressDownMs}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">戻り:</span>
            <input
              type="range"
              min={200}
              max={1600}
              step={20}
              value={pressUpMs}
              onChange={(e) => setPressUpMs(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 w-14 tabular-nums">{pressUpMs}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">凹み量:</span>
            <input
              type="range"
              min={0.92}
              max={0.99}
              step={0.005}
              value={pressDownScale}
              onChange={(e) => setPressDownScale(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 w-14 tabular-nums">{pressDownScale.toFixed(3)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">膨らみ:</span>
            <input
              type="range"
              min={1}
              max={1.08}
              step={0.005}
              value={pressUpScale}
              onChange={(e) => setPressUpScale(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 w-14 tabular-nums">{pressUpScale.toFixed(3)}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 flex items-center gap-2">
              <input
                type="checkbox"
                checked={checkAnimEnabled}
                onChange={(e) => setCheckAnimEnabled(e.target.checked)}
              />
              チェックアニメ
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">チェックpop:</span>
            <input
              type="range"
              min={120}
              max={900}
              step={20}
              value={checkPopMs}
              onChange={(e) => setCheckPopMs(Number(e.target.value))}
              disabled={!checkAnimEnabled}
            />
            <span className="text-sm text-gray-600 w-14 tabular-nums">{checkPopMs}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">チェックdraw:</span>
            <input
              type="range"
              min={120}
              max={900}
              step={20}
              value={checkDrawMs}
              onChange={(e) => setCheckDrawMs(Number(e.target.value))}
              disabled={!checkAnimEnabled}
            />
            <span className="text-sm text-gray-600 w-14 tabular-nums">{checkDrawMs}ms</span>
          </div>
        </div>

        <div className="grid gap-[100px]">
          {(viewMode === "all" || activeDemo === "prod") && (
            <DemoCard
              title="現行（本番）"
              description="いま本番に入っている burst。比較用。"
            >
              <IconButton
                icon={
                  <IconCheck
                    isCompleted={isCompleted}
                    tone="strong"
                    animateOnComplete={checkAnimEnabled}
                    popMs={checkPopMs}
                    drawMs={checkDrawMs}
                  />
                }
                label={isCompleted ? "完了済み" : "完了にする"}
                onClick={() => setIsCompleted((v) => !v)}
                burstKey={burstKey}
                burstSync="press-release-start"
                pressBounce
                pressBounceConfig={{
                  downMs: pressDownMs,
                  upMs: pressUpMs,
                  downScale: pressDownScale,
                  upScale: pressUpScale,
                }}
              />
            </DemoCard>
          )}

          {(viewMode === "all" || activeDemo === "following") && (
            <DemoCard
              title="Following（実験）"
              description="共有GIFの「周囲に青いドットがパーンと弾ける」動き寄せ。"
            >
              <IconButton
                icon={
                  <IconCheck
                    isCompleted={isCompleted}
                    tone="strong"
                    animateOnComplete={checkAnimEnabled}
                    popMs={checkPopMs}
                    drawMs={checkDrawMs}
                  />
                }
                label={isCompleted ? "完了済み" : "完了にする"}
                onClick={() => setIsCompleted((v) => !v)}
                burstKey={burstKey}
                burstVariant="following"
                burstColorScheme={scheme}
                burstDistanceScale={distanceScale}
                burstSync="press-release-start"
                pressBounce
                pressBounceConfig={{
                  downMs: pressDownMs,
                  upMs: pressUpMs,
                  downScale: pressDownScale,
                  upScale: pressUpScale,
                }}
              />
            </DemoCard>
          )}

          {(viewMode === "all" || activeDemo === "candy") && (
            <DemoCard
              title="Candy Confetti（実験）"
              description="まる＋カプセルが飛び散る、かわいいキャンディっぽい弾け方。"
            >
              <div className="relative inline-block">
                <IconButton
                  icon={
                    <IconCheck
                      isCompleted={isCompleted}
                      tone="strong"
                      animateOnComplete={checkAnimEnabled}
                      popMs={checkPopMs}
                      drawMs={checkDrawMs}
                    />
                  }
                  label={isCompleted ? "完了済み" : "完了にする"}
                  onClick={() => setIsCompleted((v) => !v)}
                  pressBounce
                  pressBounceConfig={{
                    downMs: pressDownMs,
                    upMs: pressUpMs,
                    downScale: pressDownScale,
                    upScale: pressUpScale,
                  }}
                />
                <BurstOverlayCandy burstKey={burstKey} spread={distanceScale} />
              </div>
            </DemoCard>
          )}

          {(viewMode === "all" || activeDemo === "stars") && (
            <DemoCard
              title="Sparkle Stars（実験）"
              description="小さな星がパーンと飛んでキラっと消える、ポップで可愛い挙動。"
            >
              <div className="relative inline-block">
                <IconButton
                  icon={
                    <IconCheck
                      isCompleted={isCompleted}
                      tone="strong"
                      animateOnComplete={checkAnimEnabled}
                      popMs={checkPopMs}
                      drawMs={checkDrawMs}
                    />
                  }
                  label={isCompleted ? "完了済み" : "完了にする"}
                  onClick={() => setIsCompleted((v) => !v)}
                  pressBounce
                  pressBounceConfig={{
                    downMs: pressDownMs,
                    upMs: pressUpMs,
                    downScale: pressDownScale,
                    upScale: pressUpScale,
                  }}
                />
                <BurstOverlaySparkles burstKey={burstKey} spread={distanceScale} />
              </div>
            </DemoCard>
          )}

          {(viewMode === "all" || activeDemo === "bubbles") && (
            <DemoCard
              title="Bubble Pop（実験）"
              description="しゃぼん玉がふわっと広がって消える、柔らかいお祝い感。"
            >
              <div className="relative inline-block">
                <IconButton
                  icon={
                    <IconCheck
                      isCompleted={isCompleted}
                      tone="strong"
                      animateOnComplete={checkAnimEnabled}
                      popMs={checkPopMs}
                      drawMs={checkDrawMs}
                    />
                  }
                  label={isCompleted ? "完了済み" : "完了にする"}
                  onClick={() => setIsCompleted((v) => !v)}
                  pressBounce
                  pressBounceConfig={{
                    downMs: pressDownMs,
                    upMs: pressUpMs,
                    downScale: pressDownScale,
                    upScale: pressUpScale,
                  }}
                />
                <BurstOverlayBubbles burstKey={burstKey} spread={distanceScale} />
              </div>
            </DemoCard>
          )}

          {(viewMode === "all" || activeDemo === "pop") && (
            <DemoCard
              title="POP（実験）"
              description="粒が中心から外へ飛ぶ“パーン”寄りの案（完了になった瞬間だけ発火）。"
            >
              <button
                type="button"
                className={styles.stageButton}
                onClick={() => setIsCompleted((v) => !v)}
              >
                {pattern === "pop" && <ExperimentalPopBurst burstKey={burstKey} />}

                <span className={styles.stageContent}>
                  <span className="w-5 h-5 flex items-center justify-center">
                    <IconCheck
                      isCompleted={isCompleted}
                      tone="strong"
                      animateOnComplete={checkAnimEnabled}
                      popMs={checkPopMs}
                      drawMs={checkDrawMs}
                    />
                  </span>
                  <span className="font-semibold text-[14px] text-[#020817] leading-[20px]">
                    {isCompleted ? "完了済み" : "完了にする"}
                  </span>
                </span>
              </button>
            </DemoCard>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-600">
          次はこのページに「派手さのプリセット（粒数/距離/時間/色）」を増やして、好みを決めたら本番の `IconButton.module.css`
          へ反映していく流れがやりやすいです。
        </div>
      </div>
    </div>
  );
}

