import PortableTextRenderer from "../common/PortableTextRenderer";

interface OverviewTabProps {
  overview: any;
}

export default function OverviewTab({ overview }: OverviewTabProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* 概要と目的 */}
      <div className="mb-8">
        <h2 className="font-noto-sans-jp font-bold text-xl text-lesson-overview-heading mb-6">
          概要と目的
        </h2>

        {/* Portable Text コンテンツ */}
        {overview && <PortableTextRenderer value={overview} />}
      </div>
    </div>
  );
}
