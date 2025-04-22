import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface InventoryItem {
  id: string;
  gpu: string;
  status: string;
  location: string;
  notes: string;
}

export interface InventoryStats {
  total: number;
  billed: number;
  notBilled: number;
  consumed: number;
}

export function useInventory(source: "global" | "internal") {
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

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      const { data, error } = await supabase
        .from(`${source}_inventory`)
        .select("*");

      if (error) console.error("Error loading inventory:", error);
      else setItems(data as InventoryItem[]);
    };

    fetchInventory();
  }, [source]);

  // Filter items based on GPU filter
  const filteredItems = items.filter((item) =>
    item.gpu.toLowerCase().includes(gpuFilter.toLowerCase())
  );

  // Calculate stats
  const stats: InventoryStats = {
    total: filteredItems.length,
    billed: filteredItems.filter((i) => i.status === "billed").length,
    notBilled: filteredItems.filter((i) => i.status === "not billed").length,
    consumed: filteredItems.filter((i) => i.status === "consumed").length,
  };

  // Handle editing an item
  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditedItem(item);
  };

  // Save edited item
  const handleSave = async () => {
    if (!editedItem.id) return;
    
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

  // Delete an item
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from(`${source}_inventory`).delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Add a new item
  const handleAdd = async (newItemData: Omit<InventoryItem, "id">) => {
    const { data, error } = await supabase
      .from(`${source}_inventory`)
      .insert([newItemData])
      .select();
      
    if (!error && data?.length) {
      setItems((prev) => [...prev, data[0]]);
      return true;
    }
    return false;
  };

  return {
    items,
    filteredItems,
    stats,
    gpuFilter,
    setGpuFilter,
    editingId,
    editedItem,
    setEditedItem,
    newItem,
    setNewItem,
    handleEdit,
    handleSave,
    handleDelete,
    handleAdd,
  };
}
