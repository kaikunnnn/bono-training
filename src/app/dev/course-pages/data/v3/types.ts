/**
 * data v3 ＝ 個別ロードマップ4本をコースに置き換えた中身 — #300
 *
 * 1コース＝ベース（Course。v2 の項目つき）＋名前の2案（a / b）。
 * 名前に連動して変わるのは NameVariant の項目だけ。章・FAQ などはベースを共通で使う。
 * resolveCourse(entry, name) で、選んだ名前の項目をベースに重ねた Course を作り、v2 のテンプレートに渡す。
 */

import type { Course, CourseFaqItem, Field } from "../types";

export type NameKey = "a" | "b";

export interface NameVariant {
  /** 正式タイトル（「：」の前が主見出し、後ろがサブ行） */
  title: Field;
  /** ヒーロー直下「こんな人向け」1行 */
  audienceLine: Field;
  /** 得られる変化 */
  change: Field;
  /** 一覧カードの1行 */
  cardLine: Field;
  /** FAQ の「向いていない人」 */
  notFor: CourseFaqItem;
}

export interface CourseV3Entry {
  /** 置き換える元のロードマップ（Sanity の slug） */
  roadmapSlug: string;
  base: Course;
  names: Record<NameKey, NameVariant>;
}
