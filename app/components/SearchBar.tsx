"use client";

import { useFilter } from "@/app/context/FilterContext";

export default function SearchBar() {
  const { query, setQuery } = useFilter();
  return (
    <input
      type="search"
      placeholder="Filtrar por time ou liga..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="input input-sm input-bordered w-full max-w-xs"
    />
  );
}
