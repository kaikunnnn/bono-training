/**
 * 本番ルーティングの期待値（#258）。
 *
 * 正は同じフォルダの routing-expectations.json。bash スクリプト（prod-check）からも
 * 読めるよう JSON に置き、ここは型を付けて re-export するだけ（二重管理しない）。
 */
import data from "./routing-expectations.json";

export type CookieMode = "none" | "dummy";

export type RouteExpectation = {
  id: string;
  path: string;
  cookie: CookieMode;
  /** 数値なら完全一致、"3xx" なら 300〜399 のどれか */
  expectStatus: number | "3xx";
  /** location ヘッダの完全一致（origin を除いたパス＋クエリで比較） */
  expectLocation?: string;
  /** location ヘッダの前方一致 */
  expectLocationPrefix?: string;
  /** 現状この期待を満たさない既知の問題。テストは test.fail() で書く */
  knownIssue?: string;
};

export type RegionExpectation = {
  path: string;
  cookie: CookieMode;
  expectRegion: string;
};

export type HtmlMustNotContain = {
  path: string;
  cookie: CookieMode;
  text: string;
};

type RoutingExpectations = {
  dummyAuthCookie: string;
  routes: RouteExpectation[];
  region: RegionExpectation;
  htmlMustNotContain: HtmlMustNotContain[];
};

const expectations = data as RoutingExpectations;

export const DUMMY_AUTH_COOKIE = expectations.dummyAuthCookie;
export const ROUTE_EXPECTATIONS = expectations.routes;
export const REGION_EXPECTATION = expectations.region;
export const HTML_MUST_NOT_CONTAIN = expectations.htmlMustNotContain;

/** cookie モードに応じたリクエストヘッダ */
export function headersFor(cookie: CookieMode): Record<string, string> {
  return cookie === "dummy" ? { cookie: DUMMY_AUTH_COOKIE } : {};
}
