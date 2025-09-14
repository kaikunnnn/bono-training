import { useState, useEffect } from "react";
import { useMemberstack } from "@memberstack/react";

const useMemberInfo = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [plans, setPlans] = useState([]);
  const memberstack = useMemberstack();

  useEffect(() => {
    setIsLoading(true);
    memberstack
      .getCurrentMember()
      .then(({ data: member }) => {
        setMember(member);
        if (member && member.planConnections) {
          setPlans(member.planConnections);
          console.log(
            "ログインしているユーザーのプラン:",
            member.planConnections.map((plan) => plan.id)
          );
        } else {
          console.log(
            "ログインしているユーザーはいません、またはプランに属していません。"
          );
        }
      })
      .catch((error) => console.error("Error fetching member details:", error))
      .finally(() => setIsLoading(false));
  }, [memberstack]);

  return { isLoading, member, plans };
};

export default useMemberInfo;
