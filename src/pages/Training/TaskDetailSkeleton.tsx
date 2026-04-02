import React from 'react';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const TaskDetailSkeleton = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    </Layout>
  );
};

export default TaskDetailSkeleton;
