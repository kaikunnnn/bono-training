import type { SearchTab } from "./SearchTabs";

export function SearchResultsSkeleton({ tab }: { tab: SearchTab }) {
  const sectionCount = tab === "all" ? 2 : 1;

  return (
    <div className="animate-pulse" aria-hidden="true">
      {Array.from({ length: sectionCount }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="size-5 rounded bg-gray-200" />
            <div className="h-5 w-24 rounded bg-gray-200" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                data-testid="search-result-skeleton-card"
                className="h-[126px] rounded-2xl bg-white shadow-[0px_1px_8px_0px_rgba(0,0,0,0.06)] sm:h-[167px]"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
