/**
 * 実際のフィードバックデータを追加するスクリプト
 * 実行: cd sanity-studio && npx ts-node scripts/addRealFeedback.ts
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

// ブロックに_keyを追加するヘルパー関数
const createBlock = (style: string, text: string, key: string, marks: string[] = []) => ({
  _type: 'block',
  _key: key,
  style,
  children: [
    {
      _type: 'span',
      _key: `${key}s`,
      text,
      marks,
    },
  ],
});

const createBlockWithMultipleSpans = (style: string, spans: { text: string; marks?: string[] }[], key: string) => ({
  _type: 'block',
  _key: key,
  style,
  children: spans.map((span, i) => ({
    _type: 'span',
    _key: `${key}s${i}`,
    text: span.text,
    marks: span.marks || [],
  })),
});

async function addFeedback() {
  console.log('🌱 実際のフィードバックデータを追加します...\n');

  // UIスタイルカテゴリを取得
  const uiStyleCategory = await client.fetch(
    `*[_type == "feedbackCategory" && slug.current == "ui-style"][0]`
  );

  if (!uiStyleCategory) {
    console.error('❌ UIスタイルカテゴリが見つかりません');
    return;
  }

  // 既存のフィードバックをチェック
  const existing = await client.fetch(
    `*[_type == "feedback" && slug.current == "business-trip-application-ui-review"][0]`
  );

  if (existing) {
    console.log('⚠️ このフィードバックは既に存在します。スキップします。');
    return;
  }

  // 観点・ポイント
  const reviewPoints = [
    createBlock('normal', '「3構造」の理解と既存サービスの「盗む（モデリング）」の実践による、アウトプットの方向性と精度の検証。', 'rp1'),
  ];

  // 依頼内容
  const requestContent = [
    createBlock('h3', '背景', 'req1'),
    createBlock('normal', '前回のFBを踏まえ、「3構造」や「盗む」レッスンを改めて確認。実サービスを参考にパターン出しを行い、申請一覧および新規作成の画面UIを作成しました。', 'req2'),
    createBlock('h3', '相談したいこと', 'req3'),
    createBlock('normal', '制作の進め方や考え方、アウトプットの方向性に間違いがないか。自分なりに精度が上がった（自己評価80点）と感じているが、客観的な視点でのフィードバックがほしい。', 'req4'),
  ];

  // フィードバック本文
  const feedbackContent = [
    createBlock('h2', '📝 今日のサマリー', 'fb1'),
    createBlock('normal', 'お疲れ様です！プロトタイプ作成まで進んだのは大きな前進です🙌', 'fb2'),
    createBlockWithMultipleSpans('normal', [
      { text: 'ただ、今回は' },
      { text: '「形の模倣」に走りすぎて、「なぜその形なのか？」という根拠（情報設計）が抜け落ちている', marks: ['strong'] },
      { text: 'のが惜しいポイントです！' },
    ], 'fb3'),
    createBlock('normal', '情報設計のお題なので、ユーザーが何をやりたいのか？そのために何が必要か？をベースにUIを検討できるようになっていきましょう。', 'fb4'),
    createBlockWithMultipleSpans('normal', [
      { text: '見た目を整える前に、まずは' },
      { text: '「ユーザーが何のために使うのか？」', marks: ['strong'] },
      { text: 'を整理する情報設計（IA）からやり直しましょう！ここを乗り越えれば、デザインの説得力が爆上がりします🚀' },
    ], 'fb5'),

    createBlock('h2', '1. はじめに：確実な前進と次のステージへ 🔥', 'fb6'),
    createBlock('normal', 'まず、プロトタイプの作成お疲れ様でした！！🎉', 'fb7'),
    createBlock('normal', '前回のフィードバックと比べて、格段に良くなっています👏', 'fb8'),
    createBlock('normal', 'ただ「真似る」だけじゃなく、実際に動く形（プロトタイプ）まで落とし込んだのは本当にすごい進歩です！まずは「形にする力」がついたことに自信を持ってください💪', 'fb9'),
    createBlock('normal', '見た目のクオリティも、ベースラインとしては十分なレベルです✨', 'fb10'),
    createBlock('normal', 'ここからは、さらに一段上のデザイナーになるための、少し厳しいけれど愛のあるフィードバックをします❤️‍🔥', 'fb11'),
    createBlockWithMultipleSpans('normal', [
      { text: 'それは' },
      { text: '「なぜその形にしたのか？」という問いへの答えを持つこと', marks: ['strong'] },
      { text: 'です。' },
    ], 'fb12'),

    createBlock('h2', '2. 最も重要な課題：「情報設計」の不在 ⚠️', 'fb13'),
    createBlock('normal', '今回のデザインの最大の課題は、ズバリ…', 'fb14'),
    createBlockWithMultipleSpans('normal', [
      { text: '「画面を作る前に、情報の構造（情報設計）を整理できていないこと」', marks: ['strong'] },
      { text: ' です😭' },
    ], 'fb15'),
    createBlock('normal', '画面デザインのステップにおいて、あなたは「情報設計」のフェーズを飛ばして、いきなり「ビジュアルデザイン（ガワの作成）」に入っちゃってます💦', 'fb16'),
    createBlock('normal', 'YouTubeなどの既存サービスを参考にする（真似る）のはめっちゃ良いこと！', 'fb17'),
    createBlockWithMultipleSpans('normal', [
      { text: 'でも、' },
      { text: '「なぜYouTubeはその構造なのか？」という背景（ユースケース）を理解せずに、表面だけを真似てしまっています🙅‍♀️', marks: ['strong'] },
    ], 'fb18'),

    createBlock('h3', '具体例：サイドナビゲーションの構造ミス 🚫', 'fb19'),
    createBlock('normal', '今回のデザインでは、「申請」という親項目の下に「下書き」「差し戻し」が並列で並んでいます。', 'fb20'),
    createBlock('normal', 'これはYouTubeのマイページを参考にしたっぽいですが、ここには大きな決定的な違いがあります💦', 'fb21'),
    createBlockWithMultipleSpans('normal', [
      { text: '結論：', marks: ['strong'] },
      { text: '今回のアプリのユースケース（頻度や目的）を考えると、サイドバーに「下書き」を特等席として置く必要ナシ🙅‍♀️' },
    ], 'fb22'),
    createBlock('normal', '「申請一覧」の中に、全ての情報が集約されているのが自然な情報設計です✨', 'fb23'),

    createBlock('h2', '3. その他の改善ポイント 💡', 'fb24'),

    createBlock('h3', '① 情報の優先度と視認性（ステータス） 👀', 'fb25'),
    createBlock('normal', '申請業務において、「差し戻し」や「承認待ち」は超重要情報！ユーザーが一番早く知りたいやつです🚨', 'fb26'),
    createBlockWithMultipleSpans('normal', [
      { text: '現状:', marks: ['strong'] },
      { text: ' ステータス表示が右端にあって見にくい…。「差し戻し」以外はアイコンのみで区別がつきにくい💦' },
    ], 'fb27'),
    createBlockWithMultipleSpans('normal', [
      { text: '改善:', marks: ['strong'] },
      { text: ' 重要情報は左側（視線の始点）に近い場所に置く！あるいは色分けやラベルでパッと見て状態がわかるようにしよう！' },
    ], 'fb28'),

    createBlock('h3', '② 配色（カラーセオリー）の基本 🎨', 'fb29'),
    createBlockWithMultipleSpans('normal', [
      { text: '背景色に黄色系、文字やアクセントに青色を使用していますが、これは' },
      { text: '「補色（反対色）」の関係', marks: ['strong'] },
      { text: '！互いに反発して目がチカチカしちゃう組み合わせです😵‍💫' },
    ], 'fb30'),
    createBlockWithMultipleSpans('normal', [
      { text: '改善:', marks: ['strong'] },
      { text: ' デザインにおける配色の基礎（色相環）を学び直そう！まずは同系色でまとめるか、無彩色（グレー）をベースにすると失敗しにくいよ👍' },
    ], 'fb31'),

    createBlock('h3', '③ 「思考停止」の模倣からの脱却 🤔', 'fb32'),
    createBlock('normal', 'リストの左端にあるチェックボックスや、急に出てくる「？」アイコン…これ、「とりあえずGoogleにあるから置いた」になってない？', 'fb33'),
    createBlockWithMultipleSpans('normal', [
      { text: '改善:', marks: ['strong'] },
      { text: ' 画面に置くすべての要素に対して「ユーザーがこれを使う理由は？」と説明できるようにしよう！理由がない要素はノイズです🙅‍♀️' },
    ], 'fb34'),

    createBlock('h2', '4. 今後のアクションプラン 📅', 'fb35'),
    createBlockWithMultipleSpans('normal', [
      { text: '今のあなたに必要なのは、手を動かして画面を綺麗にすることではなく、' },
      { text: '脳に汗をかいて「構造」を考えること', marks: ['strong'] },
      { text: 'です🧠💦' },
    ], 'fb36'),
    createBlock('normal', '1. 情報設計の進め方を実践する（最優先）👑', 'fb37'),
    createBlock('normal', '「ユーザーは何をしたいのか？」「そのためにはどんな情報が必要か？」を書き出し、それを満たすUIパターンを検討しよう！', 'fb38'),
    createBlock('normal', '2. 「真似」の解像度を上げるために情報設計の考え方でUIのアイデアを検討する 🔍', 'fb39'),
    createBlock('normal', 'ただ形を真似るのではなく、「なぜこのUIなのか？」を考察してから取り入れよう！', 'fb40'),

    createBlock('h2', '最後に 💌', 'fb41'),
    createBlock('normal', '厳しいことも言ったけど、これはあなたが「考えられるデザイナー」になるために必要です。', 'fb42'),
    createBlock('normal', '「なんとなく作る」から「意図を持って作る」へ。この壁を越えれば、デザインの説得力は劇的に向上します🚀', 'fb43'),
  ];

  // フィードバックを作成
  const created = await client.create({
    _type: 'feedback',
    title: '出張申請システム（申請一覧・新規作成）のUIデザイン添削',
    slug: { _type: 'slug', current: 'business-trip-application-ui-review' },
    category: { _type: 'reference', _ref: uiStyleCategory._id },
    targetOutput: '情報設計コースのお題：出張申請システム',
    figmaUrl: 'https://www.figma.com/design/GwkWwVMooJyB7PJuSOYU63/FB_%E3%82%84%E3%81%97%E3%81%B0_%E5%87%BA%E5%BC%B5%E7%94%B3%E8%AB%8B?node-id=278-9751&t=rWxtkpE11CKGAKTu-1',
    vimeoUrl: 'https://vimeo.com/1165907220/8fe7478504',
    reviewPoints,
    requestContent,
    feedbackContent,
    publishedAt: new Date().toISOString(),
  });

  console.log(`✅ フィードバックを作成しました: ${created._id}`);
  console.log(`   タイトル: ${created.title}`);
}

addFeedback().catch(console.error);
