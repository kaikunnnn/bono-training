
import React from 'react';

interface TrainingLayoutProps {
  children: React.ReactNode;
}

const TrainingLayout: React.FC<TrainingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="min-h-screen bg-white/80 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

export default TrainingLayout;
