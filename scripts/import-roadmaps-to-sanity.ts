/**
 * ロードマップデータをSanityにインポートするスクリプト
 *
 * 使い方:
 * npx tsx scripts/import-roadmaps-to-sanity.ts
 *
 * 実行前に:
 * 1. SANITY_TOKEN 環境変数を設定（書き込み権限のあるトークン）
 * 2. .env.local に VITE_SANITY_PROJECT_ID と VITE_SANITY_DATASET があること
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

// 複数の.envファイルを読み込み
dotenv.config({ path: ".env.local" });
dotenv.config({ path: "sanity-studio/.env" });

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || "production";
// SANITY_TOKEN, SANITY_AUTH_TOKEN, SANITY_WRITE_TOKEN のいずれかを使用
const token = process.env.SANITY_TOKEN || process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("❌ SANITY_PROJECT_ID が設定されていません");
  process.exit(1);
}

if (!token) {
  console.error("❌ SANITY_TOKEN/SANITY_AUTH_TOKEN が設定されていません");
  console.error("   Sanity管理画面でAPIトークンを作成し、環境変数に設定してください");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

console.log(`🔧 Sanity接続: ${projectId} / ${dataset}`);

// ============================================
// ロードマップデータ定義
// ============================================

interface RoadmapData {
  slug: string;
  title: string;
  description: string;
  tagline: string;
  gradientPreset: string;
  estimatedDuration: string;
  order: number;
  isPublished: boolean;
  changingLandscape: {
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  interestingPerspectives: {
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  steps: Array<{
    title: string;
    goals: string[];
    sections: Array<{
      title: string;
      description?: string;
      lessonSlugs: string[];
    }>;
  }>;
}

const roadmapsData: RoadmapData[] = [
  // ============================================
  // 1. UIデザイン入門
  // ============================================
  {
    slug: "ui-design-beginner",
    title: "UIデザイン入門",
    description:
      "UIトレースを中心に未経験からでもUIデザインを行う土台を身につけるコース。Figmaの操作方法をUIを作りながら学びます。",
    tagline: "Figmaを使ってUIデザインをはじめよう",
    gradientPreset: "ocean",
    estimatedDuration: "1-2",
    order: 1,
    isPublished: true,
    changingLandscape: {
      description:
        "「何から始めればいいかわからない」を「最初の一歩が踏み出せた」に変えよう",
      items: [
        {
          title: "デザインツールを触ったことがない",
          description:
            "Figmaの基本操作をマスターし、自信を持ってツールを使えるようになります",
        },
        {
          title: "UIデザインの始め方がわからない",
          description:
            "YouTubeやTwitterをトレースしながら、UIの作り方を体で覚えられます",
        },
        {
          title: "自分でUIを作れる気がしない",
          description:
            "連絡帳アプリを実際にデザインし「自分で作れた」という成功体験を得られます",
        },
        {
          title: "有料スクールに通う余裕がない",
          description:
            "無料でUIデザインの土台を身につけ、次のステップへ進む準備ができます",
        },
      ],
    },
    interestingPerspectives: {
      description:
        "「見るだけ」から「自分で作れる」に変わると、世界が違って見えるよ",
      items: [
        {
          title: "トレースで「観察力」が育つ",
          description:
            "普段使っているアプリのUIに「なぜこうなっているのか」と気づく目が養われます",
        },
        {
          title: "手を動かす楽しさ",
          description:
            "動画を見ながら実際に作ることで、インプットとアウトプットが同時にできる充実感を味わえます",
        },
        {
          title: "3週間で「作れる自分」になる",
          description:
            "短期間で成果が出るから、モチベーションを保ちながら続けられます",
        },
        {
          title: "次のステップが見える",
          description:
            "UIビジュアル・情報設計・UXの入門コースへ進む土台ができ、学習の道筋がクリアになります",
        },
      ],
    },
    steps: [
      {
        title: "Figmaの使い方をゼロから習得しよう",
        goals: [
          "フレームとシェイプの作成",
          "テキストの入力と編集",
          "画像の配置と調整",
          "レイヤーの管理",
        ],
        sections: [
          {
            title:
              "YouTubeアプリをトレースしながらFigmaの基本操作を習得。完了目安は1週間。",
            lessonSlugs: ["figmabeginner"],
          },
        ],
      },
      {
        title: "FigmaのAuto Layoutを習得しよう",
        goals: [
          "Auto Layoutの基本操作",
          "パディングとギャップの設定",
          "コンポーネントの作成",
          "再利用可能なUI部品の設計",
        ],
        sections: [
          {
            title:
              "Twitter UIをトレースしてAuto Layoutなど実践的なFigmaスキルを習得。完了目安は1週間。",
            lessonSlugs: ["figma-elementary"],
          },
        ],
      },
      {
        title: "連絡帳をデザインしてUIの基本に触れる",
        goals: [
          "アプリ画面の構成の理解",
          "リスト表示のデザイン",
          "詳細画面のデザイン",
          "画面間の関係性の把握",
        ],
        sections: [
          {
            title:
              "連絡帳アプリをデザインして、UIの基本概念を理解。完了目安は1週間。",
            lessonSlugs: ["uidesignbeginner"],
          },
        ],
      },
    ],
  },

  // ============================================
  // 2. UIビジュアル入門
  // ============================================
  {
    slug: "ui-visual",
    title: "UIビジュアル入門",
    description:
      'UIデザインの"見た目の基礎"を学べるコース。どうサイズを決めるのか？など現場でよく使われる考え方と視点を習得します。',
    tagline: "使いやすいUI体験をつくるための表現の基礎を身につけよう。",
    gradientPreset: "teal",
    estimatedDuration: "1-2",
    order: 2,
    isPublished: true,
    changingLandscape: {
      description:
        "ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ",
      items: [
        {
          title: "アウトプットの質の上げ方がわからない",
          description:
            "自分で仮説とアイデアを立てて、デザインを探求できる快感が手に入ります。",
        },
        {
          title: "余白や色などUIに何となく適用しているが根拠がない",
          description:
            "UIや表現を組み立てる「基本の視点」を得ることで自分で考え始められる楽しさを得られます。",
        },
        {
          title: "何となくデザインを進めているが「型」がなく不安",
          description:
            "デザインの進め方の確かな道しるべを習得することで最初の1歩のハードルがワクワクに変わります。",
        },
        {
          title: "一般的に「良い」と言われるデザインがわからない",
          description:
            "世の中の「良いデザイン」の正体がわかり、自分の手で再現できるようになります。",
        },
      ],
    },
    interestingPerspectives: {
      description:
        "「ふつうの表現」の構築方法を身につけると「つくる楽しさ」が広がるよ",
      items: [
        {
          title: "進め方の基本「デザインサイクル」",
          description:
            "自分の力でデザインをどんどん良くしていける。「試行錯誤そのものが遊び」になるような手応えを実感できます。",
        },
        {
          title: "表現センスの鍛え方",
          description:
            "「なんとなく」が「根拠」に変わっていきます。普段見るデザイン表現に隠された「理由」を発見するワクワクスキルが手に入ります。",
        },
        {
          title: "UIデザインの「きほん原則」",
          description:
            "なんとなく見ていたUIデザインに理由があることがわかる。UI体験をつくる発見と好奇心が高まりやすくなります。",
        },
        {
          title: "実践的なUIデザインの進め方",
          description:
            "表現の基本のやり方を知ることで、「試してみたい！」という自信と好奇心で制作することができます。",
        },
      ],
    },
    steps: [
      {
        title: "上達するデザインの進め方",
        goals: [
          "プロが実践するデザインの進め方",
          "良いデザインを観察・分析する方法",
          "センスを盗む技術",
          "効果的な練習サイクル",
        ],
        sections: [
          {
            title:
              "デザインの基本的な進め方を習得。効率的にスキルアップするための土台を作る。完了目安: 3〜7日",
            lessonSlugs: ["ui-design-flow-lv1", "steel-design-sense"],
          },
        ],
      },
      {
        title: "ToDoサービスをデザイン",
        goals: [
          "UIトレースによる学習方法",
          "アプリ画面の構造理解",
          "3つの画面パターン（一覧・詳細・入力）",
          "画面間の関係性の設計",
        ],
        sections: [
          {
            title:
              "マネから始めてToDoアプリをデザインしながら、実践的なUIデザインスキルを習得。完了目安: 1〜2週間",
            lessonSlugs: ["three-structures-ui-design", "tutorial-uivisual"],
          },
        ],
      },
      {
        title: "UIの基礎要素を習得",
        goals: [
          "タイポグラフィの基本原則",
          "配色とカラーシステム",
          "サイズと余白の決め方（8の倍数）",
          "グラフィック要素の扱い方",
        ],
        sections: [
          {
            title:
              "見た目の基本6要素（タイポグラフィ、色、サイズなど）を体系的に学ぶ。完了目安: 2週間",
            lessonSlugs: ["ui-typography", "uivisual", "graphicbeginner"],
          },
        ],
      },
      {
        title: "ゼロからデザインしてみよう",
        goals: [
          "ゼロからのUI設計プロセス",
          "学んだ基礎要素の総合的な活用",
          "一貫性のあるデザインシステム構築",
          "ポートフォリオに使える成果物作成",
        ],
        sections: [
          {
            title:
              "音声SNSアプリをゼロからデザイン。学んだスキルを総合的に活用。完了目安: 2週間",
            lessonSlugs: ["dailyui-part01"],
          },
        ],
      },
    ],
  },

  // ============================================
  // 3. 情報設計基礎
  // ============================================
  {
    slug: "information-architecture",
    title: "情報設計基礎",
    description:
      "使いやすいUIをつくるための基本を習得するコース。顧客と目的に即したUIの検討と実現方法を学びます。",
    tagline: "使いやすいUIをつくるための「設計力」を身につけよう",
    gradientPreset: "infoarch",
    estimatedDuration: "1-2",
    order: 3,
    isPublished: true,
    changingLandscape: {
      description:
        "「なんとなく配置している」から「理由を持って設計できる」に変わるよ",
      items: [
        {
          title: "見た目は作れるが「使いやすさ」に自信がない",
          description:
            "顧客と目的に即したUI設計ができ、使いやすさを論理的に組み立てられるようになります",
        },
        {
          title: "なぜここに配置するのか説明できない",
          description:
            "「なぜこのUIなのか」を根拠を持って説明でき、デザインの説得力が増します",
        },
        {
          title: "画面が増えると構造がぐちゃぐちゃになる",
          description:
            "情報の優先順位と構造化ができ、複雑な画面でも整理されたUIを設計できます",
        },
        {
          title: "ユーザーが迷うUIを作ってしまう",
          description:
            "ナビゲーション設計の基本を習得し、ユーザーが迷わないUIを実現できます",
        },
      ],
    },
    interestingPerspectives: {
      description: "「見た目」から「体験の設計」へ。UIの奥深さが見えてくるよ",
      items: [
        {
          title: "OOUI（オブジェクト指向UI）という武器",
          description:
            "タスク指向からオブジェクト指向へ。UIの組み立て方に新しい視点が加わります",
        },
        {
          title: "4つの必須要素で整理する力",
          description:
            "モード・アクション・コンテンツ・ナビゲーション。この4要素でUIを分解・構築できるようになります",
        },
        {
          title: "「顧客視点」でアイデアが生まれる",
          description:
            "ユーザーの目的から逆算してUIを考えることで、本当に必要な機能が見えてきます",
        },
        {
          title: "実践課題で設計力を証明できる",
          description:
            "出張申請ソフトのデザインで、学んだスキルをポートフォリオに活かせます",
        },
      ],
    },
    steps: [
      {
        title: "UIデザイン基本を習得",
        goals: [
          "モード（状態）の設計",
          "アクション（操作）の配置",
          "コンテンツの整理と表示",
          "ナビゲーションの基本パターン",
        ],
        sections: [
          {
            title:
              "デザインの流れをトレースして、機能×UIで必須要素（モード、アクション、コンテンツ、ナビゲーション）の基礎を習得。完了目安: 1〜2週間",
            lessonSlugs: ["ui-layout-basic", "navigation-basics"],
          },
        ],
      },
      {
        title: "情報設計の基礎をインプット",
        goals: [
          "OOUI（オブジェクト指向UI）の考え方",
          "タスク指向とオブジェクト指向の違い",
          "情報の構造化と階層設計",
          "UI配置の根拠を言語化する力",
        ],
        sections: [
          {
            title:
              'OOUI（オブジェクト指向UI）の概念と、"どこに何をなぜ置くべきか"の基礎を習得。完了目安: 2週間',
            lessonSlugs: ["ooui", "ui-architect-beginner"],
          },
        ],
      },
      {
        title: "実践お題チャレンジ",
        goals: [
          "業務アプリのUI設計プロセス",
          "フローに沿った画面設計",
          "フォーム設計と入力フロー",
          "情報設計の実践的な適用",
        ],
        sections: [
          {
            title:
              "出張申請ソフトをデザインして、学んだ情報設計スキルを実践で活用。完了目安: 2週間",
            lessonSlugs: ["uiflowchallenge-businesstripsoftwear"],
          },
        ],
      },
    ],
  },

  // ============================================
  // 4. UXデザイン基礎
  // ============================================
  {
    slug: "ux-design",
    title: "UXデザイン基礎",
    description:
      'UI/UXデザインで必須の"顧客を中心"にした課題解決のデザイン手法を学びます。インタビューから価値定義まで、実践的なUXデザインプロセスを習得。',
    tagline: "見た目の先へ。顧客の課題を解決するデザインを学ぼう",
    gradientPreset: "sunset",
    estimatedDuration: "2",
    order: 4,
    isPublished: true,
    changingLandscape: {
      description:
        "「見た目だけ考えるのはデザインではない」。顧客中心の課題解決ができるようになろう",
      items: [
        {
          title: "UXデザインって何をするのかわからない",
          description:
            "「顧客理解→価値定義→体験設計」という具体的なプロセスが身につきます",
        },
        {
          title: "見た目は作れるが「なぜこのUIか」説明できない",
          description:
            "顧客の課題から逆算してデザインでき、根拠を持って提案できるようになります",
        },
        {
          title: "ユーザーインタビューをやったことがない",
          description:
            "インタビュー設計から実施まで体験し、顧客の本音を引き出すスキルを習得できます",
        },
        {
          title: "UIデザインとUXデザインの違いがわからない",
          description:
            "見た目だけでなく「体験全体」を設計する視点が加わり、デザイナーとしての幅が広がります",
        },
      ],
    },
    interestingPerspectives: {
      description:
        "顧客の課題を解決する。それがデザインの本質だと気づくと、世界が変わるよ",
      items: [
        {
          title: "「誰のため」が明確になる快感",
          description:
            "ゴールダイレクテッドデザインで、ユーザーのゴールから体験を組み立てる力が身につきます",
        },
        {
          title: "インタビューで「本当の課題」に出会う",
          description:
            "自分の思い込みではなく、ユーザーの声から課題を発見する面白さを体験できます",
        },
        {
          title: "架空サービスを「自分で作る」達成感",
          description:
            "価値定義からUIまで一貫してデザインし、ポートフォリオに使える成果物ができます",
        },
        {
          title: "AI時代に必要なスキルが手に入る",
          description:
            "顧客理解から体験をデザインする力は、これからのデザイナーに必須の武器になります",
        },
      ],
    },
    steps: [
      {
        title: "ゴールと進め方の確認",
        goals: [
          "UXデザインの定義と役割",
          "UIデザインとUXデザインの違い",
          "顧客中心設計の考え方",
          "学習ロードマップの全体像",
        ],
        sections: [
          {
            title:
              "UXデザインとは何かを理解し、コースのゴールと進め方を確認。期間: 3日",
            lessonSlugs: ["ux-beginner-2"],
          },
        ],
      },
      {
        title: "架空サービスの「価値定義」仮説をつくろう",
        goals: [
          "ゴールダイレクテッドデザインの手法",
          "ユーザーのゴール設定",
          "価値仮説の立て方",
          "サービスコンセプトの言語化",
        ],
        sections: [
          {
            title:
              "ゴールダイレクテッドデザインを習得し、サービスの価値を定義。期間: 1週間",
            lessonSlugs: ["uxdezaintohahe-ka-copy", "ux-biginner"],
          },
        ],
      },
      {
        title: 'インタビューで"顧客理解"に挑戦',
        goals: [
          "インタビュー設計の方法",
          "質問の組み立て方",
          "インタビューの実施と進行",
          "発言から課題を抽出する分析力",
        ],
        sections: [
          {
            title:
              "ユーザーインタビューで課題要因を特定するスキルを習得。期間: 2週間",
            lessonSlugs: ["zerokara-userinterview"],
          },
        ],
      },
      {
        title: "架空サービスを完成させよう",
        goals: [
          "UXデザインプロセスの総合実践",
          "仮説検証サイクルの回し方",
          "プロトタイピングとフィードバック",
          "ポートフォリオに使える成果物作成",
        ],
        sections: [
          {
            title:
              "ユーザーの課題解決するサービスをデザイン。総合的な実践課題。期間: 1ヶ月",
            lessonSlugs: ["designyourownservice"],
          },
        ],
      },
    ],
  },

  // ============================================
  // 5. UIUXデザイナー転職ロードマップ
  // ============================================
  {
    slug: "uiux-career-change",
    title: "UIUXデザイナー転職ロードマップ",
    description:
      "UIデザインの基礎から、情報設計、UXデザインまで。転職に必要なスキルを6ヶ月で体系的に学ぶロードマップ。",
    tagline:
      "未経験から6ヶ月でUIUXデザイナーへ。転職に必要なスキルを体系的に学ぼう",
    gradientPreset: "galaxy",
    estimatedDuration: "6",
    order: 0,
    isPublished: true,
    changingLandscape: {
      description:
        "「デザイナーになりたいけど何から始めれば…」を「転職までの道筋が見えた」に変えよう",
      items: [
        {
          title: "何から始めればいいかわからない",
          description:
            "6ステップの明確なロードマップで、迷わず学習を進められるようになります",
        },
        {
          title: "独学で転職できるか不安",
          description:
            "実際に未経験から転職した人の事例があり、再現性のある学習方法が身につきます",
        },
        {
          title: "スクールに通う時間もお金もない",
          description:
            "自分のペースで進められるオンライン学習で、働きながらでもスキルを習得できます",
        },
        {
          title: "ポートフォリオの作り方がわからない",
          description:
            "各ステップで成果物を作りながら進むので、転職活動に使えるポートフォリオが自然と完成します",
        },
      ],
    },
    interestingPerspectives: {
      description:
        "UIもUXも情報設計も。デザイナーに必要なスキルを一気通貫で学ぶ楽しさ",
      items: [
        {
          title: "4つの専門スキルが繋がる感覚",
          description:
            "UIビジュアル→情報設計→UXと進むことで、バラバラだった知識が1つに繋がる瞬間を体験できます",
        },
        {
          title: "「作れる」が積み重なる達成感",
          description:
            "連絡帳→音声SNS→出張申請→架空サービスと、作れるものがどんどん増えていきます",
        },
        {
          title: "転職という明確なゴール",
          description:
            "「スキルアップ」ではなく「転職」がゴール。目標が明確だからモチベーションが続きます",
        },
        {
          title: "同じ目標を持つ仲間との学び",
          description:
            "コミュニティで質問・相談しながら進められ、孤独な独学から脱却できます",
        },
      ],
    },
    steps: [
      {
        title: "転職条件と学習準備",
        goals: [
          "UIUXデザイナーの仕事内容の理解",
          "転職に必要なスキルセットの把握",
          "効果的な独学の進め方",
        ],
        sections: [
          {
            title: "ゴールイメージを掴もう",
            lessonSlugs: ["wayofuiuxdesigner"],
          },
          {
            title: "学習の心構え",
            lessonSlugs: [
              // TODO: これらのレッスンが存在するか確認
              // "goal-setting",
              // "design-learning-tips",
            ],
          },
        ],
      },
      {
        title: "UIデザイン入門（1ヶ月）",
        goals: [
          "Figmaの基本操作（フレーム、シェイプ、テキスト）",
          "Auto Layoutによる効率的なデザイン",
          "UIトレースによる観察力",
        ],
        sections: [
          {
            title: "UIデザイン入門ロードマップを進めよう",
            description: "→ UIデザイン入門ロードマップを参照",
            lessonSlugs: [], // ロードマップ参照のためレッスンなし
          },
        ],
      },
      {
        title: "UIビジュアル入門（1-2ヶ月）",
        goals: [
          "サイズと余白の設計（8の倍数ルール）",
          "配色とカラーシステムの構築",
          "タイポグラフィの基本原則",
          "UIコンポーネントの設計",
        ],
        sections: [
          {
            title: "UIビジュアル入門ロードマップを進めよう",
            description: "→ UIビジュアル入門ロードマップを参照",
            lessonSlugs: [],
          },
        ],
      },
      {
        title: "情報設計基礎（2ヶ月）",
        goals: [
          "OOUI（オブジェクト指向UI）の考え方",
          "ナビゲーション設計",
          "情報の優先順位と構造化",
          "ユーザーの行動フローに沿ったUI設計",
        ],
        sections: [
          {
            title: "情報設計基礎ロードマップを進めよう",
            description: "→ 情報設計基礎ロードマップを参照",
            lessonSlugs: [],
          },
        ],
      },
      {
        title: "UXデザイン基礎（2ヶ月）",
        goals: [
          "ユーザーインタビューの設計と実施",
          "課題の発見と定義",
          "サービスの価値定義",
          "仮説検証のプロセス",
        ],
        sections: [
          {
            title: "UXデザイン基礎ロードマップを進めよう",
            description: "→ UXデザイン基礎ロードマップを参照",
            lessonSlugs: [],
          },
        ],
      },
      {
        title: "転職準備",
        goals: [
          "ポートフォリオの構成設計",
          "ケーススタディの書き方",
          "デザインプロセスの言語化",
          "採用担当者に響く見せ方",
        ],
        sections: [
          {
            title: "ポートフォリオを作成しよう",
            lessonSlugs: ["portfolio"],
          },
          {
            title: "転職活動の準備",
            lessonSlugs: [
              // TODO: これらのレッスンが存在するか確認
              // "portfolio-top-page",
              // "portfolio-output",
              // "company-research",
              // "designer-interview",
            ],
          },
        ],
      },
    ],
  },
];

// ============================================
// インポート処理
// ============================================

async function main() {
  console.log("\n📋 ロードマップデータのインポートを開始します...\n");

  // 1. 既存のレッスンを取得してslug→_idマップを作成
  console.log("🔍 Sanityからレッスン一覧を取得中...");
  const lessons = await client.fetch<Array<{ _id: string; slug: { current: string } }>>(
    `*[_type == "lesson"] { _id, slug }`
  );

  const lessonMap = new Map<string, string>();
  lessons.forEach((lesson) => {
    if (lesson.slug?.current) {
      lessonMap.set(lesson.slug.current, lesson._id);
    }
  });
  console.log(`   → ${lessonMap.size}件のレッスンを取得\n`);

  // 2. 既存のロードマップを取得（重複チェック用）
  console.log("🔍 既存のロードマップを確認中...");
  const existingRoadmaps = await client.fetch<Array<{ _id: string; slug: { current: string } }>>(
    `*[_type == "roadmap"] { _id, slug }`
  );
  const existingSlugMap = new Map<string, string>();
  existingRoadmaps.forEach((rm) => {
    if (rm.slug?.current) {
      existingSlugMap.set(rm.slug.current, rm._id);
    }
  });
  console.log(`   → ${existingSlugMap.size}件の既存ロードマップを確認\n`);

  // 3. 各ロードマップをインポート
  for (const roadmapData of roadmapsData) {
    console.log(`📦 処理中: ${roadmapData.title} (${roadmapData.slug})`);

    // 既存チェック
    if (existingSlugMap.has(roadmapData.slug)) {
      console.log(`   ⚠️ 既存のドキュメントがあります。スキップします。`);
      console.log(
        `   → 更新する場合は先にSanity Studioで削除してください\n`
      );
      continue;
    }

    // ステップデータを構築
    const steps = roadmapData.steps.map((step, stepIndex) => ({
      _key: `step-${stepIndex}`,
      _type: "step",
      title: step.title,
      goals: step.goals,
      sections: step.sections.map((section, sectionIndex) => {
        // レッスン参照を構築
        const contents = section.lessonSlugs
          .map((lessonSlug) => {
            const lessonId = lessonMap.get(lessonSlug);
            if (!lessonId) {
              console.log(`      ⚠️ レッスン未発見: ${lessonSlug}`);
              return null;
            }
            return {
              _key: `content-${stepIndex}-${sectionIndex}-${lessonSlug}`,
              _type: "reference",
              _ref: lessonId,
            };
          })
          .filter(Boolean);

        return {
          _key: `section-${stepIndex}-${sectionIndex}`,
          _type: "section",
          title: section.title,
          description: section.description || "",
          contents,
        };
      }),
    }));

    // ドキュメントを作成
    const doc = {
      _type: "roadmap",
      title: roadmapData.title,
      slug: { _type: "slug", current: roadmapData.slug },
      description: roadmapData.description,
      tagline: roadmapData.tagline,
      gradientPreset: roadmapData.gradientPreset,
      estimatedDuration: roadmapData.estimatedDuration,
      order: roadmapData.order,
      isPublished: roadmapData.isPublished,
      changingLandscape: {
        description: roadmapData.changingLandscape.description,
        items: roadmapData.changingLandscape.items.map((item, i) => ({
          _key: `cl-item-${i}`,
          title: item.title,
          description: item.description,
        })),
      },
      interestingPerspectives: {
        description: roadmapData.interestingPerspectives.description,
        items: roadmapData.interestingPerspectives.items.map((item, i) => ({
          _key: `ip-item-${i}`,
          title: item.title,
          description: item.description,
        })),
      },
      steps,
    };

    try {
      const result = await client.create(doc);
      console.log(`   ✅ 作成成功: ${result._id}\n`);
    } catch (error) {
      console.error(`   ❌ 作成失敗:`, error);
    }
  }

  console.log("\n🎉 インポート処理が完了しました！");
  console.log("   Sanity Studioで確認してください。\n");
}

main().catch(console.error);
