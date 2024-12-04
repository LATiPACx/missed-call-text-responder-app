const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');
const twilio = require('twilio');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI with the API key directly
const openai = new OpenAI({
  apiKey: "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"
});

// Initialize Twilio client with all credentials
const accountSid = "AC0998c199cfae9324ff1494228d111532";
const authToken = "da7356e28e1fd035583dbb8b9e7ba739";
const twilioClient = twilio(accountSid, authToken);

// Load business data
const businessData = require('./songsecure_data.json');

exports.handleMissedCall = functions.https.onRequest(async (req, res) => {
  console.log('DEBUG: Incoming payload:', JSON.stringify(req.body, null, 2));

  try {
    const { MessageSid, From, Body, Digits } = req.body;

    if (!From) {
      throw new Error('Invalid request: Missing "From" phone number.');
    }

    if (Digits === '1') {
      console.log(`DEBUG: Received keypress 1 from ${From}`);
      await handleMissedCallWithConsent(From);
      return res.status(200).json({ status: 'success' });
    }

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

async function handleMissedCallWithConsent(phoneNumber) {
  try {
    const message = await generateAiResponse(phoneNumber, 'MISSED_CALL');
    
    await admin.firestore().collection('missedCalls').add({
      phoneNumber,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      response: message,
      consent: true
    });

    await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: "+15125153550"
    });

    console.log(`DEBUG: Response sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error('Error handling missed call with consent:', error);
    throw error;
  }
}

async function handleIncomingSmsEvent(phoneNumber, userMessage) {
  try {
    await admin.firestore().collection('smsMessages').add({
      phoneNumber,
      message: userMessage,
      timestamp: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const aiResponse = await generateAiResponse(phoneNumber, userMessage);

    await twilioClient.messages.create({
      body: aiResponse,
      to: phoneNumber,
      from: "+15125153550"
    });

    console.log(`DEBUG: AI response sent successfully to ${phoneNumber}`);
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
  }
}

async function generateAiResponse(phoneNumber, userMessage) {
  if (userMessage === 'MISSED_CALL') {
    return "Hey, sorry we missed your call here at SongSecure. How can I help you?";
  }

  const systemPrompt = `You are a helpful assistant for SongSecure. Your communication style should be:
- Direct and natural - avoid repetitive sales language
- Honest and transparent
- Focus on answering the actual question asked
- Vary your responses and language
- If someone asks if you're a bot, be honest but focus on how you can help
Use this business information only when relevant: ${JSON.stringify(businessData)}`;

  const userPrompt = `Respond naturally to: "${userMessage}"
- Address the actual question or concern raised
- Don't repeat previous points
- Be direct and honest
- Keep responses concise
- If they're skeptical, acknowledge it and focus on being helpful`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 800,
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}