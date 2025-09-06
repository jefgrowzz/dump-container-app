// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Fetch all orders with related data including add-ons
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        container:containers(id, title, size, location, price),
        user:profiles(id, email, name),
        addons:order_addons(
          id,
          quantity,
          subtotal,
          addon:addons(id, name, price, unit)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders || [], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching admin orders:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}