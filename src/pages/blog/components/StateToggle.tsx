// src/pages/blog/components/StateToggle.tsx
import { Button } from "@/components/ui/button";

interface StateToggleProps {
  states: string[];
  currentState: string;
  onStateChange: (state: string) => void;
  className?: string;
}

export const StateToggle: React.FC<StateToggleProps> = ({
  states,
  currentState,
  onStateChange,
  className = ""
}) => {
  return (
    <div className={`flex flex-wrap gap-2 mb-4 ${className}`}>
      <span className="text-sm font-medium text-gray-700 flex items-center mr-2">
        表示状態:
      </span>
      {states.map((state) => (
        <Button
          key={state}
          variant={currentState === state ? "default" : "outline"}
          size="sm"
          onClick={() => onStateChange(state)}
          className="text-xs"
        >
          {state}
        </Button>
      ))}
    </div>
  );
};

export default StateToggle;