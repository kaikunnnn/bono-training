import { getViewHistory } from "@/lib/services/viewHistory";
import { HistoryPreview, HistoryFull } from "./HistorySectionClient";

export async function HistorySection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  const viewHistory = await getViewHistory(userId);

  if (mode === "preview") {
    return <HistoryPreview viewHistory={viewHistory} />;
  }
  return <HistoryFull viewHistory={viewHistory} />;
}
