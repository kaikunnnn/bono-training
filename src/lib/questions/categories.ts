/**
 * 掲示板（/questions）カテゴリ定義。
 *
 * この定数が「並び順・絵文字・分岐（post / contact）」の唯一の正（source of truth）。
 *
 * - Sanity 側の `questionCategory` ドキュメントの `order` / `title` は、
 *   `scripts/migrate-question-categories.mjs` がこの定数に合わせて同期する。
 * - Sanity Studio だけを手動で書き換えないこと。ズレたらこの定数を直し、
 *   移行スクリプトを再実行して合わせる。
 * - `kind: 'contact'`（例: BONOのバグ・質問）は投稿させず問い合わせへ誘導する分岐。
 *   Sanity には対応する `questionCategory` ドキュメントを作らない（移行スクリプトも書かない）。
 */

export interface BoardCategoryDef {
  /** Sanity questionCategory の slug と一致（contact 種別は Sanity に存在しない） */
  slug: string;
  /** 表示用絵文字（Figma準拠） */
  emoji: string;
  /** 表示名 */
  label: string;
  /** 表示順（この定数が唯一の正。Sanity の order は移行スクリプトが同期する） */
  order: number;
  /** contact = 投稿させず問い合わせへ誘導する分岐（BONOのバグ・質問） */
  kind: 'post' | 'contact';
}

/** 「BONOのバグ・質問」分岐から誘導するお問い合わせフォーム（#139で確定） */
export const CONTACT_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfUE-AYkZsepc8NfDGO5FtPnHJI77-iMIMnx6KxSfgWVaUgOA/viewform?usp=header";

export const BOARD_CATEGORIES: BoardCategoryDef[] = [
  { slug: 'zatsudan',       emoji: '💭', label: '雑談・デザイン全般', order: 1, kind: 'post' },
  { slug: 'design-process', emoji: '🏃', label: 'デザインの進め方',   order: 2, kind: 'post' },
  { slug: 'tools',          emoji: '🔨', label: 'ツールの使い方',     order: 3, kind: 'post' },
  { slug: 'ui',             emoji: '🧑‍💻', label: 'UIとデザイン',       order: 4, kind: 'post' },
  { slug: 'career',         emoji: '🧳', label: 'キャリア・転職',     order: 5, kind: 'post' },
  { slug: 'bono-bug',       emoji: '❓', label: 'BONOのバグ・質問',   order: 6, kind: 'contact' },
];
