# Subscription Payment Fix Plan

## Current Status

**Last Updated:** 2025-11-21

**Status:** 🔴 ISSUE IDENTIFIED - AWAITING FIX

---

## Problem Summary

### What's Happening
- ✅ Stripe payments complete successfully
- ✅ Stripe subscriptions are created (status: active)
- ❌ Webhooks fail with 401 Unauthorized errors
- ❌ Database has no subscription data
- ❌ Users see "Free Plan" after payment

### User Impact
Users who complete payment are not getting their subscription activated because:
1. Stripe webhook fails with 401 error
2. Database never receives subscription data
3. Frontend shows "Free Plan" status

---

## Root Cause

**Stripe Webhook Authentication Failure (401 Error)**

The webhook signing secret in Stripe dashboard doesn't match the `STRIPE_WEBHOOK_SECRET_LIVE` environment variable in Supabase.

### Evidence
```
Edge Function Logs:
POST | 401 | https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook
```

### Verification Results
1. ✅ Stripe payment: `pi_3SVmKkKUVUnt8Gty0NVzNEx8` - succeeded (4,980 JPY)
2. ✅ Stripe subscription: `sub_1SVmKkKUVUnt8GtyZyWiOia4` - active
3. ✅ Stripe customer: `cus_TSgoDjZruK8uEK`
4. ✅ Environment variables exist in Supabase
5. ❌ Database query: `SELECT * FROM user_subscriptions WHERE stripe_customer_id = 'cus_TSgoDjZruK8uEK'` returns empty

---

## Current Errors

### Console Errors (Browser)
```
Decision page (/subscription-success):
{hasMemberAccess: false, hasLearningAccess: false, planType: null}
Edge Function error, getting from DB directly: true
DB result: {isActive: false, planType: null, duration: null, ...}

Account page (/account):
DB result: {isActive: false, planType: null, ...}
Edge Function access rights: {hasMemberAccess: false, hasLearningAccess: false, planType: null}
Realtime Subscription status: SUBSCRIBED
Shows: Free Plan
```

### Edge Function Logs
```
Multiple instances of:
POST | 401 | stripe-webhook

No logs from handle-subscription-update function
(This function never executes because webhook fails)
```

---

## Fix Plan

### Phase 1: Fix Webhook Authentication ⏳

#### Step 1.1: Verify Stripe Webhook Configuration
**Action Required:** Check Stripe Dashboard

1. Go to Stripe Dashboard:
   - **Test mode:** https://dashboard.stripe.com/test/webhooks
   - **Live mode:** https://dashboard.stripe.com/webhooks

2. Find the webhook endpoint with URL:
   ```
   https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook
   ```

3. Verify listening events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`

4. **IMPORTANT:** Click "Signing secret" and copy the value (starts with `whsec_`)

#### Step 1.2: Update Supabase Environment Variable
**Action Required:** Run command with correct secret

```bash
# For live mode:
npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE="whsec_xxxxx" --project-ref fryogvfhymnpiqwssmuu

# For test mode:
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST="whsec_xxxxx" --project-ref fryogvfhymnpiqwssmuu
```

Replace `whsec_xxxxx` with the actual signing secret from Stripe dashboard.

#### Step 1.3: Verify the Update
```bash
npx supabase secrets list --project-ref fryogvfhymnpiqwssmuu
```

Check that `STRIPE_WEBHOOK_SECRET_LIVE` or `STRIPE_WEBHOOK_SECRET_TEST` is updated.

#### Step 1.4: Test Webhook
**Action Required:** Test new payment

1. Make a test payment
2. Check Edge Function logs:
   ```bash
   # Use Supabase MCP tool or dashboard
   ```
3. Verify webhook succeeds (status 200, not 401)
4. Check database has subscription data:
   ```sql
   SELECT * FROM user_subscriptions
   WHERE stripe_customer_id = 'cus_xxxxx'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

---

### Phase 2: Sync Existing Subscriptions 🔜

**Note:** Only execute after Phase 1 is complete and working

#### Step 2.1: Identify Affected Users
Query Stripe for successful payments without DB records:
```sql
-- Get all Stripe customers from successful payments
-- Compare with user_subscriptions table
-- Identify missing subscriptions
```

#### Step 2.2: Create Sync Script
Create script to:
1. Fetch active Stripe subscriptions
2. Check if they exist in database
3. Insert missing subscription records

#### Step 2.3: Execute Sync
Run sync script to backfill missing data

---

### Phase 3: Verify Complete System ✅

#### Step 3.1: End-to-End Test
1. Create new test payment
2. Verify webhook logs show success (200)
3. Verify database has subscription data
4. Verify user sees correct plan on /account page
5. Verify user has correct access rights

#### Step 3.2: Monitor Production
1. Check webhook success rate in Stripe dashboard
2. Monitor Edge Function logs for errors
3. Verify new payments are creating DB records

---

## Technical Details

### Webhook Flow
```
User completes payment
  ↓
Stripe creates subscription
  ↓
Stripe sends webhook to: /functions/v1/stripe-webhook
  ↓
Edge Function validates signature using STRIPE_WEBHOOK_SECRET_LIVE
  ↓ (CURRENTLY FAILING HERE - 401)
If valid, process event (checkout.session.completed)
  ↓
Insert/update records in:
  - stripe_customers
  - user_subscriptions
  - subscriptions
  ↓
User sees active subscription
```

### Database Schema
```sql
-- user_subscriptions table
user_id (uuid, FK to auth.users)
stripe_subscription_id (text)
stripe_customer_id (text)
plan_type (text)
is_active (boolean)
environment (text: 'test' | 'live')
...

-- stripe_customers table
user_id (uuid, FK to auth.users)
stripe_customer_id (text)
environment (text: 'test' | 'live')
...

-- subscriptions table
user_id (uuid, FK to auth.users)
stripe_subscription_id (text)
environment (text: 'test' | 'live')
...
```

### Environment Variables (Supabase)
```
STRIPE_LIVE_SECRET_KEY - ✅ Set
STRIPE_TEST_SECRET_KEY - ✅ Set
STRIPE_WEBHOOK_SECRET_LIVE - ✅ Set (may be incorrect)
STRIPE_WEBHOOK_SECRET_TEST - ✅ Set (may be incorrect)
```

### Edge Functions
```
Location: /supabase/functions/stripe-webhook/index.ts
Purpose: Handle Stripe webhook events
Environment: 'live' (hardcoded)
Webhook Secret: STRIPE_WEBHOOK_SECRET_LIVE
```

---

## Checklist

### Immediate Actions (Phase 1)
- [ ] Access Stripe Dashboard (test or live mode)
- [ ] Find webhook endpoint
- [ ] Copy signing secret (whsec_xxxxx)
- [ ] Update Supabase secret with command
- [ ] Verify secret is updated
- [ ] Test new payment
- [ ] Verify webhook succeeds (200, not 401)
- [ ] Verify database has subscription data
- [ ] Verify user sees correct plan

### Follow-up Actions (Phase 2)
- [ ] Create list of affected users
- [ ] Create sync script
- [ ] Test sync script on one user
- [ ] Execute full sync
- [ ] Verify all users have correct data

### Final Verification (Phase 3)
- [ ] Complete end-to-end test
- [ ] Monitor webhook success rate
- [ ] Document process for future
- [ ] Update team on resolution

---

## Quick Reference Commands

### Check Supabase Secrets
```bash
npx supabase secrets list --project-ref fryogvfhymnpiqwssmuu
```

### Update Webhook Secret
```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE="whsec_xxxxx" --project-ref fryogvfhymnpiqwssmuu
```

### Check Database
```sql
-- Check if subscription exists
SELECT * FROM user_subscriptions
WHERE stripe_customer_id = 'cus_xxxxx';

-- Check all active subscriptions
SELECT * FROM user_subscriptions
WHERE is_active = true
AND environment = 'live'
ORDER BY created_at DESC;
```

### Stripe Dashboard URLs
- Test mode webhooks: https://dashboard.stripe.com/test/webhooks
- Live mode webhooks: https://dashboard.stripe.com/webhooks
- Test mode payments: https://dashboard.stripe.com/test/payments
- Live mode payments: https://dashboard.stripe.com/payments

---

## Contact & Resources

**Related Documentation:**
- Investigation log: `.claude/docs/subscription-issue-investigation.md`
- Stripe helpers: `/supabase/functions/_shared/stripe-helpers.ts`
- Webhook handler: `/supabase/functions/stripe-webhook/index.ts`

**Key Files:**
- Frontend subscription check: `/src/services/stripe.ts`
- Frontend subscription hook: `/src/hooks/useSubscription.ts`
- Database schema: Check Supabase dashboard

**Support:**
- Stripe documentation: https://stripe.com/docs/webhooks
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

## Notes

- The payment flow itself is working correctly
- The issue is purely with webhook signature verification
- Once fixed, all new payments will work automatically
- Existing affected users will need manual sync (Phase 2)
- The codebase is correct; this is a configuration issue

## Current Test User
- Email: takumi.kai.skywalker@gmail.com
- Stripe Customer: cus_TSgoDjZruK8uEK
- Payment: pi_3SVmKkKUVUnt8Gty0NVzNEx8 (succeeded)
- Subscription: sub_1SVmKkKUVUnt8GtyZyWiOia4 (active in Stripe, missing in DB)
