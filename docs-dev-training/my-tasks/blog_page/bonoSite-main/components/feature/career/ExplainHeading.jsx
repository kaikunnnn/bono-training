export default function ExplainHeading({ text }) {
  return (
    <div className="mb-4 justify-start items-center gap-3 inline-flex">
      <div className="h-3 w-3 bg-gradient-to-r from-[#f2bbe0] to-[#fccbc0] rounded-full" />
      <div className="grow shrink basis-0 text-white text-base font-bold leading-relaxed">
        {text}
      </div>
    </div>
  );
}
