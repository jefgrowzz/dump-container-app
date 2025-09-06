// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import type { OrderUpdateRequest } from "@/types/order";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current user for authorization
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order with add-ons
    const { data, error } = await supabaseAdmin
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
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if user owns this order or is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data.user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: OrderUpdateRequest = await request.json();

    // Get current user for authorization
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.stripe_payment_intent_id !== undefined) updateData.stripe_payment_intent_id = body.stripe_payment_intent_id;
    if (body.stripe_session_id !== undefined) updateData.stripe_session_id = body.stripe_session_id;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", id)
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
      .single();

    if (error) {
      console.error("Error updating order:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get current user for authorization
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order details before deletion to handle container availability
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("container_id, type, status, user_id")
      .eq("id", id)
      .single();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Check if user owns this order or is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (order.user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the order (add-ons will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting order:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // If it was a rental and the order was confirmed, make container available again
    if (order.type === "rent" && order.status === "confirmed") {
      const { error: updateError } = await supabaseAdmin
        .from("containers")
        .update({ is_available: true })
        .eq("id", order.container_id);

      if (updateError) {
        console.error("Failed to update container availability:", updateError);
        // Don't fail the deletion, just log the error
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}