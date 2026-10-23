"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { BodyPortal } from "../../progress-feed/_proto/BodyPortal";
import { AUTO_END_MS, DT_CONTENTS, SIM_MAX_MS, SIM_MIN_MS } from "./data";
import {
  STORAGE_KEY,
  initialDtState,
  parseStoredState,
  protoReducer,
  type DtAction,
  type DtState,
} from "./state";
import { ProtoSidebar } from "./ProtoSidebar";
import { WorkingBar } from "./WorkingBar";
import { StartWorkDialog } from "./StartWorkDialog";
import { EndWorkDialog } from "./EndWorkDialog";
import { ProtoGuide } from "./ProtoGuide";

/** 経過時間の表示を更新する間隔（分の表示なので、分の変わり目から15秒以内に追いつく） */
const CLOCK_TICK_MS = 15_000;

interface DtContextValue {
  state: DtState;
  dispatch: Dispatch<DtAction>;
  /** sessionStorage の読み込みが終わったか（終わるまでは作業中の人を出さない） */
  hydrated: boolean;
  /** プロト時刻（読み込み前は null。描画中に Date.now() を読まないため） */
  now: number | null;
  /** 自分の作業の経過分（作業中でなければ null） */
  elapsedMinutes: number | null;
  openStart: () => void;
  openEnd: () => void;
  startWork: (declaration: string) => void;
  endWork: () => void;
}

const DtContext = createContext<DtContextValue | null>(null);

export function useDesignTogether(): DtContextValue {
  const ctx = useContext(DtContext);
  if (!ctx) throw new Error("useDesignTogether は /dev/design-together 配下でだけ使えます");
  return ctx;
}

function readStorage(): DtState | null {
  try {
    return parseStoredState(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStorage(state: DtState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 使えない環境（プライベートモード等）では保存せずに続ける
  }
}

/**
 * /dev/design-together 配下で共有する状態（#253）。
 * ページをまたいでも続くように layout に置き、sessionStorage に写す（#251 と同じ作り）。
 * 他の人の動き・時間の経過はブラウザ内のタイマーで再現する。
 */
export function ProtoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(protoReducer, initialDtState);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const pathname = usePathname() ?? "";

  // 1回だけ: 保存された状態を読む。無ければダミーの作業中を「今」の時刻で置く
  useEffect(() => {
    const stored = readStorage();
    if (stored) dispatch({ type: "hydrate", state: stored });
    if (!stored?.seeded) dispatch({ type: "seed", now: Date.now() + (stored?.timeOffsetMs ?? 0) });
    // 外部（sessionStorage）との同期が終わった印。マウント時に1回だけ
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // 読み込みが終わってから書き込む（先に書くと保存済みの状態を初期値で上書きしてしまう）
  useEffect(() => {
    if (hydrated) writeStorage(state);
  }, [state, hydrated]);

  // プロト時刻の時計。時間を進めたときもすぐ追いつく
  useEffect(() => {
    if (!hydrated) return;
    const tick = () => setNow(Date.now() + state.timeOffsetMs);
    tick();
    const t = setInterval(tick, CLOCK_TICK_MS);
    return () => clearInterval(t);
  }, [hydrated, state.timeOffsetMs]);

  // 押し忘れ: 開始から3時間たったら自動で終わりにする
  const mySession = state.mySession;
  useEffect(() => {
    if (now === null || !mySession) return;
    if (now - mySession.startedAt >= AUTO_END_MS) {
      dispatch({ type: "autoEnd" });
      // 自動終了と同時に開いていた終了ダイアログは閉じる
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEndOpen(false);
    }
  }, [now, mySession]);

  // 他の人の動き: 20〜40秒ごとに誰かが始めたり終えたりする（0人モードでは止める）
  useEffect(() => {
    if (!hydrated || state.dummyMode !== "two") return;
    const delay = SIM_MIN_MS + Math.random() * (SIM_MAX_MS - SIM_MIN_MS);
    const offset = state.timeOffsetMs;
    const t = setTimeout(() => {
      dispatch({ type: "simulate", now: Date.now() + offset, roll: Math.random(), pick: Math.random() });
    }, delay);
    return () => clearTimeout(t);
  }, [hydrated, state.dummyMode, state.others, state.timeOffsetMs]);

  const openStart = useCallback(() => {
    dispatch({ type: "openStartDialog" });
    setStartOpen(true);
  }, []);
  const openEnd = useCallback(() => setEndOpen(true), []);

  const offset = state.timeOffsetMs;
  const startWork = useCallback(
    (declaration: string) => {
      const t = Date.now();
      dispatch({ type: "start", now: t + offset, declaration, id: `s-${t}` });
      setNow(t + offset);
      setStartOpen(false);
    },
    [offset],
  );
  const endWork = useCallback(() => {
    dispatch({ type: "end", now: Date.now() + offset });
    setEndOpen(false);
  }, [offset]);

  const elapsedMinutes =
    now !== null && mySession ? Math.max(0, Math.floor((now - mySession.startedAt) / 60_000)) : null;

  const value = useMemo(
    () => ({ state, dispatch, hydrated, now, elapsedMinutes, openStart, openEnd, startWork, endWork }),
    [state, hydrated, now, elapsedMinutes, openStart, openEnd, startWork, endWork],
  );

  // 動画ページは本番と同じく全画面の独自レイアウト（サイドナビなし）。作業中バーはページの中に置く
  const isArticle = pathname.startsWith(DT_CONTENTS);

  return (
    <DtContext.Provider value={value}>
      {children}
      {!isArticle && (
        <BodyPortal>
          <ProtoSidebar />
          <WorkingBar variant="floating" />
        </BodyPortal>
      )}
      <StartWorkDialog open={startOpen} onOpenChange={setStartOpen} />
      <EndWorkDialog open={endOpen} onOpenChange={setEndOpen} />
      <BodyPortal>
        <ProtoGuide />
      </BodyPortal>
    </DtContext.Provider>
  );
}
