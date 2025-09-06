import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    if (!signature) {
      console.error('No stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.order_id;
    
    if (!orderId) {
      console.error('No order_id in session metadata');
      return;
    }

    // Update order status to confirmed and payment status to paid
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error('Failed to update order after successful payment:', error);
      return;
    }

    // Save add-ons if any
    const addonsMetadata = session.metadata?.addons;
    if (addonsMetadata) {
      try {
        const addons = JSON.parse(addonsMetadata);
        
        if (Array.isArray(addons) && addons.length > 0) {
          const addonRecords = addons.map((addon: any) => ({
            order_id: orderId,
            addon_id: addon.addon_id,
            quantity: addon.quantity,
            subtotal: addon.subtotal
          }));

          const { error: addonsError } = await supabaseAdmin
            .from("order_addons")
            .insert(addonRecords);

          if (addonsError) {
            console.error('Failed to save order add-ons:', addonsError);
          } else {
            console.log(`Saved ${addons.length} add-ons for order ${orderId}`);
          }
        }
      } catch (parseError) {
        console.error('Failed to parse add-ons metadata:', parseError);
      }
    }

    // If it's a rental, mark container as unavailable
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("type, container_id")
      .eq("id", orderId)
      .single();

    if (order?.type === "rent") {
      await supabaseAdmin
        .from("containers")
        .update({ is_available: false })
        .eq("id", order.container_id);
    }

    console.log(`Order ${orderId} payment completed successfully`);
  } catch (err) {
    console.error('Error handling checkout session completed:', err);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by payment intent ID
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent.id);

    if (error || !orders || orders.length === 0) {
      console.error('No order found for payment intent:', paymentIntent.id);
      return;
    }

    const orderId = orders[0].id;

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error('Failed to update order after payment intent succeeded:', updateError);
    } else {
      console.log(`Order ${orderId} payment confirmed via payment intent`);
    }
  } catch (err) {
    console.error('Error handling payment intent succeeded:', err);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find order by payment intent ID
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntent.id);

    if (error || !orders || orders.length === 0) {
      console.error('No order found for failed payment intent:', paymentIntent.id);
      return;
    }

    const orderId = orders[0].id;

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "cancelled",
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error('Failed to update order after payment failed:', updateError);
    } else {
      console.log(`Order ${orderId} payment failed`);
    }
  } catch (err) {
    console.error('Error handling payment intent failed:', err);
  }
}