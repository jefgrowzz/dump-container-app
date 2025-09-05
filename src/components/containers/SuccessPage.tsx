import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        
        {/* Icon */}
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Booking Confirmed!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          Thank you for reserving a container with us.  
          You’ll receive an email with your booking details shortly.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Link href="/containers">
            <Button className="w-full">Back to Containers</Button>
          </Link>

          <Link href="/account">
            <Button variant="outline" className="w-full">
              View My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
