"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Order = {
  id?: string;
  user_id: string;
  container_id: string;
  type: "rent" | "buy";
  start_date: string;
  end_date?: string;
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  created_at?: string;
  updated_at?: string;
  container?: {
    id: string;
    title: string;
    size?: string;
    location?: string;
    price: number;
  };
  user?: {
    id: string;
    email: string;
    name?: string;
  };
};

interface PaymentSuccessProps {
  onClose: () => void;
}

export default function PaymentSuccess({ onClose }: PaymentSuccessProps) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to view order details");
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/orders/${id}`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.error || "Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        <p className="text-gray-300 mt-2">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-4">
          <p className="text-red-300">{error}</p>
        </div>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
        <p className="text-gray-300">
          Your {order?.type === "rent" ? "rental" : "purchase"} order has been confirmed.
        </p>
      </div>

      {/* Order Details */}
      {order && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>Order Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Container Info */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Container:</span>
              <span className="text-white font-semibold">
                {order.container?.title || "N/A"}
              </span>
            </div>

            {/* Order Type */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Type:</span>
              <span className="text-white font-semibold">
                {order.type === "rent" ? "Rental" : "Purchase"}
              </span>
            </div>

            {/* Dates */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Start Date:</span>
              </span>
              <span className="text-white font-semibold">
                {formatDate(order.start_date)}
              </span>
            </div>

            {order.end_date && (
              <div className="flex justify-between items-center">
                <span className="text-gray-300 flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>End Date:</span>
                </span>
                <span className="text-white font-semibold">
                  {formatDate(order.end_date)}
                </span>
              </div>
            )}

            {/* Total Price */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-300 flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>Total Paid:</span>
              </span>
              <span className="text-2xl font-bold text-green-400">
                ${order.total_price?.toFixed(2) || "0.00"}
              </span>
            </div>

            {/* Order ID */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Order ID:</span>
              <span className="text-gray-300 font-mono">
                {order.id?.slice(0, 8)}...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-blue-900/20 border-blue-700/50">
        <CardContent className="p-4">
          <h3 className="text-white font-semibold mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• You'll receive a confirmation email shortly</li>
            <li>• Our team will contact you to arrange delivery</li>
            <li>• Track your order status in your account</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Close
        </Button>
        <Button
          onClick={() => window.location.href = "/containers"}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          Browse More Containers
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}