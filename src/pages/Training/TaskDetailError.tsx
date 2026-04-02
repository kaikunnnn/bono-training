
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TaskDetailError = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/training');
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">タスクが見つかりませんでした</h2>
          <p className="text-muted-foreground mb-8">
            指定されたタスクは存在しないか、アクセスできません。
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDetailError;
