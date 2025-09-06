"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Calendar, DollarSign, ArrowRight, Truck } from "lucide-react";
import type { Order, OrderAddon } from "@/types/order";
import { supabase } from "@/lib/supabaseClient";

export default function BookingSuccessPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 mb-4 max-w-md">
            <p className="text-red-300">{error}</p>
          </div>
          <Button onClick={() => window.location.href = "/containers"} variant="outline">
            Back to Containers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-200">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">ContainerApp</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              <a href="/containers" className="text-white font-medium">Containers</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Success Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Your {order?.type === "rent" ? "rental" : "purchase"} order has been confirmed and is being processed.
            </p>
          </div>

          {order && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Details */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    <span>Order Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Order ID:</span>
                    <span className="text-white font-mono text-sm">
                      {order.id?.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Container:</span>
                    <span className="text-white font-semibold">
                      {order.container?.title || "N/A"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Type:</span>
                    <span className="text-white font-semibold">
                      {order.type === "rent" ? "Rental" : "Purchase"}
                    </span>
                  </div>

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

                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Status:</span>
                    <span className="text-green-400 font-semibold">
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Add-ons Details */}
              {order.addons && order.addons.length > 0 && (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Add-ons & Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.addons.map((orderAddon: OrderAddon) => (
                      <div key={orderAddon.id} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <span className="text-white font-medium">
                            {orderAddon.addon?.name || "Unknown Add-on"}
                          </span>
                          <p className="text-gray-400 text-sm">
                            {orderAddon.quantity} × ${orderAddon.addon?.price?.toFixed(2) || "0.00"} {orderAddon.addon?.unit || ""}
                          </p>
                        </div>
                        <span className="text-white font-semibold">
                          ${orderAddon.subtotal?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Price Summary */}
              <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Container ({order.type === "rent" ? "Rental" : "Purchase"}):</span>
                    <span className="text-white">
                      ${order.container?.price?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  {order.addons && order.addons.map((orderAddon: OrderAddon) => (
                    <div key={orderAddon.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {orderAddon.addon?.name} × {orderAddon.quantity}
                      </span>
                      <span className="text-white">${orderAddon.subtotal?.toFixed(2) || "0.00"}</span>
                    </div>
                  ))}

                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">Total Paid:</span>
                      <span className="text-green-400">${order.total_price?.toFixed(2) || "0.00"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-blue-900/20 border-blue-700/50 lg:col-span-2">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                    <Truck className="w-5 h-5" />
                    <span>What's Next?</span>
                  </h3>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>• You'll receive a confirmation email with all order details</li>
                    <li>• Our team will contact you within 24 hours to arrange delivery</li>
                    <li>• Track your order status in your account dashboard</li>
                    <li>• For rentals, we'll coordinate pickup at the end of your rental period</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => window.location.href = "/containers"}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Browse More Containers
            </Button>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
