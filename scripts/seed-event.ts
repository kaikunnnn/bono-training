/**
 * Sanityにテスト用イベントデータを作成するスクリプト
 *
 * 使用方法:
 * npx tsx scripts/seed-event.ts
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || "cqszh4up",
  dataset: process.env.VITE_SANITY_DATASET || "development",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // 書き込みにはトークンが必要
});

const testEvent = {
  _type: "event",
  title: "【2月開催】UIデザイン勉強会 meetup-2026-02",
  slug: {
    _type: "slug",
    current: "meetup-2026-02",
  },
  summary:
    "UIデザインの基礎から実践まで学べる勉強会です。初心者の方も大歓迎！一緒にデザインスキルを高めましょう。",
  registrationUrl: "https://forms.google.com/example",
  content: [
    {
      _type: "block",
      _key: "intro1",
      style: "h2",
      children: [{ _type: "span", _key: "span1", text: "イベント概要" }],
    },
    {
      _type: "block",
      _key: "intro2",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "span2",
          text: "このイベントでは、UIデザインの基本原則から実際のプロジェクトでの応用まで、幅広いトピックをカバーします。",
        },
      ],
    },
    {
      _type: "block",
      _key: "intro3",
      style: "h2",
      children: [{ _type: "span", _key: "span3", text: "開催日時" }],
    },
    {
      _type: "block",
      _key: "intro4",
      style: "normal",
      children: [
        {
          _type: "span",
          _key: "span4",
          text: "2026年2月15日（土）14:00〜17:00",
        },
      ],
    },
    {
      _type: "block",
      _key: "intro5",
      style: "h2",
      children: [{ _type: "span", _key: "span5", text: "参加費" }],
    },
    {
      _type: "block",
      _key: "intro6",
      style: "normal",
      children: [{ _type: "span", _key: "span6", text: "無料" }],
    },
    {
      _type: "block",
      _key: "intro7",
      style: "h2",
      children: [{ _type: "span", _key: "span7", text: "こんな方におすすめ" }],
    },
    {
      _type: "block",
      _key: "list1",
      style: "normal",
      listItem: "bullet",
      children: [
        {
          _type: "span",
          _key: "listspan1",
          text: "UIデザインを始めたばかりの方",
        },
      ],
    },
    {
      _type: "block",
      _key: "list2",
      style: "normal",
      listItem: "bullet",
      children: [
        {
          _type: "span",
          _key: "listspan2",
          text: "デザインスキルを向上させたいエンジニアの方",
        },
      ],
    },
    {
      _type: "block",
      _key: "list3",
      style: "normal",
      listItem: "bullet",
      children: [
        {
          _type: "span",
          _key: "listspan3",
          text: "同じ志を持つ仲間と交流したい方",
        },
      ],
    },
  ],
  publishedAt: new Date().toISOString(),
};

async function seedEvent() {
  console.log("Creating test event in Sanity...");
  console.log("Project ID:", client.config().projectId);
  console.log("Dataset:", client.config().dataset);

  if (!process.env.SANITY_API_TOKEN) {
    console.error("\n❌ SANITY_API_TOKEN が設定されていません。");
    console.log("\n📝 Sanity Studioで手動で作成する方法:");
    console.log("1. cd sanity-studio && npm run dev");
    console.log("2. ブラウザでSanity Studioを開く");
    console.log("3. 「イベント」を選択して新規作成");
    console.log("4. スラッグを「meetup-2026-02」に設定");
    console.log("\nまたは、以下のようにトークンを設定してスクリプトを実行:");
    console.log("SANITY_API_TOKEN=xxx npx tsx scripts/seed-event.ts");
    return;
  }

  try {
    const result = await client.create(testEvent);
    console.log("✅ Event created:", result._id);
    console.log("URL: /events/meetup-2026-02");
  } catch (error) {
    console.error("❌ Error creating event:", error);
  }
}

seedEvent();
