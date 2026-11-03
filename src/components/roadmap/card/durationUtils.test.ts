import { describe, it, expect } from "vitest";
import { parseDuration } from "./durationUtils";

describe("parseDuration", () => {
  it("数値だけなら従来どおり「ヶ月」を付ける", () => {
    expect(parseDuration("6-9")).toEqual({ prefix: "", value: "6-9", unit: "ヶ月" });
    expect(parseDuration("12")).toEqual({ prefix: "", value: "12", unit: "ヶ月" });
  });

  it("「約1年」を約 / 1 / 年 に分ける", () => {
    expect(parseDuration("約1年")).toEqual({ prefix: "約", value: "1", unit: "年" });
  });

  it("「約6ヶ月」を約 / 6 / ヶ月 に分ける", () => {
    expect(parseDuration("約6ヶ月")).toEqual({ prefix: "約", value: "6", unit: "ヶ月" });
  });

  it("範囲＋年を扱える", () => {
    expect(parseDuration("1-2年")).toEqual({ prefix: "", value: "1-2", unit: "年" });
  });

  it("前後の空白は無視する", () => {
    expect(parseDuration(" 6-9 ")).toEqual({ prefix: "", value: "6-9", unit: "ヶ月" });
  });

  it("解釈できない文字列はそのまま値として返し、単位を付けない", () => {
    expect(parseDuration("半年くらい")).toEqual({ prefix: "", value: "半年くらい", unit: "" });
    expect(parseDuration("")).toEqual({ prefix: "", value: "", unit: "" });
  });
});
