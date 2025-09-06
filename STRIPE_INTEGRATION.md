# Stripe Integration Setup

This document explains how to set up Stripe payment integration for the container rental/purchase system.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Stripe Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account setup and verification

### 2. Get API Keys
1. Go to the Stripe Dashboard
2. Navigate to Developers > API Keys
3. Copy your Publishable key and Secret key
4. Add them to your environment variables

### 3. Set Up Webhook
1. In Stripe Dashboard, go to Developers > Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe-webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret and add it to your environment variables

### 4. Install Dependencies
```bash
npm install stripe
```

## Database Schema Updates

The integration requires these additional fields in your `orders` table:

```sql
ALTER TABLE orders ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN stripe_payment_intent_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255);

-- Update the payment_status column to include the new values
ALTER TABLE orders ALTER COLUMN payment_status SET DEFAULT 'pending';
```

## Features Implemented

### 1. Checkout API (`/api/checkout`)
- Creates Stripe Checkout sessions
- Calculates pricing for rentals and purchases
- Creates pending orders in the database
- Handles both rent and buy scenarios

### 2. Webhook Handler (`/api/stripe-webhook`)
- Processes payment confirmations
- Updates order status to "confirmed" and payment_status to "paid"
- Marks containers as unavailable for rentals
- Handles payment failures

### 3. Updated Booking Form
- Redirects to Stripe Checkout instead of direct order creation
- Shows payment button with total amount
- Handles success/cancellation redirects

### 4. Payment Success Page
- Displays order confirmation
- Shows payment details
- Provides next steps for customers

## Testing

### Test Cards
Use these Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Test Webhooks Locally
Use Stripe CLI to forward webhooks to your local development server:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## Security Considerations

1. **Webhook Verification**: All webhooks are verified using the webhook secret
2. **Environment Variables**: Never commit API keys to version control
3. **HTTPS**: Use HTTPS in production for webhook endpoints
4. **Error Handling**: Comprehensive error handling and logging

## Production Deployment

1. Switch to live Stripe keys in production
2. Update webhook endpoint URL to production domain
3. Test the complete payment flow
4. Monitor webhook delivery in Stripe Dashboard

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**: Check webhook URL and secret
2. **Payment not updating order**: Check webhook event types and database connection
3. **Checkout session not created**: Verify Stripe API keys and order data

### Debugging

- Check server logs for webhook processing errors
- Use Stripe Dashboard to monitor webhook delivery
- Test with Stripe CLI for local development
