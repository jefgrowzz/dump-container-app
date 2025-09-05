// components/containers/ContainerCard.tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Container = {
  id: string
  title: string
  size: string
  price: number
  description: string
  imageUrl?: string
  available: boolean
}

interface ContainerCardProps {
  container: Container
  onBook: (id: string) => void
}

export default function ContainerCard({ container, onBook }: ContainerCardProps) {
  return (
    <Card className="w-full max-w-sm shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition">
      {/* Image */}
      {container.imageUrl && (
        <img 
          src={container.imageUrl} 
          alt={container.title} 
          className="w-full h-48 object-cover"
        />
      )}

      <CardHeader>
        <CardTitle className="text-lg font-semibold">{container.title}</CardTitle>
        <p className="text-sm text-gray-500">{container.size}</p>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700">{container.description}</p>
        <p className="mt-3 text-xl font-bold">${container.price}</p>
        <span className={`text-sm font-medium ${container.available ? "text-green-600" : "text-red-500"}`}>
          {container.available ? "Available" : "Not Available"}
        </span>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onBook(container.id)} 
          disabled={!container.available}
        >
          {container.available ? "Book Now" : "Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  )
}
