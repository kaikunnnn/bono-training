/**
 * 質問のダミーデータを作成するスクリプト
 * 実行: cd sanity-studio && npx ts-node scripts/seedQuestions.ts
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
  { title: 'Figma', slug: 'figma' },
  { title: 'キャリア', slug: 'career' },
  { title: 'BONO', slug: 'bono' },
  { title: 'デザイン全般', slug: 'design' },
  { title: 'UI', slug: 'ui' },
];

// ダミー質問データ
const questions = [
  {
    title: 'Figmaのオートレイアウトがうまく動かない時の対処法は？',
    slug: 'figma-autolayout-not-working',
    categorySlug: 'figma',
    questionContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Figmaでオートレイアウトを設定しているのですが、子要素が思った通りに配置されません。特にテキストとアイコンを横並びにしたい時に、間隔がおかしくなってしまいます。何か設定が間違っているのでしょうか？',
          },
        ],
      },
    ],
    answerContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'オートレイアウトの問題、よくありますよね！いくつか確認してみてください。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '1. 子要素のサイズ設定を確認',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '子要素が「Hug contents」になっているか確認してください。「Fixed」になっていると、意図しない挙動になることがあります。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '2. パディングとギャップの確認',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '親要素のパディングとギャップ（間隔）が適切に設定されているか見てみてください。ギャップが0になっていたり、パディングが大きすぎたりすると表示が崩れます。',
          },
        ],
      },
    ],
  },
  {
    title: '未経験からUIデザイナーになるにはどのくらいの期間が必要？',
    slug: 'how-long-to-become-ui-designer',
    categorySlug: 'career',
    questionContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '現在Webマーケティングの仕事をしています。UIデザイナーに転職したいのですが、未経験からだとどのくらいの学習期間が必要でしょうか？また、ポートフォリオはどの程度のクオリティが求められますか？',
          },
        ],
      },
    ],
    answerContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '転職を考えているんですね！期間は人によって異なりますが、目安をお伝えします。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '学習期間の目安',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '週に20時間程度学習できる場合、6ヶ月〜1年が目安です。ただし、これは「転職活動を始められるレベル」に達するまでの期間です。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'ポートフォリオについて',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '数より質が大事です。2〜3個の作品で十分ですが、それぞれに「なぜこのデザインにしたのか」という思考プロセスを説明できることが重要です。',
          },
        ],
      },
    ],
  },
  {
    title: 'BONOのレッスンはどの順番で進めるのがおすすめ？',
    slug: 'bono-lesson-order',
    categorySlug: 'bono',
    questionContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'BONOに入会したばかりです。レッスンがたくさんあってどこから始めればいいか迷っています。おすすめの順番はありますか？',
          },
        ],
      },
    ],
    answerContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '入会ありがとうございます！目的によっておすすめが変わりますが、基本的な流れをお伝えしますね。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'まずはロードマップを確認',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ロードマップページで、自分の目標に合ったルートを確認してください。「未経験から転職」「現役デザイナーのスキルアップ」など、目的別に最適な順番が用意されています。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '迷ったら基礎から',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '特に目的が決まっていない場合は、「UIデザイン基礎」から始めるのがおすすめです。デザインの考え方の土台が身につきます。',
          },
        ],
      },
    ],
  },
  {
    title: 'デザインの引き出しを増やすにはどうすればいい？',
    slug: 'how-to-improve-design-vocabulary',
    categorySlug: 'design',
    questionContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'デザインを作る時、いつも同じようなパターンになってしまいます。引き出しを増やすためにはどんなことをすればいいでしょうか？',
          },
        ],
      },
    ],
    answerContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'デザインの引き出し、増やしたいですよね。いくつか効果的な方法を紹介します。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '1. トレース（模写）する',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '良いと思ったデザインをFigmaでトレースしてみてください。「見る」だけでなく「作る」ことで、なぜそのデザインが良いのか体感できます。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: '2. 分析ノートをつける',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '良いデザインを見つけたら、「何が良いのか」「なぜ良いと感じるのか」を言語化してメモしておきましょう。後で振り返れる資産になります。',
          },
        ],
      },
    ],
  },
  {
    title: 'ボタンのサイズやパディングの決め方がわからない',
    slug: 'button-size-padding-guide',
    categorySlug: 'ui',
    questionContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'UIを作る時、ボタンのサイズやパディングをどう決めればいいか迷います。何か基準やルールはありますか？',
          },
        ],
      },
    ],
    answerContent: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'ボタンのサイズ、悩みますよね。いくつかの基準を紹介します。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'タップ領域の最小サイズ',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'モバイルの場合、タップ領域は最低44px×44pxが推奨されています（Appleのガイドライン）。これより小さいと押しにくくなります。',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h3',
        children: [
          {
            _type: 'span',
            text: 'パディングの目安',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: '一般的には、左右のパディングは上下の1.5〜2倍にすると見栄えが良くなります。例えば、上下12px、左右24pxといった具合です。',
          },
        ],
      },
    ],
  },
];

async function seed() {
  console.log('🌱 ダミーデータの作成を開始します...\n');

  // 1. カテゴリを作成
  console.log('📁 カテゴリを作成中...');
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const existing = await client.fetch(
      `*[_type == "questionCategory" && slug.current == $slug][0]`,
      { slug: cat.slug }
    );

    if (existing) {
      console.log(`  ✓ ${cat.title} (既存)`);
      categoryMap[cat.slug] = existing._id;
    } else {
      const created = await client.create({
        _type: 'questionCategory',
        title: cat.title,
        slug: { _type: 'slug', current: cat.slug },
      });
      console.log(`  + ${cat.title} (新規作成)`);
      categoryMap[cat.slug] = created._id;
    }
  }

  // 2. 質問を作成
  console.log('\n❓ 質問を作成中...');

  for (const q of questions) {
    const existing = await client.fetch(
      `*[_type == "question" && slug.current == $slug][0]`,
      { slug: q.slug }
    );

    if (existing) {
      console.log(`  ✓ ${q.title.substring(0, 30)}... (既存)`);
    } else {
      // ブロックに_keyを追加
      const questionContentWithKeys = q.questionContent.map((block, i) => ({
        ...block,
        _key: `q${i}`,
        children: block.children?.map((child: any, j: number) => ({
          ...child,
          _key: `qc${i}${j}`,
        })),
      }));

      const answerContentWithKeys = q.answerContent.map((block, i) => ({
        ...block,
        _key: `a${i}`,
        children: block.children?.map((child: any, j: number) => ({
          ...child,
          _key: `ac${i}${j}`,
        })),
      }));

      await client.create({
        _type: 'question',
        title: q.title,
        slug: { _type: 'slug', current: q.slug },
        category: { _type: 'reference', _ref: categoryMap[q.categorySlug] },
        questionContent: questionContentWithKeys,
        answerContent: answerContentWithKeys,
        publishedAt: new Date().toISOString(),
      });
      console.log(`  + ${q.title.substring(0, 30)}... (新規作成)`);
    }
  }

  console.log('\n✅ 完了しました！');
}

seed().catch(console.error);
