
import React, { createContext, useContext, ReactNode } from 'react';
import { useSubscription, SubscriptionState } from '@/hooks/useSubscription';

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const subscription = useSubscription();
  
  return (
    <SubscriptionContext.Provider value={subscription}>
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
