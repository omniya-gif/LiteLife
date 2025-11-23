import React, { createContext, useState, useContext } from 'react';

interface TransitionContextType {
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <TransitionContext.Provider value={{ isTransitioning, setIsTransitioning }}>
      {children}
    </TransitionContext.Provider>
  );
}

export const useTransition = () => {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within a TransitionProvider');
  }
  return context;
};
