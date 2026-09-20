export default function QuestionsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8" aria-busy="true">
      <div className="mx-auto flex max-w-[752px] flex-col items-center gap-3 pt-6">
        <div className="h-4 w-10 animate-pulse rounded bg-muted" />
        <div className="h-12 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-5 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-10 w-36 animate-pulse rounded-xl bg-muted" />
      </div>
      <div className="mx-auto mt-8 flex max-w-[752px] flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-[24px] border border-border/60 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
