import { Suspense } from "react";
import SearchPageClient from "@/components/search/SearchPageClient";
import { SearchPageFallback } from "@/components/search/SearchPageFallback";
import { getSearchData } from "@/lib/search-data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function getInitialSearchData() {
  try {
    return await getSearchData();
  } catch (error) {
    console.error("[search page] initial data fetch failed:", error);
    return undefined;
  }
}

async function SearchData({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const tab = firstParam(params.tab);
  const isAiTab = tab === "ai" || firstParam(params.mode) === "ai";
  const initialData = isAiTab ? undefined : await getInitialSearchData();
  return <SearchPageClient initialData={initialData} />;
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchData searchParams={searchParams} />
    </Suspense>
  );
}
