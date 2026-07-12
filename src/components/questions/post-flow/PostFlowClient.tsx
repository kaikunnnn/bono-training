"use client";

/**
 * 投稿フローの State machine（#139）
 *
 * 数値stepではなく型付きの FlowState（category → compose | contact → done）で
 * 状態遷移を管理する（B-1）。各状態のカード中身は Step コンポーネントに委譲する:
 *   - category: StepCategory（カテゴリ選択。kind により compose / contact へ分岐）
 *   - compose : StepCompose（タイトル+本文の入力・送信。Step2）
 *   - contact : StepContact（バグ/問い合わせ分岐。外部フォームへ誘導）
 *   - done    : StepDone（投稿完了画面。Step3）
 *
 * dirty ガード: compose の入力（title/content）が始まったら isDirty=true とし、
 * リロード・タブ閉じは beforeunload、✕キャンセルは AlertDialog で破棄確認する。
 * done 到達時に入力をクリアするためガードは自動的に外れる。
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionCategory } from "@/types/sanity";
import type { BoardCategoryDef } from "@/lib/questions/categories";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { PostFlowShell } from "./PostFlowShell";
import { StepCategory } from "./StepCategory";
import { StepCompose, type ComposeResult } from "./StepCompose";
import { StepContact } from "./StepContact";
import { StepDone } from "./StepDone";
import { ProfileSetupPromptModal } from "@/components/questions/ProfileSetupPromptModal";
import { shouldShowProfilePrompt } from "@/lib/profile-utils";

/** 投稿フローの状態 */
export type FlowState = "category" | "compose" | "contact" | "done";

/** 状態 → 進捗マップ（%） */
const PROGRESS_BY_STATE: Record<FlowState, number> = {
  category: 32,
  compose: 64,
  contact: 64,
  done: 100,
};

/** 状態 → ヘッダーの Step 番号（3分割） */
const STEP_NUMBER_BY_STATE: Record<FlowState, number> = {
  category: 1,
  compose: 2,
  contact: 2,
  done: 3,
};

interface PostFlowClientProps {
  categories: QuestionCategory[];
  /** プレビュー: compose の送信をモック成功にする */
  isPreview?: boolean;
  /** 表示名・アイコンが未設定か。done 到達後にプロフィール設定を促す（#142） */
  profileIncomplete?: boolean;
}

export function PostFlowClient({
  categories,
  isPreview,
  profileIncomplete = false,
}: PostFlowClientProps) {
  const router = useRouter();
  const [state, setState] = useState<FlowState>("category");
  // 選択したカテゴリ。post は Sanity _id、contact は undefined。
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  // compose の入力（戻る→再入場で消えないよう親で保持。dirty 判定にも使う）
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // 送信結果（done で使用。slug はスライス5の導線に必要）
  const [submitResult, setSubmitResult] = useState<ComposeResult | null>(null);
  // キャンセル確認ダイアログの開閉（スライス7）
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // プロフィール設定促しモーダルの開閉（#142）
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  const progress = PROGRESS_BY_STATE[state];
  const stepNumber = STEP_NUMBER_BY_STATE[state];

  // 入力が始まっているか（title/content いずれかに文字がある）。
  // カテゴリ選択のみは非dirty（選び直しが一瞬なので破棄確認しない）。
  const isDirty = title.trim() !== "" || content.trim() !== "";

  // dirty の間だけ beforeunload を登録（リロード・タブ閉じで標準の離脱確認）。
  // done 到達後は入力をクリアするため isDirty=false となりガードは外れる。
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // 投稿完了(done)後、ARIGATO アニメが概ね終わる頃にプロフィール設定を促す（#142）。
  // 未設定 かつ 30日抑制されていない場合のみ。done 以外に遷移したら出さない。
  useEffect(() => {
    if (state !== "done") return;
    if (!profileIncomplete) return;
    if (!shouldShowProfilePrompt()) return;
    const timer = setTimeout(() => setShowProfilePrompt(true), 1600);
    return () => clearTimeout(timer);
  }, [state, profileIncomplete]);

  // ---- 遷移関数（型付き） ----

  /** カテゴリ選択 → compose or contact 分岐（BoardCategoryDef の kind で判定） */
  const selectCategory = (def: BoardCategoryDef, id?: string) => {
    setCategoryId(id);
    setState(def.kind === "contact" ? "contact" : "compose");
  };

  /** 戻る（compose/contact → category） */
  const back = () => {
    setState("category");
  };

  /** 投稿完了 → done（結果を保持）。入力をクリアして beforeunload ガードを外す */
  const complete = (result: ComposeResult) => {
    setSubmitResult(result);
    setTitle("");
    setContent("");
    setState("done");
  };

  /** ✕キャンセル。dirty なら確認ダイアログ、非dirtyなら即 /questions へ */
  const handleCancel = () => {
    if (isDirty) {
      setShowCancelConfirm(true);
      return;
    }
    router.push("/questions");
  };

  /** 「破棄して閉じる」→ /questions へ */
  const confirmDiscard = () => {
    setShowCancelConfirm(false);
    router.push("/questions");
  };

  return (
    <>
      <PostFlowShell
        stepNumber={stepNumber}
        progress={progress}
        onCancel={state === "done" ? undefined : handleCancel}
      >
      {/* カード中身（現在の状態に対応する Step を描画） */}
      {state === "category" && (
        <StepCategory categories={categories} onSelect={selectCategory} />
      )}
      {state === "compose" && (
        <StepCompose
          categoryId={categoryId}
          title={title}
          onTitleChange={setTitle}
          content={content}
          onContentChange={setContent}
          onBack={back}
          onSuccess={complete}
          isPreview={isPreview}
        />
      )}
      {state === "contact" && <StepContact onBack={back} />}
      {state === "done" && (
        <StepDone slug={submitResult?.slug} isPreview={isPreview} />
      )}
      </PostFlowShell>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>入力内容は保存されません</AlertDialogTitle>
            <AlertDialogDescription>
              このまま閉じると入力した内容は破棄されます。よろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>書き続ける</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={confirmDiscard}
            >
              破棄して閉じる
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProfileSetupPromptModal
        open={showProfilePrompt}
        onOpenChange={setShowProfilePrompt}
      />
    </>
  );
}
