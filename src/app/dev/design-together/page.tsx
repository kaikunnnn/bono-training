/**
 * /dev/design-together — いっしょにデザインのプロトタイプ 入口（#253）
 *
 * 今のBONOのマイページ・動画ページを /dev 配下に複製し、「いま作業中」（機能A）を組み込んだ。
 * 保存・ログイン・Server Action・DB・Sanity は使わない。状態は sessionStorage だけ。
 * 仕様: rebono/issues/253_いっしょにデザインのプロトタイプ.md
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DT_MYPAGE } from "./_proto/data";

export const metadata: Metadata = {
  title: "いっしょにデザインのプロトタイプ (/dev/design-together)",
  robots: { index: false, follow: false },
};

const PROBLEMS = [
  {
    when: "始めて7日以内",
    text: "まず何をやればいいか決まっておらず、仕事終わりの疲れた頭で考えるのが億劫で止まってしまう",
  },
  {
    when: "始めて14日以内",
    text: "1人で「これで合っているのかな」と不安になる。忙しい日が続くと習慣が途切れて止まってしまう",
  },
];

const FLOW = [
  { title: "開く", body: "マイページを開くと、見出しのすぐ下に「いま作業中」の人の顔が並んでいる" },
  { title: "始める", body: "「これからデザインやります」を押す" },
  { title: "宣言する", body: "今日やることを一言だけ書く（書かなくても始められる）" },
  { title: "作業する", body: "どのページでも画面の上に「作業中 ◯分」が出る。動画にはかからない" },
  { title: "終える", body: "「作業を終える」で今日の分を記録する（この先の日報は次のスライス）" },
];

const SLICES = [
  { name: "S0 土台", body: "ページ、状態、ダミーデータ、サイドナビの複製", done: true },
  { name: "S1 いま作業中", body: "開始ボタン、宣言、作業中の人、0人のとき、作業中バー、終了、押し忘れ", done: true },
  { name: "S2 ひとこと日報とフィード", body: "日報の入力、全体フィード、絵文字の反応、ベル", done: false },
  { name: "S3 仲間グループ", body: "参加、3人のグループ、目標の進捗、グループのフィード", done: false },
];

export default function Page() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full min-w-0 max-w-[880px] px-4 py-10 sm:px-6">
        <header className="mb-8 border-b border-[var(--card-border-subtle)] pb-5">
          <p className="text-sm font-bold text-text-muted">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            / #253 いっしょにデザイン
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-text-primary">いっしょにデザインのプロトタイプ</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            「これからデザインやります」で作業を始め、同じ時間に作業している人の顔が見える仕組みを、今のBONOのマイページと動画ページに組み込みました。
            あなたは「BONOを始めて2週目」の学習者という設定です。ページを移っても状態は続きます（このタブを閉じると消えます）。
          </p>
          <div className="mt-5">
            <Button asChild size="lg">
              <Link href={DT_MYPAGE}>
                マイページから始める
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </header>

        <section aria-labelledby="target-heading" className="mb-10">
          <h2 id="target-heading" className="font-heading text-lg font-bold text-text-primary">
            だれのためのプロトか
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            働きながら転職を目指してUIデザインを学んでいる、BONOを始めて14日以内の人。平日の仕事終わりに、疲れた状態で開く想定です。
          </p>
        </section>

        <section aria-labelledby="problem-heading" className="mb-10">
          <h2 id="problem-heading" className="font-heading text-lg font-bold text-text-primary">
            解決したい課題
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {PROBLEMS.map((p) => (
              <li
                key={p.when}
                className="rounded-[20px] border border-[var(--card-border-subtle)] bg-surface px-5 py-4"
              >
                <p className="text-xs font-bold text-text-muted">{p.when}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-primary">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="flow-heading" className="mb-10">
          <h2 id="flow-heading" className="font-heading text-lg font-bold text-text-primary">
            触る流れ（5ステップ）
          </h2>
          <ol className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
            {FLOW.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col gap-1 rounded-[20px] border border-[var(--card-border-subtle)] bg-surface px-4 py-4"
              >
                <span className="text-xs font-bold text-text-muted">{i + 1}</span>
                <h3 className="font-heading text-sm font-bold text-text-primary">{s.title}</h3>
                <p className="text-xs leading-relaxed text-text-secondary">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            右下の体験ガイドで、作業中のダミーを「0人」にしたり、時間を3時間進めて押し忘れ（自動終了）を確かめたりできます。
          </p>
        </section>

        <section aria-labelledby="slice-heading">
          <h2 id="slice-heading" className="font-heading text-lg font-bold text-text-primary">
            いまできているところ
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {SLICES.map((s) => (
              <li key={s.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                <span className={s.done ? "font-bold text-text-success" : "font-bold text-text-muted"}>
                  {s.done ? "できた" : "これから"}
                </span>
                <span className="font-bold text-text-primary">{s.name}</span>
                <span className="text-text-secondary">{s.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
