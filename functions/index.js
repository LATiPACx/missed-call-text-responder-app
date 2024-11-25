const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const express = require("express");
const bodyParser = require("body-parser");

// Initialize Firebase Admin SDK
admin.initializeApp();

const app = express();
app.use(bodyParser.urlencoded({ extended: false })); // Parse Twilio webhook data

// Twilio credentials
const TWILIO_ACCOUNT_SID = "AC0998c199cfae9324ff1494228d111532"; // Replace with your actual SID
const TWILIO_AUTH_TOKEN = "da7356e28e1fd035583dbb8b9e7ba739"; // Replace with your actual Auth Token
const TWILIO_PHONE_NUMBER = "+15125153550"; // Replace with your Twilio phone number

// Debugging: Log the credentials
console.log("DEBUG: TWILIO_ACCOUNT_SID:", TWILIO_ACCOUNT_SID);
console.log("DEBUG: TWILIO_AUTH_TOKEN:", TWILIO_AUTH_TOKEN);
console.log("DEBUG: TWILIO_PHONE_NUMBER:", TWILIO_PHONE_NUMBER);

// Initialize Twilio client
let client;
try {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log("DEBUG: Twilio client initialized successfully");
} catch (error) {
  console.error("ERROR: Failed to initialize Twilio client:", error.message);
}

// Firestore database reference
const db = admin.firestore();

// Webhook to handle missed calls
app.post("/webhook/missed_call", async (req, res) => {
  const callStatus = req.body.CallStatus;
  const callerNumber = req.body.From;

  console.log(`DEBUG: Incoming call from ${callerNumber} with status: ${callStatus}`);

  if (callStatus === "missed") {
    try {
      // Log missed call in Firestore
      await db.collection("missed_calls").add({
        number: callerNumber,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("DEBUG: Missed call logged in Firestore");

      // Send SMS to the missed caller
      await client.messages.create({
        body: "Hi, sorry we missed your call! How can we assist you? Please reply to this message for help.",
        from: TWILIO_PHONE_NUMBER,
        to: callerNumber,
      });

      console.log("DEBUG: SMS sent successfully to", callerNumber);

      res.status(200).send("Missed call handled");
    } catch (error) {
      console.error("ERROR: Handling missed call failed:", error);
      res.status(500).send("Error handling missed call");
    }
  } else {
    console.log("DEBUG: Call was not missed, no action taken");
    res.status(200).send("Call not missed");
  }
});

// Export as Firebase function
exports.api = functions.https.onRequest(app);
