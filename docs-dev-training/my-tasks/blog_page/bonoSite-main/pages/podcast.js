"use client";

import React from "react";
import Header from "@/components/common/layout/Navigation/Header";
import SEO from "@/components/common/layout/Navigation/SEO";
import { SITE_DOMAIN } from "@/src/config/constants";

function BonoRadio() {
  return (
    <>
      <SEO
        title="BONOラジっ!! | BONO"
        description="BONOラジはカイクンが適当に実用的ではないけど実用的っぽいデザイン関連の話をするポッドキャスト番組です。何かが燃える音を感じられたら幸いでごわす。"
        imgUrl={`${SITE_DOMAIN}/podcast/ogp_bonoradio.webp`}
        ogTitle="BONOラジっ!! | BONO"
        ogImage={`${SITE_DOMAIN}/podcast/ogp_bonoradio.webp`}
        ogDescription="BONOラジはカイクンが適当に実用的ではないけど実用的っぽいデザイン関連の話をするポッドキャスト番組です。何かが燃える音を感じられたら幸いでごわす。"
        ogWidth="1200"
        ogHeight="630"
      ></SEO>
      <main className="max-h-full text-slate-900 bg-stone-50 min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">
              BONOラジっ!!
            </h2>
            <p className="text-gray-600 mb-4 text-center">
              このページは現在メンテナンス中です。
            </p>
            <p className="text-gray-600 text-center">
              ご不便をおかけして申し訳ありません。
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default BonoRadio;
// import Head from "next/head";
// import React from "react";
// // Component
// import HeaderPodcastPage from "@/components/Podcast/ui/Header";
// import PodCastStory from "@/components/Podcast/ui/PodcastStory";
// import Header from "@/components/common/layout/Navigation/Header";
// import SEO from "@/components/common/layout/Navigation/SEO";
// import { SITE_DOMAIN } from "@/src/config/constants";

// // Newt
// import { getContents, getContentBySlug } from "@/libs/newt";

// export async function getStaticProps() {
//   const contents = await getContents();
//   return {
//     props: {
//       radioContents: contents,
//     },
//   };
// }

// function BonoRadio({ radioContents }) {
//   console.log(radioContents);
//   return (
//     <>
//       <Head>
//         <meta
//           name="twitter:card"
//           content="https://kaikun.bo-no.design/about/ogp-about.webp"
//         />
//         <meta name="twitter:title" content="アバウト-運営のスタンス|BONO" />
//         <meta
//           name="twitter:description"
//           content="BONOは”こうあったらいいのでは?”を考えて→形にするスキルを身につけ、クリエイションの夜明けを実現する人たちのためのサービスです。夜明けの意味する“曙”のように新しい自分の創造性と出会える場所へようこそ〜"
//         />
//         <meta name="twitter:card" content="summary_large_image" />
//       </Head>
//       <SEO
//         title="BONOラジっ!! | BONO"
//         description="BONOラジはカイクンが適当に実用的ではないけど実用的っぽいデザイン関連の話をするポッドキャスト番組です。何かが燃える音を感じられたら幸いでごわす。"
//         imgUrl={`${SITE_DOMAIN}/podcast/ogp_bonoradio.webp`}
//         ogTitle="BONOラジっ!! | BONO"
//         ogImage={`${SITE_DOMAIN}/podcast/ogp_bonoradio.webp`}
//         ogDescription="BONOラジはカイクンが適当に実用的ではないけど実用的っぽいデザイン関連の話をするポッドキャスト番組です。何かが燃える音を感じられたら幸いでごわす。"
//         ogWidth="1200"
//         ogHeight="630"
//       ></SEO>
//       <main className="max-h-full text-slate-900 bg-stone-50 pb-80">
//         <Header />
//         <div className="Radio flex justify-center items-center">
//           <div className="Wrapper md:w-[880px] w-11/12 m-auto flex-col justify-start items-center md:gap-6 gap-4 inline-flex">
//             <HeaderPodcastPage />
//             <div className="Episodes w-full flex-col justify-start items-start gap-4 inline-flex">
//               <ul className="ListOfEspisode flex flex-col gap-6">
//                 {radioContents
//                   .filter((article) => article.series?.slug === "bonoradio")
//                   .sort((a, b) => b.seriesorder - a.seriesorder)
//                   .map((article, index) => (
//                     <PodCastStory
//                       key={index}
//                       link={article.slug}
//                       title={article.title}
//                       explain={article.explain}
//                       timestamp={article.timestamp}
//                       description={article.body}
//                       audioSrc={article.mediaurl}
//                     />
//                   ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }

// export default BonoRadio;
