import { useState, useEffect, useMemo, useCallback } from "react";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, "id">>({
    gpu: "",
    status: "",
    location: "",
    notes: ""
  });

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from(`${source}_inventory`)
          .select("*")
          .order('gpu', { ascending: true });

        if (fetchError) throw fetchError;
        setItems(data as InventoryItem[]);
        setError(null);
      } catch (err) {
        console.error("Error loading inventory:", err);
        setError("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [source]);

  // Filter items based on GPU filter with memoization
  const filteredItems = useMemo(() => 
    items.filter((item) =>
      item.gpu.toLowerCase().includes(gpuFilter.toLowerCase())
    ),
    [items, gpuFilter]
  );

  // Calculate stats with memoization
  const stats: InventoryStats = useMemo(() => ({
    total: filteredItems.length,
    billed: filteredItems.filter((i) => i.status === "billed").length,
    notBilled: filteredItems.filter((i) => i.status === "not billed").length,
    consumed: filteredItems.filter((i) => i.status === "consumed").length,
  }), [filteredItems]);

  // Handle editing an item
  const handleEdit = useCallback((item: InventoryItem) => {
    setEditingId(item.id);
    setEditedItem(item);
  }, []);

  // Save edited item
  const handleSave = useCallback(async () => {
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
      setError(null);
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item");
    }
  }, [editedItem, source]);

  // Delete an item
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      const { error: deleteError } = await supabase
        .from(`${source}_inventory`)
        .delete()
        .eq("id", id);
      
      if (deleteError) throw deleteError;
      
      setItems((prev) => prev.filter((item) => item.id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item");
    }
  }, [source]);

  // Add a new item
  const handleAdd = useCallback(async (newItemData: Omit<InventoryItem, "id">) => {
    try {
      const { data, error: addError } = await supabase
        .from(`${source}_inventory`)
        .insert([newItemData])
        .select();
        
      if (addError) throw addError;
      
      if (data?.length) {
        setItems((prev) => [...prev, data[0]]);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item");
      return false;
    }
  }, [source]);

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
    loading,
    error,
  };
}
