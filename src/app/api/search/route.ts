import { getSearchData } from "@/lib/search-data";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  try {
    const results = await getSearchData();
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[api/search] error:", error);
    return new Response(
      JSON.stringify({ error: "検索データの取得に失敗しました" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
