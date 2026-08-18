/**
 * コミュニティの歩き方（使い方ガイド）
 * - 内容は Notion「BONOコミュニティの歩き方」をネイティブ移植
 * - レイアウトは /feedback-apply/guide を踏襲（ヘッダー40/60 + TopSectionHeading + SectionBlock + ボトムCTA）
 * - アイキャッチの「参加する」ボタンは課金判定で出し分け:
 *     課金メンバー → Slack 参加（招待URLは暫定プレースホルダ / SLACK_COMMUNITY_INVITE_URL）
 *     非課金・未ログイン → /subscription（登録促し）
 *
 * 画像は /public/how-to-community/（reaction.png=スタンプ例, times.png=Times例）。アイキャッチ画像は無し。
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getSubscriptionStatus } from "@/lib/subscription";
import {
  SLACK_COMMUNITY_INVITE_URL,
  SLACK_QUESTIONS_URL,
  SLACK_SELF_INTRO_URL,
  SLACK_ANNOUNCEMENTS_URL,
} from "@/lib/external-links";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

// 本文中のリンク共通スタイル
const linkCls =
  "text-text-link underline underline-offset-2 hover:text-text-link-hover font-medium";

export const metadata: Metadata = {
  title: "コミュニティの歩き方",
  description:
    "BONOのSlackコミュニティの使い方・参加のしかた・チャンネルの歩き方をまとめました。",
  openGraph: {
    title: "コミュニティの歩き方 | BONO",
    description:
      "BONOのSlackコミュニティの使い方・参加のしかた・チャンネルの歩き方をまとめました。",
  },
  twitter: {
    title: "コミュニティの歩き方 | BONO",
    description:
      "BONOのSlackコミュニティの使い方・参加のしかた・チャンネルの歩き方をまとめました。",
  },
  alternates: { canonical: "/how-to/community" },
};

// アイキャッチの参加ボタン（課金メンバーは Slack 参加、それ以外は登録促し）
function JoinButton({
  isMember,
  className,
}: {
  isMember: boolean;
  className?: string;
}) {
  if (isMember) {
    return (
      <Button
        asChild
        size="large"
        className={`bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold ${className ?? ""}`}
      >
        <Link
          href={SLACK_COMMUNITY_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          コミュニティに参加する →
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="large"
      className={`bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold ${className ?? ""}`}
    >
      <Link href="/subscription">メンバーになって参加する →</Link>
    </Button>
  );
}

// 見出し(40%) + 内容(60%) の並列ブロック（feedback-apply/guide と同じ構造）
function SectionBlock({
  title,
  bordered = true,
  children,
}: {
  title: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={bordered ? "border-b border-black/[0.12] py-10" : "py-10"}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-[40%] md:shrink-0">
          <h3 className="font-rounded-mplus text-lg font-medium text-text-primary">
            {title}
          </h3>
        </div>
        <div className="md:w-[60%] py-1">{children}</div>
      </div>
    </div>
  );
}

// BONO×Times の狙い（Notion のコールアウト相当）
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-muted-custom border border-black/[0.08] p-5">
      <span aria-hidden className="text-xl leading-none">👉</span>
      <div className="text-base leading-relaxed text-text-secondary space-y-1">
        {children}
      </div>
    </div>
  );
}

export default async function CommunityGuidePage() {
  const subscription = await getSubscriptionStatus();
  // 課金メンバー全員（standard/feedback 問わず）を対象に「参加する」を出す
  const isMember = subscription.isSubscribed;

  return (
    <div className="min-h-screen">
      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー（アイキャッチ：タイトル + 参加ボタン / 説明） */}
        <section className="border-b border-gray-200 pb-8 mb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            {/* 左: タイトル + 参加ボタン（40%） */}
            <div className="md:w-[40%] md:shrink-0 flex flex-col gap-3">
              <div className="space-y-4">
                <h1 className="font-rounded-mplus text-[30px] font-bold text-text-primary leading-tight">
                  コミュニティの歩き方
                </h1>
                <JoinButton isMember={isMember} className="w-fit" />
              </div>
            </div>

            {/* 右: 説明文（60%）。参加導線は上部ボタンに集約 */}
            <div className="md:w-[60%] text-text-muted leading-relaxed py-4 space-y-2">
              <p>
                BONOのSlackコミュニティは、質問・相談・イベントなど「学習を進めること以外」の中心地です。
              </p>
              <p>
                コミュニティ参加は専用リンクが必要です。上の「参加する」ボタンから進めましょう（参加は自動ではありません）。
              </p>
            </div>
          </div>
        </section>

        <article>
          {/* まずやること */}
          <section className="border-b border-black/[0.12] py-16">
            <TopSectionHeading
              badgeLabel="参加したら"
              heading="まずやること"
              className="mb-8"
            />

            <SectionBlock title="まずは自己紹介しよう">
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  自己紹介チャンネルで自己紹介をしましょう。次のようなことを書くと、人となりが伝わります。
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>やっている仕事、勉強していること</li>
                  <li>好きなデザイン・サービス</li>
                  <li>出身や趣味</li>
                  <li>コミュニティに入った動機　など</li>
                </ul>
                <p>
                  X（Twitter）やポートフォリオのリンクがあると、より「人となり」が伝わります。
                </p>
                <p>
                  <a href={SLACK_SELF_INTRO_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    → Slack「自己紹介」チャンネルを開く
                  </a>
                </p>
              </div>
            </SectionBlock>

            <SectionBlock title="質問チャンネルを使おう">
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  「質問／相談」チャンネルは、疑問が集まる場所です。学習や制作で「あれ、これで合ってる？」「調べたけどわからない」が出たら、遠慮なく投稿しましょう。
                </p>
                <p>
                  「前に似た話があったかも…」は気にしなくてOK。ただし、まずは一度自分で調べてみてから聞くのがおすすめです。
                </p>
                <p>
                  <a href={SLACK_QUESTIONS_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    → Slack「質問／相談」チャンネルを開く
                  </a>
                </p>
                <p>
                  また、このサイトの「みんなの掲示板」でも質問できます。
                  <Link href="/questions" className={linkCls}>
                    みんなの掲示板を開く →
                  </Link>
                </p>
              </div>
            </SectionBlock>

            <SectionBlock title="フィードバックチャンネルを使おう">
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  「フィードバック」チャンネルは、アウトプットに成長の視点をもらう場所です。制作したアウトプットにカイクンがコメントします（原則グロースプランの方が対象）。
                </p>
                <p>
                  BONO以外の制作物でもOK。「ここを見てほしい」を添えて投稿すると、学びがより能動的になります。
                </p>
                <p>
                  使い方・前提は「
                  <Link href="/how-to/feedback" className={linkCls}>
                    フィードバックのやり方
                  </Link>
                  」にまとめています。
                </p>
              </div>
            </SectionBlock>

            <SectionBlock title="リアクション（スタンプ）をつけよう">
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  横のつながりを作るなら、発言している人に絡んでいくのが一番の近道です。みんなのtimesを見たら、リアクション（スタンプ）をつけましょう。
                </p>
                <p>
                  反応があると、やっぱり嬉しいもの。嬉しいとどんどん情報をシェアしたくなり、結果みんながデザインに詳しくなっていきます。コミュニティも賑やかになって、見て回るのが楽しくなります。
                </p>
                <Image
                  src="/how-to-community/reaction.png"
                  alt="使いやすいスタンプの例"
                  width={1304}
                  height={264}
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="mt-2 w-full h-auto rounded-2xl border border-black/[0.08]"
                />
              </div>
            </SectionBlock>

            <SectionBlock title="timesチャンネルに入る／つくる" bordered={false}>
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  timesは、日々の活動やX（Twitter）ではつぶやきにくいことを気軽に書く場です。使い方は人それぞれですが、BONOとしてはこんな狙いがあります。
                </p>
                <Callout>
                  <p className="font-bold text-text-primary">BONO × Times のねらい</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>デザイン学び発信の練習（まとめる前の草稿のように）</li>
                    <li>言語化の習慣づけ</li>
                    <li>メンバー同士の横のつながり</li>
                    <li>相談・悩みの発信 → コミュニティで助け合い</li>
                  </ul>
                </Callout>
                <p>
                  まずはカイクンのチャンネルに参加するのがおすすめ（チャンネル一覧で「times」と検索すると出ます）。いきなり自分の <code className="text-sm bg-muted-custom px-1 py-0.5 rounded">times_xxxx</code> を作ってもOKです。自己紹介の投稿などで宣伝しましょう。
                </p>
                <p>
                  Slackは流れが早く、自己紹介チャンネルの投稿もすぐ流れてしまいます。ずっと残るプロフィールや、自分のtimesのトピックにも、簡単な自己紹介を書いておきましょう。
                </p>
                <Image
                  src="/how-to-community/times.png"
                  alt="Timesチャンネルの例"
                  width={2266}
                  height={1448}
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="w-full h-auto rounded-2xl border border-black/[0.08]"
                />
              </div>
            </SectionBlock>
          </section>

          {/* イベントに参加しよう */}
          <section className="border-b border-black/[0.12] py-16">
            <TopSectionHeading
              badgeLabel="イベント"
              heading="イベントに参加しよう"
              className="mb-8"
            />

            <SectionBlock title="月1の勉強会・デザトレワークショップ">
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  月1回、勉強会・デザトレのワークショップを開催しています。告知は「お知らせチャンネル」で流れるので、チェックしておきましょう。
                </p>
                <p>
                  <a href={SLACK_ANNOUNCEMENTS_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    → Slack「お知らせ」チャンネルを開く
                  </a>
                </p>
                <p>過去には、こんなテーマをやりました。</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>ロードマップの内容で「写真共有SNSの投稿フロー」をデザインしてみよう</li>
                  <li>AIを使ってプロトタイピング、デザイン計画を立ててみよう</li>
                </ul>
                <p>
                  参加はBONOメンバーのみ。その場で作業時間を設けて、デザイン → 共有 → 発表まで行います。ぜひ参加してください。
                </p>
              </div>
            </SectionBlock>

            <SectionBlock title="交流会について" bordered={false}>
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  交流会は3〜4ヶ月に1回ほど、基本オンラインで開催しています。飛び入り参加も途中抜けも自由です。
                </p>
                <p>
                  気が向いたら「お知らせチャンネル」で告知して実施していますが、要望があれば企画するので、気軽にカイクンに聞いてみてください。
                </p>
              </div>
            </SectionBlock>
          </section>

          {/* チャンネルを作る */}
          <section className="py-16">
            <TopSectionHeading
              badgeLabel="チャンネル"
              heading="チャンネルを自由に作ろう"
              className="mb-8"
            />

            <SectionBlock title="作成は自由。命名ルールだけ守ってね" bordered={false}>
              <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                <p>
                  イベントや趣味など、デザインに関係ないことでもチャンネルを作ってOKです。作るときは「<span className="font-bold text-text-primary">数字_カテゴリ名</span>」の命名ルールを守ってください。
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    <code className="text-sm bg-muted-custom px-1 py-0.5 rounded">2_feed</code>（例：2_feed_デザイン情報 / 2_feed_アウトプット）
                  </li>
                  <li>
                    <code className="text-sm bg-muted-custom px-1 py-0.5 rounded">3_event</code>（例：3_event_今年を振り返る）
                  </li>
                  <li>
                    <code className="text-sm bg-muted-custom px-1 py-0.5 rounded">4_club</code>（例：4_club_転職 / 4_club_キャンプ / 4_club_サウナ）
                  </li>
                  <li>
                    <code className="text-sm bg-muted-custom px-1 py-0.5 rounded">times</code>（例：times_kaikun）
                  </li>
                </ul>
              </div>
            </SectionBlock>
          </section>
        </article>

        {/* ボトムCTA */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-muted-custom px-6 py-10 text-center">
          <h2 className="font-rounded-mplus text-xl font-bold text-text-primary">
            コミュニティに参加しよう
          </h2>
          <p className="mt-3 text-text-muted leading-relaxed">
            まずは参加して、自己紹介から始めてみましょう。
          </p>
          <div className="mt-6 flex justify-center">
            <JoinButton isMember={isMember} />
          </div>
        </div>
      </main>
    </div>
  );
}
