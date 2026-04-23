"use client";

import { createContext, useContext } from "react";
import type { Bundle } from "./index";
import { t as tFn } from "./index";

const I18nContext = createContext<Bundle>({});

export function I18nProvider({
  bundle,
  children,
}: {
  bundle: Bundle;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={bundle}>{children}</I18nContext.Provider>;
}

export function useT() {
  const bundle = useContext(I18nContext);
  return (key: string, vars?: Record<string, string>) => tFn(bundle, key, vars);
}
