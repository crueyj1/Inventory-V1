"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import { useInventory } from "../hooks/use-inventory";
import { InventoryStats } from "./inventory-stats";
import { InventoryFilters } from "./inventory-filters";
import { InventoryTable } from "./inventory-table";
import { AddInventoryForm } from "./add-inventory-form";
import { Loading } from "./ui/loading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Login form component
interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string }) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LoginForm = ({ onLogin, open, setOpen }: LoginFormProps) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLogin(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              type="email"
              required
            />
          </div>
          <div>
            <Input
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              name="password"
              type="password"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function InventoryTab({ source }: { source: "global" | "internal" }) {
  const [loginOpen, setLoginOpen] = useState(false);
  
  const { 
    isAdmin, 
    userEmail, 
    handleSignIn, 
    handleSignOut, 
    loading: authLoading,
    error: authError 
  } = useAuth();
  
  const {
    filteredItems,
    stats,
    gpuFilter,
    setGpuFilter,
    editingId,
    editedItem,
    setEditedItem,
    handleEdit,
    handleSave,
    handleDelete,
    handleAdd,
    loading,
    error
  } = useInventory(source);

  const handleLoginAttempt = async (credentials: { email: string; password: string }) => {
    try {
      await handleSignIn(credentials.email, credentials.password);
      setLoginOpen(false);
      toast.success("Login successful");
    } catch (err) {
      toast.error("Login failed: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const renderAddForm = () => {
    if (!isAdmin || !userEmail) return null;
    
    return (
      <AddInventoryForm onAdd={handleAdd} />
    );
  };

  if (loading || authLoading) {
    return <Loading message={`Loading ${source} inventory data...`} />;
  }

  if (error || authError) {
    return (
      <div className="p-4 text-red-500 border rounded bg-red-50">
        {error || authError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <InventoryFilters gpuFilter={gpuFilter} setGpuFilter={setGpuFilter} />
          <InventoryStats stats={stats} />
        </div>
        
        <div className="text-sm space-x-2">
          {userEmail ? (
            <>
              <span className="text-gray-600">{userEmail}</span>
              <Button 
                onClick={handleSignOut}
                variant="destructive"
                size="sm"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setLoginOpen(true)}
                variant="default"
                size="sm"
              >
                Login
              </Button>
              <LoginForm 
                onLogin={handleLoginAttempt} 
                open={loginOpen} 
                setOpen={setLoginOpen} 
              />
            </>
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
        renderAddForm={renderAddForm}
      />
    </div>
  );
}
