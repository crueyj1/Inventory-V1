"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from(`${source}_inventory`)
        .select("*");

      if (error) console.error("Error loading inventory:", error);
      else setItems(data as InventoryItem[]);
    };

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .single();
        if (!error && data?.role === "admin") setIsAdmin(true);
      }
    };

    fetchInventory();
    checkAuth();
  }, [source]);

  const handleSignIn = async () => {
    const email = prompt("Enter your email") ?? "";
    const password = prompt("Enter your password") ?? "";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login failed");
    else location.reload();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  const filteredItems = items.filter((item) =>
    item.gpu.toLowerCase().includes(gpuFilter.toLowerCase())
  );

  const stats = {
    total: filteredItems.length,
    billed: filteredItems.filter((i) => i.status === "billed").length,
    notBilled: filteredItems.filter((i) => i.status === "not billed").length,
    consumed: filteredItems.filter((i) => i.status === "consumed").length,
  };

  const handleEdit = (item: InventoryItem) => {
    if (!isAdmin) return;
    setEditingId(item.id);
    setEditedItem(item);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from(`${source}_inventory`)
      .update(editedItem)
      .eq("id", editedItem.id);
    if (!error) {
      setItems((prev) =>
        prev.map((item) => (item.id === editedItem.id ? { ...item, ...editedItem } : item))
      );
      setEditingId(null);
      setEditedItem({});
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(`${source}_inventory`).delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAdd = async () => {
    const { data, error } = await supabase
      .from(`${source}_inventory`)
      .insert([newItem])
      .select();
    if (!error && data?.length) {
      setItems((prev) => [...prev, data[0]]);
      setNewItem({ gpu: "", status: "", location: "", notes: "" });
    }
  };

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
          <div className="text-sm">
            <span>Total: {stats.total}</span> | <span>Billed: {stats.billed}</span> | <span>Not Billed: {stats.notBilled}</span> | <span>Consumed: {stats.consumed}</span>
          </div>
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
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="border px-2">GPU</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Location</th>
            <th className="border px-2">Notes</th>
            {isAdmin && <th className="border px-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {isAdmin && userEmail && (
            <tr>
              <td className="border px-2 py-1">
                <input
                  value={newItem.gpu}
                  onChange={(e) => setNewItem({ ...newItem, gpu: e.target.value })}
                  className="border px-1"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  value={newItem.status}
                  onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  className="border px-1"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  className="border px-1"
                />
              </td>
              <td className="border px-2 py-1">
                <input
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="border px-1"
                />
              </td>
              <td className="border px-2 py-1">
                <button onClick={handleAdd} className="text-green-600 font-medium">Add</button>
              </td>
            </tr>
          )}
          {filteredItems.map((item) => (
            <tr key={item.id}>
              {editingId === item.id ? (
                <>
                  <td className="border px-2 py-1">
                    <input
                      value={editedItem.gpu || ""}
                      onChange={(e) => setEditedItem({ ...editedItem, gpu: e.target.value })}
                      className="border px-1"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      value={editedItem.status || ""}
                      onChange={(e) => setEditedItem({ ...editedItem, status: e.target.value })}
                      className="border px-1"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      value={editedItem.location || ""}
                      onChange={(e) => setEditedItem({ ...editedItem, location: e.target.value })}
                      className="border px-1"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      value={editedItem.notes || ""}
                      onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
                      className="border px-1"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <button onClick={handleSave} className="text-green-600 font-medium">Save</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border px-2 py-1">{item.gpu}</td>
                  <td className="border px-2 py-1">{item.status}</td>
                  <td className="border px-2 py-1">{item.location}</td>
                  <td className="border px-2 py-1">{item.notes}</td>
                  {isAdmin && userEmail && (
                    <td className="border px-2 py-1 space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600">Delete</button>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}