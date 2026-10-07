/**
 * /dev/event-registration-patterns — 申込済みカードの見せ方の比較（#218 フォローアップ）
 *
 * 本番の申込カード（EventOnsiteRegistration）は変えずに、提案パターンをここで並べて比べる。
 * すべてモックデータと手元の state で動く（Server Actions・DB・Sanity には触れない）。
 */

import { Metadata } from "next";
import Link from "next/link";
import RichTextSection from "@/components/article/RichTextSection";
import { CancelFlowDemo, FullPageDemo, OwnRowListDemo, PatternDemo } from "./demos";
import { LabeledAvatarStrip } from "./parts";
import { MOCK_CONTENT, stripAvatars } from "./mock";

export const metadata: Metadata = {
  title: "申込済みカードのパターン比較 (/dev/event-registration-patterns)",
  robots: { index: false, follow: false },
};

const LIST_ANCHOR = "own-row-list";

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-4 border-b border-gray-200 pb-2">
      <h2 className="font-rounded-mplus text-lg font-bold text-text-primary">
        {title}
      </h2>
      {note && (
        <p className="mt-1 font-noto-sans-jp text-xs leading-relaxed text-text-primary/60">
          {note}
        </p>
      )}
    </div>
  );
}

function PatternHeading({
  title,
  recommended,
  children,
}: {
  title: string;
  recommended?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="flex flex-wrap items-center gap-2 text-base font-bold text-text-primary">
        {title}
        {recommended && <RecommendedBadge />}
      </h3>
      <p className="text-xs leading-relaxed text-text-primary/60">{children}</p>
    </div>
  );
}

function RecommendedBadge() {
  return (
    <span className="rounded-full bg-success-feedback px-2 py-0.5 text-[11px] font-bold text-text-success">
      おすすめ
    </span>
  );
}

function StripCell({
  count,
  variant,
}: {
  count: number;
  variant: "right-label" | "left-label";
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-base p-4">
      <span className="self-start rounded-full bg-muted-custom px-2 py-0.5 text-xs text-text-secondary">
        {count}人
      </span>
      <div className="flex min-h-[40px] items-center justify-center">
        <LabeledAvatarStrip
          count={count}
          avatarUrls={stripAvatars(count)}
          variant={variant}
        />
      </div>
    </div>
  );
}

const STRIP_COUNTS = [1, 2, 4, 5, 12];

export default function Page() {
  const body = <RichTextSection content={MOCK_CONTENT} />;

  return (
    <div className="min-h-screen bg-base">
      <div className="mx-auto w-full min-w-0 max-w-[1080px] px-4 py-12 sm:px-6">
        <header className="mb-10 border-b border-gray-200 pb-4">
          <p className="font-noto-sans-jp text-sm font-bold text-text-primary/50">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            /{" "}
            <Link href="/dev/event-registration" className="underline hover:text-text-primary">
              #218 申込UIの状態一覧
            </Link>{" "}
            / 申込済みの見せ方
          </p>
          <h1 className="mt-1 font-rounded-mplus text-2xl font-bold text-text-primary">
            申込済みカードのパターン比較
          </h1>
          <p className="mt-2 font-noto-sans-jp text-sm leading-relaxed text-text-primary/60">
            申込後のカードには自分のコメントを出さず（下の参加者一覧に出ているため）、コメントの編集は一覧の自分の行で行う案です。
            「参加を取り消す」は ⋯ メニューの中に入れ、確認モーダルを挟みます。本番のページはまだ変えていません。
            すべてモックで、ボタンを押しても何も送信しません。
          </p>
        </header>

        <div className="flex flex-col gap-16">
          {/* 1. パターン比較 */}
          <section className="flex flex-col gap-10">
            <SectionHeading
              title="1. 申込済みカードのパターン（PC 640px / スマホ 343px）"
              note="どのパターンも、上のアイコン列に自分が入り「5人が参加中」に変わる（本人以外4人のモック）。⋯ →「参加を取り消す」→ 確認モーダル →「取り消す」で未申込のカードに戻る。"
            />

            <div className="flex flex-col gap-4">
              <PatternHeading title="P1 「参加中」カード" recommended>
                カードの形はそのまま、帯を「✓ 参加中」にして右端に ⋯。本文は自分のアイコンと名前＋次にやること（キックオフの日時）。
                申込前と同じ位置・同じ大きさのカードなので、押した結果がその場で分かる。コメントの編集先は小さなリンクで一覧へ案内する。
              </PatternHeading>
              <PatternDemo pattern="p1" commentsHref={`#${LIST_ANCHOR}`} />
            </div>

            <div className="flex flex-col gap-4">
              <PatternHeading title="P2 無効ボタン「申込済み」">
                帯は「参加はこちら」のまま、ボタンが押せない「✓ 申込済み」に変わる。グレー＋半透明だと「条件を満たしていない・壊れている」に見えるため、
                成功の薄い緑（bg-success-feedback / text-text-success）にして「完了」と読めるようにした。横に ⋯。
                申込前と形がほぼ同じなので変化に気づきにくく、押せないボタンが一番目立つのが弱点。
              </PatternHeading>
              <PatternDemo pattern="p2" />
            </div>

            <div className="flex flex-col gap-4">
              <PatternHeading title="P3 コンパクト1行">
                カードをなくし、アイコン列の下に「✓ 参加中」＋自分のアイコン＋ ⋯ の1行だけ。ページが一番すっきりする。
                その代わり、申込直後に大きなカードが小さな1行に縮むので、押した場所から表示が飛んで見える。次の予定（キックオフ）も出せない。
              </PatternHeading>
              <PatternDemo pattern="p3" />
            </div>
          </section>

          {/* 2. ⋯ メニュー → 取り消しモーダル */}
          <section>
            <SectionHeading
              title="2. ⋯ メニュー → 取り消しの確認モーダル（P1）"
              note="⋯ はキーボードの Tab で届き、Enter / Space でメニューが開く（矢印キーで項目を移動）。モーダルは既存の Modal（Esc・「やめる」で閉じる。開いている間はフォーカスがモーダルの中に留まる）。受付終了後は、取り消すと「受付終了」のカードに変わり、再申込できない。"
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-dashed border-gray-300 bg-base p-4">
                <span className="self-start rounded-full bg-muted-custom px-2 py-0.5 text-xs text-text-secondary">
                  受付中
                </span>
                <CancelFlowDemo closed={false} />
              </div>
              <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-dashed border-gray-300 bg-base p-4">
                <span className="self-start rounded-full bg-muted-custom px-2 py-0.5 text-xs text-text-secondary">
                  受付終了後（取り消すと再申込できない）
                </span>
                <CancelFlowDemo closed />
              </div>
            </div>
          </section>

          {/* 3. コメント一覧（本人の行で編集） */}
          <section>
            <SectionHeading
              title="3. 参加者のコメント一覧で、自分のコメントを編集"
              note="並びは新しい申込順のまま（自分の行を先頭に移さない）。自分の行にだけ「あなた」バッジと ⋯。⋯ →「コメントを編集」でその場で1行入力（300字まで・280字から残り文字数を表示）。Enter で保存、Esc か「やめる」で元に戻る。ほかの人の行には ⋯ を出さない。"
            />
            <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-dashed border-gray-300 bg-base p-4">
              <OwnRowListDemo id={LIST_ANCHOR} />
            </div>
          </section>

          {/* 4. アイコン列のラベル */}
          <section className="flex flex-col gap-8">
            <SectionHeading
              title="4. 参加者アイコン列のラベル"
              note="いまは1〜4人だとアイコンだけで、何の列か分からない。人数にかかわらず必ず文字を添える。"
            />
            <div className="flex flex-col gap-3">
              <PatternHeading title="A. アイコンの右に「参加中」/「N人が参加中」" recommended>
                1〜4人は「参加中」、5人以上は「N人が参加中」。いまの5人以上の表示はそのままで、4人以下に一言足すだけ。左右の幅が短く、スマホでも1行に収まる。
              </PatternHeading>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {STRIP_COUNTS.map((n) => (
                  <StripCell key={n} count={n} variant="right-label" />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <PatternHeading title="B. 左に「参加中のメンバー」＋アイコン（5人以上は「ほかN人」）">
                何の列かは一番はっきりするが、総人数が文字で出ない（「ほか8人」から足し算が要る）。横に長くなり、狭い幅では折り返す。
              </PatternHeading>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {STRIP_COUNTS.map((n) => (
                  <StripCell key={n} count={n} variant="left-label" />
                ))}
              </div>
            </div>
          </section>

          {/* 5. ページ全体 */}
          <section>
            <SectionHeading
              title="5. ページ全体の並び（P1・申込済み）"
              note="タイトル → アイコン列 → 参加中カード → サムネイル → 本文（本物の RichTextSection）→ 参加者のコメント（自分の行で編集）→ 下部のアイコン列＋カード。上下のカードと一覧は同じ状態を共有する（取り消すと一覧からも消え、申込し直すと一覧の先頭に入る）。スマホ枠は画面幅に関係なくスマホの文字サイズで出す（本文だけは画面幅に従う）。"
            />
            <div className="flex flex-col items-start gap-8">
              <div className="flex w-full min-w-0 flex-col gap-2">
                <span className="text-sm font-bold text-text-secondary">PC</span>
                <FullPageDemo mobile={false} body={body} listId="full-list-desktop" />
              </div>
              <div className="flex w-full min-w-0 max-w-[375px] flex-col gap-2">
                <span className="text-sm font-bold text-text-secondary">スマホ（375px）</span>
                <FullPageDemo mobile body={body} listId="full-list-mobile" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
