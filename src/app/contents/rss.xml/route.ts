// /contents/rss.xml — 旧 Webflow の記事 RSS の URL（#276）
//
// 新サイトでは記事の RSS を出していない。これが無いと /contents/[slug] が slug="rss.xml" として
// 描画し、ストリーミング開始後の notFound() になるため「200 ＋ noindex」のソフト404になっていた
// （Search Console の「クロール済み - インデックス未登録」に出ていた）。
// Route Handler はストリーミングしないので、ここで本当の 404 を返す。
// https://nextjs.org/docs/app/api-reference/functions/not-found
// https://developers.google.com/search/docs/crawling-indexing/http-network-errors
export function GET() {
  return new Response("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
