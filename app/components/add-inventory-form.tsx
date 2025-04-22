import React, { useState } from "react";

interface AddInventoryFormProps {
  onAdd: (item: {
    gpu: string;
    status: string;
    location: string;
    notes: string;
  }) => Promise<boolean>;
}

export function AddInventoryForm({ onAdd }: AddInventoryFormProps) {
  const [newItem, setNewItem] = useState({
    gpu: "",
    status: "not billed", // Default status
    location: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, 
    field: string
  ) => {
    setNewItem(prev => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const validate = () => {
    if (!newItem.gpu.trim()) {
      setError("GPU model is required");
      return false;
    }
    if (!newItem.status.trim()) {
      setError("Status is required");
      return false;
    }
    if (!newItem.location.trim()) {
      setError("Location is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const success = await onAdd(newItem);
      if (success) {
        setNewItem({
          gpu: "",
          status: "not billed",
          location: "",
          notes: ""
        });
        setError(null);
      } else {
        setError("Failed to add item");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <tr>
      <td className="border px-4 py-2">
        <input
          value={newItem.gpu}
          onChange={(e) => handleChange(e, "gpu")}
          className="w-full border px-2 py-1 rounded"
          placeholder="GPU Model"
          disabled={submitting}
        />
      </td>
      <td className="border px-4 py-2">
        <select
          value={newItem.status}
          onChange={(e) => handleChange(e, "status")}
          className="w-full border px-2 py-1 rounded"
          disabled={submitting}
        >
          <option value="billed">Billed</option>
          <option value="not billed">Not Billed</option>
          <option value="consumed">Consumed</option>
        </select>
      </td>
      <td className="border px-4 py-2">
        <input
          value={newItem.location}
          onChange={(e) => handleChange(e, "location")}
          className="w-full border px-2 py-1 rounded"
          placeholder="Location"
          disabled={submitting}
        />
      </td>
      <td className="border px-4 py-2">
        <input
          value={newItem.notes}
          onChange={(e) => handleChange(e, "notes")}
          className="w-full border px-2 py-1 rounded"
          placeholder="Notes"
          disabled={submitting}
        />
      </td>
      <td className="border px-4 py-2">
        <div className="space-y-2">
          <button 
            onClick={handleSubmit} 
            className="text-green-600 font-medium hover:text-green-800 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </td>
    </tr>
  );
}
