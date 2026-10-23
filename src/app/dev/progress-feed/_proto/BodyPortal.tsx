"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * マウント後に document.body 直下へ描画する（サーバー描画と最初の描画はその場に出す）。
 *
 * 本物の Layout はメイン領域を `relative z-[1]` で包んでいるため、その中の fixed 要素は
 * サイドバー（z-10）より上に出られない。記事ページの複製（サイドバーなしの見え方）と体験ガイドは
 * body 直下に移して、サイドバーより上に重ねる。
 */
export function BodyPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // マウントした印（ここから body 直下に移す）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted ? createPortal(children, document.body) : <>{children}</>;
}
