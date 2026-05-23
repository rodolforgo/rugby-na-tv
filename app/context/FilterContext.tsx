"use client";

import { createContext, useContext, useState } from "react";

const FilterContext = createContext({ query: "", setQuery: (_: string) => {} });

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  return <FilterContext.Provider value={{ query, setQuery }}>{children}</FilterContext.Provider>;
}

export function useFilter() {
  return useContext(FilterContext);
}
