/**
 * デザイナー年収に関する質問をSanityに追加するスクリプト
 *
 * 実行方法:
 * cd sanity-studio && npx ts-node scripts/addSalaryQuestion.ts
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';

// .env.localファイルを読み込む
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// ランダムキー生成
function generateKey() {
  return Math.random().toString(36).substring(2, 14);
}

// ブロックコンテンツを生成するヘルパー
function createBlock(text: string) {
  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
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

async function addSalaryQuestion() {
  console.log('デザイナー年収に関する質問を追加します...');

  // キャリアカテゴリを取得
  const careerCategory = await client.fetch(
    `*[_type == "questionCategory" && slug.current == "career"][0]{ _id }`
  );

  if (!careerCategory) {
    console.error('キャリアカテゴリが見つかりません。先にカテゴリを作成してください。');
    return;
  }

  console.log('キャリアカテゴリID:', careerCategory._id);

  // 質問コンテンツ
  const questionContent = [
    createBlock('デザイナーの年収の話なのですが....'),
    createBlock('少なくとも400は欲しいけど実際未経験一年目はどれくらいが多いんだろうな〜と'),
  ];

  // 回答コンテンツ
  const answerContent = [
    createBlock('未経験で400前後です（会社による）'),
    createBlock('UIデザイナーといいつつSTEPデザインとかバナー業務とかさせる制作会社はかなさんがいうような感じだと思います'),
    createBlock('過去の経歴と合わせて押すことで450-500ぐらいは行ける人はいけると思います'),
    createBlock(''),
    createBlock('会社が欲しいのは:'),
    createBlock('・事業やクライアントの課題に貢献して会社を伸ばすのに貢献してくれる人'),
    createBlock('・UIつくる人、なんか使い勝手悪いからここ直したいです〜な人ではない'),
    createBlock(''),
    createBlock('過去の経歴とか自分の得意とかをアピール:'),
    createBlock('・文字でのディレクションとかコミュニケーション得意です'),
    createBlock('・相手が言ってることを汲み取ってUIとかデザインとか、業務の動きを提案できるし、合わせられます'),
    createBlock('・事業に興味あるしそのためにUIつくるだけじゃなくてデザインを使いたいです'),
    createBlock(''),
    createBlock('みたいなポテンシャル認めてもらえれば400以下は無いと未経験でも思います〜'),
    createBlock(''),
    createBlock('都内とかなら、300万貰えれば御の字かなーと感じます（BONOでいうと情報設計とかUXの部分でポテンシャルを示せなかったケース、相手がそもそも払う能力のない会社の場合）'),
  ];

  const question = {
    _type: 'question',
    title: '未経験デザイナーの年収相場について',
    slug: {
      _type: 'slug',
      current: 'salary-expectation-for-beginner-designer',
    },
    category: {
      _type: 'reference',
      _ref: careerCategory._id,
    },
    questionerName: 'Eunjee Kim',
    questionContent,
    answerContent,
    tags: ['年収', '未経験', 'キャリア', '就職'],
    publishedAt: new Date().toISOString(),
    featured: false,
  };

  try {
    const result = await client.create(question);
    console.log('✅ 質問を追加しました:', result._id);
    console.log('タイトル:', result.title);
    console.log('スラッグ:', result.slug.current);
  } catch (error) {
    console.error('❌ エラー:', error);
  }
}

addSalaryQuestion();
