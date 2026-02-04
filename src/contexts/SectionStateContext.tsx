import React, { createContext, useContext, useState, useCallback } from 'react';

type SectionState = {
  query: string;
  sortBy: 'newest' | 'oldest' | 'title';
  showFilters: boolean;
  selectedTopics: string[];
  selectedTechs: string[];
  selectedStatuses: string[];
  visibleCount: number;
};

const DEFAULT_STATE: SectionState = { query: '', sortBy: 'newest', showFilters: true, selectedTopics: [], selectedTechs: [], selectedStatuses: [], visibleCount: 0 };

type SectionStateContextType = {
  getState: (category: string) => SectionState;
  setState: (category: string, patch: Partial<SectionState>) => void;
};

const SectionStateContext = createContext<SectionStateContextType | null>(null);

export const SectionStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<Record<string, SectionState>>({});

  const getState = useCallback(
    (category: string): SectionState => store[category] ?? DEFAULT_STATE,
    [store],
  );

  const setState = useCallback(
    (category: string, patch: Partial<SectionState>) =>
      setStore(prev => ({
        ...prev,
        [category]: { ...(prev[category] ?? DEFAULT_STATE), ...patch },
      })),
    [],
  );

  return (
    <SectionStateContext.Provider value={{ getState, setState }}>
      {children}
    </SectionStateContext.Provider>
  );
};

export const useSectionState = () => {
  const ctx = useContext(SectionStateContext);
  if (!ctx) throw new Error('useSectionState must be used within SectionStateProvider');
  return ctx;
};
