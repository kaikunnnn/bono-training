import type { ReactNode } from "react";
import { ProtoProvider } from "./_proto/ProtoProvider";

/**
 * /dev/design-together 配下の共通レイアウト（#253）。
 * ページをまたいで「作業中」を引き継ぐ Provider と、サイドナビの複製・作業中バー・体験ガイドを置く。
 * 本物の Sidebar / LayoutWrapper は root layout から出る（ここでは触らない）。
 */
export default function DesignTogetherLayout({ children }: { children: ReactNode }) {
  return <ProtoProvider>{children}</ProtoProvider>;
}
