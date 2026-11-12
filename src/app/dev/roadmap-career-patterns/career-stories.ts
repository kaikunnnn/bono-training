/**
 * 試作で使う「転職した人」の文言（#282）
 *
 * 文言の出典は rebono/issues/282 の「実例に使える人の候補」（インタビュー本文そのまま）。
 * 写真だけ Sanity の story から読む（読み取りのみ）。
 */

export interface CareerStoryDef {
  slug: string;
  /** 表示名。名前が未確定の人は null（「（名前確認中）」＋仮札を出す） */
  displayName: string | null;
  before: string;
  after: string;
  quote: string;
  /** 写真の取り方。profile = person.profileImageUrl / hero = story の heroImageUrl */
  photoSource: "profile" | "hero";
}

export const CAREER_STORIES: CareerStoryDef[] = [
  {
    slug: "dokugaku-kangaete-tsukuru-graphic-uiux-koji",
    displayName: "こじさん",
    before: "美容系の会社のグラフィックデザイナー（3年）",
    after: "業務系サービスのUI/UXデザイナー",
    quote: "やっぱりデザイナーなので、ポートフォリオが大事だなと思います。",
    photoSource: "profile",
  },
  {
    slug: "sobo-selfregi-uiux-dai",
    displayName: "Daiさん",
    before: "販売職・事務職",
    after: "BtoCアプリ事業会社のUI/UXデザイナー",
    quote: "やっぱりアウトプットはやっててよかったなっていうふうに思います。",
    photoSource: "profile",
  },
  {
    // Sanity の名前（Hanzoさん）と本文（Keijiさん）が食い違うため、確認まで名前を出さない
    slug: "youhadouyatedezainanihanzo-copy",
    displayName: null,
    before: "メーカーの海外営業 → ウェブ運用会社",
    after: "UI/UXデザイナー",
    quote:
      "ポートフォリオの内容としてはBONOのロードマップで作成した、音声SNS、情報設計、ゼロからサービスを掲載したり…",
    photoSource: "hero",
  },
];

/** 画面に渡す形（写真URLを解決済み） */
export interface CareerStoryView extends CareerStoryDef {
  photoUrl: string | null;
}
