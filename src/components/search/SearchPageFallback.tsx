import { SearchResultsSkeleton } from "./SearchResultsSkeleton";

export function SearchPageFallback() {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-8 sm:pt-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">探す</h1>
          <div className="mb-6 h-[50px] rounded-2xl border border-gray-200 bg-white sm:h-[58px]" />
          <div className="h-10 border-b border-gray-200" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <SearchResultsSkeleton tab="all" />
      </div>
    </div>
  );
}
