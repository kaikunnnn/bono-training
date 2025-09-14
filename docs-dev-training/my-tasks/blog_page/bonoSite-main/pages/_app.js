import React from "react";
import "@/styles/globals.css";
import "@/styles/bg-category.css";

import { MemberstackProvider } from "@memberstack/react";
const config = { publicKey: process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY };

import FooterBlock from "@/components/common/layout/Navigation/Footer";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <MemberstackProvider config={config}>
        <div className="max-h-full bg-Top bg-cover text-slate-900 bg-no-repeat">
          <Component {...pageProps} />
        </div>
        <FooterBlock />
      </MemberstackProvider>
    </>
  );
}
export default MyApp;
