"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProto } from "./ProtoProvider";

/** 入口の「最初からやり直す」 */
export function ResetButton() {
  const { dispatch } = useProto();
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        onClick={() => {
          dispatch({ type: "reset" });
          setDone(true);
        }}
      >
        <RotateCcw />
        最初からやり直す
      </Button>
      {done && (
        <p role="status" className="text-xs text-text-success">
          最初の状態に戻しました
        </p>
      )}
    </div>
  );
}
