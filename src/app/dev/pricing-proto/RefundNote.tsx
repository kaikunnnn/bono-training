/**
 * サブスク/返金コピー（きっぱり明記）。
 * 「返金できます」とは書かない。3ヶ月説明の近く/下部に置く純表示コンポーネント。
 */

export function RefundNote() {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      3ヶ月プランは3ヶ月分の継続を前提とした割引価格です。原則、期間途中の返金はできません。プラン変更・次回更新の停止はいつでも可能です。
    </p>
  );
}
