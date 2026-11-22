import { createContext, useContext, type ReactNode } from 'react';
import type { useStudioController } from '../hooks/useStudioController';

export type StudioController = ReturnType<typeof useStudioController>;

const StudioContext = createContext<StudioController | null>(null);

export function StudioProvider({
  value,
  children,
}: {
  value: StudioController;
  children: ReactNode;
}) {
  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}

export function useStudio(): StudioController {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return ctx;
}

