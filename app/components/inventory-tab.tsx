"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

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
interface LoginFormProps {
  onLogin: (credentials: { email: string; password: string }) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LoginForm = ({ onLogin, open, setOpen }: LoginFormProps) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Use a simplified dialog for now instead of importing UI components
  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)} 
        className="text-blue-600 font-medium hover:text-blue-800"
      >
        Login
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-md shadow-lg w-96 max-w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Login</h2>
          <button 
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              name="email"
              type="email"
              required
            />
          </div>
          <div>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              name="password"
              type="password"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

interface InventoryStatsProps {
  items: InventoryItem[];
}

// Stats component to display inventory statistics
const InventoryStats = ({ items }: InventoryStatsProps) => {
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

interface AuthSectionProps {
  userEmail: string | null;
  onSignOut: () => void;
  onSignIn: (credentials: { email: string; password: string }) => void;
}

// Authentication component
const AuthSection = ({ userEmail, onSignOut, onSignIn }: AuthSectionProps) => {
  const [loginOpen, setLoginOpen] = useState(false);
  
  return userEmail ? (
    <>
      <span className="text-gray-600">{userEmail}</span>
      <button onClick={onSignOut} className="text-red-600 font-medium hover:text-red-800 ml-2">Logout</button>
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
    status: "not billed",
    location: "",
    notes: ""
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load data and check auth on component mount
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from(`${source}_inventory`).select("*");
        if (error) throw error;
        setItems(data as InventoryItem[]);
        setError(null);
      } catch (err) {
        console.error("Error loading inventory:", err);
        setError("Failed to load inventory data");
        toast.error("Error loading inventory");
      } finally {
        setLoading(false);
      }
    };

    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (user) {
          setUserEmail(user.email ?? null);
          
          const { data, error: roleError } = await supabase
            .from("users")
            .select("role")
            .eq("email", user.email)
            .single();
          
          if (roleError) throw roleError;
          
          if (data?.role === "admin") {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      }
    };

    fetchInventory();
    checkAuth();
  }, [source]);

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      
      toast.success("Login successful");
      
      // Refresh page state instead of full reload
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email ?? null);
        
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .single();
        
        if (data?.role === "admin") {
          setIsAdmin(true);
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Login failed");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUserEmail(null);
      setIsAdmin(false);
      toast.success("Logged out");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed");
    }
  };

  const handleSave = async () => {
    if (!editedItem.id) return;
    
    try {
      const { error: updateError } = await supabase
        .from(`${source}_inventory`)
        .update(editedItem)
        .eq("id", editedItem.id);
        
      if (updateError) throw updateError;
      
      setItems((prev) =>
        prev.map((item) => (item.id === editedItem.id ? { ...item, ...editedItem } : item))
      );
      setEditingId(null);
      setEditedItem({});
      toast.success("Item updated successfully");
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error("Failed to update item");
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditedItem({ ...item });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const { error: deleteError } = await supabase
        .from(`${source}_inventory`)
        .delete()
        .eq("id", id);
      
      if (deleteError) throw deleteError;
      
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item deleted successfully");
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error("Failed to delete item");
    }
  };

  const handleAdd = async () => {
    if (!newItem.gpu || !newItem.location) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const { data, error: addError } = await supabase
        .from(`${source}_inventory`)
        .insert([newItem])
        .select();
        
      if (addError) throw addError;
      
      if (data?.length) {
        setItems((prev) => [...prev, data[0] as InventoryItem]);
        setNewItem({
          gpu: "",
          status: "not billed",
          location: "",
          notes: ""
        });
        toast.success("Item added successfully");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      toast.error("Failed to add item");
    }
  };

  // Filter items based on GPU filter
  const filteredItems = items.filter(item => 
    item.gpu.toLowerCase().includes(gpuFilter.toLowerCase())
  );

  if (loading) {
    return <div className="p-4 text-center">Loading inventory data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

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

      <div className="overflow-x-auto">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-4 py-2">GPU</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Location</th>
              <th className="border px-4 py-2">Notes</th>
              {isAdmin && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isAdmin && (
              <tr>
                <td className="border px-4 py-2">
                  <input
                    value={newItem.gpu}
                    onChange={(e) => setNewItem({...newItem, gpu: e.target.value})}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="GPU Model"
                  />
                </td>
                <td className="border px-4 py-2">
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({...newItem, status: e.target.value})}
                    className="w-full border px-2 py-1 rounded"
                  >
                    <option value="billed">Billed</option>
                    <option value="not billed">Not Billed</option>
                    <option value="consumed">Consumed</option>
                  </select>
                </td>
                <td className="border px-4 py-2">
                  <input
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="Location"
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="Notes"
                  />
                </td>
                <td className="border px-4 py-2">
                  <button 
                    onClick={handleAdd} 
                    className="text-green-600 font-medium hover:text-green-800"
                  >
                    Add
                  </button>
                </td>
              </tr>
            )}
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {editingId === item.id ? (
                  <>
                    <td className="border px-4 py-2">
                      <input
                        value={editedItem.gpu || ""}
                        onChange={(e) => setEditedItem({ ...editedItem, gpu: e.target.value })}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <select
                        value={editedItem.status || ""}
                        onChange={(e) => setEditedItem({ ...editedItem, status: e.target.value })}
                        className="w-full border px-2 py-1 rounded"
                      >
                        <option value="billed">Billed</option>
                        <option value="not billed">Not Billed</option>
                        <option value="consumed">Consumed</option>
                      </select>
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        value={editedItem.location || ""}
                        onChange={(e) => setEditedItem({ ...editedItem, location: e.target.value })}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <input
                        value={editedItem.notes || ""}
                        onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
                        className="w-full border px-2 py-1 rounded"
                      />
                    </td>
                    <td className="border px-4 py-2">
                      <button 
                        onClick={handleSave} 
                        className="text-green-600 font-medium hover:text-green-800"
                      >
                        Save
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border px-4 py-2">{item.gpu}</td>
                    <td className="border px-4 py-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'billed' ? 'bg-green-100 text-green-800' : 
                          item.status === 'not billed' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2">{item.location}</td>
                    <td className="border px-4 py-2">{item.notes}</td>
                    {isAdmin && (
                      <td className="border px-4 py-2 space-x-2">
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
