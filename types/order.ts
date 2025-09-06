export type Addon = {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
};

export type OrderAddon = {
  id?: string;
  order_id: string;
  addon_id: string;
  quantity: number;
  subtotal: number;
  created_at?: string;
  addon?: Addon; // For display purposes
};

export type Order = {
  id?: string;
  user_id: string;
  container_id: string;
  type: "rent" | "buy";
  start_date: string; // ISO date string
  end_date?: string; // ISO date string - required for rentals
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  created_at?: string;
  updated_at?: string;
  
  // Additional fields for display purposes
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
  addons?: OrderAddon[]; // Add-ons for this order
};

export type OrderCreateRequest = {
  container_id: string;
  type: "rent" | "buy";
  start_date: string;
  end_date?: string; // Required for rentals
  addons?: {
    addon_id: string;
    quantity: number;
  }[];
};

export type OrderUpdateRequest = {
  status?: Order["status"];
  payment_status?: Order["payment_status"];
  start_date?: string;
  end_date?: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
};

export type CheckoutRequest = {
  container_id: string;
  type: "rent" | "buy";
  start_date: string;
  end_date?: string;
  addons?: {
    addon_id: string;
    quantity: number;
  }[];
  success_url: string;
  cancel_url: string;
};