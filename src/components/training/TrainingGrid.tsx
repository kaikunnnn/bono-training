import React from "react";
import type { Training } from "@/types/training";
import TrainingCard from "./TrainingCard";

interface TrainingGridProps {
  trainings: Training[];
}

const TrainingGrid: React.FC<TrainingGridProps> = ({ trainings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12 justify-items-start">
      {trainings.map((training) => (
        <TrainingCard key={training.id} training={training} />
      ))}
    </div>
  );
};

export default TrainingGrid;
