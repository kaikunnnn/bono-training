/**
 * コースカード比較（#235）の共通パーツ
 * 見た目は src/components/top2/CourseHighlightCard.tsx をベースにしている。
 */

import type { MockField } from "./mock";

/** 仮で作った値に付ける小さなバッジ */
export function KariTag({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="ml-1.5 inline-block rounded bg-amber-100 px-1 align-middle font-noto-sans-jp text-[10px] font-bold leading-[1.6] text-amber-700">
      仮
    </span>
  );
}

/** 文言＋（kari のとき）仮タグ */
export function FieldText({ field, showKari }: { field: MockField; showKari: boolean }) {
  return (
    <>
      {field.text}
      {field.kari ? <KariTag show={showKari} /> : null}
    </>
  );
}

/** サムネイル（画像未確定のためグレーのプレースホルダー） */
export function Thumbnail({ label }: { label: string }) {
  return (
    <div className="relative aspect-[674/432] w-full overflow-hidden rounded-[16px]">
      <div className="absolute inset-0 bg-muted-custom transition-transform duration-500 ease-out group-hover:scale-105" />
      <span className="absolute left-6 top-5 text-base font-bold text-[#5e6871]">{label}</span>
    </div>
  );
}

/** ラベル／値の1行 */
export function MetaRow({
  label,
  field,
  showKari,
}: {
  label: string;
  field: MockField;
  showKari: boolean;
}) {
  return (
    <div className="flex gap-3 font-noto-sans-jp text-sm leading-[1.6]">
      <dt className="w-[88px] shrink-0 text-text-primary/60">{label}</dt>
      <dd className="min-w-0 font-medium text-text-primary">
        <FieldText field={field} showKari={showKari} />
      </dd>
    </div>
  );
}

/** C: 小さな見出し＋本文（「こんな人向け」「このコースで」） */
export function LabeledBlock({
  label,
  field,
  showKari,
}: {
  label: string;
  field: MockField;
  showKari: boolean;
}) {
  return (
    <div className="font-noto-sans-jp">
      <p className="text-xs font-bold text-text-primary/60">{label}</p>
      <p className="mt-0.5 text-base leading-[1.8] text-text-primary">
        <FieldText field={field} showKari={showKari} />
      </p>
    </div>
  );
}
