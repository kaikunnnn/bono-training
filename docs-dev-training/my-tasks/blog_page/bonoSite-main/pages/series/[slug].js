// pages/series.js
import SEO from '@/components/common/layout/Navigation/SEO';
import About from '@/components/Series/layout/About';
import SeriesTop from '@/components/Series/SeriesTop';
import React from 'react';

// Newt
import { getSeries, getSeriesBySlug, getContents} from '@/libs/newt';

// Component
import HeadingSeries from '@/components/Series/HeadingSeries';
import ContentItem from '@/components/Series/ContentItem';
import ContentTitle from '@/components/Series/ContentTitle';
import Header from '@/components/common/layout/Navigation/Header';
import SunTop from '@/components/common/layout/SunTop';

// [series]のパスを生成する
export async function getStaticPaths() {
  const serieses = await getSeries();
  const paths = serieses.map((series) => ({
    params: { slug: series.slug },
  }));
  return { paths, fallback: false };
}



// データから情報を取ってくる
export async function getStaticProps({ params }) {
  // Fetch Series
  const series = await getSeriesBySlug(params.slug);
  // Fetch articles from Newt
  const contents = await getContents();

  return { 
    props: { 
      series ,
      newtContents: contents, 
    } 
  };
}


export default function SeriesDetail({ series,newtContents }) {
  console.log(newtContents.seriesoreder);
  // 現在のページのslugと一致するコンテンツをフィルタリング
  const filteredContents = newtContents.filter(content => {
    return content.series && content.series._id === series._id; });

  // "series.seriesorder"によってコンテンツをソート
  const sortedContents = filteredContents.sort((a, b) => a.seriesorder - b.seriesorder);
  return (
    <>
      <SEO
        title="BONOブログ 東京で個人開発する1人デザイナーの日常" 
        description="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。" 
        imgUrl="https:kaikun.bo-no.blog/ogp-bonoblog.jpg"
        ogTitle="BONOブログ 東京で個人開発する1人デザイナーの日常"
        ogDescription="UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。"
        ogWidth='1200'
        ogHeight="600"
      >
      </SEO>
      <main className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
      <Header />
      <SunTop />
        <div className="Article m-auto w-11/12 md:w-7/12 grid text-center lg:mb-0  lg:text-left">
          <SeriesTop props={series}/>

          <div className='ContentSection'>
            <About props={series}/>
            <div className="Contentlists w-full flex-col justify-start items-start gap-12 inline-flex">
                <HeadingSeries props={"内容"}/>
                
                <div className="Contentsection flex-col justify-start items-start gap-12 flex">
                  {
                    sortedContents.map(content => {
                      if (content && content.hasOwnProperty("title-or-not")) { // contentがnullやundefinedでない、かつ"title-or-not"プロパティを持つ場合
                        if (content["title-or-not"]) {
                          // title-or-notがtrueの場合の表示
                          return (
                            <>
                            <ContentTitle key={content._id} props={content} />
                            </>
                          );
                        } else {
                          // title-or-notがfalseの場合の表示（異なるコンポーネントやスタイルを適用）
                          return (
                            <ContentItem key={content._id} props={content} path={series.slug} />
                          );
                        }
                      } else {
                        // contentがnullやundefined、または"title-or-not"プロパティを持っていない場合
                        return null; // 何も表示しない（または適当なデフォルトコンポーネントを表示）
                      }
                      
                    })
                  }
                </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

