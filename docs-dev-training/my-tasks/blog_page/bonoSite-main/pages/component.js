import React from "react";
import { Button } from "@/components/common/ui/button";
// Icon - named lucide
import { LogIn } from "lucide-react";

const variants = [
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
];
const sizes = ["default", "sm", "lg", "icon"];

function Component({}) {
  return (
    <>
      <main className="max-h-full text-slate-900">
        <div className="bg-gray flex flex-col justify-center">
          {variants.map((variant) =>
            sizes.map((size) => (
              <div
                key={`${variant}-${size}`}
                className="flex  justify-center p-8 px-96 w-[200px]"
              >
                <Button variant={variant} size={size}>
                  {variant} {size}
                </Button>
              </div>
            ))
          )}
        </div>
        <Button variant="default" size="icon">
          <LogIn className="mr-2 h-4 w-4" />
        </Button>

        {variants.map((variant) =>
          sizes.map((size) => (
            <div
              key={`${variant}-${size}-login`}
              className="flex justify-center p-8 px-96 w-[200px]"
            >
              <Button variant={variant} size={size}>
                <LogIn className="mr-2 h-4 w-4" /> ログイン {variant} {size}
              </Button>
            </div>
          ))
        )}
      </main>
    </>
  );
}

export default Component;
