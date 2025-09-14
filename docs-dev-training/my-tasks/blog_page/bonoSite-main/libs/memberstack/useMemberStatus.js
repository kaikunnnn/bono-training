import { useState, useEffect } from "react";
import { useMemberstack } from "@memberstack/react";

const useMemberStatus = () => {
  const [member, setMember] = useState(null);
  const memberstack = useMemberstack();

  useEffect(() => {
    memberstack
      .getCurrentMember()
      .then(({ data: member }) => {
        setMember(member);
      })
      .catch((error) => console.error("Error fetching member details:", error));
  }, [memberstack]);

  return member;
};

export default useMemberStatus;
