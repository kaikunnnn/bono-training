"use client";

import { useEffect, useState } from "react";

export const BOARD_SEEN_EVENT = "bono:board-seen";
const BOARD_SEEN_DATASET_KEY = "bonoBoardSeen";

export function markBoardSeenInCurrentDocument() {
  document.documentElement.dataset[BOARD_SEEN_DATASET_KEY] = "1";
  window.dispatchEvent(new Event(BOARD_SEEN_EVENT));
}

/** サーバーで未読と判定されたドットを、同じ文書内の既読完了だけ局所的に隠す。 */
export function BoardNewDot() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    if (document.documentElement.dataset[BOARD_SEEN_DATASET_KEY] === "1") {
      hide();
    }
    window.addEventListener(BOARD_SEEN_EVENT, hide);
    return () => window.removeEventListener(BOARD_SEEN_EVENT, hide);
  }, []);

  if (!visible) return null;

  return (
    <span
      className="block h-2 w-2 rounded-full bg-[var(--notification-badge)]"
      role="status"
      aria-label="新着あり"
    />
  );
}
