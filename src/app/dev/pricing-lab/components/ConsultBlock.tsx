"use client";

/**
 * 最下部の相談導線ブロック（プレースホルダー）。
 * 装飾禁止のため上部 border と余白のみ。
 */
export function ConsultBlock() {
  return (
    <div className="mt-12 border-t pt-6">
      <h2 className="text-base">プラン選びに迷ったら</h2>
      <p className="mt-2 text-sm">
        プラン選びに迷ったら…（相談導線プレースホルダー）
      </p>
    </div>
  );
}
