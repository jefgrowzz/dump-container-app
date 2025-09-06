"use client";

import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, Package, User, Calendar, DollarSign, Plus } from "lucide-react";

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
  addons?: OrderAddon[];
};

type OrderAddon = {
  id?: string;
  order_id: string;
  addon_id: string;
  quantity: number;
  subtotal: number;
  created_at?: string;
  addon?: {
    id: string;
    name: string;
    price: number;
    unit: string;
  };
};

interface OrdersTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
  onDelete: (order: Order) => void;
  onUpdateStatus?: (id: string, status: Order["status"]) => void;
}

const OrdersTable: FC<OrdersTableProps> = ({ orders, onEdit, onView, onDelete, onUpdateStatus }) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="p-4 text-left text-gray-300 font-semibold">Order ID</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Customer</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Container</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Type</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Status</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Add-ons</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Total</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Dates</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Created</th>
                <th className="p-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-mono text-sm">
                        {order.id?.slice(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-white font-medium">
                          {order.user?.name || "N/A"}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {order.user?.email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="text-white font-medium">
                        {order.container?.title || "N/A"}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {order.container?.size || "N/A"} • {order.container?.location || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className={order.type === "rent" 
                        ? "border-blue-300 text-blue-300" 
                        : "border-green-300 text-green-300"
                      }
                    >
                      {order.type === "rent" ? "Rental" : "Purchase"}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(order.status)}
                    >
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {order.addons && order.addons.length > 0 ? (
                      <div className="space-y-1">
                        {order.addons.slice(0, 2).map((orderAddon: OrderAddon) => (
                          <div key={orderAddon.id} className="text-sm">
                            <span className="text-white">
                              {orderAddon.addon?.name || "Unknown"}
                            </span>
                            <span className="text-gray-400 ml-1">
                              ×{orderAddon.quantity}
                            </span>
                          </div>
                        ))}
                        {order.addons.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{order.addons.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-white">
                        ${order.total_price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="text-sm">
                        <div className="text-white">
                          Start: {formatDate(order.start_date)}
                        </div>
                        {order.end_date && (
                          <div className="text-gray-400">
                            End: {formatDate(order.end_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-400">
                      {order.created_at ? formatDateTime(order.created_at) : "N/A"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(order)}
                        className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500 text-blue-300"
                      >
                        <Eye size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(order)}
                        className="bg-green-600/20 hover:bg-green-600/30 border-green-500 text-green-300"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(order)}
                        className="bg-red-600/20 hover:bg-red-600/30 border-red-500 text-red-300"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;