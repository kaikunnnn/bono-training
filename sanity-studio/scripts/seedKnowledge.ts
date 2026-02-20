/**
 * ナレッジのダミーデータを作成するスクリプト
 * 実行: cd sanity-studio && npx ts-node scripts/seedKnowledge.ts
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
});

// ランダムキー生成
function generateKey() {
  return Math.random().toString(36).substring(2, 14);
}

// ブロックコンテンツを生成するヘルパー
function createBlock(text: string, style: string = 'normal') {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks: [],
      },
    ],
  };
}

// カテゴリデータ
const categories = [
  { title: '学習のコツ', slug: 'learning-tips', emoji: '📚', order: 1, description: 'デザイン学習を効率的に進めるためのヒント' },
  { title: 'キャリア', slug: 'career', emoji: '💼', order: 2, description: 'デザイナーとしてのキャリア形成に関する情報' },
  { title: 'ツール・リソース', slug: 'tools', emoji: '🛠️', order: 3, description: 'おすすめのツールやリソース集' },
];

// ダミーナレッジデータ
const knowledgeData = [
  {
    title: 'ポートフォリオを作る時に意識したい5つのポイント',
    slug: 'portfolio-tips',
    categorySlug: 'learning-tips',
    excerpt: '採用担当者の目に留まるポートフォリオを作るために、押さえておきたい重要なポイントを5つにまとめました。',
    tags: ['ポートフォリオ', '就活', 'デザイン'],
    featured: true,
    content: [
      createBlock('ポートフォリオを作る時に意識したい5つのポイント', 'h2'),
      createBlock('ポートフォリオはデザイナーにとって名刺代わりの重要なツールです。ここでは、採用担当者の目に留まるポートフォリオを作るためのポイントをご紹介します。'),
      createBlock('1. 最初の3秒で惹きつける', 'h3'),
      createBlock('採用担当者は多くのポートフォリオを見ています。最初の数秒で「もっと見たい」と思わせる工夫が必要です。メインビジュアルやキャッチコピーで、あなたの強みを端的に伝えましょう。'),
      createBlock('2. プロセスを見せる', 'h3'),
      createBlock('完成物だけでなく、どのような課題があり、どう解決したのかというプロセスを見せることで、あなたの思考力をアピールできます。'),
      createBlock('3. 数字で成果を示す', 'h3'),
      createBlock('「使いやすくなった」ではなく「CVRが20%向上した」のように、具体的な数字で成果を示すと説得力が増します。'),
      createBlock('4. ターゲットを意識する', 'h3'),
      createBlock('応募先の企業や職種に合わせて、見せる作品や強調するポイントを変えましょう。'),
      createBlock('5. 更新を怠らない', 'h3'),
      createBlock('古い作品ばかりのポートフォリオは、現在のスキルを反映していません。定期的に更新し、最新の実力を見せましょう。'),
    ],
  },
  {
    title: 'デザイン学習を継続するための3つの習慣',
    slug: 'learning-habits',
    categorySlug: 'learning-tips',
    excerpt: '挫折しがちなデザイン学習を継続するために、日々の生活に取り入れたい習慣をご紹介します。',
    tags: ['学習', '習慣', 'モチベーション'],
    featured: false,
    content: [
      createBlock('デザイン学習を継続するための3つの習慣', 'h2'),
      createBlock('デザイン学習は長期戦です。モチベーションを維持しながら継続するための習慣を身につけましょう。'),
      createBlock('1. 毎日少しずつ触れる', 'h3'),
      createBlock('週末にまとめて勉強するより、毎日15分でもFigmaを触る方が上達します。小さな習慣を積み重ねることが大切です。'),
      createBlock('2. アウトプットを習慣化する', 'h3'),
      createBlock('学んだことをTwitterやnoteでアウトプットしましょう。人に説明することで理解が深まり、フィードバックももらえます。'),
      createBlock('3. 仲間を作る', 'h3'),
      createBlock('一人で学習を続けるのは大変です。BONOのコミュニティなど、同じ目標を持つ仲間と繋がることで、モチベーションを維持できます。'),
    ],
  },
  {
    title: '未経験からUIデザイナーになるためのロードマップ',
    slug: 'ui-designer-roadmap',
    categorySlug: 'career',
    excerpt: '未経験からUIデザイナーを目指す方向けに、学習から就職までのロードマップを解説します。',
    tags: ['未経験', 'UIデザイナー', 'キャリア', 'ロードマップ'],
    featured: true,
    content: [
      createBlock('未経験からUIデザイナーになるためのロードマップ', 'h2'),
      createBlock('未経験からUIデザイナーを目指す方が増えています。ここでは、学習から就職までの道筋をご紹介します。'),
      createBlock('Step 1: 基礎学習（1〜2ヶ月）', 'h3'),
      createBlock('まずはデザインの基礎とFigmaの使い方を学びます。BONOのロードマップに沿って進めると効率的です。'),
      createBlock('Step 2: トレース・模写（1〜2ヶ月）', 'h3'),
      createBlock('実際のアプリやWebサイトをトレースして、デザインパターンを身につけます。'),
      createBlock('Step 3: オリジナル制作（2〜3ヶ月）', 'h3'),
      createBlock('自分でテーマを決めて、オリジナルの作品を作ります。ポートフォリオに載せる作品を意識しましょう。'),
      createBlock('Step 4: ポートフォリオ作成（1ヶ月）', 'h3'),
      createBlock('これまでの作品をまとめたポートフォリオを作成します。プロセスも含めて見せることが重要です。'),
      createBlock('Step 5: 就職活動', 'h3'),
      createBlock('ポートフォリオが完成したら、いよいよ就職活動です。面接対策もしっかり行いましょう。'),
    ],
  },
  {
    title: 'デザイナー面接でよく聞かれる質問と回答例',
    slug: 'interview-questions',
    categorySlug: 'career',
    excerpt: 'デザイナーの面接でよく聞かれる質問と、効果的な回答のポイントをまとめました。',
    tags: ['面接', '就活', '転職'],
    featured: false,
    content: [
      createBlock('デザイナー面接でよく聞かれる質問と回答例', 'h2'),
      createBlock('デザイナーの面接では、スキルだけでなく思考プロセスや人柄も見られています。よくある質問と回答のポイントを押さえておきましょう。'),
      createBlock('Q: なぜデザイナーになりたいのですか？', 'h3'),
      createBlock('単に「デザインが好きだから」ではなく、どんな課題をデザインで解決したいのか、具体的なエピソードを交えて話しましょう。'),
      createBlock('Q: この作品で工夫した点は？', 'h3'),
      createBlock('見た目の話だけでなく、ユーザーの課題をどう捉え、どう解決したかを説明できると良いです。'),
      createBlock('Q: フィードバックを受けた時どう対応しますか？', 'h3'),
      createBlock('素直に受け入れる姿勢と、その上で自分の意見も伝えられることをアピールしましょう。'),
      createBlock('Q: チームで働く上で大切にしていることは？', 'h3'),
      createBlock('コミュニケーション力をアピールするチャンスです。具体的なエピソードを準備しておきましょう。'),
    ],
  },
  {
    title: '作業効率が上がるFigmaプラグイン10選',
    slug: 'figma-plugins',
    categorySlug: 'tools',
    excerpt: 'デザイン作業の効率を上げるために、ぜひ入れておきたいFigmaプラグインを厳選してご紹介します。',
    tags: ['Figma', 'プラグイン', 'ツール', '効率化'],
    featured: true,
    content: [
      createBlock('作業効率が上がるFigmaプラグイン10選', 'h2'),
      createBlock('Figmaには便利なプラグインがたくさんあります。作業効率を上げるために、ぜひ入れておきたいプラグインをご紹介します。'),
      createBlock('1. Unsplash', 'h3'),
      createBlock('高品質な写真を直接Figmaに挿入できます。ダミー画像が必要な時に重宝します。'),
      createBlock('2. Iconify', 'h3'),
      createBlock('様々なアイコンセットから検索してアイコンを挿入できます。'),
      createBlock('3. Content Reel', 'h3'),
      createBlock('ダミーテキストや画像を一括で挿入できるプラグインです。'),
      createBlock('4. Stark', 'h3'),
      createBlock('アクセシビリティチェックができます。コントラスト比の確認などに便利です。'),
      createBlock('5. Autoflow', 'h3'),
      createBlock('フローチャートの矢印を自動で描画してくれます。'),
      createBlock('その他のおすすめ', 'h3'),
      createBlock('Remove BG、Figmotion、Instance Finder、Rename It、Similayerなども便利です。'),
    ],
  },
  {
    title: 'デザイナーが知っておきたい無料リソースまとめ',
    slug: 'free-resources',
    categorySlug: 'tools',
    excerpt: 'フリー素材、フォント、カラーツールなど、デザイナーが知っておくと便利な無料リソースをまとめました。',
    tags: ['リソース', '無料', 'フォント', '素材'],
    featured: false,
    content: [
      createBlock('デザイナーが知っておきたい無料リソースまとめ', 'h2'),
      createBlock('デザイン作業に役立つ無料リソースをカテゴリ別にまとめました。ブックマークしておくと便利です。'),
      createBlock('写真素材', 'h3'),
      createBlock('Unsplash、Pexels、Pixabayなどがおすすめです。商用利用可能な高品質写真が見つかります。'),
      createBlock('イラスト素材', 'h3'),
      createBlock('unDraw、Illustrations、Open Doodlesなど。フラットなイラストからラフな手書き風まで様々です。'),
      createBlock('アイコン', 'h3'),
      createBlock('Feather Icons、Heroicons、Phosphor Iconsなどがおすすめです。'),
      createBlock('フォント', 'h3'),
      createBlock('Google Fonts、Adobe Fonts（有料プラン）が定番です。日本語フォントならGoogle Fonts日本語やモリサワBIZ UDフォントなど。'),
      createBlock('カラーツール', 'h3'),
      createBlock('Coolors、Adobe Color、Color Huntなどでカラーパレットを作成・参考にできます。'),
      createBlock('UIキット・テンプレート', 'h3'),
      createBlock('Figma Communityには無料で使えるUIキットがたくさんあります。学習の参考にもなります。'),
    ],
  },
];

async function seedKnowledge() {
  console.log('ナレッジのダミーデータを作成します...\n');

  // 1. カテゴリを作成
  console.log('📁 カテゴリを作成中...');
  const categoryRefs: { [slug: string]: string } = {};

  for (const cat of categories) {
    // 既存のカテゴリをチェック
    const existing = await client.fetch(
      `*[_type == "knowledgeCategory" && slug.current == $slug][0]{ _id }`,
      { slug: cat.slug }
    );

    if (existing) {
      console.log(`  ⏭️  ${cat.emoji} ${cat.title} (既存)`);
      categoryRefs[cat.slug] = existing._id;
    } else {
      const result = await client.create({
        _type: 'knowledgeCategory',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
        emoji: cat.emoji,
        order: cat.order,
        description: cat.description,
      });
      console.log(`  ✅ ${cat.emoji} ${cat.title}`);
      categoryRefs[cat.slug] = result._id;
    }
  }

  // 2. ナレッジを作成
  console.log('\n📝 ナレッジを作成中...');

  for (const knowledge of knowledgeData) {
    // 既存のナレッジをチェック
    const existing = await client.fetch(
      `*[_type == "knowledge" && slug.current == $slug][0]{ _id }`,
      { slug: knowledge.slug }
    );

    if (existing) {
      console.log(`  ⏭️  ${knowledge.title} (既存)`);
      continue;
    }

    const result = await client.create({
      _type: 'knowledge',
      title: knowledge.title,
      slug: { _type: 'slug', current: knowledge.slug },
      category: {
        _type: 'reference',
        _ref: categoryRefs[knowledge.categorySlug],
      },
      excerpt: knowledge.excerpt,
      content: knowledge.content,
      tags: knowledge.tags,
      featured: knowledge.featured,
      publishedAt: new Date().toISOString(),
    });
    console.log(`  ✅ ${knowledge.title}`);
  }

  console.log('\n🎉 完了しました！');
}

seedKnowledge().catch(console.error);
