
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    // エラー発生時にstateを更新
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログ
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    // エラーが発生した場合はフォールバックUIを表示
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
