import { Button } from "@/components/common/ui/button";
import { PLANID, PLICE } from "@/stripe/planId";
import Link from "next/link";
import React from "react";

const ListItem = ({ children }) => (
  <li className="flex items-center">
    <svg
                className=" text-white text-xs bg-green-500 rounded-full mr-2 p-1"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
    {children}
  </li>
);

const PriceCardStandard = () => {
  return (
    <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3 md:gap-8">
      <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg dark:bg-zinc-850 justify-between border border-gray-300">
        <div>
          <h3 className="text-2xl font-bold text-center">
            {PLICE.standard.name} プラン
          </h3>
          <div className="mt-4 text-center text-zinc-600 dark:text-zinc-400">
            <span className="text-4xl font-bold">
              {PLICE.standard.threemonth}
            </span>
            / 月
          </div>
          <ul className="mt-4 space-y-2">
            <ListItem>720p Video Rendering</ListItem>
            <ListItem>2GB Cloud Storage</ListItem>
            <ListItem>Basic Video Templates</ListItem>
          </ul>
        </div>
        <div className="mt-6">
            <Link  href="/subscription/signup-standard-one">
                <Button
                variant="secondary"
                className="w-full font-bold"
                > 登録する
                </Button>
            </Link>
         
        </div>
      </div>
    </div>
  );
};

export default PriceCardStandard;
