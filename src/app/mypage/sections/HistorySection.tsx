import { getViewHistory } from "@/lib/services/viewHistory";
import { traceServerStep } from "@/lib/performance/server-trace";
import { HistoryPreview, HistoryFull } from "./HistorySectionClient";

const PREVIEW_LIMIT = 4;

export async function HistorySection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  const viewHistory = await traceServerStep("mypage.history", () =>
    getViewHistory(
      userId,
      mode === "preview" ? PREVIEW_LIMIT : undefined
    )
  );

  if (mode === "preview") {
    return <HistoryPreview viewHistory={viewHistory} />;
  }
  return <HistoryFull viewHistory={viewHistory} />;
}
