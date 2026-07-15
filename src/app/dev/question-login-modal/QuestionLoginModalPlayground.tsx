"use client";

/**
 * PostQuestionButton のログイン訴求モーダルを単体表示するプレイグラウンド。
 *
 * スタイルパターン:
 * - current: 現行実装（PostQuestionButton と同一マークアップ）
 * - aligned: 整列案（2026-07-09）
 *     1. 整列を左揃えに統一（現行はタイトル左 / 本文中央 / ボタン右で混在）
 *     2. アイコンはタイトルと同じヘッダーブロックに移動
 *     3. ボタンはブロック全幅フィル（2つのときは 50%/50%）
 *
 * デザイン確定後は PostQuestionButton 側へ反映する。
 */

import { useState } from "react";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalAction,
} from "@/components/ui/modal";

type Variant = "guest" | "loggedInNonMember";
type StylePattern = "current" | "aligned";

export function QuestionLoginModalPlayground() {
  const [open, setOpen] = useState(true);
  const [variant, setVariant] = useState<Variant>("guest");
  const [pattern, setPattern] = useState<StylePattern>("aligned");

  const isLoggedIn = variant === "loggedInNonMember";

  const reopen = (v: Variant, p: StylePattern) => {
    setVariant(v);
    setPattern(p);
    setOpen(false);
    // 一度閉じてから開き直してエンターアニメーションを再生する
    requestAnimationFrame(() => setOpen(true));
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-24 text-xs font-bold text-text-primary/50 font-noto-sans-jp">
            整列案
          </span>
          <Button variant="outline" onClick={() => reopen("guest", "aligned")}>
            未ログイン
          </Button>
          <Button
            variant="outline"
            onClick={() => reopen("loggedInNonMember", "aligned")}
          >
            ログイン済み・非メンバー
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-24 text-xs font-bold text-text-primary/50 font-noto-sans-jp">
            現行（比較用）
          </span>
          <Button variant="outline" onClick={() => reopen("guest", "current")}>
            未ログイン
          </Button>
          <Button
            variant="outline"
            onClick={() => reopen("loggedInNonMember", "current")}
          >
            ログイン済み・非メンバー
          </Button>
        </div>
        <p className="text-xs text-text-primary/50 font-noto-sans-jp">
          現在表示中: {pattern === "aligned" ? "整列案" : "現行"} /{" "}
          {isLoggedIn ? "ログイン済み・非メンバー" : "未ログイン"}
        </p>
      </div>

      <Modal open={open} onOpenChange={setOpen}>
        {pattern === "aligned" ? (
          <AlignedModal isLoggedIn={isLoggedIn} />
        ) : (
          <CurrentModal isLoggedIn={isLoggedIn} />
        )}
      </Modal>
    </>
  );
}

/**
 * 整列案: 全ブロック左揃え / アイコンはタイトルブロック内 / ボタンは全幅フィル
 */
function AlignedModal({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <ModalContainer>
      <ModalHeader badge="メンバー限定">
        {/* アイコンはタイトルに従属する要素なので同じブロックに置く */}
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Lock className="h-6 w-6 text-blue-600" strokeWidth={2} />
        </div>
        <ModalTitle>質問の投稿はメンバー登録が必要です</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <p className="text-left text-sm leading-relaxed text-muted-foreground">
          みんなの掲示板への投稿・コメント・スタンプはメンバー限定です。
          メンバーになると、デザインの悩みをメンバーと共有できます。
        </p>
      </ModalContent>
      <ModalAction>
        {/* アクション提示なのでブロック全幅をフィル。2つのときは 50%/50% */}
        <div
          className={
            isLoggedIn ? "grid w-full grid-cols-1" : "grid w-full grid-cols-2 gap-2"
          }
        >
          {!isLoggedIn && (
            <Button type="button" variant="outline" className="w-full">
              <LogIn className="mr-1 h-4 w-4" />
              ログインする
            </Button>
          )}
          <Button type="button" className="w-full">
            <UserPlus className="mr-1 h-4 w-4" />
            メンバー登録へ
          </Button>
        </div>
      </ModalAction>
    </ModalContainer>
  );
}

/**
 * 現行実装（src/components/questions/PostQuestionButton.tsx と同一マークアップ）
 */
function CurrentModal({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <ModalContainer>
      <ModalHeader badge="メンバー限定">
        <ModalTitle>質問の投稿はメンバー登録が必要です</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <div className="mt-4 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Lock className="h-7 w-7 text-blue-600" strokeWidth={2} />
          </div>
          <p className="text-sm text-muted-foreground">
            みんなの掲示板への投稿・コメント・スタンプはメンバー限定です。
            メンバーになると、デザインの悩みをメンバーと共有できます。
          </p>
        </div>
      </ModalContent>
      <ModalAction>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          {!isLoggedIn && (
            <Button type="button" variant="outline">
              <LogIn className="mr-1 h-4 w-4" />
              ログインする
            </Button>
          )}
          <Button type="button">
            <UserPlus className="mr-1 h-4 w-4" />
            メンバー登録へ
          </Button>
        </div>
      </ModalAction>
    </ModalContainer>
  );
}
