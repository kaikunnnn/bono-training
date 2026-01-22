import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseResizableSidebarWidthOptions {
  storageKey: string;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  /**
   * ドラッグ中に rawWidth が minWidth - collapseThresholdPx を下回ったら collapse を要求する
   * （minWidth でクランプされていても「端まで閉じた」意図を検知するため rawWidth を使う）
   */
  collapseThresholdPx?: number;
  onCollapseRequested?: () => void;
}

interface UseResizableSidebarWidthResult {
  width: number;
  setWidth: (nextWidth: number) => void;
  handleProps: {
    onPointerDown: React.PointerEventHandler<HTMLDivElement>;
    onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
    role: "separator";
    "aria-orientation": "vertical";
    "aria-valuemin": number;
    "aria-valuemax": number;
    "aria-valuenow": number;
    tabIndex: number;
  };
}

export function useResizableSidebarWidth(options: UseResizableSidebarWidthOptions): UseResizableSidebarWidthResult {
  const { storageKey, defaultWidth, minWidth, maxWidth, collapseThresholdPx = 24, onCollapseRequested } = options;

  const clamp = useCallback(
    (value: number) => Math.min(maxWidth, Math.max(minWidth, value)),
    [maxWidth, minWidth]
  );

  const initialWidth = useMemo(() => {
    if (typeof window === "undefined") return defaultWidth;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultWidth;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return defaultWidth;
    return clamp(parsed);
  }, [clamp, defaultWidth, storageKey]);

  const [width, setWidth] = useState<number>(initialWidth);

  const setWidthClamped = useCallback(
    (nextWidth: number) => {
      setWidth(clamp(nextWidth));
    },
    [clamp]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, String(width));
  }, [storageKey, width]);

  const dragRef = useRef<{
    startX: number;
    startWidth: number;
    pointerId: number;
  } | null>(null);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      // 左サイドバーの右端をドラッグして幅を変える想定
      if (e.pointerType === "mouse" && e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      dragRef.current = {
        startX: e.clientX,
        startWidth: width,
        pointerId: e.pointerId,
      };

      const previousCursor = document.body.style.cursor;
      const previousUserSelect = document.body.style.userSelect;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const onPointerMove = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (ev.pointerId !== drag.pointerId) return;
        const rawNext = drag.startWidth + (ev.clientX - drag.startX);

        // 「端まで閉じた」検知（minWidth を下回る方向へさらにドラッグされたら collapse）
        if (onCollapseRequested && rawNext <= minWidth - collapseThresholdPx) {
          onCollapseRequested();
          cleanup();
          return;
        }

        const next = clamp(rawNext);
        setWidth(next);
      };

      const cleanup = () => {
        dragRef.current = null;
        document.body.style.cursor = previousCursor;
        document.body.style.userSelect = previousUserSelect;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      };

      const onPointerUp = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return cleanup();
        if (ev.pointerId !== drag.pointerId) return;
        cleanup();
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    },
    [clamp, width]
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      const step = e.shiftKey ? 24 : 12;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setWidth((w) => clamp(w - step));
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setWidth((w) => clamp(w + step));
      }
      if (e.key === "Home") {
        e.preventDefault();
        setWidth(clamp(minWidth));
      }
      if (e.key === "End") {
        e.preventDefault();
        setWidth(clamp(maxWidth));
      }
    },
    [clamp, maxWidth, minWidth]
  );

  return {
    width,
    setWidth: setWidthClamped,
    handleProps: {
      onPointerDown: handlePointerDown,
      onKeyDown: handleKeyDown,
      role: "separator",
      "aria-orientation": "vertical",
      "aria-valuemin": minWidth,
      "aria-valuemax": maxWidth,
      "aria-valuenow": width,
      tabIndex: 0,
    },
  };
}

