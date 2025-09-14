import { Inter } from "next/font/google";
import { motion, Variants } from "framer-motion";

// Newt
import { getArticles } from "@/libs/newt";

// Components
import Header from "@/components/common/layout/Navigation/Header";
import EpisodeCard from "@/components/common/layout/EpisodeCard";
import TitleSection from "@/components/common/layout/TitleSection";
import SunTop from "@/components/common/layout/SunTop";
import TopHero from "@/components/Top/TopHero";
import Link from "next/link";
import SEO from "@/components/common/layout/Navigation/SEO";

// Framer Motion
const ullist = {
  hidden: {
    opacity: 0,
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.48,
      delay: 0.24,
    },
  },
};

// Get the content data
export async function getStaticProps() {
  // Fetch articles from Newt
  const articles = await getArticles();

  return {
    props: {
      newtArticles: articles,
    },
  };
}

const inter = Inter({ subsets: ["latin"] });

export default function Home({ article, newtArticles }) {
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
        <SunTop />

        <div className="HomeEyecatch w-full flex justify-center pt-20 mb-12">
          <TopHero />
        </div>

        {/* Article List from Contentful*/}
        <div className="Article m-auto w-11/12 md:w-7/12 grid text-center lg:mb-0  lg:text-left">
          <TitleSection />
          <motion.ul
            className="flex-col flex gap-3"
            variants={ullist}
            initial="hidden"
            animate="show"
          >
            {newtArticles.map((article) => (
              <EpisodeCard key={article._id} article={article} />
            ))}
          </motion.ul>
        </div>
      </main>
    </>
  );
}
