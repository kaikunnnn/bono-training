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
import { PROTO_BASE, PROTO_MYPAGE, PROTO_TOP } from "./data";
import {
  STORAGE_KEY,
  findMyPost,
  initialProtoState,
  parseStoredState,
  protoReducer,
  type ProtoAction,
  type ProtoState,
} from "./state";
import { ProtoBell } from "./ProtoBell";
import { ProtoGuide } from "./ProtoGuide";
import { BodyPortal } from "./BodyPortal";

/** 始めてから「がんばろ」が届くまで */
const INCOMING_CHEER_DELAY_MS = 5000;
/** 自分の投稿が流れてから、応援が集まって通知が届くまで（時間経過の再現） */
const REACTIONS_DELAY_MS = 20000;

interface HighlightRequest {
  postId: string;
  nonce: number;
}

interface ProtoContextValue {
  state: ProtoState;
  dispatch: Dispatch<ProtoAction>;
  /** sessionStorage の読み込みが終わったか（終わるまでは初期状態で描画する） */
  hydrated: boolean;
  /** 通知から戻ったときの強調依頼（同じページ内で開いたときのため） */
  highlightRequest: HighlightRequest | null;
  requestHighlight: (postId: string) => void;
}

const ProtoContext = createContext<ProtoContextValue | null>(null);

export function useProto(): ProtoContextValue {
  const ctx = useContext(ProtoContext);
  if (!ctx) throw new Error("useProto は /dev/progress-feed 配下でだけ使えます");
  return ctx;
}

function readStorage(): ProtoState | null {
  try {
    return parseStoredState(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStorage(state: ProtoState) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 使えない環境（プライベートモード等）では保存せずに続ける
  }
}

/**
 * /dev/progress-feed 配下で共有する状態。
 * ページをまたいでも状態が続くように layout に置き、sessionStorage に写す。
 */
export function ProtoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(protoReducer, initialProtoState);
  const [hydrated, setHydrated] = useState(false);
  const [highlightRequest, setHighlightRequest] = useState<HighlightRequest | null>(null);
  const pathname = usePathname() ?? "";

  // 1回だけ: 保存された状態を読み込む（描画中には読まない＝hydrationのずれを防ぐ）
  useEffect(() => {
    const stored = readStorage();
    if (stored) dispatch({ type: "hydrate", state: stored });
    // 外部（sessionStorage）との同期が終わった印。マウント時に1回だけ
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // 読み込みが終わってから書き込む（先に書くと保存済みの状態を初期値で上書きしてしまう）
  useEffect(() => {
    if (hydrated) writeStorage(state);
  }, [state, hydrated]);

  // 始めて少しすると誰かから「がんばろ」が届く（ページを移っても続く）
  useEffect(() => {
    if (!hydrated || !state.learning || state.receivedCheerFrom) return;
    const t = setTimeout(() => dispatch({ type: "receiveCheer" }), INCOMING_CHEER_DELAY_MS);
    return () => clearTimeout(t);
  }, [hydrated, state.learning, state.receivedCheerFrom]);

  // 自分の投稿が流れてしばらくすると、応援が集まって通知が届く
  const hasMyPost = Boolean(findMyPost(state));
  useEffect(() => {
    if (!hydrated || !hasMyPost || state.reactionsDelivered) return;
    const t = setTimeout(() => dispatch({ type: "deliverReactions" }), REACTIONS_DELAY_MS);
    return () => clearTimeout(t);
  }, [hydrated, hasMyPost, state.reactionsDelivered]);

  const requestHighlight = useCallback((postId: string) => {
    setHighlightRequest({ postId, nonce: Date.now() });
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, hydrated, highlightRequest, requestHighlight }),
    [state, hydrated, highlightRequest, requestHighlight],
  );

  const isDemo = pathname.startsWith(`${PROTO_BASE}/demo`);
  // プロト用のベルはサイドバーがあるページ（マイページ案・トップ案）だけ
  const showBell = pathname.startsWith(PROTO_MYPAGE) || pathname.startsWith(PROTO_TOP);

  return (
    <ProtoContext.Provider value={value}>
      {children}
      {showBell && <ProtoBell />}
      {!isDemo && (
        <BodyPortal>
          <ProtoGuide />
        </BodyPortal>
      )}
    </ProtoContext.Provider>
  );
}
