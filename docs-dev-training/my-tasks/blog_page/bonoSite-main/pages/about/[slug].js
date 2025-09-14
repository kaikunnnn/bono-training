import Header from "@/components/common/layout/Navigation/Header";
import SEO from "@/components/common/layout/Navigation/SEO";
import Head from 'next/head';
import ArticleAbout from "@/components/About/layout/Article";

// Newt
import { getContents, getContentsBySlug } from '@/libs/newt';
import { useEffect, useState } from "react";
import Link from "next/link";
import MenuToggle from "@/components/About/layout/MenuStance";
import Breadcrumbs from "@/components/common/layout/Breadcrumb";
import NextArticleLink from "@/components/About/layout/NextArticleLink";

// [article]のパスを生成する
export async function getStaticPaths() {
  const articles = await getContents();
  const paths = articles.map((article) => ({
    params: { slug: article.slug },
  }));
  return { paths, fallback: false };
}

// データから情報を取ってくる
export async function getStaticProps({ params }) {
  // 特定のシリーズのみの記事を取得
  const allArticles = await getContents();
  const articles = allArticles.filter(article => article.series?.slug === 'about');
  let article = null;

  // paramsが存在する場合、特定の記事を取得
  if (params && params.slug) {
    article = await getContentsBySlug(params.slug);
  }

  return {
    props: {
      article,
      Contents: articles,
    },
  };
}

export default function ContentDetail({ article,Contents }) {
  // パンクズリストのデータ
  const breadcrumbs = [
    { title: 'アバウト', href: '/about' },
    { title: 'スタンス', href: '/about/#stance' },
    { title: article.title, href: `/about/${article.slug}` },
  ];
   // Description: HTMLをプレーンテキストに変換
   const [articleDescription, setArticleDescription] = useState(""); // ステートを作成

    useEffect(() => {
      const dummyDiv = document.createElement('div'); 
      dummyDiv.innerHTML = article.body;

      let textContent = dummyDiv.textContent || dummyDiv.innerText;
      // 最初の140文字だけを取得
      textContent = textContent.substring(0, 140);

      setArticleDescription(textContent);  // ステートを更新
    }, [article]);  // 依存配列にarticleを追加

    // articleが存在することをチェック
  if (!article) {
    return <div>Article not found</div>;
  }



  return (<>
   <Head>
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={`${article.title} | BONO BLOG`}/>
    <meta name="twitter:description" content={article.description} />
   </Head>
   <SEO 
            title={`${article.title} | BONO BLOG`}
            description={article.description}
            ogTitle={`${article.title} | BONO BLOG`}
            ogDescription={article.description}
            ogWidth='160'
            ogHeight="160">
        </SEO>

    <div className="" style={{ backgroundColor: '#F3F2EE' }}>
      <Header />
      
      <div className="ContentSection m-auto py-20 w-10/12 md:w-[600px]">
        <Breadcrumbs crumbs={breadcrumbs} className="w-10/12 " />
        <ArticleAbout article={article} className="w-10/12 " />
        <hr className="w-full border-gray-300 mt-24 mb-0" />
        <NextArticleLink currentArticle={article} allArticles={Contents} />
      </div>
      <div className="m-auto mt-8 pb-64" >
         <MenuToggle aboutContents={Contents}/>  
      </div>
    </div>
  </>);
}
