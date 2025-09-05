// src/components/admin/AddContainerForm.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Container } from "@/types/container";

type Props = {
  onAdded: (container: Container) => void;
};

export default function AddContainerForm({ onAdded }: Props) {
  const [form, setForm] = useState<Partial<Container>>({
    location: "",
    title: "",
    description: "",
    size: "",
    available_date: new Date().toISOString().slice(0, 10),
    price: 0,
    is_available: true,
    image_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Ref to hidden file input to trigger click programmatically
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title?.trim() ?? "");
      formData.append("description", form.description?.trim() ?? "");
      formData.append("size", form.size?.trim() ?? "");
      formData.append("location", (form.location?.trim() || (form as any).address?.trim() || ""));
      formData.append("address", (form as any).address?.trim() ?? "");
      formData.append("available_date", form.available_date ?? "");
      formData.append("price", String(form.price ?? 0));
      formData.append("is_available", String(Boolean(form.is_available)));
      if (file) formData.append("image", file);

      const res = await fetch("/api/containers/upload-and-create", {
        method: "POST",
        body: formData,
      });

      const raw = await res.json();

      if (!res.ok) {
        console.error("Error adding container (server):", raw?.error ?? raw);
        return;
      }

      const inserted = raw?.data ?? raw;

      if (!inserted || !inserted.id) {
        console.warn("API returned unexpected body when adding container:", raw);
        return;
      }

      onAdded(inserted);

      setForm({
        location: "",
        title: "",
        description: "",
        size: "",
        available_date: new Date().toISOString().slice(0, 10),
        price: 0,
        is_available: true,
        image_url: "",
      });
      setFile(null);
    } catch (err: any) {
      console.error("Add container error:", err?.message ?? err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 space-y-6 max-w-4xl mx-auto"
      aria-label="Add Container Form"
    >
      {/* Title and Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="title" className="block text-gray-300 text-sm font-medium mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.title ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="Container title"
            autoComplete="off"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-1">
            Description
          </label>
          <textarea
          id="description"
          name="description"
          rows={1} // reduced from 4 to 2 for smaller default height
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 resize-y min-h-[3rem] max-h-20 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Brief description"
          />
        </div>
      </div>

      {/* Address and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="address" className="block text-gray-300 text-sm font-medium mb-1">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={(form as any).address ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            placeholder="Street address"
            autoComplete="street-address"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-gray-300 text-sm font-medium mb-1">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.location ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder="City, State, Country"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Size, Price, Available Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <label htmlFor="size" className="block text-gray-300 text-sm font-medium mb-1">
            Size
          </label>
          <input
            id="size"
            name="size"
            type="text"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.size ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
            placeholder="e.g. 20ft, 40ft"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-gray-300 text-sm font-medium mb-1">
            Price (USD)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={String(form.price ?? 0)}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            placeholder="0.00"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="available_date" className="block text-gray-300 text-sm font-medium mb-1">
            Available Date <span className="text-red-400">*</span>
          </label>
          <input
            id="available_date"
            name="available_date"
            type="date"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={form.available_date ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, available_date: e.target.value }))}
            required
          />
        </div>
      </div>

      {/* Availability and Image picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <label htmlFor="is_available" className="block text-gray-300 text-sm font-medium mb-1">
            Availability
          </label>
          <select
            id="is_available"
            name="is_available"
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={String(form.is_available)}
            onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.value === "true" }))}
          >
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1" htmlFor="image-upload-button">
            Image
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              id="image-upload-button"
              onClick={handleFileButtonClick}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Choose Image
            </button>
            {/* Display chosen filename or none */}
            <span className="text-gray-300 text-sm truncate max-w-xs" title={file?.name ?? ""}>
              {file?.name ?? "No file chosen"}
            </span>
          </div>
          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 w-full md:w-auto px-8"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Container"}
        </Button>
      </div>
    </form>
  );
}