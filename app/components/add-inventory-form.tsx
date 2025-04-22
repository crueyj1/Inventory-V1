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
    status: "",
    location: "",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setNewItem(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    const success = await onAdd(newItem);
    if (success) {
      setNewItem({
        gpu: "",
        status: "",
        location: "",
        notes: ""
      });
    }
  };

  return (
    <tr>
      <td className="border px-2 py-1">
        <input
          value={newItem.gpu}
          onChange={(e) => handleChange(e, "gpu")}
          className="border px-1"
          placeholder="GPU Model"
        />
      </td>
      <td className="border px-2 py-1">
        <input
          value={newItem.status}
          onChange={(e) => handleChange(e, "status")}
          className="border px-1"
          placeholder="Status"
        />
      </td>
      <td className="border px-2 py-1">
        <input
          value={newItem.location}
          onChange={(e) => handleChange(e, "location")}
          className="border px-1"
          placeholder="Location"
        />
      </td>
      <td className="border px-2 py-1">
        <input
          value={newItem.notes}
          onChange={(e) => handleChange(e, "notes")}
          className="border px-1"
          placeholder="Notes"
        />
      </td>
      <td className="border px-2 py-1">
        <button onClick={handleSubmit} className="text-green-600 font-medium">Add</button>
      </td>
    </tr>
  );
}
