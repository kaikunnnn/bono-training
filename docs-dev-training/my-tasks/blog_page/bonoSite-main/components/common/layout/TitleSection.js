import Link from "next/link";
import React from "react";

const TitleSection = (props) => {
  return (
    <>
      <div className="Sectiontitle w-full h-16 px-2.5 py-4 justify-start items-center gap-2.5 inline-flex">
        <div className="AllEpisodes text-black text-2xl font-bold leading-loose tracking-wide">
          All Episodes
        </div>
      </div>
    </>
  );
};

export default TitleSection;
