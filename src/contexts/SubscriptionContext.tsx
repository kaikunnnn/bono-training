
import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription, SubscriptionState } from '@/hooks/useSubscription';

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  /**
   * テスト用にSubscription状態を上書きするためのプロパティ
   */
  overrideValue?: SubscriptionState;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ 
  children, 
  overrideValue 
}) => {
  const subscription = useSubscription();
  
  // overrideValueが提供された場合はそれを使用し、それ以外の場合は実際のサブスクリプション状態を使用
  const contextValue = overrideValue || subscription;
  
  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscriptionContext = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
};
