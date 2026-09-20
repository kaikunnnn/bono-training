export default function QuestionDetailLoading() {
  return (
    <div
      className="mx-auto max-w-[800px] px-4 py-10 sm:px-6"
      aria-busy="true"
      aria-label="スレッドを読み込み中"
    >
      <div className="h-5 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-10 h-6 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-5 h-9 w-4/5 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 h-72 animate-pulse rounded-[24px] border border-border bg-white" />
      <div className="mt-8 h-48 animate-pulse rounded-[24px] bg-muted/70" />
    </div>
  );
}
