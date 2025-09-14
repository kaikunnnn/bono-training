// products.js
const PLANID = {
  standard: {
    onemonth: process.env.NEXT_PUBLIC_PLAN_S_1M_PRICE_ID,
    threemonth: process.env.NEXT_PUBLIC_PLAN_S_3M_PRICE_ID,
  },
  growth: {
    onemonth: process.env.NEXT_PUBLIC_PLAN_G_1M_PRICE_ID,
    threemonth: process.env.NEXT_PUBLIC_PLAN_G_3M_PRICE_ID,
  },
  community: {
    all: process.env.NEXT_PUBLIC_PLAN_C_PRICE_ID,
  },
};

const PLANNAME = {
  // Firebaseに保存されている文字列
  premium_standard: "premium_standard",
  premium_growth: "premium_growth",
};

const PLICE = {
  standard: {
    name: "スタンダード",
    onemonth: "5,980",
    threemonth: "12,800",
  },
  growth: {
    name: "グロース",
    onemonth: "9,999",
    threemonth: "32,980", //
  },
};

export { PLANID, PLANNAME, PLICE };
