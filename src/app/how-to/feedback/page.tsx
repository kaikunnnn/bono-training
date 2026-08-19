/**
 * フィードバックのやり方（ガイド / LP）
 * - フィードバック機能の使い方を記事風に解説する説明ページ
 * - ヘッダーのレイアウトは /feedback-apply と似た形（タイトル+ボタン、下にメインビジュアル）
 *   だが、応募先はGoogleフォーム（この機能専用。15分フィードバックの
 *   /feedback-apply/submit とは別物のため、そちらのコンポーネントは使わない）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSubscriptionStatus } from "@/lib/subscription";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe4lS_upTGN99sktg7CPFQtx3A3dgLYpvnuzspWH9lc2T2JDA/viewform?usp=header";

// このフィードバック機能はグロースプラン（planType === "feedback"）限定。
// standardプラン・非メンバー・非ログインは全て対象外
function ApplyButton({
  canApply,
  className,
}: {
  canApply: boolean;
  className?: string;
}) {
  if (canApply) {
    return (
      <Button
        asChild
        size="large"
        className={`bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold ${className ?? ""}`}
      >
        <Link href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer">
          応募する →
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
      <Link href="/subscription">グロースプランで応募 →</Link>
    </Button>
  );
}

// 見出し(40%) + 内容(60%) の並列ブロック（/feedback-apply の SectionLayout と同じ構造。
// アイコンは無し）。「おすすめ／よくない使い方」「フォームの内容について」という大見出し(h2)の中の
// 1トピック=1ブロックとして使うため、見出しは h3。
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
          <h3 className="font-rounded-mplus text-lg font-bold text-text-primary">
            {title}
          </h3>
        </div>
        <div className="md:w-[60%] py-1">{children}</div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "フィードバックのやり方",
  description:
    "BONOのフィードバックの使い方・おすすめの使い方・フォームの選び方を解説します",
  openGraph: {
    title: "フィードバックのやり方 | BONO",
    description:
      "BONOのフィードバックの使い方・おすすめの使い方・フォームの選び方を解説します",
  },
  twitter: {
    title: "フィードバックのやり方 | BONO",
    description:
      "BONOのフィードバックの使い方・おすすめの使い方・フォームの選び方を解説します",
  },
  alternates: { canonical: "/how-to/feedback" },
};

// フォーム選択肢アイテム（○○ or ××、箇条書き1項目）
function ChoiceItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <span className="font-bold text-text-primary">{label}：</span>
      <span className="text-text-secondary">{children}</span>
    </li>
  );
}

export default async function FeedbackGuidePage() {
  const subscription = await getSubscriptionStatus();
  // このフィードバックはグロースプラン（planType === "feedback"）限定。
  // standardプラン・非メンバー・非ログインは応募不可
  const canApply = subscription.planType === "feedback";

  return (
    <div className="min-h-screen">
      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダーセクション（/feedback-apply と同じレイアウト） */}
        <section className="border-b border-gray-200 pb-8 mb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            {/* 左側: タイトル + ボタン（40%幅） */}
            <div className="md:w-[40%] md:shrink-0 flex flex-col gap-3">
              <div className="space-y-4">
                <h1 className="font-rounded-mplus text-[30px] font-bold text-text-primary leading-tight">
                  フィードバックのやり方
                </h1>
                <ApplyButton canApply={canApply} className="w-fit" />
              </div>
            </div>

            {/* 右側: 説明文（60%幅） */}
            <div className="md:w-[60%] text-text-muted leading-relaxed py-4">
              <p>BONOのフィードバックは「デザイナー上司への相談」として使える仕組みです。</p>
              <p>おすすめの使い方・避けたい使い方・フォームの選び方をまとめました。</p>
            </div>
          </div>
        </section>

        {/* メインビジュアル: 静止画の代わりに使い方解説動画を使用 */}
        <section className="mb-4">
          <div
            className="relative w-full overflow-hidden rounded-[48px] border aspect-[1926/1076]"
            style={{ borderColor: "var(--blog-color-hero-bg)" }}
          >
            <iframe
              src="https://player.vimeo.com/video/1120844381"
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="成長するフィードバックの使い方"
            />
          </div>
        </section>

        {/* 本文: 「おすすめ／よくない使い方」「フォームの内容について」を大見出し(h2)にして、
            その中の各トピックを1トピック=1並列ブロック(h3)の単位で並べる */}
        <article>
          {/* おすすめの使い方 */}
          <section className="border-b border-black/[0.12] py-16">
            <TopSectionHeading badgeLabel="おすすめ" heading="おすすめの使い方" className="mb-8" />

            <div>
              <SectionBlock title="迷ったら「相談」として使おう">
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    デザインの進め方やアウトプットに自信がなくても大丈夫です。「ここから先、どう進めればいいかわからない」と思った時点で、相談として使ってください。
                  </p>
                  <p>
                    完璧である必要はありません。むしろ、自分で完成させてから持ってくるより、一度やってみて仮説がある状態で見てもらうほうがおすすめです。
                  </p>
                  <p>
                    これは実際の現場の進め方と同じです。完成してから見せるのではなく、途中の経過を共有しながら、方向性がずれていないかを確かめる。迷っているところを早めに相談して、細かくフィードバックをもらいながら進める。現場でも当たり前に行われていることです。
                  </p>
                </div>
              </SectionBlock>

              <SectionBlock title="途中でも方向性の相談で使おう">
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    考えが固まってから「実は大きくずれていた」とわかると、巻き戻しの手間が大きくなります。だから、まとまりきっていなくてもかまいません。「今の方向、良くないかもしれない」と感じた時点で、方向性の相談として使ってください。
                  </p>
                  <p>
                    コンテンツを一度見ただけで、すぐにできるようになる人はほとんどいません。大きくずれてダメージを受けるより、途中で細かく相談したほうが軽く進めます。これも現場のやり方です。
                  </p>
                </div>
              </SectionBlock>

              <SectionBlock title="定期デザインチェックとして使おう" bordered={false}>
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    今の状態を定期的に見てもらう。これを強くおすすめします。現場では確実にやることだからです。
                  </p>
                  <p>
                    一人だけの視点でデザインを進めることは、実はあまりありません。大きくずれる前に細かく相談し、フィードバックをもらいながら進める。そのほうが、あとから大量に指摘されるより、少しずつ自分で試しながら身につけられます。
                  </p>
                </div>
              </SectionBlock>
            </div>
          </section>

          {/* よくない使い方 */}
          <section className="border-b border-black/[0.12] py-16">
            <TopSectionHeading badgeLabel="注意" heading="よくない使い方" className="mb-8" />

            <div>
              <SectionBlock title="完璧にしてから見せるのは良くない">
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    よほどの理由がない限り、完全に仕上げてから相談すると、たいてい大量の改善ポイントが返ってきます。方向性が合っていれば問題はありません。ただ、ずれていたときの修正量とダメージが、とても大きくなってしまいます。
                  </p>
                  <p>
                    現場では、早めにパターンを出してチームに共有し、方向性を決めながら進めるのが普通です。小さい単位で相談する、確認する、疑問を持って進める。このやり方を身につけておくと、ずっと楽になります。
                  </p>
                </div>
              </SectionBlock>

              <SectionBlock title="なんか言われたくないから見せない">
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    あれこれ言われたくない、という気持ちは自然です。でも、「言われたくないから完璧にしてから見せる」は、進め方としてはあまり良くありません。
                  </p>
                  <p>
                    現場でも、恥ずかしさはありつつ、途中のアウトプットを共有して早めにフィードバックをもらいます。そのほうが、ずれずに進む確率が上がるからです。完璧にしてから出したい気持ちはわかります。それでも、途中で見せるほうが自然で、うまくいきます。
                  </p>
                </div>
              </SectionBlock>

              <SectionBlock title="考えてないけど答えが欲しい" bordered={false}>
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    「とりあえずやったけど、よくわからないから答えを教えてほしい」。この気持ちで来るのも、あまりおすすめしません。
                  </p>
                  <p>
                    デザインで一番大事なのは、結果を再現できることではありません。そこに至るプロセスを自分で組み立て、試し、良くしていけるかどうかです。だからフィードバックでも、答えそのものは渡しません。やり方や捉え方、どこが良くないか、どうすればもっと良くなるか。その視点で返すようにしています。
                  </p>
                  <p>
                    できる範囲でかまいません。フィードバックを受ける前に、今の自分の考えを箇条書きで簡単にまとめておいてください。その上で、合っているところ、ずれているところを確認する。それが、成長を早くします。
                  </p>
                </div>
              </SectionBlock>
            </div>
          </section>

          {/* フォームの内容について */}
          <section className="py-16">
            <TopSectionHeading
              badgeLabel="フォームの選び方"
              heading="フォームの内容について"
              className="mb-8"
            />

            <div>
              <SectionBlock title="全体 or フォーカス">
                <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
                  <ChoiceItem label="全体">
                    今のアウトプットが正しい方向かをざっくり見てほしい人向け。プロトタイプ全体を見て、直したほうが良いポイントにコメントをつけます。全体を見る分、詳しい解説の時間は取れません。
                  </ChoiceItem>
                  <ChoiceItem label="フォーカス">
                    特定の箇所についてきちんとフィードバックを受けて理解を深めたい人向け。アウトプットの中から最大2箇所を指定して、その部分について詳しく相談・フィードバックを受けられます。問題点や改善に必要なことをできるだけ詳しく解説し、次につながるToDoを作ることを目標に添削します。
                  </ChoiceItem>
                </ul>
              </SectionBlock>

              <SectionBlock title="通常 or オンライン">
                <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
                  <ChoiceItem label="通常">
                    基本的にテキストベースのフィードバックです。時間が限られるため「改善したほうが良い箇所」を中心に指摘します。一方通行なので、テキストを理解して自分で改善する必要がありますが、その分広い範囲を見てもらえる可能性が高くなります。
                  </ChoiceItem>
                  <ChoiceItem label="オンライン通話">
                    50分の通話でフィードバックや相談、質問ができる双方向のスタイルです。広いトピックを扱うのは苦手ですが、質問しながら「何が伸びしろか」「改善すべきポイントは何か」を相談できます。定期的に利用して相談や質問の場として使うのもおすすめです。
                  </ChoiceItem>
                </ul>
              </SectionBlock>

              <SectionBlock title="公開 or 非公開" bordered={false}>
                <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
                  <ChoiceItem label="公開">
                    BONO限定のコンテンツとして、解説コンテンツになる可能性があります。
                  </ChoiceItem>
                  <ChoiceItem label="非公開">
                    動画などとして公開されることはなく、コメントいただければコミュニティに公開せずDMなどで添削内容を共有します。
                  </ChoiceItem>
                </ul>
              </SectionBlock>
            </div>
          </section>
        </article>

        {/* ボトムCTA */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-muted-custom px-6 py-10 text-center">
          <h2 className="font-rounded-mplus text-xl font-bold text-text-primary">
            フィードバックを使ってみよう
          </h2>
          <p className="mt-3 text-text-muted leading-relaxed">
            相談したいことを整理して、応募してみましょう。
          </p>
          <div className="mt-6 flex justify-center">
            <ApplyButton canApply={canApply} />
          </div>
        </div>
      </main>
    </div>
  );
}
