"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Container = {
  id: string;
  title: string;
  description?: string;
  size?: string;
  location?: string;
  address?: string;
  available_date?: string;
  price?: number;
  is_available?: boolean;
  image_url?: string;
  created_at?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: Container | null;
  onSave: (updatedContainer: Container) => void;
  loading?: boolean;
};

export default function EditContainerModal({ open, onOpenChange, container, onSave, loading = false }: Props) {
  const [form, setForm] = useState<Partial<Container>>({
    title: "",
    description: "",
    size: "",
    location: "",
    address: "",
    available_date: new Date().toISOString().slice(0, 10),
    price: 0,
    is_available: true,
    image_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when container changes
  useEffect(() => {
    if (container) {
      setForm({
        title: container.title || "",
        description: container.description || "",
        size: container.size || "",
        location: container.location || "",
        address: container.address || "",
        available_date: container.available_date || new Date().toISOString().slice(0, 10),
        price: container.price || 0,
        is_available: container.is_available ?? true,
        image_url: container.image_url || "",
      });
      setImagePreview(container.image_url || "");
      setFile(null);
    } else {
      setForm({
        title: "",
        description: "",
        size: "",
        location: "",
        address: "",
        available_date: new Date().toISOString().slice(0, 10),
        price: 0,
        is_available: true,
        image_url: "",
      });
      setImagePreview("");
      setFile(null);
    }
  }, [container]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!container?.id) return;

    try {
      let imageUrl = form.image_url;

      // Handle image upload if a new file is selected
      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadRes = await fetch("/api/containers/upload-image", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.image_url;
        }
      }

      // Update container with new data
      const updatedContainer = {
        ...container,
        ...form,
        image_url: imageUrl,
        id: String(container.id), // Ensure ID is a string
      };

      console.log("Calling onSave with:", updatedContainer);
      console.log("Container ID type:", typeof updatedContainer.id, updatedContainer.id);
      await onSave(updatedContainer);
    } catch (error) {
      console.error("Error updating container:", error);
    }
  };

  const handleChange = (field: keyof Container, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Container</DialogTitle>
          <DialogDescription>
            Update the container details and save changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Container title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size/Type</Label>
              <Input
                id="size"
                value={form.size || ""}
                onChange={(e) => handleChange("size", e.target.value)}
                placeholder="e.g., 20ft, 40ft, Small, Large"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Container description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location || ""}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Full address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price || ""}
                onChange={(e) => handleChange("price", Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_date">Available Date *</Label>
              <Input
                id="available_date"
                type="date"
                value={form.available_date || ""}
                onChange={(e) => handleChange("available_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_available">Availability</Label>
            <Select
              value={String(form.is_available ?? true)}
              onValueChange={(value) => handleChange("is_available", value === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Container Image</Label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Container preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFileButtonClick}
                  disabled={loading}
                >
                  {file ? "Change Image" : "Upload Image"}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFile(null);
                      setImagePreview(form.image_url || "");
                    }}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
