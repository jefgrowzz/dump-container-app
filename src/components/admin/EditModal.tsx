"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type EditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "user" | "container" | "order" | null;
  item: any;
  onSave: (updatedItem: any) => void;
};

export default function EditModal({ open, onOpenChange, type, item, onSave }: EditModalProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) setFormData(item);
  }, [item]);

  if (!type) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const renderFields = () => {
    if (!formData) return null;
    return Object.keys(formData).map((key) => (
      <div key={key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700">{key}</label>
        <input
          type="text"
          value={formData[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {type}</DialogTitle>
          <DialogDescription>Update the fields and save changes.</DialogDescription>
        </DialogHeader>

        <div className="mt-4">{renderFields()}</div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
