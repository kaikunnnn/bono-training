/**
 * テストデータの userOutput を削除する。
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "..", ".env.local") });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const IDS = [
  "nVq92pLtGvqp6jQ0pdDgpp", // テスト
  "osKfv7xko3C4F5yryC5Jg4", // あきら
];

async function main() {
  for (const id of IDS) {
    await client.delete(id);
    console.log(`✅ 削除完了: ${id}`);
  }

  const remaining = await client.fetch(
    `*[_type == "userOutput" && _id in $ids]{ _id }`,
    { ids: IDS }
  );
  console.log(`\n削除後の残存件数: ${(remaining as unknown[])?.length ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
