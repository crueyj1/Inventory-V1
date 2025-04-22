import React, { ReactNode } from "react";
import { InventoryItem } from "../hooks/use-inventory";

interface InventoryTableProps {
  items: InventoryItem[];
  isAdmin: boolean;
  userEmail: string | null;
  editingId: string | null;
  editedItem: Partial<InventoryItem>;
  setEditedItem: (item: Partial<InventoryItem>) => void;
  handleEdit: (item: InventoryItem) => void;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  renderAddForm: () => ReactNode;
  loading?: boolean;
  error?: string | null;
}

export function InventoryTable({
  items,
  isAdmin,
  userEmail,
  editingId,
  editedItem,
  setEditedItem,
  handleEdit,
  handleSave,
  handleDelete,
  renderAddForm,
  loading = false,
  error = null,
}: InventoryTableProps) {
  if (error) {
    return <div className="p-4 text-red-500 border rounded bg-red-50">{error}</div>;
  }
  
  if (loading) {
    return <div className="p-4 text-gray-500">Loading inventory data...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-center border rounded bg-gray-50">
        <p className="text-gray-500 mb-4">No inventory items found.</p>
        {isAdmin && userEmail && renderAddForm()}
      </div>
    );
  }

  return (
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
          {isAdmin && userEmail && renderAddForm()}
          {items.map((item) => (
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
                    <button onClick={handleSave} className="text-green-600 font-medium hover:text-green-800">Save</button>
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
                  {isAdmin && userEmail && (
                    <td className="border px-4 py-2 space-x-2">
                      <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
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
