const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const twilio = require('twilio');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI with the latest SDK syntax
const openai = new OpenAI({
  apiKey: "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"
});

// Initialize Twilio client
const twilioClient = twilio(
  "AC0998c199cfae9324ff1494228d111532", // Twilio Account SID
  "da7356e28e1fd035583dbb8b9e7ba739" // Twilio Auth Token
);

// Load business data
const businessData = require('./songsecure_data.json');

exports.handleMissedCall = functions.https.onRequest(async (req, res) => {
  // Log the incoming payload for debugging
  console.log('DEBUG: Incoming payload:', JSON.stringify(req.body, null, 2));

  try {
    const { MessageSid, From, Body } = req.body;

    if (!From) {
      throw new Error('Invalid request: Missing "From" phone number.');
    }

    // Log the incoming message or missed call
    if (MessageSid && Body) {
      console.log(`DEBUG: Received SMS from ${From}: ${Body}`);
      await handleIncomingSmsEvent(From, Body);
    } else {
      console.log(`DEBUG: Received event, but no message body detected.`);
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

async function handleIncomingSmsEvent(phoneNumber, userMessage) {
  try {
    // Log the incoming SMS to Firestore
    await admin.firestore().collection('smsMessages').add({
      phoneNumber,
      message: userMessage,
      timestamp: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate and send AI response to the SMS
    const aiResponse = await generateAiResponse(phoneNumber, userMessage);

    // Send the response via Twilio
    await twilioClient.messages.create({
      body: aiResponse,
      to: phoneNumber, // Respond to the sender
      from: "+15125153550" // Twilio Phone Number
    });

    console.log(`DEBUG: AI response sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
  }
}

async function generateAiResponse(phoneNumber, userMessage) {
  const systemPrompt = `You are a helpful assistant for ${businessData.businessName}. 
  Use the following FAQs and business information to provide relevant responses: 
  ${JSON.stringify(businessData)}`;

  const userPrompt = `Generate a helpful response to this customer message: "${userMessage}"
  Keep the response concise and professional.`;

  // Generate AI response
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 150,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}