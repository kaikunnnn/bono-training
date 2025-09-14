"use client";

function ArticleListItem({ article }) {
  return (
    <a
      href={article.slug}
      target="_blank"
      className="block transition-colors duration-200 hover:bg-gray-50"
    >
      <div className="flex-col justify-start items-start -mt-[2px]">
        <div className="self-stretch border-t border-b border-green-950 justify-start items-center flex group md:gap-8">
          <div className="w-[40%] md:w-[30%] relative aspect-[16/9] bg-zinc-200 flex-col justify-center items-center overflow-hidden">
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={article.thumbnail}
              alt={article.title}
            />
          </div>
          <div className="flex-1 px-3 sm:px-4 flex flex-col justify-center items-start gap-2">
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <div className="w-full flex flex-row gap-2">
                <div className="text-green-950 text-sm sm:text-base leading-relaxed group-hover:text-indigo-600 transition-colors duration-300 relative">
                  {article.title}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full"></span>
                </div>
                {!article.isFree && (
                  <div className="inline-flex items-center justify-center px-2 text-xxs bg-pink-50 text-pink-600 border border-pink-100 rounded-md leading-none">
                    メンバー限定
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function ArticleSection({ sectionData, articles = [] }) {
  const {
    stepNumber = "ステップ1",
    title = "未経験からUIUXデザイナーになれるの？",
    description = "顧客中心のデザインを身につける流れです",
    id = "section-1",
  } = sectionData || {};

  return (
    <section
      id={id}
      className="w-full md:w-9/12 md:max-w-4xl py-8 lg:py-6 md:mb-12 bg-gradient-to-b to-gray-50/50"
    >
      <div className="container w-full px-0 mx-auto flex flex-col items-start gap-8">
        {/* Heading */}
        <div className="w-full flex flex-col items-start  gap-3 px-4 md:p-0">
          <div className="px-3 py-1 bg-white rounded-full  justify-center items-center gap-2.5 inline-flex">
            <div className="text-green-950 text-xxs md:text-xs font-semibold">
              {stepNumber}
            </div>
          </div>
          <div className="w-full flex flex-col justify-start items-start md:justify-between gap-2">
            <h3 className="w-fit text-green-950 text-lg sm:text-xl md:text-xl font-medium font-['Noto Sans JP'] leading-relaxed">
              {title}
            </h3>
            <div className="w-fit text-slate-500 md:text-sm sm:text-base font-normal font-['Noto Sans JP'] leading-normal md:text-right">
              {description}
            </div>
          </div>
        </div>
        {/* Article List */}
        <div className="max-w-5xl mx-auto">
          <div className="divide-y divide-gray-200">
            {articles.map((article) => (
              <ArticleListItem key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
