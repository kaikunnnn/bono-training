/**
 * Delete Webflow imported data from Sanity
 *
 * This script deletes all Lesson, Quest, and Article documents
 * that were imported from Webflow (identified by _id starting with 'webflow-')
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'cqszh4up',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

async function deleteWebflowData() {
  console.log('\n🗑️  Deleting Webflow imported data from Sanity...\n');

  try {
    // Delete Lessons
    console.log('📝 Deleting Lessons...');
    const lessons = await client.fetch('*[_type == "lesson" && _id match "webflow-*"]._id');
    for (const id of lessons) {
      await client.delete(id);
      console.log(`  ✅ Deleted lesson: ${id}`);
    }

    // Delete Quests
    console.log('\n📚 Deleting Quests...');
    const quests = await client.fetch('*[_type == "quest" && _id match "webflow-*"]._id');
    for (const id of quests) {
      await client.delete(id);
      console.log(`  ✅ Deleted quest: ${id}`);
    }

    // Delete Articles
    console.log('\n📄 Deleting Articles...');
    const articles = await client.fetch('*[_type == "article" && _id match "webflow-*"]._id');
    for (const id of articles) {
      await client.delete(id);
      console.log(`  ✅ Deleted article: ${id}`);
    }

    console.log('\n✅ All Webflow data deleted successfully!\n');
    console.log(`Summary:`);
    console.log(`  - Lessons deleted: ${lessons.length}`);
    console.log(`  - Quests deleted: ${quests.length}`);
    console.log(`  - Articles deleted: ${articles.length}`);
  } catch (error) {
    console.error('\n❌ Error deleting data:', error);
    process.exit(1);
  }
}

deleteWebflowData();
