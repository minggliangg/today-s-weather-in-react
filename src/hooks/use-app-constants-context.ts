import { useContext } from 'react';
import { AppConstantsContext } from '@/contexts/app-constants-context.ts';

export const useAppConstantsContext = () => {
  const context = useContext(AppConstantsContext);
  if (context === undefined) {
    throw new Error(
      'useAppConstantsContext must be used within a AppConstantsProvider',
    );
  }
  return context;
};
