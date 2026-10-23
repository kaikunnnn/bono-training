import type { ReactNode } from "react";
import { ProtoProvider } from "./_proto/ProtoProvider";

/**
 * /dev/progress-feed 配下の共通レイアウト（#251）。
 * 始めた → 記事 → 完了 → マイページ → 通知 と、ページをまたいで状態を引き継ぐための Provider を置く。
 * 本物の Sidebar / LayoutWrapper は root layout から出る（ここでは触らない）。
 */
export default function ProgressFeedLayout({ children }: { children: ReactNode }) {
  return <ProtoProvider>{children}</ProtoProvider>;
}
