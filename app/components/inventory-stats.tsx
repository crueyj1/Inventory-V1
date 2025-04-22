import React from "react";
import { InventoryStats as StatsType } from "../hooks/use-inventory";

interface InventoryStatsProps {
  stats: StatsType;
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  return (
    <div className="text-sm">
      <span>Total: {stats.total}</span> | 
      <span> Billed: {stats.billed}</span> | 
      <span> Not Billed: {stats.notBilled}</span> | 
      <span> Consumed: {stats.consumed}</span>
    </div>
  );
}
