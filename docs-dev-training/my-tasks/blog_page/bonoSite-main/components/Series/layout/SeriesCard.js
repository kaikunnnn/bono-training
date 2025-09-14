import Link from "next/link";
import dayjs from "dayjs";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { CardTitle, CardDescription, CardContent, CardFooter, Card  } from "../../common/ui/card";
import { Button } from "../../common/ui/button";

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

export default function SeriesCard({ props }) {
  return (
    <>
    <Link href={`/series/${props.slug}`} className="hover:opacity-80 bg-white flex-1">
      <motion.li
          variants={item}
          className=""
          key={props.slug}
        >
        <Card>
          <CardContent className="mt-1">
          <div className="flex justify-center items-center">
              <img
                alt="series cover image"
                className="object-cover w-auto h-full rounded-md"
                height="60"
                src={props.coverbook ? props.coverbook.src : 'デフォルトの画像URL'}
                style={{
                  aspectRatio: "52/80",
                  objectFit: "cover",
                }}
                width="40"
              />
            </div>
              
              <CardTitle className="text-lg font-semibold mt-1">{props.title}</CardTitle>
              <CardDescription className="text-base text-gray-500 dark:text-gray-400 mt-1">
                Description for the card.
                {props.category?.name}
              </CardDescription>
              <time dateTime="" className="text-xs text-left	 text-gray-400">
                {dayjs(props._sys.raw.createdAt).format("YYYY年MM月DD日")}
                </time>
            </CardContent>
            <CardFooter className="mt-2">
              <Button variant="default">Click Me</Button>
            </CardFooter>
        </Card>
      </motion.li>
    </Link>
    
    </>
  );
}
