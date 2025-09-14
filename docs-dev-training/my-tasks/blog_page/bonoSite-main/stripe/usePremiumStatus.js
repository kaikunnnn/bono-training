import { useState, useEffect } from "react";
import getUserPlan from "./getUserPlan";

export default function usePremiumStatus(user) {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    if (user) {
      const checkUserPlan = async function () {
        setPlan(await getUserPlan());
      };
      checkUserPlan();
    }
  }, [user]);

  return plan;
}