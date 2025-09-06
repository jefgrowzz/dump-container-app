"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, DollarSign, Clock, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type CheckoutRequest = {
  container_id: string;
  type: "rent" | "buy";
  start_date: string;
  end_date?: string;
  success_url: string;
  cancel_url: string;
};

type Container = {
  id: string;
  title: string;
  description?: string;
  size?: string;
  price: number;
  location?: string;
  available: boolean;
};

type Props = {
  container: Container | null;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function BookingForm({ container, onCancel, onSuccess }: Props) {
  const [form, setForm] = useState({
    type: "buy" as "rent" | "buy",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set default start date to today
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setForm(prev => ({ ...prev, start_date: today }));
  }, []);

  // Calculate total price
  const calculateTotal = () => {
    if (!container) return 0;
    
    if (form.type === "buy") {
      return container.price;
    }
    
    if (form.type === "rent" && form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return container.price * days;
    }
    
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!container) {
      setError("No container selected");
      setLoading(false);
      return;
    }

    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Please log in to continue");
        setLoading(false);
        return;
      }

      const checkoutData: CheckoutRequest = {
        container_id: container.id,
        type: form.type,
        start_date: form.start_date,
        end_date: form.type === "rent" ? form.end_date : undefined,
        success_url: `${window.location.origin}/containers?payment=success`,
        cancel_url: `${window.location.origin}/containers?payment=cancelled`,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Failed to create checkout session");
      setLoading(false);
    }
  };

  const handleTypeChange = (type: "rent" | "buy") => {
    setForm(prev => ({ ...prev, type, end_date: type === "buy" ? "" : prev.end_date }));
  };

  const handleDateChange = (field: "start_date" | "end_date", value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (!container) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No container selected</p>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Container Info */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span>{container.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Size: {container.size || "N/A"}</span>
            <span>Location: {container.location || "N/A"}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>Price per {form.type === "rent" ? "day" : "unit"}:</span>
            <span className="font-semibold text-white">${container.price}</span>
          </div>
        </CardContent>
      </Card>

      {/* Order Type Selection */}
      <div className="space-y-2">
        <Label className="text-white">Order Type</Label>
        <Select value={form.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy Container</SelectItem>
            <SelectItem value="rent">Rent Container</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date" className="text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Start Date</span>
          </Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => handleDateChange("start_date", e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            required
            min={new Date().toISOString().slice(0, 10)}
          />
        </div>

        {form.type === "rent" && (
          <div className="space-y-2">
            <Label htmlFor="end_date" className="text-white flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>End Date</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              value={form.end_date}
              onChange={(e) => handleDateChange("end_date", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              required
              min={form.start_date || new Date().toISOString().slice(0, 10)}
            />
          </div>
        )}
      </div>

      {/* Price Summary */}
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Total Price:</span>
            </div>
            <div className="text-2xl font-bold text-white">
              ${total.toFixed(2)}
            </div>
          </div>
          {form.type === "rent" && form.start_date && form.end_date && (
            <div className="text-sm text-gray-300 mt-2">
              {(() => {
                const start = new Date(form.start_date);
                const end = new Date(form.end_date);
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                return `${days} day${days !== 1 ? 's' : ''} × $${container.price}/day`;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !form.start_date || (form.type === "rent" && !form.end_date)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {`Pay ${form.type === "rent" ? "Rental" : "Purchase"} - $${total.toFixed(2)}`}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}