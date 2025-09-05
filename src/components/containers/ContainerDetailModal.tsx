// components/containers/ContainerDetailsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type Container = {
  id: string
  name: string
  size: string
  price: number
  description: string
  image?: string
  available: boolean
}

interface ContainerDetailsModalProps {
  container: Container | null
  open: boolean
  onClose: () => void
  onBook: (container: Container) => void
}

export default function ContainerDetailsModal({
  container,
  open,
  onClose,
  onBook,
}: ContainerDetailsModalProps) {
  if (!container) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{container.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {container.image && (
            <img
              src={container.image}
              alt={container.name}
              className="w-full h-48 object-cover rounded-lg shadow"
            />
          )}

          <p className="text-sm text-gray-600">{container.description}</p>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Size: {container.size}</span>
            <span className="text-lg font-bold">${container.price}</span>
          </div>

          <p
            className={`text-sm font-semibold ${
              container.available ? "text-green-600" : "text-red-600"
            }`}
          >
            {container.available ? "Available" : "Not Available"}
          </p>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!container.available}
            onClick={() => onBook(container)}
          >
            Book Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
