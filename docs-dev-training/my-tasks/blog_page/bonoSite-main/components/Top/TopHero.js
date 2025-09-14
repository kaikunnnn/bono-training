import { motion, Variants } from "framer-motion";

const item = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
    },
  },
  hidden: {
    opacity: 0,
    y: 10,
  },
};

function TopHero() {
  return (
    <motion.div
      variants={item}
      initial="hidden"
      animate="visible"
      className="flex-col m-auto gap-4 pt-24 pb-36 text-center justify-center"
    >
      <h1 className="md:text- font-hind font-extrabold text-8xl md:text-9xl">
        HOPE.
      </h1>
      <p className="text-xs md:text-sm tracking-wider text-gray-400">
      東京で個人開発するデザイナーの日常
      </p>
    </motion.div>
  );
}

export default TopHero;
