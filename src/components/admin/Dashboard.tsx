"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { BarChart3, Users, Package, ShoppingCart } from "lucide-react";

interface DashboardProps {
  totalUsers?: number;
  totalContainers?: number;
  totalOrders?: number;
  revenue?: number;
}

export default function Dashboard({
  totalUsers = 0,
  totalContainers = 0,
  totalOrders = 0,
  revenue = 0,
}: DashboardProps) {
  const stats = [
    { label: "Users", value: totalUsers, icon: Users },
    { label: "Containers", value: totalContainers, icon: Package },
    { label: "Orders", value: totalOrders, icon: ShoppingCart },
    { label: "Revenue", value: `$${revenue}`, icon: BarChart3 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex items-center space-x-4 p-4">
          <stat.icon className="h-8 w-8 text-blue-500" />
          <div>
            <CardHeader className="p-0">
              <CardTitle className="text-lg">{stat.value}</CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
          </div>
        </Card>
      ))}
    </div>
  );
}
