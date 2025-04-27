
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TrainingSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const TrainingSearch: React.FC<TrainingSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-[300px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="トレーニングを検索"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default TrainingSearch;
