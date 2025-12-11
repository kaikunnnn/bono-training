/**
 * カテゴリ初期データ作成スクリプト
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'cqszh4up',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

const categories = [
  {
    _id: 'category-information-architecture',
    _type: 'category',
    title: '情報設計',
    slug: {
      _type: 'slug',
      current: 'information-architecture',
    },
    order: 0,
    color: '#3B82F6',
    description: '情報設計の基礎から実践まで',
  },
  {
    _id: 'category-ui',
    _type: 'category',
    title: 'UI',
    slug: {
      _type: 'slug',
      current: 'ui',
    },
    order: 1,
    color: '#8B5CF6',
    description: 'UIデザインの基本と応用',
  },
  {
    _id: 'category-ux',
    _type: 'category',
    title: 'UX',
    slug: {
      _type: 'slug',
      current: 'ux',
    },
    order: 2,
    color: '#EC4899',
    description: 'UX設計の理論と実践',
  },
];

async function createCategories() {
  console.log('📁 Creating categories...\n');

  for (const category of categories) {
    try {
      const result = await client.createOrReplace(category);
      console.log(`✅ Created: ${category.title} (${category.slug.current})`);
      console.log(`   Order: ${category.order}, Color: ${category.color}\n`);
    } catch (error) {
      console.error(`❌ Error creating ${category.title}:`, error);
    }
  }

  console.log('🎉 All categories created successfully!\n');
}

createCategories().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
