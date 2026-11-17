/**
 * data v3 の共通部品 — #300
 *
 * - k / fixed: 仮の文（推測）と、Sanity 本番の文言そのまま
 * - careerChangeV3Path: 転職ロードマップ（4コースの順: Figma → UIビジュアル → 情報設計 → UX）
 *   data/roadmaps.ts の career-change は #241 の別コース（はじめて・基礎・体験）で組まれているため、
 *   v3 用に「修了したら次は」で使う最小の形だけをここに持つ。行き先のページは既存の career-change。
 * - AUTHOR: つくった人（既存コースと同じ）
 */

import { ROADMAP_BASE, type RoadmapPath } from "../roadmaps";
import type { Course, Field } from "../types";

export const k = (text: string): Field => ({ text, kari: true });
export const fixed = (text: string): Field => ({ text });

export const careerChangeV3Path: RoadmapPath = {
  name: "未経験からUI/UXデザイナーへ",
  href: `${ROADMAP_BASE}/career-change`,
  stops: ["Figma入門", "UIビジュアル", "情報設計", "UX", "ポートフォリオ", "転職活動"],
};

export const AUTHOR: Course["author"] = {
  name: k("カイクン"),
  role: k("BONOファウンダー / デザイナー"),
  bio: k(
    "UI・UXデザインを学ぶコミュニティ「BONO」を運営。実在するアプリの画面をなぞる・分解する練習を通じて、自分で画面をつくれるようになるための教材をつくっています。"
  ),
  image: "/images/authors/kaikun.jpg",
};

/** 期間はロードマップの表示（estimatedDuration: 1-2）をそのまま使う。コースとしての期間は未確認なので仮 */
export const PERIOD = k("1〜2ヶ月");

export const NOT_FOR_QUESTION = k("どんな人には向いていませんか？");
