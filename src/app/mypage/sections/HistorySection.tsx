import { getViewHistory } from "@/lib/services/viewHistory";
import { HistoryPreview, HistoryFull } from "./HistorySectionClient";

export async function HistorySection({
  userId,
  mode,
}: {
  userId: string;
  mode: "preview" | "full";
}) {
  console.time("[mypage section] History total");
  const viewHistory = await getViewHistory(userId);
  console.timeEnd("[mypage section] History total");

  if (mode === "preview") {
    return <HistoryPreview viewHistory={viewHistory} />;
  }
  return <HistoryFull viewHistory={viewHistory} />;
}
