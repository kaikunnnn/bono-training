import React from 'react';
import Layout from '@/components/layout/Layout';
import ChatInterface from '@/components/ai/ChatInterface';

const AskAIPage = () => {
  return (
    <Layout headerGradient="none">
      <div className="h-[calc(100vh-64px)]">
        <ChatInterface />
      </div>
    </Layout>
  );
};

export default AskAIPage;
