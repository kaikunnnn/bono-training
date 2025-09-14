// その他のコードは省略

// Firebase Cloud Functions
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();



exports.createPortalSession = functions.firestore
    .document("users/{userId}/portal_sessions/{sessionId}")
    .onCreate(async (snap, context) => {
      const userId = context.params.userId;
      const sessionId = context.params.sessionId;

      // Fetch the Stripe customer id
      const customerDoc = await admin.firestore()
          .collection("users")
          .doc(userId)
          .get();

      const {stripeCustomerId} = customerDoc.data();

      // Create Stripe portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: "https://your-return-url.com",
      });

      // Update Firestore document with portal URL
      await admin.firestore()
          .collection("users")
          .doc(userId)
          .collection("portal_sessions")
          .doc(sessionId)
          .set({
            url: session.url,
            status: "ready",
          });
    });

// Stripeのupdate

exports.updateSubscription = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;
  const planId = data.planId;

  // Get the current subscription of the user
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  const {subscriptionId} = userDoc.data();

  // Update the subscription with the new plan
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
    proration_behavior: 'create_prorations',
    items: [{
      id: subscription.items.data[0].id,
      price: planId,
    }],
  });

  return {message: `Updated plan for user: ${uid} to plan: ${paramslanId}`};
});