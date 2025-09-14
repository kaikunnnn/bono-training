import {functions} from "../firebase";

export async function updateSubscriptionPlan(planId) {
    const updateSubscription = functions.httpsCallable('updateSubscription');
    try {
        const result = await updateSubscription({planId});
        console.log(result.data.message);
    } catch (error) {
        console.error(`Failed to update subscription plan: ${error}`);
    }
}