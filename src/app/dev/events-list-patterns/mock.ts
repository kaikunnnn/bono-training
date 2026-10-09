/**
 * イベント一覧プロトタイプ（#234）のモック。
 *
 * 本番 Sanity の event 7件（2026-10-08 時点）の title / slug / summary / サムネURL / 開催時期を写したもの。
 * eventYear はまだ Sanity に無いので、ここでだけ 2026 を入れている。
 */

import type { EventScheduleInput } from "@/lib/events/event-schedule";

export interface MockEvent extends EventScheduleInput {
  slug: string;
  title: string;
  summary: string;
  /** 空文字ならサムネなし */
  thumbnailUrl: string;
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    slug: "uidesign-challenge-2026-10",
    title: "10/21スタート！BONOの数字を見てUIを改善する1ヶ月チャレンジ",
    summary:
      "BONOの実際の数字を見ながら、BONOを題材にUI改善に取り組む1ヶ月のデザインチャレンジです💪 キックオフは10月21日（水）20:00から。",
    thumbnailUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/8821d6239f483335c91c4470ac1ba0a730597f9e-1920x1080.jpg",
    eventStartAt: "2026-10-21T11:00:00.000Z",
  },
  {
    slug: "yurutalk-2026-08-23",
    title: "ゆるっとデザイン雑談会",
    summary:
      "デザインをきっかけに、メンバーでゆる〜く話す会をやってみます。「なんとなくモチベが…」「他の人が何やってるか聞いてみたい」、動機はなんでもOK。興味ある方はSlackで「興味あり」とコメントください🙋",
    thumbnailUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/e38c7cc02ed02c1c17bc22336eb42f3e4b311446-1920x1080.jpg",
    eventYear: 2026,
    eventMonth: 8,
    eventPeriod: "late",
  },
  {
    slug: "interview-workshop-2026-07",
    title: 'デザイン面接で"考えをシェアする力"を鍛えちゃうよの会',
    summary:
      "面接を使って、チームで必要な”考えをシェア”力を練習する、グループで取り組むワークショップ",
    thumbnailUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/b78d5c8e2c7e69a0453ba7d90aa19226109a95f8-1980x1080.jpg",
    eventYear: 2026,
    eventMonth: 7,
    eventPeriod: "mid",
  },
  {
    slug: "ai-styling-workshop-2026-06",
    title: "AIとUI表現力の土台を上げるワークショップ",
    summary:
      "自分のスタイリングをコントロールする力を上げに行くワークショップです。題材は出張申請の「マイ申請一覧」ページ。AIと協業しながら、スタイルのベースとトークンを自分の手で作っていきます。",
    thumbnailUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/21ff80e96401c51470bd37ee76a1de507776f1bd-1868x976.jpg",
    eventYear: 2026,
    eventMonth: 6,
    eventPeriod: "mid",
  },
  {
    slug: "ai_userscenario",
    title: '"要件満たしただけ"UIを"ユーザー起点"で劇的にデザインしよう！',
    summary:
      'AIが出した要件を満たしただけのUIを、ユーザーシナリオの考え方を使って劇的に改善する実践ワークショップ。"誰が・いつ・なぜ使うか"を具体化し、使う人の状況に合った体験に変える1歩を踏み出せます。',
    thumbnailUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/9af5438c9d463001a020f90667447086427ca29d-1868x976.jpg",
    eventYear: 2026,
    eventMonth: 4,
    eventPeriod: "late",
  },
  {
    slug: "meetup-spring-2026",
    title: "BONOオフ会2026年「春の部」",
    summary: "春です。決起集会です。ブンブンブブン🛵",
    thumbnailUrl:
      "https://cdn.sanity.io/images/cqszh4up/production/74a0346f72ffc1e9c1dd9384a19bc54e7b8632a7-1920x1080.png",
    eventYear: 2026,
    eventMonth: 2,
    eventPeriod: "late",
  },
  {
    slug: "meetup-cursor",
    title: "CusorでAIコーディング入門ワークショップ",
    summary:
      "「AI時代のUIデザイン制作」を今日から始められる、エディター初心者のための入門ワークショップです。",
    // 本番でも Unsplash の外部URL（next.config の remotePatterns に無いので unoptimized で出す）
    thumbnailUrl:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&h=630&fit=crop",
    eventYear: 2026,
    eventMonth: 2,
    eventPeriod: "late",
  },
];

/**
 * 年見出し（パターン D）の効果を見るためのダミー。実在しないイベント。
 * 「年見出し: あり」のときだけ過去セクションに足す。
 */
export const DUMMY_EVENT_2025: MockEvent = {
  slug: "dummy-bonenkai-2025",
  title: "忘年会（ダミー）",
  summary: "年見出しの確認用のダミーです。",
  thumbnailUrl: "",
  eventYear: 2025,
  eventMonth: 12,
  eventPeriod: "mid",
};
