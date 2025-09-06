// components/admin/ContainersTable.tsx
"use client";
import type { Container } from "@/types/container";
import { Button } from "@/components/ui/button";
import AddContainerForm from "./AddContainerForm";

type Props = {
  containers: Container[];
  openEditModal: (container: Container) => void;
  onAdd: (container: Partial<Container>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleAvailability?: (id: string, isAvailable: boolean) => Promise<void>;
};

export default function ContainersTable({ containers, openEditModal, onAdd, onDelete, onToggleAvailability }: Props) {
  // Adapter for AddContainerForm which expects an `onAdded(container)` callback
  const handleAddedFromForm = async (inserted: any) => {
    // If parent passed an onAdd that expects a payload, call it.
    // If inserted looks like a full row, forward it as-is.
    try {
      await onAdd(inserted);
    } catch (err) {
      console.error("onAdd wrapper error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <AddContainerForm onAdded={handleAddedFromForm} />

      <table className="w-full table-auto border border-gray-700/50 rounded-xl overflow-hidden">
        <thead className="bg-gray-800/50 text-gray-300">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Available</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {containers.map((c, idx) => {
            // tolerate multiple shapes coming from DB or older code
            const id = (c as any).id ?? `row-${idx}`;
            const title = (c as any).title ?? (c as any).name ?? "—";
            const type = (c as any).size ?? (c as any).type ?? "—";
            const priceVal = (c as any).price;
            const price = priceVal == null ? "—" : Number(priceVal).toString();
            const available = (c as any).is_available ?? (c as any).available ?? false;

            return (
              <tr key={id} className="border-t border-gray-700/50 text-gray-200 hover:bg-gray-700/30 transition">
                <td className="p-3">{title}</td>
                <td className="p-3">{type}</td>
                <td className="p-3">{price}</td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className={available ? "text-green-400" : "text-red-400"}>
                      {available ? "Yes" : "No"}
                    </span>
                    {onToggleAvailability && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!id) return;
                          onToggleAvailability(String(id), !available).catch((err) => 
                            console.error("toggle availability failed:", err)
                          );
                        }}
                        className={`text-xs ${
                          available 
                            ? "bg-red-100 hover:bg-red-200 text-red-700 border-red-300" 
                            : "bg-green-100 hover:bg-green-200 text-green-700 border-green-300"
                        }`}
                      >
                        {available ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                    )}
                  </div>
                </td>
                <td className="p-3 space-x-2">
                  <Button
                    size="sm"
                    onClick={() => openEditModal(c)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      if (!id) return;
                      onDelete(String(id)).catch((err) => console.error("delete failed:", err));
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
