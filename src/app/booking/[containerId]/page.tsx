"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, DollarSign, Clock, CreditCard, Plus, Minus } from "lucide-react";
import type { Addon, CheckoutRequest } from "@/types/order";

type Container = {
  id: string;
  title: string;
  description?: string;
  size?: string;
  price: number;
  location?: string;
  available: boolean;
};

type SelectedAddon = {
  addon: Addon;
  quantity: number;
};

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const containerId = params.containerId as string;

  const [container, setContainer] = useState<Container | null>(null);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
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

  // Fetch container and addons
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch container
        const containerRes = await fetch(`/api/containers/${containerId}`);
        if (containerRes.ok) {
          const containerData = await containerRes.json();
          setContainer(containerData);
        }

        // Fetch addons
        const addonsRes = await fetch("/api/addons");
        if (addonsRes.ok) {
          const addonsData = await addonsRes.json();
          setAddons(addonsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load booking information");
      }
    };

    if (containerId) {
      fetchData();
    }
  }, [containerId]);

  // Calculate container price
  const calculateContainerPrice = () => {
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

  // Calculate addons total
  const calculateAddonsTotal = () => {
    return selectedAddons.reduce((total, item) => total + item.subtotal, 0);
  };

  // Calculate total price
  const calculateTotal = () => {
    return calculateContainerPrice() + calculateAddonsTotal();
  };

  // Update addon quantity
  const updateAddonQuantity = (addonId: string, quantity: number) => {
    if (quantity < 0) return;

    const addon = addons.find(a => a.id === addonId);
    if (!addon) return;

    setSelectedAddons(prev => {
      const existing = prev.find(item => item.addon.id === addonId);
      
      if (quantity === 0) {
        // Remove addon
        return prev.filter(item => item.addon.id !== addonId);
      } else if (existing) {
        // Update quantity
        return prev.map(item => 
          item.addon.id === addonId 
            ? { ...item, quantity, subtotal: addon.price * quantity }
            : item
        );
      } else {
        // Add new addon
        return [...prev, { addon, quantity, subtotal: addon.price * quantity }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!container) {
      setError("Container not found");
      setLoading(false);
      return;
    }

    try {
      const checkoutData: CheckoutRequest = {
        container_id: container.id,
        type: form.type,
        start_date: form.start_date,
        end_date: form.type === "rent" ? form.end_date : undefined,
        addons: selectedAddons.map(item => ({
          addon_id: item.addon.id,
          quantity: item.quantity
        })),
        success_url: `${window.location.origin}/booking/success`,
        cancel_url: `${window.location.origin}/containers`,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading container details...</p>
        </div>
      </div>
    );
  }

  const containerPrice = calculateContainerPrice();
  const addonsTotal = calculateAddonsTotal();
  const total = calculateTotal();

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Container Details */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-400" />
                  <span>{container.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-2">{container.size || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white ml-2">{container.location || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Price per {form.type === "rent" ? "day" : "unit"}:</span>
                  <span className="text-white font-semibold ml-2">${container.price}</span>
                </div>
                {container.description && (
                  <p className="text-gray-300 text-sm">{container.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Add-ons Selection */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Add-ons & Materials</CardTitle>
                <p className="text-gray-400 text-sm">Select additional materials for your project</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {addons.map((addon) => {
                  const selected = selectedAddons.find(item => item.addon.id === addon.id);
                  const quantity = selected?.quantity || 0;
                  
                  return (
                    <div key={addon.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{addon.name}</h4>
                        <p className="text-gray-400 text-sm">{addon.description}</p>
                        <p className="text-blue-400 text-sm">${addon.price} {addon.unit}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAddonQuantity(addon.id, quantity - 1)}
                          disabled={quantity <= 0}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAddonQuantity(addon.id, quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Type Selection */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Order Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={form.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy Container</SelectItem>
                      <SelectItem value="rent">Rent Container</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Date Selection */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="start_date" className="text-white flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Start Date</span>
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={form.start_date}
                      onChange={(e) => handleDateChange("start_date", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                      required
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  </div>

                  {form.type === "rent" && (
                    <div>
                      <Label htmlFor="end_date" className="text-white flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>End Date</span>
                      </Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={form.end_date}
                        onChange={(e) => handleDateChange("end_date", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white mt-2"
                        required
                        min={form.start_date || new Date().toISOString().slice(0, 10)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Container ({form.type === "rent" ? "Rental" : "Purchase"}):</span>
                    <span className="text-white">${containerPrice.toFixed(2)}</span>
                  </div>
                  
                  {selectedAddons.map((item) => (
                    <div key={item.addon.id} className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {item.addon.name} × {item.quantity}
                      </span>
                      <span className="text-white">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !form.start_date || (form.type === "rent" && !form.end_date)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ${total.toFixed(2)} - {form.type === "rent" ? "Rental" : "Purchase"}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
