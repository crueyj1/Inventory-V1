"use client";

import React from "react";
import { useInventory } from "../hooks/use-inventory";
import { useAuth } from "../hooks/use-auth";
import { InventoryTable } from "../components/inventory-table";
import { InventoryStats } from "../components/inventory-stats";
import { InventoryFilters } from "../components/inventory-filters";
import { AddInventoryForm } from "./add-inventory-form";

interface InventoryTabProps {
  source: "global" | "internal";
}

export function InventoryTab({ source }: InventoryTabProps) {
  const { 
    items, 
    filteredItems, 
    stats, 
    gpuFilter, 
    setGpuFilter, 
    handleAdd, 
    handleEdit, 
    handleSave, 
    handleDelete,
    editingId,
    editedItem,
    setEditedItem,
    loading,
    error
  } = useInventory(source);

  const { userEmail, isAdmin, handleSignIn, handleSignOut } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <InventoryFilters gpuFilter={gpuFilter} setGpuFilter={setGpuFilter} />
          <InventoryStats stats={stats} />
        </div>
        <div className="text-sm space-x-2">
          {userEmail ? (
            <>
              <span className="text-gray-600">{userEmail}</span>
              <button onClick={handleSignOut} className="text-red-600 font-medium">Logout</button>
            </>
          ) : (
            <button onClick={handleSignIn} className="text-blue-600 font-medium">Login</button>
          )}
        </div>
      </div>

      <InventoryTable
        items={filteredItems}
        isAdmin={isAdmin}
        userEmail={userEmail}
        editingId={editingId}
        editedItem={editedItem}
        setEditedItem={setEditedItem}
        handleEdit={handleEdit}
        handleSave={handleSave}
        handleDelete={handleDelete}
        renderAddForm={() => isAdmin && userEmail && <AddInventoryForm onAdd={handleAdd} />}
        loading={loading}
        error={error}
      />
    </div>
  );
}