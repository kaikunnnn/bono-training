/** マイページ組み込み版（#255）のダミー。同期のデータは ../_data.ts を共有する */

import { COURSE_NAME, assignmentLabel, ME } from "../_data";
import type { ProtoLessonProgress } from "./_components/ProtoProgressCard";

const LESSON_ICON = "/images/top/course-lesson-thumb.png";

/** 進行中（1枚目が取り組み中の UIデザイン基礎コース：課題3） */
export const PROTO_IN_PROGRESS: ProtoLessonProgress[] = [
  {
    id: "lesson-ui-basic",
    title: COURSE_NAME,
    progress: 40,
    nextStep: assignmentLabel(ME.assignmentNo),
    iconImageUrl: LESSON_ICON,
  },
  {
    id: "lesson-figma",
    title: "Figma入門",
    progress: 70,
    nextStep: "オートレイアウトを使う",
    iconImageUrl: LESSON_ICON,
  },
];

export const DUMMY_BOOKMARKS = [
  { id: "b1", title: "色の数をしぼる", lessonTitle: "UIビジュアル基礎" },
  { id: "b2", title: "オートレイアウトを使う", lessonTitle: "Figma入門" },
];

export const DUMMY_HISTORY = [
  { id: "h1", title: "メニュー画面の配色を考える", lessonTitle: COURSE_NAME, ago: "30分前" },
  { id: "h2", title: "余白でまとまりを作る", lessonTitle: "UIビジュアル基礎", ago: "昨日" },
  { id: "h3", title: "Figmaの画面の見方", lessonTitle: "Figma入門", ago: "2日前" },
];
