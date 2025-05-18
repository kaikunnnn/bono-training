
import React from 'react';
import TrainingLayout from '@/components/training/TrainingLayout';
import TrainingHeader from '@/components/training/TrainingHeader';
import { Skeleton } from '@/components/ui/skeleton';

const TaskDetailSkeleton = () => {
  return (
    <TrainingLayout>
      <TrainingHeader />
      <div className="container py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-[300px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    </TrainingLayout>
  );
};

export default TaskDetailSkeleton;
