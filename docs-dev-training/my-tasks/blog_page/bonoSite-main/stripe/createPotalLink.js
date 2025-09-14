import { db, auth } from "../firebase";

export async function createPotalLink() {
  try {
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      
      // Create a document in Firestore in a 'portal_sessions' collection inside the user's document
      const portalSessionRef = await db
        .collection("users")
        .doc(uid)
        .collection("portal_sessions")
        .add({
          status: "pending",
        });
  
      // Listen to the Firestore document for changes
      portalSessionRef.onSnapshot((snap) => {
        const { url } = snap.data();
        if (url) {
          // We have a portal session URL, let's redirect to it
          window.location.assign(url);
        }
      });

    } else {
      console.error("ユーザーが認証されていません。");
    }
    
  } catch (error) {
    console.error(`Failed to create portal session: ${error}`);
  }
}