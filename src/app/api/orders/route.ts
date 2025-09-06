// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import type { Order, OrderCreateRequest } from "@/types/order";

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Get current user
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: OrderCreateRequest = await req.json();
    const { container_id, type, start_date, end_date, addons = [] } = body;

    // Validate required fields
    if (!container_id || !type || !start_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For rentals, end_date is required
    if (type === "rent" && !end_date) {
      return NextResponse.json({ error: "End date is required for rentals" }, { status: 400 });
    }

    // Get container details to calculate price
    const { data: container, error: containerError } = await supabaseAdmin
      .from("containers")
      .select("id, title, price, is_available")
      .eq("id", container_id)
      .single();

    if (containerError || !container) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 });
    }

    if (!container.is_available) {
      return NextResponse.json({ error: "Container is not available" }, { status: 400 });
    }

    // Calculate container price
    let containerPrice = container.price;
    if (type === "rent" && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      containerPrice = container.price * days;
    }

    // Validate and calculate add-ons total
    let addonsTotal = 0;
    if (addons.length > 0) {
      const addonIds = addons.map(a => a.addon_id);
      
      const { data: fetchedAddons, error: addonsError } = await supabaseAdmin
        .from("addons")
        .select("id, name, price, unit, is_available")
        .in("id", addonIds)
        .eq("is_available", true);

      if (addonsError) {
        return NextResponse.json({ error: "Failed to fetch add-ons" }, { status: 500 });
      }

      // Validate add-ons and calculate totals
      for (const addonRequest of addons) {
        const addon = fetchedAddons?.find(a => a.id === addonRequest.addon_id);
        
        if (!addon) {
          return NextResponse.json({ error: `Add-on ${addonRequest.addon_id} not found or unavailable` }, { status: 400 });
        }

        if (addonRequest.quantity <= 0) {
          return NextResponse.json({ error: `Invalid quantity for ${addon.name}` }, { status: 400 });
        }

        addonsTotal += addon.price * addonRequest.quantity;
      }
    }

    const totalPrice = containerPrice + addonsTotal;

    // Create order
    const orderData = {
      user_id: user.id,
      container_id,
      type,
      start_date,
      end_date: type === "rent" ? end_date : null,
      total_price: totalPrice,
      status: "pending" as const,
      payment_status: "pending" as const,
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Save add-ons if any
    if (addons.length > 0) {
      const addonIds = addons.map(a => a.addon_id);
      
      const { data: fetchedAddons } = await supabaseAdmin
        .from("addons")
        .select("id, name, price, unit")
        .in("id", addonIds);

      const addonRecords = addons.map((addonRequest) => {
        const addon = fetchedAddons?.find(a => a.id === addonRequest.addon_id);
        return {
          order_id: order.id,
          addon_id: addonRequest.addon_id,
          quantity: addonRequest.quantity,
          subtotal: (addon?.price || 0) * addonRequest.quantity
        };
      });

      const { error: addonsError } = await supabaseAdmin
        .from("order_addons")
        .insert(addonRecords);

      if (addonsError) {
        console.error("Failed to save order add-ons:", addonsError);
        // Don't fail the order creation, just log the error
      }
    }

    // If it's a rental, mark container as unavailable
    if (type === "rent") {
      const { error: updateError } = await supabaseAdmin
        .from("containers")
        .update({ is_available: false })
        .eq("id", container_id);

      if (updateError) {
        console.error("Failed to update container availability:", updateError);
        // Don't fail the order creation, just log the error
      }
    }

    // Fetch the complete order with relations
    const { data: completeOrder, error: fetchError } = await supabaseAdmin
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
      .eq("id", order.id)
      .single();

    if (fetchError) {
      console.error("Error fetching complete order:", fetchError);
      return NextResponse.json(order, { status: 201 });
    }

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Get current user
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's orders with add-ons
    const { data: orders, error } = await supabase
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(orders || [], { status: 200 });
  } catch (err: any) {
    console.error("Error fetching orders:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}