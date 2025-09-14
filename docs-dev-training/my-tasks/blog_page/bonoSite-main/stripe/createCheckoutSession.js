import {db, auth} from "../firebase";
import getStripe from "./initializeStripe";


export async function createCheckoutSession(planId) {
    const stripe = await getStripe();

    try {
        console.log(`Is user authenticated: ${auth.currentUser != null}`);
        const uid = auth.currentUser.uid; // Get the uid of the current user
        console.log(`Creating session for user: ${uid}`); // Add debug log
        
        // Create a new checkout session in the subcollection inside this users document
        const checkoutSessionRef = await db
            .collection("users")
            .doc(uid)
            .collection("checkout_sessions")
            .add({
                price: planId,
                success_url: window.location.origin,
                cancel_url: window.location.origin,
            });

        // Wait for the CheckoutSession to get attached by the extension
        checkoutSessionRef.onSnapshot(async (snap) => {
            const {sessionId} = snap.data();
            if (sessionId) {
                // We have a session, let's redirect to Checkout
                // Init Stripe
                stripe.redirectToCheckout({sessionId});
            }
        });
    } catch (error) {
        console.error(`Failed to create checkout session: ${error}`);
    }
}
