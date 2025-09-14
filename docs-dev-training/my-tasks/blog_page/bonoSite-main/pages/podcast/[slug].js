"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Component
import Header from "@/components/common/layout/Navigation/Header";
import SEO from "@/components/common/layout/Navigation/SEO";
import { Button } from "@/components/common/ui/button";

export default function PodcastDetail() {
  return (
    <>
      <SEO
        title="BONOラジっ!! | BONO"
        description="BONOラジはカイクンが適当に実用的ではないけど実用的っぽいデザイン関連の話をするポッドキャスト番組です。"
        imgUrl="https://kaikun.bo-no.design/podcast/ogp_bonoradio.webp"
        ogTitle="BONOラジっ!! | BONO"
        ogDescription="BONOラジはカイクンが適当に実用的ではないけど実用的っぽいデザイン関連の話をするポッドキャスト番組です。"
        ogWidth="1200"
        ogHeight="630"
      ></SEO>
      <main className="max-h-full bg-stone-50 text-slate-900 min-h-screen">
        <Header />
        <div className="w-11/12 md:w-[880px] m-auto py-8 md:py-14 flex justify-center flex-col gap-8">
          <div className="w-full flex-col justify-start items-start gap-2.5 inline-flex">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" /> トップへ戻る
              </Button>
            </Link>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">
              BONOラジっ!! エピソード
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
// import React from "react";
// import { getContents, getContentsBySlug } from "@/libs/newt";

// // pages/series.js
// import SEO from "@/components/common/layout/Navigation/SEO";

// // Icon - named lucide
// import { ArrowLeft, LogIn } from "lucide-react";

// // Component
// import Header from "@/components/common/layout/Navigation/Header";
// import SunTop from "@/components/common/layout/SunTop";
// import AudioPlayer from "@/components/Podcast/ui/AudioPlayer";
// import { Button } from "@/components/common/ui/button";
// import Link from "next/link";

// // Add getStaticPaths
// export async function getStaticPaths() {
//   const contents = await getContents();
//   const paths = contents.map((content) => ({
//     params: { slug: content.slug },
//   }));

//   return { paths, fallback: false };
// }

// // Modify getStaticProps to fetch data based on slug
// export async function getStaticProps({ params }) {
//   const podcastData = await getContentsBySlug(params.slug);
//   return {
//     props: {
//       podcast: podcastData,
//     },
//   };
// }

// export default function PodcastDetail({ podcast }) {
//   console.log(podcast);
//   // Style CSS
//   const textStrokeStyle = {
//     WebkitTextStroke: "0.75px black", // 枠線の太さと色
//     fontFamily: "Hind",
//     color: "white", // 文字の中身を透明
//   };
//   return (
//     <>
//       <SEO
//         title="BONOブログ 東京で個人開発する1人デザイナーの日常"
//         description="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。"
//         imgUrl="https:kaikun.bo-no.blog/ogp-bonoblog.jpg"
//         ogTitle="BONOブログ 東京で個人開発する1人デザイナーの日常"
//         ogDescription="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。"
//         ogWidth="1200"
//         ogHeight="600"
//       ></SEO>
//       <main className="max-h-full bg-cover bg-stone-50 text-slate-900 bg-no-repeat">
//         <Header />
//         <SunTop />
//         <div className="Podcast w-11/12 md:w-[880px] m-auto md:py-14 py-20  flex justify-center flex-col gap-8">
//           <div class="HeaderNavi w-full flex-col justify-start items-start gap-2.5 inline-flex">
//             <Link href="/podcast">
//               <Button variant="outline" size="icon">
//                 <ArrowLeft className="h-4 w-4 " icon="arrow-left" /> 一覧へ戻る
//               </Button>
//             </Link>
//           </div>
//           <div class="Content w-full p-4 py-8 md:p-20 bg-white border border-black flex-col justify-center  gap-12 inline-flex">
//             <div class="UpperBlock self-stretch  flex-col justify-center items-start gap-12 flex">
//               <div class="Head w-full flex-col justify-start items-center gap-3 flex">
//                 <div class="self-stretch justify-center items-center inline-flex">
//                   <p class="Category text-gray-500 text-sm font-semibold font-['Noto Sans'] leading-snug tracking-wide text-center">
//                     {podcast.category.name}
//                   </p>
//                 </div>
//                 <h1 class="Title grow shrink basis-0 text-slate-900 text-2xl leading-[160%] md:text-5xl md:leading-[160%] font-bold  text-center w-11/12">
//                   {podcast.title}
//                 </h1>
//                 <div class="RadioDetail pb-4 justify-start items-center gap-4 flex">
//                   <h5 class="text-black text-opacity-50 text-sm md:text-base font-bold font-['Noto Sans'] leading-none tracking-wider">
//                     BONOラジオ
//                   </h5>
//                 </div>
//                 <div class="Player self-stretch flex-col justify-start items-center gap-2.5 flex ">
//                   <AudioPlayer src={podcast.mediaurl} />
//                 </div>
//               </div>
//             </div>
//             <div class="BottomBlock flex-col justify-start items-start gap-[12px] flex">
//               <div class="flex-col justify-start items-start gap-[16px] flex">
//                 <div class="justify-start items-center gap-2.5 inline-flex">
//                   <div class="text-gray-500 text-base font-bold font-['Hind'] leading-[39.20px]">
//                     音声について
//                   </div>
//                 </div>
//               </div>
//               <div class="flex-col w-full  gap-[22px] flex">
//                 <div class="w-full gap-2.5">
//                   <div
//                     class="w-ful block overflow-auto"
//                     dangerouslySetInnerHTML={{ __html: podcast.body }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   );
// }
