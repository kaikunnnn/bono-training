// pages/series.js
import SEO from "@/components/common/layout/Navigation/SEO";
import React from "react";

// Stripe, Firebase and Plan 
import {useAuthState} from "react-firebase-hooks/auth";
import { auth } from "../../../firebase";
import usePremiumStatus from "../../../stripe/usePremiumStatus";
import { PLANNAME } from "@/stripe/planId";

// Newt
import { getContents,getSeries,getContentsBySlug } from "@/libs/newt";
import VideoEmbed from "@/components/common/layout/Contents/videoEmbed";
import ListMovie from "@/components/common/layout/lists/ListMovie";
import Header from "@/components/common/layout/Navigation/Header";
import Link from "next/link";

export async function getStaticPaths() {
  // すべてのデータを取得する
  const series = await getSeries();
  const contents = await getContents();

  // シリーズとコンテンツの slug を組み合わせたパスを生成
  const paths = series.map(s => {
    return contents.map(c => {
      return { params: { slug: s.slug, content: c.slug } };
    });
  }).flat();  // 2次元配列を1次元に平坦化
  console.log(paths);
  return {
    paths,
    fallback: false  // 存在しないパスにアクセスされた場合は404ページを表示
  };
}


export async function getStaticProps({ params }) {
  // params から slug と content を取得
  const { slug, content } = params;

  // 対応するコンテンツのデータを取得
  const contentData = await getContentsBySlug(content);

  // コンテンツデータがなければ404エラーを返す
  if (!contentData) {
    return { notFound: true };
  }

  // コンテンツデータを pageProps としてページコンポーネントに渡す
  return { props: { content: contentData } };
  
}


export default function SeriesDetail({ content }) {
  // Get Current User Date 
  const [user] = useAuthState(auth)
  const userSubscriptionPlan = usePremiumStatus(user);

  return (
    <>
      <SEO
        title="BONOブログ 東京で個人開発する1人デザイナーの日常"
        description="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。"
        imgUrl="https:kaikun.bo-no.blog/ogp-bonoblog.jpg"
        ogTitle="BONOブログ 東京で個人開発する1人デザイナーの日常"
        ogDescription="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。"
        ogWidth="1200"
        ogHeight="600"
      ></SEO>
      <main className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
       <Header />
        <div className="Article m-auto w-11/12 md:w-7/12 grid text-center lg:mb-0  lg:text-left">
          {/* TopBlock */}
          <div className="Topblock flex-col justify-start items-start gap-6 inline-flex">
            <div className="Titleblock self-stretch px-12 flex-col justify-start items-start gap-2.5 flex">
              <div className="Category self-stretch justify-start items-center gap-7 inline-flex">
                <div className="Category text-red-300 text-base font-normal font-['Noto Sans'] leading-relaxed tracking-wide">
                  {content.category.name}
                </div>
              </div>
              <h1 className="H1Title self-stretch   text-4xl font-bold font-['Noto Sans JP'] leading-10 tracking-wide">
                {content.title}
              </h1>
            </div>
            <div className="Frame625345 self-stretch px-12 justify-between items-center inline-flex">
              <div className="Actions justify-start items-start gap-4 flex">
                <div className="ButtonSecondTiny h-7 px-2 py-2 bg-white bg-opacity-10 rounded-full justify-center items-center flex">
                  <div className=" text-center   text-xs font-bold font-['Noto Sans JP'] leading-3">
                    質問
                  </div>
                </div>
                <div className="ButtonSecondTiny h-7 px-2 py-2 bg-white bg-opacity-10 rounded-full justify-center items-center flex">
                  <div className=" text-center   text-xs font-bold font-['Noto Sans JP'] leading-3">
                    保存
                  </div>
                </div>
                <div className="ButtonSecondTiny h-7 px-2 py-2 bg-white bg-opacity-10 rounded-full justify-center items-center flex">
                  <div className=" text-center   text-xs font-bold font-['Noto Sans JP'] leading-3">
                    シェア
                  </div>
                </div>
              </div>
              <div className="Date text-stone-300 text-sm font-normal font-['Noto Sans'] leading-snug tracking-wide">
                2023年4月20日
              </div>
            </div>
          </div>

          {/* Movie */}
          <div className="Movie shadow flex-col justify-start items-start gap-6 inline-flex">
            
            {/* 非会員の場合 */}
            {userSubscriptionPlan === null ? (
              <div>
                <div><Link href="/plan">メンバープランになるとフルで視聴できます</Link></div>
                <VideoEmbed className="w-full" videoUrl={"https://vimeo.com/808945583?share=copy"}/>
              </div>
            ) : (
              // スタンダードプランの時
              userSubscriptionPlan === PLANNAME.premium_standard ? (
                <VideoEmbed className="w-full" videoUrl={"https://vimeo.com/808945583?share=copy"}/>
              ) : (
                // グロースプランの時
                <VideoEmbed className="w-full" videoUrl={"https://vimeo.com/808945583?share=copy"}/>
              )
            )}
          </div>

          {/* Content */}
          <div className="Article Body
            prose 
            prose-h1:text-3xl
            prose-lg 
            prose-p:leading-loose
            md:prose-xl 
            m-auto " dangerouslySetInnerHTML={{ __html: content.body }} 
          />
          <div className="pb-12"></div>
           {/* Only Member's Content **/}
           <div className="Article Body
            prose 
            prose-h1:text-3xl
            prose-lg 
            prose-p:leading-loose
            md:prose-xl 
            m-auto " dangerouslySetInnerHTML={{ __html: content.ispremium }} 
          /> 
        </div>

        {/* Series Contents List */}
        <div className="ContentsList">
          <div className="wrapper bg-slate-200">


            {/*  */}
            <div className="Seriesblock w-80 h-24 flex-col justify-start items-center">
              <div className="Wrapper py-6 justify-start items-center inline-flex">
                <div className="Detail justify-start items-center gap-3 flex">
                  <div className="Book w-8 h-12 relative">
                    <img className="Image28 w-14 h-14 left-[-16.16px] top-[-7.63px] absolute" src="https://via.placeholder.com/56x54" />
                  </div>
                  <div className="Frame625364 flex-col justify-start items-start gap-1.5 inline-flex">
                    <div className="Ui w-52 h-2.5   text-sm font-bold font-['Noto Sans JP'] leading-3 tracking-wider">UIデザインの流れ</div>
                    <div className=" w-52 h-2.5 text-sky-400 text-xs font-normal font-['Noto Sans JP'] underline leading-3 tracking-wider">カテゴリ名</div>
                  </div>
                </div>
                <div className="Button px-3 py-1.5 bg-white bg-opacity-10 rounded-3xl justify-center items-center gap-2.5 flex">
                  <div className=" text-center   text-xs font-semibold font-['Hiragino Kaku Gothic Pro'] leading-3">詳細へ</div>
                </div>
              </div>
              <div className="Line62 w-80 h-px border border-white border-opacity-5"></div>
            </div>

            {/*  */}
            <div className="StepBlock w-96 h-96 pb-5 border-b border-neutral-700 flex-col justify-start items-start inline-flex">


              {/* StepTitle */}
                <div className="Steptitle h-20 px-5 py-6 flex-col justify-start items-start gap-3 flex">
                  <div className="TitleSide self-stretch h-10 flex-col justify-start items-start gap-2 flex">
                    <div className="Frame625361 px-1 py-1 rounded border border-white justify-start items-start gap-2.5 inline-flex">
                      <div className="Step01   text-xs font-bold font-['SF Pro Text'] leading-3 tracking-wide">STEP-01</div>
                    </div>
                    <div className="Frame625360 rounded-md border justify-start items-start gap-2.5 inline-flex">
                      <div className="Ui text-sm font-bold leading-none tracking-wide">UIデザインを進める流れとは</div>
                    </div>
                  </div>
                </div>

                <div className="Stepmovielist self-stretch h-80 flex-col justify-start items-start flex">
                  {/* Item-listMovie */}
                 <ListMovie/>
                </div>
              </div>


          </div>
        </div>
      </main>
    </>
  );
}

