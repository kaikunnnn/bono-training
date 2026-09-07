/**
 * プレーンテキスト（マークダウン風記法）を書式付きで描画する共有コンポーネント（#146 T20）。
 *
 * 用途:
 * 1. コメント本文の表示（保存はプレーンのまま、表示時にだけ書式適用）
 * 2. 投稿フォームのプレビュー表示
 *
 * 見た目は詳細ページ本文（ptComponents）の流儀に合わせる:
 * - h3 = font-bold の見出し
 * - listItem = ul / li の箇条書き
 * - strong = font-bold
 * - テキストラン中の http/https URL は linkifyText で自動リンク化
 *
 * Server / Client どちらからも描画可能（状態・イベントを持たない純表示）。
 */

import { Fragment, type ReactNode } from "react";
import {
  parseFormattedText,
  type FormattedBlock,
  type InlineRun,
} from "@/lib/questions/text-format";
import { linkifyText } from "@/lib/questions/linkify";

// 詳細ページ（page.tsx）の DS_LINK_CLASS と同一のリンクスタイル
const DS_LINK_CLASS = "text-text-link underline break-all";

/** テキストラン内の URL を自動リンク化して描画 */
function renderLinkified(text: string, keyPrefix: string): ReactNode {
  const segments = linkifyText(text);
  if (segments.length === 1 && segments[0].type === "text") {
    return segments[0].value;
  }
  return segments.map((seg, i) => {
    if (seg.type === "link") {
      return (
        <a
          key={`${keyPrefix}-${i}`}
          href={seg.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={DS_LINK_CLASS}
        >
          {seg.label}
        </a>
      );
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{seg.value}</Fragment>;
  });
}

/** 1 行分のインラインランを描画（strong は太字、text は自動リンク化） */
function renderRuns(runs: InlineRun[], keyPrefix: string): ReactNode {
  return runs.map((run, i) => {
    const key = `${keyPrefix}-run-${i}`;
    if (run.type === "strong") {
      return (
        <strong key={key} className="font-bold">
          {renderLinkified(run.text, key)}
        </strong>
      );
    }
    return <Fragment key={key}>{renderLinkified(run.text, key)}</Fragment>;
  });
}

interface FormattedTextProps {
  text: string;
  /** ルート要素の追加クラス（余白調整など） */
  className?: string;
}

export function FormattedText({ text, className }: FormattedTextProps) {
  const blocks = parseFormattedText(text);

  return (
    <div className={className}>
      {renderBlocks(blocks)}
    </div>
  );
}

/**
 * ブロック配列を描画する。連続する listItem は 1 つの ul にまとめる。
 */
function renderBlocks(blocks: FormattedBlock[]): ReactNode {
  const out: ReactNode[] = [];
  let listBuffer: FormattedBlock[] = [];

  const flushList = (keyIndex: number) => {
    if (listBuffer.length === 0) return;
    out.push(
      <ul key={`ul-${keyIndex}`} className="my-3 list-disc pl-6">
        {listBuffer.map((li, i) => (
          <li key={`li-${keyIndex}-${i}`} className="my-1">
            {renderRuns(li.runs, `li-${keyIndex}-${i}`)}
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  blocks.forEach((block, index) => {
    if (block.type === "listItem") {
      listBuffer.push(block);
      return;
    }
    flushList(index);
    if (block.type === "h3") {
      out.push(
        <h3 key={`h3-${index}`} className="mt-6 mb-2 text-lg font-bold">
          {renderRuns(block.runs, `h3-${index}`)}
        </h3>,
      );
    } else {
      out.push(
        <p
          key={`p-${index}`}
          className="my-3 whitespace-pre-line text-foreground"
        >
          {renderRuns(block.runs, `p-${index}`)}
        </p>,
      );
    }
  });

  flushList(blocks.length);
  return out;
}
