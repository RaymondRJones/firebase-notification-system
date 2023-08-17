/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

// You don't seem to be using these, so I'm commenting them out.
// If you need them in the future, simply uncomment.
// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Commented out as you're not using it.
// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendWelcomeEmailWithTemplate = functions.firestore
    .document("clients/{userId}")
    .onCreate((snap, context) => {
      const newUser = snap.data();

      const msg = {
        to: {
          email: newUser.email,
          name: newUser.name,
        },
        from: "ray@raymondjones.dev",
        templateId: "d-c2c2a6c8a5d2425da166762fbe979d5e",
        dynamic_template_data: {
          name: newUser.name,
          referral: newUser.referral_code,
        },
      };

      return sgMail
          .send(msg)
          .then((response) => {
            console.log("Email sent successfully!");
            console.log(response[0].statusCode);
            console.log(response[0].headers);
          })
          .catch((error) => {
            console.error(error);
          });
    });

