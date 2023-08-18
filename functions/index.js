const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.assignReferralCode = functions.firestore
    .document("clients/{userId}")
    .onCreate(async (snap, context) => {
      const userId = context.params.userId;

      // Get an unused referral code
      const referralCode = await fetchUnusedReferralCode();

      if (!referralCode) {
        console.error("No available referral codes.");
        return null;
      }

      // Update the user's document with the unused referral code
      await db.collection("clients").doc(userId).update({
        referral_code: referralCode,
      });

      // Delete the used referral code from the list
      return markReferralCodeAsUsed(referralCode);
    });

/**
 * Fetches an unused referral code from the database.
 *
 * @function
 * @async
 * @return {Promise<string|null>}
 * The unused referral code, or null if none available.
 */
async function fetchUnusedReferralCode() {
  const snapshot = await db.collection("referral_codes").limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  // Return the first available referral code
  const firstDoc = snapshot.docs[0];
  return firstDoc.data().code;
}

/**
 * Deletes a referral code from the available codes list.
 *
 * @function
 * @async
 * @param {string} referralCode - The referral code to be deleted.
 * @return {Promise<void>}
 */
async function markReferralCodeAsUsed(referralCode) {
  const snapshot = await db.collection("referral_codes")
      .where("code", "==", referralCode).get();

  if (!snapshot.empty) {
    // Delete the used referral code document
    return snapshot.docs[0].ref.delete();
  }
}
