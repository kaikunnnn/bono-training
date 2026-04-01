/**
 * ロードマップのコンテンツをSanityに反映するスクリプト
 *
 * 使用方法: node scripts/sync-roadmap-content.mjs
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// .env.local を読み込み
dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

// ロードマップコンテンツデータ
const roadmapContents = [
  {
    // UIUXデザイナー転職ロードマップ
    id: 'oNWk1SXbyGbVYC4WgWISbP',
    changingLandscape: {
      description: '転職から逆算したスキルを身につけて、ユーザー価値を生み出すデザイン人材になろう',
      items: [
        {
          _key: 'cl1',
          title: '何から始めればいいかわからない',
          description: 'ステップの明確なロードマップで、迷わず学習を進められるようになります',
        },
        {
          _key: 'cl2',
          title: '独学で転職できるか不安',
          description: '実際に未経験から転職した人の事例があり、再現性のある学習方法で進められます',
        },
        {
          _key: 'cl3',
          title: 'スクールに通う時間もお金もない',
          description: '自分のペースで進められるオンライン学習で、働きながらでもスキルを習得できます',
        },
        {
          _key: 'cl4',
          title: 'ポートフォリオの作り方がわからない',
          description: '各ステップで成果物を作りながら進むので、転職活動に使えるポートフォリオが自然と完成します',
        },
      ],
    },
    interestingPerspectives: {
      description: 'UIとUXのデザインを学ぶこと、人が喜ぶものづくりを実践する視点とスキルが手に入ります',
      items: [
        {
          _key: 'ip1',
          title: 'ユーザー価値を生み出すスキル',
          description: 'UI制作→情報設計→UXデザインと進むことで、顧客課題に対してアプローチするデザインスキルの獲得ができます',
        },
        {
          _key: 'ip2',
          title: 'ふつうのUI体験を制作する力',
          description: '使いやすいUIデザインの基本を習得することで、何を考えてどの視点でUIを制作するのかの基礎を獲得します。',
        },
        {
          _key: 'ip3',
          title: 'ユーザーを主軸にした体験設計スキル',
          description: '顧客課題のリサーチや、ユーザーと目的を軸にした、UIアイデアと評価方法を学び、見た目だけじゃないユーザーのためのデザイン構築を身につけます。',
        },
        {
          _key: 'ip4',
          title: 'ポートフォリオになるアウトプット',
          description: '実践しながら身につけるロードマップ形式なので、ポートフォリオに載せるアウトプットが手に入ります。',
        },
      ],
    },
  },
  {
    // UIビジュアル入門
    id: 'R7520s7vHtbrU9r11pqfDD',
    changingLandscape: {
      description: 'ユーザーに受け入れられるUIデザインの「制作の型」を習得します',
      items: [
        {
          _key: 'cl1',
          title: '余白や配色など何となくで根拠がない',
          description: '使いやすいUI実現の「基本の型」を習得すると、自分で考えられる楽しさを得られます。',
        },
        {
          _key: 'cl2',
          title: 'アウトプットの質の上げ方がわからない',
          description: '"デザインの進め方"の型を習得して、リサーチからアイデアを立てデザインを良くしていく楽しさを手に入れよう',
        },
        {
          _key: 'cl3',
          title: '一般的に「良い」と言われるデザインがわからない',
          description: 'UIリサーチの手法を身につけ「良いデザイン」を探索してデザインを進める力を得ることができます',
        },
        {
          _key: 'cl4',
          title: 'UIをチェックする視点がない',
          description: 'UIを形づくる"基礎構造"と"スタイル要素"を知ることで、見るべき項目を把握することできます。',
        },
      ],
    },
    interestingPerspectives: {
      description: '「UI表現」の構築方法を身につけることで、「つくる楽しさ」が広がるよ',
      items: [
        {
          _key: 'ip1',
          title: '進め方の基本「デザインサイクル」',
          description: '自分の力でデザインをどんどん良くしていける。「試行錯誤そのものが遊び」になるような"デザインの型"を身につけます',
        },
        {
          _key: 'ip2',
          title: 'UIビジュアルの「きほん原則」',
          description: '余白や配色など"使いやすいUIの表現の基礎"を得ることで、なんとなくではないUI制作の視点を持つことことができます',
        },
        {
          _key: 'ip3',
          title: '表現センスの鍛え方',
          description: 'UIリサーチを通した制作方法を身につけて、「なんとなく」が「根拠」に変わっていくワクワクするデザインを行えるようになります。',
        },
        {
          _key: 'ip4',
          title: '実践的なUIデザインの進め方',
          description: 'UI制作の進め方を実践動画を真似して知ることで、自然と現場を意識したデザインを進められるようになります',
        },
      ],
    },
  },
  {
    // 情報設計基礎
    id: 'R7520s7vHtbrU9r11pqfId',
    changingLandscape: {
      description: '見た目ではなく「ユーザーがどう使うか」でUIデザインする基本を身につけます',
      items: [
        {
          _key: 'cl1',
          title: '見た目は作れるがユーザー中心設計に自信がない',
          description: '情報設計の型を手に入れることで、ユーザーの使いやすさを論理的に組み立てられるようになります',
        },
        {
          _key: 'cl2',
          title: '画面や情報の順番に根拠がない',
          description: '情報の優先順位と構造化ができ、複雑な画面でも整理されたUI設計を進められるようになります',
        },
        {
          _key: 'cl3',
          title: 'ユーザー視点でUIを確認できない',
          description: 'ユーザーの振る舞いを定義してデザインする型で、自分のUIをユーザーに即して改善できるようになります',
        },
        {
          _key: 'cl4',
          title: 'AIでデザイナーは不要なのではと不安',
          description: 'AIに支持するために、AIのアウトプットを判断するためには、目的とユーザーから方向性を定義することが必要だと理解できます。',
        },
      ],
    },
    interestingPerspectives: {
      description: '「見た目」から「体験の設計」へ。UIの奥深さが見えてくるよ',
      items: [
        {
          _key: 'ip1',
          title: 'ユースケースでUIデザインする力',
          description: 'ユーザーの目的から逆算してUIを考えることで、使い手目線の「使いやすさ」を軸にしたデザインの面白さと出会えます。',
        },
        {
          _key: 'ip2',
          title: 'OOUI（オブジェクト指向UI）の基本',
          description: '「モノ」起点でUIを設計する考え方が身につき、UIの見え方が変わります',
        },
        {
          _key: 'ip3',
          title: 'UI操作の基本でUIを考える力',
          description: 'モード・アクション・コンテンツ・ナビゲーション。この4要素でUIを分解・構築できるようになります',
        },
        {
          _key: 'ip4',
          title: '実践課題で設計力を証明できる',
          description: 'ロードマップで学んだスキルを実践で生かし、ポートフォリオ作成に繋げることができます。',
        },
      ],
    },
  },
  {
    // UXデザイン基礎
    id: 'oNWk1SXbyGbVYC4WgWISXH',
    changingLandscape: {
      description: '顧客課題を見つけて、「課題起点」でデザインを進められるようになろう',
      items: [
        {
          _key: 'cl1',
          title: '事業やサービスに貢献するデザインがわからない',
          description: '顧客の課題から逆算してデザインでき、根拠を持って提案できるようになります',
        },
        {
          _key: 'cl2',
          title: 'AIでデザインが不要になりそうで不安',
          description: 'ユーザー価値デザインの視点で、AIを使ってデザインする視点を手に入れられます',
        },
        {
          _key: 'cl3',
          title: '課題解決と言われても難しい',
          description: '「ユーザーが達成したい状態」をどう形にするかを考える方法で、課題解決型のデザインを始められます',
        },
        {
          _key: 'cl4',
          title: 'UIデザインとUXデザインの違いがわからない',
          description: '見た目や使いやすさより重要な「顧客価値のデザイン」という視点で、デザインの面白さを広げましょう',
        },
      ],
    },
    interestingPerspectives: {
      description: 'UIは手段。目的は顧客の課題を解決すること。デザインの捉え方を広げよう',
      items: [
        {
          _key: 'ip1',
          title: 'ユーザー価値を生み出すためのデザインの型',
          description: 'ゴールダイレクテッドデザインで、ユーザーのなりたい状態からデザインを組み立てる力が身につきます',
        },
        {
          _key: 'ip2',
          title: 'インタビューで「本当の課題」を発見する力',
          description: '自分の思い込みではなく、ユーザーの声から課題を発見する面白さを体験できます',
        },
        {
          _key: 'ip3',
          title: 'AI時代に生きる価値デザインの土台スキル',
          description: '顧客理解から体験をデザインする力は、これからのデザイナーに必須の武器になります',
        },
        {
          _key: 'ip4',
          title: '架空サービスを「自分でつくる」達成感',
          description: 'ユーザー課題と価値の定義からUIまでをデザインすることで、ポートフォリオにできる成果物を作れます',
        },
      ],
    },
  },
  {
    // UIデザイン入門
    id: 'oNWk1SXbyGbVYC4WgWIST9',
    changingLandscape: {
      description: 'デザインをはじめる「最初の1歩」を踏み出そう🚶',
      items: [
        {
          _key: 'cl1',
          title: 'デザインツールを使ったことがない',
          description: 'Figmaの基本操作からデザインをはじめて、"つくる"1歩を踏み出します',
        },
        {
          _key: 'cl2',
          title: 'UIデザインの始め方がわからない',
          description: 'YouTubeやTwitterをトレースして、UIに必要な要素を知っていきましょう',
        },
        {
          _key: 'cl3',
          title: '自分でUIを作れる気がしない',
          description: '連絡帳アプリを実際にデザインし「自分で作れた」という成功体験を得られます',
        },
        {
          _key: 'cl4',
          title: '有料スクールに通う余裕がない',
          description: '無料でUIデザインの1歩を踏み出して、次のステップへ進む準備ができます',
        },
      ],
    },
    interestingPerspectives: {
      description: 'ようこそデザインの世界へ。「自分でつくる」と、世界が違って見えるよ',
      items: [
        {
          _key: 'ip1',
          title: 'トレースで「観察力」が育つ',
          description: '普段使っているアプリのUIに「なぜこうなっているのか」を考える視点を獲得できます',
        },
        {
          _key: 'ip2',
          title: '手を動かす楽しさ',
          description: '動画を見ながら実際に作ることで、インプットとアウトプットが同時にできる充実感を味わえます',
        },
        {
          _key: 'ip3',
          title: 'デザインツールを扱える',
          description: 'ビジュアル制作ツールが扱えるようになり、できることの幅が広がります',
        },
        {
          _key: 'ip4',
          title: '3週間で「作れる自分」になる',
          description: '短期間で成果が出るから、モチベーションを保ちながら続けられます',
        },
      ],
    },
  },
];

async function syncRoadmapContent() {
  console.log('🚀 ロードマップコンテンツの同期を開始します...\n');

  for (const content of roadmapContents) {
    try {
      console.log(`📝 ID: ${content.id} を更新中...`);

      await client
        .patch(content.id)
        .set({
          changingLandscape: content.changingLandscape,
          interestingPerspectives: content.interestingPerspectives,
        })
        .commit();

      console.log(`✅ 成功: ${content.id}\n`);
    } catch (error) {
      console.error(`❌ エラー: ${content.id}`, error.message);
    }
  }

  console.log('🎉 同期完了！');
}

syncRoadmapContent();
