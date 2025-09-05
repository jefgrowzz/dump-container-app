"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AddModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "user" | "container" | "order";
  onAddItem: (item: any) => void;
};

export default function AddModal({ open, onOpenChange, type, onAddItem }: AddModalProps) {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onAddItem(formData);
    setFormData({});
    onOpenChange(false);
  };

  const renderFormFields = () => {
    switch (type) {
      case "user":
        return (
          <>
            <Input
              placeholder="Name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Role (admin/user/moderator)"
              value={formData.role || ""}
              onChange={(e) => handleChange("role", e.target.value)}
            />
          </>
        );
      case "container":
        return (
          <>
            <Input
              placeholder="Name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Type"
              value={formData.type || ""}
              onChange={(e) => handleChange("type", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Price"
              type="number"
              value={formData.price || ""}
              onChange={(e) => handleChange("price", Number(e.target.value))}
            />
          </>
        );
      case "order":
        return (
          <>
            <Input
              placeholder="Customer"
              value={formData.customer || ""}
              onChange={(e) => handleChange("customer", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Container"
              value={formData.container || ""}
              onChange={(e) => handleChange("container", e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Total"
              type="number"
              value={formData.total || ""}
              onChange={(e) => handleChange("total", Number(e.target.value))}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
          <DialogDescription>Fill in the details below to add a new {type}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">{renderFormFields()}</div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Add {type}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
