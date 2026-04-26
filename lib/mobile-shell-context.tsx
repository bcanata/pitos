"use client";

import { createContext, useContext, useEffect, useState, startTransition } from "react";
import { usePathname } from "next/navigation";

interface MobileShellCtx {
  sidebarOpen: boolean;
  rightOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  setRightOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  toggleRight: () => void;
}

const MobileShellContext = createContext<MobileShellCtx>({
  sidebarOpen: false,
  rightOpen: false,
  setSidebarOpen: () => {},
  setRightOpen: () => {},
  toggleSidebar: () => {},
  toggleRight: () => {},
});

export function MobileShellProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close both drawers when the route changes (e.g. picking a channel).
  useEffect(() => {
    startTransition(() => {
      setSidebarOpen(false);
      setRightOpen(false);
    });
  }, [pathname]);

  return (
    <MobileShellContext.Provider
      value={{
        sidebarOpen,
        rightOpen,
        setSidebarOpen,
        setRightOpen,
        toggleSidebar: () => setSidebarOpen((v) => !v),
        toggleRight: () => setRightOpen((v) => !v),
      }}
    >
      {children}
    </MobileShellContext.Provider>
  );
}

export function useMobileShell() {
  return useContext(MobileShellContext);
}
