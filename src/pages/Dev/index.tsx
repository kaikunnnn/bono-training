/**
 * Dev環境専用ルート
 * 開発環境でない場合はホームにリダイレクト
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

interface DevRouteProps {
  children: React.ReactNode;
}

const DevRoute = ({ children }: DevRouteProps) => {
  // 開発環境でない場合はホームにリダイレクト
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DevRoute;
