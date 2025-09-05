  "use client";

  import { useEffect, useMemo, useState } from "react";
  import { useRouter } from "next/navigation";
  import { supabase } from "@/lib/supabaseClient";
  import { Button } from "@/components/ui/button";
  import { Dialog, DialogContent } from "@/components/ui/dialog";
  import {
    BarChart3,
    Users,
    Package,
    ShoppingCart,
    Menu,
    Settings,
    LogOut,
    Bell,
    Search,
    TrendingUp,
    Activity,
    DollarSign,
  } from "lucide-react";

  import UsersTable from "@/components/admin/UsersTable";
  import ContainersTable from "@/components/admin/ContainersTable";
  import OrdersTable from "@/components/admin/OrdersTable";

  // ----------------- Types -----------------
  type View = "dashboard" | "users" | "containers" | "orders";

  type User = {
    id: string;
    name?: string;
    email: string;
    role?: "admin" | "user" | "moderator";
    status?: "active" | "inactive";
    lastActive?: string;
  };

  type Container = {
    id: string;
    title: string;
    description?: string;
    size?: string;
    location?: string;
    address?: string;
    available_date?: string;
    price?: number;
    is_available?: boolean;
    image_url?: string;
    created_at?: string;
  };

  type Order = {
    id: string;
    customer?: string;
    container?: string;
    status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    total?: number;
    date?: string;
  };

  // ----------------- Main Component -----------------
  export default function AdminPage() {
    const router = useRouter();

    // ---------- top-level hooks ----------
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [currentView, setCurrentView] = useState<View>("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [users, setUsers] = useState<User[]>([]);
    const [containers, setContainers] = useState<Container[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const [dataLoading, setDataLoading] = useState(false);
    const [opLoading, setOpLoading] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editModalType, setEditModalType] = useState<"user" | "container" | "order" | null>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    // local form state for editing to avoid mutating global lists directly
    const [editForm, setEditForm] = useState<any>({});

    // ---------- Auth & Role Check (runs once) ----------
    useEffect(() => {
      let mounted = true;
      const checkUserRole = async () => {
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
          }

          if (!session) {
            router.push("/containers");
            return;
          }

          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (error || !profile || profile.role !== "admin") {
            router.push("/containers");
            return;
          }

          if (mounted) setIsAdmin(true);
        } catch (err) {
          console.error("Auth check failed:", err);
          router.push("/containers");
        } finally {
          if (mounted) setCheckingAuth(false);
        }
      };

      checkUserRole();
      return () => {
        mounted = false;
      };
    }, [router]);

    // ---------- Data fetching ----------
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from<User>("profiles").select("*");
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("fetchUsers error:", err);
      }
    };

    const fetchContainers = async () => {
      try {
        const { data, error } = await supabase.from<Container>("containers").select("*");
        if (error) throw error;
        setContainers(data || []);
      } catch (err) {
        console.error("fetchContainers error:", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase.from<Order>("orders").select("*");
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("fetchOrders error:", err);
      }
    };

    // fetch all when confirmed admin
    useEffect(() => {
      if (!isAdmin) return;
      let mounted = true;
      const fetchAll = async () => {
        setDataLoading(true);
        await Promise.all([fetchUsers(), fetchContainers(), fetchOrders()]);
        if (mounted) setDataLoading(false);
      };
      fetchAll();
      return () => {
        mounted = false;
      };
    }, [isAdmin]);

  
  // ---------- CRUD helpers (aligned with DB schema) ----------
// containers: id(uuid), location(text), available_date(date), price(numeric), is_available(bool), created_at(timestamp)
// orders: id, user_id, container_id, addons, total_price, status, created_at
// profiles: id, email, created_at, role, name

// ---------- Containers ----------
// page.tsx — replace existing addContainer with this
const addContainer = async (payloadOrRow: any) => {
  setOpLoading(true);
  try {
    // If caller already passed an inserted row (e.g. { id: 'abc', title: ... })
    if (payloadOrRow && payloadOrRow.id) {
      setContainers(prev => [payloadOrRow, ...prev]);
      return payloadOrRow;
    }

    // Otherwise assume this is a payload that must be sent to the API
    const payload = payloadOrRow ?? {};

    // Explicit validation (accept 0 and false)
    if (
      !payload.title || // non-empty string required
      !String(payload.title).trim() ||
      !payload.location || !String(payload.location).trim() ||
      !payload.available_date ||
      payload.price == null || // catches null or undefined (accepts 0)
      payload.is_available === undefined // must be boolean or truthy/falsey specified
    ) {
      throw new Error("Missing required fields for container");
    }

    // POST to API
    const res = await fetch("/api/containers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await res.json();

    if (!res.ok) {
      // helpful debug output
      console.error("addContainer - server error response:", raw);
      throw new Error(raw?.error || "Failed to add container");
    }

    // handle API that returns either { data: row } or row
    const row = raw?.data ?? raw;
    if (!row || !row.id) {
      console.warn("addContainer - API returned unexpected body:", raw);
      throw new Error("API returned invalid container");
    }

    setContainers(prev => [row, ...prev]);
    return row;
  } catch (err) {
    console.error("addContainer error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};

const updateContainer = async (id: string, payload: Partial<Container>) => {
  setOpLoading(true);
  try {
    const res = await fetch(`/api/containers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update container");

    setContainers((prev) => prev.map((c) => (String(c.id) === String(id) ? data : c)));
    return data;
  } catch (err) {
    console.error("updateContainer error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};

const deleteContainer = async (id: string) => {
  setOpLoading(true);
  try {
    const res = await fetch(`/api/containers/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete container");

    setContainers((prev) => prev.filter((c) => String(c.id) !== String(id)));
    return data;
  } catch (err) {
    console.error("deleteContainer error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};

// ---------- Users ----------
const updateUser = async (id: string, payload: Partial<User>) => {
  setOpLoading(true);
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update user");

    setUsers((prev) => prev.map((u) => (String(u.id) === String(id) ? data : u)));
    return data;
  } catch (err) {
    console.error("updateUser error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};

const deleteUser = async (id: string) => {
  setOpLoading(true);
  try {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete user");

    setUsers((prev) => prev.filter((u) => String(u.id) !== String(id)));
    return data;
  } catch (err) {
    console.error("deleteUser error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};

// ---------- Orders ----------
const updateOrder = async (id: string, payload: Partial<Order>) => {
  setOpLoading(true);
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update order");

    setOrders((prev) => prev.map((o) => (String(o.id) === String(id) ? data : o)));
    return data;
  } catch (err) {
    console.error("updateOrder error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};

const deleteOrder = async (id: string) => {
  setOpLoading(true);
  try {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete order");

    setOrders((prev) => prev.filter((o) => String(o.id) !== String(id)));
    return data;
  } catch (err) {
    console.error("deleteOrder error:", err);
    throw err;
  } finally {
    setOpLoading(false);
  }
};



    // ---------- modal open/close helpers ----------
    const openEditModal = (type: "user" | "container" | "order", item: any) => {
      setEditModalType(type);
      setEditingItem(item);

      // initialize edit form with a deep-ish copy
      setEditForm(JSON.parse(JSON.stringify(item || {})));
      setEditModalOpen(true);
    };

    const closeEditModal = () => {
      setEditModalOpen(false);
      setEditModalType(null);
      setEditingItem(null);
      setEditForm({});
    };

    // ---------- handle save from modal ----------
    const handleSave = async () => {
      if (!editModalType || !editingItem) return;
      try {
        if (editModalType === "user") {
          await updateUser(String(editingItem.id), editForm);
        } else if (editModalType === "container") {
          await updateContainer(String(editingItem.id), editForm);
        } else if (editModalType === "order") {
          await updateOrder(String(editingItem.id), editForm);
        }
        closeEditModal();
      } catch (err) {
        // show toast in real app; console for now
        console.error("Save failed", err);
      }
    };

    // ---------- logout ----------
    const logout = async () => {
      try {
        await supabase.auth.signOut();
        router.push("/containers");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    };

    // ---------- computed / dashboard stats ----------
    const dashboardStats = useMemo(
      () => [
        {
          title: "Total Users",
          value: users.length,
          change: "+12%",
          icon: Users,
          color: "from-blue-500 to-cyan-500",
          bgColor: "from-blue-500/10 to-cyan-500/10",
        },
        {
          title: "Active Containers",
          value: containers.filter((c) => c.available).length,
          change: "+8%",
          icon: Package,
          color: "from-green-500 to-emerald-500",
          bgColor: "from-green-500/10 to-emerald-500/10",
        },
        {
          title: "Total Orders",
          value: orders.length,
          change: "+23%",
          icon: ShoppingCart,
          color: "from-purple-500 to-pink-500",
          bgColor: "from-purple-500/10 to-pink-500/10",
        },
        {
          title: "Revenue",
          value: `$${orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}`,
          change: "+15%",
          icon: DollarSign,
          color: "from-orange-500 to-red-500",
          bgColor: "from-orange-500/10 to-red-500/10",
        },
      ],
      [users, containers, orders]
    );

    // ---------- render views ----------
    const renderContent = () => {
      if (dataLoading) {
        return (
          <div className="p-8">
            <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-center text-gray-300">Loading data...</p>
          </div>
        );
      }

      switch (currentView) {
        case "dashboard":
          return (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                      Welcome back, Admin! 👋
                    </h2>
                    <p className="text-gray-400">Here's what's happening with your container business today.</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {}}>
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700" onClick={() => {}}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                      </div>
                      <div className="flex items-center space-x-1 text-green-400 text-sm">
                        <TrendingUp className="w-3 h-3" />
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">New user registered</span>
                      <span className="text-gray-500 text-xs ml-auto">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Container booking confirmed</span>
                      <span className="text-gray-500 text-xs ml-auto">5 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Payment processed</span>
                      <span className="text-gray-500 text-xs ml-auto">10 min ago</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => setCurrentView("users")}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button
                      onClick={() => setCurrentView("containers")}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Add Container
                    </Button>
                    <Button
                      onClick={() => setCurrentView("orders")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Orders
                    </Button>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );

        case "users":
          return (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-400" />
                  User Management
                </h2>
              </div>
              <div className="p-6">
                <UsersTable
                  users={users}
                  openEditModal={(u) => openEditModal("user", u)}
                  onDelete={async (id) => {
                    await deleteUser(id);
                  }}
                />
              </div>
            </div>
          );

        case "containers":
          return (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Package className="w-6 h-6 mr-3 text-green-400" />
                  Container Management
                </h2>
              </div>
              <div className="p-6">
                <ContainersTable
                  containers={containers}
                  openEditModal={(c) => openEditModal("container", c)}
                  onAdd={async (payload) => await addContainer(payload)}
                  onDelete={async (id) => await deleteContainer(id)}
                />
              </div>
            </div>
          );

        case "orders":
          return (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <ShoppingCart className="w-6 h-6 mr-3 text-orange-400" />
                  Order Management
                </h2>
              </div>
              <div className="p-6">
                <OrdersTable
                  orders={orders}
                  openEditModal={(o) => openEditModal("order", o)}
                  onUpdateStatus={async (id, status) => await updateOrder(id, { status })}
                  onDelete={async (id) => await deleteOrder(id)}
                />
              </div>
            </div>
          );

        default:
          return <div className="p-6 text-gray-300">Select a view</div>;
      }
    };

    // ---------- UI: loading / auth check ----------
    if (checkingAuth) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Verifying access...</p>
          </div>
        </div>
      );
    }

    if (!isAdmin) return null;

    // ---------- JSX ----------
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        {/* Background visuals */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="flex relative z-10">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? "w-72" : "w-20"
            } bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 flex flex-col`}
          >
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                {sidebarOpen && (
                  <div>
                    <h1 className="font-bold text-xl text-white">Admin Panel</h1>
                    <p className="text-gray-400 text-sm">Container Management</p>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {[
                { key: "dashboard", label: "Dashboard", icon: BarChart3, color: "from-blue-500 to-cyan-500" },
                { key: "users", label: "Users", icon: Users, color: "from-purple-500 to-pink-500" },
                { key: "containers", label: "Containers", icon: Package, color: "from-green-500 to-emerald-500" },
                { key: "orders", label: "Orders", icon: ShoppingCart, color: "from-orange-500 to-red-500" },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  className={`w-full ${sidebarOpen ? "justify-start" : "justify-center"} text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 ${
                    currentView === (item.key as View) ? "bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-white shadow-lg" : ""
                  }`}
                  onClick={() => setCurrentView(item.key as View)}
                  size="lg"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mr-3`}>
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-700/50">
              <Button
                variant="ghost"
                className={`w-full ${sidebarOpen ? "justify-start" : "justify-center"} text-gray-400 hover:bg-red-500/10 hover:text-red-400`}
                size="lg"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                {sidebarOpen && <span className="ml-3">Logout</span>}
              </Button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  />
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </main>
        </div>

        {/* Mobile toggle */}
        <button
          className="fixed top-4 left-4 lg:hidden p-3 rounded-xl bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 text-white z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 text-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-blue-400" />
                  Edit {editModalType}
                </h2>
                <div className="flex items-center space-x-2">
                  {opLoading && <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />}
                  <Button variant="ghost" onClick={closeEditModal} className="text-gray-300">
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Dynamic edit form */}
              {editModalType === "user" && (
                <div className="space-y-4">
                  <label className="block text-sm text-gray-300">Name</label>
                  <input
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, name: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <label className="block text-sm text-gray-300">Email</label>
                  <input
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, email: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <label className="block text-sm text-gray-300">Role</label>
                  <select
                    value={editForm.role || "user"}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, role: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button variant="outline" onClick={closeEditModal} className="border-gray-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {editModalType === "container" && (
                <div className="space-y-4">
                  <label className="block text-sm text-gray-300">Name</label>
                  <input
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, name: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300">Type</label>
                      <input
                        value={editForm.type || ""}
                        onChange={(e) => setEditForm((s: any) => ({ ...s, type: e.target.value }))}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300">Price</label>
                      <input
                        type="number"
                        value={editForm.price ?? ""}
                        onChange={(e) => setEditForm((s: any) => ({ ...s, price: Number(e.target.value) }))}
                        className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                      />
                    </div>
                  </div>

                  <label className="block text-sm text-gray-300">Available</label>
                  <select
                    value={String(editForm.available ?? "true")}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, available: e.target.value === "true" }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>

                  <label className="block text-sm text-gray-300">Location</label>
                  <input
                    value={editForm.location || ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, location: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <label className="block text-sm text-gray-300">Description</label>
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, description: e.target.value }))}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button variant="outline" onClick={closeEditModal} className="border-gray-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {editModalType === "order" && (
                <div className="space-y-4">
                  <label className="block text-sm text-gray-300">Customer</label>
                  <input
                    value={editForm.customer || ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, customer: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <label className="block text-sm text-gray-300">Status</label>
                  <select
                    value={editForm.status || "pending"}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, status: e.target.value }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <label className="block text-sm text-gray-300">Total</label>
                  <input
                    type="number"
                    value={editForm.total ?? ""}
                    onChange={(e) => setEditForm((s: any) => ({ ...s, total: Number(e.target.value) }))}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100"
                  />

                  <div className="flex justify-end space-x-3 mt-4">
                    <Button variant="outline" onClick={closeEditModal} className="border-gray-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
