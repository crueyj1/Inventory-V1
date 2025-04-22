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
}: InventoryTableProps) {
  return (
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
        {renderAddForm()}
        {items.map((item) => (
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
  );
}
