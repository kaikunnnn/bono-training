const { createClient } = require("@sanity/client");
require("dotenv").config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || "production",
  useCdn: false,
  apiVersion: "2024-01-01"
});

// ページで使用されているのと同じクエリ
const CONTENTS_PROJECTION = `contents[]{
  _type == "reference" => @->{
    _id,
    _type,
    title,
    slug
  },
  _type == "contentItem" && itemType == "lesson" => lesson->{
    _id,
    _type,
    title,
    slug
  },
  _type == "contentItem" && itemType == "roadmap" => roadmap->{
    _id,
    _type,
    title,
    slug
  },
  _type == "contentItem" && itemType == "externalLink" => {
    "_type": "externalLink",
    "title": externalTitle
  },
  _type == "externalLink" => {
    _type,
    title
  }
}`;

async function check() {
  const roadmaps = await client.fetch(`
    *[_type == "roadmap"] | order(order asc) {
      title,
      "slug": slug.current,
      isPublished,
      steps[] {
        "title": coalesce(title, stepTitle),
        sections[] {
          "title": coalesce(title, sectionTitle),
          ${CONTENTS_PROJECTION}
        }
      }
    }
  `);

  for (const rm of roadmaps) {
    console.log("========================================");
    console.log("【" + rm.title + "】");
    console.log("slug:", rm.slug, "| 公開:", rm.isPublished ? "✓" : "✗");
    console.log("");

    if (!rm.steps || rm.steps.length === 0) {
      console.log("  (ステップ未設定)");
      continue;
    }

    let lessonCount = 0;
    rm.steps.forEach((step, i) => {
      console.log("  STEP " + (i+1) + ":", step.title || "(タイトル未設定)");

      if (!step.sections) return;
      step.sections.forEach(sec => {
        if (sec.title) {
          console.log("    セクション:", sec.title);
        }
        if (!sec.contents) return;
        sec.contents.forEach(c => {
          if (c && c._type === "lesson") {
            console.log("      [lesson]", c.title);
            lessonCount++;
          } else if (c && c._type === "roadmap") {
            console.log("      [roadmap]", c.title);
          } else if (c && c._type === "externalLink") {
            console.log("      [external]", c.title);
          } else if (c && c.title) {
            console.log("      [" + c._type + "]", c.title);
            if (c._type === "lesson") lessonCount++;
          } else {
            console.log("      (空/null)");
          }
        });
      });
    });
    console.log("  ---");
    console.log("  レッスン合計:", lessonCount, "件");
    console.log("");
  }
}

check().catch(e => console.error("エラー:", e.message));
