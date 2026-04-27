import { PortableTextBlock } from "@portabletext/types";
import PortableTextRenderer from "../common/PortableTextRenderer";

interface OverviewTabProps {
  purposes?: string[];
  overview?: PortableTextBlock[] | null;
}

export default function OverviewTab({ purposes, overview }: OverviewTabProps) {
  const hasOverview = overview && Array.isArray(overview) && overview.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {purposes && purposes.length > 0 && (
        <section>
          <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mb-4">
            レッスンの目的
          </h2>
          <ul className="space-y-3">
            {purposes.map((purpose, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-base leading-relaxed text-gray-700"
              >
                <span
                  className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-600"
                  aria-hidden="true"
                />
                <span className="flex-1">{purpose}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasOverview && (
        <section>
          <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mb-4">
            概要
          </h2>
          <div className="prose prose-lg max-w-none">
            <PortableTextRenderer value={overview} />
          </div>
        </section>
      )}

      {(!purposes || purposes.length === 0) && !hasOverview && (
        <div className="text-center py-12 text-gray-500">
          <p>概要・目的の情報がまだ登録されていません。</p>
        </div>
      )}
    </div>
  );
}
