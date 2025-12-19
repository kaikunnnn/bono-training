/**
 * セレブレーション・メッセージ定義
 * 学習の達成を称えるメッセージ
 */

/**
 * レベル1: 記事完了時のメッセージ（ランダム）
 */
export const ARTICLE_COMPLETE_MESSAGES = [
  { title: 'ナイスデザイン💪', description: 'デザイン筋に効いてるぅ〜' },
  { title: 'ええやん！✨', description: '前進前進〜！' },
  { title: 'やるぅ〜！🔥', description: 'うまいもん食べよう' },
  { title: 'いい感じ！👏', description: 'この調子でいこ〜！' },
  { title: 'おつかれ！👍', description: '首と肩のストレッチしてくれよな' },
];

/**
 * レベル2: クエスト完了時のメッセージ
 */
export function getQuestCompleteMessage(questTitle: string) {
  return {
    title: 'クエスト完了！✨',
    description: `『${questTitle}』クリア！いい感じ〜！`,
  };
}

/**
 * レベル3: レッスン完了時のメッセージ
 */
export function getLessonCompleteMessage(lessonTitle: string) {
  return {
    mainTitle: 'レッスン完了！今日は優勝だ！🎉',
    subTitle: `『${lessonTitle}』やりきった！`,
    body: 'めっちゃええやん！最高！\n今日はうまいもん食べよう！',
    footer: '',
  };
}

/**
 * ランダムに記事完了メッセージを取得
 */
export function getRandomArticleMessage() {
  const index = Math.floor(Math.random() * ARTICLE_COMPLETE_MESSAGES.length);
  return ARTICLE_COMPLETE_MESSAGES[index];
}
