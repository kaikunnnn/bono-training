import React, { useState } from "react";
// component
import Header from "@/components/common/layout/Navigation/Header";
import { PLANID, PLICE } from "@/stripe/planId";
import { Button } from "@/components/common/ui/button";
import PriceCardStandard from "@/components/Plan/layout/PriceCardStandard";

const Plan = () => {

  return (
    <>
    <Header/>
    
    <section className="Containers py-20 px-4 md:px-6">
      <h1 className="text-2xl font-bold ">UIデザインプラン</h1>

      {/* Not Member - SignUp&RegisterMember */}
      <PriceCardStandard></PriceCardStandard>
         {/* For Member - ChangePlan */}
    </section>
    
    </>
  );
};

export default Plan;
