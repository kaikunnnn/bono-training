import { VFC } from 'react'
import Head from 'next/head'

function SEO({title,description,ogUrl,imgUrl,ogTitle,ogDescription,ogImage,ogWidth,ogHeight}) {
  return (
    <Head>
       <title>{title}</title>
       <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:site_name" content="BONOブログ 東京で個人開発する1人デザイナーの日常" />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content={ogWidth} />
      <meta property="og:image:height" content={ogHeight}/>
      <link rel="icon" href="/favicon.ico" sizes="any"></link>
    </Head>
  )
}

// Set the default props - デフォルト値を設定
SEO.defaultProps = {
  title: 'BONOブログ 東京で個人開発する1人デザイナーの日常',
  description: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。',
  ogUrl: 'https:kaikun.bo-no.blog',
  ogTitle: 'BONOブログ 東京で個人開発する1人デザイナーの日常',
  ogDescription: 'UIとUXのデザインスキルが身に付く動画コンテンツサービス「BONO」を運営するカイクンの個人ブログです。',
  ogImage: 'https:kaikun.bo-no.blog/ogp-bonoblog.jpg',
  ogWidth: '1200',
  ogHeight: '630'
};


export default SEO
