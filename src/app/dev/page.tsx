/**
 * /dev — 内部用デザイン検討ポータル（上位）
 *
 * 過去・現在のデザイン検討プロセスをまとめる。
 * 個別の検討は `/dev/<issue-id>` 配下に配置。
 * 本番には出さない（noindex）。
 */

import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dev Portal (/dev)",
  robots: { index: false, follow: false },
};

interface DevProjectEntry {
  href: string;
  issue: string;
  title: string;
  summary: string;
  status: "in-progress" | "shipped" | "archived";
  /** 同じ検討の別案など、カード内に並べる追加のリンク */
  links?: { href: string; label: string }[];
}

const projects: DevProjectEntry[] = [
  {
    href: "/dev/event-registration-patterns",
    issue: "#218",
    title: "イベント申込済みカードのパターン比較",
    summary:
      "申込後のカードの見せ方を比較（P1「参加中」カード／P2 無効ボタン「申込済み」／P3 コンパクト1行）。⋯メニュー→取り消し確認モーダル、参加者一覧の自分の行でのコメント編集、アイコン列のラベル案、ページ全体の並び。モックのみで何も送信しない。",
    status: "in-progress",
  },
  {
    href: "/dev/announcement-bar",
    issue: "#220",
    title: "イベント告知のお知らせバー",
    summary:
      "/top・/mypage 上部に出す細いお知らせバーの単体確認。❌で閉じた記録のリセット、期限切れ時の非表示も確認できる。",
    status: "in-progress",
  },
  {
    href: "/dev/event-registration",
    issue: "#218",
    title: "イベントのサイト上参加申込：参加者表示と申込UIの状態一覧",
    summary:
      "参加者アイコン列（0/1/3/4/5/12人）、申込UIの全状態（未ログイン・非会員・会員の未申込/申込済み/編集中/取り消し確認/エラー）、会員だけに見せるコメント一覧、ページ全体の並び（会員/非会員）。本物のコンポーネントにモックデータを渡して表示。ボタンは何も送信しない。",
    status: "in-progress",
  },
  {
    href: "/dev/content-guide",
    issue: "#212",
    title: "コンテンツガイド：スキル状態の診断プロトタイプ",
    summary:
      "なりたいスキル状態（18個）を選び、いまできることをチェックすると、最初に取り掛かる状態・目指す状態・道筋と各状態の該当レッスンが出る。未ログイン/会員の表示切り替えつき。認証・DB・Sanityなし、結果は保存しない。A案（スキルマップ）・B案（1問ずつのクイズ）を比較中。",
    status: "in-progress",
    links: [
      { href: "/dev/content-guide/map", label: "A案: スキルマップ診断" },
      { href: "/dev/content-guide/quiz", label: "B案: 1問ずつのクイズ型" },
    ],
  },
  {
    href: "/dev/branch-review",
    issue: "REVIEW",
    title: "chivalrous-appendix ブランチレビュー",
    summary:
      "本番ルート（/guide・/feedbacks）は変えず、新UIを本番遮断プレビュー（/notes・/community/feedback）として同梱。確認ページ一覧とチェック項目で、採用/捨てるを判断する。",
    status: "in-progress",
  },
  {
    href: "/dev/top",
    issue: "TOP-2026",
    title: "新トップページ v1（初期実装）",
    summary:
      "PRD🏠_topUI_newBONO2026 を元にした新トップページの最初の組み立て。スタイル崩れが見つかったため v2/v3 で再構築中。",
    status: "archived",
  },
  {
    href: "/dev/top2",
    issue: "TOP-2026",
    title: "新トップページ v2（Figma実測px版）",
    summary:
      "コンポーネント単位→ブロック単位で1から再構築した参照版。フォントサイズ等はFigma実測pxをそのまま採用。",
    status: "in-progress",
  },
  {
    href: "/dev/top3",
    issue: "TOP-2026",
    title: "新トップページ v3（採用サイズ版）",
    summary:
      "v2をベースに、title/description等をFigma実測より2px小さくした版。ユーザー確認済みで現在はこちらを正として更新中。",
    status: "in-progress",
  },
  {
    href: "/dev/top4",
    issue: "TOP-2026",
    title: "新トップページ v4（余白統一版）",
    summary:
      "v3をベースに、全ブロックの外側の上下余白を「みんなの実績」ブロックの120pxリズムに統一した余白実験版。内容はv3と同一で余白のみ変更。",
    status: "in-progress",
  },
  {
    href: "/dev/top6",
    issue: "TOP-2026",
    title: "新トップページ 背景白パターン（top6）",
    summary:
      "本番トップ `/` に採用した新トップ構成の、背景色/サイドバー境界線パターン違い版。`/` はこの構成（旧 v5）を昇格したもの。比較検証用に /dev に残置。",
    status: "in-progress",
  },
  {
    href: "/dev/question-community",
    issue: "掲示板 #137",
    title: "みんなの掲示板：改善 Before/After ハブ",
    summary:
      "/questions の改善を実装前確認 + リリース後ログとして集約。ログイン訴求モーダルの整列案・アニメーション刷新など。",
    status: "in-progress",
  },
  {
    href: "/dev/post-complete-animation",
    issue: "掲示板 #143",
    title: "投稿完了アニメーションの再生確認",
    summary:
      "投稿フロー最終ステップの完了アニメ（チェック + 紙吹雪）をリプレイ再生してタイミングを確認できる。prefers-reduced-motion のフォールバック確認もここで。",
    status: "in-progress",
  },
  {
    href: "/dev/design-breakdown/achievements",
    issue: "DESIGN",
    title: "/achievements 分解ダッシュボード",
    summary:
      "/achievements を トークン / コンポーネント / ブロック の3層に分解し、各ノブを動かすと画面の印象がどう変わるかを比較で示す分析用ダッシュボード。",
    status: "in-progress",
  },
  {
    href: "/dev/subscription-success",
    issue: "課金 success",
    title: "課金登録後（決済完了）画面の現状確認",
    summary:
      "本番 /subscription/success が表示する SubscriptionSuccessContent を Stripe/Webhook/DB なしで描画。状態（成功/ローディング/エラー）・タイプ（新規/プラン変更）・プラン・期間を切り替えて改善前の現状を確認できる。",
    status: "in-progress",
  },
  {
    href: "/dev/bon-327",
    issue: "BON-327",
    title: "受講者ストーリー & アウトプット まわり",
    summary:
      "/achievements ハブ・/stories 一覧&詳細・/outputs 一覧の検討プロセス。カード/詳細ページの複数パターン比較。",
    status: "shipped",
  },
];

function StatusBadge({ status }: { status: DevProjectEntry["status"] }) {
  if (status === "shipped") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-noto-sans-jp">
        Shipped
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-noto-sans-jp">
        In Progress
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-noto-sans-jp">
      Archived
    </span>
  );
}

export default function DevPortalPage() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-12 pb-6 border-b-2 border-gray-300">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            INTERNAL
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary font-rounded-mplus mt-1">
            Dev Portal
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            デザイン検討プロセスのアーカイブ。Issue ごとに検討ページをまとめている。
            本番には公開されない（noindex）。
          </p>
        </header>

        <section>
          <h2 className="text-xs font-bold text-text-primary/50 font-noto-sans-jp mb-4 tracking-wider">
            PROJECTS
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((entry) =>
              entry.links ? (
                <div
                  key={entry.href}
                  className="group relative bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-text-primary/40 font-noto-sans-jp tracking-wider flex-shrink-0">
                        {entry.issue}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus group-hover:underline truncate">
                        {/* カード全体を押せるように、主リンクの疑似要素をカード全体に広げる（リンクの入れ子を避ける） */}
                        <Link href={entry.href} className="after:absolute after:inset-0 after:rounded-[20px] after:content-['']">
                          {entry.title}
                        </Link>
                      </h3>
                    </div>
                    <StatusBadge status={entry.status} />
                  </div>
                  <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
                    {entry.summary}
                  </p>
                  <p className="text-xs text-text-primary/40 mt-3 font-noto-sans-jp">
                    {entry.href} →
                  </p>
                  <ul className="relative z-10 mt-3 flex flex-wrap gap-2">
                    {entry.links.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="inline-flex min-h-9 items-center rounded-full border border-gray-200 bg-surface px-3 text-xs font-bold text-text-primary font-noto-sans-jp hover:bg-gray-50"
                        >
                          {l.label} →
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
              <Link
                key={entry.href}
                href={entry.href}
                className="group block bg-surface rounded-[20px] border border-gray-200/60 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-text-primary/40 font-noto-sans-jp tracking-wider flex-shrink-0">
                      {entry.issue}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-text-primary font-rounded-mplus group-hover:underline truncate">
                      {entry.title}
                    </h3>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
                <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
                  {entry.summary}
                </p>
                <p className="text-xs text-text-primary/40 mt-3 font-noto-sans-jp">
                  {entry.href} →
                </p>
              </Link>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
