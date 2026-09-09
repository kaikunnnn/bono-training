/**
 * コミュニティの歩き方（使い方ガイド）
 * - 内容は Notion「BONOコミュニティの歩き方」をネイティブ移植（文章は変えない）
 * - レイアウトは how-to 共通の「型」（HowToTocLayout + HowToSection + HowToSubheading）を使用:
 *     全幅ヒーロー → 左sticky目次 + 本文カラム（max640）の2カラム（sm未満は1カラム）
 * - アイキャッチの「参加する」ボタンは課金判定で出し分け:
 *     課金メンバー → Slack 参加（招待URLは暫定プレースホルダ / SLACK_COMMUNITY_INVITE_URL）
 *     非課金・未ログイン → /subscription（登録促し）
 *
 * 画像は /public/how-to-community/（reaction.png=スタンプ例, times.png=Times例）。
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
import HowToTocLayout from "@/components/how-to/HowToTocLayout";
import HowToSection from "@/components/how-to/HowToSection";
import HowToSubheading from "@/components/how-to/HowToSubheading";

// 本文中のリンク共通スタイル
const linkCls =
  "text-text-link underline underline-offset-2 hover:text-text-link-hover font-medium";

// 本文ブロック共通スタイル（本文カラム内で縦に流す。約15px / text-secondary / Noto既定）
const bodyCls = "space-y-3 text-[15px] leading-relaxed text-text-secondary";

// 目次（大セクション3つへのアンカー）
const TOC = [
  { id: "first-steps", label: "まずやること" },
  { id: "events", label: "イベントに参加しよう" },
  { id: "channels", label: "チャンネルを作ろう" },
];

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
      <Button asChild variant="primary" size="large" className={className}>
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
    <Button asChild variant="primary" size="large" className={className}>
      <Link href="/subscription">メンバーになって参加する →</Link>
    </Button>
  );
}

// BONO×Times の狙い（Notion のコールアウト相当）
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-muted-custom border border-black/[0.08] p-5">
      <span aria-hidden className="text-xl leading-none">👉</span>
      <div className="text-[15px] leading-relaxed text-text-secondary space-y-1">
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
      {/* ヒーロー（全幅・下に1px境界） */}
      <section className="border-b border-border-light">
        <div className="mx-auto max-w-[880px] px-4 sm:px-6 py-12 sm:py-16">
          <p className="font-body text-xs tracking-[1.6px] text-text-muted">
            使い方ガイド
          </p>
          <h1 className="mt-3 font-heading text-[32px] font-bold leading-tight text-text-primary sm:text-[40px]">
            コミュニティの歩き方
          </h1>
          <div className="mt-5 max-w-[640px] space-y-2 leading-relaxed text-text-secondary">
            <p>
              BONOのSlackコミュニティは、質問・相談・イベントなど「学習を進めること以外」の中心地です。
            </p>
            <p>
              コミュニティ参加は専用リンクが必要です。上の「参加する」ボタンから進めましょう（参加は自動ではありません）。
            </p>
          </div>
          <div className="mt-7">
            <JoinButton isMember={isMember} className="w-fit" />
          </div>
        </div>
      </section>

      {/* 目次 + 本文 */}
      <div className="py-4 sm:py-6">
        <HowToTocLayout toc={TOC}>
          <article className="divide-y divide-border-light">
            {/* まずやること */}
            <HowToSection id="first-steps" badge="参加したら" heading="まずやること">
              <HowToSubheading>まずは自己紹介しよう</HowToSubheading>
              <div className={bodyCls}>
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

              <HowToSubheading>質問チャンネルを使おう</HowToSubheading>
              <div className={bodyCls}>
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

              <HowToSubheading>フィードバックチャンネルを使おう</HowToSubheading>
              <div className={bodyCls}>
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

              <HowToSubheading>リアクション（スタンプ）をつけよう</HowToSubheading>
              <div className={bodyCls}>
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

              <HowToSubheading>timesチャンネルに入る／つくる</HowToSubheading>
              <div className={bodyCls}>
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
            </HowToSection>

            {/* イベントに参加しよう */}
            <HowToSection id="events" badge="イベント" heading="イベントに参加しよう">
              <HowToSubheading>月1の勉強会・デザトレワークショップ</HowToSubheading>
              <div className={bodyCls}>
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

              <HowToSubheading>交流会について</HowToSubheading>
              <div className={bodyCls}>
                <p>
                  交流会は3〜4ヶ月に1回ほど、基本オンラインで開催しています。飛び入り参加も途中抜けも自由です。
                </p>
                <p>
                  気が向いたら「お知らせチャンネル」で告知して実施していますが、要望があれば企画するので、気軽にカイクンに聞いてみてください。
                </p>
              </div>
            </HowToSection>

            {/* チャンネルを作る */}
            <HowToSection id="channels" badge="チャンネル" heading="チャンネルを自由に作ろう">
              <HowToSubheading>作成は自由。命名ルールだけ守ってね</HowToSubheading>
              <div className={bodyCls}>
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
            </HowToSection>
          </article>

          {/* ボトムCTA */}
          <div className="mt-14 rounded-2xl border border-border-light bg-muted-custom px-6 py-10 text-center">
            <h2 className="font-heading text-xl font-bold text-text-primary">
              コミュニティに参加しよう
            </h2>
            <p className="mt-3 text-text-muted leading-relaxed">
              まずは参加して、自己紹介から始めてみましょう。
            </p>
            <div className="mt-6 flex justify-center">
              <JoinButton isMember={isMember} />
            </div>
          </div>
        </HowToTocLayout>
      </div>
    </div>
  );
}
