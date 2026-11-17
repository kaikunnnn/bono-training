/**
 * v3 の確認用の切り替え（画面下のバーに出す）— #300
 *
 * 名前の案 ?name=a|b（既定 a）／状態 ?state=guest|member（既定 guest）／ヒーロー ?hero=01〜04（既定 01。コースページだけ）
 *
 * ヒーローの「前の形（v2）」は出さない（v2 ヒーローのパンくずが v1 のページを指していて、v3 の slug では 404 になるため）。
 */

import type { PreviewSegment } from "../template/kari";
import type { NameKey } from "../data/v3";

export type V3State = "guest" | "member";

export function parseState(value: string | undefined): V3State {
  return value === "member" ? "member" : "guest";
}

export function nameSegment(name: NameKey): PreviewSegment {
  return {
    label: "名前",
    param: "name",
    value: name,
    defaultValue: "a",
    options: [
      { value: "a", label: "a 検索の言葉" },
      { value: "b", label: "b 対象つき" },
    ],
  };
}

export function stateSegment(state: V3State): PreviewSegment {
  return {
    label: "状態",
    param: "state",
    value: state,
    defaultValue: "guest",
    options: [
      { value: "guest", label: "未課金" },
      { value: "member", label: "課金後" },
    ],
  };
}

export const V3_HEROES = ["01", "02", "03", "04"] as const;
export type V3Hero = (typeof V3_HEROES)[number];
export const V3_HERO_DEFAULT: V3Hero = "01";

export function parseHero(value: string | undefined): V3Hero {
  return V3_HEROES.find((h) => h === value) ?? V3_HERO_DEFAULT;
}

export function heroSegment(hero: V3Hero): PreviewSegment {
  return {
    label: "ヒーロー",
    param: "hero",
    value: hero,
    defaultValue: V3_HERO_DEFAULT,
    options: [
      { value: "01", label: "01" },
      { value: "02", label: "02" },
      { value: "03", label: "03" },
      { value: "04", label: "04" },
    ],
  };
}
