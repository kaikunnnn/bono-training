interface NavigationHeaderProps {
  orderIndex: number;
}

function NumberoforderIndex({ orderIndex }: { orderIndex: number }) {
  return (
    <div
      className="box-border content-stretch flex flex-row font-['DotGothic16:Regular',_sans-serif] gap-[5.818px] items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-[#0d221d] text-[14px] text-center text-nowrap"
      data-name="numberoforder_index"
    >
      <div className="relative shrink-0 tracking-[2px]">
        <p className="adjustLetterSpacing block leading-none text-nowrap whitespace-pre">
          TRAINING
        </p>
      </div>
      <div className="relative shrink-0 tracking-[-1px]">
        <p className="adjustLetterSpacing block leading-none text-nowrap whitespace-pre">
          {String(orderIndex).padStart(2, '0')}
        </p>
      </div>
    </div>
  );
}

export default function NavigationHeader({ orderIndex }: NavigationHeaderProps) {
  return (
    <div className="h-6 relative shrink-0 w-full" data-name="tableofcontents">
      <div className="flex flex-row items-center justify-center overflow-clip relative size-full">
        <NumberoforderIndex orderIndex={orderIndex} />
      </div>
    </div>
  );
}
