import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type TooltipContextType = {
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
  toggle: (id: string) => void;
};

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltipManager = (): TooltipContextType => {
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error('useTooltipManager must be used within TooltipProvider');
  }
  return ctx;
};

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const toggle = useCallback((id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  }, []);

  const value = useMemo(() => ({ openId, open, close, toggle }), [openId, open, close, toggle]);

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
};

export default TooltipProvider;


