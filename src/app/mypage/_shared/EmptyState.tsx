import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function EmptyState({
  message,
  link,
}: {
  message: string;
  link?: string;
}) {
  return (
    <div className="text-center py-12 text-black/40">
      <p className="font-medium">{message}</p>
      {link && (
        <Link
          href={link}
          className="inline-flex items-center gap-1 mt-3 text-sm text-blue-500 hover:underline"
        >
          レッスンを見る <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
