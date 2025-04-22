"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InventoryTabProps {
  source: "global" | "internal";
}

interface InventoryItem {
  id: string;
  gpu: string;
  status: string;
  location: string;
  notes: string;
}

// Login form component to reduce complexity
const LoginForm = ({ onLogin, open, setOpen }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    onLogin(formData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-blue-600 font-medium">Login</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            name="email"
            type="email"
            required
          />
          <Input
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            name="password"
            type="password"
            required
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Stats component to display inventory statistics
const InventoryStats = ({ items }) => {
  const stats = {
    total: items.length,
    billed: items.filter(i => i.status === "billed").length,
    notBilled: items.filter(i => i.status === "not billed").length,
    consumed: items.filter(i => i.status === "consumed").length,
  };

  return (
    <div className="text-sm">
      <span>Total: {stats.total}</span> | <span>Billed: {stats.billed}</span> | 
      <span>Not Billed: {stats.notBilled}</span> | <span>Consumed: {stats.consumed}</span>
    </div>
  );
};

// Authentication component
const AuthSection = ({ userEmail, onSignOut, onSignIn }) => {
  const [loginOpen, setLoginOpen] = useState(false);
  
  return userEmail ? (
    <>
      <span className="text-gray-600">{userEmail}</span>
      <button onClick={onSignOut} className="text-red-600 font-medium">Logout</button>
    </>
  ) : (
    <LoginForm 
      onLogin={onSignIn} 
      open={loginOpen} 
      setOpen={setLoginOpen} 
    />
  );
};

export function InventoryTab({ source }: InventoryTabProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [gpuFilter, setGpuFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Partial<InventoryItem>>({});
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "id">>({
    gpu: "",
    status: "",
    location: "",
    notes: ""
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load data and check auth on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase.from(`${source}_inventory`).select("*");
        if (error) throw error;
        setItems(data as InventoryItem[]);
      } catch (error) {
        toast.error("Error loading inventory");
      }
    };

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserEmail(user.email);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .single();
          
        if (!error && data?.role === "admin") setIsAdmin(true);
      } catch (error) {
        console.error("Error checking admin status", error);
      }
    };

    fetchInventory();
    checkAuth();
  }, [source]);

  const handleSignIn = async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast.success("Login successful");
      location.reload();
    } catch (error) {
      toast.error("Login failed");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    location.reload();
  };

  // Filter items based on GPU filter
  const filteredItems = items.filter(item => 
    item.gpu.toLowerCase().includes(gpuFilter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Filter by GPU"
            value={gpuFilter}
            onChange={(e) => setGpuFilter(e.target.value)}
            className="border rounded px-2 py-1"
          />
          <InventoryStats items={filteredItems} />
        </div>
        <div className="text-sm space-x-2">
          <AuthSection 
            userEmail={userEmail} 
            onSignOut={handleSignOut} 
            onSignIn={handleSignIn} 
          />
        </div>
      </div>
      {/* Table remains unchanged */}
    </div>
  );
}
