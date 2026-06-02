/**
 * Webflow Item の description-3 / scene-3 を取得して中身を確認。
 * 特に <img> がどう含まれているか、タグの種類を一覧化する。
 */

const TARGET_SLUG = "youhadouyatedezainani-wake";
const WEBFLOW_COLLECTION_ID = "6029d027f6cb8852cbce8c75";
const WEBFLOW_TOKEN =
  process.env.WEBFLOW_TOKEN ||
  "674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76";

async function main() {
  let offset = 0;
  const limit = 100;
  let body: string | null = null;

  while (true) {
    const res = await fetch(
      `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${WEBFLOW_TOKEN}` } }
    );
    const data: {
      items: Array<{
        fieldData: { slug?: string } & Record<string, unknown>;
      }>;
      pagination?: { total?: number };
    } = await res.json();
    for (const item of data.items) {
      if (item.fieldData?.slug === TARGET_SLUG) {
        body = (item.fieldData["description-3"] as string) || null;
        break;
      }
    }
    if (body) break;
    offset += limit;
    if (offset >= (data.pagination?.total ?? 0)) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!body) {
    console.log("not found");
    return;
  }

  console.log(`description-3 length: ${body.length}\n`);

  // タグの種類を集計
  const tagCounts: Record<string, number> = {};
  const tagRegex = /<(\w+)[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRegex.exec(body)) !== null) {
    const tag = m[1].toLowerCase();
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  }
  console.log("タグ別出現回数:");
  for (const [tag, count] of Object.entries(tagCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  <${tag}>: ${count}`);
  }

  // <img> 抽出
  const imgs = body.match(/<img[^>]*>/g) ?? [];
  console.log(`\n<img> タグ数: ${imgs.length}`);
  imgs.slice(0, 10).forEach((tag, i) => {
    console.log(`\n[${i + 1}] ${tag}`);
  });

  // 先頭 1500 文字
  console.log("\n=== 本文 head ===");
  console.log(body.slice(0, 1500));

  // 末尾 500 文字
  console.log("\n=== 本文 tail ===");
  console.log(body.slice(-500));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
