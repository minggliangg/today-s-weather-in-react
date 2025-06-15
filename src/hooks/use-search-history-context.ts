import { useContext } from 'react';
import { SearchHistoryContext } from '@/contexts/search_history-context.ts';

export const useSearchHistoryContext = () => {
  const context = useContext(SearchHistoryContext);
  if (context === undefined) {
    throw new Error(
      'UseSearchHistoryContext must be used within a SearchHistoryProvider',
    );
  }
  return context;
};
