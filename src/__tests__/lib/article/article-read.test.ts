import { describe, expect, it } from "vitest";
import {
  ARTICLE_READ_PERCENT,
  ARTICLE_READ_SECONDS,
  bodyDepthFraction,
  createArticleReadTracker,
} from "@/lib/article-read";

const S = 1000;

describe("bodyDepthFraction（#262 article_read）", () => {
  it("画面の下端が本文の上から何割の位置にあるか", () => {
    // 本文が画面の下（top=1000, 画面800）→ 0
    expect(bodyDepthFraction(1000, 2000, 800)).toBe(0);
    // 本文の上端が画面上端、本文2000・画面800 → 40%
    expect(bodyDepthFraction(0, 2000, 800)).toBeCloseTo(0.4);
    // 600 スクロール（top=-600）→ 1400/2000 = 70%
    expect(bodyDepthFraction(-600, 2000, 800)).toBeCloseTo(0.7);
  });

  it("本文が画面より短く全部見えているときは 1、範囲外は 0〜1 に収める", () => {
    expect(bodyDepthFraction(100, 300, 800)).toBe(1);
    expect(bodyDepthFraction(-5000, 2000, 800)).toBe(1);
  });

  it("高さ0・不正値は 0", () => {
    expect(bodyDepthFraction(0, 0, 800)).toBe(0);
    expect(bodyDepthFraction(NaN, 100, 800)).toBe(0);
    expect(bodyDepthFraction(0, 100, 0)).toBe(0);
  });
});

describe("createArticleReadTracker（#262 article_read）", () => {
  it("しきい値は本文70%・30秒", () => {
    expect(ARTICLE_READ_PERCENT).toBe(70);
    expect(ARTICLE_READ_SECONDS).toBe(30);
  });

  it("70% に届いても30秒たつまでは読んだにならない", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    t.depth(0.9);
    expect(t.depthReached).toBe(true);
    expect(t.check(29.9 * S)).toBeNull();
    expect(t.check(30 * S)).toEqual({ percent: 90, seconds: 30 });
  });

  it("30秒たっても 70% 未満なら読んだにならない（速く読み飛ばさず途中で止まった）", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    t.depth(0.69);
    expect(t.depthReached).toBe(false);
    expect(t.check(120 * S)).toBeNull();
    // あとから 70% に届いた時点で成立（順番はどちらが先でもよい）
    t.depth(0.7);
    expect(t.check(121 * S)).toEqual({ percent: 70, seconds: 121 });
  });

  it("一番深い位置を覚える（戻るスクロールで減らない）", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    t.depth(0.8);
    t.depth(0.2);
    expect(t.check(31 * S)?.percent).toBe(80);
  });

  it("1ページ表示につき1回だけ", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    t.depth(1);
    expect(t.check(30 * S)).not.toBeNull();
    expect(t.done).toBe(true);
    expect(t.check(60 * S)).toBeNull();
    t.depth(1);
    expect(t.check(90 * S)).toBeNull();
  });

  it("タブが裏の時間は数えない", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    t.depth(1);
    t.visibility(true, 10 * S); // 10秒見て裏へ
    expect(t.remainingMs(100 * S)).toBe(Infinity);
    expect(t.check(100 * S)).toBeNull();
    t.visibility(false, 100 * S); // 90秒後に戻る
    expect(t.remainingMs(100 * S)).toBe(20 * S);
    expect(t.check(119 * S)).toBeNull();
    expect(t.check(120 * S)).toEqual({ percent: 100, seconds: 30 });
  });

  it("裏で開いたタブは表に来てから数え始める", () => {
    const t = createArticleReadTracker({ startMs: 0, hidden: true });
    t.depth(1);
    expect(t.check(60 * S)).toBeNull();
    t.visibility(false, 60 * S);
    expect(t.check(89 * S)).toBeNull();
    expect(t.check(90 * S)).not.toBeNull();
  });

  it("同じ状態の visibility が続いても二重に数えない", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    t.visibility(false, 5 * S);
    t.visibility(true, 10 * S);
    t.visibility(true, 20 * S);
    t.visibility(false, 30 * S);
    // 表にいたのは 0〜10秒 と 30秒〜
    expect(t.remainingMs(30 * S)).toBe(20 * S);
  });

  it("remainingMs は満たしていれば 0", () => {
    const t = createArticleReadTracker({ startMs: 0 });
    expect(t.remainingMs(10 * S)).toBe(20 * S);
    expect(t.remainingMs(40 * S)).toBe(0);
  });
});
