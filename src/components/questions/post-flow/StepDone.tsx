"use client";

/**
 * Step3 投稿完了画面（#139 スライス5）
 *
 * Figma仕様: 掲示板：投稿フロー修正_Figma仕様.md（STEP3 完了 95:776）
 * - 内側センタリングブロック（チェック56px + ARIGATO + 完了テキスト + サブ）
 * - ボタン群（プライマリ「投稿を確認する」/ テキストリンク「一覧へ戻る」）
 * - アニメ: チェックのポップイン → ARIGATO 1文字ずつ → 残りフェードイン
 *   （keyframes は StepDone.module.css。生CSSはグローバルに追加しない）
 *
 * 色/角丸は DSトークン対応表のクラスのみ使用（生hex/rgb禁止）。
 */

import Link from "next/link";
import styles from "./StepDone.module.css";
import { Confetti } from "./Confetti";

/** ARIGATO 見出し。絵文字も1文字カウントするため Array.from でコードポイント分割する。 */
const ARIGATO = Array.from("🙌ARIGATO🙌");

/** 1文字ごとの出現間隔（ms） */
const CHAR_STAGGER_MS = 70;
/** チェック描画＋フラッシュ完了後、最初の文字が出るまでの遅延（ms・#143で調整） */
const CHARS_START_MS = 650;
/** 文字列出現後、残りブロックがフェードインし始めるまでの遅延（ms） */
const REVEAL_GAP_MS = 120;

// 全文字が出そろう時刻。以降のブロックはこれを基準に順次フェードイン。
const CHARS_END_MS = CHARS_START_MS + ARIGATO.length * CHAR_STAGGER_MS;

interface StepDoneProps {
  /** 投稿詳細の slug。「投稿を確認する」の遷移先に使う */
  slug?: string;
  /** プレビュー: slug が実在しないため「投稿を確認する」も一覧へ向ける */
  isPreview?: boolean;
}

export function StepDone({ slug, isPreview }: StepDoneProps) {
  // preview（または slug 欠落）では詳細が存在しないので一覧へフォールバック。
  const confirmHref = isPreview || !slug ? "/questions" : `/questions/${slug}`;

  return (
    <div className="flex flex-col gap-8">
      {/* 内側センタリングブロック */}
      <div className="flex flex-col items-center gap-3 p-6 text-center">
        {/* チェックアイコン 56px（丸サークル出現→パス描画→白フラッシュ・花吹雪） */}
        <div className={`${styles.iconWrap} relative size-14`} aria-hidden="true">
          {/* 花吹雪はアイコン中心を基点に放射状バースト（背後レイヤー） */}
          <Confetti />
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            className="relative block text-foreground"
          >
            {/* 丸サークル: currentColor の線（既存と同じ黒系・border-2 相当 2px） */}
            <circle
              className={styles.circle}
              cx="28"
              cy="28"
              r="26"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* チェックパス: pathLength=1 で stroke-dasharray 描画を長さ非依存に */}
            <path
              className={styles.check}
              d="M17 28.5L24.5 36L39 21"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
          </svg>
          {/* 白フラッシュ: アイコン上に重ねる角丸オーバーレイ */}
          <span className={styles.flash} />
        </div>

        {/* 🙌ARIGATO🙌（1文字ずつ左から出現・絵文字も1文字） */}
        <p
          className="text-[20px] font-bold tracking-[7px] text-foreground"
          aria-label="ARIGATO"
        >
          {ARIGATO.map((ch, i) => (
            <span
              key={i}
              className={styles.char}
              style={{ animationDelay: `${CHARS_START_MS + i * CHAR_STAGGER_MS}ms` }}
              aria-hidden="true"
            >
              {ch}
            </span>
          ))}
        </p>

        {/* 完了テキスト */}
        <p
          className={`${styles.reveal} text-[20px] font-bold text-foreground`}
          style={{ animationDelay: `${CHARS_END_MS + REVEAL_GAP_MS}ms` }}
        >
          投稿が完了しました！
        </p>

        {/* サブテキスト */}
        <p
          className={`${styles.reveal} text-[14px] text-foreground`}
          style={{ animationDelay: `${CHARS_END_MS + REVEAL_GAP_MS * 2}ms` }}
        >
          デザインの話が増えることが誰かの助けにもなるはずです👼
        </p>
      </div>

      {/* ボタン群（デスクトップは左右に余白） */}
      <div
        className={`${styles.reveal} flex flex-col gap-4 sm:px-24`}
        style={{ animationDelay: `${CHARS_END_MS + REVEAL_GAP_MS * 3}ms` }}
      >
        <Link
          href={confirmHref}
          className="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-primary text-[14px] text-primary-foreground transition-opacity hover:opacity-90"
        >
          投稿を確認する
        </Link>
        <Link
          href="/questions"
          className="inline-flex h-10 w-full items-center justify-center text-[14px] text-text-link hover:underline"
        >
          一覧へ戻る
        </Link>
      </div>
    </div>
  );
}
