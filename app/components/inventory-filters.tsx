import React from "react";

interface InventoryFiltersProps {
  gpuFilter: string;
  setGpuFilter: (filter: string) => void;
}

export function InventoryFilters({ gpuFilter, setGpuFilter }: InventoryFiltersProps) {
  return (
    <input
      type="text"
      placeholder="Filter by GPU"
      value={gpuFilter}
      onChange={(e) => setGpuFilter(e.target.value)}
      className="border rounded px-2 py-1"
    />
  );
}
