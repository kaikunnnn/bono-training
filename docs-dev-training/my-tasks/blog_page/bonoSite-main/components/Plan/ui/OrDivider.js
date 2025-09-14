import React from "react";


const OrDivider = () => {
  return (
    <>
     {/* divider */}
     <div className="BlockDivider self-stretch justify-center items-center gap-2 inline-flex">
                    <div className="Line1 grow shrink basis-0 h-px border border-neutral-300"></div>
                    <div className="Or text-center text-black text-xs font-bold leading-tight tracking-wide">
                      or
                    </div>
                    <div className="Line2 grow shrink basis-0 h-px border border-neutral-300"></div>
    </div>
    </>
  );
};

export default OrDivider;
