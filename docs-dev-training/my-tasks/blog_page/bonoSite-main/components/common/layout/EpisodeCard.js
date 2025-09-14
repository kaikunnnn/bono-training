import Link from "next/link";
import dayjs from "dayjs";
import { motion, Variants } from "framer-motion";
import Image from "next/image";

// Framer Motion Style
const item = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show:{
      opacity:1,
      y:0,
      transition:{
          duration:0.48,
      }
  }
};

export default function EpisodeCard({ article }) {
  return (
    <>
      <Link href={`/content/${article.slug}`} className="hover:opacity-80">
        <motion.li
          variants={item}
          className="hover:bg-gray-100 bg-white rounded-2xl p-3 md:p-3 pr-3 md:pr-6  min-h-full shadow-sm list-none	"
          key={article.slug}
        >
          <div className="flex content-between items-center gap-3 md:gap-8">
            <div className={`flex items-center justify-center content bg-${article.tags?.slug} w-4/12 md:w-4/12 h-full md:h-32 py-10  rounded-xl`}>
              <Image className="md:w-16 md:h-16 w-8 h-8" src={article.emoji?.src} width={48} height={48} alt="emoji Image" />
            </div>
            <div className="w-8/12 flex flex-col gap-1 md:gap-2">
              <h4 className="text-lg md:text-base text-slate-900 font-bold text-left	">
                {article.title}
              </h4>
              <div className="flex gap-3">
                <span className="text-xs text-left text-gray-400">{article.tags.name}</span>
                <time dateTime="" className="text-xs text-left	 text-gray-400">
                {dayjs(article.tags._sys.createdAt).format("YYYY年MM月DD日")}
                </time>
              </div>
              
            </div>
          </div>
        </motion.li>
      </Link>
    </>
  );
}
