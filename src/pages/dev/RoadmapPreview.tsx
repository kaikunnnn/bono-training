/**
 * ロードマップ詳細プレビューページ
 *
 * 各ロードマップのデータを使用して詳細ページをプレビューする
 * URL: /dev/roadmap-preview/:slug
 *
 * 対応スラッグ:
 * - career-change: 未経験から転職ロードマップ
 * - ui-design-beginner: UIデザイン入門
 * - ui-visual: UIビジュアル入門
 * - information-architecture: 情報設計基礎
 * - ux-design: UXデザイン基礎
 */

import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import RoadmapHero from "@/components/roadmap/detail/RoadmapHero";
import ChangingLandscape from "@/components/roadmap/detail/ChangingLandscape";
import InterestingPerspectives from "@/components/roadmap/detail/InterestingPerspectives";
import CurriculumSection from "@/components/roadmap/detail/CurriculumSection";
import ClearBlock from "@/components/roadmap/detail/ClearBlock";
import { getRoadmapBySlug } from "@/data/roadmaps";
import type { SanityRoadmapStep } from "@/types/sanity-roadmap";
import type { Roadmap } from "@/types/roadmap";

// ============================================
// グラデーションプリセットマッピング
// ============================================
const GRADIENT_PRESETS: Record<string, string> = {
  "uiux-career-change": "galaxy",
  "ui-design-beginner": "ocean",
  "ui-visual": "teal",
  "information-architecture": "infoarch",
  "ux-design": "sunset",
};

// ============================================
// 各ロードマップの追加データ（bo-no.designから取得予定）
// ============================================
interface RoadmapExtraData {
  tagline: string;
  changingLandscape: {
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  interestingPerspectives: {
    description: string;
    items: Array<{ title: string; description: string }>;
  };
}

// 各ロードマップの追加データ
// TODO: bo-no.design から正確なコンテンツを取得して更新
const ROADMAP_EXTRA_DATA: Record<string, RoadmapExtraData> = {
  "uiux-career-change": {
    tagline: "未経験から6ヶ月でUIUXデザイナーへ。転職に必要なスキルを体系的に学ぼう",
    changingLandscape: {
      description: "「デザイナーになりたいけど何から始めれば…」を「転職までの道筋が見えた」に変えよう",
      items: [
        {
          title: "何から始めればいいかわからない",
          description: "6ステップの明確なロードマップで、迷わず学習を進められるようになります",
        },
        {
          title: "独学で転職できるか不安",
          description: "実際に未経験から転職した人の事例があり、再現性のある学習方法が身につきます",
        },
        {
          title: "スクールに通う時間もお金もない",
          description: "自分のペースで進められるオンライン学習で、働きながらでもスキルを習得できます",
        },
        {
          title: "ポートフォリオの作り方がわからない",
          description: "各ステップで成果物を作りながら進むので、転職活動に使えるポートフォリオが自然と完成します",
        },
      ],
    },
    interestingPerspectives: {
      description: "UIもUXも情報設計も。デザイナーに必要なスキルを一気通貫で学ぶ楽しさ",
      items: [
        {
          title: "4つの専門スキルが繋がる感覚",
          description: "UIビジュアル→情報設計→UXと進むことで、バラバラだった知識が1つに繋がる瞬間を体験できます",
        },
        {
          title: "「作れる」が積み重なる達成感",
          description: "連絡帳→音声SNS→出張申請→架空サービスと、作れるものがどんどん増えていきます",
        },
        {
          title: "転職という明確なゴール",
          description: "「スキルアップ」ではなく「転職」がゴール。目標が明確だからモチベーションが続きます",
        },
        {
          title: "同じ目標を持つ仲間との学び",
          description: "コミュニティで質問・相談しながら進められ、孤独な独学から脱却できます",
        },
      ],
    },
  },
  "ui-design-beginner": {
    tagline: "Figmaを使ってUIデザインをはじめよう",
    changingLandscape: {
      description: "「何から始めればいいかわからない」を「最初の一歩が踏み出せた」に変えよう",
      items: [
        {
          title: "デザインツールを触ったことがない",
          description: "Figmaの基本操作をマスターし、自信を持ってツールを使えるようになります",
        },
        {
          title: "UIデザインの始め方がわからない",
          description: "YouTubeやTwitterをトレースしながら、UIの作り方を体で覚えられます",
        },
        {
          title: "自分でUIを作れる気がしない",
          description: "連絡帳アプリを実際にデザインし「自分で作れた」という成功体験を得られます",
        },
        {
          title: "有料スクールに通う余裕がない",
          description: "無料でUIデザインの土台を身につけ、次のステップへ進む準備ができます",
        },
      ],
    },
    interestingPerspectives: {
      description: "「見るだけ」から「自分で作れる」に変わると、世界が違って見えるよ",
      items: [
        {
          title: "トレースで「観察力」が育つ",
          description: "普段使っているアプリのUIに「なぜこうなっているのか」と気づく目が養われます",
        },
        {
          title: "手を動かす楽しさ",
          description: "動画を見ながら実際に作ることで、インプットとアウトプットが同時にできる充実感を味わえます",
        },
        {
          title: "3週間で「作れる自分」になる",
          description: "短期間で成果が出るから、モチベーションを保ちながら続けられます",
        },
        {
          title: "次のステップが見える",
          description: "UIビジュアル・情報設計・UXの入門コースへ進む土台ができ、学習の道筋がクリアになります",
        },
      ],
    },
  },
  "ui-visual": {
    tagline: "使いやすいUI体験をつくるための表現の基礎を身につけよう。",
    changingLandscape: {
      description: "ユーザーに受け入れられるUI体験のための、表現の「ふつう」の構築方法を学ぶよ",
      items: [
        {
          title: "アウトプットの質の上げ方がわからない",
          description: "自分で仮説とアイデアを立てて、デザインを探求できる快感が手に入ります。",
        },
        {
          title: "余白や色などUIに何となく適用しているが根拠がない",
          description: "UIや表現を組み立てる「基本の視点」を得ることで自分で考え始められる楽しさを得られます。",
        },
        {
          title: "何となくデザインを進めているが「型」がなく不安",
          description: "デザインの進め方の確かな道しるべを習得することで最初の1歩のハードルがワクワクに変わります。",
        },
        {
          title: "一般的に「良い」と言われるデザインがわからない",
          description: "世の中の「良いデザイン」の正体がわかり、自分の手で再現できるようになります。",
        },
      ],
    },
    interestingPerspectives: {
      description: "「ふつうの表現」の構築方法を身につけると「つくる楽しさ」が広がるよ",
      items: [
        {
          title: "進め方の基本「デザインサイクル」",
          description: "自分の力でデザインをどんどん良くしていける。「試行錯誤そのものが遊び」になるような手応えを実感できます。",
        },
        {
          title: "表現センスの鍛え方",
          description: "「なんとなく」が「根拠」に変わっていきます。普段見るデザイン表現に隠された「理由」を発見するワクワクスキルが手に入ります。",
        },
        {
          title: "UIデザインの「きほん原則」",
          description: "なんとなく見ていたUIデザインに理由があることがわかる。UI体験をつくる発見と好奇心が高まりやすくなります。",
        },
        {
          title: "実践的なUIデザインの進め方",
          description: "表現の基本のやり方を知ることで、「試してみたい！」という自信と好奇心で制作することができます。",
        },
      ],
    },
  },
  "information-architecture": {
    tagline: "使いやすいUIをつくるための「設計力」を身につけよう",
    changingLandscape: {
      description: "「なんとなく配置している」から「理由を持って設計できる」に変わるよ",
      items: [
        {
          title: "見た目は作れるが「使いやすさ」に自信がない",
          description: "顧客と目的に即したUI設計ができ、使いやすさを論理的に組み立てられるようになります",
        },
        {
          title: "なぜここに配置するのか説明できない",
          description: "「なぜこのUIなのか」を根拠を持って説明でき、デザインの説得力が増します",
        },
        {
          title: "画面が増えると構造がぐちゃぐちゃになる",
          description: "情報の優先順位と構造化ができ、複雑な画面でも整理されたUIを設計できます",
        },
        {
          title: "ユーザーが迷うUIを作ってしまう",
          description: "ナビゲーション設計の基本を習得し、ユーザーが迷わないUIを実現できます",
        },
      ],
    },
    interestingPerspectives: {
      description: "「見た目」から「体験の設計」へ。UIの奥深さが見えてくるよ",
      items: [
        {
          title: "OOUI（オブジェクト指向UI）という武器",
          description: "タスク指向からオブジェクト指向へ。UIの組み立て方に新しい視点が加わります",
        },
        {
          title: "4つの必須要素で整理する力",
          description: "モード・アクション・コンテンツ・ナビゲーション。この4要素でUIを分解・構築できるようになります",
        },
        {
          title: "「顧客視点」でアイデアが生まれる",
          description: "ユーザーの目的から逆算してUIを考えることで、本当に必要な機能が見えてきます",
        },
        {
          title: "実践課題で設計力を証明できる",
          description: "出張申請ソフトのデザインで、学んだスキルをポートフォリオに活かせます",
        },
      ],
    },
  },
  "ux-design": {
    tagline: "見た目の先へ。顧客の課題を解決するデザインを学ぼう",
    changingLandscape: {
      description: "「見た目だけ考えるのはデザインではない」。顧客中心の課題解決ができるようになろう",
      items: [
        {
          title: "UXデザインって何をするのかわからない",
          description: "「顧客理解→価値定義→体験設計」という具体的なプロセスが身につきます",
        },
        {
          title: "見た目は作れるが「なぜこのUIか」説明できない",
          description: "顧客の課題から逆算してデザインでき、根拠を持って提案できるようになります",
        },
        {
          title: "ユーザーインタビューをやったことがない",
          description: "インタビュー設計から実施まで体験し、顧客の本音を引き出すスキルを習得できます",
        },
        {
          title: "UIデザインとUXデザインの違いがわからない",
          description: "見た目だけでなく「体験全体」を設計する視点が加わり、デザイナーとしての幅が広がります",
        },
      ],
    },
    interestingPerspectives: {
      description: "顧客の課題を解決する。それがデザインの本質だと気づくと、世界が変わるよ",
      items: [
        {
          title: "「誰のため」が明確になる快感",
          description: "ゴールダイレクテッドデザインで、ユーザーのゴールから体験を組み立てる力が身につきます",
        },
        {
          title: "インタビューで「本当の課題」に出会う",
          description: "自分の思い込みではなく、ユーザーの声から課題を発見する面白さを体験できます",
        },
        {
          title: "架空サービスを「自分で作る」達成感",
          description: "価値定義からUIまで一貫してデザインし、ポートフォリオに使える成果物ができます",
        },
        {
          title: "AI時代に必要なスキルが手に入る",
          description: "顧客理解から体験をデザインする力は、これからのデザイナーに必須の武器になります",
        },
      ],
    },
  },
};

// ============================================
// ロードマップデータをSanity形式に変換
// ============================================
function convertToSanitySteps(roadmap: Roadmap): SanityRoadmapStep[] {
  return roadmap.steps.map((step, index) => {
    if (step.type === "course") {
      return {
        _key: `step-${index + 1}`,
        title: step.title,
        goals: step.skills || [],
        sections: [
          {
            _key: `section-${index + 1}-1`,
            title: step.description,
            contents: step.lessonSlugs.map((slug, lessonIndex) => ({
              _id: `lesson-${slug}`,
              _type: "lesson" as const,
              title: `${slug} のレッスン`,
              slug: { current: slug },
              description: step.goal || "",
              iconImageUrl: `https://images.unsplash.com/photo-1561070791-2526d30994b5?w=106&h=160&fit=crop`,
            })),
          },
        ],
      };
    }
    // 特殊ステップの場合
    return {
      _key: `step-${index + 1}`,
      title: step.title,
      goals: [],
      sections: [],
    };
  });
}

// ============================================
// プレビューコンポーネント
// ============================================
export default function RoadmapPreview() {
  const { slug } = useParams<{ slug: string }>();

  // ロードマップ一覧
  const roadmapSlugs = [
    "uiux-career-change",
    "ui-design-beginner",
    "ui-visual",
    "information-architecture",
    "ux-design",
  ];

  // slugが指定されていない場合は一覧を表示
  if (!slug) {
    return (
      <Layout>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">ロードマップ詳細プレビュー</h1>
          <p className="text-gray-600 mb-8">
            各ロードマップの詳細ページをプレビューできます。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmapSlugs.map((s) => {
              const roadmap = getRoadmapBySlug(s);
              return (
                <Link
                  key={s}
                  to={`/dev/roadmap-preview/${s}`}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all"
                >
                  <h2 className="text-lg font-bold mb-2">
                    {roadmap?.title || s}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {roadmap?.description}
                  </p>
                  <span className="text-xs text-blue-600">
                    /dev/roadmap-preview/{s} →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // ロードマップデータを取得
  const roadmap = getRoadmapBySlug(slug);
  const extraData = ROADMAP_EXTRA_DATA[slug];
  const gradientPreset = GRADIENT_PRESETS[slug] || "teal";

  if (!roadmap) {
    return (
      <Layout>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">ロードマップが見つかりません</h1>
          <p className="text-gray-600 mb-4">
            スラッグ "{slug}" に対応するロードマップが見つかりませんでした。
          </p>
          <Link to="/dev/roadmap-preview" className="text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
      </Layout>
    );
  }

  // Sanity形式に変換
  const sanitySteps = convertToSanitySteps(roadmap);

  return (
    <Layout>
      <div className="py-8 space-y-16">
        {/* ナビゲーション */}
        <div className="max-w-[1200px] mx-auto px-4">
          <Link
            to="/dev/roadmap-preview"
            className="text-sm text-blue-600 hover:underline mb-4 inline-block"
          >
            ← ロードマップ一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold mb-2">
            {roadmap.title} - プレビュー
          </h1>
          <p className="text-gray-600 mb-4">
            スラッグ: <code className="bg-gray-100 px-2 py-1 rounded">{slug}</code>
          </p>

          {/* データ状況 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h2 className="font-bold text-yellow-800 mb-2">⚠️ データ状況</h2>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>✅ 基本情報（title, description, steps）: あり</li>
              <li>
                {extraData && !extraData.changingLandscape.items[0].title.includes("TODO")
                  ? "✅"
                  : "❌"}{" "}
                changingLandscape: {extraData ? "一部あり" : "なし"}
              </li>
              <li>
                {extraData && !extraData.interestingPerspectives.items[0].title.includes("TODO")
                  ? "✅"
                  : "❌"}{" "}
                interestingPerspectives: {extraData ? "一部あり" : "なし"}
              </li>
              <li>⚠️ カリキュラムのレッスン詳細: モックデータ使用中</li>
            </ul>
          </div>
        </div>

        {/* RoadmapHero */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">1. RoadmapHero</h2>
          </div>
          <RoadmapHero
            title={roadmap.title}
            tagline={extraData?.tagline || roadmap.subtitle || roadmap.description}
            stepCount={roadmap.stats.stepsCount}
            estimatedDuration={roadmap.stats.duration.replace("ヶ月", "").replace("〜", "-")}
            gradientPreset={gradientPreset as "teal" | "galaxy" | "ocean" | "infoarch" | "sunset" | "rose"}
            thumbnailUrl={roadmap.thumbnailUrl}
          />
        </section>

        {/* ChangingLandscape */}
        {extraData && (
          <section>
            <div className="max-w-[1200px] mx-auto px-4 mb-4">
              <h2 className="text-lg font-bold text-gray-700">2. ChangingLandscape</h2>
            </div>
            <ChangingLandscape data={extraData.changingLandscape} />
          </section>
        )}

        {/* InterestingPerspectives */}
        {extraData && (
          <section>
            <div className="max-w-[1200px] mx-auto px-4 mb-4">
              <h2 className="text-lg font-bold text-gray-700">3. InterestingPerspectives</h2>
            </div>
            <InterestingPerspectives data={extraData.interestingPerspectives} />
          </section>
        )}

        {/* Curriculum */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">4. CurriculumSection</h2>
            <p className="text-sm text-gray-500">
              ※ レッスン詳細はモックデータ。実際のコンテンツはSanityから取得予定。
            </p>
          </div>
          <CurriculumSection steps={sanitySteps} />
        </section>

        {/* ClearBlock */}
        <section>
          <div className="max-w-[1200px] mx-auto px-4 mb-4">
            <h2 className="text-lg font-bold text-gray-700">5. ClearBlock</h2>
          </div>
          <ClearBlock roadmapTitle={roadmap.title} />
        </section>

        {/* ロードマップデータ詳細（デバッグ用） */}
        <section className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-700 mb-4">📋 ロードマップデータ</h2>
          <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <summary className="cursor-pointer font-medium">JSONデータを表示</summary>
            <pre className="mt-4 text-xs overflow-x-auto bg-gray-900 text-green-400 p-4 rounded">
              {JSON.stringify(roadmap, null, 2)}
            </pre>
          </details>
        </section>
      </div>
    </Layout>
  );
}
