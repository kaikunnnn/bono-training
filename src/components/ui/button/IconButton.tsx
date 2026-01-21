import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./IconButton.module.css";

export interface IconButtonProps {
  /** アイコン要素 */
  icon?: React.ReactNode;
  /** ボタンラベル */
  label: string;
  /** 遷移先URL（指定時はLinkとして動作） */
  to?: string;
  /** クリックハンドラ */
  onClick?: () => void;
  /** クリック時に弾けるアニメーションを出す（主に「完了にする」用） */
  burstOnClick?: boolean;
  /** 任意のタイミングで burst を発火させたい場合のキー（値が変わるたびに発火） */
  burstKey?: number;
  /**
   * burst の発火タイミング調整
   * - none: 即発火
   * - press-release-start: 押下の凹みが「戻り始める瞬間（離した瞬間）」に合わせて発火
   * - press-return: press bounce の「戻り始め（ピーク後）」に合わせて発火
   */
  burstSync?: "none" | "press-release-start" | "press-return";
  /** burst の見た目バリアント */
  burstVariant?: "classic" | "following" | "candy";
  /** following burst の配色プリセット */
  burstColorScheme?: "confetti" | "ocean" | "aurora";
  /** following burst の飛距離倍率（1=標準） */
  burstDistanceScale?: number;
  /** 押下時のバウンス（マウス押下で凹み、離したらふわっと戻る） */
  pressBounce?: boolean;
  /** 押下時バウンスのパラメータ（devで調整用） */
  pressBounceConfig?: {
    downScale?: number; // 押し込み時の縮小率
    upScale?: number; // 離した直後の膨らみ率
    downMs?: number; // 押し込みにかける時間
    upMs?: number; // 戻りにかける時間
  };
}

type FollowingParticle = {
  a: number; // angle (deg)
  r0: number; // start radius (px)
  r1: number; // end radius (px)
  s: number; // size (px)
  o: number; // opacity (0-1)
  dur: number; // duration (ms)
  dly: number; // delay (ms)
};

type CandyParticleKind = "dot" | "pill";
type CandyParticle = FollowingParticle & {
  kind: CandyParticleKind;
  rot: number; // pill rotation
};

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

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * アイコン付きボタンコンポーネント
 * マイページのプロフィールボタンなどで使用
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  to,
  onClick,
  burstOnClick = false,
  burstKey,
  burstSync = "none",
  burstVariant = "classic",
  burstColorScheme = "confetti",
  burstDistanceScale = 1,
  pressBounce = false,
  pressBounceConfig,
}) => {
  const hasIcon = Boolean(icon);
  const className =
    `relative bg-white px-[12px] py-[8px] rounded-[12px] border border-[rgba(0,0,0,0.08)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.06)] inline-flex items-center ${hasIcon ? "gap-[4px]" : "gap-0"} cursor-pointer transition-[box-shadow,border-color] duration-150 hover:border-black/15 hover:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2`;

  const [isBursting, setIsBursting] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const [isPressDown, setIsPressDown] = useState(false);
  const [isPressReleasing, setIsPressReleasing] = useState(false);
  const prevBurstKeyRef = useRef<number | undefined>(undefined);
  const burstStartTimeoutRef = useRef<number | null>(null);
  const burstTimeoutRef = useRef<number | null>(null);

  const pressVars = useMemo(() => {
    const downScale = pressBounceConfig?.downScale ?? 0.96;
    const upScale = pressBounceConfig?.upScale ?? 1.02;
    const downMs = pressBounceConfig?.downMs ?? 180;
    const upMs = pressBounceConfig?.upMs ?? 720;
    return { downScale, upScale, downMs, upMs };
  }, [pressBounceConfig]);

  const startBurst = useCallback(() => {
    setIsBursting(false);
    requestAnimationFrame(() => setIsBursting(true));

    // pseudo要素/子要素の animationend に依存しない（複数粒・ランダムdurationでも確実に片付ける）
    if (burstTimeoutRef.current !== null) {
      window.clearTimeout(burstTimeoutRef.current);
    }
    // following/candy は粒ごとにdelay/durationがバラけるため少し長め
    const ttl = burstVariant === "following" || burstVariant === "candy" ? 1500 : 700;
    burstTimeoutRef.current = window.setTimeout(() => {
      setIsBursting(false);
    }, ttl);
  }, [burstVariant]);

  const getBurstDelayMs = useCallback(
    (opts?: { preferPressReturn?: boolean }) => {
      const preferPressReturn = opts?.preferPressReturn ?? false;
      if (!preferPressReturn) return 0;
      if (!pressBounce) return 0;
      if (burstSync === "press-release-start") return 0;
      if (burstSync !== "press-return") return 0;

      // `@keyframes press-release` のピークが 55% → そこから「戻り始め」
      const peakRatio = 0.55;
      return Math.max(0, Math.round(pressVars.upMs * peakRatio));
    },
    [burstSync, pressBounce, pressVars.upMs],
  );

  const triggerBurst = useCallback(
    (opts?: { delayMs?: number }) => {
      // 連打でも毎回確実に発火させる（粒のランダムseedも更新したい）
      setBurstId((id) => id + 1);

      if (burstStartTimeoutRef.current !== null) {
        window.clearTimeout(burstStartTimeoutRef.current);
        burstStartTimeoutRef.current = null;
      }

      const delayMs = opts?.delayMs ?? 0;
      if (delayMs > 0) {
        burstStartTimeoutRef.current = window.setTimeout(() => {
          burstStartTimeoutRef.current = null;
          startBurst();
        }, delayMs);
        return;
      }

      startBurst();
    },
    [startBurst],
  );

  useEffect(() => {
    return () => {
      if (burstStartTimeoutRef.current !== null) {
        window.clearTimeout(burstStartTimeoutRef.current);
      }
      if (burstTimeoutRef.current !== null) {
        window.clearTimeout(burstTimeoutRef.current);
      }
    };
  }, []);

  // 外部から burstKey が更新されたタイミングで発火（初回は発火しない）
  useEffect(() => {
    if (typeof burstKey !== "number") return;

    const prev = prevBurstKeyRef.current;
    prevBurstKeyRef.current = burstKey;

    if (prev === undefined) return;
    if (prev === burstKey) return;

    triggerBurst({ delayMs: getBurstDelayMs({ preferPressReturn: true }) });
  }, [burstKey, getBurstDelayMs, triggerBurst]);

  const handleClick = useCallback(() => {
    if (burstOnClick) {
      triggerBurst({ delayMs: getBurstDelayMs({ preferPressReturn: true }) });
    }
    onClick?.();
  }, [burstOnClick, getBurstDelayMs, triggerBurst, onClick]);

  const handlePointerDown = useCallback(() => {
    if (!pressBounce) return;
    setIsPressReleasing(false);
    setIsPressDown(true);
  }, [pressBounce]);

  const triggerRelease = useCallback(() => {
    if (!pressBounce) return;
    setIsPressDown(false);
    // 連打でも毎回アニメーションを走らせる
    setIsPressReleasing(false);
    requestAnimationFrame(() => setIsPressReleasing(true));
  }, [pressBounce]);

  const handlePointerUp = useCallback(() => {
    triggerRelease();
  }, [triggerRelease]);

  const handlePointerCancel = useCallback(() => {
    triggerRelease();
  }, [triggerRelease]);

  const handlePressReleaseAnimationEnd = useCallback((e: React.AnimationEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.animationName !== "press-release") return;
    setIsPressReleasing(false);
  }, []);

  const shouldRenderBurstLayer = burstOnClick || typeof burstKey === "number";
  const shouldBurst = shouldRenderBurstLayer && isBursting;

  const followingParticles: FollowingParticle[] = useMemo(() => {
    if (burstVariant !== "following") return [];
    if (burstId === 0) return [];

    const rand = mulberry32(burstId * 10007 + 42);
    const count = 14;

    const particles: FollowingParticle[] = [];
    for (let i = 0; i < count; i++) {
      const baseAngle = (360 / count) * i;
      const jitter = (rand() * 2 - 1) * 18; // -18..18deg
      const a = baseAngle + jitter;

      const r0 = 14 + rand() * 10; // 14..24
      // 飛距離は「もっと遠く」もできるように倍率適用
      const r1Base = 56 + rand() * 54; // 56..110
      const r1 = Math.max(44, Math.round(r1Base * burstDistanceScale));

      // 3..7 くらい（最大が大きすぎると集合体恐怖症っぽく見えるため抑える）
      const s = 3 + Math.floor(rand() * 5); // 3..7

      const o = clamp01(0.42 + rand() * 0.48); // 0.42..0.90
      const dur = 620 + Math.floor(rand() * 360); // 620..980ms
      const dly = Math.floor(rand() * 160); // 0..160ms

      particles.push({ a, r0, r1, s, o, dur, dly });
    }

    return particles;
  }, [burstVariant, burstId, burstDistanceScale]);

  const candyParticles: CandyParticle[] = useMemo(() => {
    if (burstVariant !== "candy") return [];
    if (burstId === 0) return [];

    const rand = mulberry32(burstId * 10007 + 4242);
    const count = 18;

    const particles: CandyParticle[] = [];
    for (let i = 0; i < count; i++) {
      const baseAngle = (360 / count) * i;
      const jitter = (rand() * 2 - 1) * 14; // -14..14deg
      const a = baseAngle + jitter;

      const r0 = 12 + rand() * 10;
      const r1Base = 70 + rand() * 70; // 70..140
      const r1 = Math.max(56, Math.round(r1Base * burstDistanceScale));

      const s = 4 + Math.floor(rand() * 4); // 4..7
      const o = clamp01(0.55 + rand() * 0.40); // 0.55..0.95
      const dur = 820 + Math.floor(rand() * 520); // 820..1340ms
      const dly = Math.floor(rand() * 180); // 0..180ms

      const kind: CandyParticleKind = rand() > 0.45 ? "pill" : "dot";
      const rot = Math.floor(rand() * 180) - 90;

      particles.push({ a, r0, r1, s, o, dur, dly, kind, rot });
    }

    return particles;
  }, [burstVariant, burstId, burstDistanceScale]);

  const followingDecorations = useMemo(() => {
    if (burstVariant !== "following") return [];
    if (followingParticles.length === 0) return [];

    const rand = mulberry32(burstId * 10007 + 99);

    const confettiPalette = [
      "#4CC9F0", // cyan
      "#4895EF", // blue
      "#FF7AB6", // dawn pink
      "#FFC2DD", // soft pink
      "#F9C74F", // yellow
      "#43AA8B", // green
    ];

    const oceanPalette = [
      "linear-gradient(135deg, rgba(0, 245, 255, 1) 0%, rgba(0, 136, 255, 1) 60%, rgba(0, 88, 255, 1) 100%)",
      "linear-gradient(135deg, rgba(96, 239, 255, 1) 0%, rgba(0, 153, 255, 1) 100%)",
      "linear-gradient(135deg, rgba(0, 255, 210, 1) 0%, rgba(0, 140, 255, 1) 100%)",
    ];

    const auroraPalette = [
      "linear-gradient(135deg, rgba(88, 255, 198, 1) 0%, rgba(78, 168, 255, 1) 45%, rgba(189, 96, 255, 1) 100%)",
      "linear-gradient(135deg, rgba(255, 132, 232, 1) 0%, rgba(88, 255, 198, 1) 55%, rgba(78, 168, 255, 1) 100%)",
      "linear-gradient(135deg, rgba(189, 96, 255, 1) 0%, rgba(88, 255, 198, 1) 100%)",
    ];

    return followingParticles.map((p, i) => {
      let bg: string;
      let glow: string;

      if (burstColorScheme === "ocean") {
        bg = oceanPalette[i % oceanPalette.length];
        glow = "rgba(0, 170, 255, 0.55)";
      } else if (burstColorScheme === "aurora") {
        bg = auroraPalette[i % auroraPalette.length];
        glow = "rgba(160, 120, 255, 0.45)";
      } else {
        // confetti
        const color = confettiPalette[Math.floor(rand() * confettiPalette.length)];
        bg = color;
        glow = "rgba(120, 200, 255, 0.40)";
      }

      // 粒ごとに少し透明度差（暗くならないよう下限は高め）
      const alphaBoost = 0.72 + rand() * 0.28; // 0.72..1.0

      return {
        key: i,
        vars: {
          ["--a" as never]: `${p.a}deg`,
          ["--r0" as never]: `${p.r0}px`,
          ["--r1" as never]: `${p.r1}px`,
          ["--s" as never]: `${p.s}px`,
          ["--o" as never]: `${p.o}`,
          ["--dur" as never]: `${p.dur}ms`,
          ["--dly" as never]: `${p.dly}ms`,
          ["--bg" as never]: bg,
          ["--glow" as never]: glow,
          ["--a2" as never]: `${alphaBoost}`,
        } as React.CSSProperties,
      };
    });
  }, [burstVariant, burstColorScheme, followingParticles, burstId]);

  const candyDecorations = useMemo(() => {
    if (burstVariant !== "candy") return [];
    if (candyParticles.length === 0) return [];

    const rand = mulberry32(burstId * 10007 + 99);
    const confettiPalette = [
      "#4CC9F0", // cyan
      "#4895EF", // blue
      "#FF7AB6", // dawn pink
      "#FFC2DD", // soft pink
      "#F9C74F", // yellow
      "#43AA8B", // green
    ];

    return candyParticles.map((p, i) => {
      const bg = confettiPalette[Math.floor(rand() * confettiPalette.length)];
      const glow = "rgba(255, 255, 255, 0.26)";
      const alphaBoost = 0.78 + rand() * 0.22; // 0.78..1.0

      return {
        key: i,
        kind: p.kind,
        vars: {
          ["--a" as never]: `${p.a}deg`,
          ["--r0" as never]: `${p.r0}px`,
          ["--r1" as never]: `${p.r1}px`,
          ["--s" as never]: `${p.s}px`,
          ["--o" as never]: `${p.o}`,
          ["--dur" as never]: `${p.dur}ms`,
          ["--dly" as never]: `${p.dly}ms`,
          ["--rot" as never]: `${p.rot}deg`,
          ["--bg" as never]: bg,
          ["--glow" as never]: glow,
          ["--a2" as never]: `${alphaBoost}`,
        } as React.CSSProperties,
      };
    });
  }, [burstVariant, candyParticles, burstId]);

  const content = (
    <>
      {hasIcon && (
        <div className="w-5 h-5 flex items-center justify-center relative z-10">
          {icon}
        </div>
      )}
      <span className="font-semibold text-[14px] text-[#020817] leading-[20px] relative z-10">
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`${className}${isPressDown ? ` ${styles.pressDown}` : ""}${isPressReleasing ? ` ${styles.pressRelease}` : ""}`}
        style={{
          ["--press-down-scale" as never]: `${pressVars.downScale}`,
          ["--press-up-scale" as never]: `${pressVars.upScale}`,
          ["--press-down-ms" as never]: `${pressVars.downMs}ms`,
          ["--press-up-ms" as never]: `${pressVars.upMs}ms`,
        }}
        onAnimationEnd={handlePressReleaseAnimationEnd}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`${className}${isPressDown ? ` ${styles.pressDown}` : ""}${isPressReleasing ? ` ${styles.pressRelease}` : ""}`}
      style={{
        ["--press-down-scale" as never]: `${pressVars.downScale}`,
        ["--press-up-scale" as never]: `${pressVars.upScale}`,
        ["--press-down-ms" as never]: `${pressVars.downMs}ms`,
        ["--press-up-ms" as never]: `${pressVars.upMs}ms`,
      }}
      onAnimationEnd={handlePressReleaseAnimationEnd}
    >
      {shouldBurst && burstVariant === "classic" && (
        <span
          className={styles.burst}
          aria-hidden="true"
        />
      )}

      {shouldBurst && burstVariant === "following" && (
        <span
          className={styles.followingBurst}
          aria-hidden="true"
          style={{
            ["--spread" as never]: `${Math.max(1, burstDistanceScale)}`,
          }}
        >
          {followingDecorations.map((d) => (
            <span
              key={d.key}
              className={styles.followingDot}
              style={d.vars}
            />
          ))}
        </span>
      )}

      {shouldBurst && burstVariant === "candy" && (
        <span
          className={styles.candyBurst}
          aria-hidden="true"
          style={{
            ["--spread" as never]: `${Math.max(1, burstDistanceScale)}`,
          }}
        >
          {candyDecorations.map((d) => (
            <span
              key={d.key}
              className={d.kind === "pill" ? styles.candyPill : styles.candyDot}
              style={d.vars}
            />
          ))}
        </span>
      )}
      {content}
    </button>
  );
};

export default IconButton;
