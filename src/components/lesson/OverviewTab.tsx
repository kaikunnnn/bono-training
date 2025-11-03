import PortableTextRenderer from "../common/PortableTextRenderer";

interface OverviewTabProps {
  purposes?: string[];
  overview?: any;
}

/**
 * OverviewTab コンポーネント
 * レッスン詳細ページの「概要・目的」タブ
 *
 * 構成:
 * 1. レッスンの目的（箇条書き）
 * 2. 概要（リッチテキスト）
 */
export default function OverviewTab({ purposes, overview }: OverviewTabProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* レッスンの目的セクション */}
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
                {/* シンプルな丸マーカー */}
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

      {/* 概要セクション */}
      {overview && (
        <section>
          <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mb-4">
            概要
          </h2>
          <div className="prose prose-lg max-w-none">
            <PortableTextRenderer value={overview} />
          </div>
        </section>
      )}

      {/* データが何もない場合 */}
      {(!purposes || purposes.length === 0) && !overview && (
        <div className="text-center py-12 text-gray-500">
          <p>概要・目的の情報がまだ登録されていません。</p>
        </div>
      )}
    </div>
  );
}
