
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

const TrainingHome: React.FC = () => {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">BONO Training</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* ハードコード版。後にAPIから動的に取得 */}
          <Link 
            to="/training/ui-todo" 
            className="bg-white rounded-xl shadow-training-card p-6 hover:opacity-90 transition-opacity"
          >
            <h2 className="text-xl font-bold mb-2">ToDoアプリのUIを作ろう</h2>
            <span className="inline-block bg-training/10 text-training px-2 py-1 rounded-full text-sm">
              難易度: 普通
            </span>
            <p className="mt-3 text-gray-600">シンプルなToDoアプリのUIデザインを学びます</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingHome;
