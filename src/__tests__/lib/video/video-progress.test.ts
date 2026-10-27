import { describe, expect, it } from "vitest";
import {
  VIDEO_COMPLETE_PERCENT,
  VIDEO_PROGRESS_MILESTONES,
  createVideoProgressTracker,
} from "@/lib/video-progress";

describe("createVideoProgressTracker（#262）", () => {
  it("到達点は 25/50/75%、完了は 90%", () => {
    expect([...VIDEO_PROGRESS_MILESTONES]).toEqual([25, 50, 75]);
    expect(VIDEO_COMPLETE_PERCENT).toBe(90);
  });

  it("最初の再生だけ true（一時停止→再開・シーク後の再生では false）", () => {
    const tracker = createVideoProgressTracker();
    expect(tracker.play()).toBe(true);
    expect(tracker.play()).toBe(false);
    expect(tracker.play()).toBe(false);
  });

  it("再生前の位置は数えない", () => {
    const tracker = createVideoProgressTracker();
    expect(tracker.update(80, 100)).toEqual({ milestones: [], completed: false });
    tracker.play();
    expect(tracker.update(80, 100)).toEqual({
      milestones: [25, 50, 75],
      completed: false,
    });
  });

  it("各到達点は閾値を越えた瞬間に1回だけ", () => {
    const tracker = createVideoProgressTracker();
    tracker.play();
    expect(tracker.update(10, 100).milestones).toEqual([]);
    expect(tracker.update(24.9, 100).milestones).toEqual([]);
    expect(tracker.update(25, 100).milestones).toEqual([25]);
    expect(tracker.update(30, 100).milestones).toEqual([]);
    expect(tracker.update(49.99, 100).milestones).toEqual([]);
    expect(tracker.update(50, 100).milestones).toEqual([50]);
    expect(tracker.update(75.5, 100).milestones).toEqual([75]);
    expect(tracker.update(80, 100)).toEqual({ milestones: [], completed: false });
  });

  it("一気に 90% を越えたら到達点と完了を同時に返す", () => {
    const tracker = createVideoProgressTracker();
    tracker.play();
    expect(tracker.update(95, 100)).toEqual({
      milestones: [25, 50, 75],
      completed: true,
    });
  });

  it("90% 以上で完了を1回だけ返す", () => {
    const tracker = createVideoProgressTracker();
    tracker.play();
    expect(tracker.update(89.9, 100)).toEqual({
      milestones: [25, 50, 75],
      completed: false,
    });
    expect(tracker.update(90, 100)).toEqual({ milestones: [], completed: true });
    expect(tracker.update(95, 100).completed).toBe(false);
    expect(tracker.update(100, 100).completed).toBe(false);
  });

  it("シークで戻って再び越えても重複しない", () => {
    const tracker = createVideoProgressTracker();
    tracker.play();
    expect(tracker.update(60, 100).milestones).toEqual([25, 50]);
    expect(tracker.update(5, 100).milestones).toEqual([]);
    expect(tracker.update(30, 100).milestones).toEqual([]);
    expect(tracker.update(55, 100).milestones).toEqual([]);
    expect(tracker.update(76, 100).milestones).toEqual([75]);
    expect(tracker.update(92, 100).completed).toBe(true);
    expect(tracker.update(10, 100)).toEqual({ milestones: [], completed: false });
    expect(tracker.update(99, 100)).toEqual({ milestones: [], completed: false });
  });

  it("ended は未完了なら完了として1回だけ true、90% 到達後は false", () => {
    const short = createVideoProgressTracker();
    short.play();
    expect(short.end()).toBe(true);
    expect(short.end()).toBe(false);
    expect(short.update(100, 100).completed).toBe(false);

    const watched = createVideoProgressTracker();
    watched.play();
    expect(watched.update(91, 100).completed).toBe(true);
    expect(watched.end()).toBe(false);
  });

  it("長さ不明・不正な値は何も返さない", () => {
    const tracker = createVideoProgressTracker();
    tracker.play();
    const nothing = { milestones: [], completed: false };
    expect(tracker.update(10, 0)).toEqual(nothing);
    expect(tracker.update(0, 100)).toEqual(nothing);
    expect(tracker.update(Number.NaN, 100)).toEqual(nothing);
    expect(tracker.update(50, Number.POSITIVE_INFINITY)).toEqual(nothing);
  });
});
