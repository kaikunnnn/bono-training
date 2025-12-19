/**
 * 熱血コーチング・メッセージ定義
 * 汗と涙の結晶を称えるコーチからの熱い激励
 */

/**
 * レベル1: 記事完了時のメッセージ（ランダム）
 */
export const ARTICLE_COMPLETE_MESSAGES = [
  { title: 'いい汗かいたな！', description: '一歩一歩、着実に前進してるぞ！' },
  { title: '昨日の自分より強くなってるぞ！', description: 'その調子だ！' },
  { title: 'ナイスバルク！', description: '知識という筋肉が育ってる！' },
  { title: 'その意気だ！', description: '限界を超えろ！' },
  { title: 'グッジョブ！', description: '次のステップへ進め！' },
];

/**
 * レベル2: クエスト完了時のメッセージ
 */
export function getQuestCompleteMessage(questTitle: string) {
  return {
    title: 'ナイスマッスル！！',
    description: `その調子だ！『${questTitle}』という高い壁を越えたな！`,
  };
}

/**
 * レベル3: レッスン完了時のメッセージ
 */
export function getLessonCompleteMessage(lessonTitle: string) {
  return {
    mainTitle: '優勝だ！！お前がNo.1だ！！',
    subTitle: `『${lessonTitle}』完全制覇！`,
    body: '素晴らしい！その情熱が奇跡を起こしたんだ！\n今日は焼き肉だ！！とびきり高いやつな！',
    footer: '限界を超えて全てのメニューを消化しました！',
  };
}

/**
 * ランダムに記事完了メッセージを取得
 */
export function getRandomArticleMessage() {
  const index = Math.floor(Math.random() * ARTICLE_COMPLETE_MESSAGES.length);
  return ARTICLE_COMPLETE_MESSAGES[index];
}
