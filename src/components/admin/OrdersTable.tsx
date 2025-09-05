"use client";

import { FC } from "react";
import { Order } from "@/types"; // You can create a types.ts file with all your interfaces
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
  onDelete: (order: Order) => void;
}

const OrdersTable: FC<OrdersTableProps> = ({ orders, onEdit, onView, onDelete }) => {
  return (
    <div className="overflow-x-auto bg-white shadow rounded-md">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Container</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{order.customer}</td>
              <td className="px-4 py-2">{order.container}</td>
              <td className="px-4 py-2 capitalize">{order.status}</td>
              <td className="px-4 py-2">${order.total.toFixed(2)}</td>
              <td className="px-4 py-2">{order.date}</td>
              <td className="px-4 py-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onView(order)}>
                  <Eye size={16} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(order)}>
                  <Edit size={16} />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(order)}>
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center px-4 py-6 text-gray-400">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
