interface InfoBlockProps {
  label: string;
  values: string[];
}

export default function InfoBlock({ label, values }: InfoBlockProps) {
  return (
    <div className="flex items-center gap-1.5">
      {/* ラベル */}
      <div className="bg-gray-100 px-0.5 py-0.5">
        <span className="font-noto-sans-jp text-[10px] leading-none text-gray-500">
          {label}
        </span>
      </div>

      {/* 値 */}
      <div className="flex items-center gap-2.5">
        {values.map((value, index) => (
          <span
            key={index}
            className="font-noto-sans-jp text-xs leading-none text-black"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
