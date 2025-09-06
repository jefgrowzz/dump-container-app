import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { stripe, formatAmountForStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

type CheckoutRequest = {
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

    const body: CheckoutRequest = await req.json();
    const { container_id, type, start_date, end_date, addons = [], success_url, cancel_url } = body;

    // Validate required fields
    if (!container_id || !type || !start_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // For rentals, end_date is required
    if (type === "rent" && !end_date) {
      return NextResponse.json({ error: "End date is required for rentals" }, { status: 400 });
    }

    // Get container details
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

    // Validate and fetch add-ons
    let addonsData: any[] = [];
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

        const subtotal = addon.price * addonRequest.quantity;
        addonsTotal += subtotal;

        addonsData.push({
          ...addon,
          quantity: addonRequest.quantity,
          subtotal
        });
      }
    }

    const totalPrice = containerPrice + addonsTotal;

    // Create order in database with pending payment status
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

    // Prepare Stripe line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${container.title} - ${type === "rent" ? "Rental" : "Purchase"}`,
            description: type === "rent" 
              ? `Rental from ${start_date} to ${end_date}` 
              : `Purchase on ${start_date}`,
          },
          unit_amount: formatAmountForStripe(containerPrice),
        },
        quantity: 1,
      }
    ];

    // Add add-ons as line items
    addonsData.forEach(addon => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: addon.name,
            description: `${addon.unit} - ${addon.quantity} × $${addon.price.toFixed(2)}`,
          },
          unit_amount: formatAmountForStripe(addon.price),
        },
        quantity: addon.quantity,
      });
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: cancel_url,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        container_id: container_id,
        type: type,
        addons: JSON.stringify(addonsData.map(a => ({ addon_id: a.id, quantity: a.quantity, subtotal: a.subtotal })))
      },
      customer_email: user.email,
    });

    // Update order with Stripe session ID
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order with session ID:", updateError);
      // Don't fail the checkout, just log the error
    }

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      order_id: order.id 
    }, { status: 200 });

  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}