import { auth } from "../firebase";

export default async function getUserPlan(){
    if (!auth.currentUser) return null;
    await auth.currentUser.getIdToken(true);
    const decodedToken = await auth.currentUser.getIdTokenResult();

    return decodedToken?.claims?.stripeRole || null;
}