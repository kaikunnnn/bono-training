/**
 * フィードバックのダミーデータを作成するスクリプト
 * 実行: cd sanity-studio && npx ts-node scripts/seedFeedbacks.ts
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN, // 書き込み用トークン
  useCdn: false,
});

// カテゴリデータ
const categories = [
  { title: 'ポートフォリオ', slug: 'portfolio' },
  { title: 'ユーザー価値設計', slug: 'user-value-design' },
  { title: 'UIスタイル', slug: 'ui-style' },
  { title: 'キャリア', slug: 'career' },
];

// ダミーフィードバックデータ
const feedbacks = [
  {
    title: 'ポートフォリオサイトのUI改善フィードバック',
    slug: 'portfolio-ui-improvement',
    categorySlug: 'portfolio',
    targetOutput: 'ポートフォリオサイト v2',
    figmaUrl: 'https://www.figma.com/file/example1',
    vimeoUrl: 'https://vimeo.com/123456789',
    reviewPoints: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '今回のフィードバックでは以下の観点でレビューします：',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・全体的な情報設計とナビゲーション',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・ビジュアルデザインの一貫性',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・ユーザー体験の改善ポイント',
          },
        ],
      },
    ],
    requestContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '転職活動用のポートフォリオサイトを作成しました。UIデザイナーとしての転職を目指しており、自分のスキルセットと制作物を効果的にアピールしたいと考えています。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '特に気になっている点は、ファーストビューのインパクトと、作品詳細ページでの見せ方です。現在のデザインで改善すべき点があればご指摘いただきたいです。',
          },
        ],
      },
    ],
    feedbackContent: [
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '全体的な印象',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'シンプルで洗練されたデザインになっていて、UIデザイナーとしての基本的なスキルが伝わってきます。特に色使いとタイポグラフィの選択が良いですね。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '改善ポイント',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '1. ファーストビューの強化',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '現在のファーストビューはシンプルすぎる印象です。あなたの強みや特徴が一目でわかるようなキャッチコピーや、代表的な作品のサムネイルを配置すると効果的です。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '2. 作品詳細ページのストーリー性',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '完成形だけでなく、課題発見からソリューションに至るまでのプロセスを見せることで、デザイン思考力をアピールできます。Before/Afterの比較や、ユーザーテストの結果なども効果的です。',
          },
        ],
      },
    ],
  },
  {
    title: 'SaaSダッシュボードの情報設計レビュー',
    slug: 'saas-dashboard-ia-review',
    categorySlug: 'user-value-design',
    targetOutput: '分析ダッシュボード',
    figmaUrl: 'https://www.figma.com/file/example2',
    vimeoUrl: 'https://vimeo.com/987654321',
    reviewPoints: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・ユーザーの行動フローと情報階層',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・データの可視化方法',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・操作性とナビゲーション',
          },
        ],
      },
    ],
    requestContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'BtoB向けの分析ダッシュボードを設計しています。ユーザーは日々のKPIを確認し、異常値があればドリルダウンして原因を特定するという使い方を想定しています。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '情報の優先順位の付け方や、ユーザーが迷わないナビゲーション設計についてアドバイスをいただきたいです。',
          },
        ],
      },
    ],
    feedbackContent: [
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '情報設計の基本方針',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ダッシュボードの設計で最も重要なのは「最初に見せる情報」の選定です。ユーザーが毎日確認したい主要KPIを3〜5個に絞り、それをファーストビューに配置しましょう。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: '具体的な改善提案',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '現在の設計では情報が均等に配置されており、ユーザーがどこから見ればいいかわかりにくくなっています。視線の流れを意識したF字型レイアウトを取り入れ、重要度に応じてサイズにメリハリをつけましょう。',
          },
        ],
      },
    ],
  },
  {
    title: 'モバイルアプリのUIスタイルガイド作成',
    slug: 'mobile-app-style-guide',
    categorySlug: 'ui-style',
    targetOutput: 'フィットネスアプリ',
    figmaUrl: 'https://www.figma.com/file/example3',
    reviewPoints: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・カラーパレットの一貫性',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・タイポグラフィシステム',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '・コンポーネントの再利用性',
          },
        ],
      },
    ],
    requestContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'フィットネスアプリのUIを設計中です。スポーティーでありながらも親しみやすい印象にしたいと考えています。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'スタイルガイドを作成したのですが、色やフォントの選び方について改善点があればご指導ください。',
          },
        ],
      },
    ],
    feedbackContent: [
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'カラーパレットについて',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '選んだグリーン系のカラーは健康的なイメージにマッチしていて良いです。ただし、アクセントカラーが少し弱いので、CTAボタンなどに使う強調色を追加することをお勧めします。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'タイポグラフィの改善',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'フォントサイズの段階が多すぎます。見出し・本文・注釈の3段階を基本とし、それぞれで2サイズ程度に抑えると管理しやすくなります。',
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('🌱 フィードバックダミーデータの作成を開始します...\n');

  // 1. カテゴリを作成
  console.log('📁 カテゴリを作成中...');
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const existing = await client.fetch(
      `*[_type == "feedbackCategory" && slug.current == $slug][0]`,
      { slug: cat.slug }
    );

    if (existing) {
      console.log(`  ✓ ${cat.title} (既存)`);
      categoryMap[cat.slug] = existing._id;
    } else {
      const created = await client.create({
        _type: 'feedbackCategory',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
      });
      console.log(`  + ${cat.title} (新規作成)`);
      categoryMap[cat.slug] = created._id;
    }
  }

  // 2. フィードバックを作成
  console.log('\n📝 フィードバックを作成中...');

  for (const fb of feedbacks) {
    const existing = await client.fetch(
      `*[_type == "feedback" && slug.current == $slug][0]`,
      { slug: fb.slug }
    );

    if (existing) {
      console.log(`  ✓ ${fb.title.substring(0, 30)}... (既存)`);
    } else {
      // ブロックに_keyを追加
      const addKeys = (blocks: any[], prefix: string) =>
        blocks.map((block, i) => ({
          ...block,
          _key: `${prefix}${i}`,
          children: block.children?.map((child: any, j: number) => ({
            ...child,
            _key: `${prefix}c${i}${j}`,
          })),
        }));

      const reviewPointsWithKeys = fb.reviewPoints ? addKeys(fb.reviewPoints, 'rp') : undefined;
      const requestContentWithKeys = fb.requestContent ? addKeys(fb.requestContent, 'req') : undefined;
      const feedbackContentWithKeys = fb.feedbackContent ? addKeys(fb.feedbackContent, 'fb') : undefined;

      await client.create({
        _type: 'feedback',
        title: fb.title,
        slug: { _type: 'slug', current: fb.slug },
        category: { _type: 'reference', _ref: categoryMap[fb.categorySlug] },
        targetOutput: fb.targetOutput,
        figmaUrl: fb.figmaUrl,
        vimeoUrl: fb.vimeoUrl,
        reviewPoints: reviewPointsWithKeys,
        requestContent: requestContentWithKeys,
        feedbackContent: feedbackContentWithKeys,
        publishedAt: new Date().toISOString(),
      });
      console.log(`  + ${fb.title.substring(0, 30)}... (新規作成)`);
    }
  }

  console.log('\n✅ 完了しました！');
}

seed().catch(console.error);
