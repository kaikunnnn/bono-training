import { ArrowRight } from "lucide-react";
import { HomeClickLink } from "@/components/analytics/HomeClickLink";
import { classifyHomeHref } from "@/lib/activity-utils";

export function EmptyState({
  message,
  link,
  section,
}: {
  message: string;
  link?: string;
  /** クリック計測（#232 home_click）のブロックID */
  section: string;
}) {
  return (
    <div className="text-center py-12 text-black/40">
      <p className="font-medium">{message}</p>
      {link && (
        <HomeClickLink
          href={link}
          tracking={{ surface: "mypage", section, ...classifyHomeHref(link) }}
          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-500 hover:underline"
        >
          レッスンを見る <ArrowRight className="w-3 h-3" />
        </HomeClickLink>
      )}
    </div>
  );
}
