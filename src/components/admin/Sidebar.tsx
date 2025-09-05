"use client";

import { Dispatch, SetStateAction } from "react";
import { BarChart3, Users, Package, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

type View = "dashboard" | "users" | "containers" | "orders";

interface SidebarProps {
  currentView: View;
  setCurrentView: Dispatch<SetStateAction<View>>;
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const navItems: { key: View; label: string; icon: any }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3 },
  { key: "users", label: "Users", icon: Users },
  { key: "containers", label: "Containers", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingCart },
];

export default function Sidebar({
  currentView,
  setCurrentView,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white border-r shadow-md transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setSidebarOpen(false)}>✕</button>
      </div>

      <nav className="mt-4 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={cn(
                "flex items-center gap-3 px-4 py-2 w-full text-left rounded hover:bg-gray-100 transition",
                currentView === item.key ? "bg-gray-200 font-semibold" : ""
              )}
              onClick={() => setCurrentView(item.key)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
