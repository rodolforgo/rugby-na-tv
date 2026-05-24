"use client";

import { useFilter } from "@/app/shared/context/FilterContext";

export default function SearchBar({ className }: { className?: string }) {
  const { query, setQuery } = useFilter();
  return (
    <input
      type="search"
      placeholder="Filtrar por time ou liga..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className={`input input-sm input-bordered ${className ?? "w-full max-w-sm"}`}
    />
  );
}
