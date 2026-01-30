// Second Brain Hub Context — shared state between hub sidebar and view

import React, { createContext, useContext } from 'react';
import { useSecondBrainHub } from '../hooks/useSecondBrainHub';

type HubContextType = ReturnType<typeof useSecondBrainHub>;

const SecondBrainHubContext = createContext<HubContextType | null>(null);

export const SecondBrainHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hub = useSecondBrainHub();
  return (
    <SecondBrainHubContext.Provider value={hub}>
      {children}
    </SecondBrainHubContext.Provider>
  );
};

export const useHub = (): HubContextType | null => {
  return useContext(SecondBrainHubContext);
};
