import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve("/Users/kaitakumi/.superset/worktrees/BONO/fortunate-syrup", ".env.local") });
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01", token: process.env.SANITY_WRITE_TOKEN, useCdn: false,
});
async function main() {
  const g: any = await client.fetch(
    `*[_type=="guide" && slug.current==$slug][0]{
      _id, title, category, description, author, publishedAt, isPremium,
      "thumbUrl": thumbnail.asset->url,
      "contentLen": count(content),
      "imgRefs": content[_type=="image"].asset._ref,
      "imgUrls": content[_type=="image"].asset->url,
      "allText": content[_type=="block"].children[].text
    }`, { slug: "uiuxdesigner-skillmap" });
  const imgRefs: string[] = g.imgRefs || [];
  const allText: string[] = (g.allText || []).filter(Boolean);
  const badRefs = imgRefs.filter(r => !r.startsWith("image-"));
  const starLeft = allText.filter(t => t.includes("**")).length;
  const brLeft = allText.filter(t => /<br|&lt;br/i.test(t)).length;
  console.log("=== 検証結果 ===");
  console.log("_id:", g._id);
  console.log("title:", g.title);
  console.log("category:", g.category, "| author:", g.author, "| isPremium:", g.isPremium);
  console.log("publishedAt:", g.publishedAt);
  console.log("description:", g.description?.slice(0,60), "...");
  console.log("thumbUrl:", g.thumbUrl);
  console.log("content 非空:", g.contentLen > 0, `(${g.contentLen} blocks)`);
  console.log("image refs:", imgRefs.length, "件, 全て image- 始まり:", badRefs.length === 0, badRefs.length? "NG:"+badRefs.join(","):"");
  console.log("image URLs:");
  (g.imgUrls||[]).forEach((u:string)=>console.log("  ", u));
  console.log("** 残留:", starLeft, starLeft===0?"OK":"NG");
  console.log("br 残留:", brLeft, brLeft===0?"OK":"NG");
  // curl image CDN
  for (const u of (g.imgUrls||[]).concat(g.thumbUrl?[g.thumbUrl]:[])) {
    const r = await fetch(u, { method: "HEAD" });
    console.log(`  HTTP ${r.status} ${u.slice(-50)}`);
  }
}
main().catch(e=>{console.error(e);process.exit(1);});
